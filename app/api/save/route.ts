import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

/**
 * PUT /api/user/profile
 * 
 * Updates a user's profile data.
 * 
 * Behavior:
 * - Verifies the user's session to ensure they are authenticated.
 * - Validates the input data (name, emailNotifications, pushNotifications).
 * - Updates the user's profile in the database with the provided data.
 * - Returns the updated user data in the response.
 * 
 * Authentication:
 * - The user must be authenticated. Otherwise, a 401 Unauthorized response is returned.
 * 
 * Input Validation:
 * - `name`: Must be a non-empty string.
 * - `emailNotifications` and `pushNotifications`: Must be boolean values.
 * 
 * @param {Request} req - The incoming HTTP request containing the updated profile data in JSON format.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure, including the updated user data if successful.
 */
export async function PUT(req: Request): Promise<NextResponse> {
  try {
    // Authenticate the user by checking the session.
    const session = await getServerSession(authOptions)
    
    // If the user is not authenticated, return a 401 Unauthorized response.
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the incoming JSON data.
    const { name, emailNotifications, pushNotifications } = await req.json()

    // Validate the input data.
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 })
    }

    if (typeof emailNotifications !== 'boolean' || typeof pushNotifications !== 'boolean') {
      return NextResponse.json({ error: "Invalid notification preferences" }, { status: 400 })
    }

    // Update the user profile in the database.
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, emailNotifications, pushNotifications },
    })

    // Return a success response with the updated user data.
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    })
  } catch (error) {
    console.error('Error updating profile:', error)

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}