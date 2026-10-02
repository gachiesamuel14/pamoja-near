const COUNTIES = ["Nairobi","Mombasa","Kisumu","Nakuru","Kiambu","Machakos","Kajiado","Uasin Gishu","Nyeri","Meru","Kilifi","Kakamega","Kisii","Murang'a","Laikipia"];
const PEOPLE = [
  { id: 1, name: "Amina", age: 26, county: "Mombasa", town: "Nyali", km: 4.2, mode: "professional", religion: "Muslim", interests: ["beach walks", "swahili food", "design"], bio: "Architect who clocks out for the ocean. Looking for someone calm, funny, and serious about plans.", hue: "210,70%,46%" },
  { id: 2, name: "Brian", age: 29, county: "Nairobi", town: "Kilimani", km: 2.1, mode: "professional", religion: "Christian", interests: ["coffee", "running", "startups"], bio: "Product lead. Weekends are Karura or a long lunch. No games, just good conversation.", hue: "18,72%,42%" },
  { id: 3, name: "Wanjiku", age: 23, county: "Kiambu", town: "Ruiru", km: 11, mode: "student", religion: "Christian", interests: ["gospel", "books", "matatus stories"], bio: "Final-year student. Church on Sunday, library most nights. Kindness is non-negotiable.", hue: "142,40%,32%" },
  { id: 4, name: "Otieno", age: 31, county: "Kisumu", town: "Milimani", km: 6.4, mode: "professional", religion: "Christian", interests: ["lake", "football", "nyam chom"], bio: "Teacher and weekend fisherman. I like people who laugh easily and keep their word.", hue: "200,55%,38%" },
  { id: 5, name: "Faith", age: 27, county: "Nakuru", town: "Milimani", km: 8, mode: "church", religion: "Christian", interests: ["choir", "hiking", "baking"], bio: "Church mode on purpose. Looking for marriage-minded, not a situationship.", hue: "330,45%,42%" },
  { id: 6, name: "Jamal", age: 24, county: "Nairobi", town: "Eastleigh", km: 5.5, mode: "student", religion: "Muslim", interests: ["photography", "chai", "code"], bio: "CS student building small apps. Sheng welcome. Let's meet somewhere public first.", hue: "28,70%,40%" },
  { id: 7, name: "Chebet", age: 28, county: "Uasin Gishu", town: "Elgon View", km: 3.3, mode: "professional", religion: "Christian", interests: ["athletics", "travel", "tea farms"], bio: "Based in Eldoret. Early mornings, honest texts, and someone who can keep up on a long walk.", hue: "160,35%,30%" },
  { id: 8, name: "Njeri", age: 30, county: "Nyeri", town: "King'ong'o", km: 9, mode: "church", religion: "Christian", interests: ["farm visits", "jazz", "mentorship"], bio: "Accountant who still goes home for Sundays. Warm, direct, and done with small talk loops.", hue: "12,60%,38%" }
];

const state = {
  view: "home",
  user: JSON.parse(localStorage.getItem("pamoja-user") || "null"),
  likes: JSON.parse(localStorage.getItem("pamoja-likes") || "[]"),
  passes: JSON.parse(localStorage.getItem("pamoja-passes") || "[]"),
  matches: JSON.parse(localStorage.getItem("pamoja-matches") || "[]"),
  chats: JSON.parse(localStorage.getItem("pamoja-chats") || "{}"),
  filters: { county: "Any", mode: "Any", maxKm: 50, minAge: 18, maxAge: 40 },
  index: 0,
  chatWith: null,
  toast: "",
  loc: "Location not shared yet"
};

function save() {
  localStorage.setItem("pamoja-user", JSON.stringify(state.user));
  localStorage.setItem("pamoja-likes", JSON.stringify(state.likes));
  localStorage.setItem("pamoja-passes", JSON.stringify(state.passes));
  localStorage.setItem("pamoja-matches", JSON.stringify(state.matches));
  localStorage.setItem("pamoja-chats", JSON.stringify(state.chats));
}

function toast(msg) {
  state.toast = msg;
  render();
  setTimeout(() => { state.toast = ""; render(); }, 2200);
}

function haversine(a, b) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLon = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function nearby() {
  return PEOPLE.filter(p => {
    if (state.passes.includes(p.id) || state.likes.includes(p.id)) return false;
    if (state.filters.county !== "Any" && p.county !== state.filters.county) return false;
    if (state.filters.mode !== "Any" && p.mode !== state.filters.mode) return false;
    if (p.km > Number(state.filters.maxKm)) return false;
    if (p.age < state.filters.minAge || p.age > state.filters.maxAge) return false;
    return true;
  });
}

function shell(inner) {
  const u = state.user;
  return `
    <div class="shell">
      <header class="top">
        <div class="brand"><div class="mark">P</div> Pamoja</div>
        <nav class="nav">
          <button data-go="home" class="${state.view==="home"?"active":""}">Home</button>
          <button data-go="discover" class="${state.view==="discover"?"active":""}">Nearby</button>
          <button data-go="matches" class="${state.view==="matches"?"active":""}">Matches</button>
          <button data-go="safety" class="${state.view==="safety"?"active":""}">Safety</button>
          ${u ? `<button data-go="profile">Profile</button><button id="logout">Log out</button>` : `<button data-go="auth" class="solid">Join</button>`}
        </nav>
      </header>
      ${inner}
      ${state.toast ? `<div class="toast">${state.toast}</div>` : ""}
    </div>`;
}

function home() {
  return shell(`
    <section class="hero">
      <div>
        <div class="kicker">Kenya · location matchmaking</div>
        <h1>Meet someone close enough to actually meet.</h1>
        <p class="lede">Pamoja matches people by county, town, and distance — Nairobi to Mombasa, Kisumu to Eldoret. Student mode, professional mode, or church mode.</p>
        <div class="row">
          <button class="solid" data-go="auth">Create a profile</button>
          <button class="ghost" data-go="discover">See nearby demo</button>
        </div>
        <div class="pills">
          <span class="pill">47 counties</span><span class="pill">M-Pesa premium</span><span class="pill">Sheng welcome</span><span class="pill">18+ only</span>
        </div>
      </div>
      <div class="phone">
        <div class="notice">Demo uses sample profiles stored in your browser. Real GPS, chat, and payments need a backend — see the README.</div>
        <div class="grid-2" style="margin-top:12px">
          ${PEOPLE.slice(0,4).map(p => `<div class="card"><strong>${p.name}, ${p.age}</strong><div class="muted">${p.town}, ${p.county} · ${p.km} km</div></div>`).join("")}
        </div>
      </div>
    </section>
    <section class="grid-3">
      <article class="panel"><h3>County first</h3><p class="muted">Filter Nairobi, Kiambu, Mombasa, Kisumu and the rest. Distance uses your coordinates when you allow location.</p></article>
      <article class="panel"><h3>Modes</h3><p class="muted">Student, professional, or church. Same app, different intention — casual coffee or marriage-minded.</p></article>
      <article class="panel"><h3>Safety built in</h3><p class="muted">Report, block, and a public-meetup reminder before anyone shares a number.</p></article>
    </section>`);
}

function auth() {
  return shell(`
    <section style="padding-top:28px">
      <h1>Join Pamoja</h1>
      <p class="muted">18+ only. This demo keeps your profile on this device.</p>
      <form id="join" class="form" style="margin-top:16px">
        <label>Name <input name="name" required placeholder="Your first name" /></label>
        <label>Age <input name="age" type="number" min="18" max="80" required value="24" /></label>
        <label>County <select name="county">${COUNTIES.map(c => `<option>${c}</option>`).join("")}</select></label>
        <label>Town <input name="town" placeholder="Kilimani, Nyali, Milimani…" /></label>
        <label>Mode
          <select name="mode"><option value="professional">Professional</option><option value="student">Student</option><option value="church">Church</option></select>
        </label>
        <label>Bio <textarea name="bio" rows="3" placeholder="What are you actually looking for?"></textarea></label>
        <button class="solid" type="submit">Save profile & continue</button>
      </form>
    </section>`);
}

function discover() {
  const list = nearby();
  const p = list[0];
  return shell(`
    <div class="layout">
      <aside class="panel">
        <h3>Filters</h3>
        <form id="filters" class="form">
          <label>County <select name="county"><option>Any</option>${COUNTIES.map(c => `<option ${state.filters.county===c?"selected":""}>${c}</option>`).join("")}</select></label>
          <label>Mode <select name="mode">${["Any","student","professional","church"].map(m => `<option ${state.filters.mode===m?"selected":""}>${m}</option>`).join("")}</select></label>
          <label>Max distance (km) <input name="maxKm" type="number" value="${state.filters.maxKm}" /></label>
          <label>Age from <input name="minAge" type="number" value="${state.filters.minAge}" /></label>
          <label>Age to <input name="maxAge" type="number" value="${state.filters.maxAge}" /></label>
          <button class="solid" type="submit">Apply</button>
          <button type="button" id="gps" class="ghost">Use my GPS</button>
          <p class="muted">${state.loc}</p>
        </form>
      </aside>
      <section>
        ${p ? `
          <article class="profile-card">
            <div class="cover" style="background:linear-gradient(160deg, hsl(${p.hue}), #1c1410 80%)">
              <div><div class="pill">${p.mode} · ${p.religion}</div><h2>${p.name}, ${p.age}</h2><div>${p.town}, ${p.county} · ${p.km} km away</div></div>
            </div>
            <div style="padding:16px">
              <p>${p.bio}</p>
              <div class="chips">${p.interests.map(i => `<span class="chip">${i}</span>`).join("")}</div>
            </div>
            <div class="actions">
              <button class="pass" data-pass="${p.id}">✕</button>
              <button data-report="${p.id}">⚑</button>
              <button class="like" data-like="${p.id}">♥</button>
            </div>
          </article>` : `<div class="panel"><h2>No one in this radius</h2><p class="muted">Widen the distance or switch county. Likes you already sent are in Matches.</p></div>`}
      </section>
    </div>`);
}

function matches() {
  const people = state.matches.map(id => PEOPLE.find(p => p.id === id)).filter(Boolean);
  const active = PEOPLE.find(p => p.id === state.chatWith) || people[0];
  const thread = active ? (state.chats[active.id] || [{ from: "them", text: `Sasa, I'm ${active.name}. Public spot only for a first meet — deal?` }]) : [];
  return shell(`
    <section style="padding-top:22px">
      <h1>Matches</h1>
      <p class="muted">A match is mutual in the real app. Here, a like opens chat so you can try the flow.</p>
      <div class="panel chat" style="margin-top:14px">
        <div class="thread">
          ${people.length ? people.map(p => `<button data-chat="${p.id}" style="display:block;width:100%;text-align:left;border:0;background:${active&&active.id===p.id?"#f6efe8":"transparent"};padding:12px"><strong>${p.name}</strong><div class="muted">${p.town}</div></button>`).join("") : `<p class="muted" style="padding:12px">Like someone nearby first.</p>`}
        </div>
        <div style="padding:12px;display:flex;flex-direction:column">
          ${active ? thread.map(m => `<div class="msg ${m.from==="me"?"mine":"theirs"}">${m.text}</div>`).join("") + `
            <form id="send" style="margin-top:auto;display:flex;gap:8px">
              <input name="text" placeholder="Andika ujumbe…" style="flex:1" />
              <button class="solid" type="submit">Send</button>
            </form>` : ""}
        </div>
      </div>
    </section>`);
}

function safety() {
  return shell(`
    <section style="padding-top:28px;max-width:680px">
      <h1>Safety</h1>
      <div class="grid-2" style="margin-top:16px">
        <article class="panel"><h3>Meet in public</h3><p class="muted">First meet at a cafe, mall, or campus spot. Tell a friend where you are going.</p></article>
        <article class="panel"><h3>Report & block</h3><p class="muted">The flag on a profile records a report on this device and hides that person.</p></article>
        <article class="panel"><h3>Money</h3><p class="muted">Pamoja will never ask you to send someone M-Pesa to “verify” a date.</p></article>
        <article class="panel"><h3>Premium, later</h3><p class="muted">See who liked you and boosts in your county. STK push via Daraja when a backend is connected.</p></article>
      </div>
    </section>`);
}

function profile() {
  const u = state.user;
  if (!u) return auth();
  return shell(`
    <section style="padding-top:28px;max-width:560px">
      <h1>${u.name}, ${u.age}</h1>
      <p class="muted">${u.town || "Town not set"}, ${u.county} · ${u.mode} mode</p>
      <p>${u.bio || "Add a bio so nearby people know the vibe."}</p>
      <div class="notice">Photo upload in production goes to object storage (S3 or Cloudinary), not the browser. Notifications would use web push or SMS.</div>
    </section>`);
}

function render() {
  const views = { home, auth, discover, matches, safety, profile };
  document.getElementById("app").innerHTML = (views[state.view] || home)();
  bind();
}

function bind() {
  document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { state.view = b.dataset.go; render(); });
  const logout = document.getElementById("logout");
  if (logout) logout.onclick = () => { state.user = null; save(); state.view = "home"; render(); };
  const join = document.getElementById("join");
  if (join) join.onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(join);
    if (Number(f.get("age")) < 18) return toast("You must be 18+");
    state.user = Object.fromEntries(f.entries());
    save(); state.view = "discover"; toast("Profile saved"); render();
  };
  const filters = document.getElementById("filters");
  if (filters) filters.onsubmit = (e) => {
    e.preventDefault();
    state.filters = Object.fromEntries(new FormData(filters).entries());
    render();
  };
  const gps = document.getElementById("gps");
  if (gps) gps.onclick = () => {
    if (!navigator.geolocation) return toast("GPS not available");
    navigator.geolocation.getCurrentPosition(pos => {
      const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const nairobi = { lat: -1.286389, lng: 36.817223 };
      state.loc = `GPS on · about ${haversine(here, nairobi).toFixed(0)} km from Nairobi CBD`;
      toast("Location updated");
    }, () => toast("Location permission denied"));
  };
  document.querySelectorAll("[data-like]").forEach(b => b.onclick = () => {
    const id = Number(b.dataset.like);
    state.likes.push(id); state.matches.push(id); save(); toast("It's a match — say hi"); state.view = "matches"; state.chatWith = id; render();
  });
  document.querySelectorAll("[data-pass]").forEach(b => b.onclick = () => { state.passes.push(Number(b.dataset.pass)); save(); render(); });
  document.querySelectorAll("[data-report]").forEach(b => b.onclick = () => { state.passes.push(Number(b.dataset.report)); save(); toast("Reported and hidden"); render(); });
  document.querySelectorAll("[data-chat]").forEach(b => b.onclick = () => { state.chatWith = Number(b.dataset.chat); render(); });
  const send = document.getElementById("send");
  if (send) send.onsubmit = (e) => {
    e.preventDefault();
    const text = new FormData(send).get("text").trim();
    if (!text || !state.chatWith) return;
    const id = state.chatWith;
    state.chats[id] = state.chats[id] || [{ from: "them", text: "Sasa. Public spot for a first meet?" }];
    state.chats[id].push({ from: "me", text });
    save(); render();
  };
}

render();
