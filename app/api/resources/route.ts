import { NextResponse } from 'next/server';
import db from '../../db/database';

// GET: Retrieve all resources (or you could filter by user if neeeded)
export async function GET() {
    try {
        const resources = db.prepare(`SELECT * FROM resources`).all();
        return NextResponse.json({ resources });
    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.error();
    }
}

// POST: Create a new resource
interface Resource {
    id: number;
    userId: number;
    name: string;
    description: string;
    location: string;
    hours: string;
    category: string;
    coordinates: string;
}

interface PostRequestBody {
    userId: number;
    name: string;
    description: string;
    location: string;
    hours: string;
    category: string;
    coordinates: [number, number];
}

export async function POST(req: Request) {
    try {
        const { userId, name, description, location, hours, category, coordinates }: PostRequestBody = await req.json();

        const result = db.prepare(`INSERT INTO resources (userId, name, description, location, hours, category, coordinates)
            VALUES (?, ?, ?, ?, ?, ?, ?)`).run(userId, name, description, location, hours, category, JSON.stringify(coordinates));

        const newResource: Resource = db.prepare(`SELECT * FROM resources WHERE id = ?`).get(result.lastInsertRowid);

        return NextResponse.json({ resource: newResource }, { status: 201 });
    } catch (error) {
        console.error('Error creating resource:', error);
        return NextResponse.json({ message: 'Error creating resource' }, { status: 500 });
    }
}