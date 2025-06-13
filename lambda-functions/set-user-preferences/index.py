import json
import boto3
import os

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')

# Environment variable
PREFERENCES_TABLE_NAME = os.environ.get('PREFERENCES_TABLE_NAME', 'UserPreferences')

def lambda_handler(event, context):
    print("Received set preferences event:", json.dumps(event))

    