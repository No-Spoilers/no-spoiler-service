import commonMiddleware from '../../lib/commonMiddleware';
import dbDeleteItem from '../../db/dbDeleteItem';

async function deleteUser(event) {
  const { userId } = event.pathParameters;

  const deletedUser = await dbDeleteItem('user', userId);

  if (!deletedUser) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `"${userId}" not found.` }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'user successfully deleted', deletedUser }),
  };
}

export const handler = commonMiddleware(deleteUser);
