const teamInput = document.getElementById("team-members");
const textInput = document.getElementById("daily-input");
const markdownOutput = document.getElementById("output");

const updateTemplate = () => {
  if (teamInput.value === "") return;

  const names = teamInput.value
    .replaceAll(",", " ")
    .replaceAll(".", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter((x) => x)
    .map((x) => x.trim());

  const getDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const monthPadded = ("0" + month).slice(-2);
    const dayPadded = ("0" + day).slice(-2);
    return `${year}-${monthPadded}-${dayPadded}`;
  };

  const namesDaily = names
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value: x }) => `**${x}**\n- `)
    .join("\n\n\n");

  const out = [`### ${getDate()} daily`, namesDaily].join("\n\n\n");
  textInput.value = out;
};

const parse = (addBreaks = false, removeHeadings = false) => {
  const html = marked.parse(textInput.value, {
    breaks: true,
    gfm: true,
  });

  const _result = addBreaks
    ? html
        .replaceAll("</pre>", "</pre><br/>")
        .replaceAll("</p>\n<p>", "</p><br/><p>")
        .replaceAll("<h1>", "<br/><h1>")
        .replaceAll("<h2>", "<br/><h2>")
        .replaceAll("<h3>", "<br/><h3>")
        .replaceAll("<h4>", "<br/><h4>")
        .replaceAll("<h5>", "<br/><h5>")
        .replaceAll("<h6>", "<br/><h6>")
        .replaceAll("</p><strong>", "</p><br/><strong>")
        .replaceAll("</ul><p>", "</ul><br/><p>")
        .replaceAll("</strong></p><br/><p>", "</strong></p><p>")
    : html;

  const result = removeHeadings
    ? _result
        .replaceAll("<h1>", "<b>")
        .replaceAll("</h1>", "</b><br/>")
        .replaceAll("<h2>", "<b>")
        .replaceAll("</h2>", "</b><br/>")
        .replaceAll("<h3>", "<b>")
        .replaceAll("</h3>", "</b><br/>")
        .replaceAll("<h4>", "<b>")
        .replaceAll("</h4>", "</b><br/>")
        .replaceAll("<h5>", "<b>")
        .replaceAll("</h5>", "</b><br/>")
        .replaceAll("<h6>", "<b>")
        .replaceAll("</h6>", "</b><br/>")
    : _result;

  markdownOutput.innerHTML = result;
};

const copy = (addBreaks = false, removeHeadings = false) => {
  parse(addBreaks, removeHeadings);
  navigator.clipboard.write([
    new ClipboardItem({
      "text/plain": new Blob([markdownOutput.innerText], {
        type: "text/plain",
      }),
      "text/html": new Blob([markdownOutput.innerHTML], { type: "text/html" }),
    }),
  ]);
};

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const teamMembersStorageKey = "daily-templater-2025-10-03-team";

const onTeamMembersChange = debounce(() => {
  updateTemplate();
  localStorage.setItem(teamMembersStorageKey, teamInput.value);
}, 200);

window.onload = () => {
  teamInput.value = localStorage.getItem(teamMembersStorageKey);
  updateTemplate();
};

tabOverride.tabSize(4);
tabOverride.set(textInput);

const getCurrentLineStartAndEnd = () => {
  const el = document.activeElement;
  const selectionStart = el.selectionStart;
  const allLines = el.value.split("\n");
  const lines = el.value.substring(0, selectionStart).split("\n");
  const lineIndex = lines.length - 1;
  const line = allLines[lineIndex];
  const wasFirstLine = lineIndex === 0 ? 0 : 1;
  const start = allLines.slice(0, lineIndex).join("\n").length + wasFirstLine;
  const end = start + line.length;
  return { start, end };
};

const handleKeyPress = (e) => {
  if (e.key === "Enter") {
    const { start, end } = getCurrentLineStartAndEnd();
    const lineText = textInput.value.substring(start, end);

    if (lineText.startsWith("- ")) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const dash = "\n- ";
      textInput.setRangeText(dash, end, end, "end");
    }
  }
};
