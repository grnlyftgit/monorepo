import * as z from 'zod';
import { validatorTypes } from '../types';

export function validator<T extends z.ZodSchema>({
  schema,
  body,
}: validatorTypes & { schema: T }):
  | { success: true; data: z.infer<T>; error: null }
  | { success: false; data: z.infer<T>; error: string };

export function validator<T extends z.ZodSchema>({
  schema,
  body,
}: validatorTypes & { schema: T }) {
  try {
    const result = schema.parse(body);
    return {
      success: true as const,
      data: result as z.infer<T>,
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => {
          const field = issue.path.join('.');
          if (issue.code === 'invalid_type') {
            return `Missing Field: ${field}`;
          } else {
            return `${field ? `Invalid Field: ${field} -> ` : ''}${issue.message}`;
          }
        })
        .join(', ');

      return {
        success: false as const,
        data: body as z.infer<T>,
        error: errorMessages,
      };
    }
    return {
      success: false as const,
      data: body as z.infer<T>,
      error: 'Validation failed',
    };
  }
}
