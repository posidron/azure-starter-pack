import { CachingTypes, ComputeManagementClient } from "@azure/arm-compute";
import { NetworkManagementClient } from "@azure/arm-network";
import { ResourceManagementClient } from "@azure/arm-resources";
import { StorageManagementClient } from "@azure/arm-storage";
import {
  ClientSecretCredential,
  DefaultAzureCredential,
} from "@azure/identity";
import { v4 as uuid } from "uuid";

export default class VmManager {
  prefix: string;
  projectName: string;
  location: string;
  accType: string;
  publisher: string;
  offer: string;
  sku: string;
  adminUsername: string;
  adminPassword: string;
  subscriptionId: string;

  resourceClient: ResourceManagementClient;
  computeClient: ComputeManagementClient;
  storageClient: StorageManagementClient;
  networkClient: NetworkManagementClient;

  resourceGroupName: string;
  vmName: string;
  storageAccountName: string;
  vnetName: string;
  subnetName: string;
  publicIPName: string;
  networkInterfaceName: string;
  ipConfigName: string;
  domainNameLabel: string;
  osDiskName: string;

  constructor(
    prefix: string,
    location: string,
    accType: string,
    publisher: string,
    offer: string,
    sku: string,
    adminUsername: string,
    adminPassword: string,
    subscriptionId: string
  ) {
    this.prefix = prefix;
    this.projectName = `${prefix}-vm`;
    this.location = location;
    this.accType = accType;
    this.publisher = publisher;
    this.offer = offer;
    this.sku = sku;
    this.adminUsername = adminUsername;
    this.adminPassword = adminPassword;
    this.subscriptionId = subscriptionId;

    let credentials = null;
    if (process.env.production) {
      credentials = new DefaultAzureCredential();
    } else {
      credentials = new ClientSecretCredential(
        process.env.AZURE_TENANT_ID,
        process.env.AZURE_CLIENT_ID,
        process.env.AZURE_CLIENT_SECRET
      );
    }

    this.resourceClient = new ResourceManagementClient(
      credentials,
      subscriptionId
    );
    this.computeClient = new ComputeManagementClient(
      credentials,
      subscriptionId
    );
    this.storageClient = new StorageManagementClient(
      credentials,
      subscriptionId
    );
    this.networkClient = new NetworkManagementClient(
      credentials,
      subscriptionId
    );

    const randomId = () => uuid().split("-")[4];

    this.resourceGroupName = `${prefix}-testrg-${randomId()}`;
    this.vmName = `${prefix}vm${randomId()}`;
    this.storageAccountName = `${prefix}ac${randomId()}`;
    this.vnetName = `${prefix}vnet${randomId()}`;
    this.subnetName = `${prefix}subnet${randomId()}`;
    this.publicIPName = `${prefix}pip${randomId()}`;
    this.networkInterfaceName = `${prefix}nic${randomId()}`;
    this.ipConfigName = `${prefix}crpip${randomId()}`;
    this.domainNameLabel = `${prefix}domainname${randomId()}`;
    this.osDiskName = `${prefix}osdisk${randomId()}`;
  }

  async createResources() {
    await this.createResourceGroup();
    await this.createStorageAccount();
    await this.createVnet();
    let subnetInfo = await this.getSubnetInfo();
    let publicIPInfo = await this.createPublicIP();
    let nicInfo = await this.createNIC(subnetInfo, publicIPInfo);
    let vmImageInfo = await this.findVMImage();
    await this.getNICInfo();
    await this.createVirtualMachine(nicInfo.id, vmImageInfo[0].name);
  }

  async createResourceGroup() {
    console.log(`1. Creating resource group: ${this.resourceGroupName}`);
    const groupParameters = {
      location: this.location,
      tags: { project: this.projectName },
    };
    return await this.resourceClient.resourceGroups.createOrUpdate(
      this.resourceGroupName,
      groupParameters
    );
  }

  async createStorageAccount() {
    console.log(`2. Creating storage account: ${this.storageAccountName}`);
    const createParameters = {
      location: this.location,
      sku: {
        name: this.accType,
      },
      kind: "Storage",
      tags: {
        project: this.projectName,
      },
    };
    return await this.storageClient.storageAccounts.beginCreateAndWait(
      this.resourceGroupName,
      this.storageAccountName,
      createParameters
    );
  }

  async createVnet() {
    console.log(`3. Creating vnet: ${this.vnetName}`);
    const vnetParameters = {
      location: this.location,
      addressSpace: {
        addressPrefixes: ["10.0.0.0/16"],
      },
      dhcpOptions: {
        dnsServers: ["10.1.1.1", "10.1.2.4"],
      },
      subnets: [{ name: this.subnetName, addressPrefix: "10.0.0.0/24" }],
    };
    return await this.networkClient.virtualNetworks.beginCreateOrUpdateAndWait(
      this.resourceGroupName,
      this.vnetName,
      vnetParameters
    );
  }

  async getSubnetInfo() {
    console.log(`Getting subnet info for: ${this.subnetName}`);
    return await this.networkClient.subnets.get(
      this.resourceGroupName,
      this.vnetName,
      this.subnetName
    );
  }

  async createPublicIP() {
    console.log(`4. Creating public IP: ${this.publicIPName}`);
    const publicIPParameters = {
      location: this.location,
      publicIPAllocationMethod: "Dynamic",
      dnsSettings: {
        domainNameLabel: this.domainNameLabel,
      },
    };
    return await this.networkClient.publicIPAddresses.beginCreateOrUpdateAndWait(
      this.resourceGroupName,
      this.publicIPName,
      publicIPParameters
    );
  }

  async createNIC(subnetInfo, publicIPInfo) {
    console.log(`5. Creating Network Interface: ${this.networkInterfaceName}`);
    const nicParameters = {
      location: this.location,
      ipConfigurations: [
        {
          name: this.ipConfigName,
          privateIPAllocationMethod: "Dynamic",
          subnet: subnetInfo,
          publicIPAddress: publicIPInfo,
        },
      ],
    };
    return await this.networkClient.networkInterfaces.beginCreateOrUpdateAndWait(
      this.resourceGroupName,
      this.networkInterfaceName,
      nicParameters
    );
  }

  async findVMImage() {
    console.log(
      `Finding a VM image for %s from publisher %s with offer %s and sku %s`,
      this.location,
      this.publisher,
      this.offer,
      this.sku
    );
    const listResult = new Array();
    for (const item of await this.computeClient.virtualMachineImages.list(
      this.location,
      this.publisher,
      this.offer,
      this.sku
    )) {
      listResult.push(item);
    }
    return listResult;
  }

  async getNICInfo() {
    return await this.networkClient.networkInterfaces.get(
      this.resourceGroupName,
      this.networkInterfaceName
    );
  }

  async createVirtualMachine(nicId, version) {
    const vmParameters = {
      location: this.location,
      osProfile: {
        computerName: this.vmName,
        adminUsername: this.adminUsername,
        adminPassword: this.adminPassword,
      },
      hardwareProfile: {
        vmSize: "Standard_B1ls",
      },
      storageProfile: {
        imageReference: {
          publisher: this.publisher,
          offer: this.offer,
          sku: this.sku,
          version: version,
        },
        osDisk: {
          name: this.osDiskName,
          caching: <CachingTypes>"None",
          createOption: "fromImage",
          vhd: {
            uri: `https://${this.storageAccountName}.blob.core.windows.net/nodejscontainer/osnodejslinux.vhd`,
          },
        },
      },
      networkProfile: {
        networkInterfaces: [
          {
            id: nicId,
            primary: true,
          },
        ],
      },
    };
    console.log(`6. Creating Virtual Machine: ${this.vmName}`);
    console.log("VM parameters: " + JSON.stringify(vmParameters, null, 2));

    await this.computeClient.virtualMachines.beginCreateOrUpdateAndWait(
      this.resourceGroupName,
      this.vmName,
      vmParameters
    );
    return await this.computeClient.virtualMachines.get(
      this.resourceGroupName,
      this.vmName
    );
  }

  async deleteResources() {
    await this.resourceClient.resourceGroups.beginDelete(
      this.resourceGroupName
    );
  }

  async stopVM() {
    return await this.computeClient.virtualMachines.beginPowerOff(
      this.resourceGroupName,
      this.vmName
    );
  }

  async startVM() {
    return await this.computeClient.virtualMachines.beginStartAndWait(
      this.resourceGroupName,
      this.vmName
    );
  }

  async listVMs() {
    const instances = new Array();
    for await (const item of this.computeClient.virtualMachines.listAll()) {
      instances.push(item);
    }
    instances.map((vm) => {
      console.log(`${vm.name}`);
      vm.instanceView.statuses.map((status) => {
        console.log(
          `---${status.displayStatus} ${status.time ? status.time : ""}`
        );
      });
    });
    return instances;
  }
}
