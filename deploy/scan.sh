#!/bin/bash

echo "Produce TeamCity report, with all fixed and unfixed vulnerabilities"
docker run --rm \
--env HTTPS_PROXY=${HTTPS_PROXY} \
-v /var/run/docker.sock:/var/run/docker.sock \
-v /tmp/trivy-cache/:/root/.cache/ \
-v ${PWD}/trivy-output:/output nexus-docker-proxy.aero.ctv.cirium.dev/aquasec/trivy \
image --exit-code 0 --no-progress --format template \
--template "@contrib/html.tpl" \
-o /output/trivyreport.html \
$1
