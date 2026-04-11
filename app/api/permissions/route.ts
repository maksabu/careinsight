import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get('workerId');
    if (!workerId) {
        return NextResponse.json({ error: 'No workerId' }, { status: 400 });
    }
    try {
        const perms = await query(
            'SELECT permission_key, enabled FROM dashboard_permissions WHERE worker_id = $1',
            [workerId]
        );
        const result: Record<string, boolean> = {};
        perms.forEach((p: any) => {
            result[p.permission_key] = p.enabled;
        });
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}