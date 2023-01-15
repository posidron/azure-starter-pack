#!/usr/bin/env fish
# https://learn.microsoft.com/en-us/azure/architecture/framework/devops/automation-configuration

set location "eastus2"
set resourceGroup "demo-vm-automation-rg"
set vmName "demo-vm-automation"
set vmImage "UbuntuLTS"

if not az account list; az login; end
az account set --subscription "Visual Studio Enterprise Subscription"

echo "🚀 Creating resource group $resourceGroup in $location ..."
az group create --name $resourceGroup --location $location

echo "🚀 Creating VM $vmName in $resourceGroup with cloud-init ..."
echo "
package_upgrade: true
packages:
  - wget
" > cloud-init.txt
az vm create \
    --resource-group $resourceGroup \
    --name $vmName \
    --image $vmImage \
    --public-ip-sku Standard \
    --admin-username azureuser \
    --generate-ssh-keys \
    --custom-data cloud-init.txt

echo "🔌 Adding custom script extension ..."
az vm extension set \
  --resource-group $resourceGroup \
  --vm-name $vmName \
  --name customScript \
  --publisher Microsoft.Azure.Extensions \
  --settings '{"commandToExecute": "apt-get install -y nginx"}'

echo "🛌 Sleeping 60 seconds ..."
sleep 60

echo "☠️ Deleting resource group $resourceGroup ..."
az group delete --name $resourceGroup --yes --no-wait

rm cloud-init.txt
