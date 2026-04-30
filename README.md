# Team Task Manager (Full Stack)

A full-stack Team Task Manager with secure authentication, role-based access control, project/team management, and task tracking with overdue detection.

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, PostgreSQL, JWT, Zod
- Database: PostgreSQL
- Deployment target: Railway (backend service + frontend static service)

## Features

- Authentication
  - Sign up and login with hashed passwords and JWT auth
  - Authenticated user profile endpoint
- Role-based access control
  - Roles: Admin, Member
  - Admin capabilities for project/task management permissions
- Project management
  - Create, view, update, and delete projects
  - Many-to-many relationship for users and projects via project_members
  - Add/remove members from projects
- Task management
  - Create, assign, update, and delete tasks inside projects
  - Status flow: To Do, In Progress, Done
  - Due dates and overdue highlighting
- Dashboard
  - Unified task list across user projects
  - Filters by status, project, and overdue-only toggle
- Responsive UI
  - Pages: Login, Signup, Dashboard, Project/Task management

## Project Structure

- backend
  - Express API, PostgreSQL integration, auth/authorization, validation
- frontend
  - React app for all user flows and management screens

## Database Schema

Defined in backend/db/init.sql:

- users (id, name, email, password_hash, role)
- projects (id, name, description, owner_id)
- project_members (project_id, user_id)
- tasks (id, project_id, title, description, status, due_date, assignee_id, created_by)

Relationships:

- users <-> projects: many-to-many via project_members
- projects -> tasks: one-to-many

## Local Setup

### 1) Clone and install

- Backend:
  - cd backend
  - npm install
- Frontend:
  - cd frontend
  - npm install

### 2) Configure environment files

- Copy backend/.env.example to backend/.env and set:
  - PORT=5000
  - DATABASE_URL=your_postgres_connection_string
  - JWT_SECRET=strong_secret
  - CLIENT_URL=http://localhost:5173
  - NODE_ENV=development

- Copy frontend/.env.example to frontend/.env and set:
  - VITE_API_BASE_URL=http://localhost:5000/api

### 3) Initialize DB

- cd backend
- npm run db:init

### 4) Run apps

- Backend:
  - cd backend
  - npm run dev
- Frontend:
  - cd frontend
  - npm run dev

Frontend should run on http://localhost:5173 and backend on http://localhost:5000.

## REST API Overview

Base URL: /api

- Auth
  - POST /auth/signup
  - POST /auth/login
  - GET /auth/me
- Projects
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
- Tasks
  - GET /tasks/dashboard
  - PATCH /tasks/:id
  - DELETE /tasks/:id

## Railway Deployment Guide

Deploy as two services from the same repository:

### Backend Service (Node)

- Root directory: backend
- Build command: npm install
- Start command: npm start
- Environment variables:
  - DATABASE_URL=(Railway PostgreSQL connection string)
  - JWT_SECRET=(secure random secret)
  - CLIENT_URL=(frontend Railway URL)
  - NODE_ENV=production
  - PORT is injected by Railway automatically

Then run DB initialization once:

- Open Railway backend service shell and run:
  - npm run db:init

### Frontend Service (Static)

- Root directory: frontend
- Build command: npm install ; npm run build
- Publish directory: dist
- Environment variable:
  - VITE_API_BASE_URL=https://your-backend-service.up.railway.app/api

## Deliverables Checklist

- GitHub repository: push this full project to your repo
- README: included (this file)
- Live URL:
  - Frontend: https://frontend-production-fee1.up.railway.app
  - Backend: https://backend-production-15f09.up.railway.app
- Demo video (2-5 minutes):
  - Pending upload (record against deployed app and replace this line with the final video URL)

## Suggested Demo Script (2-5 min)

1. Show signup/login flow.
2. Create project and open it.
3. Add team member to project.
4. Create tasks with different statuses and due dates.
5. Assign tasks to members.
6. Show dashboard filters and overdue highlighting.
7. Quickly show Railway deployed URLs.
