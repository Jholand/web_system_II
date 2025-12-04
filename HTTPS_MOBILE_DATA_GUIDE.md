# 🔒 HTTPS & Mobile Data Setup Guide

## 🎥 Camera Issue - Why HTTPS is Required

**Problem:** "Camera access is only supported in secure context like HTTPS or localhost"

**Why this happens:**
- Browsers require HTTPS for camera/microphone access (security feature)
- Only exception: `localhost` (development only)
- Your phone accessing via IP (192.168.1.9) is NOT considered secure context

---

## ✅ Solution 1: Self-Signed SSL Certificate (Recommended for Testing)

### **Step 1: Install mkcert (One-time setup)**

```powershell
# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install mkcert
choco install mkcert -y

# Initialize mkcert
mkcert -install
```

### **Step 2: Create SSL Certificate for Your Local IP**

```powershell
cd E:\laragon\www\web_system_II

# Create certificate for localhost + your IP
mkcert localhost 127.0.0.1 192.168.1.9 ::1

# This creates two files:
# - localhost+3.pem (certificate)
# - localhost+3-key.pem (private key)
```

### **Step 3: Configure Vite for HTTPS**

Update `react-frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external access
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../localhost+3-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../localhost+3.pem')),
    }
  }
})
```

### **Step 4: Configure Laravel for HTTPS**

Update `laravel-backend/.env`:

```env
APP_URL=https://192.168.1.9:8000
SESSION_SECURE_COOKIE=true
```

### **Step 5: Start Servers with HTTPS**

**Laravel (with HTTPS):**
```powershell
cd laravel-backend
php artisan serve --host=0.0.0.0 --port=8000
```
*Note: Laravel dev server doesn't support HTTPS, use Laragon/Apache instead*

**React (with HTTPS):**
```powershell
cd react-frontend
npm run dev -- --host
```

### **Step 6: Access from Phone**

1. **Install mkcert root certificate on your phone:**
   - Get the root certificate:
     ```powershell
     mkcert -CAROOT
     ```
   - Share `rootCA.pem` to your phone via email/Bluetooth
   - Install it on your phone (Settings → Security → Install certificate)

2. **Access:**
   ```
   https://192.168.1.9:5173
   ```

3. **Camera should work now!** ✅

---

## ✅ Solution 2: Use Laragon's Apache with SSL (Easier!)

### **Step 1: Setup Virtual Host in Laragon**

1. Open Laragon
2. Right-click → Apache → SSL → Enabled
3. Right-click → Apache → Add Virtual Host
   - Name: `travelquest.test`
   - Document Root: `E:\laragon\www\web_system_II\react-frontend\dist`

### **Step 2: Build React App**

```powershell
cd react-frontend
npm run build
```

### **Step 3: Access fromUpdate your `.env`:
```env
VITE_API_URL=https://192.168.1.9/web_system_II/laravel-backend/public/api
```

Access:
```
https://192.168.1.9/web_system_II/react-frontend/dist
```

---

## 📱 Mobile Data Question: "Gagana ba kung mag-data ako?"

### **Short Answer: Hindi directly, pero may workaround!**

### **Problem:**
- Laptop (192.168.1.9) is on **local network** (private IP)
- Mobile data uses **internet** (public IP)
- Private IP cannot be accessed from internet

### **Solutions:**

#### **Option 1: Hotspot (Easiest)**
✅ **Recommended for testing**

1. **Phone creates WiFi hotspot**
2. **Laptop connects to phone's hotspot**
3. **Access using laptop's IP on phone's hotspot network**
4. **Both camera and GPS will work!**

**Detailed Steps:**

**STEP 1: Setup Phone Hotspot**
1. Open your phone's **Settings**
2. Go to **Network & Internet** (or **Connections** on Samsung)
3. Tap **Hotspot & Tethering** (or **Mobile Hotspot**)
4. Toggle **Mobile Hotspot** to **ON**
5. **Important:** Note or set the WiFi name and password
   - Example: Hotspot name: `MyPhone_Hotspot`
   - Password: `12345678`

**STEP 2: Connect Laptop to Phone's Hotspot**
1. On your laptop, click WiFi icon (bottom-right corner)
2. Look for your phone's hotspot name (e.g., `MyPhone_Hotspot`)
3. Click it and select **Connect**
4. Enter the hotspot password
5. Wait for "Connected" status
6. ✅ Your laptop now uses your phone's mobile data for internet!

**STEP 3: Find Laptop's New IP Address**
1. On your **laptop**, open PowerShell or Command Prompt
2. Run this command:
   ```powershell
   ipconfig
   ```
3. Look for **Wireless LAN adapter Wi-Fi** section
4. Find the line that says **IPv4 Address**
5. You'll see something like: `192.168.43.100` or `192.168.137.1`
6. **Copy this IP address** (you'll need it in Step 5)

**Example output:**
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.43.100  ← THIS IS YOUR IP!
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.43.1
```

**STEP 4: Start Your Servers**
On your **laptop**:

**Terminal 1 - Laravel Backend:**
```powershell
cd E:\laragon\www\web_system_II\laravel-backend
php artisan serve --host=0.0.0.0 --port=8000
```
Wait for: `INFO  Server running on [http://0.0.0.0:8000]`

**Terminal 2 - React Frontend:**
```powershell
cd E:\laragon\www\web_system_II\react-frontend
npm run dev -- --host
```
Wait for: `Network: http://192.168.43.100:5173/`

**STEP 5: Update .env File (IMPORTANT!)**
On your **laptop**, update the React `.env` file:

File: `react-frontend/.env`
```env
VITE_API_URL=http://192.168.43.100:8000/api
VITE_BASE_URL=http://192.168.43.100:8000
```
*(Replace `192.168.43.100` with YOUR IP from Step 3)*

**STEP 6: Restart Frontend (After .env change)**
```powershell
# Stop the React server (Ctrl+C)
# Start it again
npm run dev -- --host
```

**STEP 7: Access from Phone**
1. On your **phone**, open a web browser (Chrome/Safari)
2. Type this URL in address bar:
   ```
   http://192.168.43.100:5173
   ```
   *(Replace `192.168.43.100` with YOUR IP from Step 3)*
3. Press Enter/Go
4. 🎉 **TravelQuest should load!**

**STEP 8: Login and Test**
1. Login with your admin credentials
2. Navigate to different pages
3. Try the GPS feature - it works great on phone! 📍
4. For QR codes, use **File Upload** (camera app → upload image)

---

**Why This Works:**
- ✅ Phone creates its own WiFi network (hotspot)
- ✅ Laptop joins this network (gets IP like 192.168.43.x)
- ✅ Phone is on the SAME network (192.168.43.1 - the gateway)
- ✅ Both devices can talk to each other!
- ✅ Phone uses mobile data for internet, laptop shares it

**Troubleshooting:**

**Problem: "Can't access http://192.168.43.100:5173"**
- ✅ Double-check the IP address (`ipconfig` on laptop)
- ✅ Make sure servers are running (check terminal windows)
- ✅ Try `http://` not `https://`
- ✅ Check Windows Firewall (temporarily disable to test)

**Problem: "Backend not connecting"**
- ✅ Make sure `.env` has correct IP (Step 5)
- ✅ Restart React server after changing `.env`
- ✅ Check Laravel is running on `0.0.0.0:8000`

**Problem: "Connection unstable"**
- ✅ Make sure phone has good mobile data signal
- ✅ Keep phone plugged in (hotspot drains battery fast!)
- ✅ Don't move phone away from laptop

**Quick IP Finder Command:**
```powershell
# On laptop, run this to see your IP quickly:
ipconfig | Select-String "IPv4"
```

**To Stop Everything:**
1. Press `Ctrl+C` in both terminal windows
2. Turn off phone hotspot (saves battery)
3. Reconnect laptop to regular WiFi

#### **Option 2: ngrok (Internet Access)**
✅ **For real internet testing**

**Install ngrok:**
```powershell
choco install ngrok -y
```

**Start tunnel:**
```powershell
# Terminal 1: Laravel
cd laravel-backend
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2: React
cd react-frontend
npm run dev

# Terminal 3: ngrok
ngrok http 5173
```

**You'll get a URL like:**
```
https://abc123.ngrok.io
```

**Access from ANYWHERE (even mobile data!):**
- URL: `https://abc123.ngrok.io`
- Camera works! ✅
- Works on mobile data! ✅
- Works on any WiFi! ✅

**Update Laravel CORS:**
```php
// config/cors.php
'allowed_origins_patterns' => [
    '/^https:\/\/[a-z0-9]+\.ngrok\.io$/',
],
```

#### **Option 3: Deploy to Real Server**
✅ **For production**

**Free hosting options:**
- **Vercel** (React frontend) - Free HTTPS
- **Railway** (Laravel backend) - Free tier
- **Heroku** (Full stack) - Free tier

**All have built-in HTTPS** ✅

---

## 🚀 Quick Start: Hotspot Method (Recommended Now)

**This is the easiest for testing without HTTPS setup:**

### **On Phone:**
1. Settings → Mobile Hotspot → Turn ON
2. Set password

### **On Laptop:**
1. Connect to phone's hotspot WiFi
2. Get new IP: `ipconfig`
   Example: `192.168.43.100`

3. Update `.env`:
   ```env
   VITE_API_URL=http://192.168.43.100:8000/api
   ```

4. Start servers:
   ```powershell
   # Backend
   cd laravel-backend
   php artisan serve --host=0.0.0.0 --port=8000

   # Frontend
   cd react-frontend
   npm run dev -- --host
   ```

5. **On phone browser:**
   ```
   http://192.168.43.100:5173
   ```

6. **For camera to work, use File Upload or Manual Entry instead!**

---

## 📊 Comparison Table

| Method | Camera Works? | Mobile Data? | Setup Difficulty | Cost |
|--------|--------------|--------------|------------------|------|
| **Same WiFi (Current)** | ❌ No (HTTP) | ❌ No | ⭐ Easy | Free |
| **HTTPS + Same WiFi** | ✅ Yes | ❌ No | ⭐⭐⭐ Medium | Free |
| **Hotspot** | ⚠️ File upload only | ✅ Yes | ⭐ Easy | Data cost |
| **ngrok** | ✅ Yes | ✅ Yes | ⭐⭐ Easy | Free (limited) |
| **Real Server** | ✅ Yes | ✅ Yes | ⭐⭐⭐⭐ Hard | $5-20/mo |

---

## 💡 Recommended Approach

### **For Development (Now):**
1. ✅ Use **hotspot method**
2. ✅ Keep File Upload & Manual Entry as alternatives to camera
3. ✅ Test GPS (works great on phone!)

### **For Testing with Others:**
1. ✅ Use **ngrok** for quick demos
2. ✅ Share the ngrok URL
3. ✅ Camera works for everyone!

### **For Production (Later):**
1. ✅ Deploy to **Vercel + Railway**
2. ✅ Get free HTTPS automatically
3. ✅ Camera works everywhere!

---

## 🔧 Current Workaround (No HTTPS Needed!)

Since camera requires HTTPS, your QR Scanner already has alternatives:

### **Working Options:**
1. ✅ **Manual Entry** - Type QR code
2. ✅ **File Upload** - Take photo with phone camera app → Upload
3. ✅ **GPS Location** - Use "Use My GPS" button (super accurate!)

### **For Check-ins without camera:**
```
1. Go to location
2. Click "Use My GPS" 
3. System auto-fills coordinates
4. Save check-in
```

**GPS is actually MORE reliable than QR codes!** 📍

---

## 🎯 Summary

**Your Questions Answered:**

1. **"Camera ay gagana ba?"**
   - ✅ Yes, but need HTTPS
   - ✅ Or use File Upload method (works now!)
   - ✅ Or use hotspot → `http://192.168.43.x:5173`

2. **"Gagana ba kung mag-data ako?"**
   - ❌ Not directly (private IP)
   - ✅ Yes with hotspot (phone shares internet)
   - ✅ Yes with ngrok (public URL)
   - ✅ Yes when deployed online

**Best Solution NOW:**
- Keep using WiFi
- Use "Upload Image" instead of camera
- GPS works perfectly! 📱✅

**Best Solution LATER:**
- Use ngrok for testing
- Deploy to Vercel/Railway for production
- Everything works! 🚀
