import type { AttributeValue } from '@aws-sdk/client-dynamodb';

import createError from 'http-errors';
import { deleteDbItem } from '../lib/dynamodb-client.js';

interface DeleteResult {
  Attributes?: Record<string, AttributeValue>;
  [key: string]: unknown;
}

export async function dbDeleteItem(
  primary_key: string,
  sort_key: string,
): Promise<Record<string, AttributeValue> | null> {
  try {
    const result = (await deleteDbItem(
      { S: primary_key },
      { S: sort_key },
    )) as DeleteResult;

    return result.Attributes || null;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ConditionalCheckFailedException'
    ) {
      return null;
    }

    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}
