import commonMiddleware from '../../lib/commonMiddleware.js';

async function getRoot() {
  return {
    statusCode: 200
  }
}

export const handler = commonMiddleware(getRoot);
