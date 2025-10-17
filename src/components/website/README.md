# Website Components

This directory contains components for building public-facing website pages using Destack page builder.

## PageBuilder.js

The main Destack page builder component. This provides the visual editor interface for creating and editing pages.

**Usage:**
- Protected route (doctors/admins only)
- Access at: `/page-builder`
- Automatically saves changes to backend

**Features:**
- Drag-and-drop interface
- Pre-built component library
- Tailwind CSS styling
- Real-time preview
- Auto-save functionality

## Creating New Page Types

To create additional page types (e.g., About, Services, Contact):

1. Create a new component file:
```javascript
// BlogPage.js
import React from 'react';
import { ContentProviderReact } from 'destack';

const BlogPage = () => {
  return <ContentProviderReact showEditorInProd={false} />;
};

export default BlogPage;
```

2. Add route in App.js:
```javascript
<Route path="/blog" element={<BlogPage />} />
```

3. Edit via builder:
```
/page-builder?name=blog
```

4. View at:
```
/blog
```

## Best Practices

- Keep page-specific components in this directory
- Use semantic component names
- Document any custom props or configuration
- Test pages in both development and production builds
