# Fix: NextAuth Session Not Persisting with HTTPS + Cloudflare Tunnel

**Date:** 2025-12-21
**Status:** ✅ RESOLVED
**Priority:** CRITICAL
**Component:** Authentication (NextAuth.js)

---

## 📋 Problem Description

### Symptoms
After email verification and successful login:
- ✅ Email verification worked correctly
- ✅ Login credentials validated successfully
- ✅ Audit logs showed "✅ User logged in"
- ❌ Session was `null` after login
- ❌ User couldn't access dashboard (stuck in login loop)
- ❌ No error messages displayed

### Root Cause
NextAuth.js was not configured to handle HTTPS connections behind Cloudflare Tunnel proxy. Specifically:

1. **Missing `trustHost: true`**: NextAuth didn't trust the `X-Forwarded-Host` header from Cloudflare Tunnel
2. **Missing secure cookie configuration**: Session cookies weren't marked as secure for HTTPS
3. **Wrong cookie name**: Not using the `__Secure-` prefix required for secure cookies in production

### Environment
- **Frontend:** Next.js 16.0.8 (App Router)
- **Auth:** NextAuth.js 5.x (beta)
- **Deployment:** Docker + Cloudflare Tunnel
- **Protocol:** HTTPS
- **URL:** https://dashboard.malacaran8n.uk
- **NODE_ENV:** production

---

## 🔍 Investigation Steps

### 1. Verified login was successful
```bash
docker logs personal-dashboard --tail 100 | grep LOGIN
# Output: ✅ User logged in: malacaram807@gmail.com
```

### 2. Checked session endpoint
```bash
docker exec personal-dashboard sh -c 'curl -s http://localhost:3000/api/auth/session'
# Output: null  ← SESSION NOT BEING CREATED
```

### 3. Verified database state
```sql
SELECT id, email, name, "emailVerified" FROM users WHERE email = 'malacaram807@gmail.com';
-- emailVerified: 2025-12-22 01:28:31.657 ✅ (verified correctly)
```

### 4. Identified configuration gap
- ❌ No `trustHost` configuration
- ❌ No `cookies` configuration for HTTPS
- ❌ Using default cookie settings (not secure)

---

## ✅ Solution

### Changes Made to `/code/lib/auth/config.ts`

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  // ✅ NEW: Trust proxy headers (required for Cloudflare Tunnel)
  trustHost: true,

  providers: [ /* ... */ ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ✅ NEW: Cookie configuration for HTTPS (production)
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'  // Secure cookie name
        : 'next-auth.session-token',           // Dev cookie name
      options: {
        httpOnly: true,       // Prevent XSS
        sameSite: 'lax',      // CSRF protection
        path: '/',
        secure: process.env.NODE_ENV === 'production', // HTTPS only
      },
    },
  },

  pages: { /* ... */ },
  callbacks: { /* ... */ },
  secret: process.env.NEXTAUTH_SECRET,
})
```

### Key Configuration Options

| Option | Value | Purpose |
|--------|-------|---------|
| `trustHost` | `true` | Trust `X-Forwarded-Host` header from Cloudflare Tunnel |
| `cookies.sessionToken.name` | `__Secure-next-auth.session-token` | Secure cookie name (HTTPS only) |
| `cookies.sessionToken.options.secure` | `true` (production) | Force HTTPS for cookies |
| `cookies.sessionToken.options.httpOnly` | `true` | Prevent JavaScript access (XSS protection) |
| `cookies.sessionToken.options.sameSite` | `'lax'` | CSRF protection |

---

## 🚀 Deployment Steps

### 1. Update configuration file
```bash
# Already done: /code/lib/auth/config.ts
```

### 2. Rebuild Docker image
```bash
cd /home/badfaceserverlap/personal-dashboard/code
docker build -t personal-dashboard:production -f Dockerfile .
```

### 3. Restart container
```bash
docker-compose -f docker-compose.production.yml restart dashboard
```

### 4. Verify startup
```bash
docker logs personal-dashboard --tail 15
# Output: ✅ Ready in 257ms
```

---

## ✅ Verification

### Test the complete authentication flow:

1. **Register** (if needed):
   - Go to https://dashboard.malacaran8n.uk/register
   - Create account
   - Receive verification email

2. **Verify email**:
   - Click link in email
   - Should redirect to login with success message

3. **Login**:
   - Enter credentials
   - Should redirect to `/dashboard` (not stuck in loop)

4. **Check session**:
   ```bash
   # Session should now persist
   curl -H "Cookie: $(browser_cookie)" https://dashboard.malacaran8n.uk/api/auth/session
   ```

---

## 📊 Impact

### Before Fix
- ❌ Users couldn't login despite valid credentials
- ❌ Session cookies not being set
- ❌ Dashboard inaccessible
- ❌ No error messages (silent failure)

### After Fix
- ✅ Session cookies created correctly
- ✅ Users can login and access dashboard
- ✅ Session persists across requests
- ✅ Secure HTTPS-only cookies
- ✅ Production-ready authentication

---

## 🔒 Security Improvements

1. **Secure Cookies**: `__Secure-` prefix ensures cookies only sent over HTTPS
2. **HttpOnly**: Prevents XSS attacks from stealing session tokens
3. **SameSite**: Protects against CSRF attacks
4. **TrustHost**: Properly validates proxy headers (prevents host header attacks)

---

## 📚 Related Documentation

- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [NextAuth.js Behind Proxies](https://next-auth.js.org/warnings#nextauth_url)
- [Secure Cookie Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#secure)
- [Cloudflare Tunnel Headers](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/routing-to-tunnel/)

---

## 🎯 Lessons Learned

1. **Always configure NextAuth for production environment**:
   - Don't rely on defaults when behind a proxy
   - Set `trustHost: true` for Cloudflare Tunnel
   - Configure secure cookies explicitly

2. **Test authentication flow end-to-end**:
   - Check `/api/auth/session` endpoint
   - Verify cookies are being set
   - Test with browser DevTools (Network tab)

3. **NextAuth v5 requires explicit configuration**:
   - Previous versions had different defaults
   - Beta versions may need more explicit config

---

## 🔧 Future Recommendations

1. **Add session monitoring**:
   - Track session creation/expiration in audit logs
   - Alert on authentication failures

2. **Implement session timeout warning**:
   - Warn users before 30-day expiration
   - Offer refresh token mechanism

3. **Add environment validation**:
   - Verify NEXTAUTH_SECRET is set
   - Verify NEXTAUTH_URL matches deployment URL
   - Validate in startup script

---

**Resolution Status:** ✅ RESOLVED
**Tested By:** Manual testing (registration → verification → login → dashboard access)
**Deployed:** 2025-12-21
**Version:** Next.js 16.0.8 + NextAuth.js 5.x
