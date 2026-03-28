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

# Expose port 8080 (specified as default in server.js and render.yaml)
EXPOSE 8080

# Start command
CMD ["npm", "start"]