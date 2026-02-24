import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        // Set the token for all future API calls
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();

        const handleExpiry = () => {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
        };

        window.addEventListener('session-expired', handleExpiry);
        return () => window.removeEventListener('session-expired', handleExpiry);
    }, [checkAuth]);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });

            // Destructure data from backend response
            const userData = res.data.user;
            const token = res.data.token;

            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(userData);

            // Return userData so the Login component can see the role
            return userData;
        } catch (error) {
            // Rethrow the error so your UI can show "Invalid Credentials"
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {/* Don't render children until we know if the user is logged in or not */}
            {!loading ? children : <div>Loading...</div>}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};