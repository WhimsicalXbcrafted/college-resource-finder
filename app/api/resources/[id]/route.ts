import { NextResponse } from 'next/server';
import db from '../../../db/database';

// PUT: Update a resource
interface ResourceUpdatePayload {
    name: string;
    description: string;
    location: string;
    hours: string;
    category: string;
    coordinates: any;
}

interface RequestParams {
    params: {
        id: string;
    };
}

export async function PUT(req: Request, { params }: RequestParams) {
    try {
        const { id } = params;
        const { name, description, location, hours, category, coordinates }: ResourceUpdatePayload = await req.json();

        db.prepare(`UPDATE resources SET name = ?, description = ?, location = ?, hours = ?, category = ?, coordinates = ?,
            updatedAt = CURRENT_TIMESTAMP WHERE id = ?`).run(name, description, location, hours, category, JSON.stringify(coordinates), id);
        
        const updatedResource = db.prepare(`SELECT * FROM resources WHERE id = ?`).get(id);

        return NextResponse.json({ resource: updatedResource });
    } catch (error) {
        console.error('Error updating resource:', error);
        return NextResponse.json({ message: 'Error updating resource' }, { status: 500 });
    }
}

// DELETE: Remove a resource
interface DeleteRequestParams {
    params: {
        id: string;
    };
}

export async function DELETE(req: Request, { params }: DeleteRequestParams) {
    try {
        const { id } = params;
        db.prepare(`DELETE FROM resources WHERE id = ?`).run(id);
        return NextResponse.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        return NextResponse.json({ message: 'Error deleting resource' }, { status: 500 });
    }
}