import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      name, 
      email, 
      currentPassword, 
      newPassword,
      emailNotifications,
      pushNotifications 
    } = await req.json()

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updateData: any = {}

    // Only update fields that are provided and changed
    if (name && name !== user.name) updateData.name = name
    if (email && email !== user.email) updateData.email = email
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications

    // Handle password change
    if (newPassword && currentPassword) {
      const isValidPassword = user.password && await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" }, 
          { status: 400 }
        )
      }
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      })

      // Remove sensitive data from response
      const { password, ...userWithoutPassword } = updatedUser
      return NextResponse.json({
        user: userWithoutPassword,
        message: "Settings updated successfully"
      })
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      message: "No changes to update"
    })

  } catch (error: any) {
    console.error("Update error:", error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    )
  }
} 