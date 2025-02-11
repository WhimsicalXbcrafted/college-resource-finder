import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../db/database';
import formidable, { Fields, Files } from 'formidable';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Wrap formidable form parsing in a Promise
const parseForm = (req: NextApiRequest): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Parse the incoming form
    const { fields, files } = await parseForm(req);

    // Ensure the file was uploaded
    const file = files.profilePicture as formidable.File | undefined;
    if (!file) {
      return res.status(400).json({ error: 'No profile picture uploaded' });
    }

    // Build the file path (relative to public folder)
    const filePath = path.join('/uploads', path.basename(file.filepath));

    // Ensure the email field exists
    const email = fields.email;
    if (!email) {
      return res.status(400).json({ error: 'Email field is required' });
    }

    // Update the user's avatarUrl in the database
    const stmt = db.prepare('UPDATE users SET avatarUrl = ? WHERE email = ?');
    stmt.run(filePath, email);

    return res.status(200).json({ avatarUrl: filePath });
  } catch (error) {
    console.error('Error processing profile picture upload:', error);
    return res.status(500).json({ error: 'Failed to update profile picture' });
  }
}