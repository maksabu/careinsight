'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QueryBar from '@/components/QueryBar';
import CaseTable from '@/components/CaseTable';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6'];

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status]);

    useEffect(() => {
        fetch('/api/stats')
            .then(r => r.text())
            .then(text => {
                try {
                    setStats(JSON.parse(text));
                } catch (e) {
                    console.error('Stats error:', text);
                }
            });
    }, []);

    async function handleQuery(question: string) {
        setLoading(true);
        try {
            const res = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, workerId: 1 }),
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    if (status === 'loading') return <div className="flex items-center justify-center min-h-screen text-sm text-gray-400">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top nav */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div>
                    <h1 className="text-base font-medium text-gray-900">CareInsight AI</h1>
                    <p className="text-xs text-gray-400">Social Care Dashboard</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">👤 {session?.user?.name}</span>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                    >
                        Sign out
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

                {/* Metric cards */}
                {stats && (
                    <div className="grid grid-cols-5 gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Total cases</p>
                            <p className="text-3xl font-medium text-gray-900 mt-1">{stats.totalCases}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Open cases</p>
                            <p className="text-3xl font-medium text-blue-600 mt-1">{stats.openCases}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">High risk</p>
                            <p className="text-3xl font-medium text-red-500 mt-1">{stats.highRisk}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Open alerts</p>
                            <p className="text-3xl font-medium text-orange-500 mt-1">{stats.alerts}</p>
                        </div>


                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Over age 10</p>
                            <p className="text-3xl font-medium text-green-500 mt-1">{stats.over10}</p>
                        </div>
                    </div>
                )}

                {/* Charts */}
                {stats && (
                    <div className="grid grid-cols-3 gap-4">
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
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Cases by risk level</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={stats.byRisk} dataKey="count" nameKey="risk_level" cx="50%" cy="50%" outerRadius={70} label>
                                        {stats.byRisk.map((_: any, i: number) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* AI Query section */}
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

            </div>
        </div>
    );
}