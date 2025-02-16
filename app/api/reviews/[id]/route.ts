import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * DELETE: Delete a review by its ID.
 * 
 * This endpoint deletes a review from the database. It ensures that the request is
 * made by an authenticated user, verifies that the review exists, and confirms that
 * the review belongs to the user before deletion.
 *
 * @param req - The incoming HTTP request.
 * @param {Object} context - The context object containing route parameters.
 * @param {Object} context.params - The request parameters.
 * @param {string} context.params.id - The ID of the review to delete.
 * @returns {Promise<NextResponse>} A JSON response confirming deletion or an error message.
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviewId = params.id;
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