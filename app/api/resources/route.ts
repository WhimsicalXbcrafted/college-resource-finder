/**
 * Resource API Route Handler
 * Handles CRUD operations for resources
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';

/**
 * GET: Retrieve all resources
 * @returns {Promise<NextResponse>} JSON response with resources or error
 */
export async function GET() {
    try {
        const resources = await prisma.resource.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        avatarUrl: true,
                        name: true
                    }
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true
                            }
                        }
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

/**
 * POST: Create a new resource
 * @param {Request} req - The request object
 * @returns {Promise<NextResponse>} JSON response with created resource or error
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const resource = await prisma.resource.create({
            data: {
                name: data.name,
                description: data.description || '',
                location: data.location || '',
                hours: data.hours || '',
                category: data.category || '',
                coordinates: data.coordinates || Prisma.JsonNull,
                userId: session.user.id
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        });

        return NextResponse.json(resource);
    } catch (error) {
        console.error('POST /api/resources error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create resource" }, 
            { status: 500 }
        );
    }
}