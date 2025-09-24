# Use official Node.js runtime as base image
FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port 8080 consistently
EXPOSE 8080

# Remove Docker health check - let Railway handle it
# Health checks can be tricky with Vite preview mode

# Start the application using Vite preview
CMD ["npm", "run", "preview"]