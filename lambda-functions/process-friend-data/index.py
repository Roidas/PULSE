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
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')

# Defaults thresholds
DEFAULT_MAX_DISTANCE_APART = 250
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
    countdown_before_notify = body.get('countdownBeforeNotify', DEFAULT_COUNTDOWN_BEFORE_NOTIFY)
    timestamp = datetime.utcnow().isoformat() #Gets current time in UTC

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
    elif distance_apart > DEFAULT_MAX_DISTANCE_APART:
        # First notify the friend ONLY
        message_to_friend = f'⚠️ WARNING: You ({friend_id}) are more than {DEFAULT_MAX_DISTANCE_APART} meters apart from your friends.\n'
        message_to_friend += f'GPS: {gps}\nPlease check in within {countdown_before_notify} seconds to avoid notifying others.'

        # For simplicity (Later will send this via app notification or SMS directly to the user, not SNS topic)
        sns.publish(
            TopicArn=SNS_TOPIC_ARN,  # For now simulate with same SNS
            Message=message_to_friend,
            Subject='Distance Warning'
        )
        print("Distance warning sent to friend.")  # Debug helper

        # Simulate countdown (Will use AWS step functions if we have enough time)
        print(f"Simulating countdown: waiting {countdown_before_notify} seconds...")
        time.sleep(min(countdown_before_notify, 10))  # sleep max 10 sec for demo safety (Lambda timeout protection)

        # After countdown → Notify other friends
        message_to_others = f'🚨 ALERT: Friend {friend_id} is more than {DEFAULT_MAX_DISTANCE_APART} meters apart after {countdown_before_notify} seconds.\n'
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
