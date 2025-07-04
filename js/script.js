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

// Function to open the modal with image details
function openModal(image) {
  // Set modal content using the clicked image's data
  modalImg.src = image.url;
  modalImg.alt = image.title;
  modalTitle.textContent = image.title;
  modalDate.textContent = image.date;
  modalExplanation.textContent = image.explanation;

  // Show the modal
  modal.style.display = 'flex';
}

// Function to close the modal
function hideModal() {
  modal.style.display = 'none';
}

// Close modal when clicking the close button or outside the modal content
closeModal.addEventListener('click', hideModal);
modal.addEventListener('click', function(event) {
  if (event.target === modal) {
    hideModal();
  }
});

// Function to display images in the gallery
function displayGallery(images) {
  // Clear any existing content in the gallery
  gallery.innerHTML = '';

  // Loop through each image object and create HTML for it
  images.forEach(image => {
    // Only show images (skip videos)
    if (image.media_type === 'image') {
      // Create a div for each gallery item
      const item = document.createElement('div');
      item.className = 'gallery-item';

      // Set the HTML for the item using template literals
      item.innerHTML = `
        <img src="${image.url}" alt="${image.title}" class="gallery-img">
        <h3>${image.title}</h3>
        <p>${image.date}</p>
      `;

      // When the user clicks this item, open the modal with details
      item.addEventListener('click', function() {
        openModal(image);
      });

      // Add the item to the gallery
      gallery.appendChild(item);
    }
  });
}

// When the user clicks the button, fetch and display new images
getImagesBtn.addEventListener('click', async () => {
  // Get the selected dates from the inputs
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Fetch images from NASA API
  const images = await fetchNasaImages(startDate, endDate);

  // Display the images in the gallery
  displayGallery(images);
});

// Optionally, display images on page load with the default date range
document.addEventListener('DOMContentLoaded', async () => {
  const startDate = startInput.value;
  const endDate = endInput.value;
  const images = await fetchNasaImages(startDate, endDate);
  displayGallery(images);
});
