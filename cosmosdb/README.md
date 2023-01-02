# CosmosDB

Todo

```shell
# Create an Azure Cosmos DB database account using the same function app name.
echo "Creating $functionApp"
az cosmosdb create --name $functionApp --resource-group $resourceGroup

# Get the Azure Cosmos DB connection string.
endpoint=$(az cosmosdb show --name $functionApp --resource-group $resourceGroup --query documentEndpoint --output tsv)
echo $endpoint

key=$(az cosmosdb keys list --name $functionApp --resource-group $resourceGroup --query primaryMasterKey --output tsv)
echo $key

# Configure function app settings to use the Azure Cosmos DB connection string.
az functionapp config appsettings set --name $functionApp --resource-group $resourceGroup --setting CosmosDB_Endpoint=$endpoint CosmosDB_Key=$key
```
