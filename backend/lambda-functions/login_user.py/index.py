import boto3
import json
import os

dynamodb = boto3.resource('dynamodb')
USERS_TABLE_NAME = os.environ.get('USERS_TABLE_NAME', 'Users')

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        phone = body.get('phone')

        if not email or not phone:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing email or phone'})
            }

        # Scan for a matching user
        response = USERS_TABLE_NAME.scan(
            FilterExpression='email = :e AND phone = :p',
            ExpressionAttributeValues={
                ':e': email,
                ':p': phone
            }
        )

        items = response.get('Items', [])

        if not items:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'User not found'})
            }

        user_id = items[0]['userId']
        return {
            'statusCode': 200,
            'body': json.dumps({'userId': user_id})
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }