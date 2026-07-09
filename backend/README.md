# Economia Backend

- Express + Node.js
- PostgreSQL + Prisma
- JWT auth

## Setup

1. `cd backend`
2. `npm install`
3. `npm run prisma:generate`
4. Configure `DATABASE_URL` e `JWT_SECRET` no `.env`
5. `npm run db:push`
6. `npm run dev`

## Endpoints

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/profile
- POST /api/interactions/log
- GET /api/interactions/history
