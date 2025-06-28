const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

// Mock API URLs (simulate server endpoints)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // replace with your own mock endpoint if needed

// Load from localStorage or default data
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Stay hungry, stay foolish.", category: "Inspiration" },
  { text: "Talk is cheap. Show me the code.", category: "Programming" },
  { text: "Simplicity is the soul of efficiency.", category: "Design" }
];

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

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  showRandomQuote();
  postQuoteToServer(newQuote);  // Post to server when added locally
  displayStatus("Quote added and synced to server.");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate unique categories
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

// Filter quotes by category
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastCategory", selected);
  showRandomQuote();
}

// Export to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

// Import from JSON file
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

// Fetch quotes from server (simulated)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    // Map simulated data into quote objects
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    return serverQuotes;
  } catch (err) {
    console.error("Failed to fetch from server:", err);
    return [];
  }
}

// Post a quote to server (simulated)
async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
  } catch (err) {
    console.error("Failed to post quote:", err);
  }
}

// Sync local and server data with conflict resolution
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  // Conflict resolution: prioritize server quotes
  const combinedQuotes = [...serverQuotes, ...quotes];
  const uniqueQuotes = Array.from(
    new Map(combinedQuotes.map(q => [q.text + q.category, q])).values()
  );

  quotes = uniqueQuotes;
  saveQuotes();
  populateCategories();
  showRandomQuote();
  displayStatus("Data synced with server.");
}

// Display status messages
function displayStatus(message) {
  syncStatus.textContent = message;
  setTimeout(() => (syncStatus.textContent = ""), 4000);
}

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);

// Initial load
populateCategories();
showRandomQuote();
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
