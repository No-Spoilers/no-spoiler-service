import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import { internalServerError } from '../../lib/utils.js';
import { dbUpdateUserLevel } from '../../db/dbUpdateUserLevel.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { getDbItem } from '../../lib/dynamodb-client.js';

interface PostLevelBody {
  seriesId: string;
  bookId: string;
  [key: string]: unknown;
}

interface PostLevelEvent extends AuthLambdaEvent {
  body: PostLevelBody;
}

async function postLevel(event: PostLevelEvent) {
  // Currently only for saving a user's spoiler level in a given series.
  // The book ID represents how far the user has progressed, and therefor
  // what is or isn't a spoiler

  const { token } = event;
  const { seriesId, bookId } = event.body;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }
  if (!seriesId || !bookId) {
    return {
      statusCode: 400,
      body: { error: 'Series and book IDs are required.' },
    };
  }

  try {
    const book = await getDbItem(seriesId, bookId);

    if (!book) {
      return {
        statusCode: 400,
        body: { error: `Book with ID "${bookId}" in "${seriesId}" not found.` },
      };
    }

    const spoilerState = await dbUpdateUserLevel(token, seriesId, bookId);

    return {
      statusCode: 200,
      body: JSON.stringify(spoilerState),
    };
  } catch (error) {
    throw internalServerError(error);
  }
}

export const handler = commonMiddleware(postLevel);
