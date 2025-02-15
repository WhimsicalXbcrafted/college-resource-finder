import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { authOptions } from "../../auth/[...nextauth]/route"

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * PUT request handler to update a user's settings, including personal information and password.
 * 
 * This function authenticates the user, validates and updates their profile information, 
 * and handles password changes with encryption. It returns an appropriate response indicating
 * success or failure based on the operation's result.
 * 
 * @param {Request} req - The incoming HTTP request, containing the updated user settings.
 * @returns {NextResponse} - JSON response with the status and the updated user data.
 */
export async function PUT(req: Request): Promise<NextResponse> {
  try {
    // Authenticate the user by checking the session.
    const session = await getServerSession(authOptions)
    
    // If the user is not authenticated, return a 401 Unauthorized response.
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse incoming JSON data from the request.
    const { 
      name, 
      email, 
      currentPassword, 
      newPassword,
      emailNotifications,
      pushNotifications 
    } = await req.json()

    // Verify if the user exists in the database.
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // If user is not found, return a 404 Not Found response.
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prepare data for the update operation.
    const updateData: any = {}

    // Conditionally update fields based on the incoming data to avoid unnecessary updates
    if (name && name !== user.name) updateData.name = name
    if (email && email !== user.email) updateData.email = email
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications

    // Handle password change logic if both current and new passwords are provided.
    if (newPassword && currentPassword) {
      // Verify if the current password is correct.
      const isValidPassword = user.password && await bcrypt.compare(currentPassword, user.password)
      
      // If the current password is incorrect, return a 400 Bad Request response.
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" }, 
          { status: 400 }
        )
      }

      // Hash the new password and add it to the update data.
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Only update if there are actual changes to the user data.
    if (Object.keys(updateData).length > 0) {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      })

      // Remove sensitive data (password) from the response before sending it back.
      const { password, ...userWithoutPassword } = updatedUser
      return NextResponse.json({
        user: userWithoutPassword,
        message: "Settings updated successfully"
      })
    }

    // Return a message if no changes were made.
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      message: "No changes to update"
    })

  } catch (error: any) {
    console.error("Update error:", error)
    
    // Handle specific Prisma error (e.g., email already in use).
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }

    // Return a generic error message for other errors.
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    )
  }
}