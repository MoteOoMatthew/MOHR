const express = require('express');
const { google } = require('googleapis');
const { runQuery, getRow, getAll } = require('../database/init');

const router = express.Router();

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Initialize Google Calendar API
const getGoogleCalendar = (accessToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
};

// Get user's Google Calendar events
router.get('/calendar/events', verifyToken, async (req, res) => {
  try {
    const { accessToken, calendarId = 'primary', maxResults = 10 } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Google access token is required' });
    }
    
    const calendar = getGoogleCalendar(accessToken);
    
    const response = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: parseInt(maxResults),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const events = response.data.items || [];
    
    res.json({
      events: events.map(event => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        attendees: event.attendees
      }))
    });
    
  } catch (error) {
    console.error('Google Calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Create Google Calendar event
router.post('/calendar/events', verifyToken, async (req, res) => {
  try {
    const { accessToken, summary, description, startTime, endTime, location, attendees } = req.body;
    
    if (!accessToken || !summary || !startTime || !endTime) {
      return res.status(400).json({ 
        error: 'Access token, summary, start time, and end time are required' 
      });
    }
    
    const calendar = getGoogleCalendar(accessToken);
    
    const event = {
      summary,
      description,
      location,
      start: {
        dateTime: startTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC'
      },
      attendees: attendees ? attendees.map(email => ({ email })) : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });
    
    // Store event in our database
    await runQuery(`
      INSERT INTO google_calendar_events 
      (google_event_id, employee_id, event_title, event_description, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      response.data.id,
      req.user.userId,
      summary,
      description,
      startTime,
      endTime
    ]);
    
    res.status(201).json({
      message: 'Event created successfully',
      event: response.data
    });
    
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// Update Google Calendar event
router.put('/calendar/events/:eventId', verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { accessToken, summary, description, startTime, endTime, location } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Google access token is required' });
    }
    
    const calendar = getGoogleCalendar(accessToken);
    
    const event = {
      summary,
      description,
      location,
      start: {
        dateTime: startTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC'
      }
    };
    
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: event
    });
    
    // Update event in our database
    await runQuery(`
      UPDATE google_calendar_events 
      SET event_title = ?, event_description = ?, start_time = ?, end_time = ?
      WHERE google_event_id = ?
    `, [summary, description, startTime, endTime, eventId]);
    
    res.json({
      message: 'Event updated successfully',
      event: response.data
    });
    
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

// Delete Google Calendar event
router.delete('/calendar/events/:eventId', verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Google access token is required' });
    }
    
    const calendar = getGoogleCalendar(accessToken);
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    });
    
    // Remove event from our database
    await runQuery('DELETE FROM google_calendar_events WHERE google_event_id = ?', [eventId]);
    
    res.json({ message: 'Event deleted successfully' });
    
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

// Get user's stored calendar events
router.get('/calendar/stored-events', verifyToken, async (req, res) => {
  try {
    const events = await getAll(`
      SELECT * FROM google_calendar_events 
      WHERE employee_id = ? 
      ORDER BY start_time DESC
    `, [req.user.userId]);
    
    res.json({ events });
    
  } catch (error) {
    console.error('Get stored events error:', error);
    res.status(500).json({ error: 'Failed to fetch stored events' });
  }
});

// Sync Google Calendar with our database
router.post('/calendar/sync', verifyToken, async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Google access token is required' });
    }
    
    const calendar = getGoogleCalendar(accessToken);
    
    // Get events from Google Calendar
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const googleEvents = response.data.items || [];
    
    // Get our stored events
    const storedEvents = await getAll(
      'SELECT google_event_id FROM google_calendar_events WHERE employee_id = ?',
      [req.user.userId]
    );
    
    const storedEventIds = storedEvents.map(e => e.google_event_id);
    
    // Find new events to store
    const newEvents = googleEvents.filter(event => !storedEventIds.includes(event.id));
    
    // Store new events
    for (const event of newEvents) {
      await runQuery(`
        INSERT INTO google_calendar_events 
        (google_event_id, employee_id, event_title, event_description, start_time, end_time)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        event.id,
        req.user.userId,
        event.summary,
        event.description,
        event.start?.dateTime || event.start?.date,
        event.end?.dateTime || event.end?.date
      ]);
    }
    
    res.json({
      message: 'Calendar synced successfully',
      newEventsCount: newEvents.length,
      totalEvents: googleEvents.length
    });
    
  } catch (error) {
    console.error('Calendar sync error:', error);
    res.status(500).json({ error: 'Failed to sync calendar' });
  }
});

// Get Google Drive files (basic implementation)
router.get('/drive/files', verifyToken, async (req, res) => {
  try {
    const { accessToken, maxResults = 10 } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Google access token is required' });
    }
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    
    oauth2Client.setCredentials({
      access_token: accessToken
    });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const response = await drive.files.list({
      pageSize: parseInt(maxResults),
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime)'
    });
    
    res.json({
      files: response.data.files || []
    });
    
  } catch (error) {
    console.error('Google Drive error:', error);
    res.status(500).json({ error: 'Failed to fetch Drive files' });
  }
});

module.exports = router; 