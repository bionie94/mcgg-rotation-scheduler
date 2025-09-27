// ---------- Inisialisasi UI: input nama pemain ----------
window.onload = () => {
  const cont = document.getElementById("playerInputs");
  cont.innerHTML = "";
  for (let i = 1; i <= 8; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col";
    wrapper.innerHTML = `
      <label for="P${i}" class="text-sm text-gray-300 mb-1 select-none">
        P${i} ${i === 1 ? "(You)" : ""}
      </label>
      <input id="P${i}" type="text"
             class="px-3 py-2 rounded bg-gray-700 border border-gray-600
                    placeholder-gray-500 focus:outline-none focus:ring-2
                    focus:ring-indigo-500 text-gray-200"
             placeholder="Player ${i} name" ${i === 1 ? "autofocus" : ""}/>
    `;
    cont.appendChild(wrapper);
  }
};

// global
let players = [];

// tombol generate
document.getElementById("btnGenerate").addEventListener("click", generateDropdowns);
document.getElementById("btnClear").addEventListener("click", () => {
  players = [];
  document.getElementById("roundsForm").classList.add("hidden");
  document.getElementById("outputSection").classList.add("hidden");
  window.onload();
});

// ---------- Buat dropdown (rounds) ----------
function generateDropdowns() {
  players = [];
  for (let i = 1; i <= 8; i++) {
    const v = document.getElementById("P" + i).value.trim();
    if (!v) { alert("Semua nama pemain (P1–P8) harus diisi."); return; }
    players.push(v);
  }
  if (new Set(players.map(x => x.toLowerCase())).size !== 8) {
    alert("Nama pemain harus unik (case-insensitive).");
    return;
  }

  const titles = ["I-2","I-3","I-4","II-1","II-2"];
  const roundsDiv = document.getElementById("rounds");
  roundsDiv.innerHTML = "";

  titles.forEach((title, idx) => {
    const row = document.createElement("div");
    row.className = "flex items-center gap-3 bg-gray-700 p-3 rounded";

    const label = document.createElement("div");
    label.className = "w-16 text-sm text-gray-300";
    label.textContent = title;

    const fixed = document.createElement("input");
    fixed.type = "text";
    fixed.value = players[0];
    fixed.disabled = true;
    fixed.className = "px-3 py-2 rounded bg-gray-800 border border-gray-700 text-gray-400 w-28 cursor-not-allowed";

    const vs = document.createElement("div");
    vs.className = "text-gray-300 font-medium";
    vs.textContent = "vs";

    const sel = document.createElement("select");
    sel.className = "px-3 py-2 rounded bg-gray-800 border border-gray-700 text-gray-200 w-full";
    sel.dataset.index = idx;
    sel.innerHTML = `<option value="">-- pilih lawan --</option>`;

    row.appendChild(label);
    row.appendChild(fixed);
    row.appendChild(vs);
    row.appendChild(sel);
    roundsDiv.appendChild(row);
  });

  updateDropdowns();
  document.querySelectorAll("#rounds select").forEach(sel => {
    sel.addEventListener("change", updateDropdowns);
  });

  document.getElementById("roundsForm").classList.remove("hidden");
  document.getElementById("outputSection").classList.add("hidden");
}

// update opsi dropdown
function updateDropdowns() {
  const selects = Array.from(document.querySelectorAll("#rounds select"));
  const used = selects.map(s => s.value).filter(v => v);

  selects.forEach(sel => {
    const current = sel.value;
    const opts = ["<option value=''>-- pilih lawan --</option>"]
      .concat(
        players.filter(p => p !== players[0] && (!used.includes(p) || p === current))
               .map(p => `<option value="${escapeHtml(p)}" ${p === current ? "selected" : ""}>${escapeHtml(p)}</option>`)
      ).join("");
    sel.innerHTML = opts;
  });
}

function escapeHtml(s) {
  return String(s).replaceAll("&","&amp;")
                  .replaceAll("<","&lt;")
                  .replaceAll(">","&gt;");
}

// ---------- Solve ----------
document.getElementById("btnSolve").addEventListener("click", solve);

function solve() {
  const outputSection = document.getElementById("outputSection");
  const output = document.getElementById("output");
  output.innerHTML = "";
  outputSection.classList.add("hidden");

  // Ambil players
  const players = [];
  for (let i = 1; i <= 8; i++) {
    const v = document.getElementById("P" + i).value.trim();
    if (!v) { alert("Semua nama pemain (P1–P8) harus diisi."); return; }
    players.push(v);
  }

  // Ambil pilihan dari dropdown
  const selects = Array.from(document.querySelectorAll("#rounds select"))
                       .sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
  const chosen = selects.map(s => s.value).filter(v => v);

  if (chosen.length < 5) {
    alert("Isi semua 5 ronde terlebih dahulu.");
    return;
  }

  // Label ronde penuh (12 slot)
  const titles = ["II-4","II-5","II-6","III-1","III-2","III-4","III-5","III-6","IV-1","IV-2","IV-4","IV-5"];

  // Cari lawan yang belum dipilih
  const remaining = players.filter(p => p !== players[0] && !chosen.includes(p));

  if (remaining.length !== (titles.length - chosen.length)) {
    alert("Data tidak konsisten. Sisa lawan tak cukup.");
    return;
  }

  // Buat 2 kemungkinan (rotate remaining)
  let seq1 = [];
  let seq2 = [];

  titles.forEach((title, idx) => {
    if (idx < chosen.length) {
      seq1.push(`${title} : ${chosen[idx]}`);
      seq2.push(`${title} : ${chosen[idx]}`);
    } else {
      seq1.push(`${title} : ${remaining[(idx - chosen.length) % remaining.length]}`);
      seq2.push(`${title} : ${remaining[(idx - chosen.length + 1) % remaining.length]}`);
    }
  });

  // Tampilkan hasil
  const card = (title, seq) => {
    const div = document.createElement("div");
    div.className = "bg-gray-900 rounded p-4 border border-gray-700";
    const h = document.createElement("h3");
    h.className = "text-indigo-300 font-semibold mb-2";
    h.textContent = title;
    const pre = document.createElement("pre");
    pre.className = "text-green-400 whitespace-pre-wrap font-mono text-sm";
    pre.textContent = seq.join("\n");
    div.appendChild(h); div.appendChild(pre);
    return div;
  };

  output.appendChild(card("Kemungkinan 1", seq1));
  output.appendChild(card("Kemungkinan 2", seq2));
  outputSection.classList.remove("hidden");
  output.scrollIntoView({ behavior: "smooth", block: "center" });
}
