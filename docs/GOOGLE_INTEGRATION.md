# Google Apps Integration - MOHR HR System

## 🎯 Overview

This document outlines the planned Google Apps integration for the MOHR HR System, including authentication, calendar sync, and document management.

## 🚀 Integration Phases

### Phase 1: Google OAuth Authentication (Priority: High)
**Timeline:** After core system completion
**Features:**
- Google Sign-In for users
- Automatic user creation from Google accounts
- Profile sync (name, email, photo)
- Single Sign-On (SSO) capability

**Benefits:**
- Easier user onboarding
- Reduced password management
- Professional authentication experience

### Phase 2: Google Calendar Integration (Priority: Medium)
**Timeline:** After Phase 1
**Features:**
- Sync employee leave requests with Google Calendar
- Create calendar events for meetings/interviews
- Team calendar view
- Automatic calendar invites

**Benefits:**
- Seamless scheduling
- Better team coordination
- Reduced double-booking

### Phase 3: Google Drive Integration (Priority: Low)
**Timeline:** After Phase 2
**Features:**
- Store employee documents in Google Drive
- Automatic backup of HR files
- Document sharing and collaboration
- Version control for important documents

**Benefits:**
- Secure document storage
- Easy sharing and collaboration
- Automatic backups

## 🏗️ Technical Architecture

### Database Schema Updates

```sql
-- Add Google integration fields to users table
ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN google_email TEXT;
ALTER TABLE users ADD COLUMN google_photo_url TEXT;
ALTER TABLE users ADD COLUMN google_access_token TEXT;
ALTER TABLE users ADD COLUMN google_refresh_token TEXT;
ALTER TABLE users ADD COLUMN google_token_expiry DATETIME;
ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local';

-- Add Google calendar sync table
CREATE TABLE google_calendar_sync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    calendar_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    sync_type TEXT NOT NULL, -- 'leave_request', 'meeting', 'interview'
    local_record_id INTEGER NOT NULL,
    last_sync DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add Google drive sync table
CREATE TABLE google_drive_sync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    file_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    local_record_id INTEGER NOT NULL,
    sync_type TEXT NOT NULL, -- 'employee_document', 'hr_policy', 'contract'
    last_sync DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### API Endpoints (Future)

```javascript
// Authentication
POST /api/auth/google/login
POST /api/auth/google/callback
POST /api/auth/google/connect
POST /api/auth/google/disconnect

// Calendar Integration
GET /api/google/calendar/events
POST /api/google/calendar/events
PUT /api/google/calendar/events/:id
DELETE /api/google/calendar/events/:id
POST /api/google/calendar/sync-leave-request

// Drive Integration
GET /api/google/drive/files
POST /api/google/drive/upload
GET /api/google/drive/files/:id
DELETE /api/google/drive/files/:id
POST /api/google/drive/sync-document
```

### Environment Configuration

```javascript
// config/environment.js additions
google: {
  enabled: false, // Master switch
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive.file'
  ],
  calendar: {
    enabled: false,
    defaultCalendarId: 'primary'
  },
  drive: {
    enabled: false,
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || ''
  }
}
```

## 🔧 Implementation Plan

### Step 1: Setup Google Cloud Project
1. Create Google Cloud Project
2. Enable Google+ API, Calendar API, Drive API
3. Create OAuth 2.0 credentials
4. Configure authorized redirect URIs

### Step 2: Backend Implementation
1. Add Google OAuth routes
2. Implement token management
3. Add user profile sync
4. Create Google service modules

### Step 3: Frontend Implementation
1. Add Google Sign-In button
2. Implement OAuth flow
3. Add Google account management UI
4. Create calendar/drive integration components

### Step 4: Testing & Deployment
1. Test OAuth flow
2. Test calendar sync
3. Test drive integration
4. Deploy with feature flags

## 🔒 Security Considerations

### OAuth Security
- Store tokens securely (encrypted)
- Implement token refresh logic
- Handle token expiration gracefully
- Validate Google tokens on each request

### Data Privacy
- Only request necessary scopes
- Implement proper data retention
- Allow users to disconnect Google accounts
- Comply with GDPR/privacy regulations

### API Security
- Rate limiting for Google API calls
- Error handling for API failures
- Fallback to local authentication
- Secure storage of API credentials

## 📱 Mobile Considerations

### PWA Integration
- Google Sign-In works in PWA
- Calendar sync available on mobile
- Drive access through mobile browser
- Offline capability for basic features

### Native App Features
- Google Sign-In SDK integration
- Calendar app integration
- File picker integration
- Push notifications for calendar events

## 🚀 Deployment Strategy

### Feature Flags
```javascript
// Enable/disable Google features per environment
const config = {
  development: {
    google: { enabled: false }
  },
  local_network: {
    google: { enabled: false }
  },
  production: {
    google: { enabled: true }
  }
};
```

### Gradual Rollout
1. **Phase 1:** Google OAuth only (admin users)
2. **Phase 2:** Google OAuth for all users
3. **Phase 3:** Calendar integration (beta)
4. **Phase 4:** Calendar integration (full)
5. **Phase 5:** Drive integration (beta)
6. **Phase 6:** Drive integration (full)

## 📊 Monitoring & Analytics

### Key Metrics
- Google OAuth success rate
- Calendar sync success rate
- Drive sync success rate
- API error rates
- User adoption rates

### Logging
- OAuth flow logs
- API call logs
- Error logs with context
- Performance metrics

## 🔄 Maintenance

### Regular Tasks
- Monitor Google API quotas
- Update Google API libraries
- Review and rotate API keys
- Backup Google integration data
- Monitor for API deprecations

### Updates
- Google API version updates
- OAuth flow improvements
- New Google features integration
- Security updates

---

**Note:** This integration will be implemented as a separate module to maintain the modular architecture of the MOHR system. 