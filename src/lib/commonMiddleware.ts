import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpEventNormalizer from '@middy/http-event-normalizer';
import { verifyToken } from './token.js';

function validateJwt() {
  return {
    before: (handler) => {
      if (handler.event.headers?.Authorization) {
        const [type, token] = handler.event.headers.Authorization.split(' ');
        if (type === 'Bearer' && typeof token !== 'undefined') {
          const tokenData = verifyToken(token);
          if (tokenData) {
            handler.event.token = tokenData;
          }
        }
      }
    }
  }
}

function logEvents() {
  return {
    before: (request) => {
      if (process.env.NODE_ENV !== 'test') {
        console.log({
          logType: 'incoming request',
          ...request.event
        });
      }
    },
    after: (handler) => {
      if (process.env.NODE_ENV !== 'test') {
        console.log({
          logType: 'request result',
          ...handler.event
        });
      }
    }
  }
}

function bodyNormalizer() {
  return {
    before: (handler) => {
      if (!handler.event.headers) {
        handler.event.headers = {};
      }
      if (!handler.event.headers['Content-Type']) {
        handler.event.headers['Content-Type'] = 'application/json';
        handler.event.body = handler.event.body || '{}';
      }
    }
  }
}

function commonMiddleware(handler) {
  return middy(handler)
    .use([
      bodyNormalizer(),
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
