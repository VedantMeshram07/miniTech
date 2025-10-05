# TechFest Website 🚀

A modern, responsive website for college tech festivals built with vanilla HTML, CSS, and JavaScript. Features a minimalist Apple/Samsung-inspired design with Firebase backend integration.

## 🌟 Features

### 🎨 Design & User Experience

- **Minimalist Design**: Clean, Apple/Samsung-inspired interface
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Interactive Animations**: Hover effects, click animations, and smooth transitions
- **Modern Typography**: Inter font family for excellent readability
- **Accessible**: WCAG compliant with proper contrast ratios and semantic HTML

### 📱 Core Functionality

- **Hero Section**: Eye-catching landing area with floating animations
- **Events Showcase**: Dynamic grid layout with event cards
- **Event Details**: Comprehensive pages for each event with all necessary information
- **Registration Integration**: Direct links to Google Forms for event registration
- **Contact Information**: Easy access to coordinator details

### 🔧 Admin Panel

- **Secure Authentication**: Firebase Auth integration
- **CRUD Operations**: Complete management of events, coordinators, and site configuration
- **Real-time Updates**: Changes reflect immediately across the website
- **Image Management**: Upload and manage event posters
- **User-friendly Interface**: Intuitive dashboard with tabbed navigation

### ⚡ Technical Features

- **Firebase Integration**: Firestore database, Authentication, and Storage
- **Progressive Web App**: Service worker ready for offline capabilities
- **Performance Optimized**: Lazy loading images, efficient animations
- **SEO Friendly**: Proper meta tags and structured data
- **Cross-browser Compatible**: Works on all modern browsers

## 🗂️ Project Structure

```
techfest-website/
├── index.html              # Main landing page
├── assets/
│   ├── css/
│   │   ├── style.css       # Main stylesheet
│   │   ├── event-details.css
│   │   └── admin.css       # Admin panel styles
│   ├── js/
│   │   ├── main.js         # Main functionality
│   │   ├── event-details.js
│   │   ├── firebase-config.js
│   │   ├── admin-login.js
│   │   └── admin-dashboard.js
│   └── images/             # Static images
├── events/
│   └── details.html        # Event detail page template
├── admin/
│   ├── login.html          # Admin login page
│   └── dashboard.html      # Admin dashboard
├── FIREBASE_SETUP.md       # Firebase configuration guide
└── README.md              # This file
```

## �️ Event Posters (A4) — Quick Note

Event posters are hardcoded assets loaded by naming convention:

- Folder: `assets/posterss/`
- Name: `poster-<eventId>.jpg` (JPG only)
- Ratio: A4 portrait (e.g., 744×1052 px or higher)

How to find `<eventId>`: open the event details page and copy the `id` from the URL (e.g., `details.html?id=hackathon-2025`). You can also see it in the Admin “Event ID” field or Firestore `events` document ID. For full instructions and tips, see `assets/images/README.md`.

## �🚀 Quick Start

### Prerequisites

- Modern web browser
- Firebase account (for full functionality)
- Web server (for local development)

### Installation

1. **Clone or Download** the project files
2. **Set up Firebase** following the [Firebase Setup Guide](FIREBASE_SETUP.md)
3. **Configure Firebase** by updating `assets/js/firebase-config.js` with your credentials
4. **Serve the files** using a web server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

5. **Access the website** at `http://localhost:8000`

### Demo Mode

The website works without Firebase configuration using demo data. Admin credentials for demo mode:

- **Email**: demo@admin.com
- **Password**: demo123

## 🔧 Configuration

### Site Configuration

Update the following in your admin panel or directly in the code:

```javascript
// Default site configuration
const siteConfig = {
  collegeName: "Tech University",
  techfestName: "TechFest 2025",
  organizingBody: "Computer Science Department",
  theme: "Innovation & Technology",
  dates: "March 15-20, 2025",
  venue: "Main Campus Auditorium",
  // ... other settings
};
```

### Events Configuration

Events can be managed through the admin panel or by modifying the `demoEvents` array in `main.js`.

### Styling Customization

The website uses CSS custom properties for easy theming:

```css
:root {
  --primary-color: #007aff;
  --secondary-color: #5856d6;
  --accent-color: #ff3b30;
  --surface-color: #f2f2f7;
  --text-primary: #1c1c1e;
  /* ... other variables */
}
```

## 📖 Admin Panel Guide

### Accessing Admin Panel

1. Navigate to `/admin/login.html`
2. Login with your credentials
3. Access the dashboard at `/admin/dashboard.html`

### Managing Events

- **Add Event**: Click "Add Event" in the Events tab
- **Edit Event**: Click edit icon on any event card
- **Delete Event**: Click delete icon (with confirmation)
- **Upload Images**: Use the image upload field in event forms

### Managing Coordinators

- Add, edit, or remove coordinator information
- Associate coordinators with specific events
- Update contact details

### Site Configuration

- Update college name, techfest details
- Modify theme colors and branding
- Configure general settings

## 🎨 Customization

### Design System

The website follows a consistent design system:

- **Typography Scale**: 6 levels (xs to 6xl)
- **Spacing System**: 8px grid system
- **Color Palette**: Primary, secondary, accent, and neutral colors
- **Border Radius**: Consistent rounded corners (4px, 8px, 12px)
- **Shadows**: 4 levels of elevation

### Animation Classes

Available CSS classes for animations:

```css
.float-animation       /* Floating up/down */
/* Floating up/down */
/* Floating up/down */
/* Floating up/down */
.pulse                /* Pulsing effect */
.slide-in-up          /* Slide from bottom */
.fade-in-scale        /* Fade in with scale */
.bounce-animation     /* Bounce effect */
.shake                /* Error shake */
.glow-on-hover        /* Hover glow */
.zoom-hover; /* Image zoom on hover */
```

### Interactive Effects

The JavaScript provides several interactive enhancements:

- **Ripple Effects**: Click animations on buttons
- **Card Tilt**: 3D tilt effect on hover
- **Scroll Animations**: Elements animate into view
- **Form Validation**: Real-time input validation
- **Navigation Highlighting**: Active section indication

## 🌐 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+

## 🔧 Development

### Adding New Pages

1. Create HTML file following the existing structure
2. Include necessary CSS and JS files
3. Update navigation links in `index.html`
4. Add any new styles to appropriate CSS files

### Adding New Events

Events can be added through:

1. **Admin Panel**: Use the dashboard interface
2. **Direct Code**: Modify the `demoEvents` array
3. **Firebase**: Add directly to Firestore database

### Custom Animations

To add new animations:

1. **Define CSS keyframes**:

```css
@keyframes customAnimation {
  0% {
    /* initial state */
  }
  100% {
    /* final state */
  }
}
```

2. **Create CSS class**:

```css
.custom-animation {
  animation: customAnimation 1s ease-in-out;
}
```

3. **Apply via JavaScript**:

```javascript
element.classList.add("custom-animation");
```

## 📱 Responsive Design

The website is fully responsive with breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Key responsive features:

- Flexible grid layouts
- Scalable typography
- Touch-friendly interaction areas
- Optimized image loading
- Mobile-first CSS approach

## 🔒 Security

### Admin Panel Security

- Firebase Authentication integration
- Secure password requirements
- Session management
- Input validation and sanitization

### Database Security

- Firestore security rules
- Read/write permissions
- Data validation
- HTTPS enforcement

### Best Practices

- Regular security updates
- Environment variable usage
- CORS configuration
- XSS protection

## 🚀 Deployment

### Firebase Hosting (Recommended)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Other Platforms

- **Netlify**: Drag & drop deployment
- **Vercel**: GitHub integration
- **GitHub Pages**: Free static hosting
- **Traditional Hosting**: Upload via FTP

### Pre-deployment Checklist

- [ ] Firebase configuration updated
- [ ] All images optimized
- [ ] Meta tags configured
- [ ] Analytics setup (optional)
- [ ] SSL certificate configured
- [ ] Domain configured

## 🎯 Performance

### Optimization Features

- **Lazy Loading**: Images load as needed
- **CSS/JS Minification**: Reduced file sizes
- **Efficient Animations**: GPU-accelerated transforms
- **Optimized Images**: WebP format support
- **Caching Strategy**: Browser and CDN caching

### Performance Metrics

- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3s

## 🐛 Troubleshooting

### Common Issues

1. **Firebase not connecting**

   - Check configuration in `firebase-config.js`
   - Verify Firebase project settings
   - Check browser console for errors

2. **Images not loading**

   - Verify image paths
   - Check file permissions
   - Ensure proper file formats

3. **Animations not working**

   - Check CSS support
   - Verify JavaScript execution
   - Test on different browsers

4. **Mobile layout issues**
   - Test viewport meta tag
   - Check CSS media queries
   - Verify touch interactions

### Debug Mode

Enable debug mode by adding to URL:

```
?debug=true
```

This will show additional console logs and debug information.

## 🤝 Contributing

### Code Standards

- Use consistent indentation (2 spaces)
- Follow semantic HTML practices
- Use meaningful CSS class names
- Comment complex JavaScript functions
- Maintain responsive design principles

### Adding Features

1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is available for educational and non-commercial use. Please credit the original creators when using this code as a reference.

## 📞 Support

For support and questions:

1. Check the troubleshooting section
2. Review the Firebase setup guide
3. Consult the browser console for errors
4. Ensure all setup steps were followed

## 🎉 Credits

- **Design Inspiration**: Apple and Samsung design principles
- **Icons**: Font Awesome
- **Typography**: Inter font family
- **Backend**: Firebase platform
- **Animations**: CSS3 and vanilla JavaScript

---

**Built with ❤️ for the tech community**

_Ready to showcase your next tech event in style!_ 🚀
