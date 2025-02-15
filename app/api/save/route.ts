import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

/**
 * PUT request handler to update a user's profile data.
 * 
 * This function verifies that the user is authenticated, validates the input data, and updates 
 * the user's profile in the database. It returns an appropriate response based on success or failure.
 * 
 * @param {Request} req - The incoming HTTP request, containing the new user data.
 * @returns {NextResponse} - JSON response indicating the success or failure of the operation.
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
