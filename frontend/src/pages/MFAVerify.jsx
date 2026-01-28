import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MFAVerify() {
    const [otp, setOtp] = useState('');
    const [isRecovery, setIsRecovery] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const mfaToken = location.state?.mfa_token;

    if (!mfaToken) {
        return <div className="text-white">Invalid Session. Please login again.</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const endpoint = isRecovery ? '/auth/verify-recovery-code' : '/auth/verify-2fa';
        const payload = isRecovery ? { code: otp } : { otp };

        try {
            const res = await axios.post(endpoint, payload, {
                headers: { Authorization: `Bearer ${mfaToken}` }
            });

            login(res.data.access_token);
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-white">
                    {isRecovery ? 'Recovery Code' : 'Two-Factor Authentication'}
                </h2>
                {error && <div className="p-3 text-red-500 bg-red-100 rounded">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">
                            {isRecovery ? 'Enter Recovery Code' : 'Enter Authenticator Code'}
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full p-2 text-white bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-2 font-bold text-white bg-green-600 rounded hover:bg-green-700 transition"
                    >
                        Verify
                    </button>
                </form>
                <div className="text-center">
                    <button
                        className="text-sm text-blue-400 hover:text-blue-300"
                        onClick={() => { setIsRecovery(!isRecovery); setError(''); setOtp(''); }}
                    >
                        {isRecovery ? 'Use Authenticator App' : 'Use Recovery Code'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MFAVerify;
