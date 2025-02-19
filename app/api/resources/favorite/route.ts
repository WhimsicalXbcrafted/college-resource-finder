import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST: Update favorite count for a resource.
 * @param {Request} req - The request object containing the resource ID.
 * @returns {Promise<NextResponse>} JSON response with updated resource or error.
 */
export async function POST(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const resourceId = searchParams.get("id");
      const action = searchParams.get("action");
  
      console.log("Resource ID:", resourceId);
      console.log("Action:", action);
  
      if (!resourceId || !action) {
        return NextResponse.json({ error: "Resource ID and action are required" }, { status: 400 });
      }
  
      let resource;
      if (action === 'favorite') {
        resource = await prisma.resource.update({
          where: { id: resourceId },
          data: { favoriteCount: { increment: 1 } },
        });
      } else if (action === 'unfavorite') {
        resource = await prisma.resource.update({
          where: { id: resourceId },
          data: { favoriteCount: { decrement: 1 } },
        });
      } else {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }
  
      console.log("Updated Resource:", resource);
      return NextResponse.json(resource);
    } catch (error) {
      console.error("Error favoriting/unfavoriting resource:", error);
      return NextResponse.json({ error: "Failed to update favorite status" }, { status: 500 });
    }
  }