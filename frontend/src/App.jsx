/**
 * App Component - Main Router
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import Hackathons from './pages/student/Hackathons';
import HackathonEvents from './pages/student/HackathonEvents';
import Games from './pages/student/Games';
import GameEvents from './pages/student/GameEvents';
import Celebrations from './pages/student/Celebrations';
import Letters from './pages/student/Letters';
import StudentCalendar from './pages/student/StudentCalendar';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminAnalytics from './pages/admin/AdminAnalytics';

const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px'
                            }
                        }}
                    />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />

                        {/* Student Routes */}
                        <Route path="/student" element={
                            <ProtectedRoute role="student">
                                <DashboardLayout />
                            </ProtectedRoute>
                        }>
                            <Route path="dashboard" element={<StudentDashboard />} />
                            <Route path="hackathons" element={<Hackathons />} />
                            <Route path="hackathons/:collegeType" element={<HackathonEvents />} />
                            <Route path="games" element={<Games />} />
                            <Route path="games/:collegeType" element={<GameEvents />} />
                            <Route path="celebrations" element={<Celebrations />} />
                            <Route path="letters" element={<Letters />} />
                            <Route path="calendar" element={<StudentCalendar />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <ProtectedRoute role="admin">
                                <DashboardLayout />
                            </ProtectedRoute>
                        }>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="events" element={<AdminEvents />} />
                            <Route path="approvals" element={<AdminApprovals />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                        </Route>

                        {/* Default */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
