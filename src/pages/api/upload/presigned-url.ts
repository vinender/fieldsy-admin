import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { v4 as uuidv4 } from 'uuid';

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
    const { fileName, fileType, folder = 'admin-uploads' } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'Missing fileName or fileType' });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ];

    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Generate unique file name with webp extension for images
    const isImage = fileType.startsWith('image/');
    const fileExtension = isImage ? 'webp' : fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    // Create presigned post data
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.AWS_S3_BUCKET || 'fieldsy',
      Key: key,
      Conditions: [
        ['content-length-range', 0, 10485760], // Max 10MB
        ['starts-with', '$Content-Type', isImage ? 'image/' : fileType],
      ],
      Fields: {
        'Content-Type': isImage ? 'image/webp' : fileType,
        'x-amz-acl': 'public-read', // Make uploaded files publicly readable
      },
      Expires: 600, // 10 minutes
    });

    // Generate the final file URL
    const fileUrl = `https://${process.env.AWS_S3_BUCKET || 'fieldsy'}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    res.status(200).json({
      uploadUrl: url,
      fileUrl,
      fields,
      key,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};