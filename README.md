# Azure Starter Pack

Various concepts related to Azure for learning purposes.


## Setup Azure Function Tools on ARM64

`Rossetta` emulates to AMD64.
`arch64` runs either the universal binary or an ARM64 binary in an AMD64 context.

```shell
echo Rosetta is $(arch -x86_64 /usr/bin/true || echo not) installed
softwareupdate --install-rosetta --agree-to-license

arch -x86_64 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/usr/local/bin/brew shellenv)"
```

```shell
# ~/.config/fish/config.fish
if [ (arch) = "i386" ]
  echo "Mode: i386"
  eval (/usr/local/bin/brew shellenv)
  set PATH "/usr/local/bin:$PATH"
end
if [ (arch) = "arm64" ]
  echo "Mode: arm64"
  eval (/opt/homebrew/bin/brew shellenv)
  set PATH "/opt/homebrew/bin:/usr/local/bin:$PATH"
end
```

Make a copy of iTerm2.app, name it "iTerm2-Rosetta.app" and enable Rosetta in the preferences, then
open it.

```shell
brew tap azure/functions
brew install python azure-functions-core-tools@4
```

```shell
export FUNCTIONS_CORE_TOOLS_TELEMETRY_OPTOUT=1

arch -x86_64 pyenv install 3.9.16
arch -x86_64 pyenv local 3.9.16
```

```shell
python -m venv .venv
source .venv/bin/activate.fish # or pipenv shell --python 3.9.16
```

```shell
mkdir fastapiapp
python -m pip install --upgrade pip
pip install fastapi

func init api --python
cd api
func new --name main --template "HTTP trigger"
func start
...
```

## Authenticate

```shell
az login
az account set --subscription "Visual Studio Enterprise Subscription"
az config param-persist on # Saves "rg" and "location" parameters.
az account list-locations
```

## Service Principal vs Managed Identity

**Scope**: Service principals are created in Azure AD and are used to authenticate applications and services when they access Azure resources. Managed identities, on the other hand, are used to authenticate Azure resources when they access other Azure resources or services.

**Creation & Management**: Service principals are created and managed in Azure AD, whereas managed identities are created and managed by Azure.

**Lifetime**: Service principals have a fixed lifetime, and they must be manually created, updated, and deleted. Managed identities, on the other hand, are created and deleted automatically when the associated resource is created or deleted.

**Service Principle**
```shell
az group create -l eastus2 -n $resourceGroup
az ad sp create-for-rbac \
  -n $resourceGroup \
  --role contributor \
  --scopes "/subscriptions/$(az account show --query id --output tsv)"
```

**Managed Identity**
```shell
az identity create --name $resourceGroup-identity --resource-group $resourceGroup # System-assigned
az identity create --name $resourceGroup-identity --assign-identity               # User-assigned
```

## Interesting Resources

* https://github.com/Azure-Samples/azure-cli-samples
* https://github.com/checkly/puppeteer-examples
* https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations
