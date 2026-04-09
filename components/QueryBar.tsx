'use client';
import { useState } from 'react';

const SUGGESTIONS = [
    'Show my open high-risk cases',
    'Which cases had no contact this week?',
    'How many children under 5 in my caseload?',
    'Show safeguarding alerts this month',
    'How many cases were opened this month?',
];

interface Props {
    onAsk: (question: string) => void;
    loading: boolean;
}

export default function QueryBar({ onAsk, loading }: Props) {
    const [question, setQuestion] = useState('');

    function handleAsk() {
        if (!question.trim()) return;
        onAsk(question);
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAsk()}
                    placeholder="Ask about your caseload..."
                    className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                />
                <button
                    onClick={handleAsk}
                    disabled={loading}
                    className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    {loading ? 'Thinking...' : 'Ask'}
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                    <button
                        key={s}
                        onClick={() => onAsk(s)}
                        className="px-3 py-1 border rounded-full text-xs text-gray-500 hover:bg-gray-50"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}