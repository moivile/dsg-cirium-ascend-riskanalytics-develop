# Either run this with an instance profile
# Or export AWS credential environment variables.

set -x

export ENVIRONMENT_NAME=${ENVIRONMENT_NAME:-docker}
export API_TASK_NAME=${API_TASK_NAME:-riskanalytics_api}
export FRONTEND_TASK_NAME=${FRONTEND_TASK_NAME:-riskanalytics_frontend}

echo "Deregister previous API Task Definitions"
aws ecs list-task-definitions --family-prefix ${ENVIRONMENT_NAME}_${API_TASK_NAME} --status ACTIVE | jq -r '.taskDefinitionArns[]' | while read arn; do aws ecs deregister-task-definition --task-definition $arn; done

echo "Register new version of API Task Definition"
aws ecs register-task-definition --family ${ENVIRONMENT_NAME}_${API_TASK_NAME} --cli-input-json file://$(dirname $0)/ecs_task_definition.api.json

echo "Deregister previous Frontend Task Definitions"
aws ecs list-task-definitions --family-prefix ${ENVIRONMENT_NAME}_${FRONTEND_TASK_NAME} --status ACTIVE | jq -r '.taskDefinitionArns[]' | while read arn; do aws ecs deregister-task-definition --task-definition $arn; done

echo "Register new version of Frontend Task Definition"
aws ecs register-task-definition --family ${ENVIRONMENT_NAME}_${FRONTEND_TASK_NAME} --cli-input-json file://$(dirname $0)/ecs_task_definition.frontend.json
