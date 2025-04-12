import { NextResponse } from "next/server";
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";

/**
 * DELETE /api/reviews/[id]
 * 
 * Deletes a review by its ID.
 * 
 * Behavior:
 * - Validates the user's session to ensure they are authenticated.
 * - Checks if the review exists and if the authenticated user is the owner.
 * - Deletes the review if all checks pass.
 * 
 * Authentication:
 * - The user must be authenticated and the owner of the review. Otherwise, a 401 Unauthorized response is returned.
 * 
 * @param {Request} req - The incoming HTTP request.
 * @param {Object} context - The context object containing route parameters.
 * @param {Promise<{ id: string }>} context.params - A promise that resolves to the request parameters.
 * @returns {Promise<NextResponse>} A JSON response confirming deletion or an error message.
 */
export async function DELETE(req: Request,{ params }: { params: Promise<{ id: string }> }) {
  const { id: reviewId } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    // Fetch the review to verify its existence and ownership.
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Ensure that only the review owner can delete it.
    if (review.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.review.delete({ where: { id: reviewId } });
    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}