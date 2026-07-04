# Economia Backend

- Express + Node.js
- SQLite + Prisma
- JWT auth

## Setup

1. `cd backend`
2. `npm install`
3. `npm run prisma:generate`
4. `npm run prisma:migrate`
5. `npm run dev`

## Endpoints

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/profile
- POST /api/interactions/log
- GET /api/interactions/history
