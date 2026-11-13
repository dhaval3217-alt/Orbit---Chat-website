# 🌌 Orbit — Real-Time Social Audio & Matching Web Application

Orbit is a production-structured real-time social networking web platform designed for anonymous voice lounges, vibe matching, screened real-time text chat, private 1-to-1 conversations, and mutual consent profile reveals.

---

## 🌟 Features Overview

- **📱 Anonymous Authentication & Profile**: Phone number OTP verification (with extensible mock/Twilio hooks), customizable cartoon avatars, 3–5 interest tags, and locked private profile fields.
- **✨ Real-Time Mood & Vibe System**: Travel, Let's Chat, Movies, Threat Detection, Fitness, Chill with Music, and Gaming synchronized across Redis and Socket.io.
- **⚡ Pure Matching Engine**: Dedicated compatibility scoring based on active vibes, shared interests, online availability, and proximity with live Redis waiting queues.
- **🎙️ Live Audio Lounges (LiveKit)**: Multi-participant audio rooms, mute/unmute, speaker status visualizers, raise hand mechanics, participant management, and graceful reconnection handling.
- **💬 Screened Real-Time Text Chat**: Sub-second socket messaging, timestamps, emoji reactions, live typing indicators, basic profanity filtering, moderator deletion, and message reporting.
- **💬 Let's Chat**: Private two-person sessions with text chat always available, optional voice, and optional location sharing visible only to the current participant. Microphone and location permissions are requested only after explicit opt-in.
- **🎵 Chill with Music**: Play, pause, seek, and switch tracks from the community library; upload MP3, WAV, M4A, AAC, or OGG files from device storage.
- **🔒 Mutual Consent Profile Reveal**: Profiles remain 100% anonymous until both participants explicitly consent to reveal their real identity.
- **🛡️ Community Safety & Moderation**: User blocking, message & user reporting, rate limiting, toxic language detection, and admin/moderator actions (mute, ban, delete, warn).
- **📊 Admin & Moderation Console**: Live metrics (online users, active rooms, matches, reports), report resolution workflow, user role governance, and room shutdown controls.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Zustand, React Router 6, Socket.io Client, LiveKit Client |
| **Backend** | Node.js, Express, TypeScript, Socket.io, JWT (Access + Refresh Tokens), Zod, Helmet, CORS, Rate Limiting |
| **Database** | PostgreSQL + PostGIS extension |
| **Caching & Presence** | Redis (with embedded high-fidelity in-memory fallback for local dev) |
| **Audio Infrastructure** | LiveKit Cloud / Self-hosted LiveKit Server |
| **Map & Proximity** | Mapbox GL & PostGIS ST_DWithin geography calculations |
| **Testing** | Vitest, Supertest, Testing Library |

---

## 📁 Application Architecture

```
Orbit/
├── docker-compose.yml           # PostgreSQL + PostGIS & Redis container configuration
├── .env.example                 # Root environment variable template
├── .env                         # Development environment file
├── index.html                   # Vite HTML entry point
├── package.json                 # Frontend dependencies & workspace scripts
├── vite.config.ts               # Vite configuration & proxy routes
├── tailwind.config.js           # Futuristic calm theme color system
├── src/                         # Frontend Application
│   ├── components/
│   │   ├── layout/              # Navbar, Sidebar, PageContainer
│   │   ├── cards/               # MoodCard, InterestTag, RoomCard
│   │   ├── audio/               # LiveKitAudioBridge, AudioControls, ParticipantList
│   │   ├── chat/                # ChatPanel, ChatBubble, EmojiBar, TypingIndicator
│   │   ├── walk/                # ProximityRadar, StopSharingButton
│   │   ├── profile/             # ConnectionModal
│   │   ├── safety/              # ReportModal
│   │   └── common/              # Toast, LoadingSpinner, EmptyState, ErrorBoundary
│   ├── pages/                   # 20 required application pages
│   ├── store/                   # Zustand stores (auth, mood, room, chat, songs, connections, admin, ui)
│   ├── services/                # Axios/Fetch API client with JWT authorization
│   ├── socket/                  # Socket.io client manager
│   ├── types/                   # Frontend TypeScript domain types
│   ├── utils/                   # Formatters & avatar helpers
│   └── routes/                  # AppRoutes, ProtectedRoute, AdminRoute
└── server/                      # Backend Application
    ├── package.json             # Server dependencies & scripts
    ├── tsconfig.json            # Server TypeScript configuration
    ├── vitest.config.ts         # Server Vitest configuration
    └── src/
        ├── config/              # Zod-validated environment config
        ├── controllers/         # Auth, Profiles, Moods, Matches, Rooms, Messages, Location, Safety, Admin
        ├── database/            # schema.sql, db.ts connection pool & migrations/seeding
        ├── middleware/          # JWT auth guard, role check, rate limiting, error handler
        ├── routes/              # Express API subrouters
        ├── services/            # Pure domain services (Matching, Room, LiveKit, OTP, Redis, Safety)
        ├── sockets/             # Socket.io event gateway & presence
        ├── tests/               # Vitest + Supertest comprehensive test suite
        └── types/               # Backend domain types & interfaces
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Docker & Docker Compose** (Optional, for PostgreSQL + PostGIS & Redis)

---

### 1. Installation

Clone or open the repository, then install both root and server dependencies:

```bash
# Install frontend dependencies
npm.cmd install

# Install backend dependencies
Push-Location server
npm.cmd install
Pop-Location
```

---

### 2. Environment Configuration

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Key environment variables:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (PostgreSQL + PostGIS)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/orbit_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=orbit_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_ACCESS_SECRET=orbit_super_secret_access_jwt_key_development_32chars_min!
JWT_REFRESH_SECRET=orbit_super_secret_refresh_jwt_key_development_32chars_min!

# OTP Authentication
OTP_PROVIDER=mock

# LiveKit Audio
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=wss://orbit-audio.livekit.cloud
```

> 💡 **Development Note**: If PostgreSQL or Redis are not running locally, Orbit automatically activates its built-in high-fidelity in-memory relational store and Redis cache emulator, allowing complete end-to-end testing and development without setup friction!

---

### 3. Database Setup (Optional Docker)

To run PostgreSQL with PostGIS and Redis via Docker Compose:

```bash
docker-compose up -d
```

Run database migrations and seed data:

```bash
npm run db:migrate
npm run db:seed
```

---

### 4. Running the Application

You can launch both the frontend and backend concurrently with a single command:

```bash
npm.cmd run dev
```

Or start them individually in separate terminals:

```bash
# Terminal 1: Backend API & Socket Server (Port 5000)
npm.cmd run dev:server

# Terminal 2: Frontend Vite App (Port 5173)
npm.cmd run dev:client
```

Open **`http://localhost:5173/`** on the computer running the app.

To open Orbit on another device connected to the same Wi-Fi:

1. Find the computer's Wi-Fi IPv4 address by running `ipconfig` in Command Prompt and looking under **Wireless LAN adapter Wi-Fi**.
2. Open `http://<that-IPv4-address>:5173/` on the other device (for example, `http://192.168.1.25:5173/`).
3. If Windows Firewall asks, allow Node.js on **Private networks**. Both devices must be on the same network.

Keep the terminal running while using the site; press **Ctrl+C** there to stop both development servers. PostgreSQL and Redis are optional for local development; if they are unavailable, the backend uses its in-memory development store and data is not persisted.

---

### 5. Running the Test Suite

Orbit includes a comprehensive unit and integration test suite:

```bash
# Run both frontend and backend tests
npm test

# Run frontend tests only
npm run test:client

# Run backend API & matching engine tests only
npm run test:server
```

---

## 🧪 Development & Demo Credentials

| Role | Phone Number | Verification Code | Permissions |
|---|---|---|---|
| **Administrator** | `+15550000000` | Any 6 digits or `123456` | Full platform metrics, moderation, report resolution, user bans |
| **Moderator** | `+15555556666` | Any 6 digits or `123456` | Review reports, mute users, delete flagged messages |
| **Standard User** | Any phone (e.g. `+15551234567`) | Any 6 digits or `123456` | Anonymous audio rooms, vibes, Let's Chat, connections |

---

## 🔒 Security & Privacy Architecture

1. **Zero Secret Leakage**: No JWT secrets, LiveKit credentials, or database passwords are ever exposed to the client.
2. **Private Chat Location Sharing**: Location is off by default and sent only to the other participant in the active private chat. Sharing stops when disabled or when the chat ends; coordinates are not added to public feeds.
3. **Instant Location Purge**: Clicking "STOP SHARING LOCATION" immediately removes coordinates and halts GPS listeners on the client and server.
4. **Mutual Consent Reveal**: Personal profile data remains encrypted and hidden behind mutual agreement flags (`requester_consent_reveal` & `recipient_consent_reveal`).
5. **Real-Time Word Screening**: Chat messages are passed through content sanitization before persistence and broadcast.

---

## 📄 License

MIT License — Orbit Real-Time Social Audio Platform.
