import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { API_URL } from '@/config/apiConfig';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Add a response interceptor to handle expired/invalid tokens
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 (Unauthorized) and not already a retry and not a login/signup request
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token using the HTTP-only cookie
                const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });

                if (data.token) {
                    // Update access token in localStorage
                    localStorage.setItem('token', data.token);

                    // Update the authorization header and retry original request
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed — clear auth state and redirect
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    window.location.href = '/auth/login?expired=true';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
