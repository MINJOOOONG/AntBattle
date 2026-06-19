import app from './app';
import { env } from './config/env';

const port = env.PORT;

app.listen(port, () => {
  console.log(`[antbattle-api] Server running on port ${port}`);
  console.log(`[antbattle-api] Environment: ${env.NODE_ENV}`);
  console.log(`[antbattle-api] Health check: http://localhost:${port}/api/health`);
});
