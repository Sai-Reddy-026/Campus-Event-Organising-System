/**
 * Sidebar Navigation Component
 */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome, FiCalendar, FiCode, FiAward, FiMusic,
    FiFileText, FiUsers, FiLogOut,
    FiChevronLeft, FiChevronRight, FiBarChart2
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const studentLinks = [
        { to: '/student/dashboard', icon: <FiHome />, label: 'Dashboard' },
        { to: '/student/hackathons', icon: <FiCode />, label: 'Hackathons' },
        { to: '/student/games', icon: <FiAward />, label: 'Games' },
        { to: '/student/celebrations', icon: <FiMusic />, label: 'Celebrations' },
        { to: '/student/letters', icon: <FiFileText />, label: 'Download Letter' },
        { to: '/student/calendar', icon: <FiCalendar />, label: 'Updates' },
    ];

    const adminLinks = [
        { to: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
        { to: '/admin/events', icon: <FiCalendar />, label: 'Manage Events' },
        { to: '/admin/approvals', icon: <FiUsers />, label: 'Approvals' },
        { to: '/admin/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
    ];

    const links = user?.role === 'admin' ? adminLinks : studentLinks;

    return (
        <motion.aside
            className={`sidebar ${collapsed ? 'collapsed' : ''}`}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3 }}
        >
            {/* Logo */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">🎓</div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                className="logo-text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                CEMS
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="sidebar-nav">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="sidebar-link-icon">{link.icon}</span>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    className="sidebar-link-label"
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                >
                                    {link.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="sidebar-footer">
                <button className="sidebar-link logout-btn" onClick={handleLogout}>
                    <span className="sidebar-link-icon"><FiLogOut /></span>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                className="sidebar-link-label"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
