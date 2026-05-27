# TaskOrbit

TaskOrbit is a full-stack Team Task Manager for collaborative project work.
It includes secure authentication, role-based permissions, project/team management, and full task tracking with overdue highlighting.

## Live Links

- Frontend: https://frontend-production-fee1.up.railway.app
- Backend API: https://backend-production-15f09.up.railway.app

## At a Glance

- Auth: signup, login, JWT-based session
- Roles: admin and member
- Projects: create/update/delete projects, add/remove members
- Tasks: create/assign/update/delete tasks with due dates
- Dashboard: filter by status, project, and overdue tasks
- Responsive UI: login, signup, dashboard, project detail pages

## End-to-End Flow (Simple)

1. User signs up or logs in.
2. User lands on dashboard and sees projects + task overview.
3. User creates a project.
4. Project owner/admin adds team members.
5. Team creates tasks, assigns owners, and updates status.
6. Dashboard shows all tasks and marks overdue items.

## Quick Local Setup

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

## Demo Seed Data

To create sample users, project, and tasks:

```bash
cd backend
npm run db:seed-demo
```

Demo credentials:

- Admin: admin@demo.local / admin123
- Member: member@demo.local / member123

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

## Folder Map

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

## Troubleshooting

- Login returns DB error:
  - check DATABASE_URL
  - verify PostgreSQL is running
  - run npm run db:init in backend
- CORS issue in browser:
  - ensure backend CLIENT_URL matches frontend URL
- Empty dashboard:
  - create project and tasks or run db:seed-demo

## Demo Video

- Pending upload (replace this line with your final 2-5 minute video link)

## License

ISC
