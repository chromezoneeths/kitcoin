FROM node:lts
EXPOSE 5000
WORKDIR /app
CMD npm run start
COPY . .
RUN npm i