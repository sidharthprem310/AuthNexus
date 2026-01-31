import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Keep password state for password login
    const [showForgotPassword, setShowForgotPassword] = useState(false); // This state is not used in the provided diff, but keeping it as per diff
    const [useMagicLink, setUseMagicLink] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // Replaces 'error' state
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const handleLogin = async (e) => { // Renamed from handleSubmit
        e.preventDefault();
        setMessage({ text: '', type: '' }); // Clear previous messages

        if (useMagicLink) {
            try {
                await axios.post('/auth/magic-link', { email });
                setMessage({ text: 'Magic Link sent! Check your email.', type: 'success' });
            } catch (err) {
                setMessage({ text: err.response?.data?.error || 'Failed to send magic link', type: 'error' });
            }
            return;
        }

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
                const from = location.state?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });
            }
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Login failed', type: 'error' }); // Use setMessage
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                <h2 className="mt-6 text-3xl font-extrabold text-white text-center">
                    {useMagicLink ? 'Sign in with Magic Link' : 'Sign in to your account'}
                </h2>
                <p className="mt-2 text-sm text-gray-400 text-center">
                    Or{' '}
                    <button onClick={() => navigate('/register')} className="font-medium text-blue-500 hover:text-blue-400">
                        create a new account
                    </button>
                    <span className="mx-2">|</span>
                    <button
                        onClick={() => { setUseMagicLink(!useMagicLink); setMessage({ text: '', type: '' }); }}
                        className="font-medium text-purple-500 hover:text-purple-400"
                    >
                        {useMagicLink ? 'Use Password' : 'Use Magic Link'}
                    </button>
                </p>
                {message.text && (
                    <div className={`p-3 rounded ${message.type === 'error' ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'}`}>
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-300">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 text-white bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    {!useMagicLink && ( // Conditionally render password field
                        <div>
                            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-300">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 text-white bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    )}
                    {!useMagicLink && ( // Keep forgot password link only for password login
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                                Forgot Password?
                            </Link>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <span className="h-5 w-5 text-blue-500 group-hover:text-blue-400" aria-hidden="true">🔒</span>
                        </span>
                        {useMagicLink ? 'Send Magic Link' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
```
