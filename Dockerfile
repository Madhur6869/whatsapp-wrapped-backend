FROM node:20.11.1-alpine3.19
ARG APP_ENV=prod
ENV APP_ENV $APP_ENV
WORKDIR /app
COPY . /app/
RUN npm install
EXPOSE 5000
ENTRYPOINT exec npm run start:$APP_ENV