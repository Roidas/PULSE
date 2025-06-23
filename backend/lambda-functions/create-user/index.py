import bcrypt
import json
import boto3
import os
from datetime import datetime
import random

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
USERS_TABLE_NAME = os.environ.get('USERS_TABLE_NAME', 'Users')

# Generate random numbers after their id to add uniqueness
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
        password = body.get('password')

        if not first_name or not last_name or not email or not phone or not password:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing required fields'})
            }

        #Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_id = generate_user_id(first_name, last_name)
        created_at = datetime.utcnow().isoformat()

        table = dynamodb.Table(USERS_TABLE_NAME)
        table.put_item(Item={
            'userId': user_id,
            'firstName': first_name,
            'lastName': last_name,
            'email': email,
            'phone': phone,
            'password': hashed_password,
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
