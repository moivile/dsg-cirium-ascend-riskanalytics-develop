#!/bin/bash

if [[ -z "$1" ]] || [[ -z "$2" ]] || [[ -z "$3" ]] || [[ -z "$4" ]] || [[ -z "$5" ]] || [[ -z "$6" ]]; then
    echo "Must provide valid arguments!" 1>&2
    echo "$0 NEXUSUSER NEXUSPASSWD REGISTRYURL IMAGENAME IMAGETAG"
    echo "Example - $0 teamcityuser xxxxx nexus-docker-analyser.aero.ctv.cirium.dev analyser/testimage develop 12.2.2.6"
    exit 1
fi

set -euo pipefail

export NEXUS_DEPLOYMENT_USER=$1
export NEXUS_DEPLOYMENT_PASSWORD=$2
export REGISTRY_URL=$3
export IMAGE_NAME=$4
export TAG=$5
export VERSION=$6