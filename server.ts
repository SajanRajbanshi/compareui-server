import app from './app.js';
import DatabaseService from './services/database.service.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // 1. Initialize Database
    await DatabaseService.connect();

    // 2. Start Express Server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
