# CineMarathi API Documentation

## Base URL
\`\`\`
http://localhost:3001/api
\`\`\`

## Authentication
All protected endpoints require JWT token in Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

---

## Endpoints

### 1. Authentication Routes (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/verify` - Verify token

### 2. Users Routes (`/users`)
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/roles` - Get all users by role

### 3. Casting Routes (`/casting`)
- `GET /casting` - Get all casting calls
- `POST /casting` - Create casting call
- `POST /casting/:id/apply` - Apply for casting
- `PUT /casting/:id/update-status` - Update application status

### 4. Chat Routes (`/chat`)
- `GET /chat/conversations` - Get all conversations
- `POST /chat/send` - Send message
- `GET /chat/:user_id` - Get conversation with user
- `PUT /chat/:id/read` - Mark message as read

### 5. Ratings Routes (`/ratings`)
- `GET /ratings/user/:user_id` - Get user ratings
- `POST /ratings` - Submit rating/review
- `PUT /ratings/:id` - Update rating

### 6. Premium Routes (`/premium`)
- `GET /premium/plans` - Get all premium plans
- `POST /premium/subscribe` - Subscribe to plan
- `GET /premium/status` - Check subscription status

### 7. Admin Routes (`/admin`)
- `GET /admin/users` - List all users
- `PUT /admin/users/:id/verify` - Verify user
- `GET /admin/casting` - Manage casting calls

---

## New Extended APIs

### 8. Technicians Routes (`/technicians`)
- `GET /technicians/all` - List all technicians (with filters)
  - Query params: `specialization`, `experience_min`, `location`, `page`, `limit`
- `GET /technicians/:id` - Get technician details
- `PUT /technicians/:id` - Update technician profile

### 9. Subscriptions Routes (`/subscriptions`)
- `GET /subscriptions/plans` - Get all subscription plans
- `GET /subscriptions/status` - Get current subscription status
- `POST /subscriptions/subscribe` - Create new subscription
- `POST /subscriptions/cancel` - Cancel active subscription

### 10. Search Routes (`/search`)
- `GET /search/casting-calls` - Search casting calls
  - Query params: `role`, `gender`, `location`, `min_budget`, `max_budget`, `keyword`, `page`, `limit`
- `GET /search/profiles` - Search actor profiles
  - Query params: `category`, `min_experience`, `skills`, `location`, `page`, `limit`
- `GET /search/trending` - Get trending casting calls and profiles

### 11. Notifications Routes (`/notifications`)
- `GET /notifications` - Get user notifications
- `GET /notifications/unread/count` - Get unread count
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/all/read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

### 12. Portfolio Routes (`/portfolio`)
- `GET /portfolio/user/:user_id` - Get user portfolio items
- `POST /portfolio` - Add portfolio item
- `PUT /portfolio/:id` - Update portfolio item
- `DELETE /portfolio/:id` - Delete portfolio item

### 13. Events Routes (`/events`)
- `GET /events/upcoming` - Get upcoming events
  - Query params: `location`, `type`, `page`, `limit`
- `GET /events/:id` - Get event details
- `POST /events/:id/register` - Register for event
- `POST /events/:id/unregister` - Unregister from event

### 14. Admin Analytics Routes (`/admin/analytics`)
- `GET /admin/analytics/stats` - Get platform statistics
- `GET /admin/analytics/trends/registrations` - Get registration trends
- `GET /admin/analytics/revenue` - Get revenue analytics
- `GET /admin/analytics/active-users` - Get most active users

---

## JWT Token Format

\`\`\`json
{
  "id": 123,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "actor|technician|production_house|admin",
  "is_verified": true,
  "iat": 1234567890,
  "exp": 1234654290
}
\`\`\`

## Response Format

### Success Response
\`\`\`json
{
  "data": {},
  "message": "Success"
}
\`\`\`

### Error Response
\`\`\`json
{
  "error": "Error message"
}
\`\`\`

---

## Example Requests

### Register
\`\`\`bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "actor"
  }'
\`\`\`

### Search Casting Calls
\`\`\`bash
curl -X GET "http://localhost:3001/api/search/casting-calls?role=Lead%20Actor&location=Mumbai&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

### Subscribe to Premium
\`\`\`bash
curl -X POST http://localhost:3001/api/subscriptions/subscribe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 1
  }'
\`\`\`

### Get Admin Analytics
\`\`\`bash
curl -X GET http://localhost:3001/api/admin/analytics/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
