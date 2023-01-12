#!/usr/bin/env fish

set location "eastus2"
set resourceGroup "demo-database-rg"
set serverName "azuresql-server-demo-$(date +%s)"
set databaseName "demoazuresqldb"
set username "azureuser"
set password "Pa55w0rDs"
set startIp "0.0.0.0"
set endIp "0.0.0.0"

if not az account list; az login; end
az account set --subscription "Visual Studio Enterprise Subscription"

echo "🚀 Creating resource group '$resourceGroup' in '$location' ..."
az group create --name $resourceGroup --location $location

echo "🚀 Creating an Azure SQL Server ..."
az sql server create \
  -g $resourceGroup \
  --name $serverName \
  --admin-user $username \
  --admin-password $password \
  --location $location

echo "🚀 Creating a firewall rule for your IP ..."
az sql server firewall-rule create \
  -g $resourceGroup \
  --server $serverName \
  --start-ip-address "$startIp" \
  --end-ip-address "$endIp" \
  --name MyClientIP

echo "🚀 Creating an Azure SQL Database ..."
az sql db create \
  -g $resourceGroup \
  --server $serverName \
  --name $databaseName \
  --service-objective S0

echo "🚀 Creating a .env file for development ..."
echo "DATABASE_URL=\"sqlserver://$serverName.database.windows.net:1433;database=$databaseName;user=$username;password=$password;encrypt=true;trustServerCertificate=false;loginTimeout=30\"" > .env.template

echo "☠️ Deleting resource group $resourceGroup ..."
az group delete --name $resourceGroup --yes --no-wait

echo "☠️ Removing .env file ..."
rm .env.template

echo "🚀 Done!"
