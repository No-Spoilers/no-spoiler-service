import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import createHttpError from 'http-errors';

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

export function extractTextValue(attrValue: AttributeValue | undefined): {
  [key: string]: string;
} {
  if (attrValue && 'M' in attrValue && attrValue.M) {
    const text: { [key: string]: string } = {};
    Object.entries(attrValue.M).forEach(([key, value]) => {
      if (value && 'S' in value) {
        text[key] = value.S || '';
      }
    });
    return text;
  }
  return {};
}

export function success(body: unknown) {
  return {
    statusCode: 200,
    body: JSON.stringify(body),
  };
}

// 400
export function badRequestError(message: string) {
  log.error('badRequestError:', message);
  return new createHttpError.BadRequest(message);
}

// 401
export function unauthorizedError(message: string) {
  log.error('unauthorizedError:', message);
  return new createHttpError.Unauthorized(message);
}

// 404
export function notFoundError(contentId: string) {
  log.error('notFoundError:', contentId);
  return new createHttpError.NotFound(`contentId:${contentId} not found`);
}

// 500
export function internalServerError(body: unknown) {
  log.error('internalServerError:', body);
  return {
    statusCode: 500,
    body: JSON.stringify(body),
  };
}

export const log = {
  info: (...messages: unknown[]) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(...messages);
    }
  },
  error: (...messages: unknown[]) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(...messages);
    }
  },
};
