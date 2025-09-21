import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';
import type {
  QueryCommandInput,
  ComparisonOperator,
} from '@aws-sdk/client-dynamodb';

import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import validator from '@middy/validator';
import { internalServerError, extractStringValue } from '../../lib/utils.js';
import { createNewToken } from '../../lib/token.js';
import { searchDbItems } from '../../lib/dynamodb-client.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { postLoginSchema } from '../../schemas/postLoginSchema.js';

interface UserRecord {
  userId: string;
  name: string;
  preservedCaseEmail: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface LoginBody {
  email: string;
  password: string;
}

interface LoginEvent extends AuthLambdaEvent {
  body: LoginBody;
}

interface LoginResponse {
  name: string;
  email: string;
  token: string;
}

interface DbUser {
  userId: string;
  name: string;
  preservedCaseEmail: string;
  passwordHash: string;
  [key: string]: unknown;
}

export const handler = commonMiddleware(postLogin).use(
  validator({ eventSchema: postLoginSchema }),
);

async function postLogin(event: LoginEvent) {
  const { email, password } = event.body;

  try {
    const user = await dbQueryUserByEmail(email);
    if (!user || !user.passwordHash) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: `Problem with email:${email} or password.`,
        }),
      };
    }

    const verified = await bcrypt.compare(password, user.passwordHash);
    if (!verified) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: `Problem with email:${email} or password.`,
        }),
      };
    }

    const dbUser: DbUser = {
      userId: user.userId,
      name: user.name,
      preservedCaseEmail: user.preservedCaseEmail,
      passwordHash: user.passwordHash,
    };

    const token = createNewToken(dbUser);

    const returnObject: LoginResponse = {
      name: dbUser.name,
      email: dbUser.preservedCaseEmail,
      token,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(returnObject),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
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
