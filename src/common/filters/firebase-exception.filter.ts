import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class FirebaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(FirebaseExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';

    // Handle Firebase Auth errors
    if (exception.code) {
      switch (exception.code) {
        case 'auth/id-token-expired':
          status = HttpStatus.UNAUTHORIZED;
          message = 'Firebase ID token has expired';
          error = 'TokenExpired';
          break;
        case 'auth/id-token-revoked':
          status = HttpStatus.UNAUTHORIZED;
          message = 'Firebase ID token has been revoked';
          error = 'TokenRevoked';
          break;
        case 'auth/invalid-id-token':
        case 'auth/argument-error':
          status = HttpStatus.UNAUTHORIZED;
          message = 'Invalid Firebase ID token';
          error = 'InvalidToken';
          break;
        case 'auth/user-not-found':
          status = HttpStatus.NOT_FOUND;
          message = 'User not found';
          error = 'UserNotFound';
          break;
        case 'auth/user-disabled':
          status = HttpStatus.FORBIDDEN;
          message = 'User account has been disabled';
          error = 'UserDisabled';
          break;
        default:
          if (exception.code.startsWith('auth/')) {
            status = HttpStatus.UNAUTHORIZED;
            message = exception.message || 'Authentication error';
            error = 'AuthenticationError';
          }
      }
    }

    // Handle Firestore errors
    if (exception.code === 5) {
      // NOT_FOUND
      status = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      error = 'NotFound';
    } else if (exception.code === 7) {
      // PERMISSION_DENIED
      status = HttpStatus.FORBIDDEN;
      message = 'Permission denied';
      error = 'PermissionDenied';
    } else if (exception.code === 6) {
      // ALREADY_EXISTS
      status = HttpStatus.CONFLICT;
      message = 'Resource already exists';
      error = 'AlreadyExists';
    }

    // Handle NestJS HTTP exceptions
    if (exception.getStatus && typeof exception.getStatus === 'function') {
      status = exception.getStatus();
      message = exception.message || message;
      error = exception.name || error;
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Error: ${message}`,
      exception.stack,
    );

    // Send error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    });
  }
}
