FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 1. Catch the arguments passed from GitHub Actions
ARG VITE_API_BASE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# 2. Sledgehammer: Physically write them to a .env file INSIDE the container
RUN echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > .env
RUN echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" >> .env
RUN echo "VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" >> .env

ENV TSC_COMPILE_ON_ERROR=true

# 3. Build the app (Vite will now automatically find and consume the .env file)
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine

# Copy the build output to the Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx config to handle React Router (redirects 404s to index.html)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]