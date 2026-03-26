> 🚧 **Under Active Development**  
> This project is continuously evolving with new features, performance improvements, and production-level enhancements.

# 🚀 Scribo – AI-Powered Meeting Intelligence Platform

Scribo is a full-stack web application that transforms meeting recordings into structured, actionable insights using AI. It enables users to upload audio/video files and instantly receive accurate transcripts along with intelligent summaries.

> Built with a focus on **security, performance, and real-world production practices**.

---

## ✨ Key Features

* 🎙️ Upload and process audio/video files (MP3, WAV, M4A, MP4)
* 🧠 AI-powered transcription using AssemblyAI
* ✍️ Automatic meeting summaries and insights
* ⚡ Clean and responsive UI for seamless experience
* 🔐 Secure backend (rate limiting, sanitization, SSRF protection)
* 📊 Structured result flow for transcripts and summaries

---

## 🧠 Problem It Solves

Meetings often generate valuable information that is difficult to track manually. Scribo automates:

* Note-taking
* Key insight extraction
* Time-consuming transcription

👉 Helping users focus on **decision-making instead of documentation**

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS

### Backend

* Node.js
* Express.js

### AI Integration

* AssemblyAI API

---

## 🔐 Security & Best Practices

* Environment-based secret management
* Input validation and sanitization
* Rate limiting and request protection
* CORS configuration for controlled access
* No client-side persistence of sensitive data

---

## 📁 Project Structure

ai-meeting-app/
├── client/   # Frontend (React + Vite)
├── server/   # Backend (Node + Express)
└── .gitignore

---

## ⚙️ Local Setup

### 1. Clone repository

git clone https://github.com/DevvSagar/scribo.git

### 2. Install dependencies

Frontend:
cd client && npm install

Backend:
cd server && npm install

### 3. Run the app

Backend:
node index.js

Frontend:
npm run dev

---

## 🔐 Environment Variables

Create a `.env` file inside `/server`:

ASSEMBLY_API_KEY=your_api_key
FRONTEND_URL=http://localhost:5173
PORT=5001

---

## 📈 Future Improvements

* User authentication & saved meeting history
* Real-time transcription support
* Team collaboration features
* Cloud storage integration

---

## 👨‍💻 Author

**Sagar Pratap Singh (DevvSagar)**
Full Stack Developer | Building AI-powered applications

---

## ⭐ Show Your Support

If you found this project useful, consider giving it a ⭐ on GitHub!
