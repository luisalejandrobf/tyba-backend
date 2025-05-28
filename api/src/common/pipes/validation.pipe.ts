import { ValidationPipe as NestValidationPipe } from '@nestjs/common';

export const ValidationPipe = new NestValidationPipe({
  whitelist: true, // Remove any properties that don't have any decorators
  forbidNonWhitelisted: true, // Throw an error if non-whitelisted values are provided
  transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
  transformOptions: {
    enableImplicitConversion: true, // Automatically convert primitives
  },
}); 