const STORAGE_KEY = "ascended-directors-board-v1";

const TOKEN_TYPES = {
  character: "Character / Action Rating",
  weapon: "Weapon",
  spell: "Spell",
  psionic: "Psionic",
  divine: "Divine",
  skill: "Skill",
  misc: "Miscellaneous"
};

const TOKEN_COLORS = {
  gold: "#d7b66a",
  crimson: "#bf4e3a",
  teal: "#46b8ad",
  violet: "#9a78d6",
  ivory: "#f2e8bf",
  iron: "#9b9a91"
};

const SR_POSITIONS = {
  20: { x: 25.0, y: 50.7 },
  19: { x: 26.8, y: 38.0 },
  18: { x: 30.0, y: 29.4 },
  17: { x: 34.8, y: 21.8 },
  16: { x: 41.2, y: 16.8 },
  15: { x: 49.6, y: 15.0 },
  14: { x: 58.1, y: 16.2 },
  13: { x: 64.7, y: 21.5 },
  12: { x: 70.2, y: 30.0 },
  11: { x: 72.2, y: 38.0 },
  10: { x: 73.5, y: 50.7 },
  9: { x: 72.1, y: 61.8 },
  8: { x: 68.7, y: 70.6 },
  7: { x: 64.8, y: 79.2 },
  6: { x: 58.0, y: 84.2 },
  5: { x: 49.6, y: 88.0 },
  4: { x: 41.2, y: 84.0 },
  3: { x: 34.7, y: 79.5 },
  2: { x: 29.7, y: 70.6 },
  1: { x: 26.7, y: 62.2 },
  0: { x: 50.0, y: 51.3 },
  "-1": { x: 36.7, y: 63.4 },
  "-2": { x: 38.9, y: 68.2 },
  "-3": { x: 41.4, y: 72.0 },
  "-4": { x: 44.0, y: 75.0 },
  "-5": { x: 47.2, y: 76.8 },
  "-6": { x: 51.4, y: 76.9 },
  "-7": { x: 55.0, y: 75.4 },
  "-8": { x: 58.4, y: 72.1 },
  "-9": { x: 60.8, y: 68.3 },
  "-10": { x: 63.1, y: 63.4 }
};

const state = {
  tokens: [],
  currentSr: 20,
  startingSr: 20,
  combatState: "setup"
};

const els = {};
let dragState = null;
let resizeTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  hydrateSelects();
  bindEvents();
  loadFromStorage(false);
  renderAll();
});

function cacheElements() {
  [
    "boardShell", "srLayer", "tokenLayer", "stagingArea", "currentSrDisplay",
    "phaseStartInput", "setStartBtn", "stepDownBtn", "stepUpBtn", "newPhaseBtn",
    "combatStateSelect",
    "clearCompletedBtn", "tokenForm", "tokenType", "tokenLabel", "tokenOwner",
    "tokenSr", "tokenColor", "tokenNotes", "saveBtn", "loadBtn", "exportBtn",
    "importBtn", "importFile", "clearBoardBtn", "legend", "panelToggle",
    "controlPanel", "tokenDialog", "editForm", "editTokenId", "editType",
    "editLabel", "editOwner", "editSr", "editColor", "editNotes",
    "deleteTokenBtn", "duplicateTokenBtn", "closeDialogBtn"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function hydrateSelects() {
  fillSrSelect(els.tokenSr, true);
  fillSrSelect(els.editSr, true);
  fillTypeSelect(els.editType);
  fillColorSelect(els.editColor);
  renderLegend();
}

function fillSrSelect(select, includeStaging) {
  select.innerHTML = "";
  if (includeStaging) {
    select.add(new Option("Staging / no SR", ""));
  }
  for (let sr = 20; sr >= -10; sr -= 1) {
    select.add(new Option(String(sr), String(sr)));
  }
}

function fillTypeSelect(select) {
  select.innerHTML = "";
  Object.entries(TOKEN_TYPES).forEach(([value, label]) => select.add(new Option(label, value)));
}

function fillColorSelect(select) {
  select.innerHTML = "";
  Object.keys(TOKEN_COLORS).forEach((value) => select.add(new Option(titleCase(value), value)));
}

function bindEvents() {
  els.tokenForm.addEventListener("submit", createTokenFromForm);
  els.combatStateSelect.addEventListener("change", () => {
    state.combatState = els.combatStateSelect.value;
    saveToStorage(false);
    renderPhase();
  });
  els.setStartBtn.addEventListener("click", setStartingSr);
  els.stepDownBtn.addEventListener("click", () => setCurrentSr(state.currentSr - 1));
  els.stepUpBtn.addEventListener("click", () => setCurrentSr(state.currentSr + 1));
  els.newPhaseBtn.addEventListener("click", newSequencedPhase);
  els.clearCompletedBtn.addEventListener("click", clearCurrentSrTokens);
  els.saveBtn.addEventListener("click", () => saveToStorage(true));
  els.loadBtn.addEventListener("click", () => loadFromStorage(true));
  els.exportBtn.addEventListener("click", exportJson);
  els.importBtn.addEventListener("click", () => els.importFile.click());
  els.importFile.addEventListener("change", importJson);
  els.clearBoardBtn.addEventListener("click", clearBoard);
  els.panelToggle.addEventListener("click", togglePanel);
  els.editForm.addEventListener("submit", saveTokenEdits);
  els.closeDialogBtn.addEventListener("click", () => els.tokenDialog.close());
  els.deleteTokenBtn.addEventListener("click", deleteEditedToken);
  els.duplicateTokenBtn.addEventListener("click", duplicateEditedToken);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderTokens, 60);
  });
}

function createTokenFromForm(event) {
  event.preventDefault();
  const sr = parseSr(els.tokenSr.value);
  const label = els.tokenLabel.value.trim() || TOKEN_TYPES[els.tokenType.value].split(" ")[0];
  const token = {
    id: makeId(),
    type: els.tokenType.value,
    label,
    owner: els.tokenOwner.value.trim(),
    sr,
    color: els.tokenColor.value,
    notes: els.tokenNotes.value.trim(),
    x: 9 + Math.random() * 5,
    y: 84 + Math.random() * 6
  };

  if (sr !== null && SR_POSITIONS[String(sr)]) {
    const position = offsetPositionForSr(sr, token.id);
    token.x = position.x;
    token.y = position.y;
  }

  state.tokens.push(token);
  els.tokenForm.reset();
  els.tokenType.value = "character";
  els.tokenColor.value = "gold";
  saveToStorage(false);
  renderAll();
}

function renderAll() {
  renderSrMarkers();
  renderTokens();
  renderPhase();
}

function renderSrMarkers() {
  els.srLayer.innerHTML = "";
  Object.entries(SR_POSITIONS).forEach(([sr, pos]) => {
    const marker = document.createElement("div");
    marker.className = `sr-marker ${Number(sr) === state.currentSr ? "active" : ""}`;
    marker.style.left = `${pos.x}%`;
    marker.style.top = `${pos.y}%`;
    marker.dataset.sr = sr;
    marker.title = `Sequence Rating ${sr}`;
    els.srLayer.append(marker);
  });
}

function renderTokens() {
  els.tokenLayer.innerHTML = "";
  const groups = groupTokensBySr();
  state.tokens.forEach((token) => {
    const node = document.createElement("button");
    node.type = "button";
    node.className = `token ${token.type} ${token.sr === state.currentSr ? "active" : ""}`;
    node.style.setProperty("--x", token.x);
    node.style.setProperty("--y", token.y);
    node.style.setProperty("--token-color", TOKEN_COLORS[token.color] || TOKEN_COLORS.gold);
    const offsets = displayOffset(token, groups);
    node.style.setProperty("--offset-x", `${offsets.x}px`);
    node.style.setProperty("--offset-y", `${offsets.y}px`);
    node.dataset.id = token.id;
    node.title = tooltipFor(token);
    node.innerHTML = tokenMarkup(token);
    node.addEventListener("pointerdown", onTokenPointerDown);
    node.addEventListener("dblclick", () => openEditor(token.id));
    node.querySelector("[data-action='edit']").addEventListener("click", (event) => {
      event.stopPropagation();
      openEditor(token.id);
    });
    node.querySelector("[data-action='copy']").addEventListener("click", (event) => {
      event.stopPropagation();
      duplicateToken(token.id);
    });
    node.querySelector("[data-action='delete']").addEventListener("click", (event) => {
      event.stopPropagation();
      confirmDeleteToken(token.id);
    });
    els.tokenLayer.append(node);
  });
}

function tokenMarkup(token) {
  const glyph = token.type === "character" ? initials(token.label) : "";
  return `
    <span class="token-actions">
      <span class="token-action" data-action="edit" title="Edit">i</span>
      <span class="token-action" data-action="copy" title="Duplicate">+</span>
      <span class="token-action" data-action="delete" title="Delete">x</span>
    </span>
    <span class="token-inner">
      <span class="token-glyph">${escapeHtml(glyph)}</span>
      <span class="token-label">${escapeHtml(token.label)}</span>
      <span class="token-owner">${escapeHtml(token.owner || srLabel(token.sr))}</span>
    </span>
  `;
}

function onTokenPointerDown(event) {
  if (event.target.closest(".token-action")) return;
  const token = tokenById(event.currentTarget.dataset.id);
  if (!token) return;
  event.preventDefault();
  event.currentTarget.setPointerCapture(event.pointerId);
  event.currentTarget.classList.add("dragging");
  dragState = {
    id: token.id,
    pointerId: event.pointerId,
    freePlacement: event.shiftKey
  };
  updateTokenFromPointer(event, dragState.freePlacement);
}

function onPointerMove(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  updateTokenFromPointer(event, event.shiftKey || dragState.freePlacement);
}

function onPointerUp(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  updateTokenFromPointer(event, event.shiftKey || dragState.freePlacement);
  dragState = null;
  saveToStorage(false);
  renderTokens();
}

function updateTokenFromPointer(event, freePlacement) {
  const token = tokenById(dragState.id);
  if (!token) return;
  const point = pointFromEvent(event);
  token.x = clamp(point.x, 0, 100);
  token.y = clamp(point.y, 0, 100);

  if (!freePlacement) {
    const nearest = nearestSr(point);
    if (nearest && nearest.distancePx < 72) {
      token.sr = Number(nearest.sr);
      token.x = nearest.position.x;
      token.y = nearest.position.y;
    } else {
      token.sr = null;
    }
  }

  const node = els.tokenLayer.querySelector(`[data-id="${CSS.escape(token.id)}"]`);
  if (node) {
    node.style.setProperty("--x", token.x);
    node.style.setProperty("--y", token.y);
  }
}

function pointFromEvent(event) {
  const rect = els.boardShell.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100
  };
}

function nearestSr(point) {
  const rect = els.boardShell.getBoundingClientRect();
  let nearest = null;
  Object.entries(SR_POSITIONS).forEach(([sr, position]) => {
    const dx = ((point.x - position.x) / 100) * rect.width;
    const dy = ((point.y - position.y) / 100) * rect.height;
    const distancePx = Math.hypot(dx, dy);
    if (!nearest || distancePx < nearest.distancePx) {
      nearest = { sr, position, distancePx };
    }
  });
  return nearest;
}

function groupTokensBySr() {
  return state.tokens.reduce((groups, token) => {
    if (token.sr === null || token.sr === undefined) return groups;
    const key = String(token.sr);
    groups[key] = groups[key] || [];
    groups[key].push(token.id);
    return groups;
  }, {});
}

function displayOffset(token, groups) {
  if (token.sr === null || token.sr === undefined) return { x: 0, y: 0 };
  const ids = groups[String(token.sr)] || [];
  const index = ids.indexOf(token.id);
  if (index <= 0) return { x: 0, y: 0 };
  const ring = Math.ceil(index / 6);
  const angle = ((index - 1) % 6) * (Math.PI / 3);
  const radius = 18 * ring;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

function offsetPositionForSr(sr) {
  const base = SR_POSITIONS[String(sr)];
  if (!base) return { x: 12, y: 88 };
  return { x: base.x, y: base.y };
}

function setStartingSr() {
  const value = clamp(parseInt(els.phaseStartInput.value, 10) || 20, -10, 20);
  state.startingSr = value;
  setCurrentSr(value);
}

function setCurrentSr(value) {
  state.currentSr = clamp(value, -10, 20);
  saveToStorage(false);
  renderAll();
}

function newSequencedPhase() {
  const answer = prompt("Starting SR for the new Sequenced Phase?", String(state.startingSr));
  if (answer === null) return;
  const next = clamp(parseInt(answer, 10) || state.startingSr, -10, 20);
  state.startingSr = next;
  state.currentSr = next;
  els.phaseStartInput.value = String(next);
  saveToStorage(false);
  renderAll();
}

function clearCurrentSrTokens() {
  const count = state.tokens.filter((token) => token.sr === state.currentSr).length;
  if (!count) {
    alert("No tokens are currently on this SR.");
    return;
  }
  if (!confirm(`Remove ${count} token${count === 1 ? "" : "s"} on SR ${state.currentSr}?`)) return;
  state.tokens = state.tokens.filter((token) => token.sr !== state.currentSr);
  saveToStorage(false);
  renderAll();
}

function renderPhase() {
  els.currentSrDisplay.textContent = String(state.currentSr);
  els.phaseStartInput.value = String(state.startingSr);
  els.combatStateSelect.value = state.combatState;
  document.querySelector(".app-shell").dataset.combatState = state.combatState;
}

function openEditor(id) {
  const token = tokenById(id);
  if (!token) return;
  els.editTokenId.value = token.id;
  els.editType.value = token.type;
  els.editLabel.value = token.label;
  els.editOwner.value = token.owner || "";
  els.editSr.value = token.sr === null || token.sr === undefined ? "" : String(token.sr);
  els.editColor.value = token.color || "gold";
  els.editNotes.value = token.notes || "";
  els.tokenDialog.showModal();
}

function saveTokenEdits(event) {
  event.preventDefault();
  const token = tokenById(els.editTokenId.value);
  if (!token) return;
  token.type = els.editType.value;
  token.label = els.editLabel.value.trim() || TOKEN_TYPES[token.type].split(" ")[0];
  token.owner = els.editOwner.value.trim();
  token.sr = parseSr(els.editSr.value);
  token.color = els.editColor.value;
  token.notes = els.editNotes.value.trim();
  if (token.sr !== null && SR_POSITIONS[String(token.sr)]) {
    const position = offsetPositionForSr(token.sr, token.id);
    token.x = position.x;
    token.y = position.y;
  }
  els.tokenDialog.close();
  saveToStorage(false);
  renderAll();
}

function deleteEditedToken() {
  const id = els.editTokenId.value;
  if (!confirm("Delete this token?")) return;
  state.tokens = state.tokens.filter((token) => token.id !== id);
  els.tokenDialog.close();
  saveToStorage(false);
  renderAll();
}

function duplicateEditedToken() {
  duplicateToken(els.editTokenId.value);
  els.tokenDialog.close();
}

function duplicateToken(id) {
  const token = tokenById(id);
  if (!token) return;
  const copy = {
    ...token,
    id: makeId(),
    label: `${token.label} copy`,
    x: clamp(token.x + 1.2, 0, 100),
    y: clamp(token.y + 1.2, 0, 100)
  };
  state.tokens.push(copy);
  saveToStorage(false);
  renderAll();
}

function confirmDeleteToken(id) {
  if (!confirm("Delete this token?")) return;
  state.tokens = state.tokens.filter((token) => token.id !== id);
  saveToStorage(false);
  renderAll();
}

function saveToStorage(showMessage) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableState()));
  if (showMessage) alert("Board saved in this browser.");
}

function loadFromStorage(showMessage) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    if (showMessage) alert("No saved board found in this browser.");
    return;
  }
  try {
    applyImportedState(JSON.parse(raw));
    if (showMessage) alert("Board loaded.");
  } catch (error) {
    alert("The saved board could not be loaded.");
  }
}

function exportJson() {
  const blob = new Blob([JSON.stringify(serializableState(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ascended-directors-board.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      applyImportedState(JSON.parse(String(reader.result)));
      saveToStorage(false);
      renderAll();
      alert("Board imported.");
    } catch (error) {
      alert("That JSON file could not be imported.");
    } finally {
      els.importFile.value = "";
    }
  });
  reader.readAsText(file);
}

function clearBoard() {
  if (!confirm("Clear every token from this board?")) return;
  state.tokens = [];
  saveToStorage(false);
  renderAll();
}

function serializableState() {
  return {
    version: 1,
    currentSr: state.currentSr,
    startingSr: state.startingSr,
    combatState: state.combatState,
    tokens: state.tokens
  };
}

function applyImportedState(data) {
  state.currentSr = clamp(Number(data.currentSr ?? 20), -10, 20);
  state.startingSr = clamp(Number(data.startingSr ?? state.currentSr), -10, 20);
  state.combatState = ["setup", "active", "resolution", "new-phase"].includes(data.combatState) ? data.combatState : "setup";
  state.tokens = Array.isArray(data.tokens) ? data.tokens.map(normalizeToken) : [];
  renderAll();
}

function normalizeToken(token) {
  const sr = parseSr(token.sr);
  return {
    id: String(token.id || makeId()),
    type: TOKEN_TYPES[token.type] ? token.type : "misc",
    label: String(token.label || "Token").slice(0, 28),
    owner: String(token.owner || "").slice(0, 28),
    sr,
    color: TOKEN_COLORS[token.color] ? token.color : "gold",
    notes: String(token.notes || ""),
    x: clamp(Number(token.x ?? 12), 0, 100),
    y: clamp(Number(token.y ?? 88), 0, 100)
  };
}

function renderLegend() {
  els.legend.innerHTML = "";
  Object.entries(TOKEN_TYPES).forEach(([type, label]) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `<span class="legend-swatch ${type}"></span><span>${label}</span>`;
    els.legend.append(item);
  });
}

function togglePanel() {
  const collapsed = els.controlPanel.classList.toggle("collapsed");
  els.panelToggle.setAttribute("aria-expanded", String(!collapsed));
}

function tokenById(id) {
  return state.tokens.find((token) => token.id === id);
}

function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `token-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseSr(value) {
  if (value === "" || value === null || value === undefined) return null;
  const sr = Number(value);
  return Number.isFinite(sr) ? clamp(sr, -10, 20) : null;
}

function srLabel(sr) {
  return sr === null || sr === undefined ? "Staging" : `SR ${sr}`;
}

function initials(label) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function tooltipFor(token) {
  return [
    `${TOKEN_TYPES[token.type]}: ${token.label}`,
    token.owner ? `Owner: ${token.owner}` : "",
    srLabel(token.sr),
    token.notes || ""
  ].filter(Boolean).join("\n");
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}
