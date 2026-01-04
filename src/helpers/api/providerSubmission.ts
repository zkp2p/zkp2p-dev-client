/**
 * Provider Submission API Service
 *
 * Handles uploading provider submissions to S3 via presigned URLs
 * obtained from the Curator API.
 */

import { PresignedUrlResponse, ProviderSubmission } from '@helpers/types/providerBuilder';

/**
 * Get the Curator API URL from environment variables
 * Falls back to a default development URL if not set
 */
const getCuratorApiUrl = (): string => {
  const envUrl = process.env.REACT_APP_CURATOR_API_URL;
  if (envUrl) {
    return envUrl;
  }
  // Default development URL
  console.warn('REACT_APP_CURATOR_API_URL not set, using default');
  return 'https://api.zkp2p.xyz';
};

/**
 * Get a presigned URL from the Curator API for uploading a provider submission
 *
 * @param platform - The platform name (e.g., "venmo", "paypal")
 * @param submitterAddress - Optional wallet address of the submitter
 * @returns Promise resolving to the presigned URL response
 * @throws Error if the request fails
 */
export const getPresignedUrl = async (
  platform: string,
  submitterAddress?: string
): Promise<PresignedUrlResponse> => {
  const curatorUrl = getCuratorApiUrl();

  // Build query parameters
  const params = new URLSearchParams();
  params.append('platform', platform);
  if (submitterAddress) {
    params.append('submitterAddress', submitterAddress);
  }

  const url = `${curatorUrl}/api/provider/presigned-url?${params.toString()}`;

  console.log('ProviderSubmission: Requesting presigned URL from:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ProviderSubmission: Failed to get presigned URL:', response.status, errorText);
    throw new Error(`Failed to get presigned URL: ${response.status} ${response.statusText}`);
  }

  const data: PresignedUrlResponse = await response.json();
  console.log('ProviderSubmission: Received presigned URL response:', {
    submissionId: data.submissionId,
    objectKey: data.objectKey,
  });

  return data;
};

/**
 * Upload a provider submission to S3 using a presigned URL
 *
 * @param uploadUrl - The presigned S3 PUT URL
 * @param submission - The provider submission payload to upload
 * @throws Error if the upload fails
 */
export const uploadSubmission = async (
  uploadUrl: string,
  submission: ProviderSubmission
): Promise<void> => {
  console.log('ProviderSubmission: Uploading submission to S3:', {
    id: submission.id,
    platform: submission.platform,
  });

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ProviderSubmission: S3 upload failed:', response.status, errorText);
    throw new Error(`Failed to upload submission: ${response.status} ${response.statusText}`);
  }

  console.log('ProviderSubmission: Successfully uploaded submission to S3');
};

/**
 * Complete submission flow: get presigned URL and upload submission
 * This is a convenience function that combines both steps
 *
 * @param submission - The provider submission payload
 * @param submitterAddress - Optional wallet address of the submitter
 * @returns Promise resolving to the submission ID
 * @throws Error if any step fails
 */
export const submitProvider = async (
  submission: Omit<ProviderSubmission, 'id' | 'submittedAt'>,
  submitterAddress?: string
): Promise<string> => {
  // 1. Get presigned URL from Curator
  const { uploadUrl, submissionId } = await getPresignedUrl(
    submission.platform,
    submitterAddress
  );

  // 2. Build complete submission payload
  const completeSubmission: ProviderSubmission = {
    ...submission,
    id: submissionId,
    submittedAt: new Date().toISOString(),
    submittedBy: submitterAddress,
  };

  // 3. Upload to S3
  await uploadSubmission(uploadUrl, completeSubmission);

  return submissionId;
};
