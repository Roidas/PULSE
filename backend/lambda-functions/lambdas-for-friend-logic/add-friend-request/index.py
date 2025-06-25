import boto3
import os
import json
from datetime import datetime

# Init DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('FRIENDS_TABLE_NAME', 'UserFriends'))

def lambda_handler(event, context):
    try:
        # Parse incoming JSOn request body
        body = json.loads(event['body'])
        user_id = body.get('userId')
        friend_id = body.get('friendId')

        # Validate input
        if not user_id or not friend_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing userId or friendId'})
            }

        # Make user not friend themselves
        if user_id == friend_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Cannot friend yourself'})
            }

        # Create a pending friend request into DynamoDB
        table.put_item(Item={
            'userId': user_id,
            'friendId': friend_id,
            'status': 'pending',
            'addedAt': datetime.utcnow().isoformat()
        })

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Friend request sent'})
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
