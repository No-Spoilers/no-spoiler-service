import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync('./package.json'));

async function getHealth() {
  try {
    const responseBody = {
      nodeVersion: process.version,
      packageVersion: packageJson.version,
      test: true
    };

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody)
    }
  } catch (error) {
    console.error(error);
  }
}

export const handler = getHealth;
