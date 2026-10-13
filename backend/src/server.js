import app from './app.js';
import { testConnection } from './config/database.js';
import { startNotificationScheduler, stopNotificationScheduler } from './jobs/notificationScheduler.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  console.log('----------------------------------------------------');
  console.log('   LifeDrone: Autonomous Medical Aerial Logistics   ');
  console.log('----------------------------------------------------');

  const isDbConnected = await testConnection();
  if (!isDbConnected) {
    console.error('❌ Failed to establish initial connection to MySQL database.');
    console.error('   Please ensure MySQL service is running and .env parameters are correct.');
  } else {
    console.log('✅ Connected to MySQL database "lifedrone".');
  }

  // Start periodic 5-minute tracking notifier & simulation tick
  startNotificationScheduler();

  const server = app.listen(PORT, () => {
    console.log(`🚀 LifeDrone backend server listening on port ${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   API Base URL: http://localhost:${PORT}/api`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\nGracefully shutting down LifeDrone server...');
    stopNotificationScheduler();
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap();
