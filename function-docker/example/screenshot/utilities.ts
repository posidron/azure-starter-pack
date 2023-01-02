import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
} from "@azure/storage-blob";

export const generateReadOnlySASUrl = async (
  connectionString: string,
  containerName: string,
  filename: string
) => {
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(filename);
  const accountSasTokenUrl = await blobClient.generateSasUrl({
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000), // 60 minutes
    permissions: BlobSASPermissions.parse("r"), // Set read only permission to the blob.
    protocol: SASProtocol.Https, // Only allow HTTPS access to the blob.
  });

  return {
    accountSasTokenUrl,
    storageAccountName: blobClient.accountName,
  };
};
