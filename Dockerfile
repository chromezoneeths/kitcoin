# Kitcoin dockerfile
FROM node:lts
WORKDIR /app
COPY package*.json ./
RUN npm install
EXPOSE 9876
CMD ["node", "bin/www"]
COPY . .
