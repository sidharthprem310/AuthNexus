import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminBlockedIps = () => {
    const [blockedIps, setBlockedIps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth(); // Assuming user/token from context
    const navigate = useNavigate();

    useEffect(() => {
        fetchBlockedIps();
    }, []);

    const fetchBlockedIps = async () => {
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.get('/admin/blocked-ips', config);
            setBlockedIps(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch blocked IPs');
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (ip) => {
        if (!window.confirm(`Are you sure you want to unblock ${ip}?`)) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.delete(`/admin/blocked-ips/${ip}`, config);
            // Refresh list
            setBlockedIps(blockedIps.filter(item => item.ip_address !== ip));
        } catch (err) {
            alert('Failed to unblock IP');
        }
    };

    if (loading) return <div className="text-center text-white mt-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white">Blocked IPs</h1>
                    <button
                        onClick={() => navigate('/admin')}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

                <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    IP Address
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Blocked At
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {blockedIps.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {item.ip_address}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {item.reason}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(item.blocked_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleUnblock(item.ip_address)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            Unblock
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {blockedIps.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No blocked IPs.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBlockedIps;
