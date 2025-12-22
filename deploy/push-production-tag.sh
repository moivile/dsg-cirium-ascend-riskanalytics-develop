#!/bin/bash

source  $(dirname $0)/vars.sh

echo "Logging in..."
echo $NEXUS_DEPLOYMENT_PASSWORD | docker login -u $NEXUS_DEPLOYMENT_USER --password-stdin $REGISTRY_URL

function retag_image() {
    RETAG_IMAGE_NAME="$1"
    docker pull $REGISTRY_URL/$RETAG_IMAGE_NAME:$TAG

    tag_missing=0
    docker manifest inspect $REGISTRY_URL/$RETAG_IMAGE_NAME:production > /dev/null 2>&1 || tag_missing=$?

    if [[ $tag_missing == 0 ]]; then
        docker pull $REGISTRY_URL/$RETAG_IMAGE_NAME:production

        latestsha256=$(docker images --quiet $REGISTRY_URL/$RETAG_IMAGE_NAME:$TAG)
        productionsha256=$(docker images --quiet $REGISTRY_URL/$RETAG_IMAGE_NAME:production)

        if [ $latestsha256 == $productionsha256 ]; then
            echo "The latest docker image from :$TAG has already been marked as :production. Skipping this step."
            exit 0
        fi

        echo "Retagging the latest 'production' Docker image as :previous"
        docker tag $REGISTRY_URL/$RETAG_IMAGE_NAME:production $REGISTRY_URL/$RETAG_IMAGE_NAME:previous
        docker push $REGISTRY_URL/$RETAG_IMAGE_NAME:previous
    fi


    echo "Retagging the :$TAG Docker image as :production"
    docker tag $REGISTRY_URL/$RETAG_IMAGE_NAME:$TAG $REGISTRY_URL/$RETAG_IMAGE_NAME:production
    docker push $REGISTRY_URL/$RETAG_IMAGE_NAME:production
}

retag_image "$IMAGE_NAME-frontend"
retag_image "$IMAGE_NAME-api"
