#!/bin/bash

source  $(dirname $0)/vars.sh

set -x

echo Docker host PWD
pwd

echo Linting and testing the frontend application
docker compose -f docker-compose.yml -f docker-compose.tests.yml run --rm -T frontend bash -c 'npm run test-for-build-pipeline'

docker compose -f docker-compose.yml -f docker-compose.tests.yml run --rm -T api bash -c 'cd .. && dotnet test -v minimal --logger "trx;LogFilePrefix=results" --collect:"XPlat Code Coverage" --results-directory ./TestResults /p:CollectCoverage=true /p:CoverletOutputFormat=lcov /p:CoverletOutput=./TestResults/lcov.info'