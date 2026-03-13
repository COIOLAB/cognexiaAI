# CRM Database Tables - Quick Start

## ⚠️ Current Issue
**IPv6 Connectivity** - Your network doesn't support IPv6, which Supabase requires.

## ✅ QUICKEST SOLUTION (5 minutes)

### Try Mobile Hotspot:
1. Enable hotspot on your phone
2. Connect your PC to phone's hotspot
3. Run:
```powershell
npm run start:dev
```

That's it! The app will auto-create all 76+ tables.

---

## Alternative Solutions

### Option 1: Enable IPv6 (Requires admin & restart)
```powershell
# Run PowerShell as Administrator:
netsh interface ipv6 set global randomizeidentifiers=enabled
ipconfig /flushdns
Restart-Computer
```

### Option 2: Use WSL2
```powershell
wsl --install
wsl
cd /mnt/c/Users/nshrm/Desktop/CognexiaAI-ERP/backend/modules/03-CRM
npm install
npm run start:dev
```

### Option 3: Use VPN
- Install CloudFlare WARP: https://1.1.1.1/
- Connect and run: `npm run start:dev`

---

## 📋 Full Documentation
See `DATABASE-SETUP-SOLUTION.md` for complete details.

---

## ✅ What's Ready
- ✅ 76+ enterprise-grade entities defined
- ✅ All TypeScript errors fixed
- ✅ All dependencies installed
- ✅ Supabase credentials configured
- ✅ Auto-create on app start enabled
- ⏳ **Waiting**: IPv6 connectivity fix

---

## 🚀 Once Connected
```powershell
npm run start:dev
```

Watch for: **"Database connection initialized successfully"**

Then verify tables at:
https://supabase.com/dashboard/project/moijigidcrvbnjoaqelr/editor
