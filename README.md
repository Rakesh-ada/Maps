# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---

# FloodWatch (Kolkata) — Backend

FastAPI backend for flood risk scoring + flood-aware routing + crowd reports + ML training persistence + training reports/plots.

## Quick start (Windows)

### 1) Create venv (recommended location)
Run these commands from the project root:

```bash
cd backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 2) Run the API server
```bash
cd backend
.\venv\Scripts\uvicorn.exe app:app --reload --host 127.0.0.1 --port 8000
```
Open:
- [Swagger UI](http://127.0.0.1:8000/docs)
- [OpenAPI spec](http://127.0.0.1:8000/openapi.json)

## API endpoints (for frontend)

**Base URL (local):** `http://127.0.0.1:8000`

### Health endpoints (for deployment/monitoring)
- `GET /health`
  - Basic liveness check. Returns: `{ "status": "ok" }`
- `GET /ready`
  - Readiness check. Returns: `ready` (bool), `components` (dict), `ml_trained` (bool)

### Core endpoints

1. **`GET /risk`**
   - Query params: `lat` (float), `lon` (float)
   - Response: `risk_score` (0..1), `risk_level` (string), `ml_details` (cluster, anomaly)
   - Example: `/risk?lat=22.57&lon=88.36`

2. **`GET /route`**
   - Query params: `start_lat`, `start_lon`, `end_lat`, `end_lon`
   - Response: `distance_km`, `route_risk` (0..1), `geometry` (GeoJSON LineString)
   - Example: `/route?start_lat=22.57&start_lon=88.36&end_lat=22.656&end_lon=88.438`

3. **`POST /report`**
   - Body (JSON): `{ "lat": 22.57, "lon": 88.36, "severity": 4 }`
   - Response: `{ "status": "report received" }`

4. **`GET /alerts`**
   - Response: `{ "alerts": [...], "messages": [...] }`
   - `alerts`: marker-friendly dicts (`lat`, `lon`, `risk_score`, `count`, `severity_max`, `severity_avg`, `message`)

### ML / training report endpoints

5. **`GET /ml/stats`**
   - Response: `{ "trained": true/false, "training_report": { ... } }`
   - Includes metrics, classifier coefficients, and plots.

6. **`GET /ml/plots`**
   - Response: `{ "plots": { "plot_key": "filename.png", ... } }`
   - Keys: `cluster_counts`, `anomaly_hist`, `risk_hist`, `feature_hists`, `pca_clusters`, `risk_heatmap`

7. **`GET /ml/plot/{plot_key}`**
   - Serves a PNG image.
   - Example: `/ml/plot/risk_heatmap`

   **7b) `GET /ml/plot_meta/{plot_key}`**
   - Returns metadata (bounds) to place the plot on a map.
   - Example: `/ml/plot_meta/risk_heatmap`

8. **`POST /ml/retrain`**
   - Forces retraining immediately.
   - **NOTE**: Disabled by default on low-memory deployments.

## ML model persistence

### Artifacts location
Stored in `backend/ml_artifacts/`:
- `ml_model.joblib` (persisted model)
- `ml_training_report.json` (report)
- `plots/*.png` (training plots)

### Retraining behavior
- **On Startup**: Checks dataset fingerprint. Retrains if changed.
- **Manual**: Restart server, or call `/ml/retrain`, or run `python train_ml.py --force`.

## Deployment

### Hugging Face Spaces (Docker)
- Root `Dockerfile` runs on port 7860.
- Push repo to Spaces (select Docker).

### Render (Free Tier)
- **Environment variables**:
  - `FLOODWATCH_ML_AUTO_TRAIN_ON_STARTUP=0`
  - `FLOODWATCH_ML_ALLOW_API_RETRAIN=0`
  - `FLOODWATCH_LOAD_ROADS_GRAPH=0`
- **Model Loading**: Train locally and commit `backend/ml_artifacts/*.joblib` before deploying.

## React Native Map Layer (Waterlogging)

**Toggle ON:**
1. Fetch PNG: `GET /ml/plot/risk_heatmap`
2. Fetch bounds: `GET /ml/plot_meta/risk_heatmap`
3. Overlay PNG on map using bounds.
4. Fetch alerts: `GET /alerts` and display markers.

**Toggle OFF:**
- Remove overlay and clear markers.

Repository: [https://github.com/sn0wstorm20202/FloodWatch.git](https://github.com/sn0wstorm20202/FloodWatch.git)
