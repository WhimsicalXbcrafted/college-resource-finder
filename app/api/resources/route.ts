import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Helper function to handle image upload.
 * 
 * This function saves an image file to the server's public/uploads directory and returns the URL path to the uploaded image.
 * 
 * @param {Blob | null} image - The image file to be uploaded.
 * @returns {Promise<string | null>} The URL path to the uploaded image or null if no image is provided or if the upload fails.
 */
const handleImageUpload = async (image: Blob | null): Promise<string | null> => {
  if (!image) return null;

  try {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    const fileExtension = image.type.split("/")[1] || "jpg";
    const fileName = `resource-${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await image.arrayBuffer());
    await writeFile(filePath, buffer);

    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Image upload failed:", error);
    return null;
  };
};

/**
 * GET /api/resources
 * 
 * Retrieves all resources from the database, including user details, reviews, and favorites.
 * 
 * Behavior:
 * - Fetches all resources with associated user, reviews, and favorites data.
 * - Checks if the current user has favorited each resource and adds an `isFavorited` flag to the response.
 * 
 * Authentication:
 * - No authentication is required to fetch resources.
 * 
 * @returns {Promise<NextResponse>} A JSON response containing the list of resources or an error message.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const resources = await prisma.resource.findMany({
      include: {
        user: { select: { id: true, email: true, avatarUrl: true, name: true } },
        reviews: {
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
        favorites: true,
      },
    });

    const resourcesWithFavorites = resources.map((resource) => ({
      ...resource,
      isFavorited: session ? resource.favorites.some((fav) => fav.userId === session.user.id) : false,
    }));

    return NextResponse.json(resourcesWithFavorites);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  };
};

/**
 * POST /api/resources
 * 
 * Creates a new resource in the database.
 * 
 * Behavior:
 * - Validates the user's session to ensure they are authenticated.
 * - Extracts form data from the request, including an optional image file.
 * - Uploads the image (if provided) and saves the resource with the associated image URL.
 * - Returns the newly created resource with user and review details.
 * 
 * Authentication:
 * - The user must be authenticated. Otherwise, a 401 Unauthorized response is returned.
 * 
 * @param {Request} req - The incoming HTTP request containing the form data.
 * @returns {Promise<NextResponse>} A JSON response with the created resource or an error message.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData();
    const newResource = {
      name: formData.get("name")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      location: formData.get("location")?.toString() || "",
      hours: formData.get("hours")?.toString() || "",
      category: formData.get("category")?.toString() || "",
      coordinates: formData.get("coordinates")?.toString() || "",
      imageUrl: await handleImageUpload(formData.get("image") as Blob),
    };

    const resource = await prisma.resource.create({
      data: {
        ...newResource,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, email: true, avatarUrl: true, name: true } },
        reviews: {
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error creating resource:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create resource";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  };
};

/**
 * DELETE /api/resources
 * 
 * Deletes a resource by its ID.
 * 
 * Behavior:
 * - Validates the user's session to ensure they are authenticated.
 * - Checks if the resource exists and if the authenticated user is the owner.
 * - Deletes the resource if all checks pass.
 * 
 * Authentication:
 * - The user must be authenticated and the owner of the resource. Otherwise, a 401 Unauthorized response is returned.
 * 
 * @param {Request} req - The incoming HTTP request containing the resource ID as a query parameter.
 * @returns {Promise<NextResponse>} A JSON response with a success message or an error message.
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("id");

    if (!resourceId) return NextResponse.json({ error: "Resource ID required" }, { status: 400 });

    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource || resource.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    await prisma.resource.delete({ where: { id: resourceId } });

    return NextResponse.json({ message: "Resource deleted" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  };
};

/**
 * PUT /api/resources
 * 
 * Updates a resource by its ID.
 * 
 * Behavior:
 * - Validates the user's session to ensure they are authenticated.
 * - Checks if the resource exists and if the authenticated user is the owner.
 * - Extracts form data from the request, including an optional image file.
 * - Updates the resource with the provided data and uploads a new image (if provided).
 * - Returns the updated resource with user and review details.
 * 
 * Authentication:
 * - The user must be authenticated and the owner of the resource. Otherwise, a 401 Unauthorized response is returned.
 * 
 * @param {Request} req - The incoming HTTP request containing the resource ID and updated data.
 * @returns {Promise<NextResponse>} A JSON response with the updated resource or an error message.
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("id");
    const formData = await req.formData();

    if (!resourceId) return NextResponse.json({ error: "Resource ID required" }, { status: 400 });

    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource || resource.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const updateData: Record<string, any> = {};
    const fields = ["name", "description", "location", "hours", "category", "coordinates"];
    fields.forEach((field) => {
      const value = formData.get(field)
      if (value !== null) updateData[field] = value
    });

    const imageFile = formData.get("image") as Blob | null;
    if (imageFile && imageFile.size > 0) {
      updateData.imageUrl = await handleImageUpload(imageFile);
    }

    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, avatarUrl: true, name: true } },
        reviews: {
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
      },
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
  };
};