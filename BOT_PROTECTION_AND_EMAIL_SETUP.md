# Bot Protection & Email Delivery Setup Guide

## ✅ Bot Protection Implemented

Your forms are now protected against bots and spam attacks with multiple security layers:

### 1. **Honeypot Protection** (Invisible to Users)
- Hidden field `_gotcha` added to all forms
- Real users never see or fill this field
- Bots automatically fill all fields and get caught
- **Zero impact on user experience** - completely invisible

### 2. **Rate Limiting**
- **Contact Form**: Max 3 submissions per minute per email
- **Newsletter**: Max 2 submissions per 2 minutes per email
- **Booking Form**: Max 2 bookings per 5 minutes per email
- Prevents spam flooding attacks

### 3. **Input Sanitization**
- XSS attack prevention
- SQL injection prevention
- Control character removal
- Length limits to prevent DoS attacks

### 4. **Email Validation**
- Strict email format validation
- Phone number format validation
- Required field enforcement

### 5. **HTTPS-Only Communication**
- All form submissions use encrypted HTTPS
- Formspree endpoints validated for security

---

## 📧 Email Delivery Configuration

### Current Issue: Emails Going to Spam

**Problem**: Formspree sends emails to their system, but your cPanel email doesn't receive them.

**Solution**: Configure Formspree to forward emails to your cPanel email address.

### Step-by-Step Email Setup

#### 1. **Log into Formspree Dashboard**
   - Go to https://formspree.io/login
   - Sign in with your Formspree account

#### 2. **Configure Contact Form Endpoint**
   - Navigate to your form: `xvglkroe`
   - Click "Settings" or "Email Settings"
   - **Add your cPanel email address** as the recipient:
     - Primary: `info@nechabest.com`
     - CC (optional): `owner@nechabest.org`

#### 3. **Configure Booking Form Endpoint**
   - Navigate to your form: `xpwbpdee`
   - Click "Settings" or "Email Settings"
   - **Add your cPanel email address** as the recipient:
     - Primary: `info@nechabest.com`
     - CC (optional): `owner@nechabest.org`

#### 4. **Configure Email Templates** (Optional but Recommended)
   In Formspree settings, customize the email template:
   
   ```
   Subject: {{ _subject }}
   
   New submission from NechaBest website:
   
   Name: {{ name }}
   Email: {{ email }}
   Phone: {{ phone }}
   Subject: {{ subject }}
   Message: {{ message }}
   
   ---
   Submitted at: {{ _date }}
   ```

#### 5. **Verify Email Forwarding**
   - Submit a test form on your website
   - Check your cPanel inbox: `info@nechabest.com`
   - Check spam folder if not in inbox

---

## 🛡️ Preventing Emails from Going to Spam

### Option 1: SPF Record Configuration (Recommended)

Add Formspree to your domain's SPF record in cPanel:

1. **Log into cPanel**
2. Go to **Zone Editor** or **DNS Management**
3. Find your SPF record (TXT record starting with `v=spf1`)
4. Add Formspree's servers: `include:formspree.io`
5. Example SPF record:
   ```
   v=spf1 include:formspree.io include:_spf.google.com ~all
   ```

### Option 2: Whitelist Formspree in cPanel

1. **Log into cPanel**
2. Go to **Email Filters** or **Spam Filters**
3. Create a new filter:
   - **From**: `*@formspree.io`
   - **Action**: Deliver to Inbox (whitelist)

### Option 3: Add Formspree to Safe Senders

In your email client (Webmail, Outlook, etc.):
1. Add `noreply@formspree.io` to your contacts
2. Mark emails from Formspree as "Not Spam"
3. Move them to inbox manually a few times

### Option 4: Use Custom Email Domain (Advanced)

Configure Formspree to send emails from your own domain:
1. In Formspree dashboard, go to **Custom Domain**
2. Add DNS records to verify domain ownership
3. Emails will appear to come from `@nechabest.com` instead of `@formspree.io`

---

## 🧪 Testing Bot Protection

### Test 1: Normal User Submission (Should Work)
1. Go to http://localhost:3000/contact
2. Fill out the form normally
3. Submit
4. **Expected**: Success message, email sent

### Test 2: Bot Simulation (Should Fail)
1. Open browser console (F12)
2. Run this code to simulate a bot:
   ```javascript
   document.querySelector('input[name="_gotcha"]').value = 'bot-filled-this';
   ```
3. Submit the form
4. **Expected**: "Bot submission detected" error

### Test 3: Rate Limiting (Should Fail After Limit)
1. Submit contact form 3 times quickly
2. Try submitting a 4th time within 1 minute
3. **Expected**: "Too many submissions" error

### Test 4: XSS Attack Prevention (Should Sanitize)
1. Try entering `<script>alert('XSS')</script>` in any field
2. Submit the form
3. **Expected**: Script tags removed, safe submission

---

## 🔒 Security Features Summary

| Feature | Contact Form | Newsletter | Booking Form |
|---------|-------------|------------|--------------|
| Honeypot Protection | ✅ | ✅ | ✅ |
| Rate Limiting | ✅ (3/min) | ✅ (2/2min) | ✅ (2/5min) |
| Input Sanitization | ✅ | ✅ | ✅ |
| Email Validation | ✅ | ✅ | ✅ |
| XSS Prevention | ✅ | ✅ | ✅ |
| HTTPS Only | ✅ | ✅ | ✅ |
| Length Limits | ✅ | ✅ | ✅ |

---

## 📊 Monitoring & Analytics

### Formspree Dashboard
- View all form submissions
- See submission timestamps
- Check for spam attempts
- Download submission data

### Browser Console (Development Mode)
All security events are logged:
```
[Formspree] Getting contact endpoint: https://formspree.io/f/xvglkroe
[Formspree] Submitting to: https://formspree.io/f/xvglkroe
[Formspree] Data keys: ['name', 'email', 'phone', 'subject', 'message']
[Formspree] Response status: 200
[Formspree] Submission successful
```

### Rate Limiting Logs
When rate limit is hit:
```
Error: Too many submissions. Please wait a minute and try again.
```

### Bot Detection Logs
When bot is detected:
```
Error: Bot submission detected
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Bot submission detected" for Real Users
**Cause**: Browser autofill or password manager filling honeypot field

**Solution**:
- The honeypot field has `autocomplete="off"` to prevent this
- If it still happens, check browser extensions

### Issue 2: "Too many submissions" Error
**Cause**: User submitting too quickly (legitimate or testing)

**Solution**:
- Wait the specified time (1-5 minutes depending on form)
- Rate limits reset automatically
- For testing, clear browser cache or use incognito mode

### Issue 3: Emails Still Going to Spam
**Cause**: SPF record not configured or email not whitelisted

**Solution**:
1. Configure SPF record (see above)
2. Whitelist Formspree in cPanel
3. Mark a few emails as "Not Spam" manually
4. Wait 24-48 hours for email reputation to improve

### Issue 4: No Emails Received at All
**Cause**: Formspree not configured to forward to your email

**Solution**:
1. Log into Formspree dashboard
2. Check email settings for each form
3. Verify your cPanel email is listed as recipient
4. Check Formspree submission history to confirm submissions are being received

---

## 🔧 Advanced Configuration

### Custom Rate Limits

To adjust rate limits, edit `NECHABEST-2.0/lib/formspree.ts`:

```typescript
// Contact form: 3 submissions per minute
if (isRateLimited(data.email, 3, 60000)) { ... }

// Newsletter: 2 submissions per 2 minutes
if (isRateLimited(data.email, 2, 120000)) { ... }

// Booking: 2 submissions per 5 minutes
if (isRateLimited(data.email, 2, 300000)) { ... }
```

### Custom Honeypot Field Name

To change the honeypot field name (makes it harder for bots to detect):

1. Edit `lib/formspree.ts` - change `_gotcha` to your custom name
2. Update all form components to use the new field name
3. Restart the dev server

### Production Rate Limiting

For production, use Redis or similar for distributed rate limiting:

```typescript
// Example with Redis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function isRateLimited(identifier: string, max: number, windowMs: number) {
  const key = `ratelimit:${identifier}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, Math.ceil(windowMs / 1000));
  }
  
  return count > max;
}
```

---

## 📝 Formspree Configuration Checklist

- [ ] Log into Formspree dashboard
- [ ] Configure contact form endpoint (`xvglkroe`)
  - [ ] Add recipient email: `info@nechabest.com`
  - [ ] Add CC email: `owner@nechabest.org` (optional)
  - [ ] Customize email template
  - [ ] Enable spam filtering
- [ ] Configure booking form endpoint (`xpwbpdee`)
  - [ ] Add recipient email: `info@nechabest.com`
  - [ ] Add CC email: `owner@nechabest.org` (optional)
  - [ ] Customize email template
  - [ ] Enable spam filtering
- [ ] Configure SPF record in cPanel
  - [ ] Add `include:formspree.io` to SPF record
  - [ ] Wait 24-48 hours for DNS propagation
- [ ] Whitelist Formspree in email filters
  - [ ] Add `*@formspree.io` to safe senders
  - [ ] Create email filter rule
- [ ] Test all forms
  - [ ] Contact form
  - [ ] Newsletter form
  - [ ] Booking form
- [ ] Verify emails received in cPanel inbox
- [ ] Check spam folder and mark as "Not Spam"

---

## 🎯 Next Steps

1. **Configure Formspree Dashboard** (Most Important)
   - Add your cPanel email as recipient
   - This is why emails aren't reaching you

2. **Configure SPF Record**
   - Prevents emails from going to spam
   - Takes 24-48 hours to take effect

3. **Test All Forms**
   - Verify bot protection works
   - Verify emails are received

4. **Monitor Submissions**
   - Check Formspree dashboard regularly
   - Review spam attempts
   - Adjust rate limits if needed

---

**Last Updated**: May 20, 2026  
**Status**: ✅ Bot protection active, ⚠️ Email forwarding needs configuration  
**Server**: Running on http://localhost:3000
