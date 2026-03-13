# 📚 Super Admin Staff Management & Operations Guide

## ✅ **Login Credentials - FIXED**

Both super admin accounts are now working:

**Account 1:**
- Email: `superadmin@cognexiaai.com`
- Password: `Test@1234`

**Account 2:**
- Email: `admin@cognexiaai.com`
- Password: `Akshita@19822`

---

## 🎯 Table of Contents

1. [Staff Roles & Permissions](#staff-roles--permissions)
2. [Onboarding New Staff](#onboarding-new-staff)
3. [Access Control Policies](#access-control-policies)
4. [Call Center Management](#call-center-management)
5. [Support Ticket System](#support-ticket-system)
6. [Daily Operations](#daily-operations)
7. [Security Best Practices](#security-best-practices)
8. [Reporting & Analytics](#reporting--analytics)

---

## 🔐 Staff Roles & Permissions

### **1. Super Admin** (`super_admin`)
**Full system access - Use with caution!**

**Permissions:**
- ✅ All organization management (create, edit, delete, suspend)
- ✅ All user management (create, edit, delete, tiers)
- ✅ All feature management (enable, disable)
- ✅ All support ticket access (view, assign, resolve, escalate)
- ✅ Full analytics & reporting
- ✅ Billing management
- ✅ System settings & logs
- ✅ Staff management (invite, edit roles, remove)

**Who Should Have This:**
- CTO / Technical Lead
- CEO / Founder
- Platform Operations Manager

**Daily Tasks:**
- Strategic decisions
- High-level oversight
- Critical escalations
- System configuration

---

### **2. Admin** (`admin`)
**Organization & user management**

**Permissions:**
- ✅ View/edit organizations
- ✅ Create/edit users
- ✅ Manage user tiers (Basic, Premium, Advanced)
- ✅ Enable/disable features per organization
- ✅ View support tickets
- ✅ View analytics
- ✅ Assign tickets to support agents
- ❌ Delete organizations
- ❌ System settings
- ❌ Staff management

**Who Should Have This:**
- Customer Success Managers
- Account Managers
- Operations Team Leads

**Daily Tasks:**
- Onboard new organizations
- Upgrade/downgrade customer tiers
- Configure features for clients
- Monitor customer health
- Handle escalated tickets

---

### **3. Support Manager** (`support_manager`)
**Manage support team & escalations**

**Permissions:**
- ✅ View all support tickets
- ✅ Assign tickets to agents
- ✅ Escalate tickets
- ✅ Access ticket analytics
- ✅ View organization details
- ✅ View customer usage stats
- ❌ Edit organizations
- ❌ Manage billing
- ❌ Staff management

**Who Should Have This:**
- Support Team Lead
- Customer Support Manager
- Technical Support Manager

**Daily Tasks:**
- Triage incoming tickets
- Assign tickets to agents
- Monitor response times
- Handle escalations
- Review customer satisfaction
- Generate support reports

---

### **4. Support Agent** (`support_agent`)
**Handle customer support tickets**

**Permissions:**
- ✅ View assigned tickets
- ✅ Respond to customers
- ✅ Update ticket status
- ✅ View organization details (read-only)
- ✅ Request escalation
- ❌ Assign tickets
- ❌ Edit organizations
- ❌ Access billing
- ❌ View all analytics

**Who Should Have This:**
- Customer Support Representatives
- Technical Support Engineers
- Help Desk Staff

**Daily Tasks:**
- Respond to customer inquiries
- Troubleshoot technical issues
- Update ticket status
- Escalate complex issues
- Document solutions

---

### **5. Sales Manager** (`sales_manager`)
**Oversee subscriptions & revenue**

**Permissions:**
- ✅ View all organizations
- ✅ View subscription details
- ✅ Upgrade/downgrade tiers
- ✅ View revenue analytics
- ✅ Enable trial periods
- ✅ View usage statistics
- ❌ Delete organizations
- ❌ Access support tickets (unless assigned)
- ❌ System settings

**Who Should Have This:**
- Sales Team Lead
- Revenue Operations Manager
- Account Executives

**Daily Tasks:**
- Monitor subscription renewals
- Identify upsell opportunities
- Analyze customer usage
- Coordinate trials
- Revenue reporting

---

### **6. Analyst** (`analyst`)
**View-only analytics access**

**Permissions:**
- ✅ View all analytics & dashboards
- ✅ View usage statistics
- ✅ View organization health metrics
- ✅ Export reports
- ❌ Edit anything
- ❌ View sensitive data (passwords, API keys)
- ❌ Access support tickets

**Who Should Have This:**
- Business Analysts
- Data Scientists
- Product Managers
- Marketing Team

**Daily Tasks:**
- Generate reports
- Analyze user behavior
- Track feature adoption
- Identify trends
- Create dashboards

---

### **7. Billing Manager** (`billing_manager`)
**Manage payments & invoices**

**Permissions:**
- ✅ View billing information
- ✅ Process payments
- ✅ Issue refunds
- ✅ Manage invoices
- ✅ View subscription history
- ❌ Edit organization details
- ❌ Access support tickets
- ❌ Staff management

**Who Should Have This:**
- Finance Team
- Billing Department
- Accounts Receivable

**Daily Tasks:**
- Process invoices
- Handle payment issues
- Issue refunds
- Reconcile accounts
- Generate financial reports

---

### **8. Developer** (`developer`)
**Technical access for debugging**

**Permissions:**
- ✅ View API logs
- ✅ View system logs
- ✅ View error reports
- ✅ View database queries (read-only)
- ✅ View integration configs
- ❌ Edit production data
- ❌ Manage users
- ❌ Access billing

**Who Should Have This:**
- Backend Developers
- DevOps Engineers
- Platform Engineers

**Daily Tasks:**
- Debug production issues
- Investigate API errors
- Monitor system health
- Review integration logs
- Performance optimization

---

## 👤 Onboarding New Staff

### **Step 1: Create Staff Account**

1. **Login as Super Admin**
   ```
   Email: superadmin@cognexiaai.com
   Password: Test@1234
   ```

2. **Navigate to Staff Management**
   ```
   Super Admin Portal → Staff → Add New Staff Member
   ```

3. **Enter Staff Details:**
   - First Name
   - Last Name
   - Email (work email)
   - Phone Number
   - Department

4. **Assign Role:**
   - Select from: Super Admin, Admin, Support Manager, Support Agent, Sales Manager, Analyst, Billing Manager, Developer
   - Review permissions for selected role

5. **Configure Access:**
   - **All Organizations** (default)
   - OR **Specific Organizations** (limit access to certain clients)

6. **Set Status:**
   - ✅ Active (can login immediately)
   - ⏸️ Inactive (account created, cannot login yet)

7. **Send Invitation:**
   - System sends email with temporary password
   - Staff must reset password on first login
   - 2FA setup required (if enabled)

### **Step 2: Staff Receives Invitation**

Staff receives email:

```
Subject: Welcome to CognexiaAI Super Admin Portal

Hello [Name],

You've been invited to join the CognexiaAI Super Admin team!

Role: [Role Name]
Email: [email]
Temporary Password: [temp_password]

Login at: https://super-admin.cognexiaai.com

Please change your password on first login.

```

### **Step 3: First Login**

1. Navigate to Super Admin Portal
2. Enter email + temporary password
3. Set new secure password
4. Setup 2FA (if required)
5. Review permissions & dashboard

### **Step 4: Training & Documentation**

**Required Reading:**
- This document (SUPER_ADMIN_STAFF_GUIDE.md)
- Security policies
- Support procedures (if support role)
- Client communication guidelines

**Training Sessions:**
- System overview (1 hour)
- Role-specific training (2 hours)
- Shadowing experienced staff (1 week)
- First week check-ins

---

## 🔒 Access Control Policies

### **Password Policy**

- **Minimum Length:** 12 characters
- **Requirements:**
  - Uppercase letter
  - Lowercase letter
  - Number
  - Special character
- **Expiration:** 90 days
- **Cannot Reuse:** Last 5 passwords
- **Failed Attempts:** 5 lockouts for 30 minutes

### **2FA Policy**

- **Mandatory for:**
  - Super Admin
  - Admin
  - Billing Manager
  - Developer
- **Optional for:**
  - Other roles (recommended)

### **Session Management**

- **Auto-logout:** 30 minutes of inactivity
- **Maximum Session:** 12 hours
- **Concurrent Sessions:** 1 per user

### **IP Whitelisting** (Optional)

- Restrict access to office IPs
- VPN required for remote access

### **Audit Logging**

All actions are logged:
- Login/logout
- Organization changes
- User modifications
- Feature toggles
- Billing actions
- Support ticket updates

**Logs Retained:** 1 year

---

## 📞 Call Center Management

### **Overview**

The Super Admin portal includes a comprehensive call center/support ticket system to manage all customer inquiries from:
- Client Admin Portals
- Email support@cognexiaai.com
- Phone calls
- Live chat
- WhatsApp Business

### **Ticket Flow**

```
Customer Issue → Ticket Created → Auto-Assigned → Agent Responds → Resolved → Closed
                                      ↓
                             (If complex) Escalated to Manager → Resolved
```

### **Ticket Prioritization**

**🔴 CRITICAL** (Response: 15 min, Resolve: 4 hours)
- System down / complete outage
- Data loss
- Security breach
- Payment processing failure

**🟠 URGENT** (Response: 30 min, Resolve: 8 hours)
- Major feature not working
- Multiple users affected
- API integration broken
- Billing discrepancy

**🟡 HIGH** (Response: 2 hours, Resolve: 24 hours)
- Single user issue
- Feature request
- Workflow problem
- Report generation issue

**🟢 MEDIUM** (Response: 4 hours, Resolve: 48 hours)
- General inquiry
- How-to question
- Minor bug
- UI/UX issue

**⚪ LOW** (Response: 8 hours, Resolve: 1 week)
- Feature suggestion
- Documentation question
- Training request
- Non-urgent feedback

### **SLA Targets**

| Priority | First Response | Resolution | Escalation Time |
|----------|---------------|------------|-----------------|
| Critical | 15 minutes | 4 hours | Immediate |
| Urgent | 30 minutes | 8 hours | 2 hours |
| High | 2 hours | 24 hours | 4 hours |
| Medium | 4 hours | 48 hours | 1 day |
| Low | 8 hours | 1 week | N/A |

---

## 🎫 Support Ticket System

### **Creating a Ticket (Agent View)**

1. **Navigate to Support → New Ticket**

2. **Fill in Details:**
   - Organization (select from dropdown)
   - Category (Technical Issue, Billing, Feature Request, etc.)
   - Priority (auto-suggested based on keywords)
   - Subject
   - Description
   - Channel (Web, Email, Phone, Chat, WhatsApp)

3. **Attach Files:**
   - Screenshots
   - Error logs
   - Screen recordings
   - Documents

4. **Assign:**
   - Auto-assign to least busy agent
   - OR manually assign to specific agent

5. **Submit Ticket**
   - Customer receives confirmation email
   - Ticket appears in agent dashboard

### **Responding to Tickets**

1. **Open Ticket from Dashboard**

2. **Review:**
   - Customer details
   - Organization tier (Basic, Premium, Advanced)
   - Ticket history
   - Previous tickets from same org

3. **Research:**
   - Check knowledge base
   - Review similar resolved tickets
   - Consult documentation

4. **Respond:**
   - Professional, friendly tone
   - Clear, step-by-step instructions
   - Offer to schedule call if needed
   - Set customer expectations

5. **Update Status:**
   - In Progress (actively working)
   - Waiting on Customer (need more info)
   - Escalated (passed to manager)
   - Resolved (issue fixed)
   - Closed (customer confirmed resolution)

### **Escalation Process**

**When to Escalate:**
- Technical issue beyond agent knowledge
- Customer requests manager
- Tier 2/3 support needed
- Billing dispute
- Legal/compliance issue
- VIP customer

**How to Escalate:**
1. Add internal note explaining escalation reason
2. Tag ticket with "escalated"
3. Assign to Support Manager
4. Notify manager via Slack/email
5. Set priority to URGENT
6. Continue monitoring

### **Knowledge Base Integration**

- Document common solutions
- Link solutions to tickets
- Search before responding
- Update KB with new solutions

---

## 📊 Daily Operations

### **Support Agent Daily Workflow**

**Morning (9 AM - 12 PM):**
1. Check overnight tickets
2. Respond to all URGENT/CRITICAL
3. Update ticket statuses
4. Follow up on "Waiting on Customer"
5. Close resolved tickets

**Afternoon (1 PM - 5 PM):**
1. Handle new incoming tickets
2. Continue active conversations
3. Research complex issues
4. Update knowledge base
5. End-of-day summary

### **Support Manager Daily Workflow**

**Morning:**
1. Review overnight escalations
2. Check SLA compliance
3. Triage new tickets
4. Redistribute workload
5. Check agent availability

**Throughout Day:**
1. Monitor queue in real-time
2. Handle escalated tickets
3. Conduct quality reviews
4. Coach agents
5. Update team on issues

**Evening:**
1. Daily metrics review
2. Plan next day staffing
3. Escalate to leadership if needed

### **Admin Daily Workflow**

**Morning:**
1. Review new organization signups
2. Check for tier upgrade requests
3. Monitor organization health
4. Review feature requests

**Afternoon:**
1. Onboard new organizations
2. Configure features
3. Respond to account inquiries
4. Generate usage reports

---

## 🛡️ Security Best Practices

### **For All Staff:**

1. **Never Share Credentials**
   - Each staff has own account
   - No shared passwords
   - Report suspicious activity

2. **Secure Workstation**
   - Lock screen when away
   - Use encrypted drives
   - VPN for remote work

3. **Customer Data Privacy**
   - Access only what's needed
   - Never export customer data
   - Don't discuss customers publicly

4. **Phishing Awareness**
   - Verify sender before clicking links
   - Report suspicious emails
   - Don't enter credentials on external sites

5. **Clean Desk Policy**
   - No customer info on paper
   - Secure documents when leaving
   - Shred sensitive materials

### **For Super Admins:**

1. **Critical Changes:**
   - Require approval from 2nd super admin
   - Document all system changes
   - Test in staging first

2. **Database Access:**
   - Read-only unless absolutely necessary
   - Log all direct database queries
   - Never delete production data without backup

3. **API Keys & Secrets:**
   - Rotate every 90 days
   - Store in secure vault
   - Never commit to GitHub

---

## 📈 Reporting & Analytics

### **Weekly Reports**

**Support Metrics:**
- Total tickets created
- Tickets resolved
- Average response time
- Average resolution time
- Customer satisfaction scores
- Top categories
- Agent performance

**Organization Metrics:**
- New signups
- Tier upgrades/downgrades
- Churn rate
- Feature adoption
- Usage trends

### **Monthly Reports**

**Executive Summary:**
- Revenue metrics
- Customer growth
- Support efficiency
- Feature requests analysis
- Strategic recommendations

**Department Reports:**
- Sales: conversions, pipeline, renewals
- Support: SLA compliance, trending issues
- Product: feature usage, feedback
- Finance: MRR, churn, LTV

---

## 🎯 How Staff Should Use the CRM

### **Super Admin / Admin:**

**Organization Management:**
1. Navigate to `/organizations`
2. Click organization name
3. View all 4 sections:
   - User Tier Manager (set Basic/Premium/Advanced)
   - Feature Management (enable/disable features)
   - Usage Analytics (monitor customer activity)
   - Real-time Activity Feed (see live actions)

**Staff Management:**
1. Navigate to `/staff`
2. Invite new team members
3. Assign roles
4. Monitor activity

**Call Center:**
1. Navigate to `/support/tickets`
2. View all tickets or filter by:
   - Status
   - Priority
   - Agent
   - Organization
3. Click ticket to view/respond

### **Support Manager:**

**Ticket Dashboard:**
1. Navigate to `/support/dashboard`
2. See real-time metrics:
   - Tickets in queue
   - Average wait time
   - Agent availability
   - SLA compliance
3. Drag-and-drop ticket assignment
4. View escalations

**Analytics:**
1. Navigate to `/support/analytics`
2. Generate reports
3. Export data
4. Share with leadership

### **Support Agent:**

**My Tickets:**
1. Navigate to `/support/my-tickets`
2. See assigned tickets
3. Sort by priority
4. Click to respond

**Responding:**
1. Read ticket details
2. Check customer tier
3. Review past tickets
4. Draft response
5. Update status
6. Set follow-up reminder

### **Sales Manager:**

**Revenue Dashboard:**
1. Navigate to `/sales/dashboard`
2. View:
   - MRR (Monthly Recurring Revenue)
   - ARR (Annual Recurring Revenue)
   - Churn rate
   - Upgrade opportunities

**Organization Analysis:**
1. Navigate to `/organizations`
2. Filter by tier
3. Sort by usage
4. Identify upsell candidates

### **Analyst:**

**Analytics Hub:**
1. Navigate to `/analytics`
2. Access:
   - Platform analytics
   - Feature usage
   - User behavior
   - Revenue trends
3. Create custom reports
4. Schedule automated reports

---

## 🚀 Quick Start for New Staff

### **Day 1:**
1. ✅ Login with temporary password
2. ✅ Change password
3. ✅ Setup 2FA
4. ✅ Read this guide
5. ✅ Review role permissions
6. ✅ Explore dashboard
7. ✅ Meet team

### **Week 1:**
1. Shadow experienced staff
2. Handle tickets (with supervision)
3. Learn knowledge base
4. Study support procedures
5. Daily check-ins with manager

### **Month 1:**
1. Independent ticket handling
2. Meet SLA targets
3. Contribute to KB
4. Suggest improvements
5. Performance review

---

## 📋 Checklist: Setting Up Call Center

- [ ] Create support staff accounts
- [ ] Assign roles (Support Manager, Agents)
- [ ] Configure ticket categories
- [ ] Set up SLA targets
- [ ] Create ticket email integration (support@cognexiaai.com)
- [ ] Configure phone integration (if applicable)
- [ ] Setup WhatsApp Business
- [ ] Create knowledge base articles
- [ ] Train staff on ticket system
- [ ] Test ticket creation & assignment
- [ ] Monitor first week closely
- [ ] Gather staff feedback
- [ ] Refine processes

---

## 📞 Contact

**For Super Admin Access Issues:**
- Email: tech@cognexiaai.com
- Emergency: [Your phone number]

**For System Bugs:**
- Create internal ticket
- Tag as "system-bug"
- CC: Development team

---

**Last Updated:** January 27, 2026
**Version:** 1.0.0
**Status:** ✅ READY FOR USE

Both super admin accounts are working and the system is ready for staff onboarding!
