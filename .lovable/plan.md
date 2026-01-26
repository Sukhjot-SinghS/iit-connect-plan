

# IIT Connect - Trip Planning & Social App

## Overview
A social platform for IIT students to discover each other, plan trips together, and split expenses. Features verified institutional email authentication.

---

## Phase 1: Foundation (Day 1)
### 1.1 Database Schema Setup
- **User Profiles Table**: Store user info (name, bio, IIT campus, year, interests, profile picture)
- **User Roles Table**: Manage admin/moderator/user roles securely
- **Email Verification Table**: Track OTP codes and verification status

### 1.2 Authentication Flow
- Sign up with institutional email (@iit*.ac.in domains)
- OTP sent to Outlook email using Resend edge function
- Email verification before profile access
- Login/logout with session management

### 1.3 Basic UI
- Landing page with app description
- Sign up / Login pages
- OTP verification screen

---

## Phase 2: User Profiles (Day 2)
### 2.1 Profile Management
- Profile creation wizard (name, campus, year, bio, interests)
- Profile photo upload using Supabase Storage
- Edit profile functionality
- View other users' profiles

### 2.2 User Discovery
- Browse all verified IIT users
- Filter by campus, interests, year
- Search functionality
- Simple card-based user directory

---

## Phase 3: Trip Planning (Days 3-4)
### 3.1 Trips Database
- **Trips Table**: destination, dates, description, capacity, creator
- **Trip Members Table**: track who joined which trip (with status: pending/approved/rejected)
- **Trip Interests Table**: tags for filtering

### 3.2 Trip Features
- Create new trip with details (destination, dates, budget estimate, capacity)
- Browse available trips with filters
- Request to join a trip
- Trip creator can approve/reject join requests
- View trip members list

### 3.3 Trip UI
- Trip creation form
- Trip cards with key details
- Trip detail page with member list
- My Trips dashboard (created + joined)

---

## Phase 4: Expense Splitting (Days 5-6)
### 4.1 Expenses Database
- **Expenses Table**: linked to trips, amount, description, paid by
- **Expense Splits Table**: who owes what to whom
- **Settlements Table**: track payments between members

### 4.2 Splitwise-like Features
- Add expense to a trip (who paid, total amount)
- Auto-split equally or custom splits
- View balances (who owes whom)
- Mark expenses as settled
- Trip expense summary

### 4.3 Expense UI
- Add expense modal
- Expense list per trip
- Balance summary cards
- Settlement history

---

## Phase 5: Polish & Extras (Day 7)
### 5.1 Notifications
- Edge function for email notifications (trip updates, join requests)
- In-app notification center

### 5.2 UX Improvements
- Responsive mobile design
- Loading states and error handling
- Empty states with helpful guidance
- Toast notifications for actions

### 5.3 Additional Features
- Trip comments/discussion thread
- User verification badge display
- Admin dashboard for user management

---

## Technical Architecture

### Database (Supabase)
- PostgreSQL with Row Level Security (RLS)
- Proper foreign keys and cascading deletes
- Secure user_roles table for access control

### Authentication
- Supabase Auth with email/password
- Custom OTP verification via Edge Function + Resend
- Email domain validation for @iit*.ac.in

### Edge Functions
- `send-otp`: Generate and email verification codes
- `verify-otp`: Validate codes and mark verified
- `send-notification`: Trip update emails

### Storage
- Profile photos bucket (public)
- Trip photos bucket (public)

---

## Getting Started Today

**Immediate first steps:**
1. Set up Lovable Cloud (backend infrastructure)
2. Create the core database schema (profiles, roles, verification)
3. Build the OTP verification edge function
4. Implement sign-up and verification flow
5. Create basic profile page

This gives you a working authenticated app by end of day 1!

