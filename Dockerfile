FROM node:lts
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run-script ci

FROM node:lts
WORKDIR /app
EXPOSE 9876
CMD ["node", "./bin/www"]
COPY --from=0 --chown=0:0 /app/dist ./dist
COPY --from=0 /app/clientJs ./clientJs
COPY --from=0 /app/bin ./bin
COPY --from=0 /app/package*.json ./
RUN npm i --production