# Service Principals

```
set subscriptionId $(az account show --query id -o tsv)
az ad sp create-for-rbac --role Owner --scopes /subscriptions/$subscriptionId
{
  "appId": "8a6f347a-dd2a-4b4c-b4a7-98dc2054bd67",
  "displayName": "azure-cli-2023-01-17-02-35-17",
  "password": "a4z8Q~rROzlr4W6HQ1s1RBtbKDqppAJYV26y6bI2",
  "tenant": "a2439abc-d2d5-491b-9782-687660a5ea1a"
}
az ad sp list --show-mine --query "[].{id:appId, tenant:appOwnerTenantId}"
```

```shell
az ad sp delete --id 8a6f347a-dd2a-4b4c-b4a7-98dc2054bd67
```

## References
https://learn.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli
https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-cli
