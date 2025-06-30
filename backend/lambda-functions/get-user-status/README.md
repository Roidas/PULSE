# Friend Status Fetch Lambda

This AWS Lambda function retrieves the most recent status data (heart rate, stress level, distance from friends, and update timestamp) for a given friend ID from DynamoDB. It is designed to support health and proximity tracking applications.

## Features

- Queries DynamoDB for the latest status record of a specific friend.
- Returns heart rate, stress level, distance from friends, and update time.
- Handles `Decimal` values returned by DynamoDB.
- Returns clean JSON response via API Gateway.

## Requirements

- AWS Lambda
- API Gateway (if exposing as an API)
- DynamoDB table (default: `FriendStatus`)
- AWS SDK (`boto3`)
- Environment variable:
    - `DYNAMO_TABLE_NAME`: Name of the DynamoDB table (optional, defaults to `FriendStatus`)

## DynamoDB Table Schema

Your DynamoDB table must include:

- **Primary Key**: `friendId` (string, partition key)
- **Sort Key**: `timestamp` or similar (if using composite keys, optional but recommended)
- **Attributes**:
    - `heartRate` (number)
    - `stressLevel` (number)
    - `distanceFromFriends` (number)
    - `updatedAt` (string or number)

## Example Request

Send a `GET` request with query parameters:

```
/?friendId=alice
```

Example API Gateway event:

```json
{
  "queryStringParameters": {
    "friendId": "alice"
  }
}
```

## Example Response

```json
{
  "heartRate": 75,
  "stressLevel": 2,
  "distanceFromFriends": 134.5,
  "updatedAt": "2025-06-30T12:34:56Z"
}
```

## Error Responses

- `400 Bad Request`: Missing `friendId` parameter
- `404 Not Found`: No status found for the specified friend ID
- `500 Internal Server Error`: Unexpected errors

## How it Works

1. **Query DynamoDB**
   The function queries the DynamoDB table for the latest status data where `friendId` equals the provided value.

2. **Return Latest Record**
   Returns the most recent record’s heart rate, stress level, distance from friends, and timestamp.

3. **Handles Decimal**
   Uses a custom `DecimalEncoder` to convert `Decimal` values from DynamoDB to float for JSON output.

## Deployment

Set up your Lambda environment:

- **Handler**: `lambda_function.lambda_handler`
- **Environment Variable**: `DYNAMO_TABLE_NAME=YourTableName`
- **IAM Role**: Ensure it has `dynamodb:Query` permission on your table.

## Example Usage with AWS CLI

```bash
aws lambda invoke \
  --function-name FriendStatusLambda \
  --payload '{"queryStringParameters":{"friendId":"alice"}}' \
  output.json
```
