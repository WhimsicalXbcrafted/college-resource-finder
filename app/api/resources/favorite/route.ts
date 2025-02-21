import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * POST: Update favorite count for a resource.
 * @param {Request} req - The request object containing the resource ID.
 * @returns {Promise<NextResponse>} JSON response with updated resource or error.
 */
export async function POST(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { searchParams } = new URL(req.url);
      const resourceId = searchParams.get("id");
      const action = searchParams.get("action");
  
      if (!resourceId || !action) {
        return NextResponse.json({ error: "Resource ID and action are required" }, { status: 400 });
      }
  
      if (action === 'favorite') {
        // Check if the favorite record already exists
        const existing = await prisma.resourceFavorite.findUnique({
          where: {
            userId_resourceId: {
              resourceId: resourceId,
              userId: session.user.id,
            },
          },
        });

        if (existing) {
          return NextResponse.json({ message: "Already favorited" });
        }

        // Create a favorite record
        await prisma.resourceFavorite.create({
          data: {
            resourceId,
            userId: session.user.id,
          },
        });

        // Increment the favoriteCount
        const updatedResource = await prisma.resource.update({
          where: { id: resourceId },
          data: { favoriteCount: { increment: 1 } },
        });
        return NextResponse.json(updatedResource);
      } else if (action === 'unfavorite') {
        // Delete the favorite record
        await prisma.resourceFavorite.deleteMany({
          where: {
            resourceId,
            userId: session.user.id,
          },
        });

        // Decrement the favoriteCount
        const updatedResource = await prisma.resource.update({
          where: { id: resourceId },
          data: { favoriteCount: { decrement: 1 } },
        });
        return NextResponse.json(updatedResource);
      } else {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }
    } catch (error) {
      console.error("Error favoriting/unfavoriting resource:", error);
      return NextResponse.json({ error: "Failed to update favorite status" }, { status: 500 });
    }
  }