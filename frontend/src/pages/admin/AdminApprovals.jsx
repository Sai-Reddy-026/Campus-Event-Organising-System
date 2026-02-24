/**
 * Admin Approvals Page - All registrations with filter tabs
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { FiCheckCircle, FiXCircle, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminApprovals = () => {
    const [registrations, setRegistrations] = useState([]);
    const [filter, setFilter] = useState('Pending');
    const [loading, setLoading] = useState(true);

    const fetchRegistrations = async () => {
        try {
            const res = await api.get(`/registrations/all?status=${filter.toLowerCase()}`);
            setRegistrations(res.data.registrations || []);
        } catch (err) {
            toast.error('Error loading registrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRegistrations(); }, [filter]);

    const handleApprove = async (id) => {
        try {
            await api.put(`/registrations/${id}/approve`);
            toast.success('Approved!');
            fetchRegistrations();
        } catch (err) { toast.error('Approval failed'); }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/registrations/${id}/reject`);
            toast.success('Rejected');
            fetchRegistrations();
        } catch (err) { toast.error('Rejection failed'); }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><FiFilter style={{ verticalAlign: 'middle', marginRight: 8 }} /> Registration Approvals</h1>
                <p>Review and manage all student registrations</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['Pending', 'Approved', 'Rejected'].map(tab => (
                    <button
                        key={tab}
                        className={`btn ${filter === tab ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        onClick={() => { setFilter(tab); setLoading(true); }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="glass-card">
                {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                ) : registrations.length === 0 ? (
                    <p className="empty-text">No {filter.toLowerCase()} registrations</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Student ID</th>
                                    <th>College</th>
                                    <th>Department</th>
                                    <th>Event</th>
                                    <th>Year</th>
                                    <th>Status</th>
                                    {filter === 'Pending' && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map(reg => (
                                    <tr key={reg._id}>
                                        <td>
                                            <strong>{reg.name}</strong>
                                            <br /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{reg.email}</span>
                                        </td>
                                        <td><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{reg.studentId || '—'}</span></td>
                                        <td>{reg.college}</td>
                                        <td>{reg.department}</td>
                                        <td>{reg.event?.title || 'N/A'}</td>
                                        <td>{reg.year || '—'}</td>
                                        <td><span className={`badge badge-${reg.status}`}>{reg.status}</span></td>
                                        {filter === 'Pending' && (
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
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminApprovals;
