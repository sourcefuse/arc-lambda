# Stage 1: Build Stage
FROM node:18 AS BUILD_STAGE

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

# Set the working directory
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package*.json ./

# Installing all dependencies
RUN npm install

# Copy files needed for the app build
COPY --chown=node src ./src
COPY --chown=node public ./public
COPY --chown=node tsconfig.json ./

# Run Build Command
RUN npm run build

# Run node-prune
RUN npm prune --production

# Stage 2: Final Image

# Check out https://hub.docker.com/_/node to select a new base image
FROM public.ecr.aws/lambda/nodejs:18-x86_64

# Create app directory
RUN mkdir -p ${LAMBDA_TASK_ROOT}

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy runtime artifacts from the build stage
COPY --from=BUILD_STAGE /home/node/app/node_modules ./node_modules
COPY --from=BUILD_STAGE /home/node/app/dist ./dist
COPY --from=BUILD_STAGE /home/node/app/public ./public

CMD [ "./dist/lambda.handler" ]
