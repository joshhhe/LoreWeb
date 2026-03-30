# Dockerfile para Render (Node 18)
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build assets if needed (tailwind)
RUN npm run build || true

EXPOSE 3000
CMD ["npm", "start"]
