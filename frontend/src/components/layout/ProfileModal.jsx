import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiLock, FiPhone, FiMail } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || ''
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    if (!isOpen) return null;

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/auth/profile', profileData);
            toast.success('Profile updated successfully!');
            onUpdate({ ...user, name: profileData.name, phone: profileData.phone });
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        if (passwordData.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully!');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24
                }}
            >
                <motion.div
                    className="modal glass-card"
                    style={{
                        width: '100%', maxWidth: '450px', background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-xl)', padding: 32,
                        border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                    }}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ fontSize: 24, display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                            {activeTab === 'profile' ? <><FiUser /> Profile</> : <><FiLock /> Security</>}
                        </h2>
                        <button onClick={onClose} style={{
                            background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                            cursor: 'pointer', display: 'flex', padding: 8
                        }}>
                            <FiX size={24} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                        <button
                            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                            onClick={() => setActiveTab('profile')}
                            style={{ flex: 1 }}
                        >
                            Profile Details
                        </button>
                        <button
                            className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                            onClick={() => setActiveTab('password')}
                            style={{ flex: 1 }}
                        >
                            Change Password
                        </button>
                    </div>

                    {activeTab === 'profile' ? (
                        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Role</label>
                                <input className="form-input" value={user?.role?.toUpperCase()} disabled style={{ opacity: 0.7 }} />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Email</label>
                                <input className="form-input" value={user?.email} disabled style={{ opacity: 0.7 }} />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Full Name</label>
                                <input
                                    className="form-input"
                                    value={profileData.name}
                                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Phone Number</label>
                                <input
                                    className="form-input"
                                    value={profileData.phone}
                                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                    placeholder="Optional"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 10 }}>
                                {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Current Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={passwordData.currentPassword}
                                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 10 }}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProfileModal;
