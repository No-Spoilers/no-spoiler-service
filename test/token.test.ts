import { expect } from 'chai';

import { createNewToken, verifyToken, type User, type VerifiedToken } from '../src/lib/token.js';

describe('token', () => {
  it('should create a new verifiable token', () => {
    const user: User = {
      userId: 'test id'
    };

    const result = createNewToken(user);

    expect(typeof result).to.equal('string');

    const verifiedToken = verifyToken(result);

    expect(typeof verifiedToken).to.equal('object');
    expect(verifiedToken).to.have.all.keys(
      'iat',
      'exp',
      'sub',
      'jti'
    );
    
    if (verifiedToken && typeof verifiedToken === 'object' && 'sub' in verifiedToken) {
      expect((verifiedToken as VerifiedToken).sub).to.equal('test id');
    }
  });
});
