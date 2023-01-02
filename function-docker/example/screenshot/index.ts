import { TableClient } from "@azure/data-tables";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { generateReadOnlySASUrl } from "./utilities";

import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
chromium.use(StealthPlugin());

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { url } = req.query || req.body;

  if (!url) {
    context.res = {
      status: 400,
      body: "Use url on the query string or in the request body.",
    };
    return;
  }

  const options = {
    // args: ["--no-zygote", "--no-xshm"],
    chromiumSandbox: false,
    logger: {
      isEnabled: () => true,
      log: (name, severity, message, args) => console.log(name, message),
    },
  };

  const browser = await chromium.launch(options);
  const browserContext = await browser.newContext();
  const page = await browserContext.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(url);
  await page.waitForLoadState("domcontentloaded");
  const screenshot = await page.screenshot({ fullPage: true });
  await page.close();
  await browser.close();

  // Use Azurite in development mode.
  const connectionString =
    process.env.AzureWebJobsStorage || "UseDevelopmentStorage=true";

  // Add a message to the Storage queue via Bindings.
  context.bindings.msg = url;

  // Add the screenshot as a blob to the Storage container.
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient("screenshots");
  containerClient.createIfNotExists();
  const blob = containerClient.getBlockBlobClient(`${uuidv4()}.png`);
  await blob.uploadData(screenshot);

  // Gererate a SAS URL for the blob.
  const sasUrl = await generateReadOnlySASUrl(
    connectionString,
    "screenshots",
    blob.name
  );
  console.log(sasUrl);

  // Add entry to the Azure Table.
  const client = TableClient.fromConnectionString(
    process.env.AzureWebJobsStorage,
    "screenshots"
  );
  await client.createTable();
  const entities = client.listEntities();
  for await (const entity of entities) {
    console.log(entity);
  }
  await client.createEntity({
    partitionKey: new URL(url).hostname,
    rowKey: uuidv4(),
  });

  // Return screenshot as a response to the client.
  context.res.setHeader("Content-Type", "image/png");
  context.res.body = new Uint8Array(screenshot);
};

export default httpTrigger;
