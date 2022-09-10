import commonMiddleware from '../../lib/commonMiddleware.js';

async function getRoot() {
  try {
    return {
      statusCode: 200
    }
  } catch (error) {
    console.error(error);
  }
}

export const handler = commonMiddleware(getRoot);
