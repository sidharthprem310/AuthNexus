import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post('/auth/register', { email, password });
            // Redirect to login on success
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-white">Create Account</h2>
                {error && <div className="p-3 text-red-500 bg-red-100 rounded">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 text-white bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 text-white bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-2 font-bold text-white bg-green-600 rounded hover:bg-green-700 transition"
                    >
                        Sign Up
                    </button>
                    <div className="text-center text-gray-400 text-sm mt-4">
                        Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
