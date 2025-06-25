import boto3
import os
import json

# Initialize Dynamodb resource
dynamodb = boto3.resource('dynamodb')

# Reference the 'UserFriends' table using an environment variable
table = dynamodb.Table(os.environ.get('FRIENDS_TABLE_NAME', 'UserFriends'))

def lambda_handler(event, context):
    try:
        # Extract userId from query string parameters
        user_id = event['queryStringParameters'].get('userId')

        # Validate the input
        if not user_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing userId'})
            }

        # Query DynamoDB for friend requests where the current user is the recipient and the request is still in a "pending" state
        response = table.scan(
            FilterExpression='friendId = :uid AND #s = :status',
            ExpressionAttributeValues={
                ':uid': user_id,
                ':status': 'pending'
            },
            ExpressionAttributeNames={
                '#s': 'status'  # Using an alias because 'status' is a reserved word
            }
        )

        items = response.get('Items', [])

        # Return the list of pending friend requests
        return {
            'statusCode': 200,
            'body': json.dumps(items)
        }

    except Exception as e:
        # Log error to CloudWatch
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
