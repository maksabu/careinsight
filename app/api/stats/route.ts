import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {

        const totalCases = await query(
            'SELECT COUNT(*) as count FROM cases WHERE worker_id = 1'
        );

        const openCases = await query(
            'SELECT COUNT(*) as count FROM cases WHERE worker_id = 1 AND status = $1',
            ['Open']
        );

        const highRisk = await query(
            'SELECT COUNT(*) as count FROM cases WHERE worker_id = 1 AND risk_level = $1 AND status = $2',
            ['High', 'Open']
        );

        const alerts = await query(
            'SELECT COUNT(*) as count FROM safeguarding_alerts sa JOIN cases c ON sa.case_id = c.id WHERE c.worker_id = 1 AND sa.resolved = false'
        );

        const byType = await query(
            'SELECT case_type, COUNT(*) as count FROM cases WHERE worker_id = 1 AND status = $1 GROUP BY case_type ORDER BY count DESC',
            ['Open']
        );

        const byRisk = await query(
            'SELECT risk_level, COUNT(*) as count FROM cases WHERE worker_id = 1 AND status = $1 GROUP BY risk_level',
            ['Open']
        );

        const byCity = await query(
            'SELECT SPLIT_PART(p.address, $1, -1) as city, COUNT(*) as count FROM cases c JOIN persons p ON c.person_id = p.id WHERE c.worker_id = 1 AND c.status = $2 GROUP BY city ORDER BY count DESC',
            [',', 'Open']
        );


        const over10 = await query(
            'SELECT COUNT(*) as count FROM cases c JOIN persons p ON c.person_id = p.id WHERE c.worker_id = 1 AND c.status = $1 AND EXTRACT(YEAR FROM AGE(p.dob)) > 2',
            ['Open']
        );

        return NextResponse.json({
            totalCases: parseInt(totalCases[0].count),
            openCases: parseInt(openCases[0].count),
            highRisk: parseInt(highRisk[0].count),
            alerts: parseInt(alerts[0].count),
            over10: parseInt(over10[0].count),   // over 10
            byType,
            byRisk,
            byCity,
        });

    } catch (error: any) {
        console.error('Stats error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}