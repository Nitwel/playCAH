FROM node:16-alpine

WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm i && pnpm -r build

ENV NODE_ENV=production

EXPOSE 80

CMD ["node", "/app/server/dist/main.js"]