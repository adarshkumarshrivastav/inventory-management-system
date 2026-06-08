# --- STAGE 1: Compilation Engine ---
FROM node:20-slim AS build-stage

WORKDIR /app

# Copy dependency mappings and execute a clean installation path
COPY package*.json ./
RUN npm ci

# Copy core client directories and compile production-ready assets
COPY . .
RUN npm run build

# --- STAGE 2: High-Performance Delivery Web Server ---
FROM nginx:alpine-slim

# Copy compiled static assets from Stage 1 into the target Nginx asset directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose standard web traffic gateway port
EXPOSE 80

# Launch server daemon natively
CMD ["nginx", "-g", "daemon off;"]