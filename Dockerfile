FROM node:22-alpine
WORKDIR /app
COPY package.json programs.json index.js ./
ENTRYPOINT ["node", "index.js"]
