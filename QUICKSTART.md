# Quick Start Guide - Rolla Admin Dashboard

## 🚀 Your Admin Dashboard is Ready!

The application is now running at: **http://localhost:3000**

## What You Can Do Now

### 1. Access the Dashboard
- Open http://localhost:3000 in your browser
- You'll be automatically redirected to `/dashboard`

### 2. Browse Collections
- Click any collection in the left sidebar
- View all documents in a sortable, paginated table

### 3. Manage Data

#### Add New Document
1. Click "Add New" button
2. Fill in the form fields
3. Click "Save"

#### Edit Document
1. Click the ✏️ (edit) icon on any row
2. Modify the fields
3. Click "Save"

#### Delete Document
1. Click the 🗑️ (delete) icon on any row
2. Confirm deletion

#### View Complex Data
- Click the 👁️ (eye) icon next to "Object" or "Array" labels
- View formatted JSON in a modal

### 4. Navigate Collections
Use the sidebar to access any of the 17 collections:
- Users, categories, cities, countries
- Finishing types, governorates
- Home ads, notifications
- Projects, property types
- Proposals, requests
- Stories, types, and more

## Available Collections

| Collection | Description |
|------------|-------------|
| Users | User accounts with supplier info |
| users | User profiles and auth data |
| categories | Property categories |
| cities | City listings |
| countries | Country data |
| finishing_types | Property finishing types |
| governorates | Regional divisions |
| home_ads | Advertisement banners |
| notifications | User notifications |
| projects | Construction projects |
| property_types | Property classifications |
| proposals | Supplier proposals |
| requests | Client requests |
| rolla_story | Company story |
| stories | User-generated stories |
| types | General classifications |
| ff_user_push_notifications | Push notifications |

## Tips

- **Refresh**: Click the refresh button to reload data
- **Pagination**: Adjust items per page (10, 25, 50, 100)
- **Sorting**: Click column headers to sort
- **Mobile**: Use the ☰ menu icon on mobile devices

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Restarting the Server

```bash
cd /home/ahmed/work/rolla/rolla_next_admin
npm run dev
```

## Important Files

- `.env.local` - Your Firebase Admin environment variables (keep secure!)
- `app/api/collections/` - API endpoints for CRUD operations
- `components/` - Reusable UI components
- `lib/` - Firebase config and utilities

## Production Deployment

When ready to deploy:

```bash
npm run build
npm start
```

**Remember to add authentication before production deployment!**

## Need Help?

Check these files:
- `README.md` - General documentation
- `IMPLEMENTATION.md` - Detailed technical documentation

---

**Enjoy managing your Firestore data! 🎉**
