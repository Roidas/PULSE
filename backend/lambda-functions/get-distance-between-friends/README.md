# Friend Distance Lambda

This AWS Lambda function calculates the distance (in meters) between two friends based on their most recent GPS coordinates stored in DynamoDB. It uses the Haversine formula to compute the great-circle distance between two points on Earth.

## Features

- Fetches the latest latitude and longitude for two friend IDs from DynamoDB.
- Computes the distance between them using the Haversine formula.
- Returns the result in JSON format via an API Gateway trigger.

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
    - `latitude` (string or number)
    - `longitude` (string or number)

## Example Request

Send a `GET` request with query parameters:

```
/?friendId1=alice&friendId2=bob
```

Example API Gateway event:

```json
{
  "queryStringParameters": {
    "friendId1": "alice",
    "friendId2": "bob"
  }
}
```

## Example Response

```json
{
  "friendId1": "alice",
  "friendId2": "bob",
  "distance": 1532.67
}
```

## Error Responses

- `400 Bad Request`: Missing friend ID parameters
- `404 Not Found`: Location data not found for one or both friends
- `500 Internal Server Error`: Unexpected errors

## How it Works

1. **Query DynamoDB**  
   The function queries the DynamoDB table for each friend’s most recent location (`ScanIndexForward=False` with `Limit=1`).

2. **Calculate Distance**  
   Uses the Haversine formula:

   \[
   a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)
   \]
   \[
   c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)
   \]
   \[
   d = R \cdot c
   \]

   where:
    - \(R\) = 6,371,000 meters (Earth's radius)
    - \(\phi\) = latitude (radians)
    - \(\lambda\) = longitude (radians)

3. **Return JSON result**

## Deployment

Set up your Lambda environment:

- **Handler**: `lambda_function.lambda_handler`
- **Environment Variable**: `DYNAMO_TABLE_NAME=YourTableName`
- **IAM Role**: Ensure it has `dynamodb:Query` permission on your table.

## Example Usage with AWS CLI

```bash
aws lambda invoke \
  --function-name FriendDistanceLambda \
  --payload '{"queryStringParameters":{"friendId1":"alice","friendId2":"bob"}}' \
  output.json
```
