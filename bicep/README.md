## Bicep

```
--parameters @main.parameters.json
--parameters https://example.com/main.parameters.json
--parameters myParam1='myValue1' myParam2='myValue2'
--parameters myParam=@paramfile.txt
```

```
// main.bicep
param storageAccountName string
param location string = resourceGroup().location

resource stg 'Microsoft.Storage/storageAccounts@2021-04-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}
```

```
// main.parameters.json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "storageAccountName": { // Reflects parameter name inside the main.bicep
      "value": "stcontoso"
    }
  }
}
```

* Decompile to ARM template: `bicep build main.bicep`
* Playground: https://bicepdemo.z22.web.core.windows.net
* KeyVault: https://ochzhen.com/blog/key-vault-secrets-as-parameters-azure-bicep
