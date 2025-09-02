import { readFileSync } from 'fs';
import { join } from 'path';
import commonMiddleware from '../../lib/commonMiddleware.js';

// Use a more robust path resolution that works both in source and compiled form
const packageJsonPath = join(process.cwd(), 'package.json');

function getHealth() {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    const responseBody = {
      packageVersion: packageJson.version
    };

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody)
    };
  } catch (error) {
    console.error('Health check failed:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Health check failed',
        message: 'Unable to read package information'
      })
    };
  }
}

export const handler = commonMiddleware(getHealth);
