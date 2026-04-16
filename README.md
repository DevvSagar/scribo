# Scribo

> AI-powered meeting summarization SaaS that turns audio and video recordings into transcripts, summaries, key points, and action items.

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#tech-stack)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](#tech-stack)
[![AI](https://img.shields.io/badge/AI-AssemblyAI-6C47FF?style=for-the-badge)](#tech-stack)
[![Styling](https://img.shields.io/badge/UI-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](#tech-stack)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-black?style=for-the-badge&logo=vercel)](#deployment)
[![Security](https://img.shields.io/badge/Security-Hardened-success?style=for-the-badge)](#security-features)

## 🌐 Live Demo

- Frontend: [https://scribo-five.vercel.app](https://scribo-five.vercel.app)
- Backend: `Render deployment URL here`

## 📸 Screenshots

> Replace these with real product screenshots.

- `docs/screenshots/home.png` — Landing page
- `docs/screenshots/upload.png` — Upload workflow
- `docs/screenshots/result.png` — AI summary result view
- `docs/screenshots/features.png` — Pricing / feature comparison
- `docs/screenshots/contact.png` — Contact page

## ✨ Features

- Upload audio/video meeting files
- Generate AI transcripts and summaries
- Extract important points and action items
- Modern SaaS-style UI built with React + Tailwind
- Feature / pricing comparison page
- Contact form with Nodemailer integration
- Mock authentication flow using `localStorage`
- Planned Google OAuth integration
- Production-minded backend validation and security controls

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Framer Motion

### Backend
- Node.js
- Express
- Multer
- Nodemailer
- Validator
- Express Rate Limit
- Helmet
- CORS

### AI
- AssemblyAI

### Database
- MongoDB

### Deployment
- Vercel for frontend
- Render for backend

## 🧩 Architecture Overview

```text
React Frontend (Vercel)
        ↓
Express API (Render)
        ↓
AssemblyAI API
        ↓
MongoDB
```

### Flow
1. User uploads an audio/video meeting file.
2. Frontend sends the file to the Express backend.
3. Backend validates and secures the upload.
4. Backend forwards media to AssemblyAI for transcription + summarization.
5. Processed transcript, summary, highlights, and action items are returned to the client.
6. Meeting/user records can be persisted in MongoDB.

## 🔐 Security Features

Security was treated as a core part of the project, not an afterthought.

- `Helmet` for secure HTTP headers
- Strict `CORS` configuration limited to the frontend domain
- Rate limiting on sensitive API routes
- Input validation and sanitization using `validator`
- Secure file upload checks:
  - allowed MIME types
  - allowed extensions
  - file size validation
- SSRF protection for external API requests
- Token-based protection on upload route via `x-upload-token`
- Environment-variable based secret management
- Safer backend error handling without leaking internals

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/scribo.git
cd scribo
```

### 2. Frontend setup

```bash
cd client
npm install
npm run dev
```

### 3. Backend setup

```bash
cd server
npm install
npm run dev
```

## 🔧 Environment Variables

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5001
VITE_UPLOAD_TOKEN=your_secure_upload_token_here
```

### Backend `.env`

```env
ASSEMBLY_API_KEY=your_assemblyai_api_key
UPLOAD_ACCESS_TOKEN=your_secure_upload_token_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
FRONTEND_URL=http://localhost:5173
PORT=5001
NODE_ENV=development
MAX_AUDIO_UPLOAD_SIZE_MB=250
MAX_VIDEO_UPLOAD_SIZE_MB=100
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_if_added_later
```

## 📘 Usage Guide

1. Start the frontend and backend locally.
2. Open the frontend in your browser.
3. Upload an audio or video meeting file.
4. Wait for Scribo to process the file with AI.
5. Review:
   - transcript
   - summary
   - key points
   - action items
6. Use the contact page for inquiries or project communication.

## 🧠 Future Improvements

- Real authentication and session management
- Google OAuth integration
- S3 / Cloudinary media storage
- Background job queues for long-running transcription tasks
- Webhook-based AssemblyAI processing
- Meeting history dashboard
- User accounts and saved summaries
- Team workspaces
- Billing / subscriptions
- Admin analytics panel

## 🚢 Deployment

### Frontend
- Hosted on **Vercel**
- Optimized for static React deployment

### Backend
- Hosted on **Render**
- Handles uploads, AI processing, validation, email, and API security

### Recommended Production Setup
- Vercel for client
- Render for Express API
- MongoDB Atlas for database
- AssemblyAI for transcription/summarization
- Environment variables managed per platform

## 👤 Author

**Your Name**  
Full-Stack Developer

- GitHub: [https://github.com/your-username](https://github.com/your-username)
- LinkedIn: [https://linkedin.com/in/your-profile](https://linkedin.com/in/your-profile)

## 📄 License

This project is licensed under the **MIT License**.