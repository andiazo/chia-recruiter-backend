FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN echo "Before npm install" \
    && npm install \
    && echo "After npm install"

COPY . .

EXPOSE 4000

CMD ["npm", "start"]

