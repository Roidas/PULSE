import json
import boto3
import os
import math

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')

# Use environment variable or fallback to default table name
DYNAMO_TABLE_NAME = os.environ.get('DYNAMO_TABLE_NAME', 'FriendStatus')
table = dynamodb.Table(DYNAMO_TABLE_NAME)

# Haversine formula to calculate distance between two lat/lon points (in meters)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # Radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Lambda entry point
def lambda_handler(event, context):
    print("EVENT RECEIVED:", json.dumps(event))  # Debug raw input

    # Extract query parameters from API Gateway
    params = event.get('queryStringParameters', {}) or {}
    id1 = params.get('friendId1')
    id2 = params.get('friendId2')

    print(f"Friend IDs received: friendId1={id1}, friendId2={id2}")

    # Validate input presence
    if not id1 or not id2:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Both friendId1 and friendId2 are required'})
        }

    # Helper function to get lat/lon from DynamoDB
    def get_coords(fid):
        print(f"Looking up friendId: {fid}")
        res = table.get_item(Key={'friendId': fid})
        item = res.get('Item')

        if not item:
            print(f"No data found for friendId: {fid}")
            raise ValueError(f"No location data found for friendId: {fid}")

        try:
            lat = float(item['latitude'])
            lon = float(item['longitude'])
        except (KeyError, ValueError) as err:
            raise ValueError(f"Incomplete or invalid coordinates for {fid}: {str(err)}")

        return lat, lon

    try:
        # Get coordinates from DynamoDB
        lat1, lon1 = get_coords(id1)
        lat2, lon2 = get_coords(id2)

        # Compute distance
        distance = haversine(lat1, lon1, lat2, lon2)

        # Return success
        return {
            'statusCode': 200,
            'body': json.dumps({
                'friendId1': id1,
                'friendId2': id2,
                'distance': round(distance, 2)
            })
        }

    except ValueError as ve:
        # Specific known error (e.g., missing user)
        print("ValueError:", str(ve))
        return {
            'statusCode': 404,
            'body': json.dumps({'error': str(ve)})
        }

    except Exception as e:
        # Unknown error (failsafe)
        print("Unexpected error:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error', 'details': str(e)})
        }
