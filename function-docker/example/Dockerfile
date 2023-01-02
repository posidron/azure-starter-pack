# To enable ssh & remote debugging on app service change the base image to the one below
# FROM mcr.microsoft.com/azure-functions/node:4-node16-appservice
FROM mcr.microsoft.com/azure-functions/node:4-node16

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

WORKDIR $AzureWebJobsScriptRoot

# Download the browser build separately and create a new layer to cache it.
# The npm install step will then download the Playwright library only and
# not re-download the browser build when package.json changes.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
RUN npx playwright install-deps
RUN npx playwright install chromium

COPY --chown=node:node package*.json .
RUN npm install

COPY . .
RUN npm run build
