# ⚡ VoltGrid — EV Charging Station Management

Full-stack EV charging station management app built with **Node.js + Express + MongoDB** (backend) and **Vue 3 + Pinia** (frontend).

---

## 🏗️ Project Structure

```
ev-charger-app/
├── backend/          # Node.js + Express REST API
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth, error handling
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routers
│   └── server.js     # Entry point
└── frontend/         # Vue 3 SPA
    └── src/
        ├── api/      # Axios instance
        ├── assets/   # Global CSS
        ├── components/
        ├── router/
        ├── stores/   # Pinia stores
        └── views/
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env        # Edit with your values
npm run dev                 # Starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                 # Starts on http://localhost:3000
```

---

## 🌐 API Reference

### Auth Endpoints (Public)
| Method | Endpoint              | Description      |
|--------|-----------------------|------------------|
| POST   | `/api/auth/register`  | Register user    |
| POST   | `/api/auth/login`     | Login & get JWT  |
| GET    | `/api/auth/me`        | Get current user |

### Station Endpoints (Protected — Bearer JWT required)
| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| GET    | `/api/stations`       | List all (with filters)|
| GET    | `/api/stations/:id`   | Get one station        |
| POST   | `/api/stations`       | Create station         |
| PUT    | `/api/stations/:id`   | Update station         |
| DELETE | `/api/stations/:id`   | Delete station         |

### Filter Query Params (GET /api/stations)
- `status=Active|Inactive`
- `connectorType=CCS|CHAdeMO|Type 2|...`
- `minPower=50` (kW)
- `maxPower=350` (kW)
- `page=1&limit=20`

---

## ☁️ Cloud Deployment

### Option A: Render (Recommended — Free tier)

#### Backend
1. Push to GitHub
2. New → Web Service → select repo
3. Root Directory: `backend`
4. Build: `npm install` | Start: `node server.js`
5. Add env vars: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`

#### Frontend
1. New → Static Site → select repo
2. Root Directory: `frontend`
3. Build: `npm run build` | Publish: `dist`
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`

---

### Option B: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login

# Deploy backend
cd backend
railway init
railway up

# Deploy frontend
cd ../frontend
railway init
railway up
```

---

### Option C: Docker Compose (Self-hosted / VPS)

```yaml
# docker-compose.yml (add to project root)
version: '3.8'
services:
  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/ev_charger_db
      - JWT_SECRET=change_me_in_production
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongo_data:
```

#### Dockerfile for backend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

#### Dockerfile for frontend
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## 🔐 Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ev_charger_db
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.com
```

### Frontend `.env`
```
VITE_API_URL=https://your-backend-url.com/api
```

---

## 🧪 Testing the API

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"password123"}'

# Login → copy the token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Create station (replace TOKEN)
curl -X POST http://localhost:5000/api/stations \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Delhi Fast Charger",
    "location": {"latitude": 28.6139, "longitude": 77.2090, "address": "Connaught Place"},
    "status": "Active",
    "powerOutput": 150,
    "connectorType": "CCS"
  }'
```
