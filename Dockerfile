# Use official Node.js 18 Alpine image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 3000 for the app
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
