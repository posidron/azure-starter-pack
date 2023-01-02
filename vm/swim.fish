#!/usr/bin/env fish

set location "eastus2"
set resourceGroup "demo-vm-rg"
set vmName "demo-vm"
set vmUser "azureuser"
set skuPlan "Standard"

if not az account list; az login; end
az account set --subscription "Visual Studio Enterprise Subscription"

echo "🚀 Creating resource group $resourceGroup in $location ..."
az group create --name $resourceGroup --location $location

az vm create \
  --resource-group $resourceGroup \
  --name $vmName \
  --location $location \
  --public-ip-sku $skuPlan \
  --image UbuntuLTS \
  --admin-username $vmUser \
  --generate-ssh-keys \
  --custom-data cloud-init.txt

set ipaddr (az vm list-ip-addresses \
    --resource-group $resourceGroup \
    --name demo-vm | jq -r '.[0].virtualMachine.network.publicIpAddresses[0].ipAddress')

echo "⚠️ Run: ssh $vmUser@$ipaddr"

echo "☠️ Deleting resource group $resourceGroup ..."
az group delete --name $resourceGroup --yes
