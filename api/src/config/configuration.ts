/**
 * Configuration factory for the application
 * 
 * Loads environment variables and provides default values for application configuration.
 * This is used by NestJS ConfigModule to provide configuration throughout the application.
 * 
 * @returns Application configuration object
 */
export default () => {
  // Print environment variables from process.env
  console.log('Configuration factory called with process.env variables:');
  console.log('PORT:', process.env.PORT);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
  console.log('DATABASE_PORT:', process.env.DATABASE_PORT);
  console.log('DATABASE_USER:', process.env.DATABASE_USER);
  console.log('DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD ? '[REDACTED]' : undefined);
  console.log('DATABASE_NAME:', process.env.DATABASE_NAME);
  console.log('DATABASE_SSL_MODE:', process.env.DATABASE_SSL_MODE);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[REDACTED]' : undefined);
  console.log('JWT_EXPIRATION:', process.env.JWT_EXPIRATION);

  // The configuration object
  const config = {
    // Server configuration
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database configuration
    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || '1234',
      name: process.env.DATABASE_NAME || 'postgres',
      sslMode: process.env.DATABASE_SSL_MODE || 'prefer',
    },
    
    // JWT authentication configuration
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRATION || '1h',
    },
  };

  // Log the final configuration that will be used
  console.log('Final configuration values:');
  console.log('port:', config.port);
  console.log('database.host:', config.database.host);
  console.log('database.port:', config.database.port);
  console.log('database.user:', config.database.user);
  console.log('database.name:', config.database.name);
  console.log('database.sslMode:', config.database.sslMode);
  
  return config;
}; 