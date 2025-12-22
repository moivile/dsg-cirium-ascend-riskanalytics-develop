#!/bin/bash

assembly_version=$1
host_name=$2
base_url=${3:-$2}

loop_count=0

while [[ $loop_count < 9 ]];
do
   	echo 'Checking the deployed version'
	version=$(echo $(curl -k --header "Host: $host_name" https://$base_url/api/riskanalytics/healthcheck/status) | jq .results.version.description -r)

	if [[ $version == $assembly_version ]];
	then
		echo 'The correct version has been deployed.'
		echo "Version: $assembly_version"
		exit 0
	else
		echo 'Waiting for deployment to finish'
		sleep 15
   		((loop_count++))
	fi
done

echo "Version $assembly_version has not been deployed"
exit 1
