import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Strip trailing slash if present
    const rawApiUrl = import.meta.env.VITE_API_URL || 'https://chat-backend-k7aj.onrender.com';
    const API_URL = rawApiUrl.replace(/\/+$/, '');

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await axios.get(`${API_URL}/users/me`);
            setUser(res.data);
        } catch (err) {
            console.error(err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        const res = await axios.post(`${API_URL}/auth/login`, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const newToken = res.data.access_token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        return true;
    };

    const register = async (username, email, password) => {
        await axios.post(`${API_URL}/auth/register`, { username, email, password });
        return true;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
