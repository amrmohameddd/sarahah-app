# Sarahah Backend API

A RESTful backend for a Sarahah-style messaging application, built with Node.js, Express.js, MongoDB, and Mongoose.

## Features

### Authentication
- User registration.
- User login.
- Password hashing using Argon2, with support for verifying existing bcrypt password hashes.
- JWT authentication.
- Token expiration after 1 day.
- Input validation and error handling.

### User Management
- Get the logged-in user's profile.
- Update the username.
- Change the account password.
- Delete the user account and their received messages.

### Messaging
- Send a message to an existing user.
- Retrieve messages received by the logged-in user.
- Mark a received message as read.
- Delete a received message.
- Validate message content and limit it to 2000 characters.
- Restrict message reading, updating, and deletion to the recipient.

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- Argon2
- bcrypt
- dotenv

## Project Structure

```text
sarahah-app/
├── src/
│   ├── Config/
│   │   ├── db.config.js
│   │   └── jwt.config.js
│   ├── DB/
│   │   ├── db.conection.js
│   │   └── models/
│   │       ├── usr.model.js
│   │       └── message.model.js
│   ├── Middleware/
│   │   └── auth.middleware.js
│   ├── Modules/
│   │   ├── Auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.routes.js
│   │   ├── User/
│   │   │   ├── user.controller.js
│   │   │   ├── user.servies.js
│   │   │   └── user.routes.js
│   │   └── Message/
│   │       ├── massage.controller.js
│   │       ├── massage.servies.js
│   │       └── message.routes.js
│   ├── Utils/
│   │   └── security/
│   │       └── hash.security.js
│   └── index.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Installation

### 1. Install dependencies

Make sure Node.js and MongoDB are installed and available.

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/sarahah_db
JWT_SECRET=your_long_random_secret
```

Replace `your_long_random_secret` with a strong, private secret.

Never commit your `.env` file or expose your JWT secret.

### 3. Start the server

From the project root, run:

```bash
node --watch src/index.js
```

The server should start on port `3000` after connecting to MongoDB.

### 4. Check the server

Open:

```text
http://localhost:3000/
```

Expected response:

```json
{
  "message": "Sarahah API is running"
}
```

## API Endpoints

Base URL:

```text
http://localhost:3000
```

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |

Registration example:

```json
{
  "username": "amr",
  "email": "amr@example.com",
  "password": "your_password"
}
```

Login example:

```json
{
  "email": "amr@example.com",
  "password": "your_password"
}
```

A successful login returns a JWT token and the user's basic information.

### User Management

All user endpoints below require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get the current user's profile |
| PATCH | `/api/users/me` | Update the username |
| PATCH | `/api/users/me/password` | Change the password |
| DELETE | `/api/users/me` | Delete the account |

Update profile example:

```json
{
  "username": "new_username"
}
```

Change password example:

```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

The new password must contain at least 8 characters.

### Messages

All message endpoints below require authentication.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/messages/send` | Send a message |
| GET | `/api/messages/my` | Get messages received by the current user |
| PATCH | `/api/messages/:messageId/read` | Mark a received message as read |
| DELETE | `/api/messages/:messageId` | Delete a received message |

Send message example:

```json
{
  "recipient": "RECIPIENT_USER_ID",
  "content": "Hello!"
}
```

Replace `RECIPIENT_USER_ID` with the MongoDB ID of an existing user.

## Authentication

For protected endpoints, include this HTTP header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

In Postman:

1. Open the request.
2. Select the **Authorization** tab.
3. Choose **Bearer Token**.
4. Paste the token returned by the login endpoint.

The authentication middleware verifies the JWT and identifies the logged-in user.

## Error Handling

The API uses HTTP status codes such as:

- `200 OK` — request completed successfully.
- `201 Created` — resource created successfully.
- `400 Bad Request` — invalid input.
- `401 Unauthorized` — missing, invalid, or expired token, or invalid credentials.
- `404 Not Found` — user or message not found.
- `409 Conflict` — email already exists.
- `500 Internal Server Error` — unexpected server error.

Actual responses depend on the endpoint and the error encountered.

## Testing

Use Postman to test the API endpoints.

Recommended test cases:

- Register a user with valid information.
- Attempt to register with an existing email.
- Log in with valid and invalid credentials.
- Access protected endpoints with and without a token.
- Retrieve and update the current user's profile.
- Change the password and verify login with the new password.
- Delete a test account and confirm its received messages are deleted.
- Send a message to an existing user.
- Attempt to send a message with an invalid recipient ID.
- Retrieve messages and mark a received message as read.
- Delete a received message.
- Verify that a user cannot read, mark as read, or delete another user's message.
- Test empty messages and messages exceeding 2000 characters.

Testing should be completed before considering the project ready for final delivery.

## Security Notes

- Passwords are hashed before being stored.
- Passwords should never be returned in API responses.
- Protected endpoints require a valid JWT.
- Message operations are scoped to the logged-in recipient.
- Environment secrets must remain private.

## License

This project is developed for educational and learning purposes.
