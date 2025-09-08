import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';

import createError from 'http-errors';
import { dbQueryUserLevels } from '../../db/dbQueryUserLevels.js';

async function getLevels(event: AuthLambdaEvent) {
  try {
    const { token } = event;

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'invalid token' }),
      };
    }

    const seriesList = await dbQueryUserLevels(token.sub);

    return {
      statusCode: 200,
      body: JSON.stringify(seriesList),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

export const handler = commonMiddleware(getLevels);
