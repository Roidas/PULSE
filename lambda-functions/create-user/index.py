import json
import boto3
import os
from datetime import datetime
import random

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
USERS_TABLE_NAME = os.environ.get('USERS_TABLE_NAME', 'Users')

def generate_user_id(first_name, last_name):
    return f"{first_name}{last_name}_{random.randint(1000, 9999)}"

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))  # Debug

    try:
        body = json.loads(event['body'])

        first_name = body.get('firstName')
        last_name = body.get('lastName')
        email = body.get('email')
        phone = body.get('phone')

        if not first_name or not last_name or not email:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing required fields: firstName, lastName, or email'})
            }

        user_id = generate_user_id(first_name, last_name)
        created_at = datetime.utcnow().isoformat()

        table = dynamodb.Table(USERS_TABLE_NAME)
        table.put_item(Item={
            'userId': user_id,
            'firstName': first_name,
            'lastName': last_name,
            'email': email,
            'phone': phone,
            'createdAt': created_at
        })

        print(f"User {user_id} created successfully.")

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User created', 'userId': user_id})
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
