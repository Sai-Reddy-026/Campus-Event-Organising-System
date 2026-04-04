/**
 * Student Dashboard - 5-card stats row, side-by-side Updates + Chart, dark mode toggle
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FiCalendar, FiUsers, FiAward, FiTrendingUp, FiMoon, FiSun, FiZap } from 'react-icons/fi';
import './StudentDashboard.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const StudentDashboard = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, eventsRes] = await Promise.all([
                    api.get('/statistics'),
                    api.get('/events')
                ]);
                setStats(statsRes.data);

                // Map events to calendar format
                const calEvents = (eventsRes.data.events || []).map(e => ({
                    title: e.title,
                    date: e.date?.split('T')[0],
                    backgroundColor: e.category === 'hackathon' ? '#3b82f6' :
                        e.category === 'game' ? '#10b981' : '#8b5cf6',
                    borderColor: 'transparent'
                }));
                setEvents(calEvents);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Loading dashboard...</p></div>;
    }

    const statsCards = [
        { label: 'Total Events', value: stats?.totalEvents || 0, icon: <FiCalendar />, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Total Registrations', value: stats?.totalRegistrations || 0, icon: <FiUsers />, color: '#10b981', bg: '#ecfdf5' },
        { label: 'Our College', value: stats?.ourCollegeCount || 0, icon: <FiAward />, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'Other Colleges', value: stats?.otherCollegeCount || 0, icon: <FiTrendingUp />, color: '#8b5cf6', bg: '#f5f3ff' },
        { label: 'Code Sprint 2026', value: '🚀', icon: <FiZap />, color: '#ef4444', bg: '#fef2f2', isText: true }
    ];

    return (
        <motion.div className="page-container" variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div className="dashboard-header" variants={item}>
                <div>
                    <h1>Welcome, {user?.name || 'Student'} 👋</h1>
                    <p>Here's your event dashboard overview</p>
                    {user?.studentId && (
                        <span className="student-id-badge">ID: {user.studentId}</span>
                    )}
                </div>
            </motion.div>

            {/* 5-Card Stats Row */}
            <motion.div className="stats-grid stats-grid-five" variants={item}>
                {statsCards.map((stat, i) => (
                    <motion.div
                        className="glass-card stat-card"
                        key={i}
                        whileHover={{ scale: 1.04, y: -4 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <p className={`stat-value ${stat.isText ? 'stat-text' : ''}`}>{stat.value}</p>
                            <p className="stat-label">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Side-by-Side: Updates (Calendar) + Statistics Chart */}
            <motion.div className="dashboard-lower" variants={item}>
                {/* Left: Updates (Calendar) */}
                <div className="glass-card updates-section">
                    <div className="updates-header">
                        <h3 className="card-title"><FiCalendar /> Updates</h3>
                        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Dark Mode">
                            <motion.div
                                key={theme}
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
                            </motion.div>
                        </button>
                    </div>
                    <div className="calendar-compact">
                        <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            events={events}
                            height={320}
                            headerToolbar={{
                                left: 'prev',
                                center: 'title',
                                right: 'next'
                            }}
                            dayMaxEvents={2}
                            fixedWeekCount={false}
                        />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default StudentDashboard;
