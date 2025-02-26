import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/option'; 
import bcrypt from 'bcryptjs'; 

/**
 * POST /api/user/update-password
 * 
 * Updates the authenticated user's password.
 * 
 * Behavior:
 * - Verifies the user's session to ensure they are authenticated.
 * - Validates that the provided current password matches the stored password.
 * - Hashes the new password for secure storage.
 * - Updates the user's password in the database.
 * - Returns a success or error response based on the outcome of the operation.
 * 
 * Authentication:
 * - The user must be authenticated. Otherwise, a 401 Unauthorized response is returned.
 * 
 * Input Validation:
 * - `currentPassword`: Must match the user's current password.
 * - `newPassword`: Must be a non-empty string.
 * 
 * @param {Request} req - The incoming HTTP request containing the current and new password in JSON format.
 * @returns {Promise<NextResponse>} A JSON response indicating the outcome of the password update process.
 */
export async function POST(req: Request) {
  try {
    // Retrieve the session from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.user?.id) {return NextResponse.json({ error: 'Unauthorized' },{ status: 401 });
    };

    // Parse the request body to get the current and new password
    const { currentPassword, newPassword } = await req.json();

    // Find the user from the database using the authenticated user's ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // If the user doesn't exist, return a 404 response
    if (!user) {
      return NextResponse.json({ error: 'User not found' },{ status: 404 });
    };

    // Compare the current password with the stored password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password!);

    // If the current password is incorrect, return a 401 response
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' },{ status: 401 });
    };

    // Hash the new password before saving it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    // Return a success response after the password is updated
    return NextResponse.json({ message: 'Password updated successfully' },{ status: 200 });
  } catch (error) {
    // Log the error for debugging and return a failure response
    console.error('Password update error:', error);

    return NextResponse.json({ error: 'Failed to update password' },{ status: 500 });
  }
}