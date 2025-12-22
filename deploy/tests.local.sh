#!/bin/bash

if [[ -z "$1" ]]; then
    echo "Running the tests for both the frontend and the API"
    application='frontend,api'
else
    application=$1
fi


for app in ${application//,/ }
do
    if [ $app == 'frontend' ]; then
        echo Linting and testing the frontend application
        docker compose -f docker-compose.yml -f docker-compose.override.yml run --rm -T frontend bash -c 'npm run test-for-build-pipeline'
    elif [ $app == 'api' ]; then
        echo Testing the API
        docker compose -f docker-compose.yml -f docker-compose.override.yml run --rm -T api bash -c 'cd .. && dotnet test -v minimal --logger "trx;LogFilePrefix=results" --collect:"XPlat Code Coverage" --results-directory ./TestResults /p:CollectCoverage=true /p:CoverletOutputFormat=lcov /p:CoverletOutput=./TestResults/lcov.info'
    fi
done