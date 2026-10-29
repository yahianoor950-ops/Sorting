const $ = (id) => document.getElementById(id);

// ---------- Build the list of animation steps ----------
// Each frame: { a: array copy, cmp: [indices], piv: index, done: [indices], msg: text }
function mergeSteps(arr) {
  const a = [...arr], f = [], done = new Set();
  const snap = (cmp, msg) => f.push({ a: [...a], cmp, piv: -1, done: [...done], msg });
  snap([], "Start Merge Sort: split, sort halves, then merge.");
  (function sort(lo, hi) {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    snap([], `Divide [${lo}..${hi}] into [${lo}..${mid}] and [${mid + 1}..${hi}]`);
    sort(lo, mid); sort(mid + 1, hi);
    const L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < L.length && j < R.length) {
      snap([lo + i, mid + 1 + j], `Compare ${L[i]} and ${R[j]}`);
      a[k] = L[i] <= R[j] ? L[i++] : R[j++];
      snap([k], `Place ${a[k]} at index ${k}`); k++;
    }
    while (i < L.length) { a[k++] = L[i++]; }
    while (j < R.length) { a[k++] = R[j++]; }
    if (lo === 0 && hi === a.length - 1) a.forEach((_, x) => done.add(x));
    snap([], `Merged [${lo}..${hi}] → ${a.slice(lo, hi + 1).join(", ")}`);
  })(0, a.length - 1);
  snap([], "Array is sorted ✔");
  return f;
}

function quickSteps(arr) {
  const a = [...arr], f = [], done = new Set();
  const snap = (cmp, piv, msg) => f.push({ a: [...a], cmp, piv, done: [...done], msg });
  snap([], -1, "Start Quick Sort: choose a pivot and partition.");
  (function sort(lo, hi) {
    if (lo > hi) return;
    if (lo === hi) { done.add(lo); snap([], -1, `${a[lo]} is in its final place`); return; }
    const p = a[hi]; let i = lo;
    snap([], hi, `Pivot = ${p} (last item of [${lo}..${hi}])`);
    for (let j = lo; j < hi; j++) {
      snap([j], hi, `Is ${a[j]} < ${p} ?`);
      if (a[j] < p) {
        [a[i], a[j]] = [a[j], a[i]];
        snap([i, j], hi, `Yes → swap indices ${i} and ${j}`); i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]]; done.add(i);
    snap([], i, `Pivot ${p} placed at index ${i}`);
    sort(lo, i - 1); sort(i + 1, hi);
  })(0, a.length - 1);
  snap([], -1, "Array is sorted ✔");
  return f;
}

// ---------- Visualizer page ----------
if ($("bars")) {
  const algo = new URLSearchParams(location.search).get("algo") === "quick" ? "quick" : "merge";
  $("title").textContent = algo === "quick" ? "Quick Sort" : "Merge Sort";
  let frames = [], idx = 0, timer = null, playing = true;

  const parse = () => $("input").value.split(/[,\s]+/).map(Number).filter((n) => !isNaN(n) && n !== 0 || n === 0).slice(0, 20);

  function draw() {
    const fr = frames[idx]; if (!fr) return;
    const max = Math.max(...fr.a.map(Math.abs), 1);
    $("bars").innerHTML = fr.a.map((v, i) => {
      const cls = fr.done.includes(i) ? "done" : i === fr.piv ? "piv" : fr.cmp.includes(i) ? "cmp" : "";
      return `<div class="bar ${cls}" style="height:${Math.max(Math.abs(v) / max * 90, 4)}%"><span>${v}</span></div>`;
    }).join("");
    $("msg").textContent = fr.msg;
    $("count").textContent = `${idx + 1} / ${frames.length}`;
    $("log").innerHTML = frames.map((x, i) => `<li class="${i === idx ? "on" : ""}">${x.msg}</li>`).join("");
    const on = $("log").querySelector(".on"); if (on) $("log").scrollTop = on.offsetTop - 80;
  }

  function loop() {
    clearInterval(timer);
    if (!playing) return;
    timer = setInterval(() => {
      if (idx < frames.length - 1) { idx++; draw(); } else { playing = false; $("play").textContent = "Replay"; clearInterval(timer); }
    }, 1100 - $("speed").value * 100);
  }

  $("start").onclick = () => {
    const arr = parse();
    if (arr.length < 2) return ($("msg").textContent = "Please enter at least 2 numbers.");
    frames = algo === "quick" ? quickSteps(arr) : mergeSteps(arr);
    idx = 0; playing = true; $("play").textContent = "Pause"; draw(); loop();
  };
  $("play").onclick = () => {
    if (!frames.length) return;
    if (idx === frames.length - 1) idx = 0;
    playing = !playing; $("play").textContent = playing ? "Pause" : "Play"; draw(); loop();
  };
  $("next").onclick = () => { playing = false; $("play").textContent = "Play"; clearInterval(timer); if (idx < frames.length - 1) idx++; draw(); };
  $("prev").onclick = () => { playing = false; $("play").textContent = "Play"; clearInterval(timer); if (idx > 0) idx--; draw(); };
  $("speed").oninput = loop;
  $("random").onclick = () => {
    $("input").value = Array.from({ length: 8 }, () => Math.floor(Math.random() * 99) + 1).join(", ");
    $("start").click();
  };
  $("start").click();
}
