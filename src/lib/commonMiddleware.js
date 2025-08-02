import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpEventNormalizer from '@middy/http-event-normalizer';
import { verifyToken } from './token.js';

function validateJwt() {
  return {
    before: (handler, next) => {
      if (handler.event.headers?.Authorization) {
        const [type, token] = handler.event.headers.Authorization.split(' ');
        if (type === 'Bearer' && typeof token !== 'undefined') {
          const tokenData = verifyToken(token);
          if (tokenData) {
            handler.event.token = tokenData;
          }
        }
      }

      return next();
    }
  }
}

function logEvents() {
  return {
    before: (handler, next) => {
      if (process.env.NODE_ENV !== 'test') {
        console.log({
          logType: 'incoming request',
          ...handler.event
        });
      }
      return next();
    },
    after: (handler, next) => {
      if (process.env.NODE_ENV !== 'test') {
        console.log({
          logType: 'request result',
          ...handler.event
        });
      }
      return next();
    }
  }
}

function commonMiddleware(handler) {
  return middy(handler)
    .use([
      httpJsonBodyParser(),
      httpEventNormalizer(),
      httpErrorHandler(),
      cors(
        {
          origins: [
            'https://no-spoilers.net',
            'https://www.no-spoilers.net',
            'https://api.no-spoilers.net'
          ]
        }
      ),
      validateJwt(),
      logEvents()
    ]);
}
export default commonMiddleware;
