# TaskOrbit

TaskOrbit is a full-stack Team Task Manager for collaborative project work.
It includes secure authentication, role-based permissions, project/team management, and full task tracking with overdue highlighting.

This project is built for real teamwork scenarios:

- teams managing multiple projects
- tasks assigned to members
- simple status tracking and due-date accountability
- dashboard visibility with quick filters

## Live Links

- Frontend: https://frontend-production-fee1.up.railway.app
- Backend API: https://backend-production-15f09.up.railway.app

## Table of Contents

- At a Glance
- Features in Detail
- End-to-End User Journey
- Tech Stack
- Project Structure
- Prerequisites
- Local Setup
- Demo Seed Data
- Commands Reference
- Role and Permission Rules
- Data Model and Relationships
- API Documentation (with examples)
- Deployment on Railway
- Verification Checklist
- Troubleshooting
- Limitations and Next Improvements
- Demo Video
- License

## At a Glance

- Auth: signup, login, JWT-based session
- Roles: admin and member
- Projects: create/update/delete projects, add/remove members
- Tasks: create/assign/update/delete tasks with due dates
- Dashboard: filter by status, project, and overdue tasks
- Responsive UI: login, signup, dashboard, project detail pages

## Features in Detail

### Authentication and Security

- User signup with hashed password (bcrypt)
- Login with JWT token generation
- Token-based session for protected APIs
- Input validation with Zod

### Role-Based Access Control

- `admin` and `member` roles
- Owner/admin can manage project membership
- Member can manage tasks within assigned projects

### Project Management

- Create project
- View all projects where user is a member
- Edit or delete project (owner/admin scope)
- Add/remove team members per project

### Task Management

- Create tasks inside a project
- Assign tasks to project members
- Update status: `todo`, `in_progress`, `done`
- Set due dates and detect overdue tasks
- Delete task (with permission checks)

### Dashboard

- Shows tasks across user-accessible projects
- Filter by status
- Filter by project
- Filter overdue-only
- Highlights overdue tasks visually

## End-to-End Flow (Simple)

1. User signs up or logs in.
2. User lands on dashboard and sees projects + task overview.
3. User creates a project.
4. Project owner/admin adds team members.
5. Team creates tasks, assigns owners, and updates status.
6. Dashboard shows all tasks and marks overdue items.

## End-to-End User Journey (Detailed)

1. New user creates account from signup page.
2. Backend validates request and stores secure password hash.
3. User logs in and receives JWT token.
4. Frontend stores token and sends it in `Authorization: Bearer <token>`.
5. User creates first project.
6. Owner/admin adds other users into project.
7. Any project member creates tasks and assigns owners.
8. Task status progresses from `todo` to `in_progress` to `done`.
9. Dashboard becomes the central tracking view with filters.
10. Overdue tasks are highlighted for faster follow-up.

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, Zod, JWT, bcrypt
- Database: PostgreSQL
- Deployment: Railway

## Quick Local Setup

### Prerequisites

Install these first:

- Node.js 18+ (recommended 20+)
- npm
- Docker (optional but recommended for local PostgreSQL demo)

### Clone project

```bash
git clone https://github.com/Sajal-Srivastava/Ethan_Task.git
cd Ethan_Task
```

### 1) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Configure environment files

Create:

- backend/.env
- frontend/.env

Example values:

```env
# backend/.env
PORT=5000
DATABASE_URL=postgresql://demo_user:demo_pass@localhost:5433/team_task_manager_demo
JWT_SECRET=change_me_to_a_strong_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3) Start database and initialize schema

If using Docker demo database:

```bash
docker run -d --name team-task-postgres-demo -e POSTGRES_USER=demo_user -e POSTGRES_PASSWORD=demo_pass -e POSTGRES_DB=team_task_manager_demo -p 5433:5432 postgres:16
```

If container already exists, start it:

```bash
docker start team-task-postgres-demo
```

Then:

```bash
cd backend
npm run db:init
```

### 4) Run the app

Manual:

```bash
cd backend
npm run dev

# second terminal
cd frontend
npm run dev
```

Or one-click PowerShell launcher:

```powershell
./start-demo.ps1
```

Frontend local URL: http://localhost:5173

Backend local URL: http://localhost:5000

## Demo Seed Data

To create sample users, project, and tasks:

```bash
cd backend
npm run db:seed-demo
```

Demo credentials:

- Admin: admin@demo.local / admin123
- Member: member@demo.local / member123

## Commands Reference

### Backend

- `npm run dev` -> run API in development with nodemon
- `npm run start` -> run API in production mode
- `npm run db:init` -> initialize database schema
- `npm run db:seed-demo` -> insert demo users/project/tasks

### Frontend

- `npm run dev` -> run Vite dev server
- `npm run build` -> create production build
- `npm run preview` -> preview production build locally

## Architecture

### Frontend

- React + Vite
- React Router for page navigation
- Axios for API requests
- Auth context to keep user session state

### Backend

- Node.js + Express REST API
- Zod validation for request bodies
- bcrypt for password hashing
- JWT for auth tokens
- Middleware for authentication and role authorization

### Database (PostgreSQL)

Core tables:

- users
- projects
- project_members
- tasks

Relationships:

- users and projects: many-to-many (project_members)
- projects and tasks: one-to-many

## Project Structure

- backend
  - src/routes: auth, projects, tasks APIs
  - src/middleware: auth, validation, error handling
  - src/config: database pool config
  - src/scripts: db init and demo seeding
  - db/init.sql: schema script
- frontend
  - src/pages: Login, Signup, Dashboard, Project
  - src/components: shell and route guard
  - src/context: auth session state
  - src/api: axios client

## Role and Permission Rules

| Action | Admin | Member | Notes |
|---|---|---|---|
| Sign up / login | Yes | Yes | Public auth endpoints |
| Create project | Yes | Yes | Creator becomes owner |
| Edit/delete own project | Yes | Yes | Owner rights apply |
| Edit/delete others' project | Yes | No | Admin override |
| Add/remove project members | Yes | Owner only | Owner/admin scope |
| Create task in member project | Yes | Yes | Must belong to project |
| Assign task to project member | Yes | Yes | Assignee must be member |
| Update task status/details | Yes | Yes | Project member scope |
| Delete task | Yes | Creator only | Admin override |

## API Summary

Base URL: /api

### Auth

- POST /auth/signup
- POST /auth/login
- GET /auth/me

### Projects

- GET /projects
- POST /projects
- GET /projects/:id
- PATCH /projects/:id
- DELETE /projects/:id
- GET /projects/users
- POST /projects/:id/members
- DELETE /projects/:id/members/:userId
- GET /projects/:id/tasks
- POST /projects/:id/tasks

### Tasks

- GET /tasks/dashboard
- PATCH /tasks/:id
- DELETE /tasks/:id

## API Examples (Simple)

### Signup

`POST /api/auth/signup`

Request:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123",
  "role": "member"
}
```

Response (201):

```json
{
  "message": "Account created successfully.",
  "token": "<jwt>",
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "member"
  }
}
```

### Login

`POST /api/auth/login`

Request:

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

### Create Project

`POST /api/projects`

Headers:

- `Authorization: Bearer <jwt>`

Request:

```json
{
  "name": "Website Launch",
  "description": "Tasks for launch week"
}
```

### Create Task

`POST /api/projects/:id/tasks`

Request:

```json
{
  "title": "Finalize hero section",
  "description": "Update copy and CTA",
  "status": "todo",
  "dueDate": "2026-06-01",
  "assigneeId": 5
}
```

### Dashboard Filter

`GET /api/tasks/dashboard?status=in_progress&overdue=true`

## Railway Deployment (What is Already Live)

Services used:

- backend service
- frontend service
- managed PostgreSQL service

Important backend environment variables:

- DATABASE_URL
- JWT_SECRET
- CLIENT_URL
- NODE_ENV=production

Important frontend environment variable:

- VITE_API_BASE_URL=https://backend-production-15f09.up.railway.app/api

### Deployment Checklist

- [ ] Backend deployed from `backend` root
- [ ] Frontend deployed from `frontend` root
- [ ] Managed PostgreSQL attached
- [ ] Backend variables set
- [ ] Frontend `VITE_API_BASE_URL` set
- [ ] Health endpoint responding
- [ ] Signup/login works on live site

## Verification Checklist

After setup/deploy, verify:

- [ ] `GET /api/health` returns 200
- [ ] Signup works
- [ ] Login works
- [ ] Project creation works
- [ ] Member add/remove works
- [ ] Task create/update/delete works
- [ ] Overdue task highlight appears in dashboard

## Troubleshooting

- Login returns DB error:
  - check DATABASE_URL
  - verify PostgreSQL is running
  - run npm run db:init in backend
- CORS issue in browser:
  - ensure backend CLIENT_URL matches frontend URL
- Empty dashboard:
  - create project and tasks or run db:seed-demo

## Limitations and Next Improvements

Current limitations:

- No password reset flow yet
- No file attachments on tasks
- No realtime notifications
- No audit trail page

Potential next upgrades:

- Add email verification and password reset
- Add comments and activity log on tasks
- Add Kanban drag-and-drop board view
- Add team invitation by email
- Add unit/integration tests and CI pipeline

## Demo Video

- Pending upload (replace this line with your final 2-5 minute video link)

## License

ISC
