## Azure CLI
```shell
./swim.fish
```

## Docker-Compose
```shell
docker compose up
echo "DATABASE_URL=\"sqlserver://$serverName.database.windows.net:1433;database=$databaseName;user=$username;password=$password;encrypt=true;trustServerCertificate=false;loginTimeout=30\"" > .env.template
```
