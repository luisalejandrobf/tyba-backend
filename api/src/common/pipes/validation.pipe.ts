import { ValidationPipe as NestValidationPipe } from '@nestjs/common';

/**
 * Global validation pipe for request data validation
 * 
 * This pipe uses class-validator to validate incoming request data against DTO classes.
 * It's configured with the following options:
 * - whitelist: Strips properties not decorated with validation decorators
 * - forbidNonWhitelisted: Rejects requests with properties not in the DTO
 * - transform: Transforms primitive types to their TypeScript types
 * - enableImplicitConversion: Enables automatic type conversion
 * 
 * Applied globally in main.ts to validate all incoming requests
 */
export const ValidationPipe = new NestValidationPipe({
  whitelist: true, // Remove any properties that don't have any decorators
  forbidNonWhitelisted: true, // Throw an error if non-whitelisted values are provided
  transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
  transformOptions: {
    enableImplicitConversion: true, // Automatically convert primitives
  },
}); 