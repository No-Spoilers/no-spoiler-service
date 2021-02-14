import createError from 'http-errors';
import dbQuerySeries from '../../db/dbQuerySeries';
import commonMiddleware from '../../lib/commonMiddleware';

async function getSeries() {
  try {
    const seriesList = await dbQuerySeries();

    return {
      statusCode: 200,
      body: JSON.stringify(seriesList),
    }
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(getSeries);
