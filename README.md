# 📍 Plotter — Storytelling on the Map

Plotter is a high-performance, interactive location-based storytelling platform. It allows users to drop stories as "pins" on a global map, interact with others through specialized reactions, and extend narrative branches via threaded continuations. 

Built with a premium **Coffee & Cream** aesthetic, Plotter supports seamless Light/Dark mode transitions and lightning-fast spatial queries.

---

## ✨ Key Features

- **Spatial Discovery**: View and explore stories localized to your current map view using PostGIS-powered bounding box queries.
- **Deep Linking**: Share specific stories with unique links (`/?story=ID`) that automatically fly the map to the location and open the story popup.
- **Social Interactions**: Instagram-style reactions (Likes) with optimistic UI updates for instant feedback.
- **Comment System**: Discuss stories and mention other users with `@username` reply functionality.
- **Threaded Branching**: Write "Continuations" to existing stories, creating a collaborative narrative tree.
- **Dynamic Theming**: Responsive Light and Dark modes with automatic Map tile swapping (CartoDB Voyager/DarkMatter).
- **Pro Layout**: Mobile-responsive bottom sheets and desktop-side popups.

---

## 🛠 Tech Stack

### Frontend
- **React 19 & Vite**: Modern, fast UI development.
- **React Leaflet**: Maps API integration.
- **React Router 7**: Sophisticated routing and deep linking.
- **Lucide React**: Clean, consistent iconography.
- **React Hot Toast**: Professional, non-intrusive notifications.

### Backend
- **Node.js & Express 5**: Robust API architecture.
- **PostgreSQL + PostGIS**: High-performance spatial indexing and storage.
- **Supabase Auth**: JWT-based identity management.
- **ioredis**: Geobounds result caching for ultra-fast map panning.

---

## 🚀 Getting Started

### 1. Database Setup
Plotter uses **PostGIS** for spatial calculations.
1. Create a database in your PostgreSQL instance (or use Supabase).
2. Run the migrations located in `db/migrations/`:
   - `001_init.sql` (Schema & PostGIS setup)
   - `002_auth_and_features.sql` (Users & Reactions)
   - `003_comments.sql` (Commenting system)

### 2. Environment Configuration
Plotter uses a "Two-File System" for security and clarity:

1.  **Backend (.env)**: Place this in the root directory. It contains your Database and Supabase Auth secrets.
2.  **Frontend (client/.env)**: Place this inside the `client/` folder. It contains your public Supabase keys and the API URL.

Copy the examples from `.env.example` into these two files.

### 3. Installation
```bash
# Install root/backend dependencies
npm install

# Install frontend dependencies
cd client && npm install
```

### 4. Running Locally
**Start the Backend:**
```bash
npm run server:dev
```
**Start the Frontend:**
```bash
cd client
npm run dev
```

---

## 🌍 Deployment

### Database
We recommend using **Supabase** for the hosted PostgreSQL/PostGIS instance.

### Backend (API)
- **Platforms**: Railway, Render, or Heroku.
- **Root Directory**: `./`
- **Build Command**: `npm install`
- **Start Command**: `node server/index.js`

### Frontend (Client)
- **Platforms**: Vercel or Netlify.
- **Root Directory**: `client/`
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Env Vars**: Ensure you set `VITE_API_URL` to your deployed backend URL.

