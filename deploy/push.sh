#!/bin/bash

source  $(dirname $0)/vars.sh

echo "Logging in..."
echo $NEXUS_DEPLOYMENT_PASSWORD | docker login -u $NEXUS_DEPLOYMENT_USER --password-stdin $REGISTRY_URL


set -x
docker compose -f docker-compose.yml -f $(dirname $0)/docker-compose.deploy.yml push
