```shell
func init --worker-runtime node --language typescript
func new --name execute --template "HTTP trigger" --authlevel anonymous
```

```shell
nvm use 16
npm install
npm run build
```

```shell
export AZURE_SUBSCRIPTION_ID=$(az account show --query id --output tsv)
func start
```

```
az group delete --name $resourceGroup --yes --no-wait
```

References
https://learn.microsoft.com/en-us/azure/developer/javascript/sdk/authentication/local-development-environment-service-principal?tabs=azure-portal#1-create-a-service-principal
https://learn.microsoft.com/en-us/javascript/api/@azure/arm-compute/virtualmachines?view=azure-node-latest&preserve-view=true#start_string__string__msRest_RequestOptionsBase_
