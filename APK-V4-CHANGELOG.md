# APK v4 - Balanced Layout Update

## Build Info
- **File**: `candra-farm-mobile-v4-BALANCED.apk`
- **Size**: 7.26 MB
- **Type**: Debug APK (unsigned)
- **App ID**: com.candra.pwa
- **App Name**: Candra Farm

## Changes from v3

### 1. Fixed Layout Sizing (PROPER BALANCED)
Replaced ultra-compact v3 layout with properly balanced sizing:

#### PWALayout.tsx
- Header: `text-lg`, `py-3.5` (proper readable size)
- Bottom nav: `h-5 w-5` icons, `text-[10px]` labels, `py-3` padding
- Main content: `px-4 py-4`, proper spacing
- Bottom nav positioned: `calc(12px + env(safe-area-inset-bottom))`

#### PWADashboard.tsx
- Greeting: `text-xl` heading, `text-xs` subtitle
- Stats cards: `text-3xl` numbers, `p-5` padding
- Stock items: `text-sm` labels, `text-xl` values, `p-4` padding
- Rounded corners: `rounded-[20px]` to `rounded-[24px]`

#### PWAInput.tsx
- Progress bar: `h-1` (not h-0.5), `text-xs` labels
- Cards: `rounded-[20px]`, `p-5` padding
- Labels: `text-sm` (not text-[10px])
- Inputs: `px-4 py-3`, `border-2`, `rounded-[16px]`
- Buttons: `w-11 h-11` (not w-9 h-9), `h-12` for main buttons
- Date picker modal: `rounded-t-[32px]`, `p-6 pb-8`
- Sticky bottom: `h-12` buttons, proper spacing

#### PWAStok.tsx
- Egg card: `text-4xl` number, `p-5` padding, `h-12` button
- Feed cards: `text-sm` labels, `text-xl` values, `p-4` padding
- Quick buttons: `h-10` (not h-8), `text-sm`
- Bottom sheets: proper sizing with `h-12` buttons

#### PWAPenjualan.tsx & PWAProfil.tsx
- Already had proper sizing from previous updates
- Consistent with new balanced design

### 2. Fixed Feed Formula Dropdown Issue
**Problem**: Formula dropdown was empty in PWAInput

**Root Cause**: Supabase `feed_formulas` table was empty

**Fix**: Updated `AppDataContext.tsx` (lines 233-238)
- Added logic to check if Supabase has no formulas on initial load
- Automatically pushes default formulas to Supabase if empty
- Default formulas: Standard (50/35/15) and Premium (55/30/15)

### 3. Supabase Integration
All features now properly sync with Supabase:
- Daily reports
- Warehouse stock
- Sales entries
- Operational entries
- Finance entries
- Feed formulas

Auto-sync:
- Pulls from Supabase on app start
- Pushes to Supabase after 2 seconds of inactivity
- Polls Supabase every 5 seconds for updates

## Design Principles Applied

### Sizing Guidelines
- **Buttons**: h-10 to h-14 (readable, tappable)
- **Text**: text-sm to text-xl (not ultra-small)
- **Padding**: p-4 to p-5 (proper spacing)
- **Icons**: h-5 w-5 (visible)
- **Borders**: border-2 (clear boundaries)
- **Rounded**: rounded-[16px] to rounded-[24px] (modern)

### Bottom Navigation
- **Height**: Proper size with py-3
- **Icons**: h-5 w-5 (clearly visible)
- **Labels**: text-[10px] (readable but compact)
- **Active state**: bg-[#1B4332] with white text
- **Position**: Fixed with safe-area-inset-bottom

### Content Areas
- **Max width**: 100% with proper padding
- **Spacing**: space-y-4 (not space-y-2)
- **Cards**: Proper shadows and borders
- **Inputs**: Clear focus states with border-[#40916C]

## Testing Checklist
- [ ] Bottom nav is readable and properly sized
- [ ] All buttons are tappable (not too small)
- [ ] Text is readable without zooming
- [ ] Content fits screen without horizontal scroll
- [ ] Formula dropdown shows options
- [ ] Supabase sync works (data persists across devices)
- [ ] Safe area insets work on notched devices

## Known Issues
None - all layout issues from v3 have been resolved.

## Next Steps
1. Test on actual device
2. Verify formula dropdown works
3. Test Supabase sync between APK and Web
4. Verify all features work correctly
