"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var arm_compute_1 = require("@azure/arm-compute");
var arm_network_1 = require("@azure/arm-network");
var arm_resources_1 = require("@azure/arm-resources");
var arm_storage_1 = require("@azure/arm-storage");
var identity_1 = require("@azure/identity");
var uuid_1 = require("uuid");
console.log("HERE");
var VmManager = /** @class */ (function () {
    function VmManager(prefix, location, accType, publisher, offer, sku, adminUsername, adminPassword, subscriptionId) {
        this.prefix = prefix;
        this.projectName = "".concat(prefix, "-vm");
        this.location = location;
        this.accType = accType;
        this.publisher = publisher;
        this.offer = offer;
        this.sku = sku;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.subscriptionId = subscriptionId;
        var credentials = null;
        if (process.env.production) {
            credentials = new identity_1.DefaultAzureCredential();
        }
        else {
            credentials = new identity_1.ClientSecretCredential(process.env.AZURE_TENANT_ID, process.env.AZURE_CLIENT_ID, process.env.AZURE_CLIENT_SECRET);
        }
        this.resourceClient = new arm_resources_1.ResourceManagementClient(credentials, subscriptionId);
        this.computeClient = new arm_compute_1.ComputeManagementClient(credentials, subscriptionId);
        this.storageClient = new arm_storage_1.StorageManagementClient(credentials, subscriptionId);
        this.networkClient = new arm_network_1.NetworkManagementClient(credentials, subscriptionId);
        var randomId = function () { return (0, uuid_1.v4)().split("-")[4]; };
        this.resourceGroupName = "".concat(prefix, "-testrg-").concat(randomId());
        this.vmName = "".concat(prefix, "vm").concat(randomId());
        this.storageAccountName = "".concat(prefix, "ac").concat(randomId());
        this.vnetName = "".concat(prefix, "vnet").concat(randomId());
        this.subnetName = "".concat(prefix, "subnet").concat(randomId());
        this.publicIPName = "".concat(prefix, "pip").concat(randomId());
        this.networkInterfaceName = "".concat(prefix, "nic").concat(randomId());
        this.ipConfigName = "".concat(prefix, "crpip").concat(randomId());
        this.domainNameLabel = "".concat(prefix, "domainname").concat(randomId());
        this.osDiskName = "".concat(prefix, "osdisk").concat(randomId());
    }
    VmManager.prototype.createResources = function () {
        return __awaiter(this, void 0, void 0, function () {
            var subnetInfo, publicIPInfo, nicInfo, vmImageInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createResourceGroup()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.createStorageAccount()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.createVnet()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.getSubnetInfo()];
                    case 4:
                        subnetInfo = _a.sent();
                        return [4 /*yield*/, this.createPublicIP()];
                    case 5:
                        publicIPInfo = _a.sent();
                        return [4 /*yield*/, this.createNIC(subnetInfo, publicIPInfo)];
                    case 6:
                        nicInfo = _a.sent();
                        return [4 /*yield*/, this.findVMImage()];
                    case 7:
                        vmImageInfo = _a.sent();
                        return [4 /*yield*/, this.getNICInfo()];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this.createVirtualMachine(nicInfo.id, vmImageInfo[0].name)];
                    case 9:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VmManager.prototype.createResourceGroup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var groupParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("1. Creating resource group: ".concat(this.resourceGroupName));
                        groupParameters = {
                            location: this.location,
                            tags: { project: this.projectName }
                        };
                        return [4 /*yield*/, this.resourceClient.resourceGroups.createOrUpdate(this.resourceGroupName, groupParameters)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VmManager.prototype.createStorageAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var createParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("2. Creating storage account: ".concat(this.storageAccountName));
                        createParameters = {
                            location: this.location,
                            sku: {
                                name: this.accType
                            },
                            kind: "Storage",
                            tags: {
                                project: this.projectName
                            }
                        };
                        return [4 /*yield*/, this.storageClient.storageAccounts.beginCreateAndWait(this.resourceGroupName, this.storageAccountName, createParameters)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VmManager.prototype.createVnet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var vnetParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("3. Creating vnet: ".concat(this.vnetName));
                        vnetParameters = {
                            location: this.location,
                            addressSpace: {
                                addressPrefixes: ["10.0.0.0/16"]
                            },
                            dhcpOptions: {
                                dnsServers: ["10.1.1.1", "10.1.2.4"]
                            },
                            subnets: [{ name: this.subnetName, addressPrefix: "10.0.0.0/24" }]
                        };
                        return [4 /*yield*/, this.networkClient.virtualNetworks.beginCreateOrUpdateAndWait(this.resourceGroupName, this.vnetName, vnetParameters)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VmManager.prototype.getSubnetInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Getting subnet info for: ".concat(this.subnetName));
                        return [4 /*yield*/, this.networkClient.subnets.get(this.resourceGroupName, this.vnetName, this.subnetName)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VmManager.prototype.createPublicIP = function () {
        return __awaiter(this, void 0, void 0, function () {
            var publicIPParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("4. Creating public IP: ".concat(this.publicIPName));
                        publicIPParameters = {
                            location: this.location,
                            publicIPAllocationMethod: "Dynamic",
                            dnsSettings: {
                                domainNameLabel: this.domainNameLabel
                            }
                        };
                        return [4 /*yield*/, this.networkClient.publicIPAddresses.beginCreateOrUpdateAndWait(this.resourceGroupName, this.publicIPName, publicIPParameters)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VmManager.prototype.createNIC = function (subnetInfo, publicIPInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var nicParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("5. Creating Network Interface: ".concat(this.networkInterfaceName));
                        nicParameters = {
                            location: this.location,
                            ipConfigurations: [
                                {
                                    name: this.ipConfigName,
                                    privateIPAllocationMethod: "Dynamic",
                                    subnet: subnetInfo,
                                    publicIPAddress: publicIPInfo
                                },
                            ]
                        };
                        return [4 /*yield*/, this.networkClient.networkInterfaces.beginCreateOrUpdateAndWait(this.resourceGroupName, this.networkInterfaceName, nicParameters)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VmManager.prototype.findVMImage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var listResult, _i, _a, item;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("Finding a VM image for %s from publisher %s with offer %s and sku %s", location, this.publisher, this.offer, this.sku);
                        listResult = new Array();
                        _i = 0;
                        return [4 /*yield*/, this.computeClient.virtualMachineImages.list(this.location, this.publisher, this.offer, this.sku)];
                    case 1:
                        _a = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        item = _a[_i];
                        listResult.push(item);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/, listResult];
                }
            });
        });
    };
    VmManager.prototype.getNICInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.networkClient.networkInterfaces.get(this.resourceGroupName, this.networkInterfaceName)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VmManager.prototype.createVirtualMachine = function (nicId, version) {
        return __awaiter(this, void 0, void 0, function () {
            var vmParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vmParameters = {
                            location: this.location,
                            osProfile: {
                                computerName: this.vmName,
                                adminUsername: this.adminUsername,
                                adminPassword: this.adminPassword
                            },
                            hardwareProfile: {
                                vmSize: "Standard_B1ls"
                            },
                            storageProfile: {
                                imageReference: {
                                    publisher: this.publisher,
                                    offer: this.offer,
                                    sku: this.sku,
                                    version: version
                                },
                                osDisk: {
                                    name: this.osDiskName,
                                    caching: "None",
                                    createOption: "fromImage",
                                    vhd: {
                                        uri: "https://".concat(this.storageAccountName, ".blob.core.windows.net/nodejscontainer/osnodejslinux.vhd")
                                    }
                                }
                            },
                            networkProfile: {
                                networkInterfaces: [
                                    {
                                        id: nicId,
                                        primary: true
                                    },
                                ]
                            }
                        };
                        console.log("6. Creating Virtual Machine: ".concat(this.vmName));
                        console.log("VM parameters: " + JSON.stringify(vmParameters, null, 2));
                        return [4 /*yield*/, this.computeClient.virtualMachines.beginCreateOrUpdateAndWait(this.resourceGroupName, this.vmName, vmParameters)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.computeClient.virtualMachines.get(this.resourceGroupName, this.vmName)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return VmManager;
}());
exports["default"] = VmManager;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var prefix, location, accType, publisher, offer, sku, adminUsername, adminPassword, subscriptionId, manager;
    return __generator(this, function (_a) {
        process.env.production = "true";
        prefix = "demo";
        location = "eastus2";
        accType = "Standard_LRS";
        publisher = "Canonical";
        offer = "UbuntuServer";
        sku = "18_04-lts-gen2";
        adminUsername = "notadmin";
        adminPassword = "Pa$$w0rd92";
        console.log("Starting VM creation...");
        try {
            subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
            manager = new VmManager(prefix, location, accType, publisher, offer, sku, adminUsername, adminPassword, subscriptionId);
            manager.createResources();
            console.log("Resource Group: ".concat(manager.resourceGroupName));
            console.log("VM name: ".concat(manager.vmName));
        }
        catch (error) {
            console.log(error);
        }
        return [2 /*return*/];
    });
}); })();
