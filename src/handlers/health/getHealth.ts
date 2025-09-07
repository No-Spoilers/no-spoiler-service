import { readFileSync } from 'fs';
import { join } from 'path';
import commonMiddleware from '../../lib/commonMiddleware.js';

// Use a more robust path resolution that works both in source and compiled form
const packageJsonPath = join(process.cwd(), 'package.json');

function getHealth() {
  try {
    const file = readFileSync(packageJsonPath, 'utf8');
    if (typeof file !== 'string') {
      throw new Error('Failed to read package.json');
    }

    const packageJson: unknown = JSON.parse(file);

    if (typeof packageJson !== 'object' || packageJson === null || !('version' in packageJson)) {
      throw new Error('Failed to parse package.json');
    }

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
