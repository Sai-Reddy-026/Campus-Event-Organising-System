# 🎓 College Event Management System

A full-stack, production-level college event management portal with session-based authentication, role-based dashboards, and a glassmorphism UI.

## 🛠 Tech Stack

### Frontend
- **React 18** (Vite)
- **Framer Motion** - Smooth animations
- **Chart.js** (react-chartjs-2) - Analytics charts
- **FullCalendar** - Event calendar
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icon library

### Backend
- **Express.js** - REST API
- **MongoDB** (Mongoose) - Database
- **express-session** + connect-mongo - Session-based auth
- **bcryptjs** - Password hashing
- **pdfkit** - PDF letter generation
- **qrcode** - QR code generation

---

## 📁 Project Structure

```
mani/
├── backend/
│   ├── server.js              # Express server entry
│   ├── seed.js                # Database seeder
│   ├── .env                   # Environment variables
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js            # Session auth middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   └── Notification.js
│   └── routes/
│       ├── auth.js            # Signup/Login/Logout
│       ├── events.js          # Event CRUD
│       ├── registrations.js   # Registration workflow
│       ├── notifications.js   # User notifications
│       ├── analytics.js       # Dashboard stats
│       └── letters.js         # PDF generation
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx            # Router & providers
        ├── index.css          # Global styles
        ├── services/
        │   └── api.js         # Axios instance
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── components/
        │   ├── ProtectedRoute.jsx
        │   ├── EventCard.jsx / .css
        │   └── layout/
        │       ├── Sidebar.jsx / .css
        │       ├── Navbar.jsx / .css
        │       └── DashboardLayout.jsx / .css
        └── pages/
            ├── auth/
            │   ├── Login.jsx
            │   ├── Signup.jsx
            │   └── Auth.css
            ├── student/
            │   ├── StudentDashboard.jsx / .css
            │   ├── Hackathons.jsx
            │   ├── Games.jsx
            │   ├── Celebrations.jsx
            │   ├── Letters.jsx / .css
            │   ├── StudentCalendar.jsx / .css
            │   └── EventPages.css
            └── admin/
                ├── AdminDashboard.jsx / .css
                ├── AdminEvents.jsx / .css
                ├── AdminApprovals.jsx
                └── AdminAnalytics.jsx
```

---

## 🚀 How to Run

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally on port 27017

### 1. Start MongoDB
```bash
mongod
```

### 2. Setup Backend
```bash
cd backend
npm install
npm run seed    # Seed database with sample data
npm run dev     # Start server on port 5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev     # Start on port 5173
```

### 4. Open in Browser
```
http://localhost:5173
```

---

## 🔐 Demo Credentials

| Role    | Email              | Password    |
|---------|-------------------|-------------|
| Admin   | admin@college.edu | admin123    |
| Student | rahul@student.edu | student123  |
| Student | priya@student.edu | student123  |
| Student | amit@student.edu  | student123  |

---

## ✨ Features

- ✅ Session-based authentication (NOT JWT)
- ✅ Role-based protected routes (Student / Admin)
- ✅ Professional glassmorphism UI with blue theme
- ✅ Dark/Light mode toggle
- ✅ FullCalendar with approved events
- ✅ Chart.js analytics (Bar, Pie, Line)
- ✅ Event registration with admin approval workflow
- ✅ QR code generation on approval
- ✅ PDF letter generation with pdfkit
- ✅ Hackathons, Games, Celebrations pages
- ✅ Slot-based registration system
- ✅ Live seat counter
- ✅ Real-time notifications
- ✅ Fully responsive design
- ✅ Framer Motion animations
