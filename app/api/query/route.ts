import { NextRequest, NextResponse } from 'next/server';
import { askClaude } from '@/lib/claude';
import { query } from '@/lib/db';

function isSafeSQL(sql: string): boolean {
    const upper = sql.toUpperCase().trim();
    if (!upper.startsWith('SELECT')) return false;
    const blocked = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE'];
    for (const word of blocked) {
        if (upper.includes(word)) return false;
    }
    return true;
}

export async function POST(req: NextRequest) {
    try {
        const { question, workerId } = await req.json();
        if (!question) {
            return NextResponse.json({ error: 'No question' }, { status: 400 });
        }
        const { sql, summary } = await askClaude(question, workerId || 1);
        if (!isSafeSQL(sql)) {
            return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
        }
        const rows = await query(sql);
        return NextResponse.json({ sql, summary, rows });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}