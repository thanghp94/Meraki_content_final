# Use a specific Node.js version suitable for Next.js
# Using 'alpine' images for smaller size
FROM node:20-alpine AS development

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to cache dependencies
COPY package.json package-lock.json ./

# Install dependencies
# Using --force or --legacy-peer-deps might be needed for some dependency conflicts
RUN npm install --frozen-lockfile # Use --frozen-lockfile for production builds

# Copy all application files
# The crucial step to ensure all source code, including jsconfig.json/tsconfig.json, is present
COPY . .

# Build the Next.js application
# This step produces the optimized production build
RUN npm run build

# --- Start a new stage for the production-ready image (smaller) ---
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy only necessary files from the build stage
# This ensures your final image is small and only contains what's needed for runtime
COPY --from=development /app/.next ./.next
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/public ./public
COPY package.json ./

# Expose the port Next.js listens on (default is 3000)
EXPOSE 3000

# Define the command to start the Next.js production server
CMD ["npm", "start"]