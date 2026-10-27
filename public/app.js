const form = document.querySelector("#chapter-form");
const chapterInput = document.querySelector("#chapter");
const generateBtn = document.querySelector("#generate");
const resultPanel = document.querySelector("#result-panel");
const result = document.querySelector("#result");
const statusBox = document.querySelector("#status");
const title = document.querySelector("#result-title");

function escapeHtml(s) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
// Small Markdown renderer for headings, lists, links, bold and code. Raw HTML is escaped.
function renderMarkdown(md) {
  let s = escapeHtml(md);
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  s = s.replace(/^\`\`\`(?:\w+)?\s*\n([\s\S]*?)\`\`\`$/gm, (_, code) => `<pre><code>${code}</code></pre>`);
  s = s.replace(/^### (.+)$/gm, "<h3>$1</h3>").replace(/^## (.+)$/gm, "<h2>$1</h2>").replace(/^# (.+)$/gm, "<h1>$1</h1>");
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\`([^\`]+)\`/g, "<code>$1</code>");
  const lines = s.split("\n"); let out = "", inUl = false, inOl = false;
  const closeLists = () => { if(inUl){out+="</ul>";inUl=false;} if(inOl){out+="</ol>";inOl=false;} };
  for (const line of lines) {
    if (/^<h[1-3]>/.test(line) || /^<pre>/.test(line)) { closeLists(); out += line; continue; }
    if (/^\s*[-*]\s+/.test(line)) { if(inOl){out+="</ol>";inOl=false;} if(!inUl){out+="<ul>";inUl=true;} out += `<li>${line.replace(/^\s*[-*]\s+/, "")}</li>`; continue; }
    if (/^\s*\d+\.\s+/.test(line)) { if(inUl){out+="</ul>";inUl=false;} if(!inOl){out+="<ol>";inOl=true;} out += `<li>${line.replace(/^\s*\d+\.\s+/, "")}</li>`; continue; }
    closeLists();
    if (!line.trim()) continue;
    if (/^&gt;/.test(line)) out += `<blockquote>${line.replace(/^&gt;\s?/, "")}</blockquote>`;
    else out += `<p>${line}</p>`;
  }
  closeLists(); return out;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const chapter = chapterInput.value.trim();
  if (!chapter) return;
  generateBtn.disabled = true;
  generateBtn.textContent = "Researching and creating your notes…";
  resultPanel.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth", block: "start" });
  statusBox.textContent = "Searching learning resources and building your study pack. This can take a little while.";
  result.innerHTML = "";
  title.textContent = chapter;
  try {
    const response = await fetch("/api/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapter,
        subject: document.querySelector("#subject").value,
        exam: document.querySelector("#exam").value,
        language: document.querySelector("#language").value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Something went wrong.");
    result.innerHTML = renderMarkdown(data.content || "");
    statusBox.textContent = "Study pack ready. Verify official PYQs and important formulas before the exam.";
  } catch (error) {
    statusBox.textContent = error.message || "Could not generate notes. Please try again.";
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = "<span>✦</span> Generate my study pack";
  }
});

document.querySelector("#copy").addEventListener("click", async () => {
  const text = result.innerText;
  try { await navigator.clipboard.writeText(text); statusBox.textContent = "Study pack copied."; }
  catch { statusBox.textContent = "Copy is unavailable in this browser. You can select the notes manually."; }
});
document.querySelector("#print").addEventListener("click", () => window.print());
