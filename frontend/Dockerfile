FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy source code
COPY frontend .

# Build for production
RUN npm run build

# Install serve to serve the built files
RUN npm install -g serve

# Serve on port 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
