nvm use 16

# func init --worker-runtime node --language typescript --docker
# func new --name screenshot --template "HTTP trigger" --authlevel anonymous
# func start

set imageName "scraper-app"
set imageVersion "1.0.6"
set location "eastus2"
set resourceGroup "scraper-app-rg"
set acr "posidron"
set skuAcr "Basic"
set storage "stscraperapprg"
set skuStorage "Standard_LRS"
set functionApp "scraper-app-serverless-function"
set appServicePlan "scraper-app-service-plan"
set skuPlan "B1"

# Builds on M1 ARM and Azure does not really know what that means.
docker buildx build --platform linux/amd64 -t $acr.azurecr.io/$imageName:$imageVersion -f example/Dockerfile .
docker --platform linux/amd64 run -p 8080:80 --rm -t $imageName:$imageVersion

az login
az account set --subscription "Visual Studio Enterprise Subscription"
az config param-persist on  # Saves "rg" and "location" parameters.

echo "🚀 Creating resource group $resourceGroup in $location ..."
az group create --name $resourceGroup --location $location

echo "🚀 Creating container registry $acr in $resourceGroup ..."
az acr create \
  --resource-group $resourceGroup \
  --name $acr \
  --sku $skuAcr
az acr login --name $acr
az acr update -n $acr --admin-enabled true

echo "🚀 Pushing Docker image $imageName:$imageVersion to $acr ACR ..."
docker push $acr.azurecr.io/$imageName:$imageVersion
echo "🚀 Activating new image version $imageVersion ..."
az webapp config container set \
	--name $functionApp \
	--docker-custom-image-name $acr.azurecr.io/$imageName:$imageVersion

echo "🚀 Creating a $skuStorage storage account $storage ..."
az storage account create --name $storage --sku $skuStorage

echo "🚀 Creating a $skuPlan app service plan $appServicePlan ..."
az functionapp plan create --name $appServicePlan --sku $skuPlan --is-linux true

echo "🚀 Creating function app $functionApp with container $imageName:$imageVersion ..."
az functionapp create \
	--name $functionApp \
	--storage-account $storage \
	--plan $appServicePlan \
	--functions-version 4 \
	--os-type linux \
	--deployment-container-image-name $acr.azurecr.io/$imageName:$imageVersion

echo "🚀 Assign storage connection to function app $functionApp ..."
set storageConnection (az storage account show-connection-string \
	--name $storage \
	--query connectionString \
	--output tsv)
az functionapp config appsettings set \
	--name $functionApp \
	--resource-group $resourceGroup \
	--settings AzureWebJobsStorage=$storageConnection

echo "🚀 Enabling continous container deployment ..."
az functionapp deployment container config \
	--enable-cd \
	--query CI_CD_URL \
	--output tsv \
	--name $functionApp \
	--resource-group $resourceGroup

echo "🚀 Opening function app logstream in browser ..."
func azure functionapp logstream $functionApp --browser

echo "⚠️ View function keys for $functionApp ..."
az functionapp keys list -n $functionApp

echo "⚠️ Downloads app settings into local.settings.json for further local development ..."
func azure functionapp fetch-app-settings
