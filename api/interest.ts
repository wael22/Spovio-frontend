
import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // Handle CORS
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method === 'GET') {
        try {
            // Create table if not exists (lazy initialization)
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

            const result = await sql`SELECT * FROM player_interests ORDER BY created_at DESC;`;
            return response.status(200).json(result.rows);
        } catch (error) {
            console.error('Database error:', error);
            return response.status(500).json({ error: 'Database error' });
        }
    }

    if (request.method === 'POST') {
        try {
            const { first_name, last_name, phone, age, sport, city, club } = request.body;

            if (!first_name || !last_name || !phone || !age || !sport || !city) {
                return response.status(400).json({ error: 'Missing required fields' });
            }

            // Create table if not exists
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

            return response.status(201).json({
                success: true,
                message: 'Interest recorded',
                id: result.rows[0].id
            });

        } catch (error) {
            console.error('Database error:', error);
            return response.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return response.status(405).json({ error: 'Method Not Allowed' });
}
