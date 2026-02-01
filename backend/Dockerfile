FROM node:18-alpine

# Install curl for health check
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy package.json specifically
COPY package.json ./

# Install dependencies as root (standard practice)
RUN npm install

# Copy all other files (node_modules will be excluded by .dockerignore)
COPY . .

# Change ownership of the app directory to the non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port (Hugging Face typically uses port 7860)
EXPOSE 7860

# Health check to ensure the app is running properly
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/ || exit 1

# Start the application
CMD ["sh", "-c", "npm start"]