from decimal import Decimal
import json
import boto3
import os
from datetime import datetime
import time

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

# Environment variables
DYNAMO_TABLE_NAME = os.environ.get('DYNAMO_TABLE_NAME', 'FriendStatus')
PREFERENCES_TABLE_NAME = os.environ.get('PREFERENCES_TABLE_NAME', 'UserPreferences')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')

# Default safety thresholds
DEFAULT_MAX_DISTANCE_APART = 250  # meters
DEFAULT_COUNTDOWN_BEFORE_NOTIFY = 600  # seconds

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))  # Debugging incoming event

    # Parse the JSON request body
    body = json.loads(event.get('body', '{}'))

    # Extract necessary data
    friend_id = body.get('friendId')
    latitude = body.get('latitude')
    longitude = body.get('longitude')
    sos_pressed = body.get('sos', False)
    distance_apart = body.get('distanceFromFriends', 0)
    timestamp = datetime.utcnow().isoformat()

    gps = f"{latitude},{longitude}" if latitude and longitude else "unknown"

    # 🛠 Load user-specific preferences or fallback to defaults
    try:
        preferences_table = dynamodb.Table(PREFERENCES_TABLE_NAME)
        response = preferences_table.get_item(Key={'friendId': friend_id})
        preferences = response.get('Item', {})
        max_distance_apart = preferences.get('maxDistanceApart', DEFAULT_MAX_DISTANCE_APART)
        countdown_before_notify = preferences.get('countdownBeforeNotify', DEFAULT_COUNTDOWN_BEFORE_NOTIFY)
        print(f"Loaded preferences for {friend_id}: maxDistanceApart={max_distance_apart}, countdownBeforeNotify={countdown_before_notify}")
    except Exception as e:
        print(f"Error loading preferences: {str(e)}")
        max_distance_apart = DEFAULT_MAX_DISTANCE_APART
        countdown_before_notify = DEFAULT_COUNTDOWN_BEFORE_NOTIFY

    # 📝 Write the current status to DynamoDB
    try:
        status_table = dynamodb.Table(DYNAMO_TABLE_NAME)
        item = {
            "friendId": friend_id,
            "latitude": Decimal(str(latitude)),
            "longitude": Decimal(str(longitude)),
            "distanceFromFriends": Decimal(str(distance_apart)),
            "sos": False,
            "updatedAt": timestamp
        }
        print("Putting this item into DynamoDB:", json.dumps(item, default=str))
        status_table.put_item(Item=item)
        print("✅ Friend status saved.")
    except Exception as e:
        print("❌ Error writing to DynamoDB:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Failed to save data to DynamoDB', 'details': str(e)})
        }

    # 🚨 SOS Button was pressed
    if sos_pressed:
        message = f'🚨 ALERT: Friend {friend_id} pressed SOS button!\nGPS: {gps}'
        sns.publish(TopicArn=SNS_TOPIC_ARN, Message=message, Subject='Friend Safety Alert')
        print("📣 SOS alert sent!")

    # 📍 Friend is too far away
    elif distance_apart > max_distance_apart:
        warning_message = (
            f'⚠️ WARNING: You ({friend_id}) are more than {max_distance_apart}m from your friends.\n'
            f'GPS: {gps}\nRespond within {countdown_before_notify} seconds.'
        )
        sns.publish(TopicArn=SNS_TOPIC_ARN, Message=warning_message, Subject='Distance Warning')
        print("📩 Distance warning sent.")

        print(f"⏳ Waiting {countdown_before_notify} seconds before alerting others...")
        time.sleep(min(countdown_before_notify, 10))  # simulate time for demo

        alert_message = (
            f'🚨 ALERT: {friend_id} is still far from their friends after {countdown_before_notify} seconds.\n'
            f'GPS: {gps}\nPlease check on them.'
        )
        sns.publish(TopicArn=SNS_TOPIC_ARN, Message=alert_message, Subject='Friend Distance Alert')
        print("📣 Final alert sent to others.")

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Friend data processed successfully.'})
    }
