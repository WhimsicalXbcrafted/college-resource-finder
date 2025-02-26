import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/option';
import nodemailer from 'nodemailer';

/**
 * POST /api/notification
 *
 * Sends an email notification to the specified recipient.
 *
 * Steps:
 * 1. Authenticate the request using the current session.
 * 2. Parse the request body to extract the recipient's email address.
 * 3. Validate that an email address was provided.
 * 4. Ensure that the necessary email credentials are available in environment variables.
 * 5. Configure the nodemailer transporter (using Gmail in this example).
 * 6. Send the email with a simple subject and text.
 * 7. Return a success message if the email was sent; otherwise, return an appropriate error.
 *
 * @param req - The HTTP request containing JSON with the recipient's email.
 * @returns A JSON response indicating whether the notification was sent successfully.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Authenticate the user via session.
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the recipient email from the request body.
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Ensure that email credentials are set in environment variables.
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email credentials in environment variables.');
      return NextResponse.json({ error: 'Email service configuration error' }, { status: 500 });
    }

    // Configure the nodemailer transporter using Gmail service.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the email notification.
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