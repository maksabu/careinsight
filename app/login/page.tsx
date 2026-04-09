'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin() {
        setLoading(true);
        setError('');
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });
        if (result?.ok) {
            router.push('/dashboard');
        } else {
            setError('Invalid email or password');
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm">
                <h1 className="text-xl font-medium text-gray-900 mb-1">CareInsight AI</h1>
                <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@careinsight.com"
                            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            placeholder="password"
                            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                        />
                    </div>
                    {error && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm hover:bg-gray-700 disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-6">
                    Demo login: sarah@careinsight.com / password123
                </p>
            </div>
        </div>
    );
}