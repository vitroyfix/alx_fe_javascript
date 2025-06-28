// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// Initial Quotes Array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Stay hungry, stay foolish.", category: "Inspiration" },
  { text: "Talk is cheap. Show me the code.", category: "Programming" },
  { text: "Simplicity is the soul of efficiency.", category: "Design" }
];

// Load last filter from localStorage
const lastFilter = localStorage.getItem("lastCategory") || "all";
categoryFilter.value = lastFilter;

// Show a random quote
function showRandomQuote() {
  let filteredQuotes = quotes;
  const selectedCategory = categoryFilter.value;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category}`;
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showRandomQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate unique categories in the dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  categoryFilter.value = localStorage.getItem("lastCategory") || "all";
}

// Filter quotes when category changes
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastCategory", selected);
  showRandomQuote();
}

// Export quotes to a JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
        showRandomQuote();
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Failed to parse JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Simulate Server Sync (using JSONPlaceholder-like mock)
function syncWithServer() {
  const syncStatus = document.getElementById("syncStatus");

  // Simulate fetching from server (here, just a local array)
  const serverQuotes = [
    { text: "Server-side wisdom.", category: "Server" },
    { text: "Another server insight.", category: "Server" }
  ];

  // Conflict resolution: server takes priority
  const combinedQuotes = [...serverQuotes, ...quotes];
  const uniqueQuotes = Array.from(
    new Map(combinedQuotes.map(q => [q.text + q.category, q])).values()
  );

  quotes = uniqueQuotes;
  saveQuotes();
  populateCategories();
  showRandomQuote();

  syncStatus.textContent = "Data synced with server.";
}

// Periodic sync every 30 seconds
setInterval(syncWithServer, 30000);

// Initialize categories and display
populateCategories();
showRandomQuote();

// Event listener for Show New Quote button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
