import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';



export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const workers = await query(
            'SELECT id, name, email, role, team, active FROM workers WHERE id = $1',
            [params.id]
        );
        return NextResponse.json(workers[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { name, email, password, role, team, active } = await req.json();
        await query(
            'UPDATE workers SET name=$1, email=$2, password=$3, role=$4, team=$5, active=$6 WHERE id=$7',
            [name, email, password, role, team, active, params.id]
        );
        if (role === 'practitioner') {
            await query(
                'UPDATE dashboard_permissions SET enabled = false WHERE worker_id = $1 AND permission_key = $2',
                [params.id, 'ai_query']
            );
        } else {
            await query(
                'UPDATE dashboard_permissions SET enabled = true WHERE worker_id = $1 AND permission_key = $2',
                [params.id, 'ai_query']
            );
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await query('DELETE FROM dashboard_permissions WHERE worker_id = $1', [params.id]);
        await query('DELETE FROM workers WHERE id = $1', [params.id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}