/**
 * Resource API Route Handler
 * Handles CRUD operations for resources
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
                                avatarUrl: true
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

        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const location = formData.get('location') as string;
        const hours = formData.get('hours') as string;
        const category = formData.get('category') as string;
        const coordinates = formData.get('coordinates') as string;
        const image = formData.get('image') as Blob | null;

        let imageUrl = null;
        if (image) {
            try {
                // Create uploads directory if it doesn't exist
                const uploadDir = path.join(process.cwd(), "public/uploads");
                await mkdir(uploadDir, { recursive: true });

                // Generate unique filename
                const fileExtension = image.type.split('/')[1] || 'jpg';
                const fileName = `resource-${Date.now()}.${fileExtension}`;
                const filePath = path.join(uploadDir, fileName);

                // Save file
                const bytes = await image.arrayBuffer();
                const buffer = Buffer.from(bytes);
                await writeFile(filePath, buffer);

                imageUrl = `/uploads/${fileName}`;
            } catch (error) {
                console.error('Failed to save image:', error);
            }
        }

        const resource = await prisma.resource.create({
            data: {
                name,
                description,
                location,
                hours,
                category,
                coordinates,
                imageUrl,
                userId: session.user.id,
            },
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
                                avatarUrl: true
                            }
                        }
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

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const resourceId = searchParams.get('id');

        if (!resourceId) {
            return NextResponse.json({ error: "Resource ID required" }, { status: 400 });
        }

        // Check if user owns the resource
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId }
        });

        if (!resource || resource.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.resource.delete({
            where: { id: resourceId }
        });

        return NextResponse.json({ message: "Resource deleted" });
    } catch (error) {
        console.error('DELETE /api/resources error:', error);
        return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const resourceId = searchParams.get('id');
        const data = await req.json();

        if (!resourceId) {
            return NextResponse.json({ error: "Resource ID required" }, { status: 400 });
        }

        // Check if user owns the resource
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId }
        });

        if (!resource || resource.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updatedResource = await prisma.resource.update({
            where: { id: resourceId },
            data: {
                name: data.name,
                description: data.description || '',
                location: data.location || '',
                hours: data.hours || '',
                category: data.category || '',
                coordinates: data.coordinates || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        avatarUrl: true,
                        name: true
                    }
                }
            }
        });

        return NextResponse.json(updatedResource);
    } catch (error) {
        console.error('PUT /api/resources error:', error);
        return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
    }
}