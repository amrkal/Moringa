# Testing Checklist for Moringa Restaurant System

## ✅ Feature Testing Progress

### 1. WebSocket Real-Time Updates
- [ ] Backend WebSocket endpoint responding (`/api/v1/ws/admin`)
- [ ] Frontend connects and stays connected (no reconnection loops)
- [ ] Admin receives real-time notifications for new orders
- [ ] Toast notifications appear correctly
- [ ] Browser notifications work (if permission granted)
- [ ] WebSocket reconnection works after connection loss
- [ ] Polling fallback activates when WebSocket fails

**Expected Behavior:**
- Connection opens once and stays open
- No constant reconnect/disconnect cycles
- Notifications arrive instantly when orders are placed

---

### 2. Order Detail Pages

#### Admin Order Detail (`/admin/orders/[orderId]`)
- [ ] Order details load correctly
- [ ] Status history displays properly
- [ ] Status update buttons work
- [ ] Print receipt functionality works
- [ ] Customer information visible
- [ ] Order items with customizations display

#### Customer Order Detail (`/orders/[orderId]`)
- [ ] Customers can view their orders
- [ ] Progress tracker shows correct status
- [ ] Delivery information displays
- [ ] Review form appears for delivered orders
- [ ] Can submit reviews with photos
- [ ] Already reviewed meals show checkmark

**Test Orders:**
1. Create a test order
2. Update status through various stages
3. Mark as delivered
4. Submit review as customer

---

### 3. Analytics & Reports

#### Dashboard Visualizations
- [ ] Daily sales chart (AreaChart) renders
- [ ] Peak hours chart (BarChart) shows data
- [ ] Order types pie chart displays
- [ ] Popular meals chart populates
- [ ] Order status distribution visible
- [ ] All charts are responsive

#### Export Features
- [ ] CSV export downloads correctly
- [ ] CSV contains accurate data
- [ ] PDF export generates successfully
- [ ] PDF includes all tables and formatting
- [ ] Export buttons disable when no data

**Test Data Required:**
- Multiple orders across different days
- Various order types (delivery, dine-in, takeaway)
- Orders at different hours
- Different meal orders

---

### 4. Reviews & Ratings System

#### Customer Review Submission
- [ ] Star rating selector works
- [ ] Comment textarea accepts input
- [ ] Photo upload accepts images (max 5)
- [ ] Photo preview displays correctly
- [ ] Can remove photos before submit
- [ ] Form validation works (rating required, comment required)
- [ ] Verified purchase badge shows for order-based reviews
- [ ] Review submits successfully
- [ ] Can only review each meal once

#### Rating Display on Menu
- [ ] Ratings show on meal cards (mobile view)
- [ ] Ratings show on meal cards (desktop view)
- [ ] Average rating calculates correctly
- [ ] Review count displays
- [ ] Ratings only show when reviews exist

#### Admin Review Moderation (`/admin/reviews`)
- [ ] All reviews load in dashboard
- [ ] Filter by status works (All/Pending/Approved/Rejected/Flagged)
- [ ] Search functionality filters reviews
- [ ] Can approve pending reviews
- [ ] Can reject reviews with notes
- [ ] Can flag inappropriate reviews
- [ ] Can respond to approved reviews
- [ ] Can delete reviews
- [ ] Admin responses display to customers
- [ ] Moderation notes save correctly

**Test Scenarios:**
1. Customer submits review with photos
2. Admin approves/rejects review
3. Admin responds to review
4. Customer marks review helpful/unhelpful
5. Admin flags inappropriate content

---

## 🐛 Known Issues to Check

### WebSocket Connection
- [x] **FIXED**: Reconnecting every second (dependency issue in useEffect)
- [ ] Verify fix: Connection should stay open indefinitely
- [ ] Check browser console for connection logs

### Performance
- [ ] Large datasets (100+ orders) load reasonably fast
- [ ] Image uploads don't timeout
- [ ] Charts render smoothly
- [ ] No memory leaks from WebSocket

### Edge Cases
- [ ] What happens with no data?
- [ ] How does system handle network errors?
- [ ] Do modals close properly?
- [ ] Are loading states shown correctly?

---

## 🧪 Testing Steps

### Quick Smoke Test (5 minutes)
1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `cd moringa && npm run dev`
3. Open admin dashboard
4. Check console for WebSocket connection (should connect once)
5. Navigate to different pages (orders, reviews, analytics)
6. Verify no errors in console

### Full Feature Test (30 minutes)
1. **Setup Test Data**
   - Create 3-5 test orders
   - Add various meals to orders
   - Use different order types and times

2. **Test Order Flow**
   - Place order as customer
   - Receive notification as admin
   - Update order status
   - Mark as delivered

3. **Test Reviews**
   - Submit review as customer (with photos)
   - Moderate review as admin
   - Respond to review
   - Verify rating appears on menu

4. **Test Analytics**
   - View dashboard charts
   - Export CSV report
   - Export PDF report
   - Verify data accuracy

5. **Test WebSocket**
   - Keep admin dashboard open
   - Place new order in another tab
   - Verify instant notification
   - Check connection stays open

---

## 📊 Success Criteria

### Must Have
- ✅ WebSocket stays connected (no reconnection loops)
- ✅ Real-time notifications work
- ✅ All CRUD operations function
- ✅ No console errors on normal operations
- ✅ Responsive design works on mobile

### Nice to Have
- ✅ Smooth animations
- ✅ Professional UI/UX
- ✅ Helpful error messages
- ✅ Loading states everywhere

---

## 🚀 Ready for Production Checklist

- [ ] All features tested and working
- [ ] WebSocket connection stable
- [ ] No memory leaks
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Environment variables configured
- [ ] API endpoints secured
- [ ] Rate limiting considered
- [ ] Backup strategy in place

---

## 📝 Testing Notes

**Date:** November 4, 2025

**Issues Found:**
1. ✅ WebSocket reconnecting every second - FIXED (removed dependencies from useEffect)
2. [ ] [Add any issues you find during testing]

**Performance Observations:**
- [Note any performance issues]
- [Database query times]
- [Page load times]

**Browser Compatibility:**
- Chrome: [ ] Tested
- Firefox: [ ] Tested  
- Safari: [ ] Tested
- Edge: [ ] Tested

---

## Next Steps After Testing

1. Fix any critical bugs found
2. Optimize slow queries
3. Add missing error handling
4. Implement requested enhancements
5. Document API endpoints
6. Prepare deployment guide
