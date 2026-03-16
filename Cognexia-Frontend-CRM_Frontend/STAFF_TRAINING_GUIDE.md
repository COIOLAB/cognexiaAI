# 👥 **CognexiaAI CRM - Staff Training Guide**

Welcome to the CognexiaAI Support Team! This guide will help you master the Super Admin Portal and provide excellent customer support.

---

## 🎯 **Table of Contents**

1. [Getting Started](#getting-started)
2. [Staff Roles & Permissions](#staff-roles--permissions)
3. [Managing Support Tickets](#managing-support-tickets)
4. [Staff Management](#staff-management)
5. [Analytics & Reporting](#analytics--reporting)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 **Getting Started**

### **Portal Access**
- **URL**: `http://localhost:3001` (or your organization's URL)
- **Login**: Use your assigned email and password
- **First Login**: Change your password immediately

### **Dashboard Overview**
After logging in, you'll see:
- Quick stats (tickets, organizations, activity)
- Recent tickets
- Navigation menu
- Your profile

### **Main Navigation**
- 🏠 **Dashboard**: Overview and quick access
- 👥 **Staff**: Manage team members
- 🎫 **Support Tickets**: Handle customer requests
- 📊 **Analytics**: View performance metrics
- 🏢 **Organizations**: Manage client accounts

---

## 👔 **Staff Roles & Permissions**

### **1. Super Admin** 🔴
**Full System Access**
- ✅ View all organizations
- ✅ Manage all staff members
- ✅ Assign/reassign tickets
- ✅ Change any ticket status
- ✅ View analytics
- ✅ Configure system settings
- ✅ Manage billing
- ✅ Delete data

**Use Case**: System administrators, company owners

---

### **2. Support Manager** 🟠
**Team Leadership**
- ✅ View all support tickets
- ✅ Assign tickets to agents
- ✅ View team performance
- ✅ Manage support agents
- ✅ Access analytics
- ⛔ Cannot manage Super Admins
- ⛔ Cannot access billing

**Use Case**: Support team leads, managers

---

### **3. Support Agent** 🔵
**Customer Service**
- ✅ View assigned tickets
- ✅ Reply to tickets
- ✅ Change ticket status
- ✅ Add internal notes
- ⛔ Cannot assign tickets
- ⛔ Cannot view analytics
- ⛔ Cannot manage staff

**Use Case**: Frontline support staff

---

### **4. Technical Specialist** 🟣
**Technical Support**
- ✅ View technical tickets
- ✅ Access system logs
- ✅ Provide technical solutions
- ✅ Escalate to development
- ⛔ Limited to technical category
- ⛔ Cannot manage staff

**Use Case**: Technical support, developers

---

### **5. Billing Admin** 🟡
**Financial Operations**
- ✅ View billing tickets
- ✅ Manage invoices
- ✅ Process refunds
- ✅ Update payment methods
- ⛔ Limited to billing category
- ⛔ Cannot view technical tickets

**Use Case**: Finance team, billing specialists

---

### **6. Analytics Viewer** ⚪
**Read-Only Access**
- ✅ View all tickets (read-only)
- ✅ Access analytics dashboards
- ✅ Export reports
- ⛔ Cannot reply or modify tickets
- ⛔ Cannot manage staff

**Use Case**: Executives, quality assurance

---

## 🎫 **Managing Support Tickets**

### **Viewing Tickets**

**1. Navigate to Support Tickets**
- Click "Support" → "Tickets" in navigation
- View all tickets across organizations

**2. Understanding the Ticket List**
- **Ticket Number**: Unique identifier (TICKET-XXXXXX)
- **Subject**: Customer's issue summary
- **Status**: Current state (Open, In Progress, etc.)
- **Priority**: Urgency level
- **Organization**: Customer's company
- **Assigned To**: Staff member handling it
- **Created/Updated**: Timestamps

**3. Search & Filter**
- **Search**: By ticket number, subject, or keywords
- **Filter by Status**: Open, In Progress, Waiting, Resolved, Closed
- **Filter by Priority**: Urgent, High, Medium, Low
- **Filter by Organization**: View specific customer's tickets

---

### **Working with Tickets**

**Opening a Ticket**
1. Click on any ticket card
2. Review ticket details:
   - Customer information
   - Full description
   - Message history
   - Attachments

**Reading Messages**
- 📧 **Customer Messages**: Blue background
- 📝 **Internal Notes**: Yellow background (customer can't see)
- ℹ️ **System Messages**: Gray background

**Adding Responses**
1. Scroll to "Add Message" section
2. Type your response
3. Choose message type:
   - ✅ **Public**: Customer will see
   - ✅ **Internal**: Only staff can see
4. Click "Send Message"

**Internal Notes - When to Use:**
- Discussing with team members
- Recording investigation steps
- Noting follow-up actions
- Escalation reasons
- Sensitive information

---

### **Ticket Actions**

**1. Assign Ticket**
- Click "Assign To" dropdown
- Select staff member
- Staff receives notification

**2. Change Status**
- Click "Status" dropdown
- Select new status:
  - **Open**: Initial state
  - **In Progress**: Working on it
  - **Waiting Response**: Need customer info
  - **Resolved**: Issue fixed
  - **Closed**: Complete

**3. Change Priority**
- Click "Priority" dropdown
- Adjust based on urgency:
  - **Urgent**: Critical, immediate attention
  - **High**: Affects customer's work
  - **Medium**: Standard issue
  - **Low**: General question

---

### **Ticket Workflow (Standard Process)**

```
1. NEW TICKET ARRIVES
   ↓
2. TRIAGE (Support Manager)
   - Review issue
   - Set priority
   - Assign to appropriate agent
   ↓
3. INVESTIGATE (Support Agent)
   - Change status to "In Progress"
   - Research issue
   - Add internal notes if needed
   ↓
4. RESPOND TO CUSTOMER
   - Provide solution or ask for info
   - If waiting: Change status to "Waiting Response"
   ↓
5. CUSTOMER REPLIES
   - Back to "In Progress"
   - Continue investigation
   ↓
6. RESOLVE
   - Confirm solution works
   - Change status to "Resolved"
   - Customer rates experience
   ↓
7. CLOSE
   - After customer confirmation
   - Change status to "Closed"
```

---

### **Response Time Guidelines**

| Priority | First Response | Resolution Target |
|----------|----------------|-------------------|
| **Urgent** | 1 hour | 4 hours |
| **High** | 4 hours | 1 business day |
| **Medium** | 24 hours | 3 business days |
| **Low** | 48 hours | 5 business days |

---

## 👥 **Staff Management**

### **Viewing Staff Members**
1. Navigate to "Staff" section
2. See all team members
3. View role, status, and recent activity

### **Inviting New Staff**
1. Click "Invite Staff Member"
2. Fill in details:
   - Email address
   - First and last name
   - Role selection
3. Click "Send Invitation"
4. Staff receives email with login instructions

### **Editing Staff Members**
1. Click on staff member card
2. Modify:
   - Role
   - Status (Active/Inactive)
   - Notes
3. Save changes

### **Deactivating Staff**
- Don't delete - deactivate instead
- Preserves audit trail
- Can reactivate later if needed

---

## 📊 **Analytics & Reporting**

### **Support Analytics Dashboard**
Navigate to "Support" → "Analytics"

**Key Metrics:**
- 📈 **Total Tickets**: All-time count
- ⚡ **Response Rate**: % of tickets responded to
- ⏱️ **Avg Resolution Time**: Time to solve
- ⭐ **Satisfaction Score**: Customer ratings

**Charts & Visualizations:**
- Status distribution (pie chart)
- Tickets over time (line chart)
- Top categories (bar chart)
- Team performance (table)

**Exporting Reports:**
1. Select date range
2. Choose metrics
3. Click "Export"
4. Download CSV or PDF

---

## ✅ **Best Practices**

### **Communication**

**DO:**
- ✅ Be professional and courteous
- ✅ Use customer's name
- ✅ Acknowledge their frustration
- ✅ Provide clear, step-by-step solutions
- ✅ Set expectations ("I'll investigate and respond within 2 hours")
- ✅ Follow up after resolution

**DON'T:**
- ❌ Use jargon or technical terms without explanation
- ❌ Make promises you can't keep
- ❌ Blame the customer
- ❌ Copy-paste generic responses
- ❌ Close tickets without customer confirmation

---

### **Ticket Management**

**DO:**
- ✅ Update ticket status promptly
- ✅ Add internal notes for context
- ✅ Assign tickets to specialists when needed
- ✅ Escalate urgent issues quickly
- ✅ Check for duplicate tickets
- ✅ Tag tickets appropriately

**DON'T:**
- ❌ Let tickets sit unassigned
- ❌ Leave customers waiting without updates
- ❌ Close tickets prematurely
- ❌ Work on tickets assigned to others without coordination
- ❌ Forget to document solutions

---

### **Quality Standards**

**Every Response Should:**
1. **Acknowledge** the issue
2. **Empathize** with the customer
3. **Investigate** thoroughly
4. **Provide** a clear solution or next steps
5. **Follow up** to ensure satisfaction

**Example Good Response:**
```
Hi Sarah,

Thank you for contacting us about the reporting issue.

I understand how frustrating it must be to not have access 
to the advanced reports after your upgrade. Let me help you 
with that right away.

I've checked your account and I can see the upgrade has been 
processed, but the feature permissions need to be refreshed. 
I've just done that for you.

Can you please:
1. Log out of your account
2. Clear your browser cache
3. Log back in
4. Try accessing Reports again

The advanced reporting section should now be visible in your 
dashboard. Please let me know if you still experience any 
issues, and I'll investigate further.

Best regards,
John - CognexiaAI Support
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

**Problem: Can't See a Ticket**
- ✅ Check if it's assigned to you
- ✅ Verify your role permissions
- ✅ Use search to find it
- ✅ Ask manager to reassign if needed

**Problem: Can't Change Ticket Status**
- ✅ Check your role (Viewers can't edit)
- ✅ Refresh the page
- ✅ Check if ticket is locked by another user

**Problem: Notifications Not Working**
- ✅ Check email settings
- ✅ Verify email address is correct
- ✅ Check spam folder
- ✅ Contact IT admin

---

## 📞 **Getting Help**

### **Internal Support**
- **IT Help**: support-internal@cognexiaai.com
- **Manager**: Your direct supervisor
- **Training**: training@cognexiaai.com

### **Documentation**
- **This Guide**: Staff training materials
- **API Docs**: For technical integration
- **Knowledge Base**: Customer-facing help articles

---

## 🎓 **Training Checklist**

### **Week 1: Foundation**
- [ ] Complete portal orientation
- [ ] Learn ticket workflow
- [ ] Shadow experienced agent
- [ ] Handle first ticket with supervision

### **Week 2: Independence**
- [ ] Handle tickets independently
- [ ] Practice internal notes
- [ ] Learn escalation procedures
- [ ] Review analytics

### **Week 3: Mastery**
- [ ] Handle complex tickets
- [ ] Assist with training new staff
- [ ] Contribute to knowledge base
- [ ] Achieve 90%+ satisfaction rating

---

## 🏆 **Performance Metrics**

### **Individual KPIs**
- **Response Time**: < 4 hours average
- **Resolution Time**: < 24 hours for medium priority
- **Customer Satisfaction**: > 4.0/5.0
- **First Contact Resolution**: > 60%
- **Tickets Handled**: Based on role

### **Team Goals**
- 95% of urgent tickets resolved within SLA
- 90%+ customer satisfaction
- < 5% escalation rate
- Zero tickets older than 7 days

---

## 📝 **Quick Reference**

### **Keyboard Shortcuts**
- `Ctrl + K`: Search tickets
- `Ctrl + N`: New ticket
- `Ctrl + R`: Reply to ticket
- `Ctrl + S`: Save changes

### **Status Codes**
- 🟦 Open
- 🟨 In Progress
- 🟪 Waiting Response
- 🟩 Resolved
- ⬜ Closed

### **Priority Badges**
- 🔴 Urgent
- 🟠 High
- 🔵 Medium
- ⚪ Low

---

**Welcome to the team! Let's deliver exceptional support together! 🚀**

---

*Last Updated: 2026-01-27*  
*Version: 1.0.0*  
*For questions, contact: training@cognexiaai.com*
