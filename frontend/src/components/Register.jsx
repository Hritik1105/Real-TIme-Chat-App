import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="px-8 py-6 mt-4 text-left bg-white dark:bg-gray-800 shadow-lg rounded-xl dark:text-gray-100 border dark:border-gray-700 w-full max-w-sm">
                <h3 className="text-2xl font-bold text-center mb-6">Register for Chat</h3>
                {error && <div className="text-red-500 text-sm mb-4 bg-red-100 dark:bg-red-900/30 p-2 rounded">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <label className="block" htmlFor="username">Username</label>
                        <input type="text" placeholder="Username"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                            value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="mt-4">
                        <label className="block" htmlFor="email">Email</label>
                        <input type="email" placeholder="Email"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                            value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="mt-4">
                        <label className="block" htmlFor="password">Password</label>
                        <input type="password" placeholder="Password"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                            value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                    </div>
                    <div className="flex flex-col items-baseline justify-between mt-6 gap-2">
                        <button className="px-6 py-2 w-full text-white bg-green-600 rounded-lg hover:bg-green-700 transition">Register</button>
                        <span className="text-sm">Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-500">Login</Link></span>
                    </div>
                </form>
            </div>
        </div>
    );
}
