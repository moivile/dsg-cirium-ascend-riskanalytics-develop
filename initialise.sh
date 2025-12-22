set -euo pipefail

# Only run the updates once a day.
aptUpdateDate="$(stat -c %Y '/var/cache/apt')"
nowDate="$(date +'%s')"

if [[ $((nowDate - aptUpdateDate)) -gt $((24 * 60 * 60)) ]]; then
    echo "Running updates."
    sudo apt -y update
    sudo apt -y upgrade
else
    echo "Skipping updates."
fi


if ! command -v dotnet &> /dev/null
then
    echo "-------------------"
    echo "Installing .NET Core"
    echo "-------------------"

    sudo apt-get install -y apt-transport-https
    sudo apt-get update && sudo apt-get -y upgrade
    sudo apt-get install -y dotnet-sdk-8.0
else
    echo "✅ .NET Core $(dotnet --version) already installed."

fi

mkdir -p /c/Temp/.vsdbg

if [ ! -f "/c/Temp/.vsdbg/vsdbg" ]; then
    echo "-------------------"
    echo "Getting VSCode Debugger"
    echo "-------------------"

    curl -sSL https://aka.ms/getvsdbgsh | /bin/sh /dev/stdin -r linux-x64 -v latest -l /c/Temp/.vsdbg
else
    echo "✅ VSCode Debugger already installed."
fi

if [ -f "./src/frontend/ssl/fgdeveloper.key" ]; then
    rm -f ./src/frontend/ssl/fgdeveloper.key
fi

if [ -f "./src/frontend/ssl/fgdeveloper.crt" ]; then
    rm -f ./src/frontend/ssl/fgdeveloper.crt
fi

echo "-------------------"
echo "Getting SSL certificates"
echo "-------------------"

curl -o ./src/frontend/ssl/ciriumlocal.key "https://nexus.aero.ctv.cirium.dev/repository/raw-shared/developer-certificates/ciriumlocal.key"
curl -o ./src/frontend/ssl/ciriumlocal.crt "https://nexus.aero.ctv.cirium.dev/repository/raw-shared/developer-certificates/ciriumlocal.crt"

if ! grep -q nexus-docker-analyser ~/.docker/config.json; then
    echo "-------------------"
    echo "Please login to Nexus CTV with your RBI credentials."
    echo "-------------------"

    docker login nexus-docker-analyser.aero.ctv.cirium.dev
else
    echo "✅ Already logged in to Nexus"
fi

echo "-------------------"
echo "Updating hostfile"
echo "-------------------"
if [ -d "../dev-environment-setup/puppet" ]; then
    pushd .
    cd ../dev-environment-setup/puppet
    powershell.exe ./update_specific.ps1 -tag 'hostfile'
    popd
else
    echo "⚠️ Warning! Puppet repo is missing. Host file entry has not been set."
fi

echo "-------------------"
echo "Decrypting secrets"
echo "-------------------"


function decrypt() {
    echo $1 | openssl aes-256-cbc -nosalt -d -pbkdf2 -base64 -pass env:FA_ENC_KEY
}


function encrypt() {
    echo $1 | openssl aes-256-cbc -nosalt -e -pbkdf2 -base64 -pass env:FA_ENC_KEY
}

set +u
if [[ -z "${FA_ENC_KEY}" ]]; then
    echo "❌ Error! Please export the FA_ENC_KEY variable in your ~/.bashrc. You can get it from KeePass."
    exit 1
fi

cat <<- EOF > $(dirname $0)/secrets.env
Auth0MachineToMachine__ClientSecret=$(decrypt txf94iIujIDgDU91br3iOn3mvYopc1kniyBBhYKTvxTwciXU0rIJPMRU7gRRA8qyGXKaFBgedKnGHBKaJ+XXOTOR5D6gSn2EvJAThUK57fc=)
EOF
echo "Done" && set -u

echo "-------------------"
echo "setup snowflake connections path"
echo "-------------------"
mkdir -p ~/.snowflake/
touch ~/.snowflake/connections.toml
chmod 0600 ~/.snowflake/connections.toml
snow --config-file ~/.snowflake/connections.toml

echo "-------------------"
echo "Stop and clean containers"
echo "-------------------"
docker compose stop
docker compose rm -f

echo "-------------------"
echo "Start containers"
echo "-------------------"
docker compose up -d
