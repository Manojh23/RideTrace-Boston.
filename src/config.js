export function getConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const secret = env.APP_SECRET;
  if (production && (!secret || secret.length < 32 || secret.includes('REPLACE_'))) {
    throw new Error('Production requires APP_SECRET with at least 32 characters.');
  }
  if (production && !env.MONGODB_URI) {
    throw new Error('Production requires MONGODB_URI.');
  }
  return {
    production,
    port: Number(env.PORT || 3000),
    mongoUri: env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
    dbName: env.MONGODB_DB || 'ridetrace_boston',
    secret: secret || 'development-only-key-not-for-production',
  };
}
