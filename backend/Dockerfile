# Backend Dockerfile for AWS App Runner - Triggering Amplify Redeploy
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port 5000 (specified in render.yaml)
EXPOSE 5000

# Start command
CMD ["npm", "start"]