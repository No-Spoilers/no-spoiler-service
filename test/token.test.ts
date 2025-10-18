import type { User } from '../src/lib/token.js';

import { createNewToken, verifyToken } from '../src/lib/token.js';

describe('token', () => {
  it('should create a new verifiable token', () => {
    vi.stubEnv('TOKEN_SECRET', 'test secret');
    const user: User = {
      userId: 'test id',
    };

    const result = createNewToken(user);

    expect(typeof result).toBe('string');

    const verifiedToken = verifyToken(result);

    expect(typeof verifiedToken).toBe('object');
    expect(Object.keys(verifiedToken)).toEqual(['iat', 'exp', 'sub', 'jti']);

    if (!verifiedToken) {
      throw new Error('Verified token is false');
    }
    expect(verifiedToken.sub).toBe('test id');
  });
});
