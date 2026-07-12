# Stage 1: Build React Application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production PHP Apache Server
FROM php:8.2-apache

# Install MariaDB/MySQL Client and PHP MySQLi extension
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# Enable Apache Rewrite and Headers modules
RUN a2enmod rewrite headers

# Configure PHP settings for uploading files (useful for student/teacher uploads)
RUN { \
        echo 'upload_max_filesize = 64M'; \
        echo 'post_max_size = 64M'; \
        echo 'max_execution_time = 300'; \
    } > /usr/local/etc/php/conf.d/uploads.ini

# Set web directory
WORKDIR /var/www/html

# Copy compiled frontend build assets
COPY --from=builder /app/dist /var/www/html

# Copy PHP backend files to /var/www/html/src
COPY src /var/www/html/src

# Create the uploads folder inside the container and ensure the webserver has write permissions
RUN mkdir -p /var/www/html/src/uploads && chown -R www-data:www-data /var/www/html

# Copy production rewrite configuration
COPY .htaccess.production /var/www/html/.htaccess

EXPOSE 80
