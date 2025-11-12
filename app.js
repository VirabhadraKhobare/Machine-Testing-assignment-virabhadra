// Minimal app.js (10 lines). Full app preserved in app.full.js
const qs = (s) => document.querySelector(s),
  LSU = "sns_users",
  LSP = "sns_posts",
  uid = () => Date.now().toString(36);
let users = JSON.parse(localStorage.getItem(LSU) || "[]"),
  posts = JSON.parse(localStorage.getItem(LSP) || "[]"),
  cur = JSON.parse(localStorage.getItem("sns_currentUser") || "null");
const saveAll = () => {
  localStorage.setItem(LSU, JSON.stringify(users));
  localStorage.setItem(LSP, JSON.stringify(posts));
  localStorage.setItem("sns_currentUser", JSON.stringify(cur));
  render();
};
const render = () => {
  const f = qs("#feed");
  if (!f) return;
  f.innerHTML = posts
    .map(
      (p) =>
        `<div class="card"><strong>${p.user}</strong><div>${p.text}</div></div>`
    )
    .join("");
};
// Auth modal handlers (signup / login)
let isSignup = true;
const renderAuthForm = () => {
  qs('#auth-title') && (qs('#auth-title').textContent = isSignup ? 'Sign up' : 'Log in');
  qs('#auth-submit') && (qs('#auth-submit').textContent = isSignup ? 'Create account' : 'Log in');
  const nameRow = qs('#auth-name')?.closest('.form-row'); if (nameRow) nameRow.style.display = isSignup ? 'flex' : 'none';
};
qs('#btn-auth')?.addEventListener('click', () => { isSignup = true; renderAuthForm(); qs('#auth-modal')?.classList.remove('hidden'); });
qs('#close-auth')?.addEventListener('click', () => qs('#auth-modal')?.classList.add('hidden'));
qs('#toggle-auth')?.addEventListener('click', (e) => { e.preventDefault(); isSignup = !isSignup; renderAuthForm(); });
qs('#auth-submit')?.addEventListener('click', () => {
  const e = qs('#auth-email')?.value?.trim(), pw = qs('#auth-password')?.value, n = qs('#auth-name')?.value?.trim();
  if (!e || !pw || (isSignup && !n)) return alert('Please fill required fields');
  const found = users.find(x => x.email.toLowerCase() === e.toLowerCase());
  if (isSignup) {
    if (found) return alert('Email already used');
    const u = { id: uid(), name: n, email: e, password: pw };
    users.unshift(u); cur = u; saveAll(); qs('#auth-modal')?.classList.add('hidden'); render();
    // update auth buttons and clear form
    qs('#btn-auth')?.classList.add('hidden'); qs('#btn-logout')?.classList.remove('hidden');
    if (qs('#auth-email')) qs('#auth-email').value = '';
    if (qs('#auth-password')) qs('#auth-password').value = '';
    if (qs('#auth-name')) qs('#auth-name').value = '';
  } else {
    if (!found) return alert('Wrong email or password');
    // Support legacy users without password: set password on first login
    if (!found.password) {
      found.password = pw;
    } else if (found.password !== pw) {
      return alert('Wrong email or password');
    }
    cur = found; saveAll(); qs('#auth-modal')?.classList.add('hidden');
    // update auth buttons and UI
    qs('#btn-auth')?.classList.add('hidden'); qs('#btn-logout')?.classList.remove('hidden');
    render();
  }
});
qs("#btn-post")?.addEventListener("click", () => {
  const t = qs("#post-text")?.value?.trim();
  if (!t) return;
  posts.unshift({ id: uid(), user: cur ? cur.name : "Anon", text: t });
  saveAll();
  qs("#post-text").value = "";
});
qs('#btn-logout')?.addEventListener('click', () => { cur = null; saveAll(); qs('#btn-auth')?.classList.remove('hidden'); qs('#btn-logout')?.classList.add('hidden'); render(); });
// Navbar event handling (show/hide sections)
function showSection(name){
  const sections = ['#page-home','#page-profile','#page-friends','#page-messages','#page-notifs'];
  sections.forEach(s=> { const el = qs(s); if(el) el.classList.toggle('hidden', s !== '#page-'+name); });
  ['nav-home','nav-profile','nav-friends','nav-messages','nav-notifs'].forEach(id=>{ const n=qs('#'+id); if(n) n.classList.toggle('active', id.endsWith(name)); });
}
['#nav-home','#nav-profile','#nav-friends','#nav-messages','#nav-notifs','#logo'].forEach(sel=>{
  qs(sel)?.addEventListener('click', (e)=>{ e && e.preventDefault(); const target = sel.replace('#nav-','').replace('#logo','#home').replace('#',''); showSection(target==='logo'?'home': target); });
});
window.addEventListener("load", () => {
  render();
  if (cur) {
    qs("#btn-auth")?.classList.add("hidden");
    qs("#btn-logout")?.classList.remove("hidden");
  }
});
// End
