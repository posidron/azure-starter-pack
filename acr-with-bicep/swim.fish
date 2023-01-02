#!/usr/bin/env fish

set location "eastus2"
set resourceGroup "demo-acr-rg"
set acrName "demo-acr-001"

if not az account list; az login; end
az account set --subscription "Visual Studio Enterprise Subscription"

echo "🚀 Creating resource group $resourceGroup in $location ..."
az group create --name $resourceGroup --location $location

az deployment group create \
  --resource-group $resourceGroup \
  --template-file acr.bicep \
  --parameters acrName=$acrName
