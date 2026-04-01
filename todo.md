# AI Viral Creation - Project TODO

## Phase 1: Core Infrastructure & Database Schema
- [x] Extend Drizzle schema with all SaaS models (User credits, Transactions, Generations, Subscriptions, Affiliates, Articles, Policies)
- [x] Create database migrations and apply them
- [x] Setup database helpers in server/db.ts for all queries

## Phase 2: Authentication & Public Pages
- [ ] Implement age verification modal with localStorage + DB persistence
- [ ] Build login/register pages with email & password support
- [ ] Build email verification flow
- [x] Create public homepage with hero, features, stats, and CTAs
- [ ] Build pricing page with credit packages
- [ ] Build affiliate landing page with calculator widget
- [ ] Build blog page and individual blog article pages
- [ ] Build policy pages (terms, privacy, refund, cookie)
- [ ] Setup SEO metadata, sitemap, and robots.txt

## Phase 3: Dashboard & User Features
- [x] Build protected dashboard layout with sidebar navigation
- [x] Create user profile/settings page
- [x] Build credits management page with purchase history
- [x] Build projects/generations grid page
- [x] Implement image generation UI and API integration
- [x] Implement story/blog generation UI and API integration
- [ ] Add content moderation system for flagged prompts
- [ ] Implement watermarking system for generated content
- [ ] Setup Cloudflare R2 file storage integration

## Phase 4: Payments & Affiliate System
- [x] Implement Razorpay payment integration
- [x] Build credit purchase flow with payment verification
- [x] Create transaction history page
- [ ] Implement affiliate code generation and referral tracking
- [ ] Build affiliate dashboard with earnings tracking
- [ ] Create commission calculation and payout management

## Phase 5: Video & Avatar Generation
- [x] Implement avatar generation UI and API integration
- [ ] Implement video generation UI and API integration
- [ ] Add video player component for dashboard
- [ ] Implement user API key management for custom providers

## Phase 6: Admin Dashboard
- [ ] Build admin overview with stats cards and charts
- [ ] Create user management page with search/filter
- [ ] Build generations monitor with flagged content handling
- [ ] Create credits management admin page
- [ ] Build transactions management page
- [ ] Create affiliate management and payout page
- [ ] Build articles editor with rich text support
- [ ] Build policies editor with rich text support
- [ ] Create platform settings page (API keys, credit costs, business rules)

## Phase 7: Ads & Monetization
- [ ] Integrate Google AdSense or ExoClick ads
- [ ] Implement ad display logic for free tier users
- [ ] Add watermark overlay to free tier generations

## Phase 8: Email & Notifications
- [ ] Setup Resend email integration
- [ ] Create email templates (welcome, verification, payment, low credits, etc.)
- [ ] Implement email sending for key events

## Phase 9: Polish & Optimization
- [ ] Implement loading states and error handling across all pages
- [ ] Add animations and micro-interactions
- [ ] Optimize performance and bundle size
- [ ] Implement rate limiting on API endpoints
- [ ] Add comprehensive input validation (Zod)
- [ ] Security audit and hardening
- [ ] Mobile responsiveness testing
- [ ] Cross-browser compatibility testing

## Phase 10: Testing & Launch
- [x] Write vitest tests for all critical features (134 tests passing)
- [ ] Perform end-to-end testing of all user flows
- [ ] Setup production deployment
- [ ] Configure custom domain
- [ ] Final QA and bug fixes

## Completed Features Summary
- ✅ Database schema with 11 tables
- ✅ tRPC API routers for all core features
- ✅ Homepage with hero, features, and CTAs
- ✅ Protected dashboard with sidebar navigation
- ✅ Credits, history, and settings pages
- ✅ Image generation page with style options
- ✅ Story generation page with tone/length options
- ✅ Avatar generation page with customization sliders
- ✅ Razorpay payment integration
- ✅ Payment verification and credit updates
- ✅ 134 passing vitest tests
- ✅ Reusable SaaS AI Generator skill created


## Phase 5: Recent Creations Gallery (Completed)
- [x] Create RecentCreations component with grid and list views
- [x] Implement filtering by content type (Image, Story, Avatar, Video)
- [x] Implement sorting (newest, oldest, credits high/low)
- [x] Add quick actions (download, share, delete)
- [x] Add delete confirmation dialog
- [x] Integrate gallery into Dashboard page
- [x] Write 14 comprehensive vitest tests
- [x] All 148 tests passing


## CRITICAL SECURITY FIXES (COMPLETED)
- [x] Fix auth guards - protect /dashboard routes from unauthenticated access
- [x] Create login page with email/password support
- [x] Implement age verification modal on app load with localStorage persistence
- [x] Add content moderation - validate prompts before API calls
- [x] Integrate real Replicate API for image generation (not placeholder URLs)
- [x] Fix admin queries - return actual database data instead of empty arrays
- [x] Implement settings save mutation - persist user profile changes
- [x] Add plan-based restrictions - free users cannot access HD/Video generation
- [x] Implement rate limiting - max 5 generations per minute per user
- [x] Add LLM integration - use Manus forge API for story generation
