import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [blockIp, setBlockIp] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/admin/stats');
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch admin stats", err);
            setError(err.response?.data?.error || 'Access Denied');
            setLoading(false);
        }
    };

    const handleBlockIp = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/admin/block-ip', { ip: blockIp });
            setBlockIp('');
            fetchStats();
        } catch (err) {
            alert('Failed to block IP');
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Admin Dashboard...</div>;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-red-500 mb-4">⛔ Access Denied</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="text-blue-400 underline">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-purple-400">🛡️ Admin Command Center</h1>
                    <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white">Back to App</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h3 className="text-gray-400 text-sm uppercase">Total Users</h3>
                        <p className="text-3xl font-bold text-white mt-2">{stats?.users?.total}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h3 className="text-gray-400 text-sm uppercase">MFA Adoption</h3>
                        <p className="text-3xl font-bold text-green-400 mt-2">{stats?.users?.mfa_enabled}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h3 className="text-gray-400 text-sm uppercase">Blocked IPs</h3>
                        <p className="text-3xl font-bold text-red-400 mt-2">{stats?.security?.blocked_ips}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Security Alerts */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">Recent Security Alerts</h3>
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                            {stats?.recent_alerts?.length > 0 ? (
                                stats.recent_alerts.map(alert => (
                                    <div key={alert.id} className="bg-red-900/20 p-3 rounded border-l-4 border-red-500">
                                        <p className="font-bold text-red-200">{alert.event_name}</p>
                                        <p className="text-sm text-gray-400">{alert.details}</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No recent alerts.</p>
                            )}
                        </div>
                    </div>

                    {/* Block IP Action */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">Block IP Address</h3>
                        <form onSubmit={handleBlockIp} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">IP Address</label>
                                <input
                                    type="text"
                                    value={blockIp}
                                    onChange={(e) => setBlockIp(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                    placeholder="e.g. 192.168.1.5"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold">
                                Ban IP
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
