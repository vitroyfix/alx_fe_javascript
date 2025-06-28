// Load quotes from local storage or set default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Create Add Quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Add quote to list and storage
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showNotification("New quote added!");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Show a random quote (filtered by category if selected)
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  const category = document.getElementById("categoryFilter").value;
  const filteredQuotes = category === "all" ? quotes : quotes.filter(q => q.category === category);

  if (filteredQuotes.length === 0) {
    display.innerHTML = "No quotes in this category.";
    return;
  }

  const random = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  display.innerHTML = `<p>"${random.text}"</p><small> - ${random.category}</small>`;
  sessionStorage.setItem("lastViewedQuote", random.text);
}

// Populate category dropdown
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  filter.innerHTML = `<option value="all">All Categories</option>`;
  [...new Set(quotes.map(q => q.category))].forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });
}

// Filter quotes
function filterQuotes() {
  localStorage.setItem("lastFilter", document.getElementById("categoryFilter").value);
  showRandomQuote();
}

// Export quotes to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw "Invalid JSON structure";
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      showNotification("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Simulate fetching and posting to mock server with conflict resolution
function syncQuotes() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(res => res.json())
    .then(data => {
      const serverQuotes = data.slice(0, 5).map(item => ({
        text: item.title,
        category: "Server"
      }));

      const conflicts = serverQuotes.filter(sq =>
        quotes.some(lq => lq.text === sq.text)
      );

      if (conflicts.length > 0) {
        quotes = quotes.filter(q => !conflicts.some(c => c.text === q.text));
        showNotification(`${conflicts.length} conflicts resolved.`);
      }

      quotes.push(...serverQuotes);
      saveQuotes();
      populateCategories();
      showNotification("Quotes synced from server.");
    });

  if (quotes.length) {
    fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(quotes[quotes.length - 1]),
      headers: { "Content-type": "application/json; charset=UTF-8" }
    }).then(res => res.json()).then(data => console.log("Posted:", data));
  }
}

// Simple notification message
function showNotification(msg) {
  const note = document.getElementById("notification");
  note.textContent = msg;
  setTimeout(() => note.textContent = "", 4000);
}

// Set up event listeners and init
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
setInterval(syncQuotes, 30000);

window.onload = () => {
  populateCategories();
  createAddQuoteForm();
  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) document.getElementById("quoteDisplay").innerHTML = `<p>"${last}"</p><small>(last viewed)</small>`;
};
