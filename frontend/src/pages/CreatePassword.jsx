import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

function CreatePassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            await axios.post('/auth/reset-password',
                { password },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Password Reset Successfully! Please login.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || "Failed to reset password. Link may be expired.");
        }
    };

    if (!token) return <div className="text-white text-center mt-10">Invalid Link</div>;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-white">Create New Password</h2>
                {error && <div className="p-3 text-red-500 bg-red-900/30 rounded border border-red-800">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 text-white bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 text-white bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-2 font-bold text-white bg-green-600 rounded hover:bg-green-700 transition"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreatePassword;
