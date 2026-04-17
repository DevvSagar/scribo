

# Scribo


Scribo is an AI meeting summarization app that turns uploaded audio or video into transcripts, summaries, highlights, and action items. It now also includes a minimal full-stack authentication flow and per-user chat history.


## Overview

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#tech-stack)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](#tech-stack)
[![AI](https://img.shields.io/badge/AI-AssemblyAI-6C47FF?style=for-the-badge)](#tech-stack)
[![Styling](https://img.shields.io/badge/UI-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](#tech-stack)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-black?style=for-the-badge&logo=vercel)](#deployment)
[![Security](https://img.shields.io/badge/Security-Hardened-success?style=for-the-badge)](#security-features)

- Frontend: React + Vite + Tailwind CSS + Framer Motion
- Backend: Node.js + Express + MongoDB + Mongoose + Multer + Nodemailer
- AI processing: AssemblyAI
- Deployment target: Vercel for the client and Render for the server


## Features

- Upload `MP3`, `WAV`, `M4A`, and `MP4` meeting files
- Generate transcripts and AI summaries
- Sign up and log in with email + password
- Store the JWT in a secure `httpOnly` cookie after login
- Save user-specific chat history in MongoDB
- Switch between `Upload` and `History` inside the signed-in workspace
- Review formatted results in a dedicated results page
- Copy or download the generated summary
- Browse a pricing/features page for plan comparison
- Send inquiries through the contact form
- Includes backend protections like `helmet`, rate limiting, upload validation, and token-based upload access

## Project Structure

```text
ai-meeting-app/
├── client/    # React + Vite frontend
└── server/    # Express API
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/DevvSagar/ai-meeting-app.git
cd ai-meeting-app
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment variables

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5001
VITE_UPLOAD_TOKEN=your_secure_upload_token_here
```

Create `server/.env`:

```env
ASSEMBLY_API_KEY=your_assemblyai_api_key_here
UPLOAD_ACCESS_TOKEN=your_secure_upload_token_here
MONGODB_URI=mongodb://127.0.0.1:27017/scribo
JWT_SECRET=replace_with_a_long_secret_key
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
PORT=5001
NODE_ENV=development
MAX_AUDIO_UPLOAD_SIZE_MB=250
MAX_VIDEO_UPLOAD_SIZE_MB=100
```

### 5. Start MongoDB

Make sure MongoDB is running locally before starting the backend.

### 6. Start the backend

```bash
cd server
npm run dev
```

### 7. Start the frontend

```bash
cd client
npm run dev
```

The app will run on `http://localhost:5173` and the API will run on `http://localhost:5001`.

## Auth And Chat Endpoints

- `POST /signup` with `email` and `password`
- `POST /login` with `email` and `password`
- `POST /logout` to clear the auth cookie
- `GET /me` to restore the signed-in session
- `POST /chat` using the auth cookie
- `GET /chats` using the auth cookie

## App Flow

1. Open the frontend.
2. Upload an audio or video file from the app page.
3. The backend validates the file and forwards it to AssemblyAI.
4. Scribo returns the transcript and summary.
5. Review, copy, or download the result.

## Security Notes

- `helmet` for safer HTTP headers
- `cors` restricted by configured frontend URL with credentials enabled
- Rate limiting on auth and API routes
- JWT stored in an `httpOnly` cookie instead of `localStorage`
- Email and password validation for signup and login
- Request sanitizing to reduce NoSQL injection risk
- File type and file size validation
- Upload token check via `x-upload-token`
- SSRF protection when handling external URLs from AssemblyAI

## Deployment

- Client: Vercel
- Server: Render

## Author

Sagar Pratap Singh (Devvx)

- GitHub: [DevvSagar](https://github.com/DevvSagar)
- LinkedIn: [devvsag](https://www.linkedin.com/in/devvsag)


## Screenshots

### Home

![Scribo home screen](client/src/assets/Home.png)

### Upload

![Scribo upload screen](client/src/assets/upload.png)

### Results

![Scribo result screen](client/src/assets/result.png)

### Features

![Scribo pricing and features screen](client/src/assets/features.png)

### Contact

![Scribo contact screen](client/src/assets/contact.png)
