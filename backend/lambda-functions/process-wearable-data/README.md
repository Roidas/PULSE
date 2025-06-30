# Wearable Data Processor Lambda

This AWS Lambda function processes wearable device data, stores it in DynamoDB, checks against user safety thresholds, and sends alerts via Amazon SNS if conditions are breached.

## Features

- Saves heart rate, stress level, and fall detection data to DynamoDB.
- Loads user-specific thresholds from `UserPreferences` table or uses defaults.
- Sends alert via SNS if heart rate, stress level, or fall detection trigger conditions.

## Requirements

- AWS Lambda
- API Gateway / AWS IoT / EventBridge (any event source)
- DynamoDB tables:
    - `FriendStatus` (default for data, configurable via `DATA_TABLE_NAME`)
    - `UserPreferences` (default for thresholds, configurable via `PREFERENCES_TABLE_NAME`)
- Amazon SNS for alerting (requires `SNS_TOPIC_ARN`)
- AWS SDK (`boto3`)

## DynamoDB Table Schemas

### FriendStatus (or WearableData)

- **Partition Key**: `friendId` (string)
- **Sort Key**: `timestamp` (string, ISO 8601)
- **Attributes**:
    - `heartRate` (number)
    - `stressLevel` (number)
    - `fallDetected` (boolean)

### UserPreferences

- **Partition Key**: `friendId` (string)
- **Attributes**:
    - `maxHeartRate` (number, optional)
    - `minHeartRate` (number, optional)
    - `maxStressLevel` (number, optional)

## Example Request

Send a `POST` request body:

```json
{
  "friendId": "alice",
  "heartRate": 160,
  "stressLevel": 85,
  "fallDetected": true
}
```

Example API Gateway event:

```json
{
  "friendId": "alice",
  "heartRate": 160,
  "stressLevel": 85,
  "fallDetected": true
}
```

## Example Response

```json
{
  "message": "Wearable data processed."
}
```

## Default Safety Thresholds

- Max Heart Rate: `150`
- Min Heart Rate: `50`
- Max Stress Level: `80`

## How it Works

1. **Parse Input**
   Extract `friendId`, `heartRate`, `stressLevel`, `fallDetected`.

2. **Load Preferences**
   Attempt to load thresholds from `UserPreferences`; fallback to defaults if not set.

3. **Save Data**
   Save the data to the `FriendStatus` (or configured) table.

4. **Check for Alert**
    - Heart rate too high or low
    - Stress level too high
    - Fall detected

5. **Send SNS Alert**
   If triggered, send SMS/email/notification using the SNS topic configured.

## Deployment

Set up your Lambda environment:

- **Handler**: `lambda_function.lambda_handler`
- **Environment Variables**:
    - `DATA_TABLE_NAME=YourDataTable`
    - `PREFERENCES_TABLE_NAME=YourPreferencesTable`
    - `SNS_TOPIC_ARN=YourSnsTopicArn`
- **IAM Role**:
    - `dynamodb:PutItem`, `dynamodb:GetItem`, `sns:Publish`

## Example Usage with AWS CLI

```bash
aws lambda invoke \
  --function-name WearableProcessorLambda \
  --payload '{"friendId":"alice","heartRate":160,"stressLevel":85,"fallDetected":true}' \
  output.json
```
