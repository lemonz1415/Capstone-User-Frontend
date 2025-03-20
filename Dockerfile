# Use the official Node.js image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install


# Copy the entire application to the container
COPY . .

# Build the application
RUN npm run build || (tail -n 50 /app/.next/error.log && exit 1)

# Use a lightweight image for production
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy build files from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
