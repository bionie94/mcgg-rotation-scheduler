// ---------- Solve tanpa PHP ----------
document.getElementById("btnSolve").addEventListener("click", solve);

function solve() {
  const outputSection = document.getElementById("outputSection");
  const output = document.getElementById("output");
  output.innerHTML = "";
  outputSection.classList.add("hidden");

  // Ambil players dari input P1..P8
  const players = [];
  for (let i = 1; i <= 8; i++) {
    const v = document.getElementById("P"+i).value.trim();
    if (!v) { alert("Semua nama pemain (P1–P8) harus diisi."); return; }
    players.push(v);
  }

  // Ambil pilihan dari dropdown
  const selects = Array.from(document.querySelectorAll("#rounds select"))
                       .sort((a,b) => Number(a.dataset.index) - Number(b.dataset.index));
  const chosen = selects.map(s => s.value).filter(v => v);

  if (chosen.length < 5) { 
    alert("Isi semua 5 ronde terlebih dahulu."); 
    return; 
  }

  // --- Logik ganti solve.php ---
  // Semua possible round label (contoh asal awak)
  const titles = ["II-4","II-5","II-6","III-1","III-2","III-4","III-5","III-6","IV-1","IV-2","IV-4","IV-5"];

  // Cari sisa lawan
  const remaining = players.filter(p => p !== players[0] && !chosen.includes(p));
  if (remaining.length !== (titles.length - chosen.length)) {
    const warn = document.createElement("pre");
    warn.className = "bg-yellow-900 text-yellow-100 p-4 rounded";
    warn.textContent = `⚠️ Data tidak konsisten. Sisa lawan: ${remaining.join(", ")}`;
    output.appendChild(warn);
    outputSection.classList.remove("hidden");
    return;
  }

  // Buat 2 kemungkinan
  const seq1 = [...chosen, ...remaining];
  const seq2 = [...chosen, ...remaining.reverse()];

  const card = (title, seq) => {
    const div = document.createElement("div");
    div.className = "bg-gray-900 rounded p-4 border border-gray-700";
    const h = document.createElement("h3");
    h.className = "text-indigo-300 font-semibold mb-2";
    h.textContent = title;
    const pre = document.createElement("pre");
    pre.className = "text-green-400 whitespace-pre-wrap font-mono text-sm";
    pre.textContent = seq.map((p,i)=>`${titles[i]} : ${p}`).join("\n");
    div.appendChild(h); div.appendChild(pre);
    return div;
  };

  output.appendChild(card("Kemungkinan 1", seq1));
  output.appendChild(card("Kemungkinan 2", seq2));
  outputSection.classList.remove("hidden");
  output.scrollIntoView({behavior:"smooth", block:"center"});
}
