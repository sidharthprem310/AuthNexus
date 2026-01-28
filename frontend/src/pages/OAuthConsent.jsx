import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

function OAuthConsent() {
    const [searchParams] = useSearchParams();
    const [clientInfo, setClientInfo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const scope = searchParams.get('scope') || 'default';
    const responseType = searchParams.get('response_type');

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await axios.get('/oauth/authorize', {
                    params: { client_id: clientId, redirect_uri: redirectUri, response_type: responseType, scope }
                });
                setClientInfo(res.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load consent screen');
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, [clientId, redirectUri, responseType, scope]);

    const handleConsent = async (consent) => {
        try {
            const res = await axios.post('/oauth/authorize', {
                client_id: clientId,
                redirect_uri: redirectUri,
                scope,
                consent
            });

            // Redirect to callback
            window.location.href = res.data.redirect_uri;
        } catch (err) {
            if (consent === 'deny') {
                alert("Access denied by user");
            }
            setError(err.response?.data?.error || 'Authorization failed');
        }
    };

    if (loading) return <div className="p-10 text-white">Loading...</div>;
    if (error) return <div className="p-10 text-red-500">{error}</div>;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-center text-white mb-4">Authorization Request</h2>
                <p className="text-gray-300 text-center mb-6">
                    <span className="font-bold text-blue-400">{clientInfo.client_name}</span> wants to access your account.
                </p>

                <div className="p-4 mb-6 bg-gray-700 rounded border border-gray-600">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase">Scope</h3>
                    <p className="text-white">{clientInfo.scope}</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => handleConsent('deny')}
                        className="flex-1 py-2 font-semibold text-gray-300 bg-gray-600 rounded hover:bg-gray-500"
                    >
                        Deny
                    </button>
                    <button
                        onClick={() => handleConsent('allow')}
                        className="flex-1 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Allow
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OAuthConsent;
