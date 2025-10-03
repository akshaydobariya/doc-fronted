# MediSync Color System 🎨

## Primary Colors

### Indigo/Purple Gradient (Main Brand)
Used for: Primary buttons, AppBar (Doctor), main accents
```css
linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)
```
- **Primary Main**: `#6366F1` (Indigo)
- **Primary Light**: `#818CF8`
- **Primary Dark**: `#4F46E5`

### Teal/Cyan Gradient (Patient Theme)
Used for: Patient dashboard, secondary elements
```css
linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)
```
- **Secondary Main**: `#14B8A6` (Teal)
- **Secondary Light**: `#5EEAD4`
- **Secondary Dark**: `#0F766E`

## Accent Colors

### Purple
```
#A855F7
```
Use for: Special highlights, premium features

### Pink
```
#EC4899
```
Use for: Female-related features, alerts

### Orange
```
#F97316
```
Use for: Warnings, time-sensitive items

### Emerald
```
#10B981
```
Use for: Success states, confirmations

## Neutral Colors (Grays)

```css
50:  #F9FAFB  /* Lightest - backgrounds */
100: #F3F4F6  /* Light backgrounds */
200: #E5E7EB  /* Borders, dividers */
300: #D1D5DB  /* Disabled borders */
400: #9CA3AF  /* Disabled text */
500: #6B7280  /* Secondary text */
600: #4B5563  /* Primary text (light) */
700: #374151  /* Headings */
800: #1F2937  /* Dark headings */
900: #111827  /* Darkest - main text */
```

## Status Colors

### Success
```
Main:  #10B981
Light: #34D399
Dark:  #059669
```
**Gradient**: `linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)`

### Error
```
Main:  #EF4444
Light: #F87171
Dark:  #DC2626
```
**Gradient**: `linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)`

### Warning
```
Main:  #F59E0B
Light: #FBBF24
Dark:  #D97706
```
**Gradient**: `linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)`

### Info
```
Main:  #3B82F6
Light: #60A5FA
Dark:  #2563EB
```
**Gradient**: `linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)`

## Background Colors

### Default Background
```css
background: linear-gradient(135deg, #F9FAFB 0%, #EFF6FF 100%)
```

### Paper Background
```
#FFFFFF (Pure white)
```

### Section Backgrounds

#### Calendar View
```css
linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)
```

#### Booking Section (Patient)
```css
linear-gradient(135deg, #FFFFFF 0%, #F0FDFA 100%)
```

#### Available Slots
```css
linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)
```

#### Appointments Section
```css
linear-gradient(135deg, #FFFFFF 0%, #FEF3C7 100%)
```

## Glassmorphism

### Standard Glass Effect
```css
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.3);
box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
```

### AppBar Glass Elements
```css
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(10px);
```

## Shadows

### Elevation System
```
0: none
1: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
2: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
3: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
4: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
5: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
6: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Special Shadows

#### Button Hover
```css
box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
```

#### Card Hover
```css
box-shadow: 0 12px 24px rgba(99, 102, 241, 0.15);
```

#### Primary Card Hover
```css
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## Usage Examples

### Primary Button
```jsx
<Button
  sx={{
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    '&:hover': {
      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
    }
  }}
>
  Click Me
</Button>
```

### Card with Hover
```jsx
<Card
  sx={{
    borderRadius: 3,
    border: '2px solid',
    borderColor: 'divider',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: 'primary.main',
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 24px rgba(99, 102, 241, 0.15)',
    }
  }}
>
  Content
</Card>
```

### Gradient Text
```jsx
<Typography
  sx={{
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }}
>
  Gradient Text
</Typography>
```

## Border Radius

- **Small**: `8px` - Chips, small buttons
- **Medium**: `10px` - Input fields, standard buttons
- **Large**: `12px` - Cards, alerts
- **Extra Large**: `16px` - Special cards, featured content

## Accessibility

### Contrast Ratios (WCAG AA)
- ✅ Text on white background: Gray 900 (#111827)
- ✅ Secondary text: Gray 600 (#4B5563)
- ✅ Primary button text: White (#FFFFFF) on Indigo (#6366F1)
- ✅ Success alerts: Dark text on light green background
- ✅ Error alerts: Dark text on light red background

### Focus States
```css
outline: 2px solid #6366F1;
outline-offset: 2px;
```

---

## Quick Reference

**Login Background**: `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)`

**Doctor AppBar**: `linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)`

**Patient AppBar**: `linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)`

**Page Background**: `linear-gradient(135deg, #F9FAFB 0%, #EFF6FF 100%)`

---

**Design System Version**: 1.0
**Last Updated**: 2025
