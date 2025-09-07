import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpEventNormalizer from '@middy/http-event-normalizer';
import { verifyToken } from './token.js';

interface TokenData {
  userId: string;
  email: string;
  [key: string]: unknown;
}

interface HandlerEvent {
  headers?: Record<string, string>;
  body?: unknown;
  token?: TokenData;
  [key: string]: unknown;
}

interface HandlerContext {
  [key: string]: unknown;
}

interface HandlerRequest {
  event: HandlerEvent;
  context: HandlerContext;
}

interface HandlerResponse {
  statusCode: number;
  body?: string;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

type HandlerFunction = (
  event: HandlerEvent,
  context: HandlerContext,
) => HandlerResponse | Promise<HandlerResponse>;

type TypedHandlerFunction<T = HandlerEvent> = (
  event: T,
  context: HandlerContext,
) => HandlerResponse | Promise<HandlerResponse>;

function validateJwt() {
  return {
    before: (handler: HandlerRequest): void => {
      if (handler.event.headers?.Authorization) {
        const [type, token] = handler.event.headers.Authorization.split(' ');
        if (type === 'Bearer' && typeof token !== 'undefined') {
          const tokenData = verifyToken(token);
          if (tokenData) {
            handler.event.token = tokenData;
          }
        }
      }
    },
  };
}

function logEvents() {
  return {
    before: (request: HandlerRequest): void => {
      if (process.env.NODE_ENV !== 'test') {
        console.log({
          logType: 'incoming request',
          ...request.event,
        });
      }
    },
    after: (handler: HandlerRequest): void => {
      if (process.env.NODE_ENV !== 'test') {
        console.log({
          logType: 'request result',
          ...handler.event,
        });
      }
    },
  };
}

function bodyNormalizer() {
  return {
    before: (handler: HandlerRequest): void => {
      if (!handler.event.headers) {
        handler.event.headers = {};
      }
      if (!handler.event.headers['Content-Type']) {
        handler.event.headers['Content-Type'] = 'application/json';
        handler.event.body = handler.event.body || '{}';
      }
    },
  };
}

function commonMiddleware<T = HandlerEvent>(handler: TypedHandlerFunction<T>) {
  return middy(handler as HandlerFunction).use([
    bodyNormalizer(),
    httpJsonBodyParser(),
    httpEventNormalizer(),
    httpErrorHandler(),
    cors({
      origins: [
        'https://no-spoilers.net',
        'https://www.no-spoilers.net',
        'https://api.no-spoilers.net',
      ],
    }),
    validateJwt(),
    logEvents(),
  ]);
}

export default commonMiddleware;
export type {
  HandlerEvent,
  HandlerResponse,
  HandlerFunction,
  TypedHandlerFunction,
  TokenData,
};
