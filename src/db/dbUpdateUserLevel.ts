import createError from 'http-errors';
import { updateDbItem } from '../lib/dynamodb-client.js';

export default async function dbUpdateUserLevel(token, seriesId, bookId) {
  try {
    const userId = token.sub;
    const now = new Date();

    const params = {
      Key:{
        primary_key: userId,
        sort_key: seriesId,
      },
      UpdateExpression: 'set updatedAt=:updatedAt, updatedBy=:updatedBy, #level=:level',
      ExpressionAttributeNames: {
        '#level': 'level'
      },
      ExpressionAttributeValues: {
        ':updatedAt': now.toISOString(),
        ':updatedBy': token.sub,
        ':level': bookId
      },
    };

    const user = await updateDbItem(params);

    user.userId = user.primary_key;
    user.seriesId = user.sort_key;
    delete user.primary_key;
    delete user.sort_key;

    return user;

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}