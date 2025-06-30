# Set User Preferences Lambda

This AWS Lambda function allows users to set or update their safety and health preferences, storing them in DynamoDB. Preferences include heart rate thresholds, stress level limits, distance limits, and notification settings.

## Features

- Stores user preferences in `UserPreferences` DynamoDB table.
- Supports optional input — only updates provided fields.
- Returns JSON confirmation of successful save.

## Requirements

- AWS Lambda
- API Gateway (if exposing as an API)
- DynamoDB table: `UserPreferences`
- AWS SDK (`boto3`)
- Environment variable:
    - `PREFERENCES_TABLE_NAME` (defaults to `UserPreferences`)

## DynamoDB Table Schema

### UserPreferences

- **Partition Key**: `friendId` (string)
- **Attributes** (optional per user input):
    - `maxHeartRate` (number)
    - `minHeartRate` (number)
    - `maxStressLevel` (number)
    - `maxDistanceApart` (number)
    - `countdownBeforeNotify` (number)

## Example Request

Send a `POST` request body:

```json
{
  "friendId": "alice",
  "maxHeartRate": 160,
  "minHeartRate": 55,
  "maxStressLevel": 85,
  "maxDistanceApart": 300,
  "countdownBeforeNotify": 900
}
```

Example API Gateway event:

```json
{
  "body": "{\"friendId\": \"alice\", \"maxHeartRate\": 160, \"minHeartRate\": 55, \"maxStressLevel\": 85, \"maxDistanceApart\": 300, \"countdownBeforeNotify\": 900}"
}
```

## Example Response

```json
{
  "message": "Preferences saved for alice."
}
```

## Error Responses

- `400 Bad Request`: Missing `friendId`
- `500 Internal Server Error`: DynamoDB or processing error

## How it Works

1. **Parse Input**
   Parses JSON body to extract preferences.

2. **Validate**
   Ensures `friendId` is provided.

3. **Build DynamoDB Item**
   Only includes provided fields to avoid overwriting other preferences unnecessarily.

4. **Save**
   Writes item to `UserPreferences` table using `put_item`.

5. **Respond**
   Returns success confirmation in JSON.

## Deployment

Set up your Lambda environment:

- **Handler**: `lambda_function.lambda_handler`
- **Environment Variables**:
    - `PREFERENCES_TABLE_NAME=YourPreferencesTable`
- **IAM Role**:
    - `dynamodb:PutItem`

## Example Usage with AWS CLI

```bash
aws lambda invoke \
  --function-name SetPreferencesLambda \
  --payload '{"body":"{\"friendId\":\"alice\",\"maxHeartRate\":160,\"minHeartRate\":55,\"maxStressLevel\":85,\"maxDistanceApart\":300,\"countdownBeforeNotify\":900}"}' \
  output.json
```
