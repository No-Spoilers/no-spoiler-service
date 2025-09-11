import type {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayEventIdentity,
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventMultiValueQueryStringParameters,
} from 'aws-lambda';
import type { Context } from 'aws-lambda';

// Are these insane? Yes. Do they work? Also yes.

const identity: APIGatewayEventIdentity = {
  accessKey: '',
  accountId: '',
  apiKey: '',
  apiKeyId: '',
  caller: '',
  clientCert: null,
  cognitoAuthenticationProvider: '',
  cognitoAuthenticationType: '',
  cognitoIdentityId: '',
  cognitoIdentityPoolId: '',
  principalOrgId: '',
  sourceIp: '',
  user: '',
  userAgent: '',
  userArn: '',
};

const requestContext: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext> &
  APIGatewayEventRequestContextV2 = {
  accountId: '',
  apiId: '',
  stage: '',
  requestId: '',
  domainName: '',
  domainPrefix: '',
  routeKey: '',
  authorizer: {},
  protocol: '',
  httpMethod: '',
  identity,
  path: '',
  requestTimeEpoch: 0,
  resourceId: '',
  resourcePath: '',
  http: {
    method: '',
    path: '',
    protocol: '',
    sourceIp: '',
    userAgent: '',
  },
  time: '',
  timeEpoch: 0,
};
const multiValueQueryStringParameters: APIGatewayProxyEventMultiValueQueryStringParameters =
  {};

export const event: APIGatewayProxyEvent & {
  multiValueQueryStringParameters: Exclude<
    APIGatewayProxyEvent['multiValueQueryStringParameters'],
    null
  >;
  pathParameters: APIGatewayProxyEvent['pathParameters'];
  queryStringParameters: APIGatewayProxyEvent['queryStringParameters'];
} & APIGatewayProxyEventV2 = {
  body: '',
  headers: {},
  isBase64Encoded: false,
  pathParameters: {},
  queryStringParameters: {},
  stageVariables: {},
  version: '',
  routeKey: '',
  rawPath: '',
  rawQueryString: '',
  requestContext,
  multiValueHeaders: {},
  httpMethod: '',
  path: '',
  multiValueQueryStringParameters,
  resource: '',
};

export const mockContext: Context = {
  functionName: 'testFunction',
  awsRequestId: '12345',
  callbackWaitsForEmptyEventLoop: false,
  functionVersion: '1',
  invokedFunctionArn:
    'arn:aws:lambda:us-east-1:123456789012:function:testFunction',
  logGroupName: '/aws/lambda/testFunction',
  logStreamName: '2025/01/01/[$LATEST]12345678901234567890123456789012',
  memoryLimitInMB: '128',
  getRemainingTimeInMillis: () => 1000,
  done: () => undefined,
  fail: () => undefined,
  succeed: () => undefined,
};
