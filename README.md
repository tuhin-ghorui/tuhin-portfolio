# Tuhin Ghorui — Portfolio (v2)

Static site + one serverless API route (`/api/messages`) that stores contact-form
submissions in MongoDB. Everything deploys to Vercel as a single project.

## Files

```
index.html          the site
api/messages.js      serverless function — receives the contact form, writes to MongoDB
package.json          declares the "mongodb" dependency Vercel installs at build time
.env.example          reference for the two env vars you need (not a real secret file)
```

## 1. Create a free MongoDB Atlas cluster

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free **M0** cluster (no cost).
3. Under **Database Access**, add a database user with a username/password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) — Vercel's
   serverless functions don't have a fixed IP, so this is the simplest option for a
   small project like this.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<user>` and `<password>` with the database user you just created.

## 2. Deploy to Vercel

1. Push this folder to a GitHub repo (or drag-and-drop deploy via the Vercel dashboard).
2. Import the repo in Vercel. It will auto-detect `api/messages.js` as a serverless
   function — no framework config needed.
3. In **Project → Settings → Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | the connection string from step 1 |
   | `MONGODB_DB` | `portfolio` (or any name you like) |
4. Deploy. The form on the live site will now POST to `/api/messages` and write into
   the `messages` collection of that database.

## 3. Check it worked

Submit the form on your deployed site, then in Atlas open **Browse Collections** →
your database → `messages`. You should see a document with `name`, `email`,
`message`, and `createdAt`.

## Notes

- The form has a honeypot field (`company`) — hidden from real visitors, so bots
  that auto-fill every input get silently rejected instead of writing spam rows.
- There's a light rate limit: max 5 messages per email address per 10 minutes.
- The API only ever *writes* messages — there's no endpoint to read them back over
  HTTP, so visitor messages aren't publicly listable. Read them via Atlas directly,
  or add an authenticated `/api/messages` `GET` route later if you want an in-site
  inbox.
- If you'd rather not depend on Atlas, the same route works against any MongoDB
  instance (self-hosted, Railway, Render's MongoDB add-on, etc.) — just point
  `MONGODB_URI` at it.
