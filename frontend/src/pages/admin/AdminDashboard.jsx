/**
 * Admin Dashboard - Overview with stats, approvals, Chart.js analytics
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { FiUsers, FiCalendar, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [pending, setPending] = useState([]);
    const [barData, setBarData] = useState(null);
    const [pieData, setPieData] = useState(null);
    const [lineData, setLineData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, pendingRes, barRes, pieRes, lineRes] = await Promise.all([
                    api.get('/analytics/stats'),
                    api.get('/registrations/pending'),
                    api.get('/analytics/event-registrations'),
                    api.get('/analytics/category-distribution'),
                    api.get('/analytics/monthly-growth')
                ]);

                setStats(statsRes.data);
                setPending(pendingRes.data.registrations || []);

                // Bar chart
                const bar = barRes.data.data || [];
                setBarData({
                    labels: bar.map(d => d.title?.substring(0, 15)),
                    datasets: [{
                        label: 'Registrations',
                        data: bar.map(d => d.registrations),
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderRadius: 6,
                        borderSkipped: false
                    }]
                });

                // Pie chart
                const pie = pieRes.data.data || [];
                const colors = { hackathon: '#3b82f6', game: '#10b981', celebration: '#8b5cf6' };
                setPieData({
                    labels: pie.map(d => d._id),
                    datasets: [{
                        data: pie.map(d => d.count),
                        backgroundColor: pie.map(d => colors[d._id] || '#94a3b8'),
                        borderWidth: 0
                    }]
                });

                // Line chart
                const line = lineRes.data.data || [];
                setLineData({
                    labels: line.map(d => d.month),
                    datasets: [{
                        label: 'Monthly Registrations',
                        data: line.map(d => d.registrations),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: '#3b82f6'
                    }]
                });
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

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 12 } } } }
    };

    return (
        <motion.div className="page-container" variants={container} initial="hidden" animate="show">
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Manage events, approvals, and view analytics</p>
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

            {/* Charts Grid */}
            <div className="charts-grid">
                <motion.div className="glass-card chart-card" variants={item}>
                    <h3 className="card-title">📊 Event Registrations</h3>
                    <div className="chart-container">
                        {barData && <Bar data={barData} options={chartOptions} />}
                    </div>
                </motion.div>

                <motion.div className="glass-card chart-card" variants={item}>
                    <h3 className="card-title">🥧 Event Categories</h3>
                    <div className="chart-container pie-container">
                        {pieData && <Pie data={pieData} options={chartOptions} />}
                    </div>
                </motion.div>

                <motion.div className="glass-card chart-card chart-wide" variants={item}>
                    <h3 className="card-title">📈 Monthly Growth</h3>
                    <div className="chart-container">
                        {lineData && <Line data={lineData} options={chartOptions} />}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
