import createError from 'http-errors';
import dbQuerySeries from '../../db/dbQuerySeries.js';
import commonMiddleware, { HandlerEvent, HandlerContext, HandlerResponse } from '../../lib/commonMiddleware.js';

async function getSeries(_event: HandlerEvent, _context: HandlerContext): Promise<HandlerResponse> {
  try {
    const seriesList = await dbQuerySeries();

    return {
      statusCode: 200,
      body: JSON.stringify(seriesList),
    };
  } catch (error) {
    console.error('GET Series Error: ' + error);
    throw new createError.InternalServerError(error as string);
  }
}

export const handler = commonMiddleware(getSeries);
