// ── Create floating answer box ──────────────────────────────
const box = document.createElement("div");
box.id = "mcq-answer-box";
box.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 999999;
  background: #1e1e2e;
  color: #cdd6f4;
  border: 2px solid #89b4fa;
  border-radius: 12px;
  padding: 14px 20px;
  font-family: monospace;
  font-size: 15px;
  min-width: 180px;
  max-width: 260px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  display: none;
  transition: all 0.3s ease;
`;
document.body.appendChild(box);

// ── Show answer in box ──────────────────────────────────────
function showAnswer(answer, time, status) {
  if (status === "loading") {
    box.innerHTML = `
      <div style="color:#89b4fa;font-weight:bold;">⏳ Thinking...</div>
      <div style="font-size:12px;color:#a6adc8;margin-top:4px;">Please wait</div>
    `;
  } else if (status === "error") {
    box.innerHTML = `
      <div style="color:#f38ba8;font-weight:bold;">❌ Error</div>
      <div style="font-size:12px;color:#a6adc8;margin-top:4px;">Is server running?</div>
    `;
  } else {
    box.innerHTML = `
      <div style="color:#a6e3a1;font-size:11px;margin-bottom:4px;">ANSWER</div>
      <div style="font-size:36px;font-weight:bold;color:#cba6f7;">${answer}</div>
      <div style="font-size:11px;color:#a6adc8;margin-top:4px;">⏱ ${time}s</div>
      <div style="font-size:10px;color:#585b70;margin-top:6px;">Click to dismiss</div>
    `;
  }
  box.style.display = "block";
}

// ── Click to dismiss ────────────────────────────────────────
box.addEventListener("click", () => {
  box.style.display = "none";
});

// ── Send selected text to server ────────────────────────────
async function solveSelected() {
  const selected = window.getSelection().toString().trim();

  if (!selected) {
    box.innerHTML = `<div style="color:#f9e2af;">⚠️ Select MCQ text first!</div>`;
    box.style.display = "block";
    setTimeout(() => box.style.display = "none", 2000);
    return;
  }

  showAnswer("", "", "loading");

  try {
    const res = await fetch("http://127.0.0.1:5000/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: selected })
    });

    const data = await res.json();
    showAnswer(data.answer, data.time, "done");

  } catch (err) {
    showAnswer("", "", "error");
  }
}

// ── Listen for message from background ─────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "solve") {
    solveSelected();
  }
});