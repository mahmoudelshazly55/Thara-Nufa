
# THARA NUFA | Service Booking Platform

A full-stack service booking platform designed to connect customers with service providers through an organized booking management system, real-time notifications, and an administrative dashboard.

The platform supports user authentication, service booking, booking status tracking, reviews, and administrative operations.

---

## 🚀 Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS v4

### Backend
- Node.js
- Express.js
- TypeScript
- Socket.IO

### Database
- PostgreSQL
- Prisma ORM

### DevOps & Infrastructure
- Docker
- Docker Compose
- GitHub Actions
- AWS EC2
- Nginx

---

## 🏗️ Application Architecture

The application follows a multi-service architecture with separate frontend, backend, and database components.

```text
THARA-NUFA/
│
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── constants.ts
│       ├── components/
│       │   ├── UserDashboard.tsx
│       │   ├── AdminDashboard.tsx
│       │   └── ServiceDetail.tsx
│       └── index.css
│
├── backend/
│   └── src/
│       ├── index.ts
│       ├── routes/
│       │   ├── users.ts
│       │   ├── bookings.ts
│       │   ├── notifications.ts
│       │   ├── reviews.ts
│       │   ├── auth.ts
│       │   └── adminUsers.ts
│       │
│       └── prisma/
│           └── schema.prisma
│
└── docker-compose.yml
```

---

## ⚙️ DevOps Implementation

### 1. Containerization with Docker

Docker is used to containerize the application services and provide a consistent environment across development and deployment.

Docker Compose manages the multi-container application environment.

Services include:

- Frontend application
- Backend API
- PostgreSQL database
- Nginx web server / reverse proxy

### 2. CI/CD with GitHub Actions

GitHub Actions is used to automate the application workflow.

The CI/CD implementation focuses on:

- Automating application build and verification.
- Integrating checks into the development workflow.
- Supporting deployment automation.
- Improving consistency between application updates.

### 3. AWS Cloud Deployment

AWS EC2 was used as the cloud compute environment for application deployment.

Infrastructure components included:

- Amazon EC2
- Linux server environment
- Docker-based application deployment
- Security Groups
- Nginx reverse proxy

### 4. Nginx Reverse Proxy

Nginx is used as a reverse proxy to route incoming requests to the appropriate application services.

### 5. Security & Troubleshooting

Security and operational work included:

- Reviewing reported dependency vulnerabilities.
- Performing security scanning.
- Addressing identified security issues.
- Troubleshooting Docker containers and application deployment.
- Reviewing application configuration and environment variables.

---

## ✨ Main Features

### User Management
- User registration and login.
- User profile management.
- Password management.
- Account deletion.

### Booking Management
- Create service bookings.
- View personal bookings.
- Administrative booking management.
- Update booking statuses.
- Cancel bookings.

### Real-Time Notifications

Socket.IO provides real-time communication between users and administrators.

Supported events:

| Event | Direction | Description |
|---|---|---|
| `join:user` | Client → Server | Join user room |
| `join:admin` | Client → Server | Join admin room |
| `notification` | Server → User | New user notification |
| `booking:updated` | Server → User | Booking status update |
| `notification:admin` | Server → Admin | New booking/review alert |

### Admin Dashboard
- Manage bookings.
- Manage users.
- Review customer feedback.
- Monitor notifications.
- Manage booking statuses.
- Send broadcast notifications.
- Access administrative analytics.

### Reviews
- Customers can submit reviews.
- Administrators can view and manage reviews.

---

## 🔄 Booking Workflow

The platform supports the following booking lifecycle:

```text
PENDING_REVIEW
       |
       v
UNDER_REVIEW
       |
       v
CONFIRMED
       |
       v
IN_PROGRESS
       |
       v
COMPLETED
```

A booking can also be cancelled at any stage.

---

## 🔌 API Endpoints

### Users API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register user |
| POST | `/api/users/login` | User login |
| GET | `/api/users/me` | Get current user |
| PATCH | `/api/users/profile` | Update profile |
| PATCH | `/api/users/password` | Change password |
| DELETE | `/api/users/account` | Delete account |

### Bookings API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Admin: get bookings |
| GET | `/api/bookings/user/my-bookings` | Get user bookings |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| DELETE | `/api/bookings/:id` | Delete booking |

### Notifications API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/read/:id` | Mark notification as read |
| GET | `/api/notifications/admin` | Get admin notifications |
| PATCH | `/api/notifications/admin/read-all` | Mark all admin notifications as read |
| POST | `/api/notifications/broadcast` | Send broadcast notifications |

### Reviews API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reviews` | Submit review |
| GET | `/api/reviews/admin` | Get reviews |
| DELETE | `/api/reviews/:id` | Delete review |

### Admin Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login |

---

## 🔐 Security

Security measures implemented in the application include:

- JWT authentication for users and administrators.
- bcrypt password hashing.
- Rate limiting on authentication and booking endpoints.
- Protected administrative routes.
- Input validation.
- Environment-based configuration.
- Dependency security scanning.

---

## 🐳 Running the Project with Docker Compose

### Prerequisites

Make sure you have installed:

- Docker
- Docker Compose

### 1. Clone the Repository

```bash
git clone https://github.com/mahmoudelshazly55/Thara-Nufa.git
```

### 2. Navigate to the Project Directory

```bash
cd Thara-Nufa
```

### 3. Configure Environment Variables

Configure the required environment variables according to the application's configuration and Docker Compose setup.

Do not commit secrets, passwords, API keys, or production credentials to GitHub.

### 4. Build and Start Services

```bash
docker compose up -d --build
```

### 5. Check Running Containers

```bash
docker compose ps
```

### 6. View Container Logs

```bash
docker compose logs -f
```

### 7. Stop Services

```bash
docker compose down
```

---

## 🛠️ Skills Demonstrated

This project demonstrates practical experience in:

- Full-Stack Application Architecture
- Docker Containerization
- Docker Compose Orchestration
- CI/CD Automation with GitHub Actions
- AWS EC2 Deployment
- Linux Server Administration
- Nginx Reverse Proxy Configuration
- PostgreSQL Database Integration
- Application Troubleshooting
- Security Scanning and Vulnerability Remediation

---

## 👨‍💻 Project Maintainer

**Mahmoud Elshazly**

Junior DevOps Engineer | Computer Science Background

- GitHub: [@mahmoudelshazly55](https://github.com/mahmoudelshazly55)
- LinkedIn: [Mahmoud Elshazly](https://www.linkedin.com/in/mahmoud-elshazly-20320127a/)

---

**THARA NUFA — Full-Stack Development & DevOps Deployment**
