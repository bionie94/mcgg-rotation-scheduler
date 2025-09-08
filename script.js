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

  ["Round 1", "Round 2", "Round 3"].forEach((title) => {
    let section = document.createElement("div");
    section.className = "space-y-4";
    let h3 = document.createElement("h3");
    h3.className = "text-lg font-semibold text-indigo-300 select-none";
    h3.textContent = title;
    section.appendChild(h3);

    // 4 match per round
    for (let i = 0; i < 4; i++) {
      section.appendChild(makeMatch(i === 0 ? players[0] : null));
    }

    roundsDiv.appendChild(section);
  });

  document.getElementById("roundsForm").classList.remove("hidden");
  attachFilterEvents();
}

function makeMatch(fixed = null) {
  let row = document.createElement("div");
  row.className = "match-box"; // <-- kotak design

  function createInput(value, disabled = false) {
    if (disabled) {
      let input = document.createElement("input");
      input.type = "text";
      input.className =
        "rounded-md bg-gray-700 border border-gray-600 text-gray-400 px-3 py-2 w-full sm:w-1/2 cursor-not-allowed";
      input.value = value;
      input.disabled = true;
      return input;
    } else {
      let select = document.createElement("select");
      select.className =
        "player-select rounded-md bg-gray-700 border border-gray-600 text-gray-200 px-3 py-2 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";
      let optionDefault = document.createElement("option");
      optionDefault.value = "";
      optionDefault.textContent = "-- select --";
      select.appendChild(optionDefault);
      players
        .filter((p) => !fixed || p !== players[0])
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
    vsSpan.className = "text-gray-400 select-none font-semibold";
    vsSpan.textContent = "VS";
    let selectOpp = createInput(null, false);
    row.appendChild(inputFixed);
    row.appendChild(vsSpan);
    row.appendChild(selectOpp);
  } else {
    let select1 = createInput(null, false);
    let vsSpan = document.createElement("span");
    vsSpan.className = "text-gray-400 select-none font-semibold";
    vsSpan.textContent = "VS";
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

// Helper function to generate dropdown HTML
function dropdownHTML(list) {
  return `<select class="player-select rounded-md bg-gray-700 border border-gray-600 text-gray-200 px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
    <option value="">-- select --</option>
    ${list.map((p) => `<option value="${p}">${p}</option>`).join("")}
  </select>`;
}

// Attach event listeners
document.getElementById("btnGenerate").addEventListener("click", generateDropdowns);
