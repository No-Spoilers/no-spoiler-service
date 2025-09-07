import createError from 'http-errors';
import validator from '@middy/validator';
import postSeriesSchema from '../../schemas/postSeriesSchema.js';
import commonMiddleware, { HandlerEvent, HandlerResponse } from '../../lib/commonMiddleware.js';
import dbCreateSeries from '../../db/dbCreateSeries.js';

interface SeriesData {
  name: string;
  text: string;
  [key: string]: unknown;
}

interface PostSeriesEvent extends HandlerEvent {
  body: SeriesData;
  token?: {
    sub: string;
    userId: string;
    email: string;
    [key: string]: unknown;
  };
}

async function postSeries(event: PostSeriesEvent): Promise<HandlerResponse> {
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
    throw new createError.InternalServerError(error as string);
  }
}

export const handler = commonMiddleware(postSeries)
  .use(validator({ eventSchema: postSeriesSchema }));
