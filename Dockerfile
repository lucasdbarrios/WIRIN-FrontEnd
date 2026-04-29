# ---------- Development stage ----------
FROM node:20-alpine AS dev
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose the default Angular port
EXPOSE 4200

# Use Angular development server with live reload
# Host 0.0.0.0 to bind to all interfaces inside container
# Polling for file changes (needed for Docker volume mounts)
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--poll", "2000", "--disable-host-check"]


# ---------- Production stage ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --output-path=./dist/out --configuration production

# Production image with nginx
FROM nginx:alpine AS prod
COPY --from=build /app/dist/out/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]