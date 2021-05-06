import createError from 'http-errors';
import validator from '@middy/validator';
import postSeriesSchema from '../../schemas/postSeriesSchema';
import commonMiddleware from '../../lib/commonMiddleware';
import dbCreateSeries from '../../db/dbCreateSeries';

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
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(postSeries)
  .use(validator({inputSchema: postSeriesSchema, useDefaults: true}));
