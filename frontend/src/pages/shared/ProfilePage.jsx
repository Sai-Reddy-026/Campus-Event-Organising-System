import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const ProfilePage = () => {
    const { user, checkAuth } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/auth/profile', profileData);
            toast.success('Profile updated successfully!');
            await checkAuth(); // refresh user data context
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
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div className="page-container" variants={container} initial="hidden" animate="show">
            <motion.div className="page-header" variants={item}>
                <h1>Profile & Security</h1>
                <p>Manage your account details and password</p>
            </motion.div>

            <motion.div className="profile-grid" variants={item}>
                {/* Left side: Avatar and quick info */}
                <div className="glass-card profile-sidebar-card">
                    <div className="profile-avatar-xl">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <h2 className="profile-name-lg">{user?.name}</h2>
                    <p className="profile-email-lg">{user?.email}</p>
                    <span className="role-badge-lg">{user?.role}</span>

                    <div className="profile-tabs mt-8">
                        <button
                            className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <FiUser /> Profile Details
                        </button>
                        <button
                            className={`profile-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                            onClick={() => setActiveTab('password')}
                        >
                            <FiLock /> Security Settings
                        </button>
                    </div>
                </div>

                {/* Right side: Forms */}
                <div className="glass-card profile-content-card">
                    {activeTab === 'profile' ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="profile-form-section">
                            <h3 className="section-title">Personal Information</h3>
                            <form onSubmit={handleProfileSubmit} className="profile-form">
                                <div className="form-group">
                                    <label>Role</label>
                                    <input className="form-input disabled-input" value={user?.role?.toUpperCase()} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input className="form-input disabled-input" value={user?.email} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        className="form-input"
                                        value={profileData.name}
                                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        className="form-input"
                                        value={profileData.phone}
                                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <FiCheckCircle /> {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="profile-form-section">
                            <h3 className="section-title">Change Password</h3>
                            <form onSubmit={handlePasswordSubmit} className="profile-form">
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={passwordData.currentPassword}
                                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={passwordData.newPassword}
                                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                        minLength={6}
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={passwordData.confirmPassword}
                                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <FiLock /> {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProfilePage;
