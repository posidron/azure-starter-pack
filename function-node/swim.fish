#!/usr/bin/env fish

nvm use 16

func init --worker-runtime node --language typescript --docker
func new --name trigger --template "HTTP trigger" --authlevel anonymous
func start

set location "eastus2"
set resourceGroup "func-app-rg"
set storage "stfuncapp"
set skuStorage "Standard_LRS"
set functionApp "func-app-serverless-function"
set appServicePlan "func-app-service-plan"
set skuPlan "B1"

az login
az account set --subscription "Visual Studio Enterprise Subscription"
az config param-persist on  # Saves "rg" and "location" parameters.

echo "🚀 Creating resource group $resourceGroup in $location ..."
az group create --name $resourceGroup --location $location
az config param-persist on

echo "🚀 Creating a $skuStorage storage account $storage ..."
az storage account create --name $storage --sku $skuStorage

az functionapp create \
  --consumption-plan-location $location \
  --runtime node \
  --runtime-version 3.9 \
  --functions-version 4 \
  --name $functionApp \
  --os-type linux \
  --storage-account $storage

echo "🚀 Assign storage connection to function app $functionApp ..."
set storageConnection (az storage account show-connection-string \
	--name $storage \
	--query connectionString \
	--output tsv)
az functionapp config appsettings set \
	--name $functionApp \
	--resource-group $resourceGroup \
	--settings AzureWebJobsStorage=$storageConnection

func azure functionapp publish $functionApp
func azure functionapp logstream $functionApp --browser
