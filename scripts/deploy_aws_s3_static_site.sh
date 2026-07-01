#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_DIR="${SITE_DIR:-${ROOT_DIR}/dist/aws-site}"
AWS_REGION="${AWS_REGION:-us-west-2}"
BUCKET_NAME="${COMASSET_BUCKET:-}"
AWS_CLI="${AWS_CLI:-aws}"

if ! command -v "${AWS_CLI}" >/dev/null 2>&1; then
  if [[ -x "${HOME}/Library/Python/3.9/bin/aws" ]]; then
    AWS_CLI="${HOME}/Library/Python/3.9/bin/aws"
  fi
fi

if ! command -v "${AWS_CLI}" >/dev/null 2>&1; then
  echo "AWS CLI is required but was not found in PATH." >&2
  echo "Install AWS CLI, configure credentials, then rerun this script." >&2
  exit 1
fi

"${ROOT_DIR}/scripts/build_static_site.sh" "${SITE_DIR}"

ACCOUNT_ID="$("${AWS_CLI}" sts get-caller-identity --query Account --output text)"
if [[ -z "${BUCKET_NAME}" ]]; then
  BUCKET_NAME="comasset-investment-lab-${ACCOUNT_ID}-${AWS_REGION}"
fi

if "${AWS_CLI}" s3api head-bucket --bucket "${BUCKET_NAME}" >/dev/null 2>&1; then
  echo "Using existing bucket: ${BUCKET_NAME}"
else
  echo "Creating bucket: ${BUCKET_NAME}"
  if [[ "${AWS_REGION}" == "us-east-1" ]]; then
    "${AWS_CLI}" s3api create-bucket --bucket "${BUCKET_NAME}" >/dev/null
  else
    "${AWS_CLI}" s3api create-bucket \
      --bucket "${BUCKET_NAME}" \
      --create-bucket-configuration "LocationConstraint=${AWS_REGION}" >/dev/null
  fi
fi

"${AWS_CLI}" s3api put-public-access-block \
  --bucket "${BUCKET_NAME}" \
  --public-access-block-configuration \
  BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false >/dev/null

"${AWS_CLI}" s3api put-bucket-ownership-controls \
  --bucket "${BUCKET_NAME}" \
  --ownership-controls 'ObjectOwnership=BucketOwnerEnforced' >/dev/null

"${AWS_CLI}" s3api put-bucket-website \
  --bucket "${BUCKET_NAME}" \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "404.html"}
  }' >/dev/null

POLICY_FILE="$(mktemp)"
cat > "${POLICY_FILE}" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForStaticWebsite",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
JSON

"${AWS_CLI}" s3api put-bucket-policy --bucket "${BUCKET_NAME}" --policy "file://${POLICY_FILE}" >/dev/null
rm -f "${POLICY_FILE}"

"${AWS_CLI}" s3 sync "${SITE_DIR}" "s3://${BUCKET_NAME}/" \
  --delete \
  --cache-control "no-cache" \
  --exclude ".DS_Store"

WEBSITE_URL="http://${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com"
echo "Deployed Comasset Investment Lab:"
echo "${WEBSITE_URL}"
echo
echo "Note: this S3 website URL is public. Use CloudFront auth or a backend login before storing sensitive family data server-side."
