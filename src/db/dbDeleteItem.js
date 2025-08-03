import createError from 'http-errors';
import { deleteDbItem } from '../lib/dynamodb-client';

export default async function dbDeleteItem(primary_key, sort_key) {
  try {
    const result = await deleteDbItem(primary_key, sort_key);

    return result.Attributes;

  } catch (error) {
    if(error && error.code && error.code === 'ConditionalCheckFailedException') {
      return null;
    }

    console.error(error);
    throw new createError.InternalServerError(error);
  }
}