import AWS from 'aws-sdk';
import { env } from './env';

// Configure AWS SDK
AWS.config.update({
  region: env.AWS_REGION,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
});

// S3 Client
export const s3 = new AWS.S3({
  region: env.AWS_REGION,
});

// CloudWatch Logs Client
export const cloudWatchLogs = new AWS.CloudWatchLogs({
  region: env.AWS_REGION,
});

// Cognito Client (if needed)
export const cognito = new AWS.CognitoIdentityServiceProvider({
  region: env.AWS_REGION,
});

export const awsConfig = {
  region: env.AWS_REGION,
  s3Bucket: env.S3_BUCKET_NAME,
} as const;

