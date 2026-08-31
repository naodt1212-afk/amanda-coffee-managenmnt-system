import createApp from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`🚀 Amanda Coffee Café API running on port ${config.port}`);
  console.log(`Environment: ${config.env}`);
  console.log(`Health check: http://localhost:${config.port}/api/health`);
});
