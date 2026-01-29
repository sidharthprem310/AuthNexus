import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post('/auth/login', { email, password });

            if (res.data.mfa_required) {
                // Redirect to MFA Verify with token
                navigate('/mfa-verify', {
                    state: {
                        mfa_token: res.data.mfa_token,
                        from: location.state?.from
                    }
                });
            } else {
                // Success
                login(res.data.access_token);
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-white">AuthNexus</h2>
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
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                            Forgot Password?
                        </Link>
                    </div>
                    <button
                        type="submit"
                        className="w-full p-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                    >
                        Sign In
                    </button>
                    <div className="text-center text-gray-400 text-sm mt-4">
                        New user? <a href="/register" className="text-blue-400 hover:text-blue-300">Create an account</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
