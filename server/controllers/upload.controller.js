

const { createPresignedUploadUrl } = require('../services/s3');


const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);



async function getPresignedUrl(req, res, next) {
  try {
    const mimeType = req.query.mimeType || 'image/jpeg';

    if (!ALLOWED_TYPES.has(mimeType)) {
      return res.status(400).json({
        error: `Unsupported MIME type. Allowed: ${[...ALLOWED_TYPES].join(', ')}`,
      });
    }

    const result = await createPresignedUploadUrl(mimeType);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPresignedUrl };
