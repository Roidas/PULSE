# Friend Request Accept Lambda

This AWS Lambda function handles accepting a friend request in a DynamoDB table. It updates the original friend request's status and creates a reverse friendship record so both users are linked.

## Features

- Updates the friend request status to `accepted`.
- Adds a reverse record for the accepting user.
- Uses DynamoDB for storing user-friend relationships.
- Returns JSON response indicating success or error.

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

Send a `POST` request with body:

```json
{
  "userId": "alice",
  "friendId": "bob"
}
```

Example API Gateway event:

```json
{
  "body": "{\"userId\": \"alice\", \"friendId\": \"bob\"}"
}
```

## Example Response

```json
{
  "message": "Friend request accepted"
}
```

## Error Responses

- `400 Bad Request`: Missing `userId` or `friendId`
- `500 Internal Server Error`: DynamoDB or processing error

## How it Works

1. **Validate Input**
   The function checks that both `userId` and `friendId` are provided.

2. **Update Original Friend Request**
   Updates the record where `friendId` initiated the request to `userId`, setting `status` to `accepted`.

3. **Create Reverse Record**
   Inserts a new item so the friendship is bidirectional.

4. **Return JSON result**
   Returns a 200 status with a success message.

## Deployment

Set up your Lambda environment:

- **Handler**: `lambda_function.lambda_handler`
- **Environment Variable**: `FRIENDS_TABLE_NAME=YourTableName`
- **IAM Role**: Ensure it has `dynamodb:UpdateItem` and `dynamodb:PutItem` permissions on your table.

## Example Usage with AWS CLI

```bash
aws lambda invoke \
  --function-name FriendRequestAcceptLambda \
  --payload '{"body":"{\"userId\":\"alice\",\"friendId\":\"bob\"}"}' \
  output.json
```
