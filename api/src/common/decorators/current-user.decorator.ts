import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator that extracts the authenticated user from the request
 * 
 * This decorator simplifies access to the current user in controller methods
 * by extracting the user object that was previously attached by the JWT strategy
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: UserDto) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  // The data parameter is required by NestJS's API contract for parameter decorators
  // It enables future extensibility (e.g., @CurrentUser('email') to extract specific properties)
  (data: unknown, ctx: ExecutionContext) => {
    try {
      // Try to get the request from HTTP context
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    } catch (error) {
      // If we're in a test environment or non-HTTP context, 
      // try to get the user from the context directly
      const args = ctx.getArgs();
      // Check if one of the arguments is the user object
      for (const arg of args) {
        if (arg && typeof arg === 'object' && arg.id && arg.email) {
          return arg;
        }
      }
      // If no user is found, return null
      return null;
    }
  },
); 