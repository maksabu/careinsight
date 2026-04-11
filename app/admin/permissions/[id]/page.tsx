'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const PERMISSION_LABELS: Record<string, string> = {
    card_total_cases: 'Card — Total cases',
    card_open_cases: 'Card — Open cases',
    card_high_risk: 'Card — High risk',
    card_alerts: 'Card — Open alerts',
    chart_by_type: 'Chart — Cases by type',
    chart_by_city: 'Chart — Cases by city',
    chart_by_risk: 'Chart — Cases by risk level',
    ai_query: 'AI natural language query',
};

export default function PermissionsPage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [perms, setPerms] = useState<Record<string, boolean>>({});
    const [worker, setWorker] = useState<any>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        if (session?.user?.role !== 'admin') router.push('/dashboard');
    }, [status, session]);

    useEffect(() => {
        fetch('/api/permissions?workerId=' + params.id)
            .then(r => r.json())
            .then(setPerms);
        fetch('/api/users/' + params.id)
            .then(r => r.json())
            .then(setWorker);
    }, []);

    async function handleSave() {
        await fetch('/api/permissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workerId: params.id, permissions: perms }),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    function toggle(key: string) {
        setPerms(prev => ({ ...prev, [key]: !prev[key] }));
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div>
                    <h1 className="text-base font-medium text-gray-900">CareInsight AI</h1>
                    <p className="text-xs text-gray-400">Dashboard Permissions</p>
                </div>
                <button
                    onClick={() => router.push('/admin')}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                >
                    Back to admin
                </button>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-6">
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                    {worker?.name || 'User'} permissions
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                    Role: {worker?.role} — Toggle which dashboard items this user can see
                </p>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                        <div
                            key={key}
                            className="flex items-center justify-between px-5 py-4 border-b last:border-0"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-900">{label}</p>
                                <p className="text-xs text-gray-400">{key}</p>
                            </div>
                            <button
                                onClick={() => toggle(key)}
                                className={
                                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ' +
                                    (perms[key] ? 'bg-gray-900' : 'bg-gray-200')
                                }
                            >
                                <span className={
                                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform ' +
                                    (perms[key] ? 'translate-x-6' : 'translate-x-1')
                                } />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSave}
                    className="w-full py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700"
                >
                    {saved ? 'Saved!' : 'Save permissions'}
                </button>
            </div>
        </div>
    );
}