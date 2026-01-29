import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({ email: '', currentPassword: '', newPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/auth/me');
                setUserProfile(res.data);
                setFormData(prev => ({ ...prev, email: res.data.email }));
            } catch (err) {
                console.error("Failed to fetch profile", err);
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

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('/auth/account', { email: formData.email });
            setUserProfile(res.data.user);
            setMessage({ type: 'success', text: 'Email updated successfully!' });
            setShowEmailModal(false);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update email' });
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/auth/security', {
                current_password: formData.currentPassword,
                new_password: formData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setShowPasswordModal(false);
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update password' });
        }
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

                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition focus:outline-none"
                        >
                            <span>Settings ⚙️</span>
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700 z-50">
                                <button
                                    onClick={() => { setShowEmailModal(true); setShowDropdown(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                    Update Username
                                </button>
                                <button
                                    onClick={() => { setShowPasswordModal(true); setShowDropdown(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                    Change Password
                                </button>
                                <div className="border-t border-gray-700 my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Notification Toast */}
            {message.text && (
                <div className={`fixed top-20 right-4 px-6 py-3 rounded shadow-lg z-50 ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'} text-white`}>
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-4 font-bold">✕</button>
                </div>
            )}

            {/* Modals */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">Update Username (Email)</h3>
                        <form onSubmit={handleUpdateEmail} className="space-y-4">
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                                placeholder="New Email"
                                required
                            />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowEmailModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">Change Password</h3>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <input
                                type="password"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                                placeholder="Current Password"
                                required
                            />
                            <input
                                type="password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                                placeholder="New Password"
                                required
                            />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 rounded text-white hover:bg-purple-700">Change Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
