#!/usr/bin/env fish

set location "eastus"
set resourceGroup "demo-aci-k8-rg"
set acrName "demoaci002" # Needs adjustment in the application.yaml and docker-compose.yaml.
set acrSKU "Basic"
set aksName "myAKSCluster"

az aks install-cli

if not az account list; az login; end
az account set --subscription "Visual Studio Enterprise Subscription"

echo "🚀 Creating resource group '$resourceGroup' in '$location' ..."
az group create --name $resourceGroup --location $location

echo "🚀 Creating container registry '$acrName' in '$resourceGroup' ..."
az acr create --resource-group $resourceGroup --name $acrName --sku $acrSKU
az acr login --name $acrName

# docker-compose down --remove-orphans
# docker-compose up --build

echo "🚀  Building and pushing docker-compose containers ..."
docker-compose -f ../aci-docker-compose/example/docker-compose.yml build
docker-compose -f ../aci-docker-compose/example/docker-compose.yml push

echo "🚀 Creating AKS cluster '$aksName' in '$resourceGroup' ..."
# Will register "Microsoft.ContainerService" if not already registered.
az aks create \
    --resource-group $resourceGroup \
    --name $aksName \
    --node-count 2 \
    --generate-ssh-keys \
    --attach-acr $acrName

echo "🚀 Configuring kubectl ..."
az aks get-credentials --resource-group $resourceGroup --name $aksName
kubectl get nodes

echo "🚀 Deploying application ..."
kubectl apply -f application.yaml
sleep 120

echo "🚀 Checking application ..."
kubectl get pods
# kubectl describe pod -A

echo "🚀 Scaling application ..."
# kubectl scale --replicas=3 deployment/frontend

echo "🚀 Deploy an updated application ..."
# Requires "docker-compose build" && "docker tag" prior.
# kubectl set image deployment frontend frontend=$acrName.azurecr.io/compose-frontend:2.0.0
# kubectl get service frontend

echo "🚀 Manual scale AKS nodes ..."
# az aks scale --resource-group $resourceGroup --name $aksName --node-count 3

echo "🚀 Set autoscale options ..."
# kubectl autoscale deployment frontend --cpu-percent=50 --min=3 --max=10

echo "☠️ Deleting resource group '$resourceGroup' ..."
az group delete --name $resourceGroup --yes --no-wait
