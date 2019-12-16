FROM node:carbon-alpine
EXPOSE 3000
CMD [ "npm", "start" ]
# Create app directory
WORKDIR /usr/src/app
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
# Install app dependencies
RUN npm install
# Bundle app source
COPY . .