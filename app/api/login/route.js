import db from '../../db/database';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
        if (!user) {
            return new Response(JSON.stringify({ message: 'User not found'}), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return new Response(JSON.stringify({ message: 'Invalid password'}), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: 'Login successful'}), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Login error:', error);
        return new Response(JSON.stringify({ message: 'Internal server error.'}), {
            status: 500,
            headers: { 'Content-type': 'application/json' },
        });
    }
}