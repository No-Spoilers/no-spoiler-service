import AWS from 'aws-sdk';
import generateId from '../lib/base64id.js';
import bcrypt from 'bcryptjs';
import dbQueryUserByEmail from './dbQueryUserByEmail.js';

export default async function dbCreateUser(name, preservedCaseEmail, password) {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
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

  user.email = user.preservedCaseEmail;
  delete user.primary_key;
  delete user.sort_key;
  delete user.preservedCaseEmail;
  delete user.passwordHash;

  return user;
}