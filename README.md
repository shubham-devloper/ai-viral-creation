# 🚀 AI Viral Creation

> **Create stunning AI Images, Videos, Stories & Avatars in seconds.**
> Credit-based SaaS platform with affiliate marketing, admin dashboard, and Razorpay payments.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)
![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)

---

## ✨ Features

### For Users
- 🎨 **AI Image Generation** — Text to image with 8 art styles (Realistic, Anime, Oil Painting, etc.)
- 🎬 **AI Video Generation** — Text to short cinematic videos (Pro plan)
- ✍️ **AI Story Writer** — Blog posts, stories, scripts with tone control
- 👤 **AI Avatar Creator** — Professional avatars from text prompts
- 💎 **Credit System** — Buy credits, use anytime. No subscriptions
- 🔐 **Age Verification** — 18+ gate on first visit
- 📱 **Responsive Design** — Works on mobile, tablet, desktop

### For Business
- 💰 **Razorpay Payments** — UPI, Cards, NetBanking (INR)
- 🤝 **Affiliate Program** — 30% commission, unique codes, payout tracking
- 📊 **Admin Dashboard** — User management, generation monitor, revenue charts
- 🛡️ **Content Moderation** — Auto-block adult/harmful prompts
- ⚡ **Rate Limiting** — 5 generations per minute per user
- 📧 **Policy Pages** — Terms, Privacy, Refund, Cookie

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite |
| **Routing** | Wouter |
| **UI Components** | shadcn/ui + Tailwind CSS |
| **API** | tRPC (end-to-end type safety) |
| **Backend** | Node.js + Express |
| **Database** | MySQL + Drizzle ORM |
| **Auth** | JWT sessions + bcryptjs |
| **AI — Images** | Replicate API (Stable Diffusion XL) |
| **AI — Text** | Anthropic Claude API |
| **Payments** | Razorpay |
| **Storage** | Cloudflare R2 / AWS S3 |

---

## 📁 Project Structure

```
ai-viral-creation/
├── client/                    # Frontend (React)
│   └── src/
│       ├── pages/             # All page components
│       │   ├── Home.tsx
│       │   ├── Login.tsx
│       │   ├── Dashboard.tsx
│       │   ├── GenerateImage.tsx
│       │   ├── GenerateVideo.tsx
│       │   ├── GenerateStory.tsx
│       │   ├── GenerateAvatar.tsx
│       │   ├── Pricing.tsx
│       │   ├── AffiliateDashboard.tsx
│       │   ├── AdminDashboard.tsx
│       │   ├── AdminUsers.tsx
│       │   ├── AdminGenerations.tsx
│       │   └── AdminSettings.tsx
│       ├── components/        # Reusable components
│       │   ├── DashboardLayout.tsx
│       │   ├── ProtectedRoute.tsx
│       │   └── AgeVerificationModal.tsx
│       └── _core/hooks/       # Auth hooks
├── server/                    # Backend (Node.js + Express)
│   ├── _core/
│   │   ├── imageGeneration.ts # AI generation logic
│   │   ├── moderation.ts      # Content safety
│   │   ├── rateLimit.ts       # Rate limiting
│   │   ├── razorpay.ts        # Payment integration
│   │   └── llm.ts             # LLM helpers
│   ├── routers.ts             # All tRPC routes
│   ├── db.ts                  # Database queries
│   └── payment.ts             # Payment router
├── drizzle/
│   └── schema.ts              # Database schema (11 tables)
└── package.json
```

---

## 🗃️ Database Schema

11 tables covering the full SaaS model:

```
users              → Auth, roles, profile
credits            → Balance, usage tracking
transactions       → Payment history
generations        → All AI outputs (image/video/story/avatar)
subscriptions      → User plan (FREE/STARTER/PRO/BUSINESS)
affiliates         → Affiliate codes, earnings
affiliate_referrals → Per-referral commission tracking
user_api_keys      → User's own API keys (Business plan)
admin_config       → Platform settings (credit costs, API keys)
articles           → Blog posts (SEO)
policies           → Legal pages (Terms, Privacy, Refund)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MySQL database
- pnpm (`npm install -g pnpm`)

### 1. Clone the repository
```bash
git clone https://github.com/shubham-devloper/ai-viral-creation.git
cd ai-viral-creation
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Set up environment variables
Create a `.env` file in the root:
```env
# Database
DATABASE_URL=mysql://user:password@host:3306/ai_viral_creation

# Auth
JWT_SECRET=your-random-32-character-secret

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
BUILT_IN_FORGE_API_KEY=your-key
BUILT_IN_FORGE_API_URL=https://forge.manus.im
REPLICATE_API_TOKEN=r8_...

# Payments (Razorpay)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
VITE_RAZORPAY_KEY_ID=rzp_live_...

# OAuth (Manus)
OAUTH_SERVER_URL=...
VITE_OAUTH_PORTAL_URL=...
VITE_APP_ID=...
```

### 4. Set up the database
```bash
pnpm db:push
```

### 5. Run in development
```bash
pnpm dev
```

App runs at `http://localhost:3000`

### 6. Build for production
```bash
pnpm build
pnpm start
```

---

## 💰 Credit Pricing

| Action | Credits |
|---|---|
| Image (Standard 512×512) | 5 |
| Image (HD 1024×1024) | 8 |
| Story (Basic ~500 words) | 2 |
| Story (Long ~2000 words) | 5 |
| Avatar | 10 |
| Video (5 sec) | 20 |
| Video (15 sec) | 50 |

### Credit Packages (INR)

| Package | Credits | Price |
|---|---|---|
| Starter | 100 | ₹79 |
| Pro | 300 | ₹199 |
| Business | 1000 | ₹499 |

---

## 👥 User Plans

| Feature | Free | Starter | Pro | Business |
|---|---|---|---|---|
| Credits on signup | 10 | — | — | — |
| Image quality | Standard | Standard | HD | HD |
| Video generation | ❌ | ❌ | ✅ | ✅ |
| Story length | 500 words | 1000 words | 2000 words | 5000 words |
| Watermark | ✅ | ❌ | ❌ | ❌ |
| Ads | ✅ | ❌ | ❌ | ❌ |
| Custom API keys | ❌ | ❌ | ❌ | ✅ |

---

## 🤝 Affiliate Program

- Earn **30% commission** on every referral purchase
- Get a unique code (e.g. `VIRAL2025`)
- Share link: `yourdomain.com/login?ref=YOUR_CODE`
- Referred user also gets **10% bonus credits** on first purchase
- Minimum payout: **₹500** via UPI/bank transfer

---

## 🛡️ Admin Dashboard

Access at `/admin` (requires `role: admin` in DB):

- **Overview** — Revenue charts, generation stats, user growth
- **Users** — Search, filter, add/remove credits, suspend accounts
- **Generations** — Monitor all AI outputs, review flagged content
- **Settings** — Configure API keys, credit costs, business rules

### Make yourself admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 🔒 Security Features

- ✅ JWT session cookies (httpOnly, secure)
- ✅ bcryptjs password hashing (10 rounds)
- ✅ Content moderation (regex + AI-based)
- ✅ Rate limiting (5 generations/minute per user)
- ✅ Plan-based access control
- ✅ Age verification (18+ gate)
- ✅ Razorpay webhook signature verification
- ✅ Admin role protection on all admin routes

---

## 📜 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Run production build
pnpm test         # Run all tests (148+ tests)
pnpm check        # TypeScript type check
pnpm db:push      # Push schema changes to DB
pnpm format       # Format code with Prettier
```

---

## 🌐 Pages & Routes

### Public
| Route | Page |
|---|---|
| `/` | Home / Landing page |
| `/login` | Login + Sign Up |
| `/pricing` | Credit packages |
| `/affiliate` | Affiliate program info |
| `/blog` | Articles |
| `/policy/:type` | Terms, Privacy, Refund, Cookie |

### Protected (requires login)
| Route | Page |
|---|---|
| `/dashboard` | Overview + quick generate |
| `/dashboard/generate-image` | AI Image Generator |
| `/dashboard/generate-video` | AI Video Generator |
| `/dashboard/generate-story` | AI Story Writer |
| `/dashboard/generate-avatar` | AI Avatar Creator |
| `/dashboard/history` | All my generations |
| `/dashboard/credits` | Buy credits + history |
| `/dashboard/affiliate` | My affiliate dashboard |
| `/dashboard/settings` | Profile settings |

### Admin only
| Route | Page |
|---|---|
| `/admin` | Dashboard + charts |
| `/admin/users` | User management |
| `/admin/generations` | Generation monitor |
| `/admin/settings` | Platform config |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Shubham** — [@shubham-devloper](https://github.com/shubham-devloper)

---

<div align="center">
  <b>⭐ Star this repo if you find it useful!</b>
</div>
