<div align="center">

# ⬡ SKILL_CORE_OS

### Futuristic Role-Based Skill Assessment Platform

[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Powered by Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-9d9bf2?style=flat-square)](LICENSE)

<br/>

*A command-center inspired assessment platform with distinct dashboards for Students, Instructors, and Admins — built for organizations that take skill evaluation seriously.*

<br/>

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   SYSTEM_STATUS: ● OPERATIONAL    UPTIME: 99.998%            ║
║   PROTOCOL: SKILL_CORE_OS V4.0.2                            ║
║   ENCRYPTION: TLS_1.3_AES_256                                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

</div>

---

## ◈ Overview

**SKILL_CORE_OS** is not your typical LMS. It's a premium, futuristic assessment platform designed with a **command-center aesthetic** — think mission control meets modern SaaS. Every pixel is intentional. Every interaction feels deliberate.

The platform supports **three distinct user roles**, each with their own dashboard, workflows, and data views — all powered by **Supabase** for real-time authentication, database, and row-level security.

<br/>

## ◈ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   SKILL_CORE_OS                     │
├─────────────┬─────────────┬─────────────────────────┤
│  STUDENT    │ INSTRUCTOR  │        ADMIN            │
│  Dashboard  │  Dashboard  │      Dashboard          │
│             │             │                         │
│ • Take      │ • Create    │ • Manage users          │
│   tests     │   courses   │ • Platform analytics    │
│ • View      │ • Author    │ • Role management       │
│   scores    │   questions │ • Global oversight      │
│ • Track     │ • Assign    │                         │
│   progress  │   students  │                         │
│             │ • Analytics │                         │
├─────────────┴─────────────┴─────────────────────────┤
│               React + TypeScript + Vite              │
├─────────────────────────────────────────────────────┤
│              Supabase (Auth · DB · RLS)              │
├─────────────────────────────────────────────────────┤
│                    PostgreSQL                        │
└─────────────────────────────────────────────────────┘
```

<br/>

## ◈ Features

### 🔐 Authentication & Access Control
- Role-based signup — choose **Student**, **Instructor**, or **Admin** at registration
- Automatic profile creation via database triggers
- Session persistence with Supabase Auth
- Row-Level Security (RLS) on all tables

### 📊 Student Dashboard
| Feature | Description |
|---------|-------------|
| **Assessment Queue** | View all assigned assessments with status indicators |
| **Test Taking** | Interactive MCQ interface with instant scoring |
| **Score History** | Complete attempt history with pass/fail tracking |
| **Performance Analytics** | Avg score, pass rate, and historical trends |

### 🎯 Instructor Dashboard
| Feature | Description |
|---------|-------------|
| **Course Management** | Create and organize course modules |
| **Assessment Builder** | Author assessments with multiple-choice questions |
| **Question Bank** | Add questions with 4 options and correct answer marking |
| **Student Assignment** | Assign assessments to individual students |
| **Live Monitoring** | Track completion rates and student progress |
| **Weak Area Detection** | Identify most-missed questions across assessments |

### ⚡ Admin Dashboard
| Feature | Description |
|---------|-------------|
| **User Directory** | View and filter all registered users |
| **Role Management** | Promote/demote users between roles via dropdown |
| **Platform Analytics** | Global view of all assessments and performance |
| **System Stats** | Real-time counts of users, courses, and deployments |

<br/>

## ◈ Design Philosophy

```
DESIGN_PROTOCOL: COMMAND_CENTER_AESTHETIC
├── Dark-first color system (#0a0a0c → #121216 → #1a1a20)
├── Accent palette: Purple (#9d9bf2) · Teal (#2dd4bf) · Red (#f87171)
├── Typography: Inter (sans) + JetBrains Mono (mono)
├── Subtle grid background pattern
├── Glow effects on interactive elements
├── Status badges with colored dot indicators
├── Monospace labels with uppercase tracking
└── Zero placeholder content — all data is real
```

The interface is inspired by **military command systems**, **sci-fi terminals**, and **premium SaaS products** — creating something that feels like a high-end operational tool rather than a generic learning management system.

<br/>

## ◈ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Component architecture |
| **Bundler** | Vite | Fast HMR and builds |
| **Styling** | Vanilla CSS | Custom design system, no framework bloat |
| **Icons** | Lucide React | Clean, consistent iconography |
| **Auth** | Supabase Auth | Email/password with metadata |
| **Database** | Supabase (PostgreSQL) | Relational data with RLS |
| **Fonts** | Inter + JetBrains Mono | Premium typography via Google Fonts |

<br/>

## ◈ Database Schema

```sql
profiles          ──┐
                    ├── courses ──── assessments ──── questions ──── question_options
                    │                    │
organizations ─────┘                    │
                                        ├── assignments
                                        │
                                        └── assessment_attempts ──── attempt_answers
```

**9 core tables** with full foreign key constraints, UUID primary keys, enum types for roles and statuses, and a trigger that auto-creates user profiles on signup.

All migration files are in [`supabase/migrations/`](supabase/migrations/).

<br/>

## ◈ Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone & Install

```bash
git clone https://github.com/your-username/skill-core-os.git
cd skill-core-os
npm install
```

### 2. Configure Supabase

Update `src/lib/supabase.ts` with your project URL and anon key:

```typescript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
```

### 3. Initialize Database

Run the SQL files in your Supabase SQL Editor **in order**:

```
supabase/migrations/01_schema.sql        ← Tables & enums
supabase/migrations/02_rls_and_trigger.sql ← RLS policies & auth trigger
```

> If you already ran the schema but signup fails, run `03_fix_trigger.sql` to patch the auth trigger.

### 4. Launch

```bash
npm run dev
```

Open **http://localhost:5173** and register your first user.

<br/>

## ◈ Project Structure

```
src/
├── lib/
│   └── supabase.ts              # Supabase client initialization
├── components/
│   └── Layout.tsx               # Shared sidebar + header shell
├── pages/
│   ├── Login.tsx                # Auth portal with role selection
│   ├── DashboardRouter.tsx      # Role-based dashboard routing
│   ├── StudentDashboard.tsx     # Student shell
│   ├── InstructorDashboard.tsx  # Instructor shell
│   ├── AdminDashboard.tsx       # Admin shell
│   ├── student/
│   │   ├── StudentHome.tsx      # Dashboard overview
│   │   ├── StudentAssessments.tsx # Test-taking interface
│   │   └── StudentAnalytics.tsx # Score history
│   ├── instructor/
│   │   ├── InstructorHome.tsx   # Dashboard overview
│   │   ├── CoursesPage.tsx      # Course CRUD
│   │   ├── AssessmentsPage.tsx  # Assessment + question builder
│   │   ├── AnalyticsPage.tsx    # Performance analytics
│   │   └── ArchivePage.tsx      # Historical records
│   └── admin/
│       ├── AdminHome.tsx        # Command center overview
│       ├── AdminRoles.tsx       # User management
│       └── AdminAnalytics.tsx   # Platform-wide analytics
├── index.css                    # Design system & global styles
├── App.tsx                      # Auth routing
└── main.tsx                     # Entry point

supabase/
└── migrations/
    ├── 01_schema.sql            # Tables, enums, constraints
    ├── 02_rls_and_trigger.sql   # RLS policies & auth trigger
    └── 03_fix_trigger.sql       # Trigger bugfix (if needed)
```

<br/>

## ◈ User Flow

```
                    ┌──────────────┐
                    │  LOGIN PAGE  │
                    │              │
                    │ ┌──┬──┬───┐ │
                    │ │ST│IN│ADM│ │  ← Role selection
                    │ └──┴──┴───┘ │
                    │  [SIGN UP]  │
                    │  [LOG IN]   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌─────────────┐ ┌──────────┐ ┌──────────┐
     │   STUDENT   │ │INSTRUCTOR│ │  ADMIN   │
     │  Dashboard  │ │Dashboard │ │Dashboard │
     ├─────────────┤ ├──────────┤ ├──────────┤
     │ Assessments │ │ Courses  │ │  Users   │
     │ Take Tests  │ │ Build Qs │ │  Roles   │
     │ View Scores │ │ Assign   │ │ Analytics│
     │ Analytics   │ │ Monitor  │ │ Overview │
     └─────────────┘ └──────────┘ └──────────┘
```

<br/>

## ◈ Deployment

Build for production:

```bash
npm run build
```

The output in `dist/` can be deployed to any static hosting:
- **Vercel** — `vercel --prod`
- **Netlify** — drag & drop the `dist/` folder
- **GitHub Pages** — configure base path in `vite.config.ts`

<br/>

## ◈ Roadmap

- [ ] Timer-based test sessions with auto-submit
- [ ] Rich text / code-block question types
- [ ] Dark/Light theme toggle
- [ ] Real-time notifications via Supabase Realtime
- [ ] Organization / multi-tenant support
- [ ] CSV bulk import for students and questions
- [ ] Assessment scheduling and due dates
- [ ] Detailed per-question analytics with charts
- [ ] Google & GitHub OAuth login

<br/>

---

<div align="center">

```
AUTHORIZED ACCESS ONLY. ALL CONNECTIONS ARE LOGGED AND MONITORED.
© 2024 SKILL_CORE_OS — PRECISION INSTRUMENT SYSTEMS
```

**Built with obsessive attention to detail.**

[Report Bug](../../issues) · [Request Feature](../../issues)

</div>
