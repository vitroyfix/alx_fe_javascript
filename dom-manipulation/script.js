// ===== Dynamic Quote Generator with Web Storage, JSON Handling, Filtering, and Server Sync ===== //

// Load quotes from local storage or initialize with default quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display a random quote (filtered by category if selected)
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const selectedCategory = document.getElementById("categoryFilter").value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${randomQuote.text}"`;

  const quoteCategory = document.createElement("small");
  quoteCategory.textContent = ` - ${randomQuote.category}`;

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);

  // Save last viewed quote in session storage
  sessionStorage.setItem("lastViewedQuote", randomQuote.text);
}

// Add a new quote from user input
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please fill in both the quote and category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();
  populateCategories();

  alert("New quote added!");

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Populate category filter dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Load last selected filter from local storage if exists
  const savedFilter = localStorage.getItem("lastFilter");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", selectedCategory);
  showRandomQuote();
}

// Export quotes array to a downloadable JSON file
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

// Import quotes from a user-selected JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert("Invalid JSON format. Expected an array of quotes.");
        return;
      }
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (error) {
      alert("Error reading the JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Simulate server interaction: fetch quotes from a mock API
function fetchQuotesFromServer() {
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(data => {
      const serverQuotes = data.slice(0, 5).map(item => ({
        text: item.title,
        category: "Server"
      }));

      // Detect conflicts (quotes with the same text)
      const conflicts = serverQuotes.filter(sq =>
        quotes.some(lq => lq.text === sq.text)
      );

      if (conflicts.length > 0) {
        alert(`Conflicts detected: ${conflicts.length}. Server version takes precedence.`);

        // Remove local conflicting quotes
        quotes = quotes.filter(q => !conflicts.some(c => c.text === q.text));
      }

      quotes.push(...serverQuotes);
      saveQuotes();
      populateCategories();
    })
    .catch(error => console.error("Error fetching server quotes:", error));
}

// Periodically sync data with the simulated server every 30 seconds
setInterval(fetchQuotesFromServer, 30000);

// Event listener for the "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Initialize the application by populating categories and loading last viewed quote (optional)
window.onload = function () {
  populateCategories();

  // Optionally show last viewed quote from session storage on page load
  const lastViewedQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastViewedQuote) {
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `<p>"${lastViewedQuote}"</p><small>(last viewed)</small>`;
  }
};
