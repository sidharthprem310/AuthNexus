import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.get(`/admin/users?page=${page}&per_page=20`, config);
            setUsers(response.data.users);
            setTotalPages(response.data.pages);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleLockToggle = async (user) => {
        const action = user.is_locked ? 'unlock' : 'lock';
        if (!window.confirm(`Are you sure you want to ${action} user ${user.email}?`)) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.post(`/admin/users/${user.id}/${action}`, {}, config);

            // Update local state
            setUsers(users.map(u =>
                u.id === user.id ? { ...u, is_locked: !u.is_locked } : u
            ));
        } catch (err) {
            alert(`Failed to ${action} user`);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    if (loading && users.length === 0) return <div className="text-center text-white mt-10">Loading users...</div>;

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
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
                                    Email / ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    MFA
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Role
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">{user.email}</div>
                                        <div className="text-sm text-gray-500">{user.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.is_locked ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Locked
                                            </span>
                                        ) : user.is_active ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {user.is_mfa_enabled ? 'Enabled' : 'Disabled'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {user.is_admin ? 'Admin' : 'User'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleLockToggle(user)}
                                            className={`${user.is_locked ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'} mr-4`}
                                        >
                                            {user.is_locked ? 'Unlock' : 'Lock'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-400">
                        Page {page} of {totalPages}
                    </span>
                    <div className="space-x-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={page === 1}
                            className={`px-4 py-2 text-sm font-medium rounded-md 
                                ${page === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={page === totalPages}
                            className={`px-4 py-2 text-sm font-medium rounded-md 
                                ${page === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
