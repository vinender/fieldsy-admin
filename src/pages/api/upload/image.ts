import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const folder = Array.isArray(fields.folder) ? fields.folder[0] : fields.folder || 'settings';

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Generate unique filename
    const ext = path.extname(file.originalFilename || '');
    const uniqueName = `${folder}-${crypto.randomBytes(16).toString('hex')}${ext}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Move file to uploads directory
    const newPath = path.join(uploadsDir, uniqueName);
    const data = await fs.readFile(file.filepath);
    await fs.writeFile(newPath, data);
    
    // Clean up temp file
    await fs.unlink(file.filepath);
    
    // Return URL
    const url = `/uploads/${folder}/${uniqueName}`;
    
    res.status(200).json({ 
      success: true,
      url,
      filename: uniqueName
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}