FROM node:21-alpine

WORKDIR /app

# Copy package files
COPY package.json .
COPY . .

# Install dependencies
RUN npm install

# Build TypeScript code
RUN npm run build

# Expose the server port
EXPOSE 4001

# Environment variable for port
ENV PORT=4001
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/server.js"]