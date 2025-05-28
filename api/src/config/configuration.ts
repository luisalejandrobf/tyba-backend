/**
 * Configuration factory for the application
 * 
 * Loads environment variables and provides default values for application configuration.
 * This is used by NestJS ConfigModule to provide configuration throughout the application.
 * 
 * @returns Application configuration object
 */
export default () => ({
  // Server configuration
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    name: process.env.DATABASE_NAME || 'defaultdb',
    sslMode: process.env.DATABASE_SSL_MODE || 'require',
  },
  
  // JWT authentication configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  },
}); 