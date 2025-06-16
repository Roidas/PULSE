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
DEFAULT_MAX_HEART_RATE = 150
DEFAULT_MIN_HEART_RATE = 50
DEFAULT_MAX_STRESS_LEVEL = 80

# Main entry point
def lambda_handler(event, context):
    print("Received wearable event:", json.dumps(event))

    # Parse request body (from API Gateway POST or IOT)
    body = event

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
        max_heart_rate = preferences.get('maxHeartRate', DEFAULT_MAX_HEART_RATE)
        min_heart_rate = preferences.get('minHeartRate', DEFAULT_MIN_HEART_RATE)
        max_stress_level = preferences.get('maxStressLevel', DEFAULT_MAX_STRESS_LEVEL)
        print(f"Loaded preferences for {friend_id}: maxHeartRate={max_heart_rate}, minHeartRate={min_heart_rate}, maxStressLevel={max_stress_level}")

    except Exception as e:
        print(f"Error loading preferences for {friend_id}: {str(e)}")
        max_heart_rate = DEFAULT_MAX_HEART_RATE
        min_heart_rate = DEFAULT_MIN_HEART_RATE
        max_stress_level = DEFAULT_MAX_STRESS_LEVEL

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
    if (heart_rate is not None and (heart_rate > max_heart_rate or heart_rate < min_heart_rate)) or \
       (stress_level is not None and stress_level > max_stress_level) or \
       fall_detected:

        message = f'🚨 ALERT from wearable for Friend {friend_id}!\n'
        if heart_rate is not None:
            message += f'Heart Rate: {heart_rate} (Max: {max_heart_rate}, Min: {min_heart_rate})\n'
        if stress_level is not None:
            message += f'Stress Level: {stress_level} (Max: {max_stress_level})\n'
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