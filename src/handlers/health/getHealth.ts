import { readFile } from 'node:fs/promises';
import { join } from 'path';
import { internalServerError, success } from '../../lib/utils';

async function getHealth() {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');

    const file = await readFile(packageJsonPath, 'utf8');
    if (typeof file !== 'string') {
      throw new Error('Failed to read package.json');
    }

    const packageJson: unknown = JSON.parse(file);

    const responseBody = {
      status: 'success',
      version: (packageJson as { version?: string }).version ?? 'unknown',
    };

    return success(responseBody);
  } catch (error) {
    return internalServerError({
      status: 'error',
      reason: `${error as Error}`,
    });
  }
}

export const handler = getHealth;
