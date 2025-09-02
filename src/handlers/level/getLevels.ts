import createError from 'http-errors';
import dbQueryUserLevels from '../../db/dbQueryUserLevels.js';
import commonMiddleware, { HandlerEvent, HandlerContext, HandlerResponse } from '../../lib/commonMiddleware.js';

interface GetLevelsEvent extends HandlerEvent {
  token?: {
    sub: string;
    userId: string;
    email: string;
    [key: string]: unknown;
  };
}

async function getLevels(event: GetLevelsEvent, _context: HandlerContext): Promise<HandlerResponse> {
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
