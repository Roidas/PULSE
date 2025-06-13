import json
import boto3
import os
from datetime import datetime

# Initialize clients
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

# Environment variables
DATA_TABLE_NAME = os.environ.get('DATA_TABLE_NAME', 'FriendStatus')  # You can make 'WearableData' if preferred
PREFERENCES_TABLE_NAME = os.environ.get('PREFERENCES_TABLE_NAME', 'UserPreferences')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')

# Default thresholds
DEFAULT_HEART_RATE_THRESHOLD = 150
DEFAULT_STRESS_LEVEL_THRESHOLD = 80

# Main entry point
def lambda_handler(event, context):
    print("Received wearable event:", json.dumps(event))

    # Parse request body (from API Gateway POST or IOT)
    body = json.loads(event['body'])

    # Extract fields
    friend_id = body.get('friendId')
    heart_rate = body.get('heartRate')
    stress_level = body.get('stressLevel')
    fall_detected = body.get('fallDetected', False) #Default false if not available
    timestamp = datetime.utcnow().isoformat() #Gets current time in UTC

    # Lookup UserPreferences 
    preferences_table = dynamodb.Table(PREFERENCES_TABLE_NAME)
    try:
        response = preferences_table.get_item(Key={'friendId': friend_id})
        preferences = response.get('Item', {})
        heart_rate_threshold = preferences.get('heartRateThreshold', DEFAULT_HEART_RATE_THRESHOLD)
        stress_level_threshold = preferences.get('stressLevelThreshold', DEFAULT_STRESS_LEVEL_THRESHOLD)
        print(f"Loaded preferences for {friend_id}: heartRateThreshold={heart_rate_threshold}, stressLevelThreshold={stress_level_threshold}")

    except Exception as e:
        print(f"Error loading preferences for {friend_id}: {str(e)}")
        heart_rate_threshold = DEFAULT_HEART_RATE_THRESHOLD
        stress_level_threshold = DEFAULT_STRESS_LEVEL_THRESHOLD
        
    # Save wearable data to DynamoDB
    table = dynamodb.Table(DATA_TABLE_NAME)
    table.put_item(
        Item={
            'friendId': friend_id,
            'timestamp': timestamp,
            'heartRate': heart_rate,
            'stressLevel': stress_level,
            'fallDetected': fall_detected
        }
    )
    print("Wearable data saved to DynamoDB")

    # Check for alert condition
    if heart_rate > heart_rate_threshold or stress_level > stress_level_threshold or fall_detected:
        message = f'🚨 ALERT from wearable for Friend {friend_id}!\n'
        message += f'Heart Rate: {heart_rate} (Threshold: {heart_rate_threshold})\n'
        message += f'Stress Level: {stress_level} (Threshold: {stress_level_threshold})\n'
        message += f'Fall Detected: {fall_detected}'

        sns.publish(
            TopicArn=SNS_TOPIC_ARN,
            Message=message,
            Subject='Friend Wearable Alert'
        )
        print("Wearable alert sent!")  # Debug helper

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Wearable data processed.'})
    }