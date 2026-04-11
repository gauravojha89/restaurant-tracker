# 🍽️ FoodieMap - Restaurant Tracker

A personal web app to discover and track restaurants you want to visit and your favorites. Search restaurants on an interactive map, categorize them, and manage your food adventures!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Azure](https://img.shields.io/badge/Azure-Static%20Web%20Apps-0078D4)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)

## ✨ Features

- 🗺️ **Interactive Map** - Search and explore restaurants with Mapbox
- 📍 **To Visit List** - Save places you want to try
- ❤️ **Favorites** - Track restaurants you've visited and loved
- 🏷️ **Categories** - Breakfast, Brunch, Lunch, Dinner, Coffee, Desserts
- 🌆 **City Filter** - Filter by city for easy organization
- ⭐ **Personal Ratings** - Rate your favorite spots
- 📝 **Notes** - Add personal notes to each restaurant
- 🔒 **Secure by Design** - Azure Managed Identity, no secrets in code

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Static Web Apps                 │
│  ┌──────────────────┐      ┌──────────────────────────┐ │
│  │   React Frontend │      │   Azure Functions API    │ │
│  │   (Vite + TS)    │ ──── │   (Node.js + TS)         │ │
│  └──────────────────┘      └──────────────────────────┘ │
│                                      │                   │
│                                      │ Managed Identity  │
│                                      ▼                   │
│                            ┌──────────────────┐          │
│                            │   Cosmos DB      │          │
│                            │   (Free Tier)    │          │
│                            └──────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Azure CLI
- Mapbox account (free tier)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/restaurant-tracker.git
   cd restaurant-tracker
   ```

2. **Set up environment variables**
   ```bash
   cp frontend/.env.example frontend/.env
   # Edit .env and add your Mapbox token
   ```

3. **Install dependencies & run**
   ```bash
   # Frontend
   cd frontend
   npm install
   npm run dev

   # API (in another terminal)
   cd api
   npm install
   npm run start
   ```

4. **Open** http://localhost:5173

### Get a Mapbox Token

1. Sign up at [Mapbox](https://www.mapbox.com/)
2. Go to Account → Tokens
3. Copy your default public token
4. Add to `frontend/.env`:
   ```
   VITE_MAPBOX_TOKEN=pk.your_token_here
   ```

## ☁️ Azure Deployment

### Prerequisites

1. Azure subscription with free credits
2. Azure CLI logged in (`az login`)
3. GitHub repository

### Deploy Infrastructure

```bash
# Create resource group
az group create --name rg-foodiemap-dev --location eastus

# Deploy Bicep infrastructure
az deployment group create \
  --resource-group rg-foodiemap-dev \
  --template-file infra/main.bicep \
  --parameters infra/main.parameters.json
```

### CI/CD Setup

1. **Get Static Web Apps deployment token**
   ```bash
   az staticwebapp secrets list --name <your-swa-name> --query "properties.apiKey" -o tsv
   ```

2. **Add GitHub secrets**
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` - From step 1
   - `VITE_MAPBOX_TOKEN` - Your Mapbox token
   - `AZURE_CLIENT_ID` - For FIC (optional)
   - `AZURE_TENANT_ID` - For FIC (optional)
   - `AZURE_SUBSCRIPTION_ID` - Your subscription

3. **Push to main branch** - Deployment happens automatically!

## 🔐 Security Features

- **Managed Identity (MI)** - No credentials stored; Azure handles authentication
- **Federated Identity Credentials (FIC)** - Secure GitHub Actions without secrets
- **RBAC** - Principle of least privilege for Cosmos DB access
- **CSP Headers** - Content Security Policy protection
- **HTTPS Only** - All traffic encrypted

## 💰 Cost Optimization

This project uses **free tiers** where possible:

| Resource | Tier | Monthly Cost |
|----------|------|--------------|
| Static Web Apps | Free | $0 |
| Cosmos DB | Free Tier | $0* |
| Mapbox | Free (50k loads) | $0 |

*Free tier: 1000 RU/s, 25GB storage

## 📁 Project Structure

```
restaurant-tracker/
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom hooks
│   │   ├── store.ts    # Zustand state
│   │   └── types.ts    # TypeScript types
│   └── staticwebapp.config.json
├── api/                # Azure Functions API
│   ├── src/
│   │   ├── cosmos.ts   # Cosmos DB client
│   │   └── functions/  # HTTP functions
│   └── host.json
├── infra/              # Bicep infrastructure
│   ├── main.bicep
│   └── main.parameters.json
└── .github/workflows/  # CI/CD pipelines
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS 4
- **Map**: Mapbox GL JS, react-map-gl
- **State**: Zustand (persisted to localStorage)
- **Backend**: Azure Functions (Node.js v4)
- **Database**: Azure Cosmos DB
- **Hosting**: Azure Static Web Apps
- **Infrastructure**: Bicep (IaC)
- **CI/CD**: GitHub Actions

## 📖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants` | Get all saved restaurants |
| POST | `/api/restaurants` | Create/update a restaurant |
| DELETE | `/api/restaurants/:id` | Delete a restaurant |
| GET | `/api/health` | Health check |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file
