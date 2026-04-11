'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'practitioner',
        team: '',
        active: true,
    });

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        if (session?.user?.role !== 'admin') router.push('/dashboard');
    }, [status, session]);

    useEffect(() => {
        loadWorkers();
    }, []);

    async function loadWorkers() {
        setLoading(true);
        const res = await fetch('/api/users');
        const data = await res.json();
        setWorkers(data);
        setLoading(false);
    }

    async function handleSave() {
        const method = editUser ? 'PUT' : 'POST';
        const url = editUser ? '/api/users/' + editUser.id : '/api/users';
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        setShowForm(false);
        setEditUser(null);
        setForm({ name: '', email: '', password: '', role: 'practitioner', team: '', active: true });
        loadWorkers();
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        await fetch('/api/users/' + id, { method: 'DELETE' });
        loadWorkers();
    }

    function handleEdit(worker: any) {
        setEditUser(worker);
        setForm({
            name: worker.name,
            email: worker.email,
            password: worker.password,
            role: worker.role,
            team: worker.team || '',
            active: worker.active,
        });
        setShowForm(true);
    }

    function handleNew() {
        setEditUser(null);
        setForm({ name: '', email: '', password: '', role: 'practitioner', team: '', active: true });
        setShowForm(true);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div>
                    <h1 className="text-base font-medium text-gray-900">CareInsight AI</h1>
                    <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                    >
                        Sign out
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">User Management</h2>
                    <button
                        onClick={handleNew}
                        className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700"
                    >
                        Add new user
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">
                            {editUser ? 'Edit user' : 'New user'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500">Full name</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                                    placeholder="Sarah Ahmed"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Email</label>
                                <input
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                                    placeholder="sarah@careinsight.com"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Password</label>
                                <input
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                                    placeholder="password123"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Team</label>
                                <input
                                    value={form.team}
                                    onChange={e => setForm({ ...form, team: e.target.value })}
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                                    placeholder="Childrens Services"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Role</label>
                                <select
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="practitioner">Practitioner</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Status</label>
                                <select
                                    value={form.active ? 'true' : 'false'}
                                    onChange={e => setForm({ ...form, active: e.target.value === 'true' })}
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700"
                            >
                                {editUser ? 'Save changes' : 'Create user'}
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 border-b">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 border-b">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 border-b">Team</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 border-b">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 border-b">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</td>
                                </tr>
                            ) : workers.map(worker => (
                                <tr key={worker.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{worker.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{worker.email}</td>
                                    <td className="px-4 py-3 text-gray-500">{worker.team}</td>
                                    <td className="px-4 py-3">
                                        <span className={
                                            'px-2 py-1 rounded-full text-xs font-medium ' +
                                            (worker.role === 'admin' ? 'bg-red-50 text-red-600' :
                                                worker.role === 'manager' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-green-50 text-green-600')
                                        }>
                                            {worker.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={
                                            'px-2 py-1 rounded-full text-xs font-medium ' +
                                            (worker.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500')
                                        }>
                                            {worker.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(worker)}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => router.push('/admin/permissions/' + worker.id)}
                                                className="text-xs text-purple-600 hover:underline"
                                            >
                                                Permissions
                                            </button>
                                            <button
                                                onClick={() => handleDelete(worker.id)}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}