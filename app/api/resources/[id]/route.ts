import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// PUT: Update a resource
interface ResourceUpdatePayload {
  name: string
  description: string
  location: string
  hours: string
  category: string
  coordinates: any
}

interface RequestParams {
  params: {
    id: string
  }
}

export async function PUT(req: Request, { params }: RequestParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, location, hours, category, coordinates } = await req.json()

    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: { name, description, location, hours, category, coordinates },
    })

    return NextResponse.json(resource)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 })
  }
}

// DELETE: Remove a resource
interface DeleteRequestParams {
  params: {
    id: string
  }
}

export async function DELETE(req: Request, { params }: DeleteRequestParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.resource.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Resource deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 })
  }
}

// POST: Add a review
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { rating, comment } = await req.json()

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
    })

    // Update the average rating for the resource
    const reviews = await prisma.review.findMany({
      where: { resourceId: params.id },
      select: { rating: true },
    })

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

    await prisma.resource.update({
      where: { id: params.id },
      data: { averageRating },
    })

    return NextResponse.json(newReview)
  } catch (error) {
    console.error("POST /api/resources/[id] error:", error)
    return NextResponse.json({ error: "Failed to add review" }, { status: 500 })
  }
}