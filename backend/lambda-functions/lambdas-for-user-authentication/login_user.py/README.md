# Login Lambda Function

This Lambda function handles user login by validating email and password credentials against stored records in a DynamoDB table. It is one of several microservices in the Pulse safety app.

---

## Purpose

Authenticate users securely by:
- Receiving email and password via POST request
- Retrieving the matching user record from DynamoDB
- Comparing passwords using bcrypt
- Returning a user ID on successful authentication

---

## Dependencies

This Lambda requires:

- `boto3`: AWS SDK for Python
- `bcrypt`: Password hashing and verification

---

### Bcrypt Layer

To keep deployment lightweight, bcrypt is imported via a **Lambda layer** by `Klayers`.

```
arn:aws:lambda:us-east-2:770693421928:layer:Klayers-p311-bcrypt:7
```

---

## Environment Variables

| Variable         | Description                          | Default |
|------------------|--------------------------------------|---------|
| `USERS_TABLE_NAME` | Name of the DynamoDB user table      | `Users` |

---

## Input (API Gateway Event)

```json
{
  "body": "{\"email\": \"user@example.com\", \"password\": \"password123\"}"
}
```

---

## Responses

- `200 OK`: `{ "userId": "<user-id>" }`
- `400 Bad Request`: Missing credentials
- `404 Not Found`: User not found
- `401 Unauthorized`: Wrong password
- `500 Internal Server Error`: Unexpected failure

---

## Notes for Judges

- This Lambda is triggered via API Gateway from the mobile app login screen
- Bcrypt hashing is handled in a secure and scalable manner via Lambda Layers
- DynamoDB enables fast, serverless access to user credentials