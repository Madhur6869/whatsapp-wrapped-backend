FROM node:18.19.0-slim
WORKDIR /app
COPY . /app/
RUN npm install
EXPOSE 5000
ENTRYPOINT exec npm run start:prod