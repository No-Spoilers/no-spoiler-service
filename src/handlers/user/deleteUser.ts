import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';
import type {
  QueryCommandInput,
  ComparisonOperator,
} from '@aws-sdk/client-dynamodb';

import { extractStringValue, internalServerError } from '../../lib/utils.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { deleteDbItem } from '../../lib/dynamodb-client.js';
import { searchDbItems } from '../../lib/dynamodb-client.js';

interface UserRecord {
  userId: string;
  name: string;
  preservedCaseEmail: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface DeleteUserBody {
  email: string;
  [key: string]: unknown;
}

interface DeleteUserEvent extends AuthLambdaEvent {
  body: DeleteUserBody;
}

interface DeletedUserResponse {
  name: string;
  email: string;
}

export const handler = commonMiddleware(deleteUser);

async function deleteUser(event: DeleteUserEvent) {
  const { token } = event;
  let { email } = event.body;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  email = email.toLowerCase();

  const user = await dbQueryUserByEmail(email);

  if (!user) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `user:${email} not found.` }),
    };
  }

  if (user.userId !== token.sub) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'unauthorized' }),
    };
  }

  const result = await deleteDbItem('user', email);

  const deletedUser = result.Attributes;

  if (!deletedUser) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `user:${email} not found.` }),
    };
  }

  const responseUser: DeletedUserResponse = {
    name: extractStringValue(deletedUser.name),
    email: extractStringValue(deletedUser.preservedCaseEmail),
  };

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'user successfully deleted',
      responseUser,
    }),
  };
}

async function dbQueryUserByEmail(email: string): Promise<UserRecord | null> {
  try {
    const normalizedEmail = email.toLowerCase();

    const params: Partial<QueryCommandInput> = {
      KeyConditions: {
        primary_key: {
          AttributeValueList: [{ S: 'user' }],
          ComparisonOperator: 'EQ' as ComparisonOperator,
        },
        sort_key: {
          AttributeValueList: [{ S: normalizedEmail }],
          ComparisonOperator: 'EQ' as ComparisonOperator,
        },
      },
    };

    const queryResult = await searchDbItems(params);

    if (queryResult instanceof Error) {
      throw queryResult;
    }

    if (!Array.isArray(queryResult) || queryResult.length === 0) return null;

    // Convert DynamoDB AttributeValue to plain object
    const userRecord = queryResult[0];
    if (!userRecord) return null;

    const user: UserRecord = {
      userId: extractStringValue(userRecord.userId),
      name: extractStringValue(userRecord.name),
      preservedCaseEmail: extractStringValue(userRecord.preservedCaseEmail),
      passwordHash: extractStringValue(userRecord.passwordHash),
      createdAt: extractStringValue(userRecord.createdAt),
      updatedAt: extractStringValue(userRecord.updatedAt),
    };

    return user;
  } catch (error) {
    throw internalServerError(error);
  }
}
