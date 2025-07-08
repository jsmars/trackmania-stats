const accountId = "YOUR_ACCOUNT_ID"; // <-- Set here
const base = "https://trackmania.io/api/player";

async function fetchJson(path) {
  const res = await fetch(`${base}/${accountId}/${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function load() {
  const summaryEl = document.getElementById("summary");
  const campEl = document.getElementById("campaigns");
  summaryEl.textContent = "Loading...";
  campEl.innerHTML = "";

  try {
    const camps = await fetchJson("campaigns");
    let totalMaps = 0;
    const total = { author:0, gold:0, silver:0, bronze:0 };

    for (const c of camps) {
      const details = await fetchJson(`campaign/${c.id}`);
      const maps = details.tracks || [];
      totalMaps += maps.length;

      const earned = { author:0, gold:0, silver:0, bronze:0 };
      maps.forEach(m => {
        if (m.medal === "author") earned.author++;
        if (["author", "gold"].includes(m.medal)) earned.gold++;
        if (["author", "gold", "silver"].includes(m.medal)) earned.silver++;
        if (["author", "gold", "silver", "bronze"].includes(m.medal))
          earned.bronze++;
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

    const overallPct = v => ((v / totalMaps) * 100).toFixed(1) + "%";
    summaryEl.innerHTML = `
      <h2>Total: ${totalMaps} maps</h2>
      <p>Author: ${total.author}/${totalMaps} (${overallPct(total.author)})</p>
      <p>Gold: ${total.gold}/${totalMaps} (${overallPct(total.gold)})</p>
      <p>Silver: ${total.silver}/${totalMaps} (${overallPct(total.silver)})</p>
      <p>Bronze: ${total.bronze}/${totalMaps} (${overallPct(total.bronze)})</p>`;

  } catch (e) {
    summaryEl.textContent = "Failed to load data. Check console.";
    console.error(e);
  }
}

load();
