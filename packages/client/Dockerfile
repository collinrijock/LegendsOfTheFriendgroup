FROM node:21-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json .
COPY . .
RUN npm install

# Build the client
RUN npm run build

# Use nginx to serve the static files
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY ../nginx.conf /etc/nginx/conf.d/default.conf

# Expose the nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]