import db from '../db/database';
import { isUWEmail } from '../utils/emailValidator';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed'});
    }

    try {
        const { email, password } = req.body;

        // Validate UW email
        if (!isUWEmail(email)) {
            return res.status(400).json({ message: 'Please use a UW email address (@uw.edu)'});
        }

        // Check if user already exists
        const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
        if (user) {
            return res.status(400).json({ message: 'User already exists'});
        }

        // Hash the password 
        const hashedPassword = await bcrypt.hash(password, 10);

        const insert = db.prepare(`INSERT INTO users (email, password) VALUES (?, ?)`);
        const result = insert.run(email, hashedPassword);

        if (result.changes === 1) {
            return res.status(201).json({ message: 'User created successfully' });
        }

        return res.status(500).json({ message: 'Failed to create user' });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
}
