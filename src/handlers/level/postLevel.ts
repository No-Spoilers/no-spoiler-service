import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import { extractStringValue, internalServerError } from '../../lib/utils.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { getDbItem } from '../../lib/dynamodb-client.js';
import { updateDbItem } from '../../lib/dynamodb-client.js';

interface TokenData {
  sub: string;
  [key: string]: unknown;
}

interface UserLevelResponse {
  userId: string;
  seriesId: string;
  level: string;
  updatedAt: string;
  updatedBy: string;
}

interface PostLevelBody {
  seriesId: string;
  bookId: string;
  [key: string]: unknown;
}

interface PostLevelEvent extends AuthLambdaEvent {
  body: PostLevelBody;
}

export const handler = commonMiddleware(postLevel);

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

async function dbUpdateUserLevel(
  token: TokenData,
  seriesId: string,
  bookId: string,
): Promise<UserLevelResponse> {
  try {
    const userId = token.sub;
    const now = new Date();

    const params = {
      TableName: process.env.NO_SPOILERS_TABLE_NAME || 'NoSpoilersTable-dev',
      Key: {
        primary_key: { S: userId },
        sort_key: { S: seriesId },
      },
      UpdateExpression:
        'set updatedAt=:updatedAt, updatedBy=:updatedBy, #level=:level',
      ExpressionAttributeNames: {
        '#level': 'level',
      },
      ExpressionAttributeValues: {
        ':updatedAt': { S: now.toISOString() },
        ':updatedBy': { S: token.sub },
        ':level': { S: bookId },
      },
    };

    const user = await updateDbItem(params);

    if (!user) {
      throw new Error('Failed to update user level');
    }

    const userLevelResponse: UserLevelResponse = {
      userId: extractStringValue(user.primary_key),
      seriesId: extractStringValue(user.sort_key),
      level: extractStringValue(user.level),
      updatedAt: extractStringValue(user.updatedAt),
      updatedBy: extractStringValue(user.updatedBy),
    };

    return userLevelResponse;
  } catch (error) {
    throw internalServerError(error);
  }
}
