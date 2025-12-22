#!/bin/bash

PRIVATE_KEY_FILE=/app/snowflake_rsa_key.p8

# If the private key file already exists
if [ -f "$PRIVATE_KEY_FILE" ]; then
   echo "Private key file already exists. Proceeding..."
else
   # Get private key from environment variable
   if [ -z "$SNOWFLAKE_USER_PRIVATE_KEY_BASE64" ]; then
       echo "Error: SNOWFLAKE_USER_PRIVATE_KEY_BASE64 environment variable is not set."
       exit 1
   fi

   echo "$SNOWFLAKE_USER_PRIVATE_KEY_BASE64" | base64 -d > "$PRIVATE_KEY_FILE"

   # Ensure the private key file has the correct permissions
   chmod 600 "$PRIVATE_KEY_FILE"
fi
 
dotnet /app/RiskAnalytics.Api.dll