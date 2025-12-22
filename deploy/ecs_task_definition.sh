echo "Creating ECS Task Definition for the api and frontend"

set -x

export API_IMAGE_NAME=${API_IMAGE_NAME:-nexus-docker-analyser.aero.ctv.cirium.dev/analyser/riskanalytics-api:latest}
export FRONTEND_IMAGE_NAME=${FRONTEND_IMAGE_NAME:-nexus-docker-analyser.aero.ctv.cirium.dev/analyser/riskanalytics-frontend:latest}
export FLUENTBIT_IMAGE_NAME=${FLUENTBIT_IMAGE_NAME:-745925139861.dkr.ecr.eu-west-1.amazonaws.com/dsg-cirium-fluentbit-ecs-image:1.0.1}
export EXECUTION_ROLE=${EXECUTION_ROLE:-arn:aws:iam::553131959015:role/ecsRiskAnalyticsTaskExecutionRole}
export ENVIRONMENT_NAME=${ENVIRONMENT_NAME:-docker}

envsubst < $(dirname $0)/ecs_task_definition.api.template.json > $(dirname $0)/ecs_task_definition.api.json
envsubst < $(dirname $0)/ecs_task_definition.frontend.template.json > $(dirname $0)/ecs_task_definition.frontend.json
