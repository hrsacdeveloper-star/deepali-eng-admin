# Deepali Engineering Admin Panel - Setup Guide

This guide explains how to set up the Deepali Engineering admin panel from scratch with a **new Supabase database**, running migrations, fixing schema cache issues, and deploying the application.

---

## 1. Prerequisites

Before starting, ensure you have:
- **Node.js** `v18` or higher
- **npm** or **pnpm** package manager
- A **Supabase** account ([sign up](https://supabase.com/))

---

## 2. Supabase Project Setup

1. Go to [Supabase Dashboard](https://app.supabase.com/) and click **New Project**.
2. Give the project a name and set a strong database password.
3. Wait for the project to be created.
4. Go to **Project Settings > API**.
5. Copy the **Project URL** and **anon public** API key.

---

## 3. Database Setup & Fixing "Schema Cache" Errors

To quickly set up all 30+ tables and initial seed data, follow these steps in your Supabase Dashboard:

1. Go to the **SQL Editor** in your Supabase dashboard.
2. Open the file `database_setup.sql` (found in the root folder of this project zip) and copy all its contents.
3. Paste the contents into the Supabase SQL Editor and click **Run**.

### ⚠️ IMPORTANT: Fix "Could not find the table in the schema cache" Error
If you try to log in or use the app immediately and see an error like `Could not find the table '...' in the schema cache`, it means Supabase hasn't refreshed its API cache yet. 

**To fix this immediately, run this exact command in your SQL Editor:**
```sql
NOTIFY pgrst, 'reload schema';
```
*(Alternatively, you can go to **Settings > API > Schema cache** and click **Reload schema cache**).*

---

## 4. Environment Variables

1. Open your project folder in VS Code or any text editor.
2. Rename the `.env.example` file to `.env`.
3. Update the `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 5. First Admin User Setup

After the database is set up, you must create the first admin user manually so you can log in.

### 5.1 Create User in Supabase Auth
1. Go to **Authentication > Users** in Supabase.
2. Click **Add User > Create New User**.
3. Enter your email and a password. (If "Confirm Email" is enabled in settings, you may need to turn off email confirmation temporarily in **Authentication > Providers > Email**, or manually verify the email).

### 5.2 Add User to `admin_users` Table
1. Go to the **Table Editor** in Supabase.
2. Open the `admin_users` table.
3. Insert a new row:
   - `id`: Select the UUID of the user you just created from the Auth dropdown.
   - `name`: Super Admin (or your name).
   - `email`: The exact same email you used.
   - `role_id`: Choose the existing "Super Admin" role (`00000000-0000-0000-0000-000000000001`).
   - `status`: `Active`.

Now this user can log in and access the full admin panel.

---

## 6. Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 7. Edge Functions (CRITICAL for "Schema fetch" errors)

The admin panel uses Supabase **Edge Functions** (`get-schema` and `run-sql`) to fetch dynamic table schemas. If these are not deployed, sections like "Products" or "Categories" will fail to fetch their schema!

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login and Link
```bash
supabase login
supabase link --project-ref <YOUR_PROJECT_REFERENCE_ID>
```
*(Your project reference ID is the random string in your Supabase URL: `https://[PROJECT_REF].supabase.co`)*

### Step 3: Set Database URL Secret
Get your Database Connection String from **Project Settings > Database > URI**. It looks like `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-...pooler.supabase.com:6543/postgres`.

Run this command to save it as a secret:
```bash
supabase secrets set SUPABASE_DB_URL="your_database_connection_string"
```

### Step 4: Deploy the Functions
```bash
supabase functions deploy get-schema
supabase functions deploy run-sql
```

Once deployed, the "schema fetch" errors will disappear!

---

## 8. Storage Buckets Setup (Important for Images)

If you plan to upload images (like for tools, machines, blogs), you need to create the required storage bucket.

1. Go to **Storage** in Supabase.
2. Click **New Bucket**.
3. Name it `deepali-engineering` (or whatever bucket name the app uses).
4. **Make it Public** so images can be viewed without authentication.
5. You may need to create a permissive Storage Policy to allow inserts/updates. Go to **Storage > Policies**, select the bucket, and add a policy for `INSERT`, `UPDATE`, `SELECT`, and `DELETE` for authenticated users.

---

## 8. Build & Deploy

When you are ready to deploy to Vercel, Netlify, or your hosting provider:

```bash
npm run build
```
Upload the `dist/` folder to your hosting provider. Make sure to update the **Site URL** in Supabase Authentication settings to match your live domain.
