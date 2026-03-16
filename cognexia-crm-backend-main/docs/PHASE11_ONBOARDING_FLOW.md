# Phase 11: Onboarding Flow Backend

## Overview
Phase 11 implements a comprehensive onboarding system that guides new organizations and users through setup, helping them get started quickly and increasing activation rates. The system features personalized onboarding flows, progress tracking, quick-win checklists, and gamification with completion rewards.

## Implementation Summary

### Components Created
1. **OnboardingSession Entity** - Tracks onboarding progress with steps and analytics
2. **Onboarding DTOs** - 12 DTOs for various onboarding operations
3. **OnboardingService** - Complete onboarding flow management
4. **OnboardingController** - 12 REST API endpoints

### Files Created
- `entities/onboarding-session.entity.ts` (218 lines) - ✅ Complete
- `dto/onboarding.dto.ts` (331 lines) - ✅ Complete
- `services/onboarding.service.ts` (574 lines) - ✅ Complete
- `controllers/onboarding.controller.ts` (463 lines) - ✅ Complete

**Total**: 4 files, 1,586 lines of code

---

## Key Features

### 1. Personalized Onboarding Flows
- **Organization Onboarding**: Guide new companies through setup
- **User Onboarding**: Help new team members get started
- **Feature Onboarding**: Introduce specific features
- **Dynamic Step Generation**: Based on user's industry, company size, and interested features

### 2. Progress Tracking
- **Step Completion**: Mark steps as completed with metadata
- **Progress Percentage**: Real-time progress calculation
- **Time Tracking**: Monitor time spent on onboarding
- **Session Resume**: Continue from where you left off

### 3. Quick-Win Checklist
- **Action Items**: 5 quick tasks to achieve first success
- **Completion Tracking**: Track when items are completed
- **Motivation**: Build momentum with small wins

### 4. Flexibility & Control
- **Skip Optional Steps**: Skip non-required steps with reason tracking
- **Auto-Advance**: Automatically move to next step (configurable)
- **Show/Hide Tips**: Toggle helpful tips display
- **Email Reminders**: Optional reminder emails (configurable)

### 5. Help & Support
- **In-App Help Requests**: Request help at any step
- **Support Team Notification**: Alerts customer success team
- **Abandonment Tracking**: Understand why users abandon onboarding

### 6. Analytics & Insights
- **Completion Rate**: Track onboarding success
- **Abandonment Analysis**: Identify drop-off points
- **Time-to-Value**: Measure time to complete onboarding
- **Feedback Collection**: Gather user feedback (1-5 rating)

### 7. Gamification
- **Completion Rewards**: Incentivize finishing onboarding
- **Reward Types**: Credits, features unlock, gifts
- **Single Claim**: Prevent duplicate reward claims

---

## Database Schema

### OnboardingSession Entity

```typescript
{
  // Identity
  id: UUID (PK),
  type: 'organization' | 'user' | 'feature',
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'abandoned',
  
  // Relationships
  organizationId: UUID (FK -> organizations),
  userId: UUID (FK -> users, nullable),
  
  // Progress
  steps: OnboardingStep[] (JSONB),
  currentStepIndex: number,
  completedSteps: number,
  totalSteps: number,
  progressPercentage: float,
  checklist: OnboardingChecklistItem[] (JSONB),
  
  // Personalization
  userResponses: object (JSONB),
  industry: string,
  companySize: string ('1-10', '11-50', '51-200', '201-1000', '1000+'),
  primaryUseCase: string,
  interestedFeatures: string[],
  
  // Timing
  startedAt: timestamp,
  completedAt: timestamp,
  abandonedAt: timestamp,
  lastActivityAt: timestamp,
  timeSpentMinutes: number,
  
  // Abandonment Tracking
  abandonmentReason: string,
  feedbackNotes: text,
  
  // Engagement
  sessionCount: number,
  skippedStepsCount: number,
  helpRequested: boolean,
  helpRequestedAt: timestamp,
  
  // Rewards
  rewardClaimed: boolean,
  rewardType: string,
  
  // Configuration
  showTips: boolean (default: true),
  sendReminders: boolean (default: true),
  autoAdvance: boolean (default: false),
  
  // Metadata
  metadata: object (JSONB),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### OnboardingStep Interface (JSONB)

```typescript
{
  id: UUID,
  type: OnboardingStepType,
  title: string,
  description: string,
  order: number,
  required: boolean,
  completed: boolean,
  completedAt: timestamp,
  skipped: boolean,
  skippedAt: timestamp,
  metadata: object
}
```

### OnboardingChecklistItem Interface (JSONB)

```typescript
{
  id: UUID,
  title: string,
  completed: boolean,
  completedAt: timestamp
}
```

---

## Onboarding Step Types

### Organization Onboarding Steps
1. **WELCOME** - Welcome message and introduction
2. **PROFILE_SETUP** - Company profile configuration
3. **TEAM_INVITATION** - Invite team members
4. **SUBSCRIPTION_SELECTION** - Choose subscription plan
5. **PAYMENT_METHOD** - Set up payment method
6. **INTEGRATION_SETUP** - Connect external tools
7. **DATA_IMPORT** - Import existing data
8. **PREFERENCES** - Configure preferences
9. **FIRST_CUSTOMER** - Add first customer
10. **FIRST_LEAD** - Create first lead
11. **FIRST_OPPORTUNITY** - Create first opportunity
12. **FIRST_TICKET** - Create first support ticket
13. **EMAIL_SETUP** - Configure email settings
14. **NOTIFICATION_SETUP** - Set up notifications
15. **DASHBOARD_TOUR** - Tour of dashboard features
16. **COMPLETE** - Onboarding completion

### User Onboarding Steps
1. **WELCOME** - Welcome to the team
2. **PROFILE_SETUP** - Personal profile setup
3. **DASHBOARD_TOUR** - Dashboard orientation
4. **COMPLETE** - User onboarding complete

### Feature Onboarding Steps
1. **CRM_SETUP** - CRM module setup
2. **SALES_PIPELINE** - Sales pipeline configuration
3. **MARKETING_AUTOMATION** - Marketing automation setup
4. **SUPPORT_SYSTEM** - Support system setup
5. **REPORTING_SETUP** - Reporting and analytics setup

---

## API Endpoints

### 1. Start Onboarding Session
**Endpoint**: `POST /onboarding/start`

**Authorization**: ORG_ADMIN, ORG_USER, SUPER_ADMIN

**Request Body**:
```json
{
  "type": "organization",
  "industry": "Technology",
  "companySize": "11-50",
  "primaryUseCase": "Sales CRM",
  "interestedFeatures": ["crm", "sales", "support"],
  "userResponses": {
    "goal": "Increase sales efficiency",
    "teamSize": 15
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Onboarding session started successfully",
  "data": {
    "id": "session-uuid",
    "type": "organization",
    "status": "in_progress",
    "organizationId": "org-uuid",
    "steps": [...],
    "currentStepIndex": 0,
    "completedSteps": 0,
    "totalSteps": 8,
    "progressPercentage": 0,
    "checklist": [...],
    "industry": "Technology",
    "companySize": "11-50",
    "startedAt": "2026-01-11T06:00:00Z",
    "sessionCount": 1
  }
}
```

### 2. Get Current Onboarding Session
**Endpoint**: `GET /onboarding/current?type=organization`

**Authorization**: ORG_ADMIN, ORG_USER, SUPER_ADMIN

**Response**:
```json
{
  "success": true,
  "message": "Current onboarding session retrieved successfully",
  "data": {
    "id": "session-uuid",
    "type": "organization",
    "status": "in_progress",
    "progressPercentage": 37.5,
    "currentStepIndex": 3,
    "steps": [...]
  }
}
```

### 3. Complete Onboarding Step
**Endpoint**: `POST /onboarding/:sessionId/steps/complete`

**Authorization**: ORG_ADMIN, ORG_USER, SUPER_ADMIN

**Request Body**:
```json
{
  "stepType": "profile_setup",
  "metadata": {
    "companyName": "Acme Corp",
    "website": "https://acme.com"
  },
  "timeSpentMinutes": 5
}
```

**Response**:
```json
{
  "success": true,
  "message": "Step completed successfully",
  "data": {
    "id": "session-uuid",
    "completedSteps": 2,
    "progressPercentage": 25,
    "currentStepIndex": 2
  }
}
```

### 4. Skip Onboarding Step
**Endpoint**: `POST /onboarding/:sessionId/steps/skip`

**Authorization**: ORG_ADMIN, ORG_USER, SUPER_ADMIN

**Request Body**:
```json
{
  "stepType": "data_import",
  "reason": "Will import data later"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Step skipped successfully",
  "data": {
    "id": "session-uuid",
    "skippedStepsCount": 1,
    "currentStepIndex": 4
  }
}
```

### 5. Update Onboarding Progress
**Endpoint**: `PUT /onboarding/:sessionId/progress`

**Authorization**: ORG_ADMIN, ORG_USER, SUPER_ADMIN

**Request Body**:
```json
{
  "currentStepIndex": 5,
  "timeSpentMinutes": 10,
  "metadata": {
    "notes": "Making good progress"
  }
}
```

### 6. Update Onboarding Settings
**Endpoint**: `PUT /onboarding/:sessionId/settings`

**Authorization**: ORG_ADMIN, ORG_USER, SUPER_ADMIN

**Request Body**:
```json
{
  "showTips": false,
  "sendReminders": true,
  "autoAdvance": true
}
```

### 7. Complete Checklist Item
**Endpoint**: `POST /onboarding/:sessionId/checklist/complete`

**Authorization**: ORG_ADMIN, ORG_USER, SUPER_ADMIN

**Request Body**:
```json
{
  "itemId": "checklist-item-uuid",
  "notes": "Added first customer successfully"
}
```

### 8. Request Help
**Endpoint**: `POST /onboarding/:sessionId/help`

**Authorization**: ORG_ADMIN, ORG_USER, SUPER_ADMIN

**Request Body**:
```json
{
  "stepType": "integration_setup",
  "message": "Need help connecting Stripe",
  "contactPreference": "email"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Help request submitted successfully. Our team will reach out soon.",
  "data": {
    "id": "session-uuid",
    "helpRequested": true,
    "helpRequestedAt": "2026-01-11T06:30:00Z"
  }
}
```

### 9. Abandon Onboarding
**Endpoint**: `POST /onboarding/:sessionId/abandon`

**Authorization**: ORG_ADMIN, ORG_USER, SUPER_ADMIN

**Request Body**:
```json
{
  "reason": "Too complex for now",
  "feedbackNotes": "Will come back later when I have more time"
}
```

### 10. Submit Feedback
**Endpoint**: `POST /onboarding/:sessionId/feedback`

**Authorization**: ORG_ADMIN, ORG_USER, SUPER_ADMIN

**Request Body**:
```json
{
  "rating": 5,
  "comments": "Very smooth onboarding process!",
  "liked": "Clear instructions and helpful tips",
  "improvement": "Would be nice to have video tutorials"
}
```

### 11. Claim Reward
**Endpoint**: `POST /onboarding/:sessionId/reward/claim`

**Authorization**: ORG_ADMIN, ORG_USER, SUPER_ADMIN

**Request Body**:
```json
{
  "rewardType": "free_credits",
  "metadata": {
    "amount": 100,
    "currency": "USD"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Reward claimed successfully!",
  "data": {
    "id": "session-uuid",
    "rewardClaimed": true,
    "rewardType": "free_credits"
  }
}
```

### 12. Get Onboarding Analytics
**Endpoint**: `GET /onboarding/analytics?startDate=2026-01-01&endDate=2026-01-31`

**Authorization**: ORG_ADMIN, SUPER_ADMIN

**Response**:
```json
{
  "success": true,
  "message": "Onboarding analytics retrieved successfully",
  "data": {
    "total": 50,
    "completed": 35,
    "inProgress": 10,
    "abandoned": 5,
    "completionRate": 70,
    "abandonmentRate": 10,
    "avgTimeToComplete": 45,
    "avgProgressPercentage": 82,
    "dateRange": {
      "start": "2026-01-01T00:00:00Z",
      "end": "2026-01-31T23:59:59Z"
    }
  }
}
```

---

## Personalization Logic

### Dynamic Step Generation

The onboarding service generates personalized steps based on:

1. **Industry**: Tailors examples and use cases
2. **Company Size**: Adjusts recommendations for team size
3. **Primary Use Case**: Focuses on relevant features
4. **Interested Features**: Includes feature-specific steps

**Example**:
```typescript
// User interested in CRM + Sales + Support
Steps generated:
- Welcome
- Profile Setup
- Team Invitation
- Preferences
- Dashboard Tour
- First Customer (CRM)
- First Opportunity (Sales)
- First Ticket (Support)
- Complete
```

---

## Integration with Previous Phases

### Phase 1: Multi-Tenant Database
- ✅ OnboardingSession tied to Organization
- ✅ User-specific onboarding sessions
- ✅ organizationId for tenant isolation

### Phase 2: Authentication & Authorization
- ✅ JWT authentication required
- ✅ Role-based access (ORG_ADMIN, ORG_USER, SUPER_ADMIN)
- ✅ User context from JWT token

### Phase 4: User Management
- ✅ Links to user invitation flow
- ✅ Team invitation step in onboarding

### Phase 5: Subscription Management
- ✅ Subscription selection step
- ✅ Trial period awareness

### Phase 6: Payment Integration
- ✅ Payment method setup step
- ✅ Reward credits integration

### Phase 7: Email Notifications
- ✅ Email reminders for incomplete onboarding
- ✅ Help request notifications
- ✅ Completion congratulations email

### Phase 10: Dashboards
- ✅ Dashboard tour step
- ✅ Admin analytics integration

---

## Onboarding Statuses

| Status | Description |
|--------|-------------|
| `not_started` | Session created but not begun |
| `in_progress` | User actively completing onboarding |
| `completed` | All required steps completed |
| `skipped` | User chose to skip onboarding |
| `abandoned` | User stopped before completing |

---

## Best Practices

### 1. Keep It Short
- Minimum required steps only
- 5-8 steps maximum for organization onboarding
- 2-4 steps for user onboarding

### 2. Show Progress
- Clear progress indicator (percentage)
- Visual step indicators
- Celebrate milestones

### 3. Provide Value Early
- Quick wins in checklist
- First tangible result within 5 minutes
- Show immediate benefits

### 4. Make It Skippable
- Allow skipping optional steps
- Provide "Complete Later" option
- Don't force completion

### 5. Offer Help
- In-context help at each step
- Easy access to support
- Video tutorials and documentation

### 6. Measure & Optimize
- Track completion rates
- Identify abandonment points
- A/B test onboarding flows

---

## Usage Examples

### Example 1: New Organization Sign-Up

```bash
# 1. Start organization onboarding
curl -X POST https://api.cognexiaai.com/api/onboarding/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "organization",
    "industry": "Healthcare",
    "companySize": "51-200",
    "primaryUseCase": "Patient Management",
    "interestedFeatures": ["crm", "support"]
  }'

# 2. Complete welcome step
curl -X POST https://api.cognexiaai.com/api/onboarding/<sessionId>/steps/complete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stepType": "welcome",
    "timeSpentMinutes": 2
  }'

# 3. Complete profile setup
curl -X POST https://api.cognexiaai.com/api/onboarding/<sessionId>/steps/complete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stepType": "profile_setup",
    "metadata": {
      "companyName": "HealthCare Pro",
      "website": "https://healthcarepro.com"
    },
    "timeSpentMinutes": 5
  }'

# 4. Skip data import
curl -X POST https://api.cognexiaai.com/api/onboarding/<sessionId>/steps/skip \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stepType": "data_import",
    "reason": "No existing data to import"
  }'

# 5. Claim reward after completion
curl -X POST https://api.cognexiaai.com/api/onboarding/<sessionId>/reward/claim \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rewardType": "free_credits",
    "metadata": {"amount": 100}
  }'
```

### Example 2: New Team Member Onboarding

```bash
# Start user onboarding
curl -X POST https://api.cognexiaai.com/api/onboarding/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "user",
    "primaryUseCase": "Sales Representative"
  }'
```

### Example 3: Check Progress

```bash
# Get current session
curl -X GET https://api.cognexiaai.com/api/onboarding/current \
  -H "Authorization: Bearer <token>"
```

---

## Future Enhancements

1. **Video Tutorials**: Embedded video guides for each step
2. **Interactive Walkthroughs**: Product tours with highlights
3. **AI-Powered Suggestions**: Smart recommendations based on behavior
4. **Multi-Language Support**: Localized onboarding flows
5. **Mobile Optimization**: Native mobile onboarding experience
6. **Progress Sync**: Sync across devices
7. **Team Onboarding**: Collaborative onboarding for teams
8. **Onboarding Templates**: Pre-built flows for different industries
9. **A/B Testing**: Test different onboarding variants
10. **Predictive Abandonment**: Detect and intervene before abandonment

---

## Completion Checklist

- [x] OnboardingSession entity created (218 lines)
- [x] 12 onboarding DTOs created (331 lines)
- [x] OnboardingService implemented (574 lines)
- [x] OnboardingController with 12 endpoints (463 lines)
- [x] Personalized flow generation
- [x] Progress tracking and analytics
- [x] Quick-win checklist system
- [x] Help request functionality
- [x] Abandonment tracking
- [x] Feedback collection
- [x] Reward/gamification system
- [x] TypeScript compilation: **0 errors**
- [x] Integration with Phases 1-10
- [x] Documentation completed

---

## Conclusion

Phase 11 successfully implements a comprehensive onboarding system that:
- **Guides new users** through setup with personalized flows
- **Tracks progress** with detailed analytics
- **Increases activation** through quick wins and rewards
- **Reduces abandonment** with help requests and flexible skipping
- **Provides insights** for continuous improvement

**Status**: ✅ **COMPLETE** (0 TypeScript errors)

**Total Endpoints**: 12  
**Total Lines of Code**: 1,586  
**Build Status**: ✅ Success

The onboarding system is production-ready and integrates seamlessly with all previous phases, providing a smooth first-time user experience that drives platform adoption and user success.
