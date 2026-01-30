
import { sql } from '@vercel/postgres';

export default async function handler(request: Request) {
    // Handle CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (request.method === 'GET') {
        try {
            const result = await sql`SELECT * FROM player_interests ORDER BY created_at DESC;`;
            return new Response(JSON.stringify(result.rows), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store'
                },
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
        }
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { first_name, last_name, phone, age, sport, city, club } = await request.json();

        if (!first_name || !last_name || !phone || !age || !sport || !city) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Create table if not exists (lazy initialization for simplicity)
        await sql`
      CREATE TABLE IF NOT EXISTS player_interests (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        age INTEGER NOT NULL,
        sport VARCHAR(20) NOT NULL,
        city VARCHAR(100) NOT NULL,
        club VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        const result = await sql`
      INSERT INTO player_interests (first_name, last_name, phone, age, sport, city, club)
      VALUES (${first_name}, ${last_name}, ${phone}, ${age}, ${sport}, ${city}, ${club})
      RETURNING id, created_at;
    `;

        return new Response(JSON.stringify({
            success: true,
            message: 'Interest recorded',
            id: result.rows[0].id
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Database error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
