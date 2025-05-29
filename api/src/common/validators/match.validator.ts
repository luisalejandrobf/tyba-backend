import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Custom validator decorator that checks if two properties match
 * 
 * This is commonly used to validate that password and confirmation fields match
 * 
 * @param property - The name of the property to compare with
 * @param validationOptions - Optional validation options
 * @returns Property decorator function
 * 
 * @example
 * ```typescript
 * export class RegisterDto {
 *   @IsString()
 *   password: string;
 * 
 *   @Match('password')
 *   passwordConfirmation: string;
 * }
 * ```
 */
export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        /**
         * Validates if the value matches the related property value
         * Uses any type for flexibility, so it can be used with any property
         */
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        /**
         * Provides a default error message
         */
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${propertyName} must match ${relatedPropertyName}`;
        },
      },
    });
  };
} 