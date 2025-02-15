import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * Handles image upload for authenticated users.
 *
 * @param {Request} req - The HTTP request containing the image file.
 * @returns {Promise<NextResponse>} JSON response containing the uploaded image URL or an error message.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Authenticate the user via session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the form data to retrieve the uploaded file
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Define upload directory
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true }); // Ensure the directory exists

    // Generate a unique filename using user ID and timestamp
    const fileName = `${session.user.id}-${Date.now()}${path.extname(file.name)}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save it to the filesystem
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Construct the image URL for retrieval
    const imageUrl = `/uploads/${fileName}`;

    // Update the user's profile with the new avatar URL in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: imageUrl },
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}