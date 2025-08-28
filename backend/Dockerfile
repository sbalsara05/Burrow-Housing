FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for development)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://burrowhousing.com/health || exit 1

# Use node directly or npm start instead of npm run dev
CMD ["node", "server.js"]