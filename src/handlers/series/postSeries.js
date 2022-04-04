import createError from 'http-errors';
import validator from '@middy/validator';
import postSeriesSchema from '../../schemas/postSeriesSchema.js';
import commonMiddleware from '../../lib/commonMiddleware.js';
import dbCreateSeries from '../../db/dbCreateSeries.js';

async function postSeries(event) {
  const seriesData = event.body;
  const { token } = event;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  try {
    const series = await dbCreateSeries(seriesData, token);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'new item successfully added', series }),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(postSeries)
  .use(validator({ inputSchema: postSeriesSchema, useDefaults: true }));
