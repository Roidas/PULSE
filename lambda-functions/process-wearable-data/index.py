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