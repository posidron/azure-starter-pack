- [Connect Azure Storage via Bindings](#connect-azure-storage-via-bindings)
  - [Read queued message.](#read-queued-message)

## Connect Azure Storage via Bindings

```json
# function.json
{
  "type": "queue",
  "direction": "out",
  "name": "msg",
  "queueName": "outqueue",
  "connection": "AzureWebJobsStorage"
}
```

```javascript
// index.tsx
context.bindings.msg = value;
```

### Read queued message.

```bash
az storage queue list --connection-string $storageConnection --output tsv
echo (az storage message get --connection-string $storageConnection --queue-name outqueue -o tsv
--query '[].{Message:content}') | base64 --decode
```
