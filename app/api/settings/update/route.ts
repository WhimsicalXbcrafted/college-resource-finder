import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authOptions } from "../../auth/[...nextauth]/option";

// Initialize Prisma client
const prisma = new PrismaClient();

// Define a custom type for the user update data.
interface UserUpdateData {
  name?: string;
  email?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  password?: string;
}

/**
 * PUT /api/user/settings
 * 
 * Updates a user's settings, including personal information and password.
 * 
 * Behavior:
 * - Verifies the user's session to ensure they are authenticated.
 * - Validates the input data (name, email, currentPassword, newPassword, emailNotifications, pushNotifications).
 * - Updates the user's profile in the database with the provided data.
 * - Handles password changes securely by hashing the new password.
 * - Returns the updated user data in the response, excluding sensitive information like the password.
 * 
 * Authentication:
 * - The user must be authenticated. Otherwise, a 401 Unauthorized response is returned.
 * 
 * Input Validation:
 * - `name`: Must be a non-empty string (optional).
 * - `email`: Must be a valid email format (optional).
 * - `currentPassword`: Required if `newPassword` is provided. Must match the user's current password.
 * - `newPassword`: Must be a non-empty string if provided.
 * - `emailNotifications` and `pushNotifications`: Must be boolean values (optional).
 * 
 * @param {Request} req - The incoming HTTP request containing the updated user settings in JSON format.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure, including the updated user data if successful.
 */
export async function PUT(req: Request): Promise<NextResponse> {
  try {
    // Authenticate the user by checking the session.
    const session = await getServerSession(authOptions);
    
    // If the user is not authenticated, return a 401 Unauthorized response.
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse incoming JSON data from the request.
    const { 
      name, 
      email, 
      currentPassword, 
      newPassword,
      emailNotifications,
      pushNotifications 
    } = await req.json();

    // Verify if the user exists in the database.
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    // If user is not found, return a 404 Not Found response.
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare data for the update operation using our custom type.
    const updateData: UserUpdateData = {};

    // Conditionally update fields based on the incoming data to avoid unnecessary updates.
    if (name && name !== user.name) updateData.name = name;
    if (email && email !== user.email) updateData.email = email;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;

    // Handle password change logic if both current and new passwords are provided.
    if (newPassword && currentPassword) {
      // Verify if the current password is correct.
      const isValidPassword = user.password && await bcrypt.compare(currentPassword, user.password);
      
      // If the current password is incorrect, return a 400 Bad Request response.
      if (!isValidPassword) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      // Hash the new password and add it to the update data.
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    // Only update if there are actual changes to the user data.
    if (Object.keys(updateData).length > 0) {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      });

      // Omit the password field.
      const { password: _, ...userWithoutPassword } = updatedUser; // eslint-disable-line @typescript-eslint/no-unused-vars
      return NextResponse.json({
        user: userWithoutPassword,
        message: "Settings updated successfully"
      });
    }

    // Return a message if no changes were made.
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      message: "No changes to update"
    });

  } catch (error: unknown) {
    console.error("Update error:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
