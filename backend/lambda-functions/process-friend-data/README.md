# Friend Status Update & Alert Lambda

This AWS Lambda function processes friend location updates, writes status data to DynamoDB, and sends SMS alerts via Amazon SNS when safety thresholds (e.g., SOS pressed or distance too far) are breached.

## Features

- Stores friend location, distance from friends, and timestamp in DynamoDB.
- Retrieves user preferences for safety thresholds or uses defaults.
- Sends SMS alerts for:
    - SOS button press
    - Exceeding allowed distance from friends
- Supports dynamic thresholds via preferences table.

## Requirements

- AWS Lambda
- API Gateway (if exposing as an API)
- DynamoDB tables:
    - `FriendStatus` (default, configurable via `DYNAMO_TABLE_NAME`)
    - `UserPreferences` (default, configurable via `PREFERENCES_TABLE_NAME`)
    - `Users` (default, configurable via `USERS_TABLE_NAME`)
- Amazon SNS for SMS delivery
- AWS SDK (`boto3`)

## DynamoDB Table Schemas

### FriendStatus

- **Partition Key**: `friendId` (string)
- **Attributes**:
    - `latitude` (number)
    - `longitude` (number)
    - `distanceFromFriends` (number)
    - `sos` (boolean)
    - `updatedAt` (string, ISO timestamp)

### UserPreferences

- **Partition Key**: `friendId` (string)
- **Attributes**:
    - `maxDistanceApart` (number)
    - `countdownBeforeNotify` (number)

### Users

- **Partition Key**: `userId` (string)
- **Attributes**:
    - `phone` (string, 10-digit)

## Example Request

Send a `POST` request with JSON body:

```json
{
  "friendId": "alice",
  "latitude": 43.6532,
  "longitude": -79.3832,
  "sos": true,
  "distanceFromFriends": 300
}
```

Example API Gateway event:

```json
{
  "body": "{\"friendId\": \"alice\", \"latitude\": 43.6532, \"longitude\": -79.3832, \"sos\": true, \"distanceFromFriends\": 300}"
}
```

## Example Response

```json
{
  "message": "Friend data processed successfully."
}
```

## Error Responses

- `500 Internal Server Error`: Failed DynamoDB write or other processing error

## How it Works

1. **Parse Request**
   Extract `friendId`, GPS data, SOS flag, and distance from friends.

2. **Load Preferences**
   Get thresholds from `UserPreferences` table, fallback to defaults:
    - `maxDistanceApart = 250m`
    - `countdownBeforeNotify = 600s`

3. **Save to DynamoDB**
   Write the latest friend status to the `FriendStatus` table.

4. **Check Conditions**
    - If `sos = true`, send SOS SMS immediately.
    - If `distanceFromFriends > maxDistanceApart`, send warning SMS and after delay, final alert SMS.

## Deployment

Set up your Lambda environment:

- **Handler**: `lambda_function.lambda_handler`
- **Environment Variables**:
    - `DYNAMO_TABLE_NAME=YourFriendStatusTable`
    - `PREFERENCES_TABLE_NAME=YourUserPreferencesTable`
    - `USERS_TABLE_NAME=YourUsersTable`
- **IAM Role**:
    - `dynamodb:PutItem`, `dynamodb:GetItem`, `sns:Publish` permissions

## Example Usage with AWS CLI

```bash
aws lambda invoke \
  --function-name FriendStatusAlertLambda \
  --payload '{"body":"{\"friendId\":\"alice\",\"latitude\":43.6532,\"longitude\":-79.3832,\"sos\":true,\"distanceFromFriends\":300}"}' \
  output.json
```
