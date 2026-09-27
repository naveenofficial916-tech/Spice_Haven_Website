# Production Deployment Guide: Spice Haven Restaurant Template

This guide provides step-by-step instructions for deploying the **Spice Haven** restaurant website to leading zero-configuration static hosting platforms.

**Active Live Production URL**: [https://spicehaven-restaurant.surge.sh](https://spicehaven-restaurant.surge.sh)

---

## 1. Prerequisites

- Node.js (v18+) or any static HTTP web server
- A registered custom domain (e.g. `your-restaurant-name.com`), if deploying for a real client
- A modern web browser to preview

---

## 2. Environment Variables & Secrets

The project runs as a zero-dependency static frontend without mandatory runtime environment variables. An example template is provided in `.env.example`:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `SITE_URL` | No | Production canonical URL | `https://spicehaven-restaurant.surge.sh` |
| `CONTACT_EMAIL` | No | Client's primary inbox | `concierge@spicehaven-restaurant.com` |
| `ANALYTICS_ID` | No | Google Analytics or Plausible ID | `G-XXXXXXXXXX` |
| `STRIPE_PUBLISHABLE_KEY` | Future | Merchant public key for live orders | `pk_live_...` |

> [!WARNING]
> Never commit `.env` files with secret API keys or private credentials to public source repositories.

---

## 3. Recommended Deployment Platforms

Because Spice Haven has zero runtime build dependencies, it can be deployed on any static edge platform for free with custom domain SSL:

### Option A: Surge.sh (Instant Edge CDN — Currently Active Live Host)
The live demo is hosted on Surge.sh. To deploy or update the live deployment:
```bash
# 1. Run production validation
npm run build

# 2. Deploy to custom Surge domain
npx -y surge . --domain spicehaven-restaurant.surge.sh
```
Surge provisions global CDN edge distribution, HTTPS SSL termination, and automatic static routing within seconds.

### Option B: Vercel (Recommended for Speed & Global Edge CDN)
1. Push this project repository to GitHub.
2. Log into [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the repository.
4. **Framework Preset**: Select **Other**.
5. **Root Directory**: `./` (Default).
6. Click **Deploy**.
7. *Vercel automatically detects `vercel.json` and applies security headers, clean URLs, and asset caching.*

### Option B: Netlify
1. Push this project repository to GitHub.
2. Log into [Netlify](https://netlify.com) and click **"Add new site"** > **"Import an existing project"**.
3. Select your repository.
4. **Publish directory**: `.` (Root directory).
5. Click **Deploy site**.
6. *Netlify automatically reads `netlify.toml` and applies security headers.*

### Option C: Cloudflare Pages
1. In the Cloudflare Dashboard, navigate to **Workers & Pages** > **Create application** > **Pages**.
2. Connect your Git repository.
3. **Build settings**:
   - Framework preset: *None*
   - Build command: *(Leave blank or `npm run build`)*
   - Build output directory: `.`
4. Click **Save and Deploy**.

### Option D: GitHub Pages (Free Static Hosting)
1. In your GitHub repository, go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **Deploy from a branch**.
3. Select the `main` branch and `/ (root)` folder.
4. Click **Save**. Your site will be published at `https://<username>.github.io/<repo-name>/`.

---

## 4. Custom Domain Setup (For Client Delivery)

1. In your hosting platform (Vercel/Netlify/Cloudflare), go to **Domains** > **Add Domain**.
2. Enter the client's domain (e.g. `spicehaven.com` and `www.spicehaven.com`).
3. In the client's domain registrar (GoDaddy, Namecheap, Google Domains/Squarespace):
   - Add a `CNAME` record: `www` pointing to `cname.vercel-dns.com` (or Netlify/Cloudflare equivalent).
   - Add an `A` record for the root domain `@` pointing to the host's IP address (e.g. `76.76.21.21` for Vercel).
4. Automatic SSL/TLS certificates are provisioned within 5–15 minutes.

---

## 5. Verification & Post-Deployment Checklist

After deployment, verify the live production URL:
- [x] Homepage loads over HTTPS with an active SSL padlock.
- [x] Favicon displays properly in browser tabs.
- [x] Social share preview works on LinkedIn/Twitter/WhatsApp (OpenGraph image and title).
- [x] Mobile navigation drawer opens and closes smoothly.
- [x] Table reservation and checkout simulations function without console errors.
- [x] Navigating to a non-existent URL (e.g. `/random-url`) displays the custom branded `404.html`.

---

## 6. Known Production Limitations & Client Hand-off Notes

1. **Client-Side Mock Checkout**: The cart drawer checkout flow simulates a complete 3-step ordering process and generates unique order IDs (`SH-XXXXXX`), but does not process real transactions. Production payment gateways (Stripe, Square, Razorpay) require server-side webhook endpoints.
2. **In-Memory Table Bookings**: The table reservation form generates instant boarding passes (`RES-XXXXXX`) and updates local DOM state with an in-place reset button. Permanent calendar booking requires integration with Resy/OpenTable or a cloud database (PostgreSQL/Supabase).
3. **Inquiry & Newsletter Forms**: Contact form submissions trigger client-side validation and confirmation toast alerts without triggering SMTP outbound email delivery.
4. **Third-Party CDN Assets**: Culinary photography and web fonts are served from high-availability CDNs (Unsplash and Google Fonts). For offline intranet deployments, local asset caching should be configured.

