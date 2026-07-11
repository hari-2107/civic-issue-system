# Stage 1: Build the TypeScript code
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Install build dependencies for sqlite3 (native addon compile)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
# Create directory for SQLite database storage
RUN mkdir -p /data

ENV DATABASE_FILE=/data/civic_issue.db
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/index.js"]
