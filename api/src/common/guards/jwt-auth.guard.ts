import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for protecting routes with JWT authentication
 * 
 * This guard uses Passport's JWT strategy to validate tokens in the request.
 * It can be applied to controllers or individual route handlers to restrict access
 * to authenticated users only.
 * 
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('protected')
 * getProtectedResource() {
 *   // Only accessible with valid JWT token
 * }
 * ```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {} 