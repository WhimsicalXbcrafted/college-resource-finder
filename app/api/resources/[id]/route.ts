import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * Interface representing the payload for updating a resource.
 */
interface ResourceUpdatePayload {
  name: string;
  description: string;
  location: string;
  hours: string;
  category: string;
  coordinates: any;
}

/**
 * Interface representing request parameters containing the resource ID.
 */
interface RequestParams {
  params: {
    id: string;
  };
}

/**
 * PUT /api/resources/[id]
 *
 * Updates an existing resource using the JSON payload provided in the request body.
 * Only authenticated users (and the resource owner) can update the resource.
 *
 * @param req - The HTTP request object containing updated resource data in JSON format.
 * @param params - Request parameters containing the resource ID.
 * @returns A JSON response with the updated resource or an error message.
 */
export async function PUT(req: Request, { params }: RequestParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse updated resource data from the request body.
    const updatedData: ResourceUpdatePayload = await req.json();

    // Update the resource with the new data.
    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: updatedData,
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("PUT /api/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
  }
}

/**
 * DELETE /api/resources/[id]
 *
 * Deletes a resource specified by the resource ID in the query parameters.
 * Only authenticated users and the resource owner can delete the resource.
 *
 * @param req - The HTTP request object.
 * @param params - Request parameters containing the resource ID.
 * @returns A JSON response confirming deletion or an error message.
 */
export async function DELETE(req: Request, { params }: RequestParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Delete the resource.
    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}

/**
 * POST /api/resources/[id]
 *
 * Adds a review to the resource specified by the resource ID in the parameters.
 * After creating the review, it recalculates and updates the resource's average rating.
 * Only authenticated users can add reviews.
 *
 * The expected JSON payload should include:
 * {
 *   "rating": number,
 *   "comment": string | null
 * }
 *
 * @param req - The HTTP request containing the review data in JSON format.
 * @param params - Request parameters containing the resource ID.
 * @returns A JSON response with the newly created review or an error message.
 */
export async function POST(req: Request, { params }: RequestParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse review data from the request body.
    const { rating, comment } = await req.json();
    
    // Create a new review.
    const newReview = await prisma.review.create({
      data: {
        resourceId: params.id,
        userId: session.user.id,
        rating,
        comment,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        userId: true,
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Retrieve all reviews for the resource to recalculate the average rating.
    const reviews = await prisma.review.findMany({
      where: { resourceId: params.id },
      select: { rating: true },
    });

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    // Update the resource with the new average rating.
    await prisma.resource.update({
      where: { id: params.id },
      data: { averageRating },
    });

    return NextResponse.json(newReview);
  } catch (error) {
    console.error("POST /api/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to add review" }, { status: 500 });
  }
}