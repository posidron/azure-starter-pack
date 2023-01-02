#/usr/bin/env fish

set resourceGroup "demo-apim-rg"
set apimName "demo-apim"
set publisherName "foobar"
set publisherEmail "foo@bar.baz"

az login
az account set --subscription "Visual Studio Enterprise Subscription"
az config param-persist on  # Saves "rg" and "location" parameters.

echo "🚀 Creating resource group $resourceGroup in $location ..."
az group create --name $resourceGroup --location $location

az apim create \
  --name $apimName
  --resource-group $resourceGroup \
  --publisher-name $publisherName \
  --publisher-email $publisherEmail \
  --no-wait

az apim show \
  --name $apimName \
  --resource-group $resourceGroup \
  --output table

echo "☠️ Deleting resource group $resourceGroup ..."
az group delete --name $resourceGroup --yes --no-wait
