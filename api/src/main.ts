import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Application bootstrap function
 * 
 * This function initializes the NestJS application:
 * 1. Creates the NestJS application instance
 * 2. Configures global pipes for validation
 * 3. Sets up Swagger API documentation
 * 4. Starts the HTTP server
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply global validation pipe to validate all incoming requests
  app.useGlobalPipes(ValidationPipe);
  
  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Tyba Backend API')
    .setDescription('The Tyba Backend API documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User endpoints')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  // Start the server on the configured port or default to 3000
  await app.listen(process.env.PORT ?? 3000);
}

// Execute the bootstrap function
bootstrap();
