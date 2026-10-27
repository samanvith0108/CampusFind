const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

const cloudinaryCredentials = [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
].map((value) => {
  const credential = value?.trim() || '';
  return /^your_/i.test(credential) ? '' : credential;
});
const configuredCredentialCount = cloudinaryCredentials.filter(Boolean).length;

if (configuredCredentialCount > 0 && configuredCredentialCount < cloudinaryCredentials.length) {
  throw new Error('Configure all three Cloudinary credentials or leave them all unset for local disk uploads.');
}

const cloudinaryConfigured = configuredCredentialCount === cloudinaryCredentials.length;

cloudinary.config({
  cloud_name: cloudinaryCredentials[0],
  api_key: cloudinaryCredentials[1],
  api_secret: cloudinaryCredentials[2],
  secure: true,
});

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

if (process.env.NODE_ENV === 'production' && !cloudinaryConfigured) {
  throw new Error('All three Cloudinary credentials must be configured in production for durable image storage.');
}

const cloudinaryConfigurationError = () => {
  const error = new Error(
    'Cloudinary image upload failed. Verify the cloud name, API key, and API secret belong to the same Cloudinary account.'
  );
  error.statusCode = 502;
  return error;
};

const verifyCloudinaryCredentials = async () => {
  if (!cloudinaryConfigured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('All three Cloudinary credentials must be configured in production.');
    }
    return;
  }

  try {
    await cloudinary.api.ping();
  } catch {
    throw new Error(
      'Cloudinary credentials failed verification. Copy the current cloud name, API key, and API secret from the same Cloudinary account.'
    );
  }
};

const cloudinaryStorage = {
  _handleFile: (req, file, callback) => {
    const publicId = crypto.randomUUID();
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'campusfind',
        public_id: publicId,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      (error, result) => {
        if (error) {
          callback(cloudinaryConfigurationError());
          return;
        }

        if (!result?.secure_url || !result.public_id) {
          callback(new Error('Cloudinary did not return a valid image URL.'));
          return;
        }

        callback(null, {
          path: result.secure_url,
          filename: result.public_id,
          public_id: result.public_id,
          size: result.bytes,
        });
      }
    );

    file.stream.pipe(stream);
  },
  _removeFile: (_req, file, callback) => {
    if (!file.public_id) {
      callback(null);
      return;
    }

    cloudinary.uploader.destroy(file.public_id, (error) =>
      callback(error ? cloudinaryConfigurationError() : null)
    );
  },
};

const storage = cloudinaryConfigured ? cloudinaryStorage : localStorage;

module.exports = { cloudinary, storage, cloudinaryConfigured, verifyCloudinaryCredentials };
