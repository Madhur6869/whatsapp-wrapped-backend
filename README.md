# whatsapp-wrapped-backend

Express.js API to handle WhatsApp chat export file uploads. Each uploaded file will be processed and the insights obtained will be stored as a MongoDB document.

## Setup Environment

1. Create `logs/` directory in the root of the repository. This will allow the app to create the `app.log` file.

2. Ensure that a `.env` file exists in the root of the repository. This file should have the *MongoDB connection URI*, *port number* and *log file path*: `APP_LOG_FILE=logs/app.log`

## Build App Image

Command: `docker build [--no-cache] -t <IMAGE_NAME>:<TAG> .`

Follow the semantic versioning scheme `X.Y.Z` for the image tag. More information: [Semantic Versioning 2.0.0](https://semver.org/)

The `--no-cache` option prohibits Docker from using cached build steps.

More information: [docker build | Docker Docs](https://docs.docker.com/engine/reference/commandline/image_build/)

Example: `docker build --no-cache -t wawrapped-backend:1.0.0 .`

## Run App Container

Command: `docker run --name=<CONTAINER_NAME> --env-file <ENV_FILE_PATH> -dp <HOST_PORT>:<CONTAINER_PORT> <IMAGE_NAME>:<TAG>`

The `--env-file` option will read the specified environment file and expose the variables in the container environment during runtime.

More information: [docker run | Docker Docs](https://docs.docker.com/engine/reference/commandline/container_run/)

Example: `docker run --name=waw-backend --env-file .env -dp 5000:5000 whatsapp-wrapped:1.0.0`
