#!/usr/bin/env fish

set location "eastus"
set resourceGroup "demo-aci-docker-compose-rg"
set acrName "demoaci001"
set acrSKU "Basic"
set aciContextName "myacicontext"

if not az account list; az login; end
az account set --subscription "Visual Studio Enterprise Subscription"

echo "🚀 Creating resource group '$resourceGroup' in '$location' ..."
az group create --name $resourceGroup --location $location

echo "🚀 Creating container registry '$acrName' in '$resourceGroup' ..."
az acr create --resource-group $resourceGroup --name $acrName --sku $acrSKU
az acr login --name $acrName

# docker-compose down --remove-orphans
# docker-compose up --build

echo "🚀  Building and pushing docker-compose containers ..."
docker-compose -f example/docker-compose.yml build
docker-compose -f example/docker-compose.yml push

echo "🚀 Authenticate to Azure via Docker ..."
echo "⚠️ Use an Azure Service Principal in production!"
docker login azure

echo "🚀 Create and use new ACI context ..."
docker context create aci $aciContextName \
--resource-group $resourceGroup \
--location $location \
--subscription-id (az account show --query id --output tsv)
docker context use $aciContextName

echo "🚀 Launching docker-compose containers ..."
cd example && docker compose up && cd -

sleep 360

echo "☠️ Shutting down docker-compose containers ..."
cd example && docker compose down && cd -

echo "☠️ Deleting resource group '$resourceGroup' ..."
az group delete --name $resourceGroup --yes --no-wait

echo "⚠️ Revert back to default Docker context ..."
docker context use default
