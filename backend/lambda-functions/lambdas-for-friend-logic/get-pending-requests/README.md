# Get Pending Friend Requests Lambda

This AWS Lambda function retrieves all pending friend requests where the specified user is the recipient. It scans a DynamoDB table and returns matching requests in JSON format.

## Features

- Retrieves pending friend requests for the specified user.
- Returns a list of pending requests via API Gateway.
- Uses DynamoDB scan with filtering on `friendId` and `status`.

## Requirements

- AWS Lambda
- API Gateway (if exposing as an API)
- DynamoDB table (default: `UserFriends`)
- AWS SDK (`boto3`)
- Environment variable:
    - `FRIENDS_TABLE_NAME`: Name of the DynamoDB table (optional, defaults to `UserFriends`)

## DynamoDB Table Schema

Your DynamoDB table must include:

- **Primary Key (Composite)**:
    - `userId` (string, partition key)
    - `friendId` (string, sort key)
- **Attributes**:
    - `status` (string) — e.g., `pending`, `accepted`
    - `addedAt` (string, ISO timestamp) — optional but recommended

## Example Request

Send a `GET` request with query parameters:

```
/?userId=alice
```

Example API Gateway event:

```json
{
  "queryStringParameters": {
    "userId": "alice"
  }
}
```

## Example Response

```json
[
  {
    "userId": "bob",
    "friendId": "alice",
    "status": "pending",
    "addedAt": "2025-06-30T12:00:00Z"
  },
  {
    "userId": "carol",
    "friendId": "alice",
    "status": "pending",
    "addedAt": "2025-06-29T14:30:00Z"
  }
]
```

## Error Responses

- `400 Bad Request`: Missing `userId`
- `500 Internal Server Error`: DynamoDB or processing error

## How it Works

1. **Validate Input**
   Ensures `userId` is provided in the query string.

2. **Scan DynamoDB**
   Filters for items where:
    - `friendId = :uid`
    - `status = pending`

3. **Return JSON result**
   Returns a 200 status with the list of pending friend requests.

## Deployment

Set up your Lambda environment:

- **Handler**: `lambda_function.lambda_handler`
- **Environment Variable**: `FRIENDS_TABLE_NAME=YourTableName`
- **IAM Role**: Ensure it has `dynamodb:Scan` permission on your table.

## Example Usage with AWS CLI

```bash
aws lambda invoke \
  --function-name GetPendingFriendRequestsLambda \
  --payload '{"queryStringParameters":{"userId":"alice"}}' \
  output.json
```
