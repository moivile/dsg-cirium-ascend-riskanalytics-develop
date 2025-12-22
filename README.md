

# Risk Analytics

# Setup

## Install Snowflake CLI

### Get package URL from https://sfc-repo.snowflakecomputing.com/snowflake-cli/index.html
wget --no-check-certificate https://sfc-repo.snowflakecomputing.com/snowflake-cli/linux_x86_64/3.3.0/snowflake-cli-3.3.0.x86_64.deb
sudo apt install ./snowflake-cli-3.3.0.x86_64.deb
### Verify
snow --help

## Decryption key

_You only need to do this once_

If you don't already have `FA_ENC_KEY` in your `~/.bashrc`, get the `FA_ENC_KEY` value from KeePass.  Add it to the end of your `~/.bashrc` as:

    export FA_ENC_KEY=xxxxx

Then run `source ~/.bashrc`

## Frontend

A Route53 entry points `*.local.aea.cirium.dev` to localhost (`127.0.0.1`). This allows us to use a signed SSL certificate. 

By running the `initialise.sh` script, it will download the required cert and key file. This expires and will need to be periodically run. 

The reason for this being you cannot use localhost in the browser for this application due to Auth0 restrictions. Auth0 requires that the site be accessed via `https` and has a domain.

# Running the Application

Run:
    ./initialise.sh

then copy private key to snowflake dir - cp ~/userprivatekey.p8 ~/.snowflake/    
(If you cant locate your private key you can find the path in WSL Ubuntu with command find ~ -name "*.p8" -type f)

Setup Connection to riskanalytics:

snow connection add --no-interactive \
--connection-name="riskanalytics.dev" \
--account=beb93738.us-east-1 \
--username="USER@B2B.REGN.NET" \
--private-key-file=/home/ubuntu/.snowflake/userprivatekey.p8 \
--warehouse=ASCEND_RISK_ANALYTICS_DEVELOPERS_DEV \
--database=CIRIUM_ASCEND_RISK_ANALYTICS_DEV \
--schema=GEMINI \
--authenticator=SNOWFLAKE_JWT

Test Connection to riskanalytics:

snow connection test -c riskanalytics.dev

That script will install dotnet and the VS debugger in WSL for you.  You may need to wait a few minutes as the frontend needs to install some additional dependencies.

You can continue to use that script to rebuild the app whenever you want or you can just use the docker compose cli commands:

    docker compose up -d

This will build both the frontend and the API

If you just want to spin up the API container, try this instead

    docker compose up -d api

The frontend will be served here: https://riskanalytics.local.aea.cirium.dev:8053/

# Development

### API

When the API is running locally, it is running using the following command

    dotnet watch run

This runs the API as well as auto-reloading when you make a change.

### Frontend

#### AppConfigService

This is used to load the configuration required by the application.
Being the frontend, this is just static files served to the client from inside an nginx container which prevents us from using environment variables to construct the config file here ourselves.

Instead, we will have to send a request to the API upon initialisation of the app in the client's browser in order to fetch the config file.

However, we need to do this as part of the app initialisation before it tries to display the homepage. 
To get around this, we use the [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) hook found in `app.module.ts`.

#### HTTP Interceptor

We need to ensure that the user sending requests to the API is authorised to do so.

Because of this, the endpoints in the API will need to use the `authorization` header on each request sent from the frontend.
It can be annoying to add this header to each request from the frontend ourselves.

Thankfully there is an interceptor provided by the Auth0-Angular library which will do this for us. We just need to declare it in our application in `app.module.ts`.

## Debugging

### Frontend

Ensure the application is running inside the container and you select `Launch Chrome` from the dropdown in the `Run` tab on the sidebar.

![Frontend Debugging](./screenshots/frontend_debug.png 'Frontend Debugging')

Then press F5 which will launch a new chrome instance and attach the debugger.

### API

In order to debug, you first need to ensure the container is running locally.
Head to the `Run` menu in the sidebar and select the `Docker .NET Attach` task from the list at the top.

![API Debugging](./screenshots/api_debug.png 'API Debugging')

From here you can either click the green arrow next to the menu or press `F5`.
This will attach the debugger to the container so you can simply add breakpoints and debug away.

One thing to note is this. If you make a code change, the API will auto-reload due to `dotnet watch`. This will cause the debugger to detach from the container and you will have to manually re-attach it by pressing `F5`.

## Testing

### Runnning the tests locally

Please make sure you run these tests in WSL Ubuntu!

To run the frontend tests

    ./deploy/tests.local.sh frontend

To run the API tests

    ./deploy/tests.local.sh api

To run the all the tests

    ./deploy/tests.local.sh

## HealthCheck

Navigate to `https://riskanalytics.local.aea.cirium.dev:8053/api/riskanalytics/healthcheck/status` to see all the healthchecks and their statuses:

![HealthCheck](./screenshots/healthcheck.png 'HealthCheck')
