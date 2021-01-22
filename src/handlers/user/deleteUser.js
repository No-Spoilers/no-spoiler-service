import commonMiddleware from '../../lib/commonMiddleware';
import dbDeleteItem from '../../db/dbDeleteItem';

async function deleteUser(event) {
  let { email } = event.body;

  email = email.toLowerCase();

  const result = await dbDeleteItem('user', email);

  if (!result) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `user:${email} not found.` }),
    };
  }

  const deletedUser = {
    name: result.name,
    userId: result.userId,
    email: result.preservedCaseEmail
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'user successfully deleted', deletedUser }),
  };
}

export const handler = commonMiddleware(deleteUser);
