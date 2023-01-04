import { ContainerInstanceManagementClient } from "@azure/arm-containerinstance";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { DefaultAzureCredential } from "@azure/identity";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // aci_execute_command
  const subscriptionId = process.env["SUBSCRIPTION_ID"];
  const resourceGroup = process.env["RESOURCE_GROUP"];
  const containerInstance = process.env["CONTAINER_INSTANCE"];
  const credential = new DefaultAzureCredential();
  const client = new ContainerInstanceManagementClient(
    credential,
    subscriptionId
  );

  const containerGroup = await client.containerGroups.get(
    process.env.RESOURCE_GROUP,
    process.env.CONTAINER_GROUP
  );

  const result = await client.containers[0].executeCommand(
    resourceGroup,
    containerInstance,
    {
      command: req.query.command || req.body.command,
      terminalSize: {
        rows: 30,
        cols: 120,
      },
    }
  );

  context.res = {
    body: result,
  };
};

export default httpTrigger;
