# Rolla Admin DashboardThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A modern, Material Design-based admin dashboard for managing Firestore collections in the Rolla Firebase project.## Getting Started



## FeaturesFirst, run the development server:



✅ **Complete CRUD Operations** - Create, Read, Update, and Delete documents in any Firestore collection```bash

✅ **Material-UI Design** - Clean, modern, and human-readable interfacenpm run dev

✅ **Real-time Data Management** - Direct connection to Firestore using Firebase Admin SDK# or

✅ **17 Collections Supported** - Manage all Rolla collections:yarn dev

  - Users (both uppercase and lowercase)# or

  - Categories, Cities, Countriespnpm dev

  - Finishing Types, Governorates# or

  - Home Ads, Notificationsbun dev

  - Projects, Property Types```

  - Proposals, Requests

  - Rolla Story, Stories, TypesOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

  - Push Notifications

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

✅ **Responsive Design** - Works on desktop, tablet, and mobile devices

✅ **Data Grid with Advanced Features** - Sorting, filtering, and paginationThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

✅ **Type-safe** - Built with TypeScript

## Learn More

## Tech Stack

To learn more about Next.js, take a look at the following resources:

- **Next.js 16** (App Router)

- **TypeScript**- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **Material-UI (MUI) v6**- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **Firebase Admin SDK**

- **MUI DataGrid**You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



## Getting Started## Deploy on Vercel



### InstallationThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.



1. Install dependencies:Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```bash
npm install
```

2. Create a `.env.local` file (or set Vercel Project Environment Variables) with:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY` (use escaped newlines `\n`)
  - `FIREBASE_STORAGE_BUCKET` (optional)

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Dashboard
- View statistics and browse collections
- Access any collection from the sidebar

### Managing Data
1. **View**: Click collection in sidebar
2. **Add**: Click "Add New" button
3. **Edit**: Click edit icon on any row
4. **Delete**: Click delete icon (with confirmation)
5. **Refresh**: Reload collection data

## API Endpoints

- `GET /api/collections/{collection}` - List documents
- `POST /api/collections/{collection}` - Create document
- `GET /api/collections/{collection}/{id}` - Get document
- `PUT /api/collections/{collection}/{id}` - Update document
- `DELETE /api/collections/{collection}/{id}` - Delete document

## Security

⚠️ **Important**:
- Secrets are provided via environment variables; never commit credentials
- Implement authentication before production deployment
- Server-side only access using Firebase Admin SDK

## Project Structure

```
app/
  api/collections/         # CRUD API routes
  dashboard/               # Admin UI pages
components/
  CollectionView.tsx       # Data grid and forms
  DashboardLayout.tsx      # Navigation sidebar
lib/
  firebase-admin.ts        # Firebase config
  collections.ts           # Collection metadata
  theme.ts                 # MUI theme
```

## Development

Build for production:
```bash
npm run build
npm start
```

## License

Proprietary - Rolla Egypt
