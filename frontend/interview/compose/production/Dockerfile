## TODO: This prod dockerfile raises permission denied when serving public files
## To get this working make a copy of images folder from public in the src/assets
## The use require('../assets/images/illustrations/interviewer-agent.png') everywhere so that webpack will put these images in static folder and create a mapping

# Use base image for build stage
FROM node:21.6.2-alpine as builder

# Set workdir
WORKDIR /usr/src/app

# Add Env variables
ENV NODE_ENV production
ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY ./package*.json ./

# Install npm packages
RUN npm i --silent

# Copy app to source
COPY . ./

# Build
RUN npm run build --silent


# Use base image for main stage
FROM nginx:stable-alpine

# Get the production files to the location
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY ./compose/production/nginx.conf /etc/nginx/conf.d/default.conf

# Start app
#CMD [ "nginx", "-g", "daemon off;" ]
