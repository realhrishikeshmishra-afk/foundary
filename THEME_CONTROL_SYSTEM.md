# Theme Control System

## Overview
The application now supports dynamic theme switching between two themes:
1. **Light Theme** - Yellow & White (bright, modern)
2. **Dark Theme** - Gold & Black (elegant, sophisticated)

## Features

### Admin Control
- Theme can be changed from **Admin Settings** page
- Changes apply **immediately** across the entire website
- Theme preference is **saved to database**
- Persists across sessions and devices

### Two Available Themes

#### 1. Light Theme (Yellow & White)
- **Background**: Light cream/white (`hsl(48 100% 98%)`)
- **Text**: Dark gray (`hsl(40 10% 15%)`)
- **Primary**: Bright yellow (`hsl(45 100% 50%)`)
- **Cards**: Pure white with subtle shadows
- **Best for**: Modern, clean, professional look

#### 2. Dark Theme (Gold & Black)
- **Background**: Deep dark (`hsl(240 6% 7%)`)
- **Text**: Light cream (`hsl(40 20% 92%)`)
- **Primary**: Warm gold (`hsl(45 100% 58%)`)
- **Cards**: Dark with gold accents
- **Best for**: Elegant, premium, sophisticated look

## How It Works

### 1. Theme Context (`src/contexts/ThemeContext.tsx`)
- Manages theme state globally
- Loads theme from database on app start
- Applies CSS variables dynamically
- Saves theme changes to database

### 2. Theme Provider
Wraps the entire app in `App.tsx`:
```tsx
<ThemeProvider>
  <CurrencyProvider>
    {/* Rest of app */}
  </CurrencyProvider>
</ThemeProvider>
```

### 3. Admin Settings Integration
- New "Appearance" section in Admin Settings
- Dropdown selector with visual previews
- Instant theme switching
- No page reload required

## Usage

### For Admins
1. Go to **Admin → Settings**
2. Scroll to **Appearance** section
3. Select theme from dropdown:
   - Light (Yellow & White)
   - Dark (Gold & Black)
4. Theme changes **immediately**

### For Developers
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  // Get current theme
  console.log(theme); // 'light' or 'dark'
  
  // Change theme
  setTheme('dark');
}
```

## Technical Details

### CSS Variables
All colors use CSS custom properties that are updated dynamically:
- `--background`
- `--foreground`
- `--primary`
- `--card`
- `--border`
- etc.

### Database Storage
Theme is stored in `site_settings` table:
- **Key**: `site_theme`
- **Value**: `'light'` or `'dark'`

### Performance
- Theme loads on app initialization
- Changes apply instantly via CSS variables
- No component re-renders needed
- Minimal performance impact

## Files Created/Modified

### New Files
- `src/contexts/ThemeContext.tsx` - Theme management context

### Modified Files
- `src/App.tsx` - Added ThemeProvider
- `src/pages/admin/AdminSettings.tsx` - Added theme selector
- `src/index.css` - CSS variables for both themes

## Benefits

1. **User Choice**: Admins can choose the theme that fits their brand
2. **Instant Updates**: No page reload or deployment needed
3. **Consistent**: All pages use the same theme automatically
4. **Persistent**: Theme choice is saved and remembered
5. **Easy to Extend**: Can add more themes in the future

## Future Enhancements

Possible additions:
- Custom color picker for primary color
- More theme presets
- Per-user theme preferences
- Scheduled theme changes (day/night)
- Theme preview before applying