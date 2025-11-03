# Order Notification System

This notification system provides real-time alerts to restaurant owners when new orders are placed.

## Features

### 1. **Real-time Notifications**
- Pop-up toast notifications appear when a new order is placed
- Sound notification (optional - add notification.mp3 to public folder)
- Visual bell icon with unread count badge

### 2. **Notification Center**
- Click the bell icon in admin header to view all notifications
- Shows order number, customer name, total amount, and timestamp
- Unread notifications are highlighted
- Mark individual notifications as read
- Mark all as read with one click
- Remove notifications individually
- View all orders link

### 3. **Persistent Storage**
- Notifications are stored in localStorage
- Survive page refreshes
- Accessible across browser sessions

## Usage

### For Restaurant Owners:
1. Look for the bell icon (🔔) in the admin header
2. Red badge shows number of unread notifications
3. Click the bell to see all order notifications
4. Click "View Order" to go directly to the orders page
5. Mark notifications as read or remove them

### Technical Implementation:

#### Components:
- `NotificationContext.tsx` - Context provider for managing notifications
- `NotificationBell.tsx` - UI component for displaying notifications
- `NotificationProvider` - Wraps the app to provide notification functionality

#### Integration:
1. Added to `layout.tsx` - Wraps entire application
2. Integrated in `AdminLayout.tsx` - Shows bell icon in admin header
3. Connected to `checkout\page.tsx` - Triggers notification on order creation

## Customization

### Add Notification Sound:
1. Add an MP3 file named `notification.mp3` to the `public` folder
2. The system will automatically play it when new orders arrive
3. Volume is set to 50% by default (adjustable in NotificationContext.tsx)

### Styling:
- Notifications use your theme colors automatically
- Toast notifications have gradient backgrounds with primary color
- Unread notifications are highlighted in the notification center

## Future Enhancements:
- [ ] WebSocket integration for real-time push notifications
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Notification preferences/settings
- [ ] Filter notifications by date/status
- [ ] Export notification history
