import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { authOptions } from "../../auth/[...nextauth]/route"

// Initialize Prisma client for database interactions
const prisma = new PrismaClient()

/**
 * POST request handler to upload a profile image for the authenticated user.
 * @param {Request} req - The HTTP request object containing the form data.
 * @returns {NextResponse} - A JSON response containing the image URL or an error message.
 */
export async function POST(req: Request) {
  // Retrieve the current session to check user authentication
  const session = await getServerSession(authOptions)
  
  // Check if the user is authenticated; if not, return unauthorized response
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Parse the incoming form data
    const formData = await req.formData()
    
    // Retrieve the uploaded image from the form data
    const file = formData.get("image") as Blob
    
    // Check if the file was provided; if not, return a bad request response
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type (only images allowed)
    const mimeType = file.type
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
    }

    // Define the directory where uploaded files will be stored
    const uploadDir = path.join(process.cwd(), "public/uploads")
    
    // Ensure the uploads directory exists, creating it if necessary
    await mkdir(uploadDir, { recursive: true })

    // Convert the uploaded file from Blob to a Buffer (binary data format)
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate a unique filename based on the user ID and timestamp
    const fileExtension = file.type.split('/')[1] || 'jpg'
    const fileName = `${session.user.id}-${Date.now()}.${fileExtension}`
    const filePath = path.join(uploadDir, fileName)
    
    // Save the image file to the server
    await writeFile(filePath, buffer)
    
    // Construct the URL for accessing the uploaded image
    const imageUrl = `/uploads/${fileName}`

    // Update the user's profile in the database with the new image URL
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: imageUrl },
    })

    // Return the image URL as a successful response
    return NextResponse.json({ imageUrl })

  } catch (error) {
    // Log any errors that occur during the upload process
    console.error("Upload error:", error)

    // Return a generic error message if something goes wrong
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}