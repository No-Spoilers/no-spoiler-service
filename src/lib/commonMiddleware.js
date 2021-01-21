import middy from '@middy/core';
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
          const payload = verifyToken(token);
          if (payload) {
            handler.event.validToken = true;
            handler.event.user = payload;
          }
        }
      }

      return next();
    }
  }
}

export default handler => middy(handler)
  .use([
    httpJsonBodyParser(),
    httpEventNormalizer(),
    httpErrorHandler(),
    validateJwt()
  ]);