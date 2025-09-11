import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import createError from 'http-errors';
import validator from '@middy/validator';
import { postSeriesSchema } from '../../schemas/postSeriesSchema.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { generateId } from '../../lib/base64id.js';
import { putDbItem } from '../../lib/dynamodb-client.js';

interface TokenData {
  sub: string;
  [key: string]: unknown;
}

interface SeriesRecord {
  primary_key: string;
  sort_key: string;
  name: string;
  text: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface SeriesResponse {
  seriesId: string;
  name: string;
  text: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface SeriesData {
  name: string;
  text: string;
  [key: string]: unknown;
}

interface PostSeriesEvent extends AuthLambdaEvent {
  body: SeriesData;
}

async function postSeries(event: PostSeriesEvent) {
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

export const handler = commonMiddleware(postSeries).use(
  validator({ eventSchema: postSeriesSchema }),
);

export async function dbCreateSeries(
  seriesData: SeriesData,
  token: TokenData,
): Promise<SeriesResponse> {
  const now = new Date().toISOString();

  const series: SeriesRecord = {
    primary_key: `t${generateId(10)}`,
    sort_key: 'TOP~',
    name: seriesData.name,
    text: seriesData.text,
    createdBy: token.sub,
    createdAt: now,
    updatedAt: now,
  };

  await putDbItem(series);

  const seriesResponse: SeriesResponse = {
    seriesId: series.primary_key,
    name: series.name,
    text: series.text,
    createdBy: series.createdBy,
    createdAt: series.createdAt,
    updatedAt: series.updatedAt,
  };

  return seriesResponse;
}
