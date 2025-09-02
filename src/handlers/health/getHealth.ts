import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import commonMiddleware from '../../lib/commonMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../../../package.json');

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
