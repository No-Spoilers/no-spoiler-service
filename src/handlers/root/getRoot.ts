import { commonMiddleware } from '../../lib/commonMiddleware.js';

function getRoot() {
  return Promise.resolve({
    statusCode: 200,
  });
}

export const handler = commonMiddleware(getRoot);
