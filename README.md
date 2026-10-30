# THARA NUFA | Full-Stack Service Booking Platform

A full-stack service booking platform that connects customers with service providers through an organized booking system, real-time notifications, and an administrative dashboard.

This project combines full-stack development with containerization, CI/CD automation, cloud deployment, and Kubernetes orchestration.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express.js, TypeScript, Socket.IO |
| Database | PostgreSQL 16, Prisma ORM |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Container Registry | GitHub Container Registry (GHCR) |
| Cloud | AWS EC2, Linux |
| Reverse Proxy | Nginx |
| Orchestration | Kubernetes (K3s) |
| Ingress | Traefik Ingress Controller |

## Project Structure

```text
Thara-Nufa/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── publish-k8s-images.yml
├── backend/
├── frontend/
├── k8s/
│   ├── backend.yaml
│   ├── frontend.yaml
│   ├── postgres.yaml
│   └── ingress.yaml
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Application Features

### User Management
- User registration and login
- User profile management
- Password management
- Account deletion

### Booking Management
- Create and view service bookings
- Administrative booking management
- Update booking statuses
- Cancel bookings

### Real-Time Notifications

Socket.IO provides real-time communication between users and administrators.

| Event | Direction | Description |
|---|---|---|
| `join:user` | Client → Server | Join a user room |
| `join:admin` | Client → Server | Join the admin room |
| `notification` | Server → User | Deliver a user notification |
| `booking:updated` | Server → User | Notify about a booking update |
| `notification:admin` | Server → Admin | Notify administrators about activity |

### Admin Dashboard
- Manage bookings and users
- Review customer feedback
- Monitor notifications
- Update booking statuses
- Send broadcast notifications

### Reviews
- Customers can submit reviews
- Administrators can view and manage reviews

## DevOps & Infrastructure Implementation

### 1. Docker & Docker Compose

The application is containerized and runs as a multi-service environment.

Docker Compose manages these services:

- **Frontend:** React application exposed on host port `3000`
- **Backend:** Express API on internal port `4000`
- **PostgreSQL:** PostgreSQL 16 database with persistent Docker volume

The backend waits for the database health check before starting.

### 2. CI/CD with GitHub Actions

Two GitHub Actions workflows are included.

**CI — Build & Verify** (`.github/workflows/ci.yml`)

- Runs on pushes to `main` and `develop`, and pull requests targeting `main`
- Installs frontend and backend dependencies using `npm ci`
- Builds the backend and frontend
- Includes an EC2 deployment job for pushes to `main`, using SSH and GitHub Actions secrets

**Publish Kubernetes Images** (`.github/workflows/publish-k8s-images.yml`)

- Builds backend and frontend Docker images
- Pushes images to GitHub Container Registry (GHCR)
- Publishes both `latest` and commit-SHA tags
- Runs when relevant application or Kubernetes files change on `main`
- Supports manual execution through `workflow_dispatch`

The EC2 deployment job requires a reachable EC2 host and correctly configured GitHub Actions secrets. Workflow configuration alone does not mean a server is currently running.

### 3. Kubernetes (K3s)

Kubernetes manifests are maintained in the `k8s/` directory.

| Manifest | Purpose |
|---|---|
| `postgres.yaml` | PostgreSQL Deployment and Service, plus a 2Gi PersistentVolumeClaim |
| `backend.yaml` | Backend Deployment and ClusterIP Service |
| `frontend.yaml` | Frontend Deployment and ClusterIP Service |
| `ingress.yaml` | HTTP routing through Traefik Ingress Controller |

Kubernetes implementation includes:

- Deployments and Services for frontend, backend, and PostgreSQL
- PersistentVolumeClaim for PostgreSQL storage using the `local-path` StorageClass
- Readiness and liveness probes
- CPU and memory resource requests and limits
- Kubernetes Secrets for sensitive application configuration
- Container images published to GHCR through GitHub Actions

The backend health checks use the `/health` endpoint.

### 4. Ingress with Traefik

The project includes an Ingress resource named `thara-nufa-ingress`.

- **Ingress class:** `traefik`
- **Path:** `/`
- **Path type:** `Prefix`
- **Destination Service:** `frontend`
- **Destination port:** `80`

This provides an entry point to the frontend through the Traefik Ingress Controller in the K3s cluster.

### 5. AWS EC2 & Nginx

AWS EC2 was used as a Linux deployment environment.

The deployment setup included:

- Docker-based application deployment
- Linux server administration
- Nginx reverse-proxy configuration
- Automated deployment workflow through SSH

Actual EC2 deployment requires a running instance and correctly configured repository secrets.

## Booking Workflow

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

## API Overview

### Users API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register a user |
| POST | `/api/users/login` | User login |
| GET | `/api/users/me` | Get the current user |
| PATCH | `/api/users/profile` | Update profile |
| PATCH | `/api/users/password` | Change password |
| DELETE | `/api/users/account` | Delete account |
| PATCH | `/api/users/admin-reset-password/:id` | Admin password reset |

### Bookings API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings` | Get bookings |
| GET | `/api/bookings/user/my-bookings` | Get current user's bookings |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| DELETE | `/api/bookings/:id` | Delete a booking |

### Notifications API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/read/:id` | Mark a notification as read |
| GET | `/api/notifications/admin` | Get admin notifications |
| PATCH | `/api/notifications/admin/read-all` | Mark all admin notifications as read |
| POST | `/api/notifications/broadcast` | Send broadcast notifications |

### Reviews & Admin Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reviews` | Submit a review |
| GET | `/api/reviews/admin` | Get reviews for administration |
| DELETE | `/api/reviews/:id` | Delete a review |
| POST | `/api/auth/login` | Admin login |

## Security

Application and deployment security practices include:

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on authentication and booking endpoints
- Protected administrative routes
- Input validation
- Environment-based configuration
- Kubernetes Secrets for sensitive deployment configuration
- Dependency security review and vulnerability remediation

Never commit real credentials, API keys, or production secrets to the repository.

## Run Locally with Docker Compose

### Prerequisites

- Git
- Docker
- Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/mahmoudelshazly55/Thara-Nufa.git
cd Thara-Nufa
```

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

Update the database, JWT, and administrator values in `.env`. Configure email settings if email functionality is required.

### 3. Build and start the application

```bash
docker compose up -d --build
```

### 4. Check services and logs

```bash
docker compose ps
docker compose logs -f
```

Open the frontend:

```text
http://localhost:3000
```

### 5. Stop the application

```bash
docker compose down
```

This stops and removes containers but keeps the named database volume.

To remove the database volume as well:

```bash
docker compose down -v
```

**Warning:** This permanently deletes the stored database data.

## Kubernetes Deployment Notes

Before applying the manifests:

1. Make sure you have access to a Kubernetes cluster with Traefik Ingress Controller installed.
2. Create the Kubernetes Secrets named `thara-db-secret` and `thara-backend-secret` with the environment keys required by the PostgreSQL and backend containers.
3. Ensure the GHCR images referenced in the manifests are accessible to your cluster.
4. Do not commit secret values to GitHub.

Apply the manifests:

```bash
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

Check Kubernetes resources:

```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

The manifests use the `default` namespace unless applied to another namespace.

## Skills Demonstrated

- Full-stack application architecture
- Docker and Docker Compose
- GitHub Actions CI/CD
- Building and publishing Docker images to GHCR
- Kubernetes Deployments, Services, and PersistentVolumeClaims
- K3s cluster deployment
- Traefik Ingress configuration
- AWS EC2 and Linux server deployment
- Nginx reverse proxy
- PostgreSQL and Prisma integration
- Application troubleshooting and security practices

## Project Maintainer

**Mahmoud Elshazly**

Junior DevOps Engineer | Computer Science Background

- GitHub: [@mahmoudelshazly55](https://github.com/mahmoudelshazly55)
- LinkedIn: [Mahmoud Elshazly](https://www.linkedin.com/in/mahmoud-elshazly-20320127a/)

---

**THARA NUFA — Full-Stack Development & DevOps Project**
