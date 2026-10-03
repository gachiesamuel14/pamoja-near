const COUNTIES = ["Nairobi","Mombasa","Kisumu","Nakuru","Kiambu","Uasin Gishu","Machakos","Kajiado","Kilifi","Nyeri","Meru","Kakamega"];
const INTERESTS = ["Coffee","Hiking","Gospel","Afrobeats","Football","Cooking","Startups","Travel","Reading","Beach"];
const TRIBES = ["Any","Kikuyu","Luo","Luhya","Kamba","Kalenjin","Kisii","Meru","Mijikenda","Somali","Other"];
const RELIGIONS = ["Any","Christian","Muslim","Traditional","Spiritual","Prefer not to say"];
const MODES = ["Student","Professional","Church"];

const SEED = [
  { id:"amina", name:"Amina", age:26, county:"Mombasa", town:"Nyali", lat:-4.0435, lng:39.6682, tribe:"Mijikenda", religion:"Muslim", mode:"Professional", interests:["Beach","Travel","Cooking"], bio:"Architect who disappears to the coast on Fridays. Halal food, slow walks, no games.", color:"#c4522a" },
  { id:"brian", name:"Brian", age:29, county:"Nairobi", town:"Kilimani", lat:-1.2921, lng:36.787, tribe:"Kikuyu", religion:"Christian", mode:"Professional", interests:["Startups","Coffee","Football"], bio:"Product guy in Kilimani. Weeknights are Java and a run. Looking for someone who texts back.", color:"#2f6b4f" },
  { id:"wanjiku", name:"Wanjiku", age:23, county:"Kiambu", town:"Ruiru", lat:-1.1489, lng:36.9606, tribe:"Kikuyu", religion:"Christian", mode:"Student", interests:["Gospel","Reading","Afrobeats"], bio:"KU student. Church on Sunday, gengetone when nobody is looking.", color:"#8a4b2f" },
  { id:"otieno", name:"Otieno", age:31, county:"Kisumu", town:"Milimani", lat:-0.0917, lng:34.768, tribe:"Luo", religion:"Christian", mode:"Professional", interests:["Football","Cooking","Travel"], bio:"I will cook fish and argue about Gor Mahia. Kisumu forever, Nairobi sometimes.", color:"#345c8a" },
  { id:"faith", name:"Faith", age:27, county:"Uasin Gishu", town:"Eldoret", lat:0.5143, lng:35.2698, tribe:"Kalenjin", religion:"Christian", mode:"Church", interests:["Gospel","Hiking","Coffee"], bio:"Marriage-minded. I value prayer, honesty, and someone who can hike the escarpment.", color:"#6b4b8a" },
  { id:"leila", name:"Leila", age:24, county:"Nairobi", town:"Eastleigh", lat:-1.273, lng:36.848, tribe:"Somali", religion:"Muslim", mode:"Student", interests:["Reading","Coffee","Travel"], bio:"USIU. Quiet until I trust you. Tea over clubs.", color:"#9a3b1c" },
  { id:"kevin", name:"Kevin", age:28, county:"Nakuru", town:"Milimani", lat:-0.3031, lng:36.08, tribe:"Kisii", religion:"Christian", mode:"Professional", interests:["Hiking","Football","Startups"], bio:"Lake days and a small business. Not looking for pen pals.", color:"#3d6b4f" },
  { id:"njeri", name:"Njeri", age:30, county:"Machakos", town:"Athi River", lat:-1.45, lng:36.98, tribe:"Kamba", religion:"Christian", mode:"Professional", interests:["Cooking","Gospel","Beach"], bio:"Works in Nairobi, lives quieter in Machakos. Church mode, but I laugh loud.", color:"#b co".replace(" ","") }
];
SEED[7].color = "#a15c38";

const store = {
  load() { try { return JSON.parse(localStorage.getItem("pamoja") || "{}"); } catch { return {}; } },
  save(data) { localStorage.setItem("pamoja", JSON.stringify(data)); }
};

let state = Object.assign({
  view: "home", user: null, notices: [], likes: {}, passes: {}, matches: [], chats: {}, blocks: [], reports: [],
  filters: { county: "Any", distance: 80, minAge: 18, maxAge: 40, tribe: "Any", religion: "Any", mode: "Any" },
  location: null, chatWith: null
}, store.load());

function persist() { store.save(state); }
function km(a, b) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function countyCenter(name) {
  const hit = SEED.find(p => p.county === name);
  return hit ? { lat: hit.lat, lng: hit.lng } : { lat: -1.286, lng: 36.817 };
}
function notify(text) {
  state.notices.unshift({ id: Date.now(), text, at: new Date().toLocaleTimeString() });
  persist(); render();
}
function toast(text) {
  const el = document.createElement("div");
  el.className = "toast"; el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}
function go(view) { state.view = view; persist(); render(); }

function nearby() {
  const me = state.user;
  if (!me) return [];
  const origin = state.location || countyCenter(me.county);
  return SEED.filter(p => !state.blocks.includes(p.id) && !state.passes[p.id] && !state.likes[p.id])
    .map(p => {
      const distance = km(origin, p);
      const shared = p.interests.filter(i => (me.interests || []).includes(i)).length;
      const modeBoost = me.mode && p.mode === me.mode ? 12 : 0;
      const score = Math.max(1, Math.round(100 - distance + shared * 8 + modeBoost));
      return { ...p, distance, score };
    })
    .filter(p => {
      const f = state.filters;
      if (f.county !== "Any" && p.county !== f.county) return false;
      if (p.distance > Number(f.distance)) return false;
      if (p.age < Number(f.minAge) || p.age > Number(f.maxAge)) return false;
      if (f.tribe !== "Any" && p.tribe !== f.tribe) return false;
      if (f.religion !== "Any" && p.religion !== f.religion) return false;
      if (f.mode !== "Any" && p.mode !== f.mode) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score);
}

function like(person) {
  state.likes[person.id] = true;
  const mutual = true;
  state.matches.push({ id: person.id, at: Date.now() });
  state.chats[person.id] = state.chats[person.id] || [{ from: "them", text: `Sasa ${state.user.name.split(" ")[0]} — saw we matched from ${person.town}.` }];
  notify(`New match with ${person.name} in ${person.town}.`);
  toast(`It's a match with ${person.name}`);
  persist(); render();
}
function pass(person) { state.passes[person.id] = true; persist(); render(); }

function shell(inner) {
  const noteCount = state.notices.length;
  document.getElementById("app").innerHTML = `
    <header class="top">
      <div class="brand"><div class="mark">P</div> Pamoja</div>
      <nav class="nav">
        <button class="${state.view==="home"?"active":""}" data-go="home">Home</button>
        <button class="${state.view==="nearby"?"active":""}" data-go="nearby">Nearby</button>
        <button class="${state.view==="matches"?"active":""}" data-go="matches">Matches</button>
        <button class="${state.view==="safety"?"active":""}" data-go="safety">Safety</button>
        <button class="${state.view==="notes"?"active":""}" data-go="notes">Alerts ${noteCount?`<span class="badge">${noteCount}</span>`:""}</button>
        ${state.user ? `<button data-go="profile">Profile</button><button data-go="premium">Premium</button><button id="logout">Log out</button>` : `<button class="solid" data-go="join">Join</button>`}
      </nav>
    </header>
    <main class="wrap">${inner}</main>`;
  document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  const out = document.getElementById("logout");
  if (out) out.onclick = () => { state.user = null; persist(); go("home"); };
}

function home() {
  shell(`
    <section class="hero">
      <div>
        <div class="kicker">Kenya · location matchmaking</div>
        <h1>Meet someone close enough to actually meet.</h1>
        <p class="lede">Pamoja ranks people by county, town, and distance — Nairobi to Mombasa, Kisumu to Eldoret. Student mode, professional mode, or church mode.</p>
        <div class="row">
          <button class="solid" data-go="join">Create a profile</button>
          <button class="ghost" data-go="nearby">See nearby</button>
        </div>
        <div class="pills">
          <span class="pill">47 counties, demo set focused</span>
          <span class="pill">M-Pesa premium later</span>
          <span class="pill">Sheng welcome</span>
          <span class="pill">18+ only</span>
        </div>
        <p class="note">Demo profiles live in your browser. Real GPS permission is requested on Nearby. Chat and payments need a backend before launch.</p>
      </div>
      <div class="stack">
        ${SEED.slice(0,4).map(p => `<article class="person"><div class="avatar" style="background:${p.color}">${p.name[0]}</div><div><strong>${p.name}, ${p.age}</strong><div class="muted">${p.town}, ${p.county}</div><div class="note">${p.mode} · ${p.interests.slice(0,2).join(", ")}</div></div></article>`).join("")}
      </div>
    </section>
    <section class="grid3">
      <article class="card"><h3>County first</h3><p class="muted">Filter Nairobi, Kiambu, Mombasa, Kisumu and more. Distance uses your coordinates when you allow location.</p></article>
      <article class="card"><h3>Modes</h3><p class="muted">Student, professional, or church. Same app, different intention.</p></article>
      <article class="card"><h3>Safety</h3><p class="muted">Report, block, and a public-meetup reminder before anyone shares a number.</p></article>
    </section>`);
  document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
}

function join() {
  shell(`
    <section class="panel" style="max-width:640px;margin:auto">
      <h2>Create your profile</h2>
      <p class="muted">18+ only. This demo saves the profile on this device.</p>
      <form id="joinForm">
        <div class="form-grid">
          <div><label>First name</label><input name="name" required placeholder="Achieng" /></div>
          <div><label>Age</label><input name="age" type="number" min="18" max="70" required value="24" /></div>
          <div><label>County</label><select name="county">${COUNTIES.map(c => `<option>${c}</option>`).join("")}</select></div>
          <div><label>Town</label><input name="town" required placeholder="Westlands" /></div>
          <div><label>Mode</label><select name="mode">${MODES.map(m => `<option>${m}</option>`).join("")}</select></div>
          <div><label>Religion</label><select name="religion">${RELIGIONS.filter(r=>r!=="Any").map(r=>`<option>${r}</option>`).join("")}</select></div>
          <div><label>Community / tribe (optional)</label><select name="tribe">${TRIBES.filter(t=>t!=="Any").map(t=>`<option>${t}</option>`).join("")}</select></div>
          <div><label>Photo</label><input name="photo" type="file" accept="image/*" /></div>
        </div>
        <label>Interests</label>
        <div class="pills">${INTERESTS.map(i => `<label class="pill"><input type="checkbox" name="interests" value="${i}" /> ${i}</label>`).join("")}</div>
        <label>Bio</label>
        <textarea name="bio" required placeholder="What a first date in your town looks like."></textarea>
        <div class="row"><button class="solid" type="submit">Save and see nearby</button></div>
      </form>
    </section>`);
  document.getElementById("joinForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const age = Number(fd.get("age"));
    if (age < 18) return toast("Pamoja is 18+ only.");
    let photo = "";
    const file = fd.get("photo");
    if (file && file.size) photo = await fileToData(file);
    state.user = {
      name: fd.get("name"), age, county: fd.get("county"), town: fd.get("town"),
      mode: fd.get("mode"), religion: fd.get("religion"), tribe: fd.get("tribe"),
      interests: fd.getAll("interests"), bio: fd.get("bio"), photo
    };
    notify("Profile saved. Allow location on the next screen for real distance.");
    go("nearby");
  };
}

function fileToData(file) {
  return new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });
}

function profile() {
  if (!state.user) return go("join");
  const u = state.user;
  shell(`
    <section class="panel" style="max-width:640px;margin:auto">
      <h2>${u.name}, ${u.age}</h2>
      <p class="muted">${u.town}, ${u.county} · ${u.mode}</p>
      ${u.photo ? `<img src="${u.photo}" alt="Your photo" style="width:120px;height:120px;object-fit:cover;border-radius:18px" />` : ""}
      <p>${u.bio}</p>
      <div class="pills">${u.interests.map(i => `<span class="pill">${i}</span>`).join("")}</div>
      <p class="note">Community: ${u.tribe} · ${u.religion}</p>
      <button class="ghost" id="edit">Edit profile</button>
    </section>`);
  document.getElementById("edit").onclick = () => go("join");
}

function filtersHtml() {
  const f = state.filters;
  return `<form id="filters" class="card">
    <h3>Filters</h3>
    <label>County</label><select name="county"><option>Any</option>${COUNTIES.map(c => `<option ${f.county===c?"selected":""}>${c}</option>`).join("")}</select>
    <label>Max distance (km)</label><input name="distance" type="number" value="${f.distance}" min="1" max="800" />
    <div class="form-grid">
      <div><label>Min age</label><input name="minAge" type="number" value="${f.minAge}" min="18" /></div>
      <div><label>Max age</label><input name="maxAge" type="number" value="${f.maxAge}" /></div>
    </div>
    <label>Community</label><select name="tribe">${TRIBES.map(t => `<option ${f.tribe===t?"selected":""}>${t}</option>`).join("")}</select>
    <label>Religion</label><select name="religion">${RELIGIONS.map(t => `<option ${f.religion===t?"selected":""}>${t}</option>`).join("")}</select>
    <label>Mode</label><select name="mode"><option ${f.mode==="Any"?"selected":""}>Any</option>${MODES.map(m => `<option ${f.mode===m?"selected":""}>${m}</option>`).join("")}</select>
    <div class="row"><button class="solid" type="submit">Apply</button><button type="button" class="ghost" id="gps">Use my GPS</button></div>
    <p class="note">${state.location ? "Using your coordinates." : "Using your county centre until you allow GPS."}</p>
  </form>`;
}

function nearbyView() {
  if (!state.user) return go("join");
  const people = nearby();
  const p = people[0];
  const card = p ? `
    <div class="swipe" style="background:${p.color}">
      <div class="chip">${p.score} match score</div>
      <h2>${p.name}, ${p.age}</h2>
      <div>${p.town}, ${p.county} · ${p.distance.toFixed(1)} km</div>
      <div class="chips">${p.interests.map(i => `<span class="chip">${i}</span>`).join("")}<span class="chip">${p.mode}</span></div>
      <p>${p.bio}</p>
      <div class="actions">
        <button class="pass" id="pass">Pass</button>
        <button class="like" id="like">Like</button>
      </div>
    </div>` : `<div class="card"><h3>No one in this filter</h3><p class="muted">Widen distance or switch county. Demo has 8 people.</p></div>`;
  shell(`<section class="deck">${card}<div>${filtersHtml()}<article class="card" style="margin-top:12px"><h3>How matching works</h3><p class="muted">Score = closeness + shared interests + same mode. A like in this demo creates a match so you can try chat. A real app waits for a mutual like.</p></article></div></section>`);
  document.getElementById("filters").onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.filters = Object.fromEntries(fd.entries());
    persist(); render();
  };
  const gps = document.getElementById("gps");
  if (gps) gps.onclick = () => {
    if (!navigator.geolocation) return toast("GPS not available in this browser.");
    navigator.geolocation.getCurrentPosition(pos => {
      state.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      notify("Location saved on this device.");
      toast("Location updated");
      persist(); render();
    }, () => toast("Location permission denied. County centre still works."));
  };
  if (p) {
    document.getElementById("pass").onclick = () => pass(p);
    document.getElementById("like").onclick = () => like(p);
  }
}

function matchesView() {
  if (!state.user) return go("join");
  const items = state.matches.map(m => SEED.find(p => p.id === m.id)).filter(Boolean);
  if (!state.chatWith && items[0]) state.chatWith = items[0].id;
  const current = SEED.find(p => p.id === state.chatWith);
  const thread = current ? (state.chats[current.id] || []) : [];
  shell(`
    <section class="deck">
      <div class="list">
        ${items.length ? items.map(p => `<button class="item" data-chat="${p.id}"><div class="avatar" style="width:52px;height:52px;background:${p.color}">${p.name[0]}</div><div><strong>${p.name}</strong><div class="note">${p.town}</div></div><span class="pill">Chat</span></button>`).join("") : `<div class="card">No matches yet. Like someone nearby.</div>`}
      </div>
      <div class="chat">
        ${current ? `<div style="padding:12px;border-bottom:1px solid var(--line)"><strong>${current.name}</strong><div class="note">Meet in public first. Do not send money.</div></div>
        <div class="bubbles">${thread.map(m => `<div class="bubble ${m.from==="me"?"me":""}">${escapeHtml(m.text)}</div>`).join("")}</div>
        <form class="composer" id="send"><input name="text" placeholder="Andika ujumbe..." required /><button class="solid" type="submit">Send</button></form>` : `<div class="bubbles muted">Pick a match.</div>`}
      </div>
    </section>`);
  document.querySelectorAll("[data-chat]").forEach(b => b.onclick = () => { state.chatWith = b.dataset.chat; render(); });
  const form = document.getElementById("send");
  if (form) form.onsubmit = (e) => {
    e.preventDefault();
    const text = new FormData(e.target).get("text");
    state.chats[current.id].push({ from: "me", text });
    state.chats[current.id].push({ from: "them", text: "Poa. Coffee this weekend, public place?" });
    persist(); render();
  };
}

function notesView() {
  shell(`<section class="panel"><h2>Notifications</h2>${state.notices.length ? state.notices.map(n => `<p><strong>${n.at}</strong> — ${n.text}</p>`).join("") : `<p class="muted">No alerts yet.</p>`}</section>`);
}

function safety() {
  shell(`
    <section class="grid3">
      <article class="card"><h3>Meet in public</h3><p class="muted">First meet at Java, a mall, or a church event. Tell a friend where you are.</p></article>
      <article class="card"><h3>Never send money</h3><p class="muted">Premium is the only payment in Pamoja. Anyone asking for M-Pesa to “verify” is a scam.</p></article>
      <article class="card"><h3>Report</h3><p class="muted">Reports in this demo stay on your device. A real launch sends them to moderators.</p></article>
    </section>
    <section class="panel" style="margin-top:16px">
      <h3>Report or block a demo profile</h3>
      <form id="report">
        <label>Person</label>
        <select name="id">${SEED.map(p => `<option value="${p.id}">${p.name} · ${p.town}</option>`).join("")}</select>
        <label>Reason</label>
        <input name="reason" required placeholder="Fake profile, harassment, asking for money" />
        <div class="row"><button class="solid" type="submit">Report and block</button></div>
      </form>
      <p class="note">Blocked: ${state.blocks.length ? state.blocks.join(", ") : "none"}</p>
    </section>`);
  document.getElementById("report").onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.blocks.push(fd.get("id"));
    state.reports.push({ id: fd.get("id"), reason: fd.get("reason"), at: Date.now() });
    notify("Report saved and profile hidden.");
    toast("Reported and blocked");
    persist(); render();
  };
}

function premium() {
  shell(`
    <section class="panel" style="max-width:640px;margin:auto">
      <div class="kicker">Optional</div>
      <h2>Pamoja Plus</h2>
      <p class="muted">See who liked you, extra county radius, and read receipts. Pay with M-Pesa when Daraja is connected.</p>
      <div class="grid3">
        <article class="card"><h3>Free</h3><p>Swipe nearby, 1 mode</p></article>
        <article class="card"><h3>KES 499 / mo</h3><p>Unlimited likes, see likes</p></article>
        <article class="card"><h3>KES 999 / mo</h3><p>Boost in your county</p></article>
      </div>
      <form id="pay" style="margin-top:12px">
        <label>M-Pesa number</label>
        <input name="phone" placeholder="07XXXXXXXX" required />
        <div class="row"><button class="solid" type="submit">Simulate STK push</button></div>
      </form>
      <p class="note">No charge is sent. Production uses Safaricom Daraja STK Push and a webhook.</p>
    </section>`);
  document.getElementById("pay").onsubmit = (e) => {
    e.preventDefault();
    toast("STK prompt simulated. Check your phone in the real app.");
    notify("Premium checkout started for " + new FormData(e.target).get("phone"));
  };
}

function escapeHtml(s) {
  const amp = String.fromCharCode(38) + "amp;";
  const lt = String.fromCharCode(38) + "lt;";
  const gt = String.fromCharCode(38) + "gt;";
  const quot = String.fromCharCode(38) + "quot;";
  return String(s).split("&").join(amp).split("<").join(lt).split(">").join(gt).split('"').join(quot);
}

function render() {
  const views = { home, join, nearby: nearbyView, matches: matchesView, safety, notes: notesView, profile, premium };
  (views[state.view] || home)();
}
render();
