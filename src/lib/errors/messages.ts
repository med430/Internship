/**
 * Standard error messages for the frontend.
 * These messages are user-friendly and do not reveal internal system details.
 */

export const ERROR_MESSAGES = {
  VALIDATION_ERROR: "Please check your input and try again",
  NOT_FOUND: "The requested resource was not found",
  UNAUTHORIZED: "Please sign in to continue",
  FORBIDDEN: "You don't have permission to access this resource",
  INTERNAL_ERROR: "Something went wrong. Please try again later",
  SERVICE_UNAVAILABLE: "Service is temporarily unavailable",
  BAD_REQUEST: "Invalid request",
  FILE_UPLOAD_FAILED: "Failed to upload file",
  FILE_PROCESSING_FAILED: "Unable to process file",
  DATABASE_ERROR: "Unable to complete your request",
  EXTERNAL_SERVICE_ERROR: "External service error",
  INVALID_FILE_FORMAT: "Invalid file format",
  MISSING_REQUIRED_FIELD: "Required field is missing",
  INVALID_CREDENTIALS: "Invalid credentials",
  SESSION_EXPIRED: "Your session has expired. Please sign in again",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later",
  CONFIGURATION_ERROR: "Service configuration error",
  TIMEOUT_ERROR: "Request timeout. Please try again",
  NETWORK_ERROR: "Network error. Please check your connection",
  GENERATION_FAILED: "Failed to generate content",
  ANALYSIS_FAILED: "Analysis failed",
  PROMPT_INJECTION: "Invalid content detected due to security or size limits.",
  UNKNOWN_ERROR: "An unexpected error occurred",
} as const;

export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
