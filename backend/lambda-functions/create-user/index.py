import bcrypt
import json
import boto3
import os
from datetime import datetime
import random

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
USERS_TABLE_NAME = os.environ.get('USERS_TABLE_NAME', 'Users')

def generate_user_id(first_name, last_name):
    """Generates a unique user ID"""
    return f"{first_name}{last_name}_{random.randint(1000, 9999)}"

def build_response(status_code, body_dict):
    """Helper to include CORS headers and JSON body"""
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        'body': json.dumps(body_dict)
    }

def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method")
    
    if method == "OPTIONS":
        return build_response(200, {})

    print("Received event:", json.dumps(event))  # Helpful for debugging

    try:
        if 'body' not in event or not event['body']:
            return build_response(400, {'error': 'Empty request body'})

        body = json.loads(event['body'])

        required_fields = ['firstName', 'lastName', 'email', 'phone', 'password']
        missing_fields = [f for f in required_fields if not body.get(f)]

        if missing_fields:
            return build_response(400, {'error': f"Missing required fields: {', '.join(missing_fields)}"})

        first_name = body['firstName']
        last_name = body['lastName']
        email = body['email']
        phone = body['phone']
        password = body['password']

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_id = generate_user_id(first_name, last_name)
        created_at = datetime.utcnow().isoformat()

        # Write to DynamoDB
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

        print(f"[SUCCESS] User {user_id} created")

        return build_response(200, {'message': 'User created', 'userId': user_id})

    except Exception as e:
        print("[ERROR]", str(e))
        return build_response(500, {'error': 'Internal server error'})
