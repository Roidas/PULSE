import json
import boto3
import os
import math


dynamodb = boto3.resource('dynamodb')

DYNAMO_TABLE_NAME = os.environ.get('DYNAMO_TABLE_NAME', 'FriendStatus')

# Haversine formula to calculate distance between two lat/lon points (in meters)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0)**2

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Main Lambda handler
def lambda_handler(event, context):
    # Extract query parameters from GET request
    params = event.get('queryStringParameters', {})
    id1 = params.get('friendId1')
    id2 = params.get('friendId2')

    # Validate input
    if not id1 or not id2:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Both friendId1 and friendId2 are required'})
        }

    table = dynamodb.Table(DYNAMO_TABLE_NAME)

    # Helper to get coordinates from DynamoDB for a given friendId
    def get_coords(fid):
        res = table.get_item(Key={'friendId': fid})
        item = res.get('Item')
        if not item:
            raise ValueError(f"No data found for friendId: {fid}")
        return float(item['latitude']), float(item['longitude'])

    try:
        # Get coordinates for both users
        lat1, lon1 = get_coords(id1)
        lat2, lon2 = get_coords(id2)

        # Calculate distance using Haversine
        distance = haversine(lat1, lon1, lat2, lon2)

        # Return success response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'friendId1': id1,
                'friendId2': id2,
                'distance': round(distance, 2)  # meters, rounded to 2 decimals
            })
        }
    except Exception as e:
        # Catch and return any errors
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
