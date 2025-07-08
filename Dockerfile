# Use official Node.js 18 Alpine image as base
FROM node:18-alpine

# Add curl for health checks and basic tools
RUN apk add --no-cache curl bash

# Create non-root user for security
RUN addgroup -g 1001 nodejs && adduser -S nextuser -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production --no-audit --no-fund

# Copy application source with proper ownership
COPY --chown=nextuser:nodejs . .

# Build the Next.js app
RUN npm run build

# Ensure proper ownership of all files
RUN chown -R nextuser:nodejs /app

# Switch to non-root user
USER nextuser

# Expose port 3000
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the Next.js app
CMD ["npm", "run", "start"]
