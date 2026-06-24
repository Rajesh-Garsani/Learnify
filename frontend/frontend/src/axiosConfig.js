import axios from 'axios';

// BUG 6 FIX: Fallback to environment variables to prevent deployment failures
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // BUG 2 FIX: Django REST Framework requires 'Token', not 'Bearer'
            config.headers['Authorization'] = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;