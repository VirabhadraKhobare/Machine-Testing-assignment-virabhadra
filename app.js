const qs = s => document.querySelector(s);
const LSU = 'sns_users', LSP = 'sns_posts', LSC = 'sns_current';
let users = JSON.parse(localStorage.getItem(LSU) || '[]');
let posts = JSON.parse(localStorage.getItem(LSP) || '[]');
let cur = JSON.parse(localStorage.getItem(LSC) || 'null');

const save = ()=>{ localStorage.setItem(LSU, JSON.stringify(users)); localStorage.setItem(LSP, JSON.stringify(posts)); localStorage.setItem(LSC, JSON.stringify(cur)); render(); updateUI(); };

function render(){
  const p = qs('#posts'); if(!p) return;
  p.innerHTML = posts.length ? posts.map(pt=>`<div class="post"><strong>${escapeHTML(pt.user)}</strong><div>${escapeHTML(pt.text)}</div></div>`).join('') : '<div class="muted">No posts yet.</div>';
  const up = qs('#user-posts'); if(up) up.innerHTML = cur ? (posts.filter(x=>x.userId===cur.id).map(pt=>`<div class="post">${escapeHTML(pt.text)}</div>`).join('')||'<div class="muted">You have no posts</div>') : '<div class="muted">Log in to see your posts</div>';
  const ul = qs('#users-list'); if(ul) ul.innerHTML = users.map(u=>`<li>${escapeHTML(u.name)} (${escapeHTML(u.email)})</li>`).join('')||'<li>No users</li>';
}

function escapeHTML(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

function updateUI(){
  if(cur){ qs('#btn-auth')?.classList.add('hidden'); qs('#btn-logout')?.classList.remove('hidden'); qs('#post-creator')?.classList.remove('hidden'); qs('#profile-name').textContent = cur.name; qs('#profile-email').textContent = cur.email; qs('#profile-bio').textContent = cur.bio||''; }
  else { qs('#btn-auth')?.classList.remove('hidden'); qs('#btn-logout')?.classList.add('hidden'); qs('#post-creator')?.classList.add('hidden'); qs('#profile-name').textContent='Guest'; qs('#profile-email').textContent='Not logged in'; }
}

function showSection(id){
  ['page-home','page-profile','page-friends','page-messages','page-notifs'].forEach(pid=>qs('#'+pid)?.classList.add('hidden'));
  qs('#page-'+id)?.classList.remove('hidden');
  document.querySelectorAll('.nav-link').forEach(n=>n.classList.toggle('active', n.dataset.link===id));
}
document.querySelectorAll('.nav-link').forEach(n=>n.addEventListener('click', e=>{ e.preventDefault(); showSection(n.dataset.link); }));
qs('#logo')?.addEventListener('click', e=>{ e.preventDefault(); showSection('home'); });

let isSignup = true;
function renderAuthForm(){ qs('#auth-title').textContent = isSignup ? 'Sign up' : 'Log in'; qs('#name-row').style.display = isSignup ? 'block':'none'; qs('#auth-submit').textContent = isSignup ? 'Create account' : 'Log in'; qs('#auth-msg').textContent=''; }
qs('#btn-auth')?.addEventListener('click', ()=>{ isSignup = false; renderAuthForm(); qs('#auth-modal')?.classList.remove('hidden'); });
qs('#close-auth')?.addEventListener('click', ()=>qs('#auth-modal')?.classList.add('hidden'));
qs('#toggle-auth')?.addEventListener('click', ()=>{ isSignup = !isSignup; renderAuthForm(); });

qs('#auth-submit')?.addEventListener('click', ()=>{
  const email = (qs('#auth-email')?.value||'').trim(); const pw = (qs('#auth-password')?.value||''); const name = (qs('#auth-name')?.value||'').trim();
  if(!email||!pw|| (isSignup && !name)){ qs('#auth-msg').textContent='Please fill required fields'; return; }
  const found = users.find(u=>u.email.toLowerCase()===email.toLowerCase());
  if(isSignup){
    if(found){ qs('#auth-msg').textContent='Email already used'; return; }
    const u = { id: Date.now().toString(36), name, email, password: pw, bio:'' };
    users.unshift(u); cur = u; save(); qs('#auth-modal')?.classList.add('hidden');
  } else {
    if(!found || found.password!==pw){ qs('#auth-msg').textContent='Wrong email or password'; return; }
    cur = found; save(); qs('#auth-modal')?.classList.add('hidden');
  }
});

qs('#btn-logout')?.addEventListener('click', ()=>{ cur=null; save(); });

qs('#btn-post')?.addEventListener('click', ()=>{
  const text = (qs('#post-text')?.value||'').trim();
  if(!text) return;
  posts.unshift({ id: Date.now().toString(36), user: cur?cur.name:'Anon', userId: cur?cur.id:null, text });
  qs('#post-text').value='';
  save();
});

qs('#edit-profile-btn')?.addEventListener('click', ()=>{ if(!cur){ alert('Log in first'); return } qs('#profile-edit')?.classList.toggle('hidden'); qs('#profile-name-input').value = cur.name; qs('#profile-bio-input').value = cur.bio||''; });
qs('#save-profile')?.addEventListener('click', ()=>{ if(!cur) return; cur.name = qs('#profile-name-input').value||cur.name; cur.bio = qs('#profile-bio-input').value||cur.bio; const uidx = users.findIndex(u=>u.id===cur.id); if(uidx>-1) users[uidx]=cur; save(); qs('#profile-edit')?.classList.add('hidden'); });

window.addEventListener('load', ()=>{ render(); updateUI(); showSection('home'); });
