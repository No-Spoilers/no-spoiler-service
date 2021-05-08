import createError from 'http-errors';
import dbQueryUserLevels from '../../db/dbQueryUserLevels';
import commonMiddleware from '../../lib/commonMiddleware';

async function getLevels(event) {
  try {
    const { token } = event;

    const seriesList = await dbQueryUserLevels(token.sub);

    return {
      statusCode: 200,
      body: JSON.stringify(seriesList),
    }
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(getLevels);
