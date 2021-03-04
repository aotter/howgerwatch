FROM node:12-alpine

COPY ./ /app

RUN cd /app && npm install

EXPOSE 3000
WORKDIR /app/
CMD ["node", "index.js"]