# 🧪 Testing Checklist - What We Built

**Last Updated:** 2026-01-14  
**Build Status:** ✅ Compiles Successfully  
**Servers:** Backend (3003) + Frontend (3002)

---

## ✅ Pre-Testing Verification

- [x] Backend running on `http://localhost:3003`
- [x] Frontend running on `http://localhost:3002`
- [x] TypeScript compilation: **SUCCESS** (no errors)
- [x] No console errors on build

---

## 📋 Test Scenarios

### 1. Customer List Page (`/customers`)

**URL:** `http://localhost:3002/customers`

#### Basic Functionality
- [ ] Page loads without errors
- [ ] Stats cards show data (4 cards at top)
- [ ] Customer table displays with data
- [ ] Table columns visible:
  - Customer Code
  - Company Name
  - Type (B2B/B2C/B2B2C)
  - Status (active/inactive/prospect)
  - Industry
  - Tier (with colored badges)
  - Revenue
  - Last Contact Date
- [ ] "Add Customer" button visible (top right)
- [ ] "Export" button visible (top right)

#### Search & Filter
- [ ] Search box at top of table
- [ ] Type in search → table filters instantly
- [ ] Clear search → table resets

#### Row Actions
- [ ] Click on row → navigates to customer detail
- [ ] Three-dot menu on each row shows:
  - [ ] View
  - [ ] Edit
  - [ ] Delete

#### Bulk Operations
- [ ] Select checkbox on multiple rows
- [ ] "X customer(s) selected" bar appears
- [ ] "Delete Selected" button works
- [ ] Confirmation dialog appears
- [ ] After delete → rows removed + toast notification

#### Export
- [ ] Click "Export" button
- [ ] CSV file downloads
- [ ] File contains customer data

**Expected Console Logs:**
```
🔵 API Request: GET /crm/customers
🟢 API Response: GET /crm/customers
🔵 API Request: GET /crm/customers/stats
🟢 API Response: GET /crm/customers/stats
```

---

### 2. Customer Detail Page (`/customers/[id]`)

**URL:** `http://localhost:3002/customers/{any-customer-id}`

#### Header Section
- [ ] Company name displays
- [ ] Status badge displays (colored)
- [ ] Tier badge displays
- [ ] "Customer since" date shows
- [ ] "Edit" button works
- [ ] "Delete" button works + confirmation

#### Stats Cards (4 cards)
- [ ] Total Revenue shows dollar amount
- [ ] Satisfaction Score shows X/10
- [ ] Loyalty Score shows X/10
- [ ] Last Contact shows days

#### Tab Navigation
- [ ] 5 tabs visible: Overview, Contacts, Opportunities, Activities, Documents
- [ ] Clicking each tab changes content

---

### 3. Overview Tab

**In Customer Detail → Overview Tab**

#### Company Information Card
- [ ] Customer Code displays
- [ ] Type shows (B2B/B2C/B2B2C)
- [ ] Industry shows
- [ ] Company Size shows
- [ ] Full address displays
- [ ] Website shows as clickable link
- [ ] Tags display (if any)

#### Primary Contact Card
- [ ] Name and Title show
- [ ] Email is clickable (mailto:)
- [ ] Phone is clickable (tel:)
- [ ] LinkedIn link works (if present)

#### Demographics Card
- [ ] Founded Year
- [ ] Employee Count
- [ ] Annual Revenue
- [ ] Tax ID

#### Segmentation & Risk Card
- [ ] Segment shows
- [ ] Tier badge shows
- [ ] Risk Level badge (with color)
- [ ] Growth Potential shows

---

### 4. Activities Tab

**In Customer Detail → Activities Tab**

#### Left Side: Notes Section
- [ ] "Quick Notes" card visible
- [ ] Text area for adding notes
- [ ] "Add Note" button visible
- [ ] Add a note → should appear in list below
- [ ] Edit note button (pencil icon) → inline editor appears
- [ ] Save edited note → updates immediately
- [ ] Delete note button (trash icon) → confirmation → removes note
- [ ] Pin note button (pin icon) → background turns yellow
- [ ] Shows creator name on each note
- [ ] Shows creation date on each note

**Expected API Calls:**
```
🔵 POST /crm/activity/notes (create)
🔵 PUT /crm/activity/notes/:id (edit)
🔵 DELETE /crm/activity/notes/:id (delete)
🔵 POST /crm/activity/notes/:id/pin (pin/unpin)
```

#### Right Side: Activity Timeline
- [ ] Timeline displays vertically
- [ ] Each activity has an icon (phone/email/meeting/etc)
- [ ] Activity type shows (call, email, meeting, note, task)
- [ ] Description shows
- [ ] Performer name shows
- [ ] Timestamp shows
- [ ] Metadata displays (if any)
- [ ] Empty state shows if no activities

**Expected API Call:**
```
🔵 GET /crm/activity/timeline/customer/:id
```

---

### 5. Contacts Tab

**In Customer Detail → Contacts Tab**

#### Header
- [ ] "Contacts (X)" title shows count
- [ ] "Add Contact" button visible

#### Contact Cards
- [ ] Grid layout (3 columns on desktop)
- [ ] Each card shows:
  - [ ] Name and Title
  - [ ] Email (clickable mailto:)
  - [ ] Phone (clickable tel:)
  - [ ] Status badge
  - [ ] Type badge
  - [ ] "View Details" button
- [ ] Click card → navigates to contact detail
- [ ] Hover effect on cards

#### Empty State
- [ ] If no contacts → shows empty state message
- [ ] "Add First Contact" button visible

**Expected API Call:**
```
🔵 GET /crm/customers/:id/contacts
```

---

### 6. Opportunities Tab

**In Customer Detail → Opportunities Tab**

#### Stats Cards (4 cards)
- [ ] Total Value (sum)
- [ ] Active Deals (count)
- [ ] Won (count + win rate %)
- [ ] Lost (count + loss rate %)

#### Header
- [ ] "Opportunities" title
- [ ] "Add Opportunity" button

#### Opportunity Cards
- [ ] Grid layout (2 columns)
- [ ] Each card shows:
  - [ ] Deal name
  - [ ] Amount (dollar value)
  - [ ] Stage badge (colored based on stage)
  - [ ] Probability progress bar
  - [ ] Expected close date
  - [ ] Description (truncated)
  - [ ] "View Details" button
- [ ] Click card → navigates to opportunity detail

#### Empty State
- [ ] If no opportunities → shows empty state
- [ ] "Create First Opportunity" button

**Expected API Call:**
```
🔵 GET /crm/opportunities?customerId=:id
```

---

### 7. Documents Tab

**In Customer Detail → Documents Tab**

- [ ] Card with "Documents" title shows
- [ ] Message: "Document management coming soon..."
- [ ] ⚠️ **This is expected** (Phase 9 feature)

---

### 8. Customer Create Page (`/customers/new`)

**URL:** `http://localhost:3002/customers/new`

#### Page Load
- [ ] "New Customer" heading shows
- [ ] Form with 3 tabs loads
- [ ] Cancel button works

#### Tab 1: Basic Info
- [ ] Company Name field (required)
- [ ] Customer Type dropdown (B2B/B2C/B2B2C)
- [ ] Industry field (required)
- [ ] Company Size dropdown (required)

#### Tab 2: Contact Details
- [ ] First Name (required)
- [ ] Last Name (required)
- [ ] Job Title (required)
- [ ] Email (required, with validation)
- [ ] Phone (required)
- [ ] Mobile (optional)
- [ ] LinkedIn (optional, URL validation)
- [ ] Street Address (required)
- [ ] City (required)
- [ ] State (optional)
- [ ] ZIP Code (required)
- [ ] Country (required)
- [ ] Region (required)

#### Tab 3: Additional Info
- [ ] Website (URL validation)
- [ ] Founded Year (number, 1800-2026)
- [ ] Employee Count (number)
- [ ] Annual Revenue (number)
- [ ] Tax ID (optional)
- [ ] Tags (comma-separated)

#### Form Validation
- [ ] Click submit with empty required fields → error messages show
- [ ] Invalid email → "Invalid email address" error
- [ ] Invalid URL → "Invalid URL" error
- [ ] Invalid year → error message
- [ ] All validations work in real-time

#### Form Submission
- [ ] Fill all required fields
- [ ] Click "Create Customer"
- [ ] Loading spinner shows on button
- [ ] Success toast appears
- [ ] Redirects to new customer detail page

**Expected API Call:**
```
🔵 POST /crm/customers
🟢 API Response with new customer data
```

---

### 9. Customer Edit Page (`/customers/[id]/edit`)

**URL:** `http://localhost:3002/customers/{id}/edit`

#### Page Load
- [ ] "Edit Customer" heading shows
- [ ] Loading skeleton appears briefly
- [ ] Form loads with **pre-filled data**
- [ ] Company name field has existing value
- [ ] All fields populated correctly

#### Form Editing
- [ ] Change company name
- [ ] Change any field
- [ ] Click "Save Changes"
- [ ] Loading spinner shows
- [ ] Success toast appears
- [ ] Redirects back to customer detail
- [ ] Detail page shows updated values

**Expected API Calls:**
```
🔵 GET /crm/customers/:id (load data)
🔵 PUT /crm/customers/:id (save changes)
🟢 API Response with updated customer
```

---

### 10. Customer Delete

#### From Detail Page
- [ ] Click "Delete" button in header
- [ ] Confirmation dialog appears with customer name
- [ ] Click "OK"
- [ ] Success toast appears
- [ ] Redirects to customer list
- [ ] Customer removed from list

#### From List Page (Single)
- [ ] Click three-dot menu → Delete
- [ ] Confirmation dialog appears
- [ ] Click "OK"
- [ ] Row disappears
- [ ] Success toast appears

**Expected API Call:**
```
🔵 DELETE /crm/customers/:id
```

---

## 🐛 Browser Console Checks

Open DevTools (F12) → Console tab

### What You Should See
✅ **In Development Mode:**
- Blue logs (🔵) for API requests
- Green logs (🟢) for successful responses
- Red logs (🔴) for errors (only if there's a real error)
- Yellow warnings (⚠️) for slow requests (>1s)

✅ **Expected Logs Example:**
```
🔵 API Request: GET /crm/customers
Headers: {Authorization: "Bearer ...", X-Tenant-ID: "..."}
Data: ...

🟢 API Response: GET /crm/customers
Status: 200
Data: {success: true, data: {...}}
```

### What You Should NOT See
❌ **Errors:**
- "Cannot read property of undefined"
- "Network Error"
- "404 Not Found" (except for endpoints that don't exist)
- "TypeScript compile error"
- Any red error messages

---

## 🎯 Critical Path Test

**End-to-End Customer Flow (5 minutes):**

1. [ ] Navigate to `http://localhost:3002/customers`
2. [ ] Click "Add Customer" button
3. [ ] Fill out form:
   - Company: "Test Company"
   - Type: "B2B"
   - Industry: "Technology"
   - Size: "SMB"
   - First Name: "John"
   - Last Name: "Doe"
   - Title: "CEO"
   - Email: "john@test.com"
   - Phone: "+1234567890"
   - Street: "123 Test St"
   - City: "Test City"
   - ZIP: "12345"
   - Country: "USA"
   - Region: "North America"
4. [ ] Click "Create Customer"
5. [ ] Verify redirect to detail page
6. [ ] Check all tabs load:
   - [ ] Overview shows data
   - [ ] Activities tab loads
   - [ ] Add a note in Activities
   - [ ] Verify note appears
   - [ ] Contacts tab shows empty state
   - [ ] Opportunities tab shows empty state
7. [ ] Click "Edit" button
8. [ ] Change company name to "Test Company Updated"
9. [ ] Click "Save Changes"
10. [ ] Verify redirect back to detail
11. [ ] Verify company name shows "Test Company Updated"
12. [ ] Click "Delete" button
13. [ ] Confirm deletion
14. [ ] Verify redirect to list
15. [ ] Verify customer no longer in list

**If all 15 steps work:** ✅ **Everything is working!**

---

## 📊 Performance Checks

### Page Load Times
- [ ] Customer list loads in <2s
- [ ] Customer detail loads in <1s
- [ ] Form submissions complete in <1s
- [ ] Tab switches instant (<100ms)

### API Response Times
Check console logs for slow warnings:
- [ ] No "⚠️ Slow API request" warnings
- [ ] If warnings appear → note which endpoints

---

## 🔍 Edge Cases to Test

### Error Handling
- [ ] Create customer with duplicate email → error toast shows
- [ ] Submit form with backend down → error toast shows
- [ ] Navigate to non-existent customer ID → "not found" message

### Empty States
- [ ] Customer with no contacts → empty state shows
- [ ] Customer with no opportunities → empty state shows
- [ ] Customer with no activities → empty state shows

### Data Validation
- [ ] Invalid email format → validation error
- [ ] Negative employee count → validation error
- [ ] Future founded year → validation error

---

## ✅ Success Criteria

**All Systems Go if:**
- [ ] Build compiles without errors ✅
- [ ] No console errors on page load
- [ ] Customer list displays data
- [ ] Customer detail shows all tabs
- [ ] Create customer works end-to-end
- [ ] Edit customer works and saves
- [ ] Delete customer works
- [ ] Notes CRUD works (create, edit, delete, pin)
- [ ] API logging shows in console (dev only)
- [ ] All navigation works
- [ ] Forms validate correctly
- [ ] Success/error toasts appear

---

## 📝 Testing Notes

**Record any issues here:**

```
Issue 1: [Description]
Steps to reproduce:
1. 
2. 
3. 

Issue 2: [Description]
...
```

---

## 🎉 Test Results

- **Date Tested:** __________
- **Tester:** __________
- **Tests Passed:** ___ / 100+
- **Tests Failed:** ___
- **Overall Status:** [ ] ✅ PASS  [ ] ❌ FAIL

---

**Ready to test? Open your browser and start checking!** 🚀
