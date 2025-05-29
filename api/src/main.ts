import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { RegisterUserDto, LoginUserDto } from './interfaces/dtos/user';
import { TransactionResponseDto } from './interfaces/dtos/transaction/transaction-response.dto';
import { FindNearbyRestaurantsDto } from './interfaces/dtos/restaurant/find-nearby-restaurants.dto';
import { RestaurantResponseDto } from './interfaces/dtos/restaurant/restaurant-response.dto';
import { ApiResponseDto } from './interfaces/dtos/common/api-response.dto';

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
  const logger = new Logger('Bootstrap');
  logger.log('Starting Tyba Backend API application...');

  // Create NestJS application with detailed logging
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // Apply global validation pipe to validate all incoming requests
  app.useGlobalPipes(ValidationPipe);
  logger.log('Global validation pipe applied');
  
  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Tyba Backend API')
    .setDescription('The Tyba Backend API documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    // .addTag('users', 'User endpoints')
    .addTag('restaurants', 'Restaurant search endpoints')
    .addTag('transactions', 'Transaction history endpoints')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      RegisterUserDto,
      LoginUserDto,
      TransactionResponseDto,
      FindNearbyRestaurantsDto,
      RestaurantResponseDto,
      ApiResponseDto
    ],
    deepScanRoutes: true
  });
  
  const options = {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      displayRequestDuration: true,
    }
  };
  
  SwaggerModule.setup('api-docs', app, document, options);
  logger.log('Swagger documentation setup at /api-docs');
  
  // Start the server on the configured port or default to 3000
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

// Execute the bootstrap function
bootstrap();
