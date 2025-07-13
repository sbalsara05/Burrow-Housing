const {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
require("dotenv").config();

// Configure the S3 client once at the module level
const s3Client = new S3Client({
	endpoint: `https://${process.env.SPACES_ENDPOINT}`,
	region: "us-east-1",
	credentials: {
		accessKeyId: process.env.SPACES_KEY,
		secretAccessKey: process.env.SPACES_SECRET,
	},
});

/**
 * Generates presigned URLs for direct client-side uploads to S3.
 * @param {Array<{filename: string, contentType: string}>} files - Array of file metadata.
 * @param {string} userId - The ID of the user uploading the files.
 * @returns {Promise<Array<{signedUrl: string, publicUrl: string}>>} - An array of objects containing the presigned URL for upload and the final public URL.
 */
const generatePresignedUrls = async (files, userId) => {
	if (!Array.isArray(files) || files.length === 0) {
		throw new Error("File information is required.");
	}
	if (files.length > 10) {
		throw new Error("You can upload a maximum of 10 images.");
	}

	try {
		const urlPromises = files.map(async (file) => {
			const uniqueSuffix = crypto
				.randomBytes(16)
				.toString("hex");
			const key = `properties/${userId}/${uniqueSuffix}-${file.filename.replace(
				/\s+/g,
				"-"
			)}`;

			const command = new PutObjectCommand({
				Bucket: process.env.SPACES_BUCKET_NAME,
				Key: key,
				ContentType: file.contentType,
				ACL: "public-read",
			});

			const signedUrl = await getSignedUrl(
				s3Client,
				command,
				{ expiresIn: 300 }
			); // 5 minutes
			const publicUrl = `https://${process.env.SPACES_BUCKET_NAME}.${process.env.SPACES_ENDPOINT}/${key}`;

			return { signedUrl, publicUrl };
		});

		return await Promise.all(urlPromises);
	} catch (error) {
		console.error(
			"Error generating presigned URLs in s3Service:",
			error
		);
		throw new Error("Could not generate upload links."); // Throw a generic error to be caught by the controller
	}
};

/**
 * Deletes a file from DigitalOcean Spaces given its full public URL.
 * @param {string} fileUrl - The full public URL of the file to delete.
 * @returns {Promise<boolean>} - True if successful, false otherwise.
 */
const deleteFileFromS3 = async (fileUrl) => {
	if (!fileUrl) {
		console.log("No file URL provided, skipping deletion.");
		return true;
	}

	try {
		const fileKey = new URL(fileUrl).pathname.substring(1);
		console.log(
			`Attempting to delete file from S3 with Key: ${fileKey}`
		);

		const command = new DeleteObjectCommand({
			Bucket: process.env.SPACES_BUCKET_NAME,
			Key: fileKey,
		});

		await s3Client.send(command);
		console.log(`Successfully deleted: ${fileKey}`);
		return true;
	} catch (error) {
		console.error(
			`Failed to delete file from S3: ${fileUrl}`,
			error
		);
		return false;
	}
};

module.exports = {
	generatePresignedUrls,
	deleteFileFromS3,
};
