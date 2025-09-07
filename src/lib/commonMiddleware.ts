import type { MiddlewareObj, Request } from '@middy/core';
import type {
  Handler as LambdaHandler,
  LambdaFunctionURLEvent as LambdaEvent,
} from 'aws-lambda';
import type { VerifiedToken } from './token.js';

import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpEventNormalizer from '@middy/http-event-normalizer';
import { verifyToken } from './token.js';

export type AuthLambdaEvent = LambdaEvent & {
  token?: VerifiedToken;
};

function validateJwt(): MiddlewareObj<LambdaEvent> {
  return {
    before: (request: Request<LambdaEvent>): void => {
      if (!request.event.headers?.Authorization) return;

      const [type, token] = request.event.headers.Authorization.split(' ');

      if (!token || type !== 'Bearer') return;

      const tokenData = verifyToken(token);

      if (tokenData) {
        Object.assign(request.event, { token: tokenData });
      }
    },
  };
}

function logEvents(): MiddlewareObj<LambdaEvent> {
  return {
    before: (request: Request<LambdaEvent>): void => {
      if (process.env.NODE_ENV !== 'test') {
        console.log({
          logType: 'incoming request',
          ...request.event,
        });
      }
    },
    after: (request: Request<LambdaEvent>): void => {
      if (process.env.NODE_ENV !== 'test') {
        console.log({
          logType: 'request result',
          ...request.event,
        });
      }
    },
  };
}

function bodyNormalizer(): MiddlewareObj<LambdaEvent> {
  return {
    before: (request: Request<LambdaEvent>): void => {
      if (!request.event.headers) {
        request.event.headers = {};
      }
      if (!request.event.headers['Content-Type']) {
        request.event.headers['Content-Type'] = 'application/json';
        request.event.body = request.event.body || '{}';
      }
    },
  };
}

export function commonMiddleware(handler: LambdaHandler) {
  return middy(handler).use([
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
