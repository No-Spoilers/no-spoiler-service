import createError from 'http-errors';
import dbQuerySeries from '../../db/dbQuerySeries.js';
import commonMiddleware from '../../lib/commonMiddleware.js';

async function getSeries() {
  try {
    const seriesList = await dbQuerySeries();

    return {
      statusCode: 200,
      body: JSON.stringify(seriesList),
    }
  } catch (error) {
    console.error('GET Series Error: ' + error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(getSeries);
