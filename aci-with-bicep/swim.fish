set location "eastus2"
set resourceGroup "aci-demo-rg"
set aciContainerGroup "aciDemoGroup"

if not az account list; az login; end
az account set --subscription "Visual Studio Enterprise Subscription"
az config param-persist on

echo "Creating resource group $resourceGroup in $location ..."
az group create --name $resourceGroup --location $location

az deployment group create \
  --template-file aci.bicep \
  --parameters name="$aciContainerGroup" location="$resourceGroup"
az resource list
az container logs --name $aciContainerGroup
