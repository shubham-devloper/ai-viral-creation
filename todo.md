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
- [x] Implement affiliate code generation and referral tracking
- [x] Build affiliate dashboard with earnings tracking
- [x] Create commission calculation and payout management

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


## REMAINING FEATURES TO IMPLEMENT

### Authentication & Routing
- [x] /login → shows Login + Sign Up tabs, both work with real email/password
- [x] /register → same login page but starts on Sign Up tab
- [ ] Signup → creates user in DB with 10 free credits, redirects to /dashboard
- [x] /dashboard → redirects to /login if not logged in
- [x] Age verification modal appears as overlay on first visit

### Generation Pages
- [x] /dashboard/generate-video → full page with upgrade banner for FREE users
- [ ] /dashboard/generate-image → no via.placeholder.com, calls real AI
- [ ] /dashboard/generate-avatar → no via.placeholder.com, calls real AI
- [ ] /dashboard/history → shows real generations from DB
- [ ] /dashboard/credits → shows real balance, working Razorpay payment
- [ ] /dashboard/settings → saves name/mobile to DB
- [x] /dashboard/affiliate → shows affiliate code, stats, referrals

### Admin Features
- [x] /admin → works only for admin role users
- [x] /admin/users → shows real users from DB (not mock array)
- [x] /admin/settings → API keys and config management

### Public Pages
- [ ] /pricing → shows ₹ INR prices, Razorpay checkout opens on Buy
- [ ] /affiliate → public affiliate landing page
- [ ] /blog → loads articles from DB (or empty state if none)

### UI/UX Improvements
- [x] Sidebar has: Video and Affiliate links for users, Settings link for admin
- [ ] All pages have proper page titles and meta descriptions
- [ ] Remove fake via.placeholder.com images from all pages
- [x] AgeVerificationModal render fix
- [ ] Real AI generation in server (not placeholder)
- [x] SettingsPage profile save to DB
- [x] AdminUsers — real DB data instead of mockUsers
- [ ] Pricing — USD → INR + Razorpay button
- [x] AdminSettings page — API keys + config
- [x] Affiliate Dashboard for users
- [x] AdminSettings — wire save to DB with trpc.admin.config.set
- [ ] Blog page — load from DB

## Layout Refactoring (Completed)
- [x] GenerateImage — side-by-side layout (preview left, controls right)
- [x] GenerateStory — refactored to match GenerateImage layout
- [x] GenerateVideo — refactored to match GenerateImage layout
- [x] GenerateAvatar — refactored to match GenerateImage layout
- [x] All generation pages now have consistent UI/UX with DashboardLayout


## TASK 1 & TASK 2: Database Functions & Email Authentication (Completed)
- [x] TASK 1: Added getUserByEmail(email) → returns user or null
- [x] TASK 1: Added updateLastSignedIn(userId) → updates lastSignedIn and updatedAt
- [x] TASK 1: Added getAllGenerations(filter, limit) → filters by flagged/failed status
- [x] TASK 2: Fixed admin.users.list to use db.getAllUsers() with real data
- [x] TASK 2: Fixed admin.generations.list to use db.getAllGenerations() with real data
- [x] TASK 2: Implemented emailLogin mutation with bcrypt password verification
- [x] TASK 2: Implemented emailRegister mutation with affiliate referral bonus (50 credits)
- [x] Added bcryptjs for password hashing and comparison
- [x] Updated context.ts to include sdk for session token creation


## TASK 3 & TASK 4: Login API & Real AI Generation (Completed)
- [x] TASK 3: Wired Login page to real tRPC API calls
  * Added trpc.auth.emailLogin.useMutation() for login
  * Added trpc.auth.emailRegister.useMutation() for registration
  * Extract refCode from URL search params for affiliate tracking
  * Login submit: calls loginMutation, redirects to /dashboard on success
  * Signup submit: validates password match, calls registerMutation with referral code
  * Added Name + Mobile fields to signup form
  * Added confirm password field with validation
  * Removed all "coming soon" toasts and info box
  * Updated loading states to use mutation.isPending
- [x] TASK 4: Integrated real AI generation in generation.create
  * Added generateImage and generateStory imports
  * IMAGE type: calls generateImage(), returns image URL
  * AVATAR type: calls generateImage(), returns avatar URL
  * STORY type: calls generateStory(), returns story text
  * VIDEO type: calls generateImage() with "cinematic still frame:" prefix
  * Wrapped AI calls in try/catch to handle errors gracefully
  * Updates generation status to COMPLETED with outputUrl
  * Returns outputUrl in response for frontend display


## TASK 5 & TASK 6: Remove Fake Placeholders & Wire Real Output (Completed)
- [x] TASK 5: Remove fake image placeholder from GenerateImage
  * Removed setTimeout with via.placeholder.com block
  * Check if result.outputUrl exists after mutation
  * If outputUrl: setGeneratedImage(outputUrl) and show success toast
  * If no outputUrl: show info toast "Check History for your image"
- [x] TASK 6: Remove fake avatar placeholder from GenerateAvatar
  * Removed setTimeout with via.placeholder.com block
  * Same logic as TASK 5: check result.outputUrl
  * Display real avatar URL or direct user to History


## TASK 7: Pricing Page with INR & Razorpay (Completed)
- [x] Updated pricing: Starter ₹79, Pro ₹199, Enterprise ₹499
- [x] Changed all $ to ₹ in display
- [x] Implemented handleBuy function with authentication check
- [x] Integrated Razorpay payment flow:
  * Creates order via trpc.payment.createOrder
  * Opens Razorpay checkout with order details
  * Verifies payment via trpc.payment.verifyPayment
  * Redirects to /dashboard/credits on success
- [x] Added Razorpay checkout script to client/index.html
- [x] Wired Buy buttons to handleBuy with plan ID and price
- [x] Added loading state during payment processing
- [x] Ready for Razorpay API keys (VITE_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)


## FEATURE 1: AI Background Remover (Completed)
- [x] Add BGREMOVE type to database schema (drizzle/schema.ts)
- [x] Generate migration SQL and apply to database
- [x] Update createGeneration function to accept BGREMOVE type
- [x] Add BGREMOVE credit cost (3 credits) to generation.create
- [x] Implement Remove.bg API integration in generation.create
  * POST to https://api.remove.bg/v1.0/removebg with image_url
  * Extract result_b64 from response
  * Convert base64 to buffer and upload to S3
  * Return S3 URL as outputUrl
- [x] Create RemoveBackground.tsx page with full UI
  * Header with Scissors icon and subtitle
  * Two tabs: Image URL input and file upload
  * Drag-and-drop zone for file upload (max 5MB)
  * Image preview before processing
  * Before/after comparison view
  * Download PNG button for result
  * Use cases section (product photos, profile pictures, etc.)
  * Credit cost card (3 credits)
  * How-it-works info card
- [x] Add RemoveBackground route to App.tsx with ProtectedRoute
- [x] Add "Remove Background" menu item to DashboardLayout sidebar
- [x] Update RecentCreations component to support BGREMOVE type
- [x] Wire Remove Background button to trpc.generation.create mutation
- [x] All 274 tests passing, zero TypeScript errors


## Content Moderation Dashboard & Batch Generation (Completed)
- [x] Add user_violations table to database schema
- [x] Generate and apply migration SQL for user_violations
- [x] Create ContentModeration.tsx page with flagged content review
  * Displays flagged generations with thumbnails
  * Filter by status (all, pending, approved, rejected)
  * Admin notes textarea for review comments
  * Approve, Reject, and Warn User buttons
  * User violation tracking and suspension
- [x] Implement moderation database functions in db.ts
  * getFlaggedGenerations() - query flagged content
  * approveGeneration() - approve and clear flag
  * rejectGeneration() - reject and mark failed
  * warnUser() - create violation record
  * suspendUser() - deactivate user account
- [x] Add moderation mutations to admin router
  * getFlaggedGenerations query
  * approveGeneration mutation
  * rejectGeneration mutation
  * warnUser mutation
  * suspendUser mutation
- [x] Create BatchGeneration.tsx page for bulk generation
  * Multi-prompt input with add/remove functionality
  * Type selection (Image, Avatar)
  * Quality selection (Standard, HD)
  * Real-time cost calculation
  * Sequential generation with progress tracking
  * Before/after status display for each item
  * Download links for completed items
- [x] Add routes to App.tsx
  * /dashboard/batch-generation for users
  * /admin/moderation for admins
- [x] Add menu items to DashboardLayout
  * Batch Generation in user sidebar
  * Content Moderation in admin sidebar
- [x] All 274 tests passing, zero TypeScript errors
