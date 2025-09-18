import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const folder = Array.isArray(fields.folder) ? fields.folder[0] : fields.folder || 'admin-uploads';
    const convertToWebp = fields.convertToWebp ? fields.convertToWebp[0] === 'true' : true;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let fileContent: Buffer = fs.readFileSync(file.filepath);
    let contentType = file.mimetype || 'application/octet-stream';
    let fileExtension = file.originalFilename?.split('.').pop() || 'jpg';
    
    // Convert images to WebP if requested and it's an image
    if (convertToWebp && file.mimetype?.startsWith('image/') && fileExtension !== 'webp') {
      try {
        fileContent = await sharp(fileContent)
          .webp({ quality: 85 })
          .toBuffer();
        contentType = 'image/webp';
        fileExtension = 'webp';
      } catch (error) {
        console.error('Error converting to WebP, using original format:', error);
        // Continue with original file if conversion fails
      }
    }
    
    // Generate unique filename
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
      ACL: 'public-read', // Make files publicly accessible
    });

    await s3Client.send(command);

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    // Return the file URL
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.status(200).json({
      success: true,
      fileUrl,
      key,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}