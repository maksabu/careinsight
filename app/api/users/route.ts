import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const workers = await query(
            'SELECT id, name, email, role, team, active FROM workers ORDER BY id ASC'
        );
        return NextResponse.json(workers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, role, team, active } = await req.json();
        const result = await query(
            'INSERT INTO workers (name, email, password, role, team, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [name, email, password, role, team, active]
        );
        const workerId = result[0].id;
        await query(
            'INSERT INTO dashboard_permissions (worker_id, permission_key, enabled) SELECT $1, p.key, true FROM (VALUES ($2), ($3), ($4), ($5), ($6), ($7), ($8), ($9)) AS p(key)',
            [workerId, 'card_total_cases', 'card_open_cases', 'card_high_risk', 'card_alerts', 'chart_by_type', 'chart_by_city', 'chart_by_risk', 'ai_query']
        );
        if (role === 'practitioner') {
            await query(
                'UPDATE dashboard_permissions SET enabled = false WHERE worker_id = $1 AND permission_key = $2',
                [workerId, 'ai_query']
            );
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}