// Restaurant Tracker - Azure Infrastructure (Azure-only, no third-party services)

@description('The location for all resources')
param location string = resourceGroup().location

@description('Environment name (dev, staging, prod)')
param environmentName string = 'dev'

@description('Unique suffix for resource names')
param uniqueSuffix string = uniqueString(resourceGroup().id)

// Variables
var appName = 'foodiemap'
var resourcePrefix = '${appName}-${environmentName}'
var cosmosAccountName = '${resourcePrefix}-cosmos-${uniqueSuffix}'
var staticWebAppName = '${resourcePrefix}-swa-${uniqueSuffix}'
var mapsAccountName = '${resourcePrefix}-maps-${uniqueSuffix}'

// =====================================================
// Cosmos DB Account - Serverless (minimal cost, pay per use)
// =====================================================
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-11-15' = {
  name: cosmosAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
    disableLocalAuth: false
  }
}

// Cosmos DB Database
resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-11-15' = {
  parent: cosmosAccount
  name: 'restauranttracker'
  properties: {
    resource: {
      id: 'restauranttracker'
    }
  }
}

// Cosmos DB Container
resource cosmosContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-11-15' = {
  parent: cosmosDatabase
  name: 'restaurants'
  properties: {
    resource: {
      id: 'restaurants'
      partitionKey: {
        paths: ['/partitionKey']
        kind: 'Hash'
        version: 2
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [{ path: '/*' }]
        excludedPaths: [{ path: '/"_etag"/?' }]
      }
    }
  }
}

// =====================================================
// Azure Maps - Gen2 (replaces all third-party map services)
// ~500 QPS free, then $0.42/1000 transactions - very cheap for personal use
// =====================================================
resource mapsAccount 'Microsoft.Maps/accounts@2023-06-01' = {
  name: mapsAccountName
  location: 'global'
  sku: {
    name: 'G2'
  }
  kind: 'Gen2'
  properties: {
    disableLocalAuth: false
  }
}

// =====================================================
// Azure Static Web App - Free Tier (frontend + CI/CD)
// =====================================================
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
}

// =====================================================
// Outputs
// =====================================================
output staticWebAppName string = staticWebApp.name
output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
output staticWebAppId string = staticWebApp.id

output cosmosAccountName string = cosmosAccount.name
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
output cosmosDatabaseName string = cosmosDatabase.name
output cosmosContainerName string = cosmosContainer.name

output mapsAccountName string = mapsAccount.name
// Note: retrieve the subscription key after deployment with:
// az maps account keys list --name <name> --resource-group <rg> --query primaryKey -o tsv
