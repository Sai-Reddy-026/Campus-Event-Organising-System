import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // adjust if needed
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
});

api.interceptors.request.use(
    config => {
        const token = localStorage?.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('session-expired'));
        }
        return Promise.reject(error);
    }
);

export default api;
