FROM node:18-alpine

WORKDIR /app
RUN npm config set legacy-peer-deps true
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3009
CMD npm run dev