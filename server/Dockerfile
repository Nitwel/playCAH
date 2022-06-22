FROM node:16 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY copyfiles.js ./
COPY ./src ./src
RUN npm ci --quiet && npm run build

FROM node:16-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --quiet --only=production

EXPOSE 5001

## We just need the build to execute the command
COPY --from=builder /usr/src/app/dist ./dist

RUN mkdir ./dist/keys

CMD ["node", "/app/dist/main.js"]