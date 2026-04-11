'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QueryBar from '@/components/QueryBar';
import CaseTable from '@/components/CaseTable';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6'];

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [perms, setPerms] = useState<Record<string, boolean>>({});
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status]);

    useEffect(() => {
        if (session?.user?.id) {
            fetch('/api/stats').then(r => r.json()).then(setStats);
            fetch('/api/permissions?workerId=' + session.user.id)
                .then(r => r.json())
                .then(setPerms);
        }
    }, [session]);

    async function handleQuery(question: string) {
        setLoading(true);
        try {
            const res = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, workerId: session?.user?.id || 1 }),
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen text-sm text-gray-400">
                Loading...
            </div>
        );
    }

    const isAdmin = session?.user?.role === 'admin';
    const isManager = session?.user?.role === 'manager';
    const canUseAI = perms['ai_query'] === true || isAdmin || isManager;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div>
                    <h1 className="text-base font-medium text-gray-900">CareInsight AI</h1>
                    <p className="text-xs text-gray-400">Social Care Dashboard</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{session?.user?.name}</span>
                    <span className="text-xs px-2 py-1 rounded-full border border-gray-200 text-gray-500 capitalize">
                        {session?.user?.role}
                    </span>
                    {isAdmin && (
                        <button
                            onClick={() => router.push('/admin')}
                            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                        >
                            Admin
                        </button>
                    )}
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                    >
                        Sign out
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

                {stats && (
                    <div className="grid grid-cols-5 gap-4">
                        {perms['card_total_cases'] !== false && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Total cases</p>
                                <p className="text-3xl font-medium text-gray-900 mt-1">{stats.totalCases}</p>
                            </div>
                        )}
                        {perms['card_open_cases'] !== false && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Open cases</p>
                                <p className="text-3xl font-medium text-blue-600 mt-1">{stats.openCases}</p>
                            </div>
                        )}
                        {perms['card_high_risk'] !== false && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <p className="text-xs text-gray-400 uppercase tracking-wide">High risk</p>
                                <p className="text-3xl font-medium text-red-500 mt-1">{stats.highRisk}</p>
                            </div>
                        )}
                        {perms['card_alerts'] !== false && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Open alerts</p>
                                <p className="text-3xl font-medium text-orange-500 mt-1">{stats.alerts}</p>
                            </div>
                        )}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Over age 10</p>
                            <p className="text-3xl font-medium text-green-500 mt-1">{stats.over10}</p>
                        </div>
                    </div>
                )}

                {stats && (
                    <div className="grid grid-cols-3 gap-4">
                        {perms['chart_by_type'] !== false && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Cases by type</p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={stats.byType}>
                                        <XAxis dataKey="case_type" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        {perms['chart_by_city'] !== false && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Cases by city</p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={stats.byCity}>
                                        <XAxis dataKey="city" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        {perms['chart_by_risk'] !== false && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Cases by risk level</p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={stats.byRisk}
                                            dataKey="count"
                                            nameKey="risk_level"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={60}
                                            innerRadius={30}
                                            paddingAngle={3}
                                            label
                                        >
                                            {stats.byRisk.map((_: any, i: number) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                )}

                {canUseAI && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Ask a question</p>
                        <QueryBar onAsk={handleQuery} loading={loading} />
                        {result && (
                            <div className="mt-4 space-y-3">
                                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">{result.summary}</div>
                                {result.rows && <CaseTable rows={result.rows} />}
                            </div>
                        )}
                    </div>
                )}

                {!canUseAI && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                        <p className="text-sm text-gray-400">AI query is not available for your role. Contact your manager for access.</p>
                    </div>
                )}

            </div>
        </div>
    );
}