# --- Builder Stage ---
# Use a specific version to ensure consistency
FROM node:22-alpine AS builder

WORKDIR /app

# Receive build arguments from docker-compose
ARG VITE_API_URL
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_STREAM_API_KEY
ARG VITE_EMAILJS_SERVICE_ID
ARG VITE_EMAILJS_TEMPLATE_ID
ARG VITE_EMAILJS_PUBLIC_KEY

# Set them as environment variables for the build process
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_STREAM_API_KEY=$VITE_STREAM_API_KEY
ENV VITE_EMAILJS_SERVICE_ID=$VITE_EMAILJS_SERVICE_ID
ENV VITE_EMAILJS_TEMPLATE_ID=$VITE_EMAILJS_TEMPLATE_ID
ENV VITE_EMAILJS_PUBLIC_KEY=$VITE_EMAILJS_PUBLIC_KEY

# Copy only package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Use 'npm ci' for a clean, reliable install from the lockfile
RUN npm ci

# Now copy the rest of your application source code
COPY . .

# The 'esbuild' reinstall is no longer needed with 'npm ci'
# RUN npm uninstall esbuild
# RUN npm install esbuild

# Build the application
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]