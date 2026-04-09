import Anthropic from '@anthropic-ai/sdk';
import { SCHEMA } from './schema';

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function askClaude(question: string, workerId: number) {

    const sqlResponse = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: 'You are a PostgreSQL query generator. You ONLY output raw SQL SELECT statements. Never explain, never refuse, never add markdown. Just output the SQL. If asked about cases, query the cases table. Always include worker_id = ' + workerId + ' in WHERE clause. Tables: workers(id,name,team,email), persons(id,name,dob,nhs_number,address), cases(id,person_id,worker_id,case_type,status,open_date,close_date,risk_level,last_contact), safeguarding_alerts(id,case_id,alert_type,alert_date,resolved), assessments(id,case_id,type,date_completed,outcome,risk_score). Output SQL only.',
        messages: [{ role: 'user', content: 'Generate SQL for: ' + question }],
    });

    const sql = sqlResponse.content[0].type === 'text'
        ? sqlResponse.content[0].text.trim()
        : '';

    const summaryResponse = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 150,
        messages: [{
            role: 'user',
            content: 'In one sentence, summarise this for a social worker: ' + question,
        }],
    });

    const summary = summaryResponse.content[0].type === 'text'
        ? summaryResponse.content[0].text.trim()
        : '';

    return { sql, summary };
}