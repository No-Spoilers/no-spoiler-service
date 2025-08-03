import { readFileSync } from 'fs';
import commonMiddleware from '../../lib/commonMiddleware.js';

const packageJson = JSON.parse(readFileSync('./package.json'));

async function getHealth() {
  try {
    const responseBody = {
      packageVersion: packageJson.version
    };

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody)
    }
  } catch (error) {
    console.error(error);
  }
}

export const handler = commonMiddleware(getHealth);
