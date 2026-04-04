/**
 * Admin Dashboard - Overview with stats, approvals, Chart.js analytics
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { FiUsers, FiCalendar, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, pendingRes] = await Promise.all([
                    api.get('/analytics/stats'),
                    api.get('/registrations/pending')
                ]);

                setStats(statsRes.data);
                setPending(pendingRes.data.registrations || []);
            } catch (err) {
                console.error('Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.put(`/registrations/${id}/approve`);
            toast.success('Registration approved!');
            setPending(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            toast.error('Approval failed');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/registrations/${id}/reject`);
            toast.success('Registration rejected');
            setPending(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            toast.error('Rejection failed');
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Loading dashboard...</p></div>;
    }

    return (
        <motion.div className="page-container" variants={container} initial="hidden" animate="show">
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Manage events and approvals</p>
            </div>

            {/* Stats Cards */}
            <motion.div className="grid-4 stats-grid" variants={item}>
                {[
                    { label: 'Total Students', value: stats?.totalStudents || 0, icon: <FiUsers />, color: '#3b82f6' },
                    { label: 'Total Events', value: stats?.totalEvents || 0, icon: <FiCalendar />, color: '#10b981' },
                    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: <FiClock />, color: '#f59e0b' },
                    { label: 'Approved', value: stats?.approvedRegistrations || 0, icon: <FiCheckCircle />, color: '#059669' }
                ].map((stat, i) => (
                    <div className="glass-card stat-card" key={i}>
                        <div className="stat-icon" style={{ background: `${stat.color}22`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="stat-value">{stat.value}</p>
                            <p className="stat-label">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Pending Approvals */}
            <motion.div className="glass-card approvals-section" variants={item}>
                <h3 className="card-title"><FiAlertCircle /> Pending Approvals ({pending.length})</h3>
                {pending.length === 0 ? (
                    <p className="empty-text">No pending approvals 🎉</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>College</th>
                                    <th>Event</th>
                                    <th>Department</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pending.map(reg => (
                                    <tr key={reg._id}>
                                        <td>
                                            <div className="student-info">
                                                <span className="student-name">{reg.name}</span>
                                                <span className="student-email">{reg.email}</span>
                                            </div>
                                        </td>
                                        <td>{reg.college}</td>
                                        <td>{reg.event?.title || 'N/A'}</td>
                                        <td>{reg.department || '—'}</td>
                                        <td>{new Date(reg.registrationDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="btn btn-success btn-sm" onClick={() => handleApprove(reg._id)}>
                                                    <FiCheckCircle /> Approve
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleReject(reg._id)}>
                                                    <FiXCircle /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default AdminDashboard;
