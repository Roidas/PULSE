import boto3
import json
import os
import bcrypt

dynamodb = boto3.resource('dynamodb')
USERS_TABLE_NAME = os.environ.get('USERS_TABLE_NAME', 'Users')

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        password = body.get('password')

        if not email or not password:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing email or password'})
            }

        # Fetch user by email
        table = dynamodb.Table(USERS_TABLE_NAME)
        response = table.scan(
            FilterExpression='email = :e',
            ExpressionAttributeValues={':e': email}
        )

        items = response.get('Items', [])

        if not items:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'User not found'})
            }

        user = items[0]
        stored_hash = user.get('password')

        if not stored_hash:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'Password not stored'})
            }

        # Check password
        if bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
            return {
                'statusCode': 200,
                'body': json.dumps({'userId': user['userId']})
            }
        else:
            return {
                'statusCode': 401,
                'body': json.dumps({'error': 'Incorrect password'})
            }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
