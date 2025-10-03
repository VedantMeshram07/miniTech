# Image Assets

This directory contains logo images and other visual assets for the TechFest website.

## Required Images:

### Logos

- `college-logo.png` - GCOEJ College logo (recommended: 150x150px, PNG with transparent background)
- `event-logo.png` - TechCarvaan event logo (recommended: 150x150px, PNG with transparent background)

### Event Images

- Event poster images will be uploaded through the admin panel
- Recommended size: 400x300px (4:3 aspect ratio)
- Format: JPG or PNG
- File size: < 500KB for optimal loading

## Upload Instructions:

1. **Through Admin Panel** (Recommended):

   - Access admin panel (Ctrl+Shift+A → Admin)
   - Go to Site Configuration tab
   - Upload logos using the image upload fields
   - Images will be automatically stored in Firebase Storage

2. **Manual Upload**:
   - Place image files in this directory
   - Update the image paths in admin panel or firebase database
   - Ensure file names match the expected names above

## Image Guidelines:

- **Logos**: Should have transparent backgrounds for best visual integration
- **High Quality**: Use high-resolution images that scale well
- **Consistent Style**: Maintain visual consistency across all logos
- **File Size**: Optimize images for web (use tools like TinyPNG)
- **Format**: PNG for logos with transparency, JPG for photos

## Fallback Behavior:

If images are not found, the website will:

- Hide logo containers gracefully
- Show text-only versions of branding
- Maintain layout integrity
- Display placeholder icons where appropriate

Upload your logos to get the complete branded experience!
