// Restaurant Tracker - Azure Infrastructure
// Uses free/low-cost tiers suitable for Azure free credits

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

// =====================================================
// Cosmos DB Account - Free Tier
// =====================================================
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-11-15' = {
  name: cosmosAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    enableFreeTier: true // Uses free tier (1000 RU/s, 25GB)
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
        name: 'EnableServerless' // Alternative: use serverless for pay-per-use
      }
    ]
    // Security: Disable key-based auth, use RBAC only
    disableLocalAuth: false // Set to true once RBAC is configured
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
        includedPaths: [
          {
            path: '/*'
          }
        ]
        excludedPaths: [
          {
            path: '/"_etag"/?'
          }
        ]
      }
    }
  }
}

// =====================================================
// Azure Static Web App - Free Tier
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
    buildProperties: {
      appLocation: '/frontend'
      apiLocation: '/api'
      outputLocation: 'dist'
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

// =====================================================
// RBAC: Grant Static Web App access to Cosmos DB
// =====================================================

// Built-in role: Cosmos DB Built-in Data Contributor
// This allows read/write access to Cosmos DB data using Managed Identity
var cosmosDataContributorRoleId = '00000000-0000-0000-0000-000000000002'

resource cosmosRoleAssignment 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2023-11-15' = {
  parent: cosmosAccount
  name: guid(cosmosAccount.id, staticWebApp.id, cosmosDataContributorRoleId)
  properties: {
    roleDefinitionId: '${cosmosAccount.id}/sqlRoleDefinitions/${cosmosDataContributorRoleId}'
    principalId: staticWebApp.identity.principalId
    scope: cosmosAccount.id
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
