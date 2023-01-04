// https://github.com/Azure-Samples/aci-event-driven-worker-queue
// https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/containerinstance/arm-containerinstance/samples-dev
// https://www.taylorgibb.com/blog/azure-functions-and-containers
// https://learn.microsoft.com/en-us/javascript/api/@azure/arm-containerinstance/containergroup?view=azure-node-latest

// https://github.com/mitsha-microsoft/aci-create-action

const {
  ContainerInstanceManagementClient,
} = require("@azure/arm-containerinstance");
const { DefaultAzureCredential } = require("@azure/identity");

const resourceGroup = "sandbox-rg";
const containerGroupName = "aci-helloworld";
const containerInstanceName = "hello-world-container";
const containerGroupInstance = {
  location: "eastus2",
  containers: [
    {
      name: containerInstanceName,
      environmentVariables: [],
      image: "nginx",
      ports: [
        {
          port: 80,
        },
      ],
      resources: {
        requests: {
          cpu: 1,
          memoryInGB: 1.5,
          /*gpu: {
            count: 1,
            sku: "K80",
          },*/
        },
        volumeMounts: [
          {
            name: "empty-volume",
            mountPath: "mnt/mydir",
          },
        ],
      },
      command: ["sh", "-c", "echo 'Hello World'"],
    },
  ],
  volumes: [
    {
      name: "empty-volume",
      emptyDir: {},
    },
  ],
  osType: "Linux",
  restartPolicy: "OnFailure",
};

(async () => {
  const client = new ContainerInstanceManagementClient(
    new DefaultAzureCredential(),
    "d30221f6-e9d5-4fad-9b57-d5c818a0b146"
  );

  // Create
  console.info("Predeployment steps started.");
  let containerDeploymentResult =
    await client.containerGroups.beginCreateOrUpdateAndWait(
      resourceGroup,
      containerGroupName,
      containerGroupInstance
    );

  console.log(containerDeploymentResult.id);
  if (containerDeploymentResult.provisioningState == "Succeeded") {
    console.info("Deployment succeeded.");
  } else {
    throw new Error(`Deployment failed: ${containerDeploymentResult}`);
  }

  // Read
  const containerGroup = await client.containerGroups.get(
    resourceGroup,
    containerGroupName
  );
  console.log(containerGroup);

  const container = containerGroup.containers[0];
  console.log(container);

  // Delete
  console.log("beginDeleteAndWait");
  const res = await client.containerGroups.beginDeleteAndWait(
    resourceGroup,
    containerGroupName
  );
  console.log(res);

  const resArray1 = new Array();
  for await (let item of client.operations.list()) {
    resArray1.push(item);
  }
  console.log(resArray1);

  const resArray = new Array();
  for await (let item of client.containerGroups.listByResourceGroup(
    resourceGroup
  )) {
    resArray.push(item);
  }

  console.log("Current container groups in the resource group:");
  console.log(resArray);
})();

/*

let db_connection = process.env.CUSTOMCONNSTR_CosmosDB,
let db_name = "containerstate";
let db_user = db_connection.slice(10, db_connection.indexOf(':',10));
let db_pwd = db_connection.slice(db_connection.indexOf(':',10) + 1, db_connection.indexOf('@'));
let db_uri = 'mongodb://' + db_connection.slice(db_connection.indexOf('@')+1) + '&ssl=true';

const MongoClient = require('mongodb').MongoClient;
await MongoClient.connect(db_uri, { auth:{ user: db_user , password: db_pwd }});

let db = client.db(db_name);
let col = db.collection(db_name);
await col.updateMany({name: containerName }, {$set: { state: "Error", message:
JSON.stringify(err) }})

                environmentVariables: [
                    {
                        name: "MESSAGE",
                        value: containerMsg
                    },
                    {
                        name: "CONTAINER_NAME",
                        value: containerName
                    },
                    {
                        name: "DATABASE_URI",
                        value: db_connection
                }],
*/
