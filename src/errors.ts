export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends Error {}

export const notFound = (message: string) => new ApiError(404, 'not_found', message);
