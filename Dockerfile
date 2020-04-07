# Kitcoin dockerfile
FROM node:lts
WORKDIR /app
EXPOSE 9876
CMD ["node", "bin/www"]
RUN npm i -g gulp-cli
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run-script build