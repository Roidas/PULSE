# Sign Up Lambda Function

This Lambda function handles user registration by validating input fields, hashing the password, and saving the user record in DynamoDB.

---

## Purpose

Register new users securely by:
- Accepting first name, last name, email, phone, and password via POST request
- Validating all required fields
- Hashing the password using bcrypt
- Storing user data in DynamoDB
- Returning a unique `userId` on success

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

| Variable           | Description                          | Default |
|--------------------|--------------------------------------|---------|
| `USERS_TABLE_NAME` | Name of the DynamoDB user table      | `Users` |

---

## Input (API Gateway Event)

```json
{
  "body": "{ 
    \"firstName\": \"John\",
    \"lastName\": \"Doe\",
    \"email\": \"john@example.com\",
    \"phone\": \"1234567890\",
    \"password\": \"securePass123\"
  }"
}
```

---

## Responses

- `200 OK`: `{ "message": "User created", "userId": "<user-id>" }`
- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Unexpected failure

---

## Notes for Judges

- This Lambda is triggered via API Gateway from the mobile app sign-up screen
- Passwords are never stored in plain text thanks to bcrypt hashing
- DynamoDB stores the user profile, created timestamp, and hashed password