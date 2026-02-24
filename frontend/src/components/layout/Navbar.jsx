/**
 * Navbar Component - Top navigation bar with profile dropdown
 */
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiBell, FiSun, FiMoon, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Navbar.css';

const Navbar = ({ onMenuToggle }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    // Fetch notifications
    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifications(res.data.notifications || []);
            } catch (e) { /* silent */ }
        };
        if (user) fetchNotifs();
        const interval = setInterval(fetchNotifs, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { /* silent */ }
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <button className="menu-toggle" onClick={onMenuToggle}>
                    <FiMenu />
                </button>
                <div className="navbar-greeting">
                    <h2>Welcome back, <span className="greeting-name">{user?.name?.split(' ')[0] || 'User'}</span> 👋</h2>
                    <p className="greeting-subtitle">
                        {user?.role === 'admin' ? 'Admin Dashboard' : 'Student Portal'} •{' '}
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="navbar-right">
                {/* Theme Toggle */}
                <button className="navbar-icon-btn" onClick={toggleTheme} title="Toggle theme">
                    {theme === 'light' ? <FiMoon /> : <FiSun />}
                </button>

                {/* Notifications */}
                <div className="navbar-dropdown" ref={notifRef}>
                    <button className="navbar-icon-btn" onClick={() => setShowNotif(!showNotif)}>
                        <FiBell />
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </button>
                    {showNotif && (
                        <div className="dropdown-menu notif-dropdown">
                            <div className="dropdown-header">
                                <h4>Notifications</h4>
                                {unreadCount > 0 && (
                                    <button className="mark-read-btn" onClick={markAllRead}>Mark all read</button>
                                )}
                            </div>
                            <div className="notif-list">
                                {notifications.length === 0 ? (
                                    <p className="empty-msg">No notifications yet</p>
                                ) : (
                                    notifications.slice(0, 10).map(n => (
                                        <div key={n._id} className={`notif-item ${n.read ? '' : 'unread'}`}>
                                            <div className={`notif-dot ${n.type}`}></div>
                                            <div>
                                                <p className="notif-title">{n.title}</p>
                                                <p className="notif-msg">{n.message}</p>
                                                <span className="notif-time">
                                                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="navbar-dropdown" ref={profileRef}>
                    <button className="profile-btn" onClick={() => setShowProfile(!showProfile)}>
                        <div className="profile-avatar">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    </button>
                    {showProfile && (
                        <div className="dropdown-menu profile-dropdown">
                            <div className="profile-info">
                                <div className="profile-avatar-lg">{user?.name?.charAt(0) || 'U'}</div>
                                <div>
                                    <h4>{user?.name}</h4>
                                    <p>{user?.email}</p>
                                    <span className="role-badge">{user?.role}</span>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" onClick={handleLogout}>
                                <FiLogOut /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
