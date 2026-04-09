"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShieldAlert, UserX, UserCheck, Loader2, Trash2, Shield } from 'lucide-react';
import { API_BASE } from '../../../config';
import ConfirmDialog from './ConfirmDialog';

export default function UsersTab({ token }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
    const [roleConfirm, setRoleConfirm] = useState({ open: false, id: null, name: '', currentRole: '' });

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                console.error('Fetch users failed:', res.status);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleClick = (userId, name, currentRole) => {
        setRoleConfirm({ open: true, id: userId, name, currentRole });
    };

    const handleRoleConfirm = async () => {
        const { id, currentRole } = roleConfirm;
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        setRoleConfirm({ open: false, id: null, name: '', currentRole: '' });
        setActionLoading(id);
        try {
            const res = await fetch(`${API_BASE}/api/admin/users/${id}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error('Role update failed:', res.status, errData);
                alert(`Role update failed (${res.status}): ${errData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Role update error:', err);
            alert(`Network error: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteClick = (userId) => {
        setDeleteConfirm({ open: true, id: userId });
    };

    const handleDeleteConfirm = async () => {
        const id = deleteConfirm.id;
        setDeleteConfirm({ open: false, id: null });
        setActionLoading(id);
        try {
            const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u._id !== id));
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error('Delete failed:', res.status, errData);
                alert(`Delete failed (${res.status}): ${errData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert(`Network error: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const s = search.toLowerCase();
    const filteredUsers = users.filter(u =>
        (!s) ||
        (u.fullName && u.fullName.toLowerCase().includes(s)) ||
        (u.email && u.email.toLowerCase().includes(s))
    );

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    }

    const pendingRoleNewRole = roleConfirm.currentRole === 'admin' ? 'User' : 'Admin';

    return (
        <>
            <ConfirmDialog
                isOpen={deleteConfirm.open}
                title="Delete User"
                message="This will permanently delete this user and all their bookings. This cannot be undone."
                confirmText="Delete User"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm({ open: false, id: null })}
            />

            <ConfirmDialog
                isOpen={roleConfirm.open}
                title={`Change Role to ${pendingRoleNewRole}`}
                message={`Change "${roleConfirm.name}" to ${pendingRoleNewRole}? ${pendingRoleNewRole === 'Admin' ? 'They will gain admin privileges.' : 'They will lose admin privileges.'}`}
                confirmText={`Make ${pendingRoleNewRole}`}
                confirmClass={pendingRoleNewRole === 'Admin' ? 'bg-primary hover:bg-primary-dark text-black' : 'bg-orange-500 hover:bg-orange-600 text-white'}
                onConfirm={handleRoleConfirm}
                onCancel={() => setRoleConfirm({ open: false, id: null, name: '', currentRole: '' })}
            />

            <div className="space-y-6 bg-card border border-border-custom rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Manage <span className="text-primary not-italic font-bold">Users</span></h2>
                        <p className="text-xs text-gray-500 font-medium">View and manage system personnel ({users.length} total)</p>
                    </div>
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-background border border-border-custom rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border-custom text-xs text-gray-500 font-bold uppercase tracking-widest">
                                <th className="py-4 px-4 whitespace-nowrap">Name</th>
                                <th className="py-4 px-4 whitespace-nowrap">Email</th>
                                <th className="py-4 px-4 whitespace-nowrap">Role</th>
                                <th className="py-4 px-4 whitespace-nowrap">Status</th>
                                <th className="py-4 px-4 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom">
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user._id} className="group hover:bg-primary/5 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary italic shrink-0">
                                                {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <span className="font-bold text-sm">{user.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-400">{user.email}</td>
                                    <td className="py-4 px-4">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-500/10 text-gray-400'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        {user.isEmailVerified ? (
                                            <div className="flex items-center gap-1.5 text-xs text-green-500 font-bold">
                                                <UserCheck size={14} /> Verified
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-bold">
                                                <ShieldAlert size={14} /> Pending
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleRoleClick(user._id, user.fullName, user.role)}
                                                disabled={actionLoading === user._id}
                                                className="flex items-center gap-1.5 px-3 py-2 border border-border-custom rounded-xl hover:bg-background transition-colors text-xs font-bold disabled:opacity-50"
                                            >
                                                <Shield size={14} />
                                                {user.role === 'admin' ? 'Demote' : 'Make Admin'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user._id)}
                                                disabled={actionLoading === user._id}
                                                className="p-2 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                                title="Delete User"
                                            >
                                                {actionLoading === user._id
                                                    ? <Loader2 size={16} className="animate-spin" />
                                                    : <Trash2 size={16} />
                                                }
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-500 text-sm">
                                        {search ? `No users match "${search}"` : 'No users found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
