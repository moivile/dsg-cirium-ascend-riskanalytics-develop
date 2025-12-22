#!/bin/bash

source  $(dirname $0)/vars.sh

set -x

echo Using Buildkit
export COMPOSE_DOCKER_CLI_BUILD=1
export DOCKER_BUILDKIT=1

echo Stopping any existing docker containers
docker compose -f docker-compose.yml -f $(dirname $0)/docker-compose.deploy.yml down

echo 'Checking if there any docker images to remove'
docker image prune --all --force

echo Building docker image
docker compose -f docker-compose.yml -f $(dirname $0)/docker-compose.deploy.yml build
