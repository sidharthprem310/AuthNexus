import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

function MagicLogin() {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Verifying Magic Link...');
    const [error, setError] = useState('');

    useEffect(() => {
        const verifyLink = async () => {
            const token = searchParams.get('token');
            const email = searchParams.get('email');

            if (!token || !email) {
                setError('Invalid link. Missing token or email.');
                return;
            }

            try {
                const res = await axios.post('/auth/magic-login', { email, token });

                if (res.data.mfa_required) {
                    // Redirect to MFA verify page with token
                    // But wait, MFAVerify usually expects user to be logged in logic or passed state.
                    // We can't use 'login()' yet which sets full user.
                    // We need to pass the temp token to a page that can handle it.
                    // Let's modify MFAVerify or reuse login flow.
                    // Actually, simpler: redirect to login page with mfa state? 
                    // Or redirect to a dedicated MFA verification route?
                    // Let's reuse Logic like in Login.

                    // We need to store the temp mfa_token somewhere. 
                    // This is tricky without a shared state manager or location state.
                    navigate('/verify-2fa', { state: { mfaToken: res.data.mfa_token, isRecovery: false } });
                } else {
                    login(res.data.access_token, res.data.user);
                    navigate('/dashboard');
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Magic link verification failed. It may have expired or already been used.');
            }
        };

        verifyLink();
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-xl text-center">
                {error ? (
                    <div>
                        <div className="text-5xl mb-4">❌</div>
                        <h2 className="text-xl font-bold text-red-500 mb-2">Verification Failed</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold mb-2">Logging you in...</h2>
                        <p className="text-gray-400">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MagicLogin;
