import createError from 'http-errors';
import dbQuerySeries from '../../db/dbQuerySeries.js';
import commonMiddleware, {
  HandlerResponse,
} from '../../lib/commonMiddleware.js';

async function getSeries(): Promise<HandlerResponse> {
  try {
    const seriesList = await dbQuerySeries();

    return {
      statusCode: 200,
      body: JSON.stringify(seriesList),
    };
  } catch (error) {
    console.error(`GET Series Error: ${error as string}`);
    throw new createError.InternalServerError(error as string);
  }
}

export const handler = commonMiddleware(getSeries);
