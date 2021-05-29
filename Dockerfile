FROM node:14
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install pm2 -g
RUN mv .env-example .env
RUN yarn install
RUN yarn run build

CMD ["pm2-runtime", "start", "ecosystem.config.js"]