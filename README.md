# NeuroGuide-AI

> An AI-powered research companion for machine learning practitioners — featuring research paper discovery, dataset auditing, and production-ready ML code generation.

![NeuroGuide OG Image](public/og-image.png)

## 🎯 What is NeuroGuide?

NeuroGuide is an intelligent assistant designed to help ML practitioners navigate the complex landscape of machine learning research and implementation. Whether you're a researcher exploring new techniques, a startup building ML products, or a learner diving into the field, NeuroGuide provides contextual guidance throughout your ML journey.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Dashboard  │  │   Projects  │  │    Chat     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                            Backend                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Multi-Agent Orchestration Layer            │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │    │
│  │  │  Router  │ │  Data    │ │  Scholar │ │   Code   │    │    │
│  │  │  Agent   │ │ Engineer │ │  Agent   │ │Generator │    │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │    │
│  │                      ┌──────────┐                       │    │
│  │                      │  Critic  │                       │    │
│  │                      │  Agent   │                       │    │
│  │                      └──────────┘                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                  │
│  ┌───────────────────────────┴───────────────────────────┐      │
│  │                    Edge Functions                     │      │
│  │  • Chat API (streaming responses)                     │      │
│  │  • Agent orchestration                                │      │
│  │  • External API integrations                          │      │
│  └───────────────────────────────────────────────────────┘      │
│                              │                                  │
│  ┌───────────────────────────┴───────────────────────────┐      │
│  │              PostgreSQL Database                      │      │
│  │  • User profiles & preferences                        │      │
│  │  • Projects & conversations                           │      │
│  │  • Message history with metadata                      │      │
│  │  • Row Level Security (RLS) policies                  │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Multi-Agent System

The core intelligence of NeuroGuide is powered by a collaborative multi-agent architecture:

| Agent | Role | Description |
|-------|------|-------------|
| **Router Agent** | Intent Classification | Analyzes user queries and routes them to the appropriate specialist agent |
| **Data Engineer** | Dataset Auditing | Detects issues like class imbalance, data leakage, missing values, and outliers |
| **Scholar Agent** | Research Discovery | Retrieves papers from Semantic Scholar, ArXiv, and Papers with Code |
| **Code Generator** | Implementation | Generates production-ready ML code with safety checks and best practices |
| **Critic Agent** | Quality Assurance | Reviews all agent outputs for accuracy, completeness, and quality |

### AI Models Used
- **Claude Sonnet 4.5** — Complex reasoning and research tasks
- **Claude Haiku 4** — Rapid intent routing and classification

---

## 🗄️ Database Schema

The application uses PostgreSQL with the following schema:

### Tables

#### `profiles`
Stores user information and preferences.
```sql
- id (uuid, PK)
- email (text, required)
- full_name (text)
- avatar_url (text)
- goal (text) -- 'research' | 'startup' | 'learning'
- onboarding_completed (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `projects`
ML projects with lifecycle tracking.
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles)
- title (text, required)
- description (text)
- status (text) -- 'ideation' | 'data_audit' | 'modeling' | 'completed'
- health_score (integer, 0-100)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `conversations`
Chat sessions linked to projects.
```sql
- id (uuid, PK)
- project_id (uuid, FK → projects)
- user_id (uuid, FK → profiles)
- title (text)
- created_at (timestamp)
```

#### `messages`
Individual messages with rich metadata.
```sql
- id (uuid, PK)
- conversation_id (uuid, FK → conversations)
- role (text) -- 'user' | 'assistant' | 'system'
- content (text)
- metadata (jsonb) -- citations, code blocks, data issues
- created_at (timestamp)
```

### Security
All tables are protected with **Row Level Security (RLS)** policies ensuring users can only access their own data.

---

## 🔧 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | Component library |
| **React Router** | Client-side routing |
| **TanStack Query** | Data fetching & caching |
| **React Hook Form** | Form management |
| **Zod** | Schema validation |

### Backend 
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | Primary database |
| **Edge Functions (Deno)** | Serverless API endpoints |
| **Supabase Auth** | Authentication |
| **RLS Policies** | Data security |

---

## 📁 Project Structure

```
neuroguide/
├── public/                    # Static assets
│   ├── og-image.png          # Social sharing image
│   ├── robot.txt
│   ├── placeholder.svg 
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── chat/             # Chat interface components
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── layout/           # Layout components
│   │   ├── ui/               # shadcn/ui components
│   │   └──NavLink.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx    # Responsive utilities
│   │   ├── use-toast.ts
│   │   ├── useAuth.tsx       # Authentication hook
│   │   ├── useChat.ts        # Chat functionality
│   │   └── useProjects.ts    # Project CRUD operations
│   ├── integrations/
│   │   └── supabase/         # Supabase client & types
│   ├── pages/                # Route components
│   ├── types/                # TypeScript interfaces
│   ├── lib/                  # Utility functions
│   ├── test/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── supabase/
│   ├── functions/
│   │   └── chat/             # Chat Edge Function
│   ├──migrations/            # Database, sql files
│   └── config.toml           # Supabase configuration
├── .env                      
├── .gitignore
├── README.md
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
├── vite.config.ts
└── vitest.config.ts

```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/nabakrishna/neuroguide-ai.git
cd neuroguide-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=""
VITE_SUPABASE_PUBLISHABLE_KEY=""
VITE_SUPABASE_PROJECT_ID=""
```

---

## 📡 API Endpoints

### Chat API
`POST /functions/v1/chat`

Handles streaming chat responses with multi-agent orchestration.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "How do I handle class imbalance?" }
  ]
}
```

**Response:** Server-Sent Events (SSE) stream with delta content.

---

## 🔐 Authentication(now it is on simple sign in/up method)

The app uses Supabase Auth with:
- Email/password authentication
- Session persistence
- Protected routes
- Automatic token refresh

---

## 📊 Features

### 1. Research Paper Discovery
- Search across Semantic Scholar, ArXiv, and Papers with Code
- Citation extraction and formatting
- Abstract summarization

### 2. Dataset Auditing
Automatically detects:
- ⚠️ Class imbalance
- 🔴 Data leakage
- ❓ Missing values
- 📊 Outliers
- 🔄 Duplicate rows

### 3. ML Code Generation
- Production-ready implementations
- Best practices and safety checks
- Multiple framework support (PyTorch, TensorFlow, scikit-learn)

### 4. Project Lifecycle
```
Ideation → Data Audit → Modeling → Completed
```
With health score tracking (0-100) for each project.

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test -- --coverage
```

---

## 📦 Deployment

Demo live on: https://neuroguide-ai.vercel.app/

---


## still in devlopment

