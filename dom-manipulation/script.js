// Array to hold quotes and categories
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

// Function to show a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  
  // Pick a random quote
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const selectedQuote = quotes[randomIndex];

  // Clear existing content
  quoteDisplay.innerHTML = "";

  // Create new quote element
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${selectedQuote.text}"`;

  const quoteCategory = document.createElement("small");
  quoteCategory.textContent = ` - ${selectedQuote.category}`;

  // Append elements to display area
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

// Function to add a new quote from user input
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  // Validate input
  if (newText === "" || newCategory === "") {
    alert("Please fill in both the quote and category.");
    return;
  }

  // Add new quote object to quotes array
  quotes.push({ text: newText, category: newCategory });

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("New quote added!");
}

// Event listener for Show New Quote button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
