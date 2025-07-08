const base = "https://trackmania.io/api/player";

function getAccountId() {
  return localStorage.getItem("tmAccountId") || "";
}

function saveAccountId(id) {
  localStorage.setItem("tmAccountId", id);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function start() {
  const input = document.getElementById("accountIdInput");
  const accountId = input.value.trim();
  if (!accountId) return alert("Please enter a valid Account ID.");
  saveAccountId(accountId);
  await loadMedals(accountId);
}

async function loadMedals(accountId) {
  const summaryEl = document.getElementById("summary");
  const campEl = document.getElementById("campaigns");
  summaryEl.textContent = "Loading...";
  campEl.innerHTML = "";

  try {
    const campaigns = await fetchJson(`${base}/${accountId}/campaigns`);
    let totalMaps = 0;
    const total = { author: 0, gold: 0, silver: 0, bronze: 0 };

    for (const c of campaigns) {
      const details = await fetchJson(`${base}/${accountId}/campaign/${c.id}`);
      const maps = details.tracks || [];
      totalMaps += maps.length;

      const earned = { author: 0, gold: 0, silver: 0, bronze: 0 };
      maps.forEach(m => {
        if (m.medal === "author") earned.author++;
        if (["author", "gold"].includes(m.medal)) earned.gold++;
        if (["author", "gold", "silver"].includes(m.medal)) earned.silver++;
        if (["author", "gold", "silver", "bronze"].includes(m.medal)) earned.bronze++;
      });

      Object.keys(earned).forEach(k => total[k] += earned[k]);

      const pct = v => ((v / maps.length) * 100).toFixed(1) + "%";
      campEl.innerHTML += `
        <div class="campaign">
          <h2>${c.name} (${maps.length} maps)</h2>
          <div class="medals">Author: ${earned.author}/${maps.length} (${pct(earned.author)})</div>
          <div class="medals">Gold: ${earned.gold}/${maps.length} (${pct(earned.gold)})</div>
          <div class="medals">Silver: ${earned.silver}/${maps.length} (${pct(earned.silver)})</div>
          <div class="medals">Bronze: ${earned.bronze}/${maps.length} (${pct(earned.bronze)})</div>
        </div>`;
    }

    const pct = v => ((v / totalMaps) * 100).toFixed(1) + "%";
    summaryEl.innerHTML = `
      <h2>Total Summary (${totalMaps} maps)</h2>
      <p>Author: ${total.author}/${totalMaps} (${pct(total.author)})</p>
      <p>Gold: ${total.gold}/${totalMaps} (${pct(total.gold)})</p>
      <p>Silver: ${total.silver}/${totalMaps} (${pct(total.silver)})</p>
      <p>Bronze: ${total.bronze}/${totalMaps} (${pct(total.bronze)})</p>
    `;
  } catch (err) {
    summaryEl.textContent = "❌ Failed to load data. Check console.";
    console.error(err);
  }
}

// Auto-load if accountId was saved
document.addEventListener("DOMContentLoaded", () => {
  const saved = getAccountId();
  if (saved) {
    document.getElementByI
