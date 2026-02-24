/**
 * Admin Analytics Page - Detailed charts and statistics
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { FiBarChart2 } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [barData, setBarData] = useState(null);
    const [pieData, setPieData] = useState(null);
    const [lineData, setLineData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, barRes, pieRes, lineRes] = await Promise.all([
                    api.get('/analytics/stats'),
                    api.get('/analytics/event-registrations'),
                    api.get('/analytics/category-distribution'),
                    api.get('/analytics/monthly-growth')
                ]);

                setStats(statsRes.data);

                const bar = barRes.data.data || [];
                setBarData({
                    labels: bar.map(d => d.title),
                    datasets: [{
                        label: 'Registrations',
                        data: bar.map(d => d.registrations),
                        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'],
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                });

                const pie = pieRes.data.data || [];
                setPieData({
                    labels: pie.map(d => d._id?.charAt(0).toUpperCase() + d._id?.slice(1)),
                    datasets: [{
                        data: pie.map(d => d.count),
                        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'],
                        borderWidth: 0,
                        hoverOffset: 8
                    }]
                });

                const line = lineRes.data.data || [];
                setLineData({
                    labels: line.map(d => d.month),
                    datasets: [{
                        label: 'Monthly Registrations',
                        data: line.map(d => d.registrations),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 6,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                });
            } catch (err) {
                console.error('Analytics error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 12 }, padding: 16 } } }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Loading analytics...</p></div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><FiBarChart2 style={{ verticalAlign: 'middle', marginRight: 8 }} /> Analytics</h1>
                <p>Comprehensive event registration statistics</p>
            </div>

            {/* Summary Stats */}
            {stats && (
                <div className="grid-3" style={{ marginBottom: 24 }}>
                    {[
                        { label: 'Total Registrations', value: stats.totalRegistrations, color: '#3b82f6' },
                        { label: 'Approval Rate', value: stats.totalRegistrations > 0 ? Math.round((stats.approvedRegistrations / stats.totalRegistrations) * 100) + '%' : '0%', color: '#10b981' },
                        { label: 'Pending Review', value: stats.pendingApprovals, color: '#f59e0b' }
                    ].map((s, i) => (
                        <div className="glass-card stat-card" key={i}>
                            <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>📊</div>
                            <div>
                                <p className="stat-value">{s.value}</p>
                                <p className="stat-label">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="charts-grid">
                <div className="glass-card chart-card">
                    <h3 className="card-title">📊 Event Registrations (Bar)</h3>
                    <div className="chart-container">{barData && <Bar data={barData} options={chartOptions} />}</div>
                </div>

                <div className="glass-card chart-card">
                    <h3 className="card-title">🥧 Category Distribution (Pie)</h3>
                    <div className="chart-container pie-container">{pieData && <Pie data={pieData} options={chartOptions} />}</div>
                </div>

                <div className="glass-card chart-card chart-wide">
                    <h3 className="card-title">📈 Monthly Growth (Line)</h3>
                    <div className="chart-container">{lineData && <Line data={lineData} options={chartOptions} />}</div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
