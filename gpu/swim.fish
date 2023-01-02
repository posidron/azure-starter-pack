#!/usr/bin/env fish

set location "eastus"
set resourceGroup "demo-gpu-rg"
set acrName "demogpucontainergroup"
set acrSKU "Standard"
set acrContainerName "demogpucontainer"

echo "🚀 Authenticate to Azure ..."
if not az account list; az login; end
az account set --subscription "Visual Studio Enterprise Subscription"

echo "🚀 Creating resource group '$resourceGroup' in '$location' ..."
az group create --name $resourceGroup --location $location

echo "🚀 Creating container registry '$acrName' in '$resourceGroup' ..."
az acr create --resource-group $resourceGroup --name $acrName --sku $acrSKU
az acr login --name $acrName

echo "🚀 Creating container '$acrContainerName' in '$resourceGroup' ..."
echo "⚠️ Run: 'az container create --help' for more goodies!"
az container create \
  --resource-group $resourceGroup \
  --file gpu.yaml \
  --location $location

echo "🚀 Checking status of container '$acrContainerName' in '$resourceGroup' ..."
echo "⚠️ It takes a bit to provision the container!"
az container show \
  --resource-group $resourceGroup \
  --name $acrContainerName \
  --query "{FQDN:ipAddress.fqdn,ProvisioningState:provisioningState}" \
  --out table
echo "🚀 Checking container logs '$acrContainerName' in '$resourceGroup' ..."
az container logs --resource-group $resourceGroup --name $acrContainerName
az container attach --resource-group $resourceGroup --name $acrContainerName

echo "☠️ Deleting container $acrContainerName in $resourceGroup ..."
az container delete --resource-group $resourceGroup --name $acrContainerName --yes
echo "☠️ Deleting resource group $resourceGroup ..."
az group delete --resource-group $resourceGroup --yes --no-wait
