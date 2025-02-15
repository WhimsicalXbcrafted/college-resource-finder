import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import nodemailer from 'nodemailer';

/**
 * Handles sending email notifications to a specified recipient.
 *
 * @param {Request} req - The HTTP request object containing the recipient's email.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Authenticate the user via session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract email from the request body
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Ensure email credentials exist in environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email credentials in environment variables.');
      return NextResponse.json({ error: 'Email service configuration error' }, { status: 500 });
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the notification email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Notification',
      text: 'This is a notification email.',
    });

    return NextResponse.json({ message: 'Email notification sent successfully' });
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
