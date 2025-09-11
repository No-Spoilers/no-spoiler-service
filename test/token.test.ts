import type { User } from '../src/lib/token.js';

import { expect } from 'chai';

import { createNewToken, verifyToken } from '../src/lib/token.js';

describe('token', () => {
  it('should create a new verifiable token', () => {
    const user: User = {
      userId: 'test id',
    };

    const result = createNewToken(user);

    expect(typeof result).to.equal('string');

    const verifiedToken = verifyToken(result);

    expect(typeof verifiedToken).to.equal('object');
    expect(verifiedToken).to.have.all.keys('iat', 'exp', 'sub', 'jti');

    if (!verifiedToken) {
      throw new Error('Verified token is false');
    }
    expect(verifiedToken.sub).to.equal('test id');
  });
});
