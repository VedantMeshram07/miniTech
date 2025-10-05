// Test Event Details Page Functionality
console.log('Testing Event Details Page...');

// Check if required elements exist
const requiredElements = [
    'event-title',
    'event-image', 
    'event-title-main',
    'event-description-main',
    'event-prize-amount',
    'event-date-value',
    'event-participation-type'
];

requiredElements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Missing element: ${id}`);
    } else {
        console.log(`✅ Found element: ${id}`);
    }
});

// Check URL parameters
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');
console.log('Event ID from URL:', eventId);

// Check localStorage
const storedEvent = localStorage.getItem('selectedEvent');
console.log('Stored event:', storedEvent);

// Check Firebase availability
console.log('Firebase DB available:', !!window.db);
console.log('Firebase Auth available:', !!window.auth);

// Check if events are loaded
if (window.eventsData) {
    console.log('Events data available:', window.eventsData.length);
} else {
    console.log('No events data available');
}