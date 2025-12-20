# Kediri Participatory Geoportal

A modern, beginner-friendly web-based geoportal for participatory mapping in Kediri, Indonesia. Built with free-tier services only.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## 🌟 Features

### Core Functionality
- **Interactive Map**: Full-screen Leaflet.js map with OpenStreetMap basemap
- **Dual Data Schemas**: 
  - Government Data (read-only for public, editable by admin)
  - Crowd Data (user contributions with QC/QA workflow)
- **Authentication**: Role-based access control (Public/Admin)
- **Data Upload**: Upload zipped shapefiles
- **On-Map Digitization**: Draw points and polygons directly on the map
- **Data Download**: Export data as GeoJSON or Shapefile
- **Automatic Validation**: Geometry validation and fixing via database triggers

### Data Layers
**Government Data:**
- Land Cover
- Administrative Boundaries (City/District/Village)
- Buildings
- Commercial Points
- Roads
- Education Points

**Crowd Data:**
- User Points
- User Polygons
- Uploaded Features (from shapefiles)

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript (ES6 modules)
- **Mapping**: Leaflet.js, Leaflet.draw
- **Backend**: Supabase (PostgreSQL + PostGIS)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel
- **Build Tool**: Vite
- **Version Control**: Git/GitHub

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (free tier)
- Vercel account (free tier)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd kediri-geoportal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

The `.env` file is already configured with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://wfelfwvvwtdvdcfcrlyh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_KWxkEwhRFXYy6F3O_pfEyA_3GI1X4os
```

### 4. Set Up Database

1. Go to your Supabase project dashboard: https://wfelfwvvwtdvdcfcrlyh.supabase.co
2. Navigate to **SQL Editor**
3. Run the migration files in order from `database/migrations/`:
   - `001_create_schemas.sql`
   - `002_create_government_tables.sql`
   - `003_create_crowd_tables.sql`
   - `004_create_rls_policies.sql`
   - `005_create_triggers.sql`

See [database/README.md](database/README.md) for detailed instructions.

### 5. Create Admin User

After signing up in the application:

```sql
-- Run this in Supabase SQL Editor
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin');
```

### 6. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 📦 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Deploy to production:
```bash
vercel --prod
```

## 📁 Project Structure

```
kediri-geoportal/
├── database/
│   ├── migrations/          # SQL migration files
│   └── README.md           # Database setup guide
├── src/
│   ├── auth/               # Authentication module
│   ├── config/             # Configuration files
│   ├── data/               # Data upload/download/digitize
│   ├── map/                # Map and layers
│   └── utils/              # Utility functions
├── index.html              # Main HTML file
├── styles.css              # Application styles
├── package.json            # Dependencies
├── vercel.json             # Vercel configuration
└── README.md              # This file
```

## 🎯 Usage Guide

### For Public Users

1. **Sign Up**: Create an account using email/password
2. **View Data**: Browse government and approved crowd data
3. **Digitize**: Click "Digitize Features" to draw points/polygons
4. **Upload**: Upload zipped shapefiles
5. **Download**: Export data as GeoJSON

### For Admin Users

1. All public user capabilities
2. **Edit Government Data**: Full CRUD access to official datasets
3. **Review Submissions**: Approve/reject user contributions
4. **Manage Users**: Assign roles (via SQL)

## 🔒 Security

- **Row Level Security (RLS)**: Enforced at database level
- **Role-Based Access**: Public vs Admin roles
- **Automatic Validation**: Geometry and attribute validation
- **User Isolation**: Users can only edit their own contributions

## 🐛 Troubleshooting

### Map not loading
- Check browser console for errors
- Verify Supabase credentials in `.env`
- Ensure database migrations are complete

### Cannot upload shapefile
- Ensure file is zipped (.zip)
- Check that shapefile contains .shp, .shx, and .dbf files
- Verify you're logged in

### RLS errors
- Ensure user_roles table has your user_id
- Check that RLS policies are created
- Verify you're authenticated

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Step-by-step setup instructions
- [Import Data Guide](IMPORT_DATA_GUIDE.md) - **Import real admin data (426,945 features)**
- [Quick Import Reference](QUICK_IMPORT.md) - One-page import cheat sheet
- [Database Setup Guide](database/README.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Leaflet Documentation](https://leafletjs.com/)
- [Vercel Documentation](https://vercel.com/docs)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenStreetMap contributors for basemap tiles
- Supabase for backend infrastructure
- Leaflet.js community for mapping tools

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review Supabase logs for backend errors

---

Built with ❤️ for participatory mapping in Kediri
