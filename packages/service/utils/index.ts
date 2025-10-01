import { ApiResponse, ServiceError } from '../types';
import crypto from 'crypto';
import { friendlyWords } from 'friendlier-words';
import { v4 as uuidv4 } from 'uuid';

// Create a standardized API response

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponse<T> {
  return {
    success,
    data,
    message,
    error,
  };
}

export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return createApiResponse(true, data, message);
}

export function createErrorResponse(error: string): ApiResponse {
  return createApiResponse(false, undefined, undefined, error);
}

export function createServiceError(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): ServiceError {
  return new ServiceError(message, statusCode, code, details);
}

// Sanitize user input data to prevent XSS and other attacks
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // remove < and > characters
    .trim(); // trim whitespace
}

export const generateFileName = (bytes = 16) =>
  crypto.randomBytes(bytes).toString('hex');

export const generateRandomUsername = () => {
  const words = friendlyWords(2, '-');
  return words;
};

export function generateOTP(): string {
  // Generate a random 6-digit OTP using UUID for better randomness
  const uuid = uuidv4().replace(/\D/g, ''); // Remove non-digit characters
  // Take the first 6 digits, pad if necessary
  return uuid.slice(0, 6).padEnd(6, '0');
}
