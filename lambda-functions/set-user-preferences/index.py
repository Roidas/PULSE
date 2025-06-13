import json
import boto3
import os

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')

# Environment variable
PREFERENCES_TABLE_NAME = os.environ.get('PREFERENCES_TABLE_NAME', 'UserPreferences')

def lambda_handler(event, context):
    print("Received set preferences event:", json.dumps(event))

    # Parse request body
    body = json.loads(event['body'])

    # Extract preferences
    friend_id = body.get('friendId')
    max_heart_rate = body.get('maxHeartRate')
    min_heart_rate = body.get('minHeartRate')
    max_stress_level = body.get('maxStressLevel')
    max_distance_apart = body.get('maxDistanceApart')
    countdown_before_notify = body.get('countdownBeforeNotify')

    # Validate input
    if not friend_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'friendId is required.'})
        }

    # Build item for DynamoDB
    preferences_item = {
        'friendId': friend_id
    }

    # Only add fields if provided
    if max_heart_rate is not None:
        preferences_item['maxHeartRate'] = max_heart_rate
    if min_heart_rate is not None:
        preferences_item['minHeartRate'] = min_heart_rate
    if max_stress_level is not None:
        preferences_item['maxStressLevel'] = max_stress_level
    if max_distance_apart is not None:
        preferences_item['maxDistanceApart'] = max_distance_apart
    if countdown_before_notify is not None:
        preferences_item['countdownBeforeNotify'] = countdown_before_notify

    # Save to UserPreferences table
    preferences_table = dynamodb.Table(PREFERENCES_TABLE_NAME)
    preferences_table.put_item(Item=preferences_item)
    print(f"Preferences saved for {friend_id}.")  # Debug helper

    return {
        'statusCode': 200,
        'body': json.dumps({'message': f'Preferences saved for {friend_id}.'})
    }