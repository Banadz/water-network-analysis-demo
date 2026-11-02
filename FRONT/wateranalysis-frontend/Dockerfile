# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY public/ public/
COPY src/ src/
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build arguments
ARG REACT_APP_API_URL
ARG REACT_APP_ENV
ARG REACT_APP_MAPBOX_TOKEN

# Set environment variables
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_MAPBOX_TOKEN=$REACT_APP_MAPBOX_TOKEN
ENV REACT_APP_ENV=$REACT_APP_ENV

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.conf.d/ /etc/nginx/conf.d/

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Create a health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
