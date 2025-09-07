import type { AttributeValue } from '@aws-sdk/client-dynamodb';

import createError from 'http-errors';
import { updateDbItem } from '../lib/dynamodb-client.js';

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

export async function dbUpdateUserLevel(
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
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

function extractStringValue(attrValue: AttributeValue | undefined): string {
  if (attrValue && 'S' in attrValue) {
    return attrValue.S || '';
  }
  return '';
}
