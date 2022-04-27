FROM node:11-alpine
WORKDIR /root/app
COPY package.json .
RUN npm install --only=production
COPY . .
EXPOSE 3010

RUN mkdir -p /public/
CMD ["node", "index.js"]