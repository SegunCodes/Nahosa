# USE an official node version
FROM node:18

# SET the working directory
WORKDIR /usr/src/app

# COPY dependencies to working directory
COPY package*.json ./

# INSTALL the dependencies
RUN npm install 

# COPY the rest of the application to the workdir
COPY . .

# EXPOSE the port the app runs on
EXPOSE 4009

# COMMAND application to start
CMD [ "npm", "start" ]