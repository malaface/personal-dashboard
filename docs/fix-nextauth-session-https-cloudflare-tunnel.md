# Fix: NextAuth Login 307 Redirect Loop - Production HTTPS Environment

**Date:** 2026-01-05
**Status:** ✅ RESOLVED
**Severity:** CRITICAL
**Environment:** Production (HTTPS/Cloudflare Tunnel)
**Version:** Personal Dashboard v0.1.0

---

## Executive Summary

Fixed a critical authentication bug that prevented users from logging in on the production environment (HTTPS/Cloudflare Tunnel). The issue was caused by a cookie name mismatch between NextAuth configuration and middleware JWT token retrieval, resulting in an infinite 307 redirect loop.

**Impact:**
- All users attempting to login were stuck in a redirect loop
- Login worked in development (HTTP) but failed in production (HTTPS)
- Zero successful logins in production environment

**Resolution:**
- Modified \`code/lib/auth/config.ts\` to make cookie names environment-aware
- Single file change, no database migrations required
- Users need to re-login once after deployment (cookies invalidated)

---

## Problem Description

### Symptom

When users attempted to login on the production HTTPS environment (\`https://dashboard.malacaran8n.uk\`):
1. User enters valid credentials
2. Form submits successfully
3. Authentication succeeds on the backend
4. Instead of redirecting to \`/dashboard\`, user stays on login page
5. Network tab shows \`307\` status code on dashboard route
6. Infinite redirect loop occurs

### Root Cause

**Cookie name mismatch between NextAuth configuration and middleware:**

| Component | Development (HTTP) | Production (HTTPS) |
|-----------|-------------------|-------------------|
| **NextAuth config creates** | \`next-auth.session-token\` | \`next-auth.session-token\` |
| **Middleware expects** | \`next-auth.session-token\` | \`__Secure-next-auth.session-token\` |
| **Result** | ✅ Match | ❌ Mismatch → 307 Loop |

### Technical Details

1. **In \`code/lib/auth/config.ts\` (line 133):**
   - Cookie name was hardcoded as \`next-auth.session-token\`
   - No conditional logic for production environment

2. **In \`code/middleware.ts\` (line 14-16):**
   - Correctly expected \`__Secure-next-auth.session-token\` in production
   - This follows NextAuth.js v5 security best practices

3. **The Disconnect:**
   - NextAuth.js v5 automatically adds \`__Secure-\` prefix to cookies when \`secure: true\`
   - This is a browser/framework security feature for HTTPS environments
   - Our config was not accounting for this automatic prefixing
   - Result: Token lookup failed → middleware saw no auth → redirect to login

### Why It Worked in Development

- Development uses HTTP (not HTTPS)
- No \`__Secure-\` prefix applied
- Both config and middleware used \`next-auth.session-token\`
- Perfect match → authentication worked flawlessly

---

## Solution Implemented

### Code Changes

**File:** \`code/lib/auth/config.ts\`

**Change 1 - Add environment check (line 7):**
\`\`\`typescript
const isProduction = process.env.NODE_ENV === 'production'
\`\`\`

**Change 2 - Make cookie name conditional (lines 135-142):**
\`\`\`typescript
cookies: {
  sessionToken: {
    name: isProduction
      ? \`__Secure-next-auth.session-token\`
      : \`next-auth.session-token\`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: isProduction,
    },
  },
},
\`\`\`

---

## Deployment Process

### Step 1: Code Changes
Applied changes to \`code/lib/auth/config.ts\`

### Step 2: Rebuild Application
\`\`\`bash
cd /home/badfaceserverlap/personal-dashboard/code
npm run build
# ✓ Compiled successfully in 30.0s
\`\`\`

### Step 3: Restart Production Service
\`\`\`bash
docker restart personal-dashboard
# ✅ Ready in 154ms
\`\`\`

### Step 4: Health Check
\`\`\`bash
curl http://localhost:3003/api/health
# {"status":"healthy"}
\`\`\`

---

## Testing & Validation

### Development Environment (HTTP)
- ✅ Login successful, redirect to /dashboard
- ✅ Cookie: \`next-auth.session-token\`
- ✅ Session persists

### Production Environment (HTTPS)
- ✅ Login successful, redirect to /dashboard
- ✅ Cookie: \`__Secure-next-auth.session-token\`
- ✅ No 307 redirects
- ✅ Session persists

---

## Files Modified

| File | Lines Changed |
|------|--------------|
| \`code/lib/auth/config.ts\` | 7, 135-137, 142 |

**Total:** 1 file, 5 lines changed

---

**Fix Implemented By:** Claude Sonnet 4.5
**Resolution Time:** ~1 hour
**Status:** ✅ RESOLVED AND VERIFIED
