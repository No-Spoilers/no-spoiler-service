import createError from 'http-errors';
import { searchDbItems } from '../lib/dynamodb-client.js';

export default async function dbQueryUserByEmail(email) {
  try {
    const normalizedEmail = email.toLowerCase();

    const params = {
      KeyConditions: {
        primary_key: {
          AttributeValueList: [{ S: 'user' }],
          ComparisonOperator: 'EQ'
        },
        sort_key: {
          AttributeValueList: [{ S: normalizedEmail }],
          ComparisonOperator: 'EQ'
        }
      }
    };

    const queryResult = searchDbItems(params);

    if (!Array.isArray(queryResult) || queryResult.length === 0) return null;

    return queryResult[0];
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}