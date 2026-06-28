# 🚀 Learnify – AI-Powered Learning Management System

> **An intelligent, full-stack Learning Management System (LMS) built with Django REST Framework and React, designed for project-based coding education, interactive tutorials, AI-assisted learning, and automated content management.**




\

---

# 📚 Table of Contents

* [About the Project](#-about-the-project)
* [Key Features](#-key-features)
* [Technology Stack](#-technology-stack)
* [Project Architecture](#-project-architecture)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)

  * [Prerequisites](#prerequisites)
  * [Backend Setup](#backend-setup)
  * [Frontend Setup](#frontend-setup)
* [Environment Variables](#-environment-variables)
* [API Endpoints](#-core-api-endpoints)
* [Future Improvements](#-future-improvements)
* [License](#-license)

---

# 📖 About the Project

Learnify is a modern, AI-powered Learning Management System that transforms traditional programming tutorials into an interactive learning experience.

Learnify offers:

* 📚 Structured learning paths
* 🤖 AI-powered explanations
* 📈 Progress tracking
* 🕷 Automated content scraping
* 🔍 Intelligent search
* 💻 Responsive modern interface
* 🤖Activity based recommendation

The platform follows a hierarchical course structure:

```
Category
   └── Subcategory
          └── Course
                 └── Topics
```

Students can learn through interactive lessons, track their progress, receive personalized recommendations, and instantly ask the built-in AI tutor for explanations.

---

# ✨ Key Features

## 🔐 Secure Authentication

* User Registration
* Login
* Email Verification
* Password Reset
* Email OTP Verification
* Django Token Authentication

---

## 🤖 AI-Powered Learning Assistant

Built using **OpenRouter LLM API**.

Features include:

* Floating AI chatbot
* Explain highlighted lesson text
* Context-aware conversations
* Chat history support
* Programming explanations
* Code understanding

---

## 🕷 Automated Course Scraper

Automatically imports educational content from external tutorial websites using:

* BeautifulSoup4
* Requests

The scraper can extract:

* Articles
* Code snippets
* Syntax-highlighted examples
* Course hierarchy

---

## 📈 Learning Progress Tracking

Track learning progress at topic level.

Features:

* Topic completion
* Course completion percentage
* Learning history
* Personalized recommendations
* Dashboard analytics

---

## 🔍 Smart Search Engine

Backend search system powered by Django ORM.

Supports searching across:

* Categories
* Subcategories
* Courses
* Topics

Uses Django **Q Objects** for flexible fuzzy searching.

---

## 📱 Responsive User Interface

Single Page Application built with React.

Features:

* Responsive design
* Modern UI
* Fast navigation
* React Router
* React Bootstrap
* Mobile-friendly layout

---

# 🛠 Technology Stack

## Backend

| Technology            | Purpose              |
| --------------------- | -------------------- |
| Python 3.10+          | Programming Language |
| Django 5.2            | Backend Framework    |
| Django REST Framework | REST APIs            |
| SQLite3               | Database             |
| BeautifulSoup4        | Web Scraping         |
| Requests              | HTTP Requests        |
| OpenRouter API        | AI Integration       |
| OpenAI Python SDK     | AI Client            |
| Django CKEditor       | Rich Text Editor     |
| Django Admin          | CMS & Administration |
| Django Crontab        | Scheduled Tasks      |

---

## Frontend

| Technology       | Purpose            |
| ---------------- | ------------------ |
| React 18         | UI Framework       |
| Vite             | Build Tool         |
| React Router DOM | Routing            |
| Axios            | API Communication  |
| React Bootstrap  | UI Components      |
| React Markdown   | Markdown Rendering |
| Custom CSS       | Styling            |

---

# 🏗 Project Architecture

Learnify follows a **decoupled client-server architecture**.

```
                 React (Frontend)
                        │
                  Axios Requests
                        │
                        ▼
        Django REST Framework API
                        │
        ┌───────────────┼───────────────┐
        │               │               │
 Authentication     Course APIs      AI APIs
        │               │               │
        └───────────────┼───────────────┘
                        │
                  SQLite Database
```

---

# 📁 Project Structure

```
Learnify
│
├── backend/
│   ├── accounts/
│   ├── courses/
│   │   ├── scraper/
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── models.py
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   └── frontend/
│       ├── src/
│       ├── components/
│       ├── pages/
│       ├── axiosConfig.js
│       └── App.jsx
│
└── README.md
```

---

# 📡 Core API Endpoints

| Method | Endpoint                        | Description                  | Authentication |
| ------ | ------------------------------- | ---------------------------- | -------------- |
| POST   | `/api/auth/send-register-otp/`  | Send registration OTP        | ❌              |
| POST   | `/api/auth/register/`           | Register new user            | ❌              |
| POST   | `/api/auth/login/`              | User login                   | ❌              |
| GET    | `/api/courses/`                 | List all courses             | ❌              |
| GET    | `/api/courses/recommendations/` | Personalized recommendations | ✅              |
| POST   | `/api/ai/explain/`              | AI explanation endpoint      | ❌              |
| POST   | `/api/progress/`                | Update learning progress     | ✅              |
| GET    | `/api/search/?q=`               | Global search                | ❌              |

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

It helps others discover the project and motivates future development.

---

**Built with ❤️ using Django, Django REST Framework, React, and AI.**
