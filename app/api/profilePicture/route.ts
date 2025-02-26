import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/option';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/upload
 *
 * Handles image uploads for authenticated users.
 *
 * Steps:
 * 1. Authenticate the user via session.
 * 2. Parse the incoming form data and retrieve the uploaded file.
 * 3. Validate that a file was provided.
 * 4. Ensure the upload directory exists.
 * 5. Generate a unique filename using the user ID and current timestamp.
 * 6. Save the file to the filesystem.
 * 7. Construct the public image URL.
 * 8. Update the user's profile with the new avatar URL in the database.
 * 9. Return a JSON response containing the image URL.
 *
 * @param req - The HTTP request containing form data with an "image" field.
 * @returns {Promise<NextResponse>} A JSON response with the uploaded image URL or an error message.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Authenticate the user via session.
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the form data to retrieve the uploaded file.
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Define the upload directory and ensure it exists.
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });

    // Generate a unique filename using the user ID and a timestamp.
    const fileName = `${session.user.id}-${Date.now()}${path.extname(file.name)}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert the file to a buffer and write it to disk.
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    // Construct the public image URL.
    const imageUrl = `/uploads/${fileName}`;

    // Update the user's profile with the new avatar URL.
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