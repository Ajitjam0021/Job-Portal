# Backend Architecture & Team Workflow

## 🚀 The "One Feature, One Folder" Rule

To allow 6 developers to work on the same branch without conflicts, we have adopted a **Feature-Based Architecture**.

### 📂 Directory Structure

```
backend/
├── features/
│   ├── auth/          <-- Team Member A (Login, Signup, User Model)
│   ├── jobs/          <-- Team Member B (Job Posting, Listing)
│   ├── applications/  <-- Team Member C (Applying, Resume)
│   ├── profile/       <-- Team Member D (Employer/Candidate Profiles)
│   ├── dashboard/     <-- Team Member E (Stats, Analytics)
│   ├── search/        <-- Team Member F (Search, Filtering)
│
├── index.js           <-- MAIN CONNECTION POINT (Do not edit often)
└── middleware/        <-- Shared utilities
```

### ⚠️ Rules for Developers

1.  **Stay in your Lane**: If you are working on "Jobs", you should **ONLY** edit files inside `features/jobs/`.
2.  **No Global Edits**: Avoid changing `index.js` or `middleware` unless absolutely necessary.
3.  **Routes are Pre-Connected**: The main `index.js` is already wired up to your feature routes.
    - Auth Routes -> `/api/auth`
    - Job Routes -> `/api/jobs`
    - etc.
    
    You just need to define your routes inside `features/YOUR_FEATURE/your.routes.js`.

### 🔗 The "Main Connection"
The file `backend/index.js` acts as the traffic controller. It imports your isolated routes and connects them to the server. Segregation is complete.
