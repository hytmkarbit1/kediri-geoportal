# ✅ How to Verify Your .env File is Configured

## Step-by-Step Verification Guide

### Step 1: Check if .env File Exists

**Option 1: Using File Explorer**
1. Open File Explorer
2. Navigate to `C:\Users\acer\kediri-geoportal`
3. Click **View** → Check **"Hidden items"** (to see hidden files)
4. Look for a file named `.env` (no extension)

**Option 2: Using Command Prompt**
```cmd
cd C:\Users\acer\kediri-geoportal
dir .env
```

**Expected output:**
```
 Volume in drive C is Windows
 Directory of C:\Users\acer\kediri-geoportal

12/20/2025  02:00 PM               123 .env
               1 File(s)            123 bytes
```

If you see "File Not Found", the `.env` file doesn't exist yet.

---

### Step 2: View .env File Contents

**Option 1: Using Notepad**
```cmd
notepad .env
```

**Option 2: Using Command Prompt**
```cmd
type .env
```

**Expected contents:**
```
VITE_SUPABASE_URL=https://wfelfwvvwtdvdcfcrlyh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZWxmd3Z2d3RkdmRjZmNybHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1OTg4NzUsImV4cCI6MjA1MDE3NDg3NX0.sb_publishable_KWxkEwhRFXYy6F3O_pfEyA_3GI1X4os
```

---

### Step 3: Verify Format is Correct

Check these points:

✅ **No spaces around `=` sign**
```
✓ CORRECT:   VITE_SUPABASE_URL=https://...
✗ WRONG:     VITE_SUPABASE_URL = https://...
✗ WRONG:     VITE_SUPABASE_URL= https://...
```

✅ **No quotes around values**
```
✓ CORRECT:   VITE_SUPABASE_URL=https://wfelfwvvwtdvdcfcrlyh.supabase.co
✗ WRONG:     VITE_SUPABASE_URL="https://wfelfwvvwtdvdcfcrlyh.supabase.co"
```

✅ **Exactly 2 lines** (one for URL, one for KEY)

✅ **No extra blank lines** at the end

✅ **URL starts with `https://`**

✅ **KEY is a long string** (looks like gibberish)

---

### Step 4: Verify Values are Correct

#### Check Supabase URL

Your URL should be:
```
https://wfelfwvvwtdvdcfcrlyh.supabase.co
```

**To verify it's correct:**
1. Open browser
2. Go to: https://wfelfwvvwtdvdcfcrlyh.supabase.co
3. You should see Supabase login page

#### Check Supabase Anon Key

**To get your key from Supabase:**
1. Go to: https://supabase.com/dashboard
2. Select your project: **wfelfwvvwtdvdcfcrlyh**
3. Click **Settings** (gear icon) in sidebar
4. Click **API**
5. Under "Project API keys", find **`anon` `public`** key
6. Copy the key (it's a long JWT token)

---

### Step 5: Test the Configuration

Create a test script to verify your `.env` works:

**Create file:** `test-env.js`
```javascript
import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Testing .env configuration...\n');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url) {
  console.log('❌ VITE_SUPABASE_URL is NOT set');
} else {
  console.log('✅ VITE_SUPABASE_URL is set');
  console.log('   Value:', url);
}

if (!key) {
  console.log('❌ VITE_SUPABASE_ANON_KEY is NOT set');
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY is set');
  console.log('   Value:', key.substring(0, 50) + '...');
}

if (url && key) {
  console.log('\n🎉 Configuration looks good!');
} else {
  console.log('\n⚠️  Configuration has issues - check your .env file');
}
```

**Run the test:**
```cmd
node test-env.js
```

**Expected output:**
```
🔍 Testing .env configuration...

✅ VITE_SUPABASE_URL is set
   Value: https://wfelfwvvwtdvdcfcrlyh.supabase.co
✅ VITE_SUPABASE_ANON_KEY is set
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...

🎉 Configuration looks good!
```

---

## 🔧 Common Issues and Fixes

### Issue 1: .env File Doesn't Exist

**Solution:** Create it manually

```cmd
cd C:\Users\acer\kediri-geoportal
notepad .env
```

In Notepad, paste:
```
VITE_SUPABASE_URL=https://wfelfwvvwtdvdcfcrlyh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZWxmd3Z2d3RkdmRjZmNybHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1OTg4NzUsImV4cCI6MjA1MDE3NDg3NX0.sb_publishable_KWxkEwhRFXYy6F3O_pfEyA_3GI1X4os
```

Save and close.

---

### Issue 2: Wrong File Extension

If you see `.env.txt` instead of `.env`:

**Fix:**
```cmd
ren .env.txt .env
```

---

### Issue 3: Can't See .env File

Windows hides files starting with `.` by default.

**Fix:**
1. Open File Explorer
2. Click **View** tab
3. Check **"Hidden items"**
4. Check **"File name extensions"**

---

### Issue 4: Import Script Says "VITE_SUPABASE_URL not found"

This means the `.env` file isn't being read.

**Checklist:**
- [ ] `.env` file is in the **root** directory (`C:\Users\acer\kediri-geoportal\.env`)
- [ ] NOT in a subdirectory like `src/` or `scripts/`
- [ ] File is named exactly `.env` (not `.env.txt` or `env`)
- [ ] `dotenv` package is installed (`npm install`)
- [ ] No syntax errors in `.env` file

---

## 📋 Complete Verification Checklist

Run through this checklist:

```
✅ Checklist:
[ ] .env file exists in project root
[ ] File is named exactly ".env" (no .txt extension)
[ ] File contains exactly 2 lines
[ ] Line 1: VITE_SUPABASE_URL=https://wfelfwvvwtdvdcfcrlyh.supabase.co
[ ] Line 2: VITE_SUPABASE_ANON_KEY=<long-key-here>
[ ] No spaces around = signs
[ ] No quotes around values
[ ] No blank lines
[ ] URL starts with https://
[ ] Key is a long JWT token (starts with eyJ...)
[ ] dotenv package is installed (npm install)
[ ] Test script confirms values are loaded
```

---

## 🎯 Quick Verification Commands

Run these commands to verify everything:

```cmd
# 1. Check file exists
dir .env

# 2. View contents
type .env

# 3. Verify dotenv is installed
npm list dotenv

# 4. Test configuration (create test-env.js first)
node test-env.js
```

---

## ✅ You're Ready When...

You can proceed with the import when:

1. ✅ `type .env` shows your Supabase credentials
2. ✅ `node test-env.js` shows both values are set
3. ✅ No error messages appear
4. ✅ URL opens in browser and shows Supabase

---

## 🚀 Next Step

Once your `.env` is verified, run the import:

```cmd
node scripts/import-to-supabase.js
```

If you see this error:
```
❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file
```

Then your `.env` is NOT configured correctly. Go back through this guide.

---

**Need help?** Check [IMPORT_TROUBLESHOOTING.md](IMPORT_TROUBLESHOOTING.md) for more solutions.
