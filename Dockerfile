# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20.11.1

#############################
# Base deps layer
#############################
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /workspace
ENV CI=true
# Install bash & git (husky hooks, potential scripts)
RUN apk add --no-cache bash git
COPY package*.json ./
# Separate layer for dependencies (dev included for lint/test inside container)
RUN npm ci

#############################
# Slim runtime stage (optional) - for running minimal prod artifacts
#############################
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /workspace
ENV NODE_ENV=production
COPY --from=base /workspace/node_modules ./node_modules
COPY src ./src
# If there were an application entrypoint, it would run here.
CMD ["node", "src/index.js"]

#############################
# Development / test stage (FINAL IMAGE)
# Contains full source, tests, config, dev dependencies.
# Default build will produce this stage so test & validate scripts work.
#############################
FROM base AS dev
WORKDIR /workspace
COPY . .

# Non-root user for safety
RUN addgroup -S app && adduser -S app -G app
USER app

# Default command: run test suite
CMD ["npm", "test"]
