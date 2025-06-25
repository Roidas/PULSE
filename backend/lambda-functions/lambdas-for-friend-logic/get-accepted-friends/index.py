import boto3
import os
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('FRIENDS_TABLE_NAME', 'UserFriends'))

def lambda_handler(event, context):
    try:
        # Extract userId from query string parameters
        user_id = event['queryStringParameters'].get('userId')

        if not user_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing userId'})
            }

        #-----Get all accepted friendships initiated BY this user-----
        response1 = table.scan(
            FilterExpression='userId = :uid AND #s = :status',
            ExpressionAttributeValues={
                ':uid': user_id,
                ':status': 'accepted'
            },
            ExpressionAttributeNames={'#s': 'status'}
        )

        #-----Get all accepted friendships RECEIVED by this user-----
        response2 = table.scan(
            FilterExpression='friendId = :uid AND #s = :status',
            ExpressionAttributeValues={
                ':uid': user_id,
                ':status': 'accepted'
            },
            ExpressionAttributeNames={'#s': 'status'}
        )

        # Normalize both directions
        friends = response1.get('Items', []) + [
            {
                #Swap original friendId with current user and vice versa
                'userId': item['friendId'],
                'friendId': item['userId'],
                'status': item['status'],
                'addedAt': item.get('addedAt'),
            } for item in response2.get('Items', [])
        ]

        return {
            'statusCode': 200,
            'body': json.dumps(friends)
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
