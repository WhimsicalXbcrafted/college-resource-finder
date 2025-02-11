import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Notification from UW Resource Finder',
        text: 'This is a notification from UW Resource Finder.',
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: 'Email notification sent successfully' });
    } catch (error) {
      console.error('Error sending email notification:', error);
      res.status(500).json({ error: 'Failed to send email notification' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
