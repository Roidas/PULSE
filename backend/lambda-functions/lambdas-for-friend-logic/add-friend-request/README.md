# Friend Distance Lambda Function

This AWS Lambda function calculates the distance (in meters) between two friends based on their most recent location coordinates stored in a DynamoDB table.

## Overview

The Lambda function:
- Retrieves the latest GPS coordinates for two `friendId` values from a DynamoDB table.
- Calculates the distance between them using the Haversine formula.
- Returns the distance in meters as a JSON response.

## Dependencies

- Python 3.8 or higher
- boto3 (AWS SDK for Python)
- AWS DynamoDB

## Environment Variables

| Variable           | Description                                                 | Default         |
|--------------------|-------------------------------------------------------------|-----------------|
| DYNAMO_TABLE_NAME  | Name of the DynamoDB table storing friend location records  | FriendStatus    |

## DynamoDB Table Schema

The DynamoDB table should have:
- Partition Key: `friendId` (string)
- Sort Key (optional but recommended): `timestamp` (number or string)
- Additional attributes: `latitude` (float), `longitude` (float)

### Example Item

```json
{
  "friendId": "user123",
  "timestamp": 1719871234,
  "latitude": 37.7749,
  "longitude": -122.4194
}
