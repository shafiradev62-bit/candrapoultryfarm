# 🧪 Quick Testing Guide - Landscape Mobile View

## 🚀 Quick Start Testing

### Using Chrome DevTools (Recommended)

1. **Open DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

2. **Enable Device Toolbar**
   - Click device icon or press `Ctrl+Shift+M`
   - Or click "Toggle device toolbar"

3. **Test Portrait Mode**
   - Select device: "iPhone 12 Pro"
   - Orientation: Portrait
   - **Expected:** See purple overlay with "Putar Perangkat Anda"
   - **Expected:** Dashboard hidden

4. **Test Landscape Mode**
   - Click rotation icon or select "Landscape"
   - **Expected:** Full desktop layout visible
   - **Expected:** Sidebar on left, content scaled to fit
   - **Expected:** All tables visible without vertical overflow

5. **Test Different Sizes**
   ```
   Device              Width x Height    Expected Result
   ─────────────────────────────────────────────────────
   iPhone SE           667 x 375         Scaled, compact
   iPhone 12           844 x 390         Scaled, readable
   iPhone 14 Pro Max   932 x 430         Scaled, comfortable
   iPad Mini          1024 x 768         Minimal scaling
   Galaxy S21          800 x 360         Scaled, very compact
   ```

---

## 📱 Testing on Real Device

### iOS (Safari)

1. **Enable Web Inspector**
   - Settings → Safari → Advanced → Web Inspector

2. **Connect to Mac**
   - Connect iPhone via USB
   - Open Safari on Mac → Develop → [Your iPhone]

3. **Test Rotation**
   - Hold phone in portrait → See overlay
   - Rotate to landscape → See dashboard
   - Check if layout fits without scrolling vertically

### Android (Chrome)

1. **Enable USB Debugging**
   - Settings → Developer Options → USB Debugging

2. **Connect to Computer**
   - Open Chrome → `chrome://inspect`
   - Select your device

3. **Test Rotation**
   - Portrait → Overlay visible
   - Landscape → Dashboard fits screen

---

## ✅ Checklist for Each Test

### Portrait Mode (< 768px width)
- [ ] Purple gradient overlay visible
- [ ] Rotation icon animating
- [ ] Message "Putar Perangkat Anda" displayed
- [ ] Dashboard completely hidden
- [ ] No scrolling possible

### Landscape Mode (Height ≤ 768px)
- [ ] Sidebar visible (180px width)
- [ ] Header visible (2.5rem height)
- [ ] Main content fits viewport height
- [ ] No vertical scrollbar on main container
- [ ] Tables scroll horizontally if needed
- [ ] All text readable (min 0.65rem)
- [ ] Buttons tappable (min 1.75rem)
- [ ] Forms usable
- [ ] Modals fit in viewport

### Specific Components

#### Sidebar
- [ ] Logo visible
- [ ] Navigation items readable
- [ ] Icons properly sized
- [ ] Role selector functional
- [ ] Logout button accessible

#### Tables
- [ ] Headers visible
- [ ] All columns present (no hiding)
- [ ] Text doesn't wrap awkwardly
- [ ] Horizontal scroll smooth
- [ ] Action buttons clickable
- [ ] Row height appropriate

#### Forms
- [ ] Input fields accessible
- [ ] Calendar picker opens correctly
- [ ] Dropdowns functional
- [ ] Buttons properly sized
- [ ] Labels readable

#### Cards/Stats
- [ ] Summary cards visible
- [ ] Numbers readable
- [ ] Icons properly sized
- [ ] Grid layout maintained

---

## 🎯 Expected Behavior by Screen Size

### Very Small (Height ≤ 400px)
```
Viewport: width=1280, scale=0.6-0.7
CSS Transform: scale(0.75)
Sidebar: 150px
Header: 2rem
Table font: 0.6rem
```

### Small (Height 401-500px)
```
Viewport: width=1280, scale=0.7-0.8
CSS Transform: scale(0.85)
Sidebar: 180px
Header: 2.5rem
Table font: 0.65rem
```

### Medium (Height 501-768px)
```
Viewport: width=1280, scale=0.8-1.0
CSS Transform: none
Sidebar: 180px
Header: 2.5rem
Table font: 0.65rem
```

---

## 🐛 Common Issues & Quick Fixes

### Issue: Overlay doesn't show in portrait
**Check:**
```javascript
// In browser console:
window.matchMedia('(orientation: portrait)').matches
// Should return true in portrait
```

**Fix:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check if CSS loaded

### Issue: Layout not scaling in landscape
**Check:**
```javascript
// In browser console:
document.getElementById('viewport-meta').getAttribute('content')
// Should show: width=1280, initial-scale=...
```

**Fix:**
- Check JavaScript console for errors
- Verify `adjustViewportForLandscape()` runs
- Test manually: `adjustViewportForLandscape()`

### Issue: Text too small to read
**Quick Fix:**
```css
/* Add to browser DevTools:
table { font-size: 0.75rem !important; }
```

**Permanent Fix:**
- Edit `landscape-mobile.css`
- Increase font sizes
- Adjust viewport scale

### Issue: Buttons too small to tap
**Quick Fix:**
```css
/* Add to browser DevTools:
button { min-height: 44px !important; }
```

**Permanent Fix:**
- Edit `landscape-mobile.css`
- Increase button heights
- Add more padding

---

## 📊 Performance Testing

### Metrics to Check

1. **Page Load Time**
   - Target: < 3 seconds
   - Check: Network tab in DevTools

2. **Orientation Change Speed**
   - Target: < 500ms
   - Check: Performance tab

3. **Scroll Performance**
   - Target: 60fps
   - Check: Rendering tab → FPS meter

4. **Memory Usage**
   - Target: < 100MB
   - Check: Memory tab

### Performance Commands
```javascript
// In browser console:

// Check current scale
window.devicePixelRatio

// Check viewport size
console.log(window.innerWidth, window.innerHeight)

// Check if landscape
window.matchMedia('(orientation: landscape)').matches

// Force reflow (test performance)
document.getElementById('root').offsetHeight

// Check CSS loaded
document.styleSheets.length
```

---

## 🎨 Visual Regression Testing

### Screenshots to Capture

1. **Portrait Mode**
   - Full screen overlay
   - Rotation icon visible

2. **Landscape - Dashboard**
   - Sidebar + main content
   - Stats cards
   - Table visible

3. **Landscape - Daily Report**
   - Form inputs
   - Calendar picker
   - Table with data

4. **Landscape - Warehouse**
   - Stock cards
   - Alert indicators
   - Table

5. **Landscape - Modals**
   - Dialog open
   - Form inside modal
   - Buttons accessible

### Compare Against
- Desktop view (1280px+)
- Tablet view (768-1024px)
- Previous mobile version

---

## 🔍 Debugging Tools

### Browser Console Commands

```javascript
// Check orientation
console.log('Orientation:', screen.orientation?.type || 'unknown')
console.log('Is Landscape:', window.matchMedia('(orientation: landscape)').matches)

// Check viewport
const meta = document.getElementById('viewport-meta')
console.log('Viewport:', meta?.getAttribute('content'))

// Check CSS classes
const root = document.getElementById('root')
console.log('Classes:', root?.className)

// Check dimensions
console.log('Window:', window.innerWidth, 'x', window.innerHeight)
console.log('Screen:', screen.width, 'x', screen.height)

// Force landscape mode (for testing)
document.body.classList.add('landscape-mode')
document.getElementById('root').classList.add('landscape-mode', 'landscape-md')

// Force portrait overlay (for testing)
document.getElementById('portrait-overlay').style.display = 'flex'
document.getElementById('root').style.display = 'none'
```

### CSS Debugging

```css
/* Add to DevTools to highlight elements:
* { outline: 1px solid red !important; }
[data-sidebar] { outline: 2px solid blue !important; }
table { outline: 2px solid green !important; }
```

---

## 📝 Test Report Template

```markdown
## Test Report - Landscape Mobile View

**Date:** [Date]
**Tester:** [Name]
**Device:** [Device Name]
**Browser:** [Browser + Version]
**Screen Size:** [Width x Height]

### Portrait Mode
- [ ] Overlay visible: YES / NO
- [ ] Message readable: YES / NO
- [ ] Animation working: YES / NO
- [ ] Dashboard hidden: YES / NO

### Landscape Mode
- [ ] Layout fits screen: YES / NO
- [ ] Sidebar visible: YES / NO
- [ ] Tables readable: YES / NO
- [ ] Forms usable: YES / NO
- [ ] Buttons tappable: YES / NO

### Issues Found
1. [Issue description]
2. [Issue description]

### Screenshots
- [Attach screenshots]

### Notes
[Additional observations]
```

---

## 🎓 Pro Tips

1. **Use Real Devices**
   - Emulators don't always match real behavior
   - Touch interactions differ
   - Performance varies

2. **Test Multiple Browsers**
   - Chrome/Edge (Chromium)
   - Safari (WebKit)
   - Firefox (Gecko)

3. **Test Rotation Transitions**
   - Smooth animation
   - No layout jumps
   - Content preserved

4. **Test with Content**
   - Empty tables vs full tables
   - Long text vs short text
   - Many rows vs few rows

5. **Test Edge Cases**
   - Very small phones (< 360px)
   - Tablets in landscape
   - Foldable devices
   - Split-screen mode

---

**Happy Testing! 🚀**
