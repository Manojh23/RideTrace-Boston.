import { getConfig } from './config.js';
import { connectDatabase, closeDatabase } from './db/connection.js';
import { createApp } from './app.js';

const config = getConfig();
try {
  const db = await connectDatabase(config.mongoUri, config.dbName);
  const server = createApp(db, config).listen(config.port, () => {
    console.log(`RideTrace Boston running at http://localhost:${config.port}`);
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(() => closeDatabase().finally(() => process.exit(0)));
    });
  }
} catch (error) {
  console.error('Unable to start RideTrace Boston:', error.message);
  process.exitCode = 1;
}
