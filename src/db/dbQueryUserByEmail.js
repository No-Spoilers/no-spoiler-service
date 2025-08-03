import createError from 'http-errors';
import { searchDbItems } from '../lib/dynamodb-client';

export default async function dbQueryUserByEmail(email) {
  try {
    const normalizedEmail = email.toLowerCase();

    const params = {
      Key: {
        primary_key: 'user',
        sort_key: normalizedEmail
      }
    };

    return searchDbItems(params);
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}