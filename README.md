# ثرا نوفا | Thara Nufa Platform

## 🏗️ Architecture Overview

```
thara-original/
├── frontend/          # React 18 + Vite + TailwindCSS v4
│   └── src/
│       ├── App.tsx                    # Main app + all pages + modals
│       ├── constants.ts               # Brand data, services, FAQ, booking stages
│       ├── components/
│       │   ├── UserDashboard.tsx      # User portal (bookings, notifications, account)
│       │   ├── AdminDashboard.tsx     # Admin panel (bookings, users, reviews, notifs)
│       │   └── ServiceDetail.tsx      # Service detail page
│       └── index.css                  # Global styles + Tailwind
├── backend/           # Node.js + Express + Prisma + PostgreSQL
│   └── src/
│       ├── index.ts                   # Express server + Socket.io
│       ├── routes/
│       │   ├── users.ts               # Register, login, profile, password, delete
│       │   ├── bookings.ts            # CRUD + status updates
│       │   ├── notifications.ts       # User + Admin notifications
│       │   ├── reviews.ts             # Reviews + admin
│       │   ├── auth.ts                # Admin auth
│       │   └── adminUsers.ts          # Admin user management
│       └── prisma/schema.prisma       # DB schema
└── docker-compose.yml
```

## 🚀 Quick Start

```bash
cd thara-original
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api
- **Admin Panel:** http://localhost:3000?admin=true

**Admin credentials:**
- Email: `admin@tharanufa.sa`
- Password: `TharaNufa@2026`

## 📡 Real-time System (Socket.io)

Socket.io runs on the same backend port. Events:

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:user` | Client → Server | User joins their room |
| `join:admin` | Client → Server | Admin joins admin room |
| `notification` | Server → User | New notification pushed |
| `booking:updated` | Server → User | Booking status changed |
| `notification:admin` | Server → Admin | New booking/review alert |

## 🔗 Main API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | User login |
| GET | `/api/users/me` | Get current user |
| PATCH | `/api/users/profile` | Update name/phone |
| PATCH | `/api/users/password` | Change password |
| DELETE | `/api/users/account` | Delete own account |
| PATCH | `/api/users/admin-reset-password/:id` | Admin reset user password |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Get all (admin) |
| GET | `/api/bookings/user/my-bookings` | Get user bookings |
| PATCH | `/api/bookings/:id/status` | Update status (admin) |
| DELETE | `/api/bookings/:id` | Delete booking (admin) |

### Booking Status Flow
`PENDING_REVIEW` → `UNDER_REVIEW` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED`
(or `CANCELLED` at any stage)

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | User notifications |
| PATCH | `/api/notifications/read/:id` | Mark one as read |
| GET | `/api/notifications/admin` | Admin notifications |
| PATCH | `/api/notifications/admin/read-all` | Mark all admin notifs read |
| POST | `/api/notifications/broadcast` | Send to all / specific user |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Submit review (user) |
| GET | `/api/reviews/admin` | Get all reviews (admin) |
| DELETE | `/api/reviews/:id` | Delete review (admin) |

### Admin Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |

## 🎯 User Flows

### Booking Flow
1. User clicks service → Auth modal if not logged in
2. Booking form opens (service pre-selected, user data pre-filled)
3. Submit → Server creates booking → Real-time notification to user + admin
4. Admin updates status → User gets real-time notification
5. On COMPLETED → Review modal appears once

### Admin Flow
1. Access via `?admin=true` in URL
2. Login with admin credentials
3. Manage: bookings, users, notifications, reviews, analytics
4. Send broadcast notifications to all or specific users
5. Reset user passwords directly from admin panel

## 🔒 Security
- JWT tokens (30-day expiry) for users and admins
- bcrypt password hashing (12 rounds)
- Rate limiting on auth and booking endpoints
- Admin middleware protection on all admin routes
- Input validation on all endpoints
