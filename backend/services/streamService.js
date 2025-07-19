const { StreamChat } = require("stream-chat");
require("dotenv").config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

let streamClient;

try {
	if (!apiKey || !apiSecret) {
		throw new Error(
			"Stream API Key and Secret are required. Please check your .env file."
		);
	}

	// Initialize a single, server-side admin client
	streamClient = StreamChat.getInstance(apiKey, apiSecret);
	console.log("Stream Chat admin client initialized successfully.");
} catch (error) {
	console.error(
		"Failed to initialize Stream Chat client:",
		error.message
	);
	// The application will fail on chat-related actions if this initialization fails.
}

/**
 * Returns the initialized Stream Chat admin client instance.
 * @returns {StreamChat} The Stream Chat client instance.
 */
const getStreamClient = () => {
	if (!streamClient) {
		throw new Error(
			"Stream Chat client has not been initialized. Check server startup logs."
		);
	}
	return streamClient;
};

module.exports = {
	getStreamClient,
};
