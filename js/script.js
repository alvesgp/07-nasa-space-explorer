// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// NASA APOD API endpoint and your API key (use 'DEMO_KEY' for testing)
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
const API_KEY = 'DEMO_KEY'; // Replace with your own key if you have one

// Function to fetch images from NASA's API using the selected date range
async function fetchNasaImages(startDate, endDate) {
  // Build the API URL with the selected dates and API key
  const url = `${NASA_API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  try {
    // Fetch data from the API
    const response = await fetch(url);
    // Convert the response to JSON
    const data = await response.json();

    // Log the data to see what we get (for learning)
    console.log(data);

    // Return the data so we can use it elsewhere
    return data;
  } catch (error) {
    // If something goes wrong, log the error
    console.error('Error fetching data from NASA API:', error);
    return [];
  }
}

// Find the gallery container and the "Get Space Images" button
const gallery = document.getElementById('gallery');
const getImagesBtn = document.getElementById('getImagesBtn');

// Get modal elements
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeModal = document.getElementById('closeModal');

function openModal(item) {
  // Hide image by default and reset src
  modalImg.style.display = 'none';
  modalImg.src = '';

  // Remove old video iframe if it exists
  const oldVideo = document.getElementById('modalVideo');
  if (oldVideo) oldVideo.remove();

  // Set title, date, explanation
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;

  if (item.media_type === 'image') {
    modalImg.src = item.url;
    modalImg.alt = item.title;
    modalImg.style.display = 'block';  // make sure the image shows
    modalImg.style.margin = '0 auto';  // center the image horizontally
  } 
  else if (item.media_type === 'video') {
    let embedUrl = item.url;
    if (embedUrl.includes('watch?v=')) {
      embedUrl = embedUrl.replace('watch?v=', 'embed/');
    } else if (embedUrl.includes('youtu.be')) {
      const videoId = embedUrl.split('youtu.be/')[1];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'modalVideo';
    iframe.src = embedUrl + '?autoplay=1';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.width = '100%';
    iframe.style.height = '400px';
    iframe.style.borderRadius = '8px';
    iframe.style.background = 'var(--nasa-gray)';
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';  // center the video

    modalExplanation.insertAdjacentElement('beforebegin', iframe);
  }

  modal.style.display = 'flex';
}



function hideModal() {
  modal.style.display = 'none';
  modalImg.src = '';
  const oldVideo = document.getElementById('modalVideo');
  if (oldVideo) oldVideo.remove();
}


// Close modal when clicking the close button or outside the modal content
closeModal.addEventListener('click', hideModal);
modal.addEventListener('click', function(event) {
  if (event.target === modal) {
    hideModal();
  }
});

// Function to display images and videos in the gallery
function displayGallery(images) {
  // Clear any existing content in the gallery
  gallery.innerHTML = '';

  // Loop through each image object and create HTML for it
  images.forEach(image => {
    // Create a div for each gallery item
    const item = document.createElement('div');
    item.className = 'gallery-item';

    // Check if the entry is an image
    if (image.media_type === 'image') {
      // Set the HTML for the image item
      item.innerHTML = `
        <img src="${image.url}" alt="${image.title}" class="gallery-img">
        <h3>${image.title}</h3>
        <p class="dm-mono">${image.date}</p>
      `;

      // When the user clicks this item, open the modal with details
      item.addEventListener('click', function() {
        openModal(image);
      });
    }
    // Check if the entry is a video (like a YouTube video)
    else if (image.media_type === 'video') {
      // If it's a YouTube video, embed it, otherwise show a link
      let videoContent = '';
      if (image.url.includes('youtube.com') || image.url.includes('youtu.be')) {
        // Embed YouTube video using iframe
        videoContent = `
          <div class="video-wrapper">
            <iframe 
              src="${image.url.replace('watch?v=', 'embed/')}" 
              frameborder="0" 
              allowfullscreen
              title="${image.title}"
              class="gallery-video"
            ></iframe>
          </div>
        `;
      } else {
        // For other videos, just show a link
        videoContent = `
          <a href="${image.url}" target="_blank" rel="noopener" class="gallery-video-link">
            ▶️ Watch Video
          </a>
        `;
      }

      // Set the HTML for the video item
      item.innerHTML = `
        ${videoContent}
        <h3>${image.title}</h3>
        <p class="dm-mono">${image.date}</p>
      `;

      // Optional: Show explanation in modal on click for videos too
      item.addEventListener('click', function() {
        openModal(image);
      });
    }

    // Add the item to the gallery
    gallery.appendChild(item);
  });
}

// Function to display a loading message in the gallery
function showLoadingMessage() {
  gallery.innerHTML = `<div class="placeholder">
    <span class="placeholder-icon" aria-hidden="true">🔄</span>
    <p>Loading space photos…</p>
  </div>`;
}

// When the user clicks the button, fetch and display new images
getImagesBtn.addEventListener('click', async () => {
  // Get the selected dates from the inputs
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Show loading message before fetching
  showLoadingMessage();

  // Fetch images from NASA API
  const images = await fetchNasaImages(startDate, endDate);

  // Display the images in the gallery
  displayGallery(images);
});

// Optionally, display images on page load with the default date range
document.addEventListener('DOMContentLoaded', async () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Show loading message before fetching
  showLoadingMessage();

  const images = await fetchNasaImages(startDate, endDate);
  displayGallery(images);
});

// Array of space facts
const spaceFacts = [
  'Did you know? NASA’s Voyager 1 is the most distant human-made object from Earth.',
  'Did you know? The Hubble Space Telescope has traveled over 4 billion miles in orbit!',
  'Did you know? The ISS orbits Earth about every 90 minutes.',
  'Did you know? The Moon is drifting away from Earth at about 1.5 inches per year.',
  'Did you know? A day on Venus is longer than its year.',
  'Did you know? There are more stars in the universe than grains of sand on all the Earth’s beaches.',
  'Did you know? Saturn could float in water because it’s mostly made of gas.',
  'Did you know? Neutron stars are so dense that a sugar cube-sized amount would weigh about a billion tons.'
];

// Function to display a single random space fact
function displayRandomSpaceFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  const fact = spaceFacts[randomIndex];

  const container = document.getElementById('spaceFactContainer');
  container.innerHTML = ''; // Clear any existing fact

  const factDiv = document.createElement('div');
  factDiv.className = 'space-fact';
  factDiv.textContent = fact;

  container.appendChild(factDiv);
}

// Run once on page load
document.addEventListener('DOMContentLoaded', displayRandomSpaceFact);