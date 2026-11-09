# 🩺 GapFinder AI — "A Doctor for Studying"

> **Autonomous AI-Driven Learning Gap Diagnosis, Verified Grounded Quizzes, Deterministic Mastery Scoring, and Adaptive Revision Planning.**

GapFinder AI acts as a **"doctor for studying"**. Instead of just giving chat answers, the student uploads their syllabus, notes/textbook chapters, and past exam papers. The platform pinpoints what the student **does NOT know**, classifies topics into **Weak**, **Medium**, and **Strong** diagnostic tiers, and prescribes an **adaptive daily revision schedule** that dynamically re-allocates time after every re-test.

---

## ⚡ Core Diagnostic Loop

```
Upload Materials ➔ Topic Map (TOC + Exam Weights) ➔ Diagnostic Quiz ➔ Rubric Evaluation ➔ Gap Report ➔ Revision Plan ➔ Re-Test & Plan Auto-Updates
```

1. **Upload**: Drag-and-drop syllabus, notes/textbook chapters, and past papers (.pdf, .txt, .md). Chunks heading-aware with 15% sliding overlap and indexes with 768-dim vector embeddings + Postgres BM25 full-text search.
2. **Topic Map**: Hierarchical Tree of Units, Topics, and Subtopics. Links every past-paper question via hybrid retrieval and displays an interactive Exam-Frequency heat bar chart.
3. **Diagnostic Quiz**: Generates MCQs and short-answer questions **strictly grounded** in retrieved chunks. Every question includes difficulty labels and a verified source citation preview in a sliding side drawer.
4. **Answer Evaluation**: Instant grading for MCQs; short answers are graded using rubrics derived directly from textbook chunks with explanations citing source evidence.
5. **Gap Report (Main Output)**: Classifies every topic as **Weak** (&lt;50%, Red), **Medium** (50-79%, Yellow), or **Strong** (&ge;80%, Green). Calculates deterministic mastery scores, provides AI diagnosis reasons from mistakes, flags misconception tags, and ranks revision priority.
6. **Adaptive Revision Plan**: Deterministic Knapsack / Time-Binning scheduler allocates daily study hours based on Priority Score (`(100 - Mastery) * (ExamFrequency + 1)`). Concrete daily study tasks with source citations and completion checkboxes.
7. **Re-Test & Plan Updates**: Taking a new quiz recalculates mastery, updates the priority queue, and shifts remaining hours from mastered topics to remaining weak spots.

---

## 🏗️ AI & System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Next.js 15 App Router + Framer Motion)"]
        Dashboard["Dashboard & Onboarding Checklist"]
        MaterialsUI["Materials Ingestion & Parser Progress"]
        TopicMapUI["Topic Hierarchy & Exam Frequency Chart"]
        QuizUI["Diagnostic Quiz & Citation Side-Drawer"]
        GapReportUI["Gap Report Diagnosis (Weak / Med / Strong)"]
        RevisionPlanUI["Adaptive Knapsack Revision Scheduler"]
        ChatUI["Explain-This-Topic RAG Assistant"]
    end

    subgraph API ["Vercel Serverless API Routes"]
        Parser["Parser (unpdf / txt / md)"]
        Chunker["Heading-Aware Chunker (15% Overlap)"]
        HybridSearch["Hybrid Retriever (Vector + tsvector BM25)"]
        GroundingValidator["Citation & Grounding Validator"]
        MasteryEngine["Deterministic Mastery & Priority Formula"]
        GroqLLM["Groq AI SDK (Llama 3.3 70B & 3.1 8B with Fallback)"]
    end

    subgraph Database ["Persistent Neon PostgreSQL + pgvector"]
        Users[("users & sessions")]
        Materials[("materials")]
        Chunks[("chunks (vector(768) + tsvector)")]
        Topics[("topics & past_paper_questions")]
        Quizzes[("quizzes & attempts")]
        Mastery[("topic_mastery")]
        Plans[("revision_plans")]
    end

    Client --> API
    API --> Database
    HybridSearch --> GroqLLM
    GroqLLM --> GroundingValidator
    GroundingValidator --> Client
```

### Strict Separation: Retrieval vs. Generation
- **RETRIEVAL** decides what facts are allowed (returns chunks with UUIDs).
- **GENERATION** only writes using those chunks and must cite chunk IDs.
- **GROUNDING VALIDATOR** ensures every citation maps to an authentic chunk. Any claim that lacks textual backing or cites an invalid chunk is dropped or regenerated.
- **LOW-CONFIDENCE REFUSAL**: If hybrid retrieval score is below 0.25, the AI explicitly states: *"This isn't covered in your uploaded material."*

---

## 📐 Deterministic Mathematics & Formulas

### 1. Topic Mastery Formula
For any topic $t$, mastery $M(t) \in [0, 100]$ is computed as:
$$M(t) = \left( \frac{\sum_{i=1}^n w_{\text{diff}}(i) \cdot w_{\text{recency}}(i) \cdot S_i}{\sum_{i=1}^n w_{\text{diff}}(i) \cdot w_{\text{recency}}(i)} \right) \times C(n)$$

Where:
- $S_i \in \{0, 0.5, 1.0\}$: question score (incorrect, partial, correct).
- $w_{\text{diff}}(i)$: difficulty weight (Easy = 1.0, Medium = 1.3, Hard = 1.7).
- $w_{\text{recency}}(i) = e^{-\lambda (T_{\text{max}} - T_i)}$ ($\lambda = 0.25$): exponential decay prioritizing recent attempts.
- $C(n) = \min(1.0, \frac{n}{k_{\min}})$ ($k_{\min} = 3$): confidence penalty preventing over-confidence from 1 lucky guess.

**Classification Tiers:**
- **Weak (Red)**: $M(t) < 50\%$
- **Medium (Yellow)**: $50\% \le M(t) < 80\%$
- **Strong (Green)**: $M(t) \ge 80\%$

### 2. Priority Knapsack Revision Scheduling
$$\text{Priority}(t) = (100 - M(t)) \times (\text{ExamFrequency}(t) + 1)$$
Topics are bin-packed into daily study blocks ($\text{hours/day} \times \text{days available}$) prioritized by $\text{Priority}(t)$.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server Actions, TypeScript) |
| **Styling & UI** | Tailwind CSS v3, Framer Motion, Recharts, Lucide Icons |
| **LLM Inference** | Groq Provider via Vercel AI SDK (`llama-3.3-70b-versatile` & `llama-3.1-8b-instant` with automatic fallback to `openai/gpt-oss-120b`) |
| **Embeddings** | Google Gemini Embeddings (`gemini-embedding-001`, 768-dim) |
| **Database** | Neon Cloud PostgreSQL with `pgvector` & `tsvector` |
| **Document Parsing**| `unpdf` (Vercel Serverless & Edge optimized) |
| **Authentication** | Jose JWT session cookies + bcryptjs password hashing |
| **Testing** | Vitest unit tests for scoring, scheduler, chunker, grounding |

---

## 🔑 Pre-Seeded Demo Credentials

Judges and evaluators can test the complete app in under 2 minutes:
- **Email**: `demo@gapfinder.ai`
- **Password**: `Demo@1234`
- Click the **"Fill demo login"** button on the `/login` page for 1-click access!
- Click **"Load Sample Data (Class 10 Science)"** on the Dashboard to pre-populate syllabus, 3 chapters, past paper questions, past diagnostic attempts, gap report, and revision plan.

---

## 🚀 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jnaneswarnalla-ui/gapfinder-ai.git
   cd gapfinder-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create `.env.local`:
   ```env
   DATABASE_URL=postgresql://neondb_owner:password@ep-xxxx.neon.tech/neondb?sslmode=require
   GROQ_API_KEY=gsk_...
   GEMINI_API_KEY=AIzaSy...
   AUTH_SECRET=your_32_character_secret_key_here
   NEXTAUTH_SECRET=your_32_character_secret_key_here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run Database Migrations & Seed:**
   ```bash
   node scripts/migrate.mjs
   npx tsx scripts/run_seed.ts
   ```

5. **Run Unit Tests:**
   ```bash
   npm test
   ```

6. **Start Dev Server:**
   ```bash
   npm run dev
   ```

---

## 🚢 Deployment to Vercel

1. Push your code to GitHub.
2. Link your repository in Vercel or use Vercel CLI:
   ```bash
   npx vercel --prod
   ```
3. Set the production environment variables in the Vercel Dashboard:
   - `DATABASE_URL`
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - `AUTH_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

---

## 🔮 Limitations & Future Scope

- **Spaced-Repetition Notifications**: Web push & WhatsApp/Telegram reminders for tasks.
- **Parent & Tutor Portals**: Read-only diagnostic charts for parents to track progress.
- **Multi-Subject Expansion**: Switch between Science, Mathematics, History, and Competitive Exams.
- **LMS Integrations**: Canvas, Google Classroom, and Moodle gradebook sync.
