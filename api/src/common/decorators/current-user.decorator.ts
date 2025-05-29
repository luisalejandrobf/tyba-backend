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
  (ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
); 