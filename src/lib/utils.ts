import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import createError from 'http-errors';

export function validateString(value: unknown): string {
  if (typeof value !== 'string') {
    throw badRequestError('expected a string, but got ' + typeof value);
  }
  return value;
}

export function extractStringValue(
  attrValue: AttributeValue | undefined,
): string {
  if (typeof attrValue?.S === 'string') {
    return attrValue.S;
  }
  return '';
}

export function success(body: unknown) {
  return {
    statusCode: 200,
    body,
  };
}

// 400
export function badRequestError(message: string) {
  console.error('badRequestError:', message);
  return new createError.BadRequest(message);
}

// 401
export function unauthorizedError(message: string) {
  console.error('unauthorizedError:', message);
  return new createError.Unauthorized(message);
}

// 404
export function notFoundError(contentId: string) {
  console.error('notFoundError:', contentId);
  return new createError.NotFound(`contentId:${contentId} not found`);
}

// 500
export function internalServerError(error: unknown) {
  console.error('internalServerError:', error);
  return new createError.InternalServerError(String(error));
}

export function logger(message: unknown) {
  if (process.env.NODE_ENV !== 'test') {
    console.log(message);
  }
}
