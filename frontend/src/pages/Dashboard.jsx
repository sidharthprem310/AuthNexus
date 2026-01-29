import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/auth/me');
                setUserProfile(res.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                // If 401, maybe logout? But AuthContext handles that mostly.
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/')
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                            AuthNexus
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition border border-red-400/20"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

                {/* Welcome Section */}
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Welcome back, <span className="text-blue-400">{userProfile?.email || 'User'}</span>!
                    </h2>
                    <p className="text-gray-400">Manage your security settings and account preferences.</p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Account Info Card */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-blue-500/50 transition duration-300">
                        <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">👤</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Account Profile</h3>
                        <div className="space-y-2 text-sm text-gray-400">
                            <p><span className="text-gray-500">Email:</span> {userProfile?.email}</p>
                            <p><span className="text-gray-500">User ID:</span> <span className="font-mono text-xs">{userProfile?.id}</span></p>
                            <p><span className="text-gray-500">Status:</span>
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${userProfile?.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {userProfile?.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-purple-500/50 transition duration-300">
                        <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Security</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
                                <span className="text-sm text-gray-300">Two-Factor Auth</span>
                                <span className={`text-xs px-2 py-1 rounded ${userProfile?.is_mfa_enabled ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {userProfile?.is_mfa_enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                            <button className="w-full py-2 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-600 transition">
                                Manage MFA
                            </button>
                        </div>
                    </div>

                    {/* Devices / Audit Placeholder */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-teal-500/50 transition duration-300">
                        <div className="h-10 w-10 bg-teal-500/10 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">📱</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Session Activity</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Monitor your active sessions and login history.
                        </p>
                        <div className="text-xs text-gray-500 bg-gray-900/50 p-3 rounded-lg mb-3">
                            <p>Current Session: <span className="text-green-400">Active</span></p>
                            <p>Last Login: {new Date().toLocaleDateString()}</p>
                        </div>
                        <button className="w-full py-2 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-600 transition">
                            View Logs
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default Dashboard;
