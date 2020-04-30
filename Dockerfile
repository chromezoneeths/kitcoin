FROM node:lts
WORKDIR /app
EXPOSE 9876
CMD ["node", "./bin/www"]
COPY package*.json ./
RUN npm install --production
COPY ./bin/www ./bin/www
COPY ./clientJs ./clientJs
COPY ./dist ./dist
