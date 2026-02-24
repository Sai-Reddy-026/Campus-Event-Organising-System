/**
 * Registration Modal - Event registration form with referral ID support
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiBook, FiLayers, FiCalendar, FiCheckCircle, FiUsers, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import './RegistrationModal.css';

const RegistrationModal = ({ isOpen, onClose, event }) => {
    const { user } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        college: '',
        department: '',
        year: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.college || !form.department || !form.year) {
            return toast.error('Please fill all required fields');
        }
        setLoading(true);
        try {
            await api.post('/registrations', {
                event_id: event._id,
                ...form
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setForm({ name: '', email: '', college: '', department: '', year: '' });
                onClose();
            }, 2500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="modal-content glass-card"
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {success ? (
                            <div className="modal-success">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                >
                                    <FiClock size={64} color="#f59e0b" />
                                </motion.div>
                                <h2>Registration Submitted! ⏳</h2>
                                <p>Your request for <strong>{event?.title}</strong> is pending admin approval.</p>
                                <span className="pending-badge">Status: Pending</span>
                            </div>
                        ) : (
                            <>
                                <div className="modal-header">
                                    <div>
                                        <h2>Register for Event</h2>
                                        <p className="modal-event-name">{event?.title}</p>
                                    </div>
                                    <button className="modal-close" onClick={onClose}>
                                        <FiX size={20} />
                                    </button>
                                </div>

                                {/* Student ID Display */}
                                {user?.studentId && (
                                    <div className="student-id-display">
                                        <FiUser />
                                        <span>Your Student ID: <strong>{user.studentId}</strong></span>
                                    </div>
                                )}

                                <form className="modal-form" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label><FiUser className="field-icon" /> Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-input"
                                            placeholder="Enter your full name"
                                            value={form.name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label><FiMail className="field-icon" /> Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            placeholder="Enter your email"
                                            value={form.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label><FiBook className="field-icon" /> College Name *</label>
                                        <input
                                            type="text"
                                            name="college"
                                            className="form-input"
                                            placeholder="Enter your college name"
                                            value={form.college}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label><FiLayers className="field-icon" /> Department *</label>
                                            <input
                                                type="text"
                                                name="department"
                                                className="form-input"
                                                placeholder="e.g. CSE, ECE"
                                                value={form.department}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><FiCalendar className="field-icon" /> Year *</label>
                                            <select
                                                name="year"
                                                className="form-input"
                                                value={form.year}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1st Year">1st Year</option>
                                                <option value="2nd Year">2nd Year</option>
                                                <option value="3rd Year">3rd Year</option>
                                                <option value="4th Year">4th Year</option>
                                            </select>
                                        </div>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        className="btn btn-primary btn-lg modal-submit"
                                        disabled={loading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {loading ? <div className="btn-spinner"></div> : 'Submit Registration'}
                                    </motion.button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RegistrationModal;
