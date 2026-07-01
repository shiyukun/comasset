# AWS Deployment

This project is a static site in `web/`, so the first AWS deployment target is S3 static website hosting.

## Current P0 Deployment Shape

- Build output: `dist/aws-site/`
- Hosting: Amazon S3 static website
- Entry file: `index.html`
- Fallback file: `404.html`
- Deploy script: `scripts/deploy_aws_s3_static_site.sh`

Important: the S3 website endpoint is public. This is acceptable only for a quick P0 preview. It is not a real family login layer.

## Required Local Setup

1. Install AWS CLI.
2. Configure AWS credentials with permission to manage one S3 bucket.
3. Choose a region and optional bucket name.

Minimum AWS actions used by the script:

- `sts:GetCallerIdentity`
- `s3:CreateBucket`
- `s3:HeadBucket`
- `s3:PutBucketPublicAccessBlock`
- `s3:PutBucketOwnershipControls`
- `s3:PutBucketWebsite`
- `s3:PutBucketPolicy`
- `s3:ListBucket`
- `s3:PutObject`
- `s3:DeleteObject`

## Build Locally

```bash
./scripts/build_static_site.sh
```

## Deploy

Default region is `us-west-2`.

```bash
AWS_REGION=us-west-2 ./scripts/deploy_aws_s3_static_site.sh
```

Optional custom bucket:

```bash
AWS_REGION=us-west-2 \
COMASSET_BUCKET=comasset-investment-lab-your-name \
./scripts/deploy_aws_s3_static_site.sh
```

## What Is Not Included Yet

- CloudFront distribution.
- HTTPS custom domain.
- Real login/authentication.
- Backend storage for notes or simulation runs.

For family-private hosting, the next version should use CloudFront with an authentication layer or a small backend login flow before moving family state off localStorage.
