const DEVELOPMENT_JWT_SECRET = 'campusfind-dev-secret-key';

const getJwtSecret = () => {
  const configuredSecret = process.env.JWT_SECRET?.trim();

  if (configuredSecret) {
    if (process.env.NODE_ENV === 'production') {
      if (Buffer.byteLength(configuredSecret, 'utf8') < 32) {
        throw new Error('JWT_SECRET must be at least 32 bytes in production.');
      }
      if (/^(replace_with_|your_|example)/i.test(configuredSecret)) {
        throw new Error('JWT_SECRET must be a real randomly generated secret, not a placeholder.');
      }
    }
    return configuredSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
  }

  return DEVELOPMENT_JWT_SECRET;
};

module.exports = { getJwtSecret };
