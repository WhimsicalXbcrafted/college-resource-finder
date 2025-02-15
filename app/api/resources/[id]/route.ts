import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * Interface for resource update payload
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
 * Interface for request parameters containing resource ID
 */
interface RequestParams {
  params: {
    id: string;
  };
}

/**
 * Updates an existing resource
 * @param req - HTTP request object containing the updated resource data
 * @param params - Request parameters containing the resource ID
 * @returns JSON response with the updated resource or an error message
 */
export async function PUT(req: Request, { params }: RequestParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedData: ResourceUpdatePayload = await req.json();
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
 * Deletes a resource
 * @param req - HTTP request object
 * @param params - Request parameters containing the resource ID
 * @returns JSON response confirming deletion or an error message
 */
export async function DELETE(req: Request, { params }: RequestParams) {
  try {
    // Ensure the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Delete the resource by ID
    await prisma.resource.delete({
      where: { id },
    });

    // Return a success message after deletion
    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    // Log the error and return an appropriate response
    console.error("DELETE /api/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}

/**
 * Adds a review to a resource
 * @param req - HTTP request object containing the review data
 * @param params - Request parameters containing the resource ID
 * @returns JSON response with the new review or an error message
 */
export async function POST(req: Request, { params }: RequestParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rating, comment } = await req.json();
    
    // Create new review
    const newReview = await prisma.review.create({
      data: {
        resourceId: params.id,
        userId: session.user.id,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Calculate the new average rating
    const reviews = await prisma.review.findMany({
      where: { resourceId: params.id },
      select: { rating: true },
    });

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    // Update the resource with the new average rating
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