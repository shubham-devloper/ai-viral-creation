# AI Viral Creation - Complete Task List

## CRITICAL TASKS FROM MANUS-PROMPT-V3.MD

### TASK 1: Email Auth Mutations (MOST CRITICAL)
- [ ] Install bcryptjs: `pnpm add bcryptjs && pnpm add -D @types/bcryptjs`
- [ ] Add 4 database functions to server/db.ts:
  - [ ] getUserByEmail(email)
  - [ ] updateLastSignedIn(userId)
  - [ ] updateUserProfile(userId, data)
  - [ ] getAllUsers(search?, limit)
- [ ] Add import bcrypt to server/routers.ts
- [ ] Add 3 auth mutations to server/routers.ts:
  - [ ] emailRegister mutation
  - [ ] emailLogin mutation
  - [ ] updateProfile mutation

### TASK 2: Wire Login.tsx to Real Mutations
- [ ] Add tRPC mutations: emailLogin, emailRegister
- [ ] Get refCode from URL params
- [ ] Replace handleSubmit for login tab with real mutation
- [ ] Replace handleSubmit for signup tab with real mutation
- [ ] Add Name, Mobile, Confirm Password fields to signup form
- [ ] Remove all "coming soon" messages
- [ ] Keep Google OAuth button working

### TASK 3: Fix GenerateVideo.tsx Broken Query
- [ ] Replace `trpc.profile.get.useQuery()` with `trpc.auth.me.useQuery()`
- [ ] Extract userPlan from authData
- [ ] Use isPaidUser flag instead of subscription plan check

### TASK 4: Remove Fake Placeholder Images
- [ ] Remove via.placeholder.com from GenerateImage.tsx
- [ ] Replace with real handleGenerate that calls generateMutation
- [ ] Remove via.placeholder.com from GenerateAvatar.tsx
- [ ] Replace with real handleGenerate that calls generateMutation
- [ ] Ensure generateMutation is `trpc.generation.create.useMutation()`

### TASK 5: Fix generation.create to Call Real AI
- [ ] Add AI calls before return statement in generation.create
- [ ] Call generateImage for IMAGE/AVATAR types
- [ ] Call generateStory for STORY type
- [ ] Call generateImage with cinematic prompt for VIDEO type
- [ ] Update DB record with COMPLETED status and outputUrl
- [ ] Fix createGeneration to return inserted record with id

### TASK 6: Fix AdminUsers with Real DB Data
- [ ] Add getAllUsers function to db.ts
- [ ] Replace admin.users.list return [] with db.getAllUsers()
- [ ] Add getAllGenerations function to db.ts
- [ ] Replace admin.generations.list return [] with db.getAllGenerations()
- [ ] Delete mockUsers array from AdminUsers.tsx
- [ ] Add trpc queries to AdminUsers.tsx
- [ ] Replace mockUsers with real users data
- [ ] Add loading state

### TASK 7: Wire AdminSettings to Real DB
- [ ] Add setConfig tRPC mutation
- [ ] Add getConfig tRPC query
- [ ] Replace handleSave to persist settings to DB
- [ ] Load current settings on page load

### TASK 8: Wire SettingsPage Profile Save to DB
- [ ] Add toast import
- [ ] Add updateProfile mutation
- [ ] Replace handleSave to call updateProfile mutation
- [ ] Show success/error toasts

### TASK 9: Fix Pricing Page with INR and Razorpay
- [ ] Change prices: starter 79, pro 199, premium 499 (INR)
- [ ] Replace all $ with ₹
- [ ] Add createOrder and verifyPayment mutations
- [ ] Implement handleBuy with Razorpay integration
- [ ] Wire Buy buttons to handleBuy
- [ ] Add Razorpay script to client/index.html

### TASK 10: Create AffiliateDashboard Page
- [ ] Create client/src/pages/AffiliateDashboard.tsx
- [ ] Add header with subtitle
- [ ] Add affiliate code card with copy buttons
- [ ] Add referral link with copy and share buttons
- [ ] Add 4 stats cards (referrals, earned, pending, paid)
- [ ] Add "How it works" section
- [ ] Add "Request Payout" button
- [ ] Add referrals table
- [ ] Add route to App.tsx

### TASK 11: Fix Blog.tsx to Load from Database
- [ ] Remove hardcoded articles array
- [ ] Add trpc.public.articles.list.useQuery()
- [ ] Add loading state with skeleton cards
- [ ] Add empty state message
- [ ] Keep search filter working

### TASK 12: Fix Home Page Navigation
- [ ] "Get Started Free" → href="/login"
- [ ] "Login" button → conditional redirect
- [ ] Pricing "Buy Now" → href="/pricing"
- [ ] Affiliate "Join" → href="/affiliate"
- [ ] Footer links to policies and blog

### TASK 13: Add SEO Meta Tags & Verify
- [ ] Add meta description to index.html
- [ ] Add meta keywords
- [ ] Add Open Graph tags
- [ ] Add Twitter card tags
- [ ] Update page title
- [ ] Run pnpm build and fix TypeScript errors
- [ ] Verify all 14 features work correctly
- [ ] Commit and push to GitHub

## VERIFICATION CHECKLIST
- [ ] /login → email/password signup creates user with 10 credits
- [ ] /login → email/password login works
- [ ] /dashboard → redirects to /login if not authenticated
- [ ] Age verification modal appears on first visit
- [ ] /dashboard/generate-video → FREE users see upgrade banner
- [ ] /dashboard/generate-image → generates real image (no placeholder)
- [ ] /dashboard/generate-avatar → generates real avatar (no placeholder)
- [ ] /dashboard/affiliate → full affiliate dashboard works
- [ ] /dashboard/settings → profile save works
- [ ] /admin/users → shows real users from DB
- [ ] /admin/settings → saves config to DB
- [ ] /pricing → shows ₹ INR prices, Razorpay opens
- [ ] /blog → loads from DB or shows empty state
- [ ] pnpm build → no TypeScript errors

## NOTES
- All tasks must be completed in order
- Test each task before moving to next
- Update this list as you complete each task
- Final step: commit and push to GitHub
