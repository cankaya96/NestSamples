# Base image
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Copy app source
COPY . .

# Build app
RUN npm run build

# Expose port
EXPOSE 3000

# Start command will be overridden by docker-compose
