# Use base image for build stage
FROM node:21.6.2-alpine as builder

# Set workdir
WORKDIR /usr/src/app

# Add node_modules to PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Copy app to source
COPY ../.. /usr/src/app/

# Install npm packages
RUN npm i --silent

# Build
RUN npm run build --silent


# Use base image for main stage
FROM node:21.6.2-alpine

# Get the production files to the location  /usr/src/app/build
COPY --from=builder /usr/src/app/build/ /usr/src/app/build

# Server for the application
RUN npm install -g serve

# Start app
CMD serve -s /usr/src/app/build -l 3000
