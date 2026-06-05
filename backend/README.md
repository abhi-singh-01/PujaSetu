# PujaSetu Spring Boot Backend

Production-ready Spring Boot 3.x backend for the PujaSetu platform — book verified Pandits and Naus across India.

## Stack

- Java 21
- Spring Boot 3.3
- Spring Security + JWT
- Spring Data MongoDB
- Maven, Lombok, Bean Validation
- Swagger/OpenAPI
- Cloudinary (uploads), Firebase FCM (notifications)

## Quick Start (Local)

### Prerequisites

- Java 21+
- Maven 3.9+
- MongoDB (local or Atlas)

### Run

```powershell
cd backend
$env:MONGODB_URI="mongodb://localhost:27017/pujasetu"
$env:JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
$env:DEV_OTP_BYPASS="true"
$env:SEED_ENABLED="true"
mvn spring-boot:run
```

API: `http://localhost:5000/api`  
Swagger UI: `http://localhost:5000/swagger-ui.html`

### Test logins (after seed)

| Role     | Mobile     | OTP (dev) |
|----------|------------|-----------|
| Admin    | 9999999999 | 123456    |
| Customer | 9876543210 | 123456    |
| Pandit   | 9123456780 | 123456    |
| Nau      | 9123456781 | 123456    |

## API Routes

Compatible with the PujaSetu mobile app:

```
GET  /api/health
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me
PUT  /api/auth/profile
GET  /api/users/profile
GET  /api/users/bookings
GET  /api/providers/search
POST /api/providers/register
GET  /api/bookings
POST /api/bookings/payment/verify
GET  /api/admin/dashboard
GET  /api/locations/states
```

Full API docs: `/swagger-ui.html`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/pujasetu` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | — |
| `DEV_OTP_BYPASS` | Accept dev OTP `123456` | `true` |
| `ADVANCE_PAYMENT_PERCENT` | Booking advance % | `15` |
| `CLIENT_URL` | CORS origins (comma-separated) | `http://localhost:8081` |
| `RAZORPAY_KEY_ID` | Razorpay key (mock if empty) | — |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud | — |
| `SEED_ENABLED` | Seed sample data on startup | `false` |

## Project Structure

```
com.pujasetu
├── config          # App config, MongoDB, OpenAPI, seed
├── security        # JWT filter, SecurityConfig, UserPrincipal
├── controller      # REST controllers
├── service         # Business logic
├── repository      # MongoDB repositories
├── dto             # Request/response DTOs
├── model           # MongoDB documents
├── exception       # Global exception handling
├── util            # JWT utilities
└── mapper          # Entity mappers
```

## Roles

| Spring Authority | Stored Value | Description |
|------------------|--------------|-------------|
| ROLE_USER        | customer     | App user    |
| ROLE_PANDIT      | pandit       | Pandit      |
| ROLE_NAI         | nau          | Nau         |
| ROLE_ADMIN       | admin        | Admin       |

## Deploy to Render

1. Create a **Web Service** from this repo (`backend` directory).
2. **Runtime:** Docker or Native Java
3. **Build command:** `mvn -DskipTests clean package`
4. **Start command:** `java -jar target/pujasetu-backend-1.0.0.jar`
5. Set environment variables:
   - `MONGODB_URI` → MongoDB Atlas connection string
   - `JWT_SECRET` → strong random secret
   - `SPRING_PROFILES_ACTIVE=prod`
   - `DEV_OTP_BYPASS=false`
   - `CLIENT_URL=https://your-app.com`
6. Health check path: `/api/health`

## Deploy to Railway

1. New Project → Deploy from GitHub → set root directory to `backend`.
2. Add MongoDB plugin or use Atlas `MONGODB_URI`.
3. Set the same env vars as Render.
4. Railway auto-detects Maven; set start command if needed:
   `java -jar target/pujasetu-backend-1.0.0.jar`
5. Generate domain; point mobile `EXPO_PUBLIC_API_URL` to `https://<domain>/api`.

## Docker

```powershell
cd backend
docker compose up -d --build
```

Or build the image directly:

```powershell
docker build -t pujasetu-api .
docker run -p 5000:5000 -e MONGODB_URI=mongodb://host.docker.internal:27017/pujasetu pujasetu-api
```
