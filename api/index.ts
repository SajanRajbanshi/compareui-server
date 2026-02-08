import app from '../app.js';
import DatabaseService from '../services/database.service.js';

// Initialize DB connection once
DatabaseService.connect();

export default app;
