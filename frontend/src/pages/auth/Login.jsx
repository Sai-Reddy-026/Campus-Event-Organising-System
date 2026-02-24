/**
 * Login Page - Single login form for Admin & Student
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('student');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error('Please fill all fields');
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            <motion.div
                className="auth-card glass-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="auth-header">
                    <div className="auth-logo">🎓</div>
                    <h1>College Events</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="role-selector">
                        <button type="button" className={`role-btn ${selectedRole === 'student' ? 'active' : ''}`} onClick={() => setSelectedRole('student')}>
                            👨‍🎓 Student
                        </button>
                        <button type="button" className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`} onClick={() => setSelectedRole('admin')}>
                            👨‍💼 Admin
                        </button>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <FiLock className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn-primary btn-lg auth-submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? <div className="btn-spinner"></div> : <><FiLogIn /> Sign In</>}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
