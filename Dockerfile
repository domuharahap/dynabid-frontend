# Use a Node.js 20 base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your Express server is running on
EXPOSE 3000

# Command to start the application using 'npm start'
CMD ["npm", "start"]