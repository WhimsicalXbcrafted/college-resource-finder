import db from '../../db/database';
import { isUWEmail } from '../../utils/emailValidator';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!isUWEmail(email)) {
            return new Response(JSON.stringify({ message : 'Please use a UW email address (@uw.edu)'}), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
        if (user) {
            return new Response(JSON.stringify({ message: 'User already exists'}), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.prepare(`INSERT INTO users (email, password) VALUES (?, ?)`).run(email, hashedPassword);

        return new Response(JSON.stringify({ message: 'User created successfully'}), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Signup error:', error);
        return new Response(JSON.stringify({ message: 'Internal server error.'}), {
            status: 500,
            headers: { 'Content-type': 'application/json' },
        });
    }
}
