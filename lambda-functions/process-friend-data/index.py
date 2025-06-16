import json
import boto3
import os
from datetime import datetime
import time

# Initialize clients
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

# Environment variables
DYNAMO_TABLE_NAME = os.environ.get('DYNAMO_TABLE_NAME', 'FriendStatus')
PREFERENCES_TABLE_NAME = os.environ.get('PREFERENCES_TABLE_NAME', 'UserPreferences')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')

# Defaults thresholds
DEFAULT_MAX_DISTANCE_APART = 250 # meters
DEFAULT_COUNTDOWN_BEFORE_NOTIFY = 600  # seconds

# Main entry point
def lambda_handler(event, context):
    print("Received event:", json.dumps(event)) #Debug helper

    # Parse request body (from API Gateway POST)
    body = json.loads(event['body'])

    # Extract fields
    friend_id = body.get('friendId')
    gps = body.get('gps')
    sos_pressed = body.get('sos', False)
    distance_apart = body.get('distanceFromFriends', 0)
    timestamp = datetime.utcnow().isoformat() #Gets current time in UTC

    # Lookup UserPreferences 
    preferences_table = dynamodb.Table(PREFERENCES_TABLE_NAME)
    try:
        response = preferences_table.get_item(Key={'friendId': friend_id})
        preferences = response.get('Item', {})
        max_distance_apart = preferences.get('maxDistanceApart', DEFAULT_MAX_DISTANCE_APART)
        countdown_before_notify = preferences.get('countdownBeforeNotify', DEFAULT_COUNTDOWN_BEFORE_NOTIFY)
        print(f"Loaded preferences for {friend_id}: maxDistanceApart={max_distance_apart}, countdownBeforeNotify={countdown_before_notify}")
    except Exception as e:
        print(f"Error loading preferences for {friend_id}: {str(e)}")
        max_distance_apart = DEFAULT_MAX_DISTANCE_APART
        countdown_before_notify = DEFAULT_COUNTDOWN_BEFORE_NOTIFY

    # Save to DynamoDB
    table = dynamodb.Table(DYNAMO_TABLE_NAME)
    table.put_item(
    Item={
        'friendId': friend_id,
        'timestamp': timestamp,
        'gps': gps,
        'sos': sos_pressed,
        'distanceFromFriends': distance_apart
        }
    ) 
    print("Friend data saved to DynamoDB") #Debug helper

    # Check for SOS condition
    if sos_pressed:
        message = f'🚨 ALERT: Friend {friend_id} pressed SOS button!\n'
        message += f'GPS: {gps}'

        sns.publish(
            TopicArn=SNS_TOPIC_ARN,
            Message=message,
            Subject='Friend Safety Alert'
        )
        print("SOS alert sent!")  # Debug helper

    # Check for distance apart condition
    elif distance_apart > max_distance_apart:
        # First notify the user(friend that is too far away) ONLY
        message_to_friend = f'⚠️ WARNING: You ({friend_id}) are more than {max_distance_apart} meters apart from your friends.\n'
        message_to_friend += f'GPS: {gps}\nPlease check in within {countdown_before_notify} seconds to avoid notifying others.'

        # For simplicity (Later will send this via app notification or SMS directly to the user, not SNS topic)
        sns.publish(
            TopicArn=SNS_TOPIC_ARN,  # For now simulate with same SNS
            Message=message_to_friend,
            Subject='Distance Warning'
        )
        print("Distance warning sent to friend.")  # Debug helper

        # Simulate countdown (Will use AWS step functions if there is enough time)
        print(f"Simulating countdown: waiting {countdown_before_notify} seconds...")
        time.sleep(min(countdown_before_notify, 10))  # sleep max 10 sec for demo safety (Lambda timeout protection)

        # After countdown → Notify other friends
        message_to_others = f'🚨 ALERT: Friend {friend_id} is more than {max_distance_apart} meters apart after {countdown_before_notify} seconds.\n'
        message_to_others += f'GPS: {gps}\nPlease check on them.'

        sns.publish(
            TopicArn=SNS_TOPIC_ARN,
            Message=message_to_others,
            Subject='Friend Distance Alert'
        )
        print("Distance alert sent to other friends.")  # Debug helper

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Friend data processed.'})
    }
