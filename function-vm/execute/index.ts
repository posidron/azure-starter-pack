import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import VmManager from "./manager";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  process.env.production = "true";

  const prefix = "demo";
  const location = "eastus2";
  const accType = "Standard_LRS";
  const publisher = "Canonical";
  const offer = "UbuntuServer"; // az vm image list --all --publisher Canonical --offer UbuntuServer
  const sku = "18_04-lts-gen2";
  const adminUsername = "notadmin";
  const adminPassword = "Pa$$w0rd92";
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  const resourceGroupName = process.env.RESOURCE_GROUP_NAME;

  const manager = new VmManager(
    prefix,
    location,
    accType,
    publisher,
    offer,
    sku,
    adminUsername,
    adminPassword,
    subscriptionId
  );

  // This should be async, also provide vmName and resourceGroupName as parameters.
  // Make stop() and delete() calls independentally from the constructor requirement.
  try {
    await manager.createResources();
  } catch (error) {
    await manager.deleteResources();
  }

  context.res = {
    body: `Created VM ${manager.vmName} inside ${manager.resourceGroupName} ...`,
  };
};

export default httpTrigger;
