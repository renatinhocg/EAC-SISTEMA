# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN npm install --production
RUN cd backend && npm install --production

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend and PWA
COPY frontend/dist/ ./frontend/dist/
COPY pwa/dist/ ./pwa/dist/

# Copy main application files
COPY index.js ./

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
