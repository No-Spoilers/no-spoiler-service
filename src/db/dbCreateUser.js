import AWS from 'aws-sdk';
import generateId from '../lib/base64id';
import bcrypt from 'bcryptjs';
import dbQueryUserByEmail from './dbQueryUserByEmail';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbCreateUser(name, preservedCaseEmail, password) {
  const email = preservedCaseEmail.toLowerCase();
  const now = new Date();

  const result = await dbQueryUserByEmail(email);
  if (result) {
    result.existing = true;
    return result;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    primary_key: 'user',
    sort_key: email,
    userId:`u${generateId(10)}`,
    name,
    preservedCaseEmail,
    passwordHash,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Item: user
  };

  await dynamodb.put(params).promise();

  return user;
}