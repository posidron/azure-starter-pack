#!/usr/bin/env fish

set location "eastus2"
set resourceGroup "demo-aci-rg"
set acrName "demoaci001"
set acrSKU "Basic"
set acrImage "mcr.microsoft.com/azuredocs/aci-helloworld"
set acrContainerName "demo-aci-container"
set dnsLabel "demo-aci-dns"

if not az account list; az login; end
az account set --subscription "Visual Studio Enterprise Subscription"

echo "🚀 Creating resource group '$resourceGroup' in '$location' ..."
az group create --name $resourceGroup --location $location

echo "🚀 Creating container registry '$acrName' in '$resourceGroup' ..."
az acr create --resource-group $resourceGroup --name $acrName --sku $acrSKU
az acr login --name $acrName

# az acr update -n $acrName --admin-enabled true
# az acr credential show -n $acrName --query passwords[0].value

echo "🚀 Creating container '$acrContainerName' in '$resourceGroup' ..."
echo "⚠️ Run: 'az container create --help' for more goodies!"
az container create \
  --resource-group $resourceGroup \
  --name $acrContainerName \
  --image $acrImage \
  --dns-name-label $dnsLabel \
  --ip-address Public \
  --cpu 1 \
  --memory 1 \
  --ports 80 \
  --restart-policy OnFailure

echo "🚀 Opening browser to http://$dnsLabel.$location.azurecontainer.io ..."
open "http://$dnsLabel.$location.azurecontainer.io"

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
az group delete --name $resourceGroup --yes
