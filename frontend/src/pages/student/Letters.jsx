/**
 * Letters Page - Approval letters with status-based download
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { FiFileText, FiDownload, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Letters.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const statusConfig = {
    pending: { label: 'Pending Approval', color: '#f59e0b', bg: '#fffbeb', icon: <FiClock size={16} /> },
    approved: { label: 'Approved', color: '#10b981', bg: '#ecfdf5', icon: <FiCheckCircle size={16} /> },
    rejected: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2', icon: <FiXCircle size={16} /> }
};

const Letters = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/registrations');
                setRegistrations(res.data.registrations || []);
            } catch (err) {
                toast.error('Failed to load letters');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const downloadPDF = async (regId, eventTitle) => {
        try {
            const response = await api.get(`/letters/${regId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `approval_letter_${eventTitle.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Approval letter downloaded!');
        } catch (err) {
            // Blob error responses need special handling
            let message = 'Failed to download PDF';
            if (err.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    message = json.message || message;
                } catch (_) { /* ignore parse errors */ }
            } else if (err.response?.data?.message) {
                message = err.response.data.message;
            }
            toast.error(message);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Loading letters...</p></div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><FiFileText style={{ verticalAlign: 'middle', marginRight: 8 }} /> My Letters</h1>
                <p>Download approval letters for your approved event registrations</p>
            </div>

            {registrations.length === 0 ? (
                <div className="glass-card empty-state">
                    <FiFileText size={48} />
                    <h3>No Letters Yet</h3>
                    <p>Letters will appear here once you register for events.</p>
                </div>
            ) : (
                <motion.div className="grid-2" variants={container} initial="hidden" animate="show">
                    {registrations.map(reg => {
                        const status = statusConfig[reg.status] || statusConfig.pending;

                        return (
                            <motion.div key={reg._id} className="glass-card letter-card" variants={item}>
                                <div className="letter-header">
                                    <div
                                        className="letter-status-badge"
                                        style={{ color: status.color, background: status.bg }}
                                    >
                                        {status.icon} {status.label}
                                    </div>
                                    <h3>{reg.event_title || 'Event'}</h3>
                                    <p className="letter-event-info">
                                        {reg.category} • {reg.event_date && new Date(reg.event_date).toLocaleDateString('en-IN', {
                                            month: 'long', day: 'numeric', year: 'numeric'
                                        })}
                                    </p>
                                    {reg.studentId && (
                                        <p className="letter-student-id">Student ID: {reg.studentId}</p>
                                    )}
                                </div>

                                {/* Letter Preview */}
                                <div className="letter-preview">
                                    <div className="letter-preview-header">
                                        <p>College Event Management System</p>
                                        <p className="preview-subtitle">Official Approval Letter</p>
                                    </div>
                                    <div className="letter-preview-body">
                                        <p>To: <strong>{reg.name}</strong></p>
                                        <p>Event: <strong>{reg.event_title}</strong></p>
                                        <p>College: {reg.college}</p>
                                        <p>Department: {reg.department} • Year: {reg.year}</p>
                                    </div>
                                </div>

                                {/* Download button only for approved */}
                                {reg.status === 'approved' ? (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => downloadPDF(reg._id, reg.event_title || 'event')}
                                    >
                                        <FiDownload /> Download Approval Letter
                                    </button>
                                ) : reg.status === 'pending' ? (
                                    <div className="letter-pending-msg">
                                        <FiClock /> Awaiting admin approval to generate letter
                                    </div>
                                ) : (
                                    <div className="letter-rejected-msg">
                                        <FiXCircle /> Registration was rejected
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
};

export default Letters;
