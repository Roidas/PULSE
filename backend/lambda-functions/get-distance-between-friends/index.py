import json
import boto3
import os
import math
from boto3.dynamodb.conditions import Key

# Setup
dynamodb = boto3.resource('dynamodb')
DYNAMO_TABLE_NAME = os.environ.get('DYNAMO_TABLE_NAME', 'FriendStatus')
table = dynamodb.Table(DYNAMO_TABLE_NAME)

# Haversine distance formula
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = math.sin(d_phi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(d_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Helper to get latest coordinates for a user
def get_latest_coords(friend_id):
    print(f"🔍 Querying location for: {friend_id}")
    response = table.query(
        KeyConditionExpression=Key('friendId').eq(friend_id),
        ScanIndexForward=False,  # newest first
        Limit=1
    )
    items = response.get("Items", [])
    if not items:
        raise ValueError(f"No location data found for friendId: {friend_id}")
    item = items[0]
    lat = float(item.get('latitude'))
    lon = float(item.get('longitude'))
    return lat, lon

# Main Lambda handler
def lambda_handler(event, context):
    print("📥 EVENT RECEIVED:", json.dumps(event))

    params = event.get('queryStringParameters', {}) or {}
    id1 = params.get('friendId1')
    id2 = params.get('friendId2')

    if not id1 or not id2:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Both friendId1 and friendId2 are required'})
        }

    try:
        # Query both users' latest coordinates
        lat1, lon1 = get_latest_coords(id1)
        lat2, lon2 = get_latest_coords(id2)

        print(f"📍 {id1}: ({lat1}, {lon1})")
        print(f"📍 {id2}: ({lat2}, {lon2})")

        # Calculate and return distance
        distance = haversine(lat1, lon1, lat2, lon2)
        return {
            'statusCode': 200,
            'body': json.dumps({
                'friendId1': id1,
                'friendId2': id2,
                'distance': round(distance, 2)
            })
        }

    except ValueError as ve:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': str(ve)})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error', 'details': str(e)})
        }
