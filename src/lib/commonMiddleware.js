import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpEventNormalizer from '@middy/http-event-normalizer';
import { verifyToken } from './token';

const validateJwt = () => {
  return {
    before: (handler, next) => {
      if (handler.event.headers.Authorization) {
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

const log = () => {
  return {
    before: (handler, next) => {
      console.log(handler.event);
      return next();
    }
  }
}

export default handler => middy(handler)
  .use([
    httpJsonBodyParser(),
    httpEventNormalizer(),
    httpErrorHandler(),
    cors(
      // {
      //   origins: [
      //     'https://no-spoilers.com'
      //   ]
      // }
    ),
    validateJwt(),
    log()
  ]);