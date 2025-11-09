FROM node:20-bullseye-slim

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install git -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
