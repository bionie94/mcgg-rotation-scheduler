// Initialize player inputs on page load
window.onload = () => {
  const container = document.getElementById("playerInputs");
  for (let i = 1; i <= 8; i++) {
    let div = document.createElement("div");
    div.innerHTML = `
      <label for="P${i}" class="block text-gray-400 text-sm mb-1 font-medium select-none">P${i}${i === 1 ? " (You)" : ""}</label>
      <input id="P${i}" type="text" class="w-full rounded-md bg-gray-700 border border-gray-600 placeholder-gray-500 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition px-3 py-2" placeholder="Player ${i} Name" />
    `;
    container.appendChild(div);
  }
};

let players = [];

function generateDropdowns() {
  players = [];
  for (let i = 1; i <= 8; i++) {
    let val = document.getElementById("P" + i).value.trim();
    if (!val) {
      alert("All players (P1–P8) must be filled!");
      return;
    }
    players.push(val);
  }
  if (new Set(players).size !== 8) {
    alert("Player names must be unique!");
    return;
  }

  let roundsDiv = document.getElementById("rounds");
  roundsDiv.innerHTML = "";

  ["Round I-2", "Round I-3", "Round I-4"].forEach((title) => {
    let section = document.createElement("div");
    section.className = "space-y-4";
    let h3 = document.createElement("h3");
    h3.className = "text-lg font-semibold text-indigo-300 select-none";
    h3.textContent = title;
    section.appendChild(h3);
    section.appendChild(makeMatch(players[0], true));
    for (let i = 0; i < 3; i++) section.appendChild(makeMatch(null, false));
    roundsDiv.appendChild(section);
  });

  document.getElementById("roundsForm").classList.remove("hidden");
  attachFilterEvents();
}

function makeMatch(fixed = null) {
  let row = document.createElement("div");
  row.className = "flex flex-col sm:flex-row items-center gap-2 mb-2 py-6";

  function createInput(value, disabled = false) {
    if (disabled) {
      let input = document.createElement("input");
      input.type = "text";
      input.className =
        "rounded-md bg-gray-700 border border-gray-600 text-gray-400 px-3 py-2 w-full sm:w-80% cursor-not-allowed";
      input.value = value;
      input.disabled = true;
      return input;
    } else {
      let select = document.createElement("select");
      select.className =
        "player-select rounded-md bg-gray-700 border border-gray-600 text-gray-200 px-3 py-2 w-full sm:w-80% focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";
      let optionDefault = document.createElement("option");
      optionDefault.value = "";
      optionDefault.textContent = "-- select --";
      select.appendChild(optionDefault);
      players
        .filter((p) => p !== players[0])
        .forEach((p) => {
          let opt = document.createElement("option");
          opt.value = p;
          opt.textContent = p;
          select.appendChild(opt);
        });
      if (value) select.value = value;
      return select;
    }
  }

  if (fixed) {
    let inputFixed = createInput(fixed, true);
    let vsSpan = document.createElement("span");
    vsSpan.className = "text-gray-400 select-none";
    vsSpan.textContent = "vs";
    let selectOpp = createInput(null, false);
    row.appendChild(inputFixed);
    row.appendChild(vsSpan);
    row.appendChild(selectOpp);
  } else {
    let select1 = createInput(null, false);
    let vsSpan = document.createElement("span");
    vsSpan.className = "text-gray-400 select-none";
    vsSpan.textContent = "vs";
    let select2 = createInput(null, false);
    row.appendChild(select1);
    row.appendChild(vsSpan);
    row.appendChild(select2);
  }
  return row;
}

function attachFilterEvents() {
  document.querySelectorAll("#rounds > div").forEach((roundDiv) => {
    let selects = roundDiv.querySelectorAll("select");
    selects.forEach((sel) => {
      sel.addEventListener("change", () => {
        let chosen = Array.from(selects)
          .map((s) => s.value)
          .filter((v) => v !== "");
        selects.forEach((s) => {
          let current = s.value;
          s.innerHTML =
            `<option value="">-- select --</option>` +
            players
              .filter(
                (p) =>
                  p !== players[0] &&
                  (!chosen.includes(p) || p === current)
              )
              .map(
                (p) =>
                  `<option value="${p}" ${
                    p === current ? "selected" : ""
                  }>${p}</option>`
              )
              .join("");
        });
      });
    });
  });
}

function getRound(roundIdx) {
  let section = document.getElementById("rounds").children[roundIdx];
  let inputs = section.querySelectorAll("input,select");
  let pairs = [];
  for (let i = 0; i < inputs.length; i += 2) {
    let a = inputs[i].value;
    let b = inputs[i + 1].value;
    if (!a || !b) {
      alert("All dropdowns must be selected!");
      return null;
    }
    pairs.push([a, b]);
  }
  return pairs;
}

// --- Algoritma inti ---
function simulate_rotation(order, fixed, n_rounds) {
  let res = [];
  let arr = order.slice();
  for (let r = 0; r < n_rounds; r++) {
    let pairs = [
      new Set([arr[0], fixed]),
      new Set([arr[1], arr[6]]),
      new Set([arr[2], arr[5]]),
      new Set([arr[3], arr[4]]),
    ];
    res.push(pairs);
    arr = [arr[6]].concat(arr.slice(0, 6));
  }
  return res;
}

function generate_schedule(order, fixed, n_rounds = 7) {
  let arr = order.slice();
  let schedule = [];
  for (let r = 1; r <= n_rounds; r++) {
    let pairs = [
      [arr[0], fixed],
      [arr[1], arr[6]],
      [arr[2], arr[5]],
      [arr[3], arr[4]],
    ];
    schedule.push(pairs);
    arr = [arr[6]].concat(arr.slice(0, 6));
  }
  return schedule;
}

function eqSets(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  let used = new Array(arr2.length).fill(false);
  for (let s1 of arr1) {
    let found = false;
    for (let j = 0; j < arr2.length; j++) {
      if (!used[j]) {
        let s2 = arr2[j];
        if (s1.size === s2.size && [...s1].every((v) => s2.has(v))) {
          used[j] = true;
          found = true;
          break;
        }
      }
    }
    if (!found) return false;
  }
  return true;
}

function solve() {
  let rounds = [];
  for (let i = 0; i < 3; i++) {
    let r = getRound(i);
    if (!r) return;
    rounds.push(r.map((p) => new Set(p)));
  }

  let solutions = [];

  for (let fixed of players) {
    let others = players.filter((p) => p !== fixed);

    function permute(arr, k = []) {
      if (arr.length === 0) {
        let sim = simulate_rotation(k, fixed, 3);
        let ok = true;
        for (let i = 0; i < 3; i++) {
          let simPairs = sim[i];
          let inputPairs = rounds[i];
          if (!eqSets(simPairs, inputPairs)) {
            ok = false;
            break;
          }
        }
        if (ok) solutions.push([fixed, k]);
        return;
      }
      for (let i = 0; i < arr.length; i++)
        permute(arr.slice(0, i).concat(arr.slice(i + 1)), k.concat(arr[i]));
    }

    permute(others, []);
  }

  let container = document.getElementById("output");
  container.innerHTML = "";

  if (solutions.length === 0) {
    const p1 = players[0];
    function findOpponent(roundSetArr, player) {
      let match = roundSetArr.find((s) => s.has(player));
      if (!match) return undefined;
      return [...match].find((x) => x !== player);
    }
    const B = findOpponent(rounds[0], p1);
    const F = findOpponent(rounds[1], p1);
    const E = findOpponent(rounds[2], p1);

    let resultBox = document.createElement("pre");
    resultBox.className =
      "bg-gray-900 text-green-400 p-4 rounded-lg text-sm";
    resultBox.textContent = `I-2 : ${B}\nI-3 : ${F}\nI-4 : ${E}`;
    container.appendChild(resultBox);

    let manualDiv = document.createElement("div");
    manualDiv.className = "mt-4 p-4 bg-gray-700 rounded-lg";
    container.appendChild(manualDiv);

    let II1Val = null;
    let II2Val = null;

    function renderStep(step, II1 = II1Val, II2 = II2Val) {
      if (step === 1) {
        manualDiv.innerHTML = `
          <h3 class="font-semibold mb-2 text-indigo-300">Enter additional data: II-1</h3>
          <div class="flex flex-col sm:flex-row items-center gap-2 mb-2">
            <span class="w-20">${p1} vs</span>
            ${dropdownHTML(players.filter(p => p !== p1 && ![B, F, E].includes(p)))}
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-2">
            <span class="w-20">${B} vs</span>
            ${dropdownHTML(players.filter(p => p !== p1 && p !== B && ![F, E].includes(p)))}
          </div>
          <button id="btnManual" class="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded w-full sm:w-auto max-w-xs">Save</button>
        `;

        manualDiv.querySelector("#btnManual").onclick = () => {
          const selects = manualDiv.querySelectorAll("select");
          II1Val = selects[0].value;
          II2Val = selects[1].value;

          if (!II1Val || !II2Val) {
            alert("Pilih semua lawan di II-1.");
            return;
          }
          if (II1Val === II2Val) {
            alert("Lawan di II-1 tidak boleh sama.");
            return;
          }

          resultBox.textContent =
            `I-2 : ${B}\nI-3 : ${F}\nI-4 : ${E}\nII-1 : ${II1Val}\nII-2 : ${II2Val}`;

          renderStep(2, II1Val, II2Val);
        };
      }

      if (step === 2) {
        manualDiv.innerHTML = `
          <h3 class="font-semibold mb-2 text-indigo-300">Enter additional data: II-2</h3>
          <div class="flex flex-col sm:flex-row items-center gap-2">
            <span class="w-20">${F} vs</span>
            ${dropdownHTML(players.filter(p => ![p1, B, F, E, II1, II2].includes(p)))}
          </div>
          <button id="btnManual2" class="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded w-full sm:w-auto max-w-xs">Save</button>
        `;

        manualDiv.querySelector("#btnManual2").onclick = () => {
          const C = manualDiv.querySelector("select").value;
          if (!C) {
            alert("Pilih lawan untuk " + F);
            return;
          }

          const D = players.find(p => ![p1, B, F, E, II1, II2, C].includes(p));

          resultBox.textContent =
`I-2 : ${B}
I-3 : ${F}
I-4 : ${E}
II-1 : ${II1}
II-2 : ${II2}
II-4 : ${D}
II-5 : ${C}
II-6 : ${B}
III-1 : ${F}
III-2 : ${E}
III-4 : ${II1}
III-5 : ${II2}
III-6 : ${D}
IV-1 : ${C}`;

          manualDiv.innerHTML = `<p class="text-green-400 font-semibold">✅ Additional data entry completed</p>`;
        };
      }
    }

    renderStep(1);
    return;
  }

  // --- Jika solusi ditemukan ---
  const roundLabels = {
    4: "II-1",
    5: "II-2",
    6: "II-4",
    7: "II-5",
    8: "II-6",
    9: "III-1",
    10: "III-2",
    11: "III-4",
    12: "III-5",
  };

  const p1 = players[0];

  function generate_rounds8to12(sched, fixed) {
    let idxMap = [fixed];
    for (let r = 0; r < 7; r++) {
      let match = sched[r].find((m) => m.includes(fixed));
      let opponent = match[0] === fixed ? match[1] : match[0];
      idxMap.push(opponent);
    }

    let pattern = [
      [
        [7, 5],
        [2, 1],
        [6, 4],
        [3, 8],
      ],
      [
        [7, 4],
        [2, 8],
        [6, 5],
        [3, 1],
      ],
      [
        [7, 6],
        [2, 3],
        [5, 8],
        [4, 1],
      ],
      [
        [7, 3],
        [2, 4],
        [5, 1],
        [6, 8],
      ],
      [
        [7, 8],
        [2, 6],
        [5, 3],
        [4, 1],
      ],
    ];

    return pattern.map((r) =>
      r.map((p) => [idxMap[p[0] - 1], idxMap[p[1] - 1]])
    );
  }

  solutions.forEach((sol, idx) => {
    let [fixed, perm] = sol;
    let sched = generate_schedule(perm, fixed);
    let futureRounds = generate_rounds8to12(sched, fixed);
    sched = sched.concat(futureRounds);

    let txt = `Kemungkinan ${idx + 1}\n`;
    for (let r = 3; r < 12; r++) {
      let matches = sched[r];
      let userMatch = matches.find((m) => m.includes(p1));
      let opponent = userMatch[0] === p1 ? userMatch[1] : userMatch[0];
      txt += `${roundLabels[r + 1]}: ${opponent}\n`;
    }

    let box = document.createElement("pre");
    box.className =
      "bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap break-words";
    box.textContent = txt;
    container.appendChild(box);
  });
}

// Helper function to generate dropdown HTML for manual input steps
function dropdownHTML(list) {
  return `<select class="player-select rounded-md bg-gray-700 border border-gray-600 text-gray-200 px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
    <option value="">-- select --</option>
    ${list.map((p) => `<option value="${p}">${p}</option>`).join("")}
  </select>`;
}

// Attach event listeners
document
  .getElementById("btnGenerate")
  .addEventListener("click", generateDropdowns);
document.getElementById("btnSolve").addEventListener("click", solve);
