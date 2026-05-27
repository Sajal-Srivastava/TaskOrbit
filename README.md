# TaskOrbit

TaskOrbit is a full-stack team task management platform with secure auth, role-based access, project collaboration, and task tracking.

## Live App

- Frontend: https://frontend-production-fee1.up.railway.app
- Backend: https://backend-production-15f09.up.railway.app

## Quick Start

Use this mini checklist:

- [ ] Install dependencies
- [ ] Add env files
- [ ] Initialize database
- [ ] Start backend + frontend

```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

Create env files:

- `backend/.env`
- `frontend/.env`

Suggested values:

```env
# backend/.env
PORT=5000
DATABASE_URL=postgresql://demo_user:demo_pass@localhost:5433/team_task_manager_demo
JWT_SECRET=change_me
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

Initialize DB and run:

```bash
cd backend
npm run db:init
npm run dev

# in another terminal
cd frontend
npm run dev
```

Or use:

```powershell
./start-demo.ps1
```

## What You Can Do

- Sign up and log in securely (JWT + password hashing)
- Use roles: Admin and Member
- Create and manage projects
- Add and remove project members
- Create, assign, update, and delete tasks
- Track status: To Do, In Progress, Done
- Set due dates and identify overdue tasks
- Filter tasks from the dashboard

## Interactive Guide

<details>
  <summary>Click to view Demo Accounts (local seeded demo)</summary>

- Admin: admin@demo.local / admin123
- Member: member@demo.local / member123

</details>

<details>
  <summary>Click to view API Routes</summary>

Base path: `/api`

- Auth: `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`
- Projects: CRUD + members + project tasks
- Tasks: dashboard list, update, delete

</details>

<details>
  <summary>Click to view Database Model</summary>

- users
- projects
- project_members (many-to-many users/projects)
- tasks (one-to-many projects/tasks)

</details>

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, Zod, JWT, bcrypt
- Database: PostgreSQL
- Deployment: Railway

## Deployment Notes

Railway services:

- Backend service: Node app from `backend`
- Frontend service: Static app from `frontend`
- Managed PostgreSQL service

Required backend envs:

- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_URL`
- `NODE_ENV=production`

Required frontend env:

- `VITE_API_BASE_URL=https://backend-production-15f09.up.railway.app/api`

## Demo Video

- Pending upload (replace with your final 2-5 minute link)
