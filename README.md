# Sarahah Backend API

A secure RESTful backend for an anonymous messaging application built with **Node.js, Express.js, MongoDB, and Mongoose**.

Sarahah allows registered users to exchange anonymous messages while keeping the sender's identity private. The recipient can request to reveal the sender's identity, and the original sender has the choice to accept or reject that request. If accepted, the application automatically creates a private conversation between both users.

The backend also provides authentication, account security, two-factor authentication (2FA), user management, and protected private conversations.

---

## Features

### 1. Authentication & Account Security

- User registration.
- User login.
- Password hashing using Argon2.
- Support for verifying existing bcrypt password hashes.
- JWT-based authentication.
- JWT token expiration after 1 day.
- Account lock after 5 failed login attempts.
- Account lock duration of 5 minutes.
- Two-Factor Authentication (2FA).
- Email-based One-Time Password (OTP).
- Six-digit OTP verification.
- OTP expiration after 5 minutes.
- Maximum OTP verification attempts.
- Secure OTP hashing and one-time usage.
- Input validation and error handling.

### 2. User Management

- Get the logged-in user's profile.
- Update username.
- Change account password.
- Delete the user account.
- Protected user operations using JWT authentication.

### 3. Anonymous Messaging

- Send anonymous messages to registered users.
- Store the original sender's identity internally.
- Hide sender information from the recipient by default.
- Retrieve received messages.
- Mark messages as read.
- Delete received messages.
- Message content validation.
- Maximum message length of 2000 characters.
- Prevent users from sending messages to themselves.
- Restrict message operations to the authorized recipient.

**Important:** Anonymous means the recipient cannot see the sender's identity. The sender must be authenticated, and their identity is stored internally by the backend.

### 4. Identity Reveal Requests

- Request the identity of an anonymous message sender.
- Store identity requests in MongoDB.
- Support three request statuses:
  - `pending`
  - `accepted`
  - `rejected`
- Allow the original sender to view incoming identity requests.
- Only the original sender can accept or reject a request.
- Reveal the sender's identity only after acceptance.
- Keep the sender's identity hidden when a request is rejected.
- Prevent duplicate identity requests for the same message.

### 5. Private Conversations

- Automatically create a conversation after an identity request is accepted.
- Link each conversation to its original anonymous message.
- Link each conversation to its accepted identity request.
- Allow both participants to exchange messages.
- Retrieve conversation messages.
- Display the sender's username inside the conversation.
- Sort conversation messages by creation time.
- Restrict conversation access to its two participants.
- Prevent third-party users from reading or sending messages.

---

## Technologies

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| Argon2 | Password hashing |
| bcrypt | Legacy password hash verification |
| Node.js Crypto | OTP generation and hashing |
| dotenv | Environment variables |
| Nodemailer / Email Utility | OTP email delivery |

---

## Project Architecture

The project follows a modular backend structure:

- **Routes:** Define API endpoints.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Contain business logic.
- **Models:** Define MongoDB data structures.
- **Middleware:** Handle authentication and request protection.
- **Utils:** Contain reusable utilities.

### Project Structure

```text
sarahah-app/
│
├── src/
│   │
│   ├── Config/
│   │   ├── db.config.js
│   │   └── jwt.config.js
│   │
│   ├── DB/
│   │   ├── db.conection.js
│   │   └── models/
│   │       ├── usr.model.js
│   │       ├── message.model.js
│   │       ├── identityRequest.model.js
│   │       ├── conversation.model.js
│   │       └── conversationMessage.model.js
│   │
│   ├── Middleware/
│   │   └── auth.middleware.js
│   │
│   ├── Modules/
│   │   │
│   │   ├── Auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.routes.js
│   │   │
│   │   ├── User/
│   │   │   ├── user.controller.js
│   │   │   ├── user.servies.js
│   │   │   └── user.routes.js
│   │   │
│   │   ├── Message/
│   │   │   ├── massage.controller.js
│   │   │   ├── massage.servies.js
│   │   │   ├── message.routes.js
│   │   │   ├── identityRequest.controller.js
│   │   │   └── identityRequest.service.js
│   │   │
│   │   └── Conversation/
│   │       ├── conversation.controller.js
│   │       ├── conversation.service.js
│   │       └── conversation.routes.js
│   │
│   ├── Utils/
│   │   ├── security/
│   │   │   └── hash.security.js
│   │   └── email.util.js
│   │
│   └── index.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## Installation & Setup

### 1. Requirements

Make sure the following are installed:

- Node.js
- npm
- MongoDB (local installation or MongoDB Atlas)
- Git
- Postman (for API testing)

### 2. Clone the Repository

```bash
git clone https://github.com/amrmohameddd/sarahah-app.git
```

Navigate to the project directory:

```bash
cd sarahah-app
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000

MONGO_URI=mongodb://127.0.0.1:27017/sarahah_db

JWT_SECRET=your_long_random_secret
```

Use a strong private JWT secret.

Configure any additional email credentials required by the email utility for OTP delivery, using the environment variable names expected by your project.

**Security Notes:**

- Never commit your `.env` file.
- Never expose your JWT secret.
- Do not share email passwords or application passwords.
- Keep `.env` in `.gitignore`.

### 5. Start the Server

Run the following command:

```bash
node --watch --env-file=.env src/index.js
```

Expected output:

```text
MongoDB connected
Server running on port 3000
```

### 6. Check the Server

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

---

## API Documentation

### Base URL

```text
http://localhost:3000
```

### Authentication Header

All protected endpoints require a valid JWT:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

In Postman:

1. Open the request.
2. Select Authorization.
3. Choose Bearer Token.
4. Paste the JWT token.

---

### 1. Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/2fa/enable` | Enable 2FA |
| POST | `/api/auth/2fa/verify` | Verify 2FA setup |
| POST | `/api/auth/login/confirm` | Confirm login OTP |

**Register Example**

```json
{
  "username": "amr",
  "email": "amr@example.com",
  "password": "your_password"
}
```

**Login Example**

```json
{
  "email": "amr@example.com",
  "password": "your_password"
}
```

The login flow may require an additional OTP confirmation when Two-Factor Authentication is enabled.

### 2. User Management Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update username |
| PATCH | `/api/users/me/password` | Change password |
| DELETE | `/api/users/me` | Delete account |

**Update Profile Example**

```json
{
  "username": "new_username"
}
```

**Change Password Example**

```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### 3. Anonymous Messaging Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/messages/send` | Send anonymous message |
| GET | `/api/messages/my` | Get received messages |
| PATCH | `/api/messages/:messageId/read` | Mark message as read |
| DELETE | `/api/messages/:messageId` | Delete received message |

**Send Anonymous Message**

```http
POST /api/messages/send
```

Request body:

```json
{
  "recipient": "RECIPIENT_USER_ID",
  "content": "Hello! This is an anonymous message."
}
```

The backend automatically identifies the authenticated sender using the JWT.

The recipient receives the message without seeing the sender's identity.

### 4. Identity Reveal Request Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/messages/:messageId/identity-request` | Request sender identity |
| GET | `/api/messages/identity-requests` | Get incoming identity requests |
| PATCH | `/api/messages/identity-requests/:requestId/respond` | Accept or reject a request |

**Request Sender Identity**

```http
POST /api/messages/MESSAGE_ID/identity-request
```

**Accept Identity Request**

```http
PATCH /api/messages/identity-requests/REQUEST_ID/respond
```

Request body:

```json
{
  "decision": "accepted"
}
```

**Reject Identity Request**

```json
{
  "decision": "rejected"
}
```

Valid decisions:

```text
accepted
rejected
```

When the original sender accepts the request:

1. The identity request status changes to `accepted`.
2. The sender's identity becomes visible to the recipient.
3. A private conversation is created automatically.
4. The response includes the created `conversationId`.

When rejected, the sender's identity remains hidden and no conversation is created.

### 5. Conversation Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/conversations/:conversationId/messages` | Send conversation message |
| GET | `/api/conversations/:conversationId/messages` | Get conversation messages |

**Send Conversation Message**

```http
POST /api/conversations/CONVERSATION_ID/messages
```

Request body:

```json
{
  "content": "Hello! How are you?"
}
```

**Get Conversation Messages**

```http
GET /api/conversations/CONVERSATION_ID/messages
```

Only the two users stored in the conversation's `participants` field can access these endpoints.

A third-party user receives an access-denied response.

---

## Anonymous Messaging Workflow

The following diagram illustrates the complete identity reveal and conversation workflow:

```text
       User A
          |
          | Sends anonymous message
          v
       User B
          |
          | Requests sender identity
          v
    Identity Request
          |
          v
       User A
          |
       Decision
       /      \
      /        \
  Reject      Accept
    |            |
    v            v
 Identity      Reveal Sender
 Remains       Identity
 Hidden            |
                   v
             Create Conversation
                   |
                   v
             Private Messaging
              /           \
           User A         User B
```

---

## Database Models

The application uses MongoDB with Mongoose schemas.

| Model | Responsibility |
|---|---|
| User | Stores user account information and authentication data |
| Message | Stores anonymous messages and their original senders |
| IdentityRequest | Stores sender identity reveal requests and decisions |
| Conversation | Stores conversation participants and related original message |
| ConversationMessage | Stores messages exchanged inside private conversations |

### Identity Request Status

| Status | Meaning |
|---|---|
| `pending` | Waiting for the original sender's decision |
| `accepted` | Sender approved identity disclosure |
| `rejected` | Sender refused identity disclosure |

---

## Security & Authorization

The backend implements several security measures:

- Password hashing before database storage.
- JWT authentication for protected endpoints.
- Account lock after repeated failed login attempts.
- Email-based OTP verification.
- OTP expiration and maximum verification attempts.
- Hidden sender identity in anonymous messages.
- Sender identity is disclosed only after an accepted identity request.
- Message access restricted to the intended recipient.
- Conversation access restricted to its two participants.
- Server-side validation of message content.
- Environment variables used for sensitive configuration.

---

## Error Handling

The API uses standard HTTP status codes, depending on the endpoint:

| Status Code | Description |
|---|---|
| 200 | Request completed successfully |
| 201 | Resource created successfully |
| 400 | Invalid input or request |
| 401 | Unauthorized or invalid authentication |
| 404 | Requested resource not found or inaccessible |
| 409 | Resource conflict or duplicate request |
| 423 | Account temporarily locked |
| 500 | Internal server error |

---

## Testing with Postman

Recommended testing sequence:

### Authentication
- Register users.
- Login with valid credentials.
- Test incorrect passwords.
- Test account lock behavior.
- Enable and verify 2FA.
- Test OTP expiration and invalid OTP attempts.

### Anonymous Messaging
- Send an anonymous message from User A to User B.
- Login as User B.
- Retrieve received messages.
- Verify that User B cannot see User A's identity.
- Mark the message as read.
- Delete a received message.

### Identity Reveal
- Request the sender's identity as User B.
- Login as User A.
- Retrieve incoming identity requests.
- Reject a request and verify that the identity stays hidden.
- Accept a request and verify that the identity becomes visible.

### Private Conversations
- Verify that a conversation is created after acceptance.
- Send messages as User A.
- Retrieve messages as User B.
- Verify that both participants can access the conversation.
- Attempt to access the conversation using User C.
- Verify that User C cannot read or send messages.

Testing should be completed before considering the project ready for final delivery.

---

## Future Improvements

- Real-time messaging using Socket.IO.
- WebSocket notifications.
- Conversation list and management.
- Message delivery and read receipts.
- Message rate limiting.
- Blocking and reporting users.
- Advanced account security.
- Mobile application integration.
- Cloud deployment and monitoring.

---

## License

This project is developed for educational and learning purposes.
