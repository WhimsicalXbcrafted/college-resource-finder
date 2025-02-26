import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

/**
 * POST /api/resources/favorite
 *
 * Updates the favorite count for a resource by either "favoriting" or "unfavoriting".
 *
 * The endpoint expects two query parameters:
 * - id: the ID of the resource to update.
 * - action: either "favorite" or "unfavorite".
 *
 * Behavior:
 * - For "favorite":
 *   1. Checks if a favorite record already exists for the user/resource pair.
 *   2. If it exists, returns a message indicating the resource is already favorited.
 *   3. Otherwise, creates a new favorite record and increments the resource's favoriteCount.
 * - For "unfavorite":
 *   1. Deletes any existing favorite records for the user/resource pair.
 *   2. Decrements the resource's favoriteCount.
 *
 * Authentication:
 * - The user must be authenticated. Otherwise, a 401 Unauthorized response is returned.
 *
 * @param req - The incoming HTTP request containing the query parameters.
 * @returns {Promise<NextResponse>} A JSON response with the updated resource data or an error message.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Authenticate the user via session.
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract query parameters from the URL.
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("id");
    const action = searchParams.get("action");

    // Validate that both resourceId and action are provided.
    if (!resourceId || !action) {
      return NextResponse.json({ error: "Resource ID and action are required" },{ status: 400 });
    }

    // Handle the "favorite" action.
    if (action === "favorite") {
      // Check if a favorite record already exists for this user and resource.
      const existing = await prisma.resourceFavorite.findUnique({
        where: {
          userId_resourceId: {
            resourceId,
            userId: session.user.id,
          },
        },
      });

      // If already favorited, return a message.
      if (existing) {
        return NextResponse.json({ message: "Already favorited" });
      }

      // Create a new favorite record.
      await prisma.resourceFavorite.create({
        data: {
          resourceId,
          userId: session.user.id,
        },
      });

      // Increment the favoriteCount on the resource.
      const updatedResource = await prisma.resource.update({
        where: { id: resourceId },
        data: { favoriteCount: { increment: 1 } },
      });
      return NextResponse.json(updatedResource);
    } 
    // Handle the "unfavorite" action.
    else if (action === "unfavorite") {
      // Delete any favorite records for this user/resource pair.
      await prisma.resourceFavorite.deleteMany({
        where: {
          resourceId,
          userId: session.user.id,
        },
      });

      // Decrement the favoriteCount on the resource.
      const updatedResource = await prisma.resource.update({
        where: { id: resourceId },
        data: { favoriteCount: { decrement: 1 } },
      });
      return NextResponse.json(updatedResource);
    } 
    // Invalid action.
    else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error favoriting/unfavoriting resource:", error);
    return NextResponse.json({ error: "Failed to update favorite status" }, { status: 500 }
    );
  }
}