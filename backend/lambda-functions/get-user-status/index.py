import json
import boto3
import os
from boto3.dynamodb.conditions import Key
from decimal import Decimal

# Custom encoder to handle Decimal values from DynamoDB
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('DYNAMO_TABLE_NAME', 'FriendStatus'))

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))

    # Expect "friendId" in query string
    friend_id = event.get("queryStringParameters", {}).get("friendId")

    if not friend_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing 'friendId' in query parameters"})
        }

    try:
        # Query using 'friendId' as the partition key
        response = table.query(
            KeyConditionExpression=Key('friendId').eq(friend_id),
            ScanIndexForward=False,  # Get the latest item first
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
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        print("Error during DynamoDB query:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Server error", "details": str(e)})
        }
