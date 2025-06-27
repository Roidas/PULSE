import json
import boto3
import os
from boto3.dynamodb.conditions import Key

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('DYNAMO_TABLE_NAME', 'FriendStatus'))

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))

    # Expect "friendId" to match the partition key in your DynamoDB table
    friend_id = event.get("queryStringParameters", {}).get("friendId")

    if not friend_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing 'friendId' in query parameters"})
        }

    try:
        # Query using 'friendId' — must match table schema
        response = table.query(
            KeyConditionExpression=Key('friendId').eq(friend_id),
            ScanIndexForward=False,  # Get latest item first
            Limit=1
        )

        items = response.get("Items", [])
        if not items:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "No status found for this friendId"})
            }

        latest = items[0]
        return {
            "statusCode": 200,
            "headers": { "Content-Type": "application/json" },
            "body": json.dumps({
                "heartRate": latest.get("heartRate"),
                "stressLevel": latest.get("stressLevel"),
                "distanceFromFriends": latest.get("distanceFromFriends"),
                "updatedAt": latest.get("updatedAt")
            })
        }

    except Exception as e:
        print("Error during DynamoDB query:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Server error", "details": str(e)})
        }
