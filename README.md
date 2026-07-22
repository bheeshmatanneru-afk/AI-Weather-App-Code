# Weather Intelligence Bureau

An AI-powered decision science and meteorological advisory web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Google Gemini AI**, powered by **Open-Meteo** satellite telemetry.

---

## 🌟 Key Features

- **Real-Time Telemetry & Search**: Instant city search with autocompletion and GPS coordinate lookup.
- **Atmospheric Overview & 7-Day Range**: Interactive SVG thermal sequence graphs, rain precipitation totals, and daily UV index tracking.
- **Gemini AI Intelligence Advisory**: Personalized recommendations for clothing layers, activity suitability scores, commute timing, and atmospheric alerts.
- **Favorite Locations**: Pin and manage custom coordinates for quick telemetry access.
- **Edge & Static Hosting Resilience**: Built-in client-side fallbacks for Open-Meteo geocoding and intelligence generation when hosted on static edge networks (such as Cloudflare Pages) without a Node.js server.

---

## 📁 Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── CitySearch.tsx         # City search bar with proxy & direct fallback
│   │   ├── IntelligencePanel.tsx  # Gemini AI advisory layout
│   │   ├── SavedLocations.tsx     # Pinned favorite coordinates
│   │   └── WeeklyForecast.tsx     # 7-Day sequence & interactive SVG chart
│   ├── utils/
│   │   ├── intelligenceFallback.ts # Client-side intelligence generator
│   │   └── weatherUtils.ts       # Weather code mappings & labels
│   ├── App.tsx                   # Main application entry
│   ├── main.tsx                  # React DOM mount point
│   └── types.ts                  # Shared TypeScript interfaces
├── server.ts                     # Full-stack Express server (Dev & Node production)
├── .env.example                  # Environment variable reference
├── package.json                  # Dependencies and build scripts
└── package-lock.json             # NPM lockfile for deterministic installs
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

---

### Step-by-Step Local Setup

#### Step 1: Install Dependencies
```bash
npm install
```

> **Note:** A `package-lock.json` file is generated and included. This prevents dependency caching warnings on deployment platforms like Cloudflare Pages.

#### Step 2: Configure Environment Variables
Copy the example environment file and add your Gemini API Key:

```bash
cp .env.example .env
```

Edit `.env` and set your key:
```env
GEMINI_API_KEY="your-actual-gemini-api-key"
```

#### Step 3: Launch Development Server
```bash
npm run dev
```

The application will start at `http://localhost:3000` with hot-reloading for client assets and automatic TypeScript execution for `server.ts`.

---

## ⚡ Cloudflare Development Environment Setup (Workers & Pages Local Dev)

To develop and test the app locally using **Cloudflare Workers & Pages Functions** runtime (instead of the Node.js Express server), follow these step-by-step instructions using Cloudflare's **Wrangler** CLI tool.

### Prerequisites

- **Wrangler CLI**: Cloudflare's official command line tool (runs via `npx wrangler`).
- **Cloudflare Account**: Free tier account at [dash.cloudflare.com](https://dash.cloudflare.com/) (required if deploying or creating Cloudflare preview links).

---

### Step 1: Install Wrangler CLI

Ensure `wrangler` is available in your workspace as a developer dependency:

```bash
npm install --save-dev wrangler
```

---

### Step 2: Configure Local Environment Variables (`.dev.vars`)

In Cloudflare Pages Functions local development, environment secrets (such as your Gemini API Key) are loaded from a `.dev.vars` file in the root directory.

Create a `.dev.vars` file:

```bash
touch .dev.vars
```

Add your Gemini API key inside `.dev.vars`:

```env
# .dev.vars (Used automatically by wrangler pages dev)
GEMINI_API_KEY="your-gemini-api-key-here"
```

> ⚠️ **Security Warning**: Ensure `.dev.vars` is added to `.gitignore` so secrets are never pushed to version control.

---

### Step 3: Create Cloudflare Pages Functions (`/functions/api/[[path]].ts`)

Cloudflare Pages automatically mounts files inside the `/functions` directory as API endpoints. To handle all `/api/*` routes locally and on Cloudflare edge:

Create `/functions/api/[[path]].ts`:

```typescript
// functions/api/[[path]].ts
import { GoogleGenAI } from "@google/genai";

interface Env {
  GEMINI_API_KEY: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // 1. City Search Proxy
  if (path === "/api/search-city") {
    const query = url.searchParams.get("name") || "";
    if (!query) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`
    );
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // 2. Weather Forecast Proxy
  if (path === "/api/forecast") {
    const lat = url.searchParams.get("latitude") || "40.7128";
    const lon = url.searchParams.get("longitude") || "-74.0060";
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,wind_speed_10m_max&timezone=auto`;
    const res = await fetch(forecastUrl);
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // 3. Gemini AI Intelligence Endpoint
  if (path === "/api/intelligence" && context.request.method === "POST") {
    try {
      const body = await context.request.json() as any;
      const apiKey = context.env.GEMINI_API_KEY;

      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "GEMINI_API_KEY not configured in .dev.vars" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Act as an expert meteorologist and decision scientist. Analyze weather data for ${body.locationName} and provide advisory JSON: Current temp ${body.current?.temperature_2m}°C.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      return new Response(response.text, {
        headers: { "Content-Type": "application/json" }
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message || "Intelligence generation failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(JSON.stringify({ error: "Route not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}
```

---

### Step 4: Run Cloudflare Local Development Server

To simulate the Cloudflare Pages & Workers environment on your local machine:

#### 1. Build Static Assets First:
```bash
npx vite build
```

#### 2. Start Local Cloudflare Pages Dev Server:
```bash
npx wrangler pages dev dist --port 3000
```

`wrangler` will:
- Serve static frontend assets from `dist/`
- Execute functions inside `/functions` using Cloudflare's local `workerd` runtime engine
- Load secret variables directly from `.dev.vars`
- Bind to `http://localhost:3000`

---

### Step 5: (Optional) Add Cloudflare Dev Script to `package.json`

For quick command execution, add a custom npm script to `package.json`:

```json
"scripts": {
  "dev": "tsx server.ts",
  "dev:cloudflare": "vite build && wrangler pages dev dist --port 3000",
  "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs"
}
```

Run Cloudflare local dev environment with:
```bash
npm run dev:cloudflare
```

---

### Step 6: Expose Local Dev Server with Cloudflare Tunnels (Dev Hosted URL)

If you need a public HTTPS hosted URL for testing on mobile devices or sharing with team members during local development:

1. **Authenticate Wrangler** (one-time setup):
   ```bash
   npx wrangler login
   ```

2. **Launch Cloudflare Tunnel to local dev server**:
   ```bash
   npx wrangler pages dev dist --tunnel
   ```

Wrangler will generate a temporary public Cloudflare URL (e.g., `https://xxxx.trycloudflare.com`) pointing directly to your local development server!

---

## 🏗️ Building for Production

To build the full-stack bundle (Vite static assets + compiled Node.js CJS server):

```bash
npm run build
```

This generates:
- `dist/`: Compressed frontend static assets (`index.html`, CSS, JS bundles).
- `dist/server.cjs`: Bundled backend server.

To start the compiled Node.js production server:

```bash
npm start
```

---

## ☁️ Deployment Guide (Cloudflare Pages / Cloudflare Workers)

This application can be hosted on **Cloudflare Pages** or **Cloudflare Workers** in two ways:

---

### Method A: Static Cloudflare Pages Deployment (Recommended & Simple)

Since the app includes **built-in client-side fallback handling**, it can run seamlessly as a single-page application (SPA) on Cloudflare Pages without needing a Node backend. If `/api/*` endpoints are unreachable on static hosting, the app automatically connects directly to Open-Meteo's geocoding and forecast APIs and generates rich local weather advice on the client.

#### Step 1: Connect Repository to Cloudflare Pages
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
2. Click **Create Application** > **Pages** > **Connect to Git**.
3. Select your repository.

#### Step 2: Configure Build Settings
Set the following framework and build options:

- **Framework preset**: `None` or `Vite`
- **Build command**: `npx vite build`
- **Build output directory**: `dist`
- **Node.js Version**: `18.x` or higher (Set `NODE_VERSION=18` in Environment Variables)

#### Step 3: Deploy
Click **Save and Deploy**. Cloudflare Pages will build the static client and host it on a `*.pages.dev` domain.

---

### Method B: Full-Stack Cloudflare Pages with Functions / Workers

To proxy API requests server-side and keep `GEMINI_API_KEY` hidden:

#### Step 1: Add a Cloudflare Function for API Routes
Create a file at `/functions/api/[[path]].ts`:

```typescript
export async function onRequest(context: any) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path.startsWith("/api/search-city")) {
    const query = url.searchParams.get("name") || "";
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
    return new Response(await res.text(), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (path.startsWith("/api/forecast")) {
    const lat = url.searchParams.get("latitude");
    const lon = url.searchParams.get("longitude");
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,wind_speed_10m_max&timezone=auto`);
    return new Response(await res.text(), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ error: "Endpoint not found" }), { status: 404 });
}
```

#### Step 2: Set Secret Environment Variables in Cloudflare
In Cloudflare Dashboard:
1. Go to **Settings** > **Environment Variables**.
2. Add `GEMINI_API_KEY` under **Production** variables/secrets.

#### Step 3: Deploy via Wrangler CLI
```bash
npx wrangler pages deploy dist
```

---

## 🐳 Docker / Cloud Run Container Deployment

To deploy the full Node.js backend server using Docker or Google Cloud Run:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
```

Build and run the container:
```bash
docker build -t weather-intelligence .
docker run -p 3000:3000 -e GEMINI_API_KEY="your-gemini-key" weather-intelligence
```

---

## 🛠️ Troubleshooting Common Issues

### 1. Cloudflare Pages Notice: "No package-lock.json... Build caching not supported"
- **Solution**: Ensure `package-lock.json` is committed to git. Running `npm install --package-lock-only` generates `package-lock.json` without modifying `node_modules`.

### 2. Search Bar Notice: "no coordinates matching found" or JSON Parse Errors
- **Root Cause**: Occurs when `/api/search-city` endpoint is called on a purely static host and returns an HTML `404 Not Found` page instead of JSON.
- **Fix**: The search component (`CitySearch.tsx`) automatically checks response headers for `application/json` and gracefully falls back to the direct Open-Meteo geocoding API (`https://geocoding-api.open-meteo.com`).

### 3. Missing `GEMINI_API_KEY`
- If `GEMINI_API_KEY` is not provided, the application will automatically fall back to client-side rule-based intelligence generation (`intelligenceFallback.ts`), ensuring the UI displays complete clothing and activity advisory panels without breaking.

---

## 📄 License

This project is licensed under the MIT License.
