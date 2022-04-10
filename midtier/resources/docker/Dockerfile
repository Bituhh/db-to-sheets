FROM node:16-alpine
WORKDIR /usr/app

COPY ./src/ .
RUN npm install
CMD ["npm", "start"]

EXPOSE 5432
