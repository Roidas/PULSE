import boto3
import os
import json
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('FRIENDS_TABLE_NAME', 'UserFriends'))

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        user_id = body.get('userId')
        friend_id = body.get('friendId')

        if not user_id or not friend_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing userId or friendId'})
            }

        # Update the original request's status
        table.update_item(
            Key={'userId': friend_id, 'friendId': user_id},
            UpdateExpression='SET #s = :newStatus',
            ExpressionAttributeNames={'#s': 'status'},
            ExpressionAttributeValues={':newStatus': 'accepted'}
        )

        # Create a reverse record
        table.put_item(Item={
            'userId': user_id,
            'friendId': friend_id,
            'status': 'accepted',
            'addedAt': datetime.utcnow().isoformat()
        })

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Friend request accepted'})
        }


    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
