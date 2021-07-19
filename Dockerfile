FROM node:14-alpine

WORKDIR /app
RUN apk add curl
COPY package-lock.json /app/package-lock.json
COPY package.json /app/package.json
RUN npm ci
RUN mkdir -p /app/tmp
COPY . /app
RUN npm run build
COPY .env.production /app/build/.env

HEALTHCHECK CMD ["curl", "-f", "http://localhost:3333/healthcheck"]
CMD ["npm", "run", "start"]