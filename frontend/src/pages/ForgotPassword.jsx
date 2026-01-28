import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const res = await axios.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-white">Reset Password</h2>
                <p className="text-center text-gray-400 text-sm">
                    Enter your email to receive a reset link.
                </p>
                {message && <div className="p-3 text-green-500 bg-green-900/30 rounded border border-green-800">{message}</div>}
                {error && <div className="p-3 text-red-500 bg-red-900/30 rounded border border-red-800">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 text-white bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                    >
                        Send Reset Link
                    </button>
                    <div className="text-center mt-4">
                        <Link to="/login" className="text-sm text-gray-400 hover:text-white">Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;
