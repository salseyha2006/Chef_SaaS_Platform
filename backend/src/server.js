const { validateEnv, env } = require('./config/env');
validateEnv();

const app = require('./app');
const { PrismaClient } = require('@prisma/client');
const { startSubscriptionCron } = require('./jobs/subscription.cron');

const prisma = new PrismaClient();

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    startSubscriptionCron();
    console.log('⏰ Subscription cron job scheduled');

    const server = app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port} [${env.nodeEnv}]`);
    });

    const gracefulShutdown = async () => {
      console.log('🛑 Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
