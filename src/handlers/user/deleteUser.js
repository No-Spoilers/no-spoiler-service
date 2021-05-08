import commonMiddleware from '../../lib/commonMiddleware';
import dbDeleteItem from '../../db/dbDeleteItem';
import dbQueryUserByEmail from '../../db/dbQueryUserByEmail';

async function deleteUser(event) {
  const { token } = event;
  let { email } = event.body;

  email = email.toLowerCase();

  const user = await dbQueryUserByEmail(email);

  if (user.userId !== token.sub) {
    return {
      statusCode: 401
    };
  }

  const result = await dbDeleteItem('user', email);

  if (!result) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `user:${email} not found.` }),
    };
  }

  const deletedUser = {
    name: result.name,
    email: result.preservedCaseEmail
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'user successfully deleted', deletedUser }),
  };
}

export const handler = commonMiddleware(deleteUser);
