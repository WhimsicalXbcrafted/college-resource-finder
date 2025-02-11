import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET: Retrieve all resources (or you could filter by user if neeeded)
export async function GET() {
    try {
        const resources = await prisma.resource.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        image: true,
                    }
                }
            }
        });
        return NextResponse.json(resources);
    } catch (error) {
        console.error('GET /api/resources error:', error);
        return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
    }
}

// POST: Create a new resource
interface Review {
    id: number;
    userId: number;
    rating: number;
    comment: string;
}

interface Resource {
    id: number;
    userId: number;
    name: string;
    description: string;
    location: string;
    hours: string;
    category: string;
    coordinates: [number, number];
    createdAt: Date;
    reviews: Review[];
    averageRating: number;
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
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const resource = await prisma.resource.create({
            data: {
                ...data,
                userId: session.user.id,
                coordinates: data.coordinates ? JSON.stringify(data.coordinates) : null
            }
        });

        return NextResponse.json(resource);
    } catch (error) {
        console.error('POST /api/resources error:', error);
        return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
    }
}