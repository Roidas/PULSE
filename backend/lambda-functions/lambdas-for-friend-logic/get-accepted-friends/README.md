# Get Friends Lambda

This AWS Lambda function retrieves all accepted friendships for a given user from a DynamoDB table. It scans both outgoing and incoming accepted friendships and returns a unified list.

## Features

- Retrieves all friendships where the user initiated or received a friend connection.
- Normalizes the data so all friendships appear consistently.
- Returns JSON list of friends with status and timestamps.

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
    - `addedAt` (string, ISO timestamp)

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
    "userId": "alice",
    "friendId": "bob",
    "status": "accepted",
    "addedAt": "2025-06-30T12:00:00Z"
  },
  {
    "userId": "carol",
    "friendId": "alice",
    "status": "accepted",
    "addedAt": "2025-06-29T14:30:00Z"
  }
]
```

## Error Responses

- `400 Bad Request`: Missing `userId`
- `500 Internal Server Error`: DynamoDB or processing error

## How it Works

1. **Validate Input**
   Checks that `userId` is provided in the query string.

2. **Scan DynamoDB**
    - Finds all records where `userId = :uid AND status = accepted`
    - Finds all records where `friendId = :uid AND status = accepted`

3. **Normalize Friendships**
   Adjusts incoming friendships so the result list always shows the same structure.

4. **Return JSON result**
   Returns a 200 status with the list of accepted friends.

## Deployment

Set up your Lambda environment:

- **Handler**: `lambda_function.lambda_handler`
- **Environment Variable**: `FRIENDS_TABLE_NAME=YourTableName`
- **IAM Role**: Ensure it has `dynamodb:Scan` permission on your table.

## Example Usage with AWS CLI

```bash
aws lambda invoke \
  --function-name GetFriendsLambda \
  --payload '{"queryStringParameters":{"userId":"alice"}}' \
  output.json
```
