async function search() {
  const input = document.getElementById("input").value;
  const resultsDiv = document.getElementById("results");
  const loading = document.getElementById("loading");

  if (!input.trim()) return;

  resultsDiv.innerHTML = "";
  loading.classList.remove("hidden");

  try {
    const res = await fetch('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: input })
    });

    const data = await res.json();
    loading.classList.add("hidden");

    if (data.error) {
      const errorMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
      resultsDiv.innerHTML = `<p style="color: #ef4444;">Error: ${errorMsg}</p>`;
      return;
    }

    if (data.length === 0) {
      resultsDiv.innerHTML = `<p style="color: #94a3b8;">No matches found.</p>`;
      return;
    }

    data.forEach(movie => {
      const div = document.createElement("div");
      div.className = "result-item";
      div.innerText = movie.content;
      resultsDiv.appendChild(div);
    });
  } catch (error) {
    loading.classList.add("hidden");
    resultsDiv.innerHTML = `<p style="color: #ef4444;">Failed to connect to server.</p>`;
  }
}

// Allow pressing Enter to search
document.getElementById("input").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    search();
  }
});
