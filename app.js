// Simple SNS frontend logic using localStorage
// Data shapes
// user: {id, name, email, password, bio}
// post: {id, userId, text, imageDataUrl?, likes:[], comments:[{id,userId,text}], createdAt}

(function(){
  const LS_USERS = 'sns_users';
  const LS_POSTS = 'sns_posts';
  const LS_CURRENT = 'sns_currentUser';
  const LS_CONV = 'sns_conversations';
  const LS_NOTIFS = 'sns_notifications';
  // Helpers
  const qs = sel => document.querySelector(sel);
  const qsa = sel => document.querySelectorAll(sel);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);

  // Elements
  const btnAuth = qs('#btn-auth');
  const btnLogout = qs('#btn-logout');
  const authModal = qs('#auth-modal');
  const closeAuth = qs('#close-auth');
  const authTitle = qs('#auth-title');
  const authName = qs('#auth-name');
  const authEmail = qs('#auth-email');
  const authPassword = qs('#auth-password');
  const authSubmit = qs('#auth-submit');
  const toggleAuth = qs('#toggle-auth');
  const authMsg = qs('#auth-msg');
  const authForm = qs('#auth-forms');

  const postCreator = qs('#post-creator');
  const postText = qs('#post-text');
  const postImage = qs('#post-image');
  const btnPost = qs('#btn-post');

  const feed = qs('#feed');
  const profileHeader = qs('#profile-header');
  const profileName = qs('#profile-name');
  const profileEmail = qs('#profile-email');
  const profileBioText = qs('#profile-bio-text');
  const profileBio = qs('#profile-bio');
  const saveProfile = qs('#save-profile');
  const profileEdit = qs('#profile-edit');
  const editProfileBtn = qs('#edit-profile-btn');
  const profileNameInput = qs('#profile-name-input');

  const usersUl = qs('#users-ul');
  const usersMini = qs('#users-mini');
  const friendsList = qs('#friends-list');
  const friendsSection = qs('#page-friends');

  const navHome = qs('#nav-home');
  const navProfile = qs('#nav-profile');
  const navFriends = qs('#nav-friends');
  const navMessages = qs('#nav-messages');
  const navNotifs = qs('#nav-notifs');
  const logo = qs('#logo');
  const searchInput = qs('#search-input');
  const searchBtn = qs('#search-btn');

  const pageHome = qs('#page-home');
  const pageProfile = qs('#page-profile');
  const pageFriends = qs('#page-friends');
  const pageMessages = qs('#page-messages');
  const pageNotifs = qs('#page-notifs');

  const convoList = qs('#convo-list');
  const chatWindow = qs('#chat-window');
  const chatInput = qs('#chat-input');
  const sendMsgBtn = qs('#send-msg');
  const notificationsList = qs('#notifications-list');
  const userPostsDiv = qs('#user-posts');

  // State
  let users = load(LS_USERS, []);
  let posts = load(LS_POSTS, []);
  let convos = load(LS_CONV, []);
  let notifications = load(LS_NOTIFS, []);
  let current = load(LS_CURRENT, null);
  let isSignup = true;

  // Init
  window.addEventListener('load', init);

  function init(){
    wire();
    renderAuthState();
    renderUsers();
    renderFeed();
    renderProfile();
    renderConversations();
    renderNotifications();
    startBanner();
    showSection('home');
  }

  function wire(){
    btnAuth.addEventListener('click', openAuth);
    closeAuth.addEventListener('click', closeAuthModal);
    toggleAuth.addEventListener('click', toggleAuthMode);
    authSubmit.addEventListener('click', handleAuth);
  if(authForm) authForm.addEventListener('submit', (ev)=>{ ev.preventDefault(); handleAuth(); });
    btnLogout.addEventListener('click', doLogout);

    btnPost.addEventListener('click', handleCreatePost);
    saveProfile.addEventListener('click', saveProfileChanges);
    editProfileBtn.addEventListener('click', ()=>{ profileEdit.classList.toggle('hidden'); });
    navHome.addEventListener('click', (e)=>{ e.preventDefault(); showSection('home'); });
    navProfile.addEventListener('click', (e)=>{ e.preventDefault(); showSection('profile'); });
    navFriends.addEventListener('click', (e)=>{ e.preventDefault(); showSection('friends'); });
    navMessages.addEventListener('click', (e)=>{ e.preventDefault(); showSection('messages'); });
    navNotifs.addEventListener('click', (e)=>{ e.preventDefault(); showSection('notifs'); });
    logo.addEventListener('click', (e)=>{ e.preventDefault(); showSection('home'); });
    searchBtn.addEventListener('click', handleSearch);
    sendMsgBtn.addEventListener('click', sendMessage);
  }

  // Storage helpers
  function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function load(key, fallback){ try{ const v = localStorage.getItem(key); return v?JSON.parse(v):fallback;}catch(e){return fallback} }

  // Auth
  function openAuth(){
    isSignup = true; showAuthModal();
  }
  function showAuthModal(){
    authModal.classList.remove('hidden');
    authMsg.textContent = '';
    renderAuthForm();
  }
  function closeAuthModal(){ authModal.classList.add('hidden'); }

  function toggleAuthMode(){ isSignup = !isSignup; renderAuthForm(); }
  function renderAuthForm(){
    authTitle.textContent = isSignup? 'Sign up' : 'Log in';
    authSubmit.textContent = isSignup? 'Create account':'Log in';
    toggleAuth.textContent = isSignup? 'Have an account? Log in' : 'Need an account? Sign up';
    const nameRow = authName && authName.closest('.form-row');
    if(nameRow) nameRow.style.display = isSignup? 'flex':'none';
    // focus
    if(isSignup){ authName && authName.focus(); } else { authEmail && authEmail.focus(); }
  }

  function handleAuth(){
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const name = authName.value.trim();
    if(!email || !password || (isSignup && !name)){ authMsg.textContent = 'Please fill the required fields.'; return }

    if(isSignup){
      if(users.find(u=>u.email.toLowerCase()===email.toLowerCase())){ authMsg.textContent = 'Email already used.'; return }
      const u = {id:uid(), name, email, password, bio:'', friends:[]};
      users.unshift(u); save(LS_USERS, users);
      current = {id:u.id}; save(LS_CURRENT, current);
      authMsg.textContent = 'Account created — signed in.';
      closeAuthModal(); renderAuthState(); renderUsers(); renderProfile();
    }else{
      const found = users.find(u=>u.email.toLowerCase()===email.toLowerCase() && u.password===password);
      if(!found){ authMsg.textContent = 'Wrong email or password.'; return }
      current = {id:found.id}; save(LS_CURRENT, current);
      authMsg.textContent = 'Signed in.'; closeAuthModal(); renderAuthState(); renderProfile();
    }

    // clear inputs
    authEmail.value=''; authPassword.value=''; authName.value='';
  }

  function doLogout(){ current=null; localStorage.removeItem(LS_CURRENT); renderAuthState(); renderProfile(); }

  function renderAuthState(){
    if(current && getCurrentUser()){
      btnAuth.classList.add('hidden'); btnLogout.classList.remove('hidden');
      postCreator.classList.remove('hidden'); profileHeader && profileHeader.classList.remove('hidden');
    }else{
      btnAuth.classList.remove('hidden'); btnLogout.classList.add('hidden');
      postCreator.classList.add('hidden'); profileHeader && profileHeader.classList.add('hidden');
    }
  }

  function getCurrentUser(){ return current? users.find(u=>u.id===current.id): null }

  // Profile
  function renderProfile(){
    const u = getCurrentUser();
    if(!u){ profileHeader && profileHeader.classList.add('hidden'); return }
    profileHeader && profileHeader.classList.remove('hidden');
    profileName.textContent = u.name;
    profileEmail.textContent = u.email;
    profileBioText.textContent = u.bio || '';
    profileBio && (profileBio.value = u.bio || '');
    profileNameInput && (profileNameInput.value = u.name || '');
    renderUserPosts();
  }
  function saveProfileChanges(){
    const u = getCurrentUser(); if(!u) return;
    u.bio = profileBio.value.trim();
    save(LS_USERS, users);
    renderProfile(); renderFeed();
  }

  // Users list
  function renderUsers(){
    // full list
    usersUl.innerHTML = '';
    usersMini.innerHTML = '';
    users.forEach(u=>{
      const li = document.createElement('li');
      li.textContent = u.name + ' (' + u.email + ')';
      const btn = document.createElement('button'); btn.className='btn'; btn.textContent = 'Add Friend';
      btn.addEventListener('click', ()=> toggleFriend(u.id, btn));
      li.appendChild(btn);
      usersUl.appendChild(li);

      const mini = document.createElement('li'); mini.textContent = u.name; usersMini.appendChild(mini);
    });
    renderFriends();
  }

  function toggleFriend(targetId, btn){
    const me = getCurrentUser(); if(!me){ alert('Sign in to add friends'); return }
    const target = users.find(x=>x.id===targetId); if(!target) return;
    me.friends = me.friends||[];
    const idx = me.friends.indexOf(targetId);
    if(idx===-1){ me.friends.push(targetId); btn.textContent='Remove Friend'; }
    else { me.friends.splice(idx,1); btn.textContent='Add Friend'; }
    save(LS_USERS, users); renderFriends();
  }

  function renderFriends(){
    const me = getCurrentUser(); friendsList.innerHTML=''; if(!me) return;
    const fr = (me.friends||[]).map(id=>users.find(u=>u.id===id)).filter(Boolean);
    if(fr.length===0){ friendsList.textContent='No friends yet.'; return }
    fr.forEach(f=>{
      const d = document.createElement('div'); d.className='row'; d.innerHTML = `<div class="avatar"></div><div><strong>${escapeHtml(f.name)}</strong><div class="muted">${escapeHtml(f.email)}</div></div>`;
      friendsList.appendChild(d);
    });
  }

  // Render posts for current user in profile
  function renderUserPosts(){
    const me = getCurrentUser(); if(!me) { userPostsDiv && (userPostsDiv.innerHTML=''); return }
    const mine = posts.filter(p=>p.userId===me.id);
    userPostsDiv.innerHTML = '';
    if(mine.length===0){ userPostsDiv.innerHTML = '<div class="muted">No posts yet.</div>'; return }
    mine.forEach(p=>{
      const d = document.createElement('div'); d.className='post card';
      d.innerHTML = `<div class="muted" style="font-size:12px">${new Date(p.createdAt).toLocaleString()}</div><div>${escapeHtml(p.text)}</div>`;
      userPostsDiv.appendChild(d);
    });
  }

  // Posts
  function handleCreatePost(){
    const text = postText.value.trim();
    if(!text && !postImage.files.length){ alert('Write something or select an image'); return }
    const u = getCurrentUser(); if(!u){ alert('Please sign in'); return }

    if(postImage.files.length){
      const file = postImage.files[0];
      const reader = new FileReader();
      reader.onload = function(e){ createPostObject(text, e.target.result); }
      reader.readAsDataURL(file);
    }else{
      createPostObject(text, null);
    }

    postText.value=''; postImage.value='';
  }

  function createPostObject(text, imageDataUrl){
    const u = getCurrentUser(); if(!u) return;
    const p = {id:uid(), userId:u.id, text, imageDataUrl, likes:[], comments:[], createdAt: new Date().toISOString()};
    posts.unshift(p); save(LS_POSTS, posts); renderFeed();
  }

  function renderFeed(){
    feed.innerHTML = '';
    if(posts.length===0){ feed.innerHTML = '<div class="card muted">No posts yet — be the first!</div>'; return }
    posts.forEach(p=>{
      const u = users.find(x=>x.id===p.userId) || {name:'Unknown'};
      const el = document.createElement('div'); el.className='post card';

      el.innerHTML = `<div class="post-meta"><div class="avatar"></div><div><strong>${escapeHtml(u.name)}</strong><div class="muted">${new Date(p.createdAt).toLocaleString()}</div></div></div>
        <div class="post-text">${escapeHtml(p.text)}</div>
        ${p.imageDataUrl?'<img class="post-image" src="'+p.imageDataUrl+'">':''}
        <div class="post-actions">
          <button data-id="${p.id}" class="btn like-btn">Like (${p.likes.length})</button>
          <button data-id="${p.id}" class="btn comment-toggle">Comment (${p.comments.length})</button>
          ${current && current.id===p.userId?'<button data-id="'+p.id+'" class="btn delete-btn">Delete</button>':''}
        </div>
        <div class="comments" id="comments-${p.id}"></div>
      `;

      // comments UI
      const commentsDiv = el.querySelector(`#comments-${p.id}`);
      const commentForm = document.createElement('div');
      commentForm.innerHTML = `<div style="margin-top:8px"><input class="comment-input" data-id="${p.id}" placeholder="Write a comment" style="width:70%"><button class="btn add-comment" data-id="${p.id}">Add</button></div>`;
      commentsDiv.appendChild(commentForm);

      // existing comments
      if(p.comments && p.comments.length){
        p.comments.forEach(c=>{
          const cu = users.find(x=>x.id===c.userId) || {name:'Unknown'};
          const cEl = document.createElement('div'); cEl.className='muted';
          cEl.style.padding='6px 0';
          cEl.textContent = cu.name + ': ' + c.text;
          commentsDiv.appendChild(cEl);
        });
      }

      // wire up buttons
      el.querySelector('.like-btn').addEventListener('click', () => toggleLike(p.id));
      el.querySelector('.add-comment').addEventListener('click', (ev)=>{
        const id = ev.target.dataset.id; const input = el.querySelector('.comment-input[data-id="'+id+'"]');
        const txt = input.value.trim(); if(!txt){return}
        addComment(id, txt); input.value='';
      });
      const deleteBtn = el.querySelector('.delete-btn'); if(deleteBtn) deleteBtn.addEventListener('click', ()=>{ deletePost(p.id); });

      feed.appendChild(el);
    });
  }

  function toggleLike(postId){
    const u = getCurrentUser(); if(!u){ alert('Please sign in to like'); return }
    const p = posts.find(x=>x.id===postId); if(!p) return;
    const idx = p.likes.indexOf(u.id);
    if(idx===-1) p.likes.push(u.id); else p.likes.splice(idx,1);
    save(LS_POSTS, posts); renderFeed();
    // notify post owner
    if(p.userId !== u.id){
      notifications.unshift({id:uid(), userId:p.userId, type:'like', by:u.id, postId:p.id, text:`${u.name} liked your post`, createdAt:new Date().toISOString()});
      save(LS_NOTIFS, notifications);
      renderNotifications();
    }
  }

  function addComment(postId, text){
    const u = getCurrentUser(); if(!u){ alert('Please sign in'); return }
    const p = posts.find(x=>x.id===postId); if(!p) return;
    p.comments.push({id:uid(), userId:u.id, text});
    save(LS_POSTS, posts); renderFeed();
    if(p.userId !== u.id){
      notifications.unshift({id:uid(), userId:p.userId, type:'comment', by:u.id, postId:p.id, text:`${u.name} commented: ${text}`, createdAt:new Date().toISOString()});
      save(LS_NOTIFS, notifications); renderNotifications();
    }
  }

  function deletePost(postId){
    const p = posts.find(x=>x.id===postId); if(!p) return; const u = getCurrentUser(); if(!u || p.userId!==u.id){ alert('Not allowed'); return }
    if(!confirm('Delete this post?')) return;
    posts = posts.filter(x=>x.id!==postId); save(LS_POSTS, posts); renderFeed();
  }

  // Conversations / Messages
  function renderConversations(){
    convoList.innerHTML='';
    const me = getCurrentUser(); if(!me){ convoList.innerHTML='<li class="muted">Sign in to view conversations</li>'; return }
    convos.forEach(c=>{
      if(!c.participants.includes(me.id)) return;
      const otherId = c.participants.find(id=>id!==me.id) || me.id;
      const other = users.find(u=>u.id===otherId) || {name:'Unknown'};
      const li = document.createElement('li'); li.textContent = other.name; li.dataset.id = c.id;
      li.addEventListener('click', ()=> openConversation(c.id));
      convoList.appendChild(li);
    });
  }

  function openConversation(id){
    const c = convos.find(x=>x.id===id); if(!c) return;
    chatWindow.innerHTML='';
    c.messages.forEach(m=>{
      const sender = users.find(u=>u.id===m.senderId) || {name:'Unknown'};
      const d = document.createElement('div'); d.innerHTML = `<strong>${escapeHtml(sender.name)}</strong>: ${escapeHtml(m.text)} <div class="muted" style="font-size:11px">${new Date(m.createdAt).toLocaleString()}</div>`;
      chatWindow.appendChild(d);
    });
    chatWindow.dataset.active = id;
  }

  function sendMessage(){
    const me = getCurrentUser(); if(!me){ alert('Sign in to send messages'); return }
    const active = chatWindow.dataset.active; const text = chatInput.value.trim(); if(!text) return;
    let convo;
    if(active){ convo = convos.find(c=>c.id===active); }
    if(!convo){ // create new with first friend in list or prompt
      const friendId = (me.friends && me.friends[0]) || (users.find(u=>u.id!==me.id) && users.find(u=>u.id!==me.id).id);
      if(!friendId){ alert('No one to message yet'); return }
      convo = {id:uid(), participants:[me.id, friendId], messages:[]}; convos.unshift(convo);
    }
    convo.messages.push({id:uid(), senderId:me.id, text, createdAt:new Date().toISOString()});
    save(LS_CONV, convos); chatInput.value=''; openConversation(convo.id); renderConversations();
    // notify other
    const other = convo.participants.find(id=>id!==me.id);
    notifications.unshift({id:uid(), userId:other, type:'message', by:me.id, text:`${me.name} sent you a message`, createdAt:new Date().toISOString()});
    save(LS_NOTIFS, notifications); renderNotifications();
  }

  function renderNotifications(){
    notificationsList.innerHTML='';
    const me = getCurrentUser(); if(!me){ notificationsList.textContent='Sign in to view notifications'; return }
    const mine = notifications.filter(n=>n.userId===me.id);
    if(mine.length===0){ notificationsList.textContent='No notifications'; return }
    mine.forEach(n=>{
      const by = users.find(u=>u.id===n.by) || {name:'System'};
      const d = document.createElement('div'); d.innerHTML = `<div><strong>${escapeHtml(by.name)}</strong> — ${escapeHtml(n.text)} <div class="muted" style="font-size:11px">${new Date(n.createdAt).toLocaleString()}</div></div>`;
      notificationsList.appendChild(d);
    });
  }

  // Simple in-page navigation
  function showSection(name){
    // hide all pages
    [pageHome,pageProfile,pageFriends,pageMessages,pageNotifs].forEach(p=>p && p.classList.add('hidden'));
    [navHome,navProfile,navFriends,navMessages,navNotifs].forEach(n=>n && n.classList.remove('active'));
    if(name==='home'){ pageHome.classList.remove('hidden'); navHome.classList.add('active'); }
    if(name==='profile'){ pageProfile.classList.remove('hidden'); navProfile.classList.add('active'); }
    if(name==='friends'){ pageFriends.classList.remove('hidden'); navFriends.classList.add('active'); }
    if(name==='messages'){ pageMessages.classList.remove('hidden'); navMessages.classList.add('active'); }
    if(name==='notifs'){ pageNotifs.classList.remove('hidden'); navNotifs.classList.add('active'); }
    renderAuthState(); renderUsers(); renderFeed(); renderProfile(); renderConversations(); renderNotifications();
  }

  // Banner slider
  function startBanner(){
    const container = qs('#banner-slider'); if(!container) return; const slides = Array.from(container.querySelectorAll('.slide'));
    let idx=0; slides.forEach((s,i)=>s.style.display = i===0?'block':'none');
    setInterval(()=>{ slides[idx].style.display='none'; idx=(idx+1)%slides.length; slides[idx].style.display='block'; }, 4000);
  }

  // Search
  function handleSearch(){
    const q = (searchInput.value||'').toLowerCase().trim(); if(!q){ alert('Enter search term'); return }
    // search users and posts
    const userMatches = users.filter(u=>u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    const postMatches = posts.filter(p=> (p.text||'').toLowerCase().includes(q));
    // show results in feed area
    feed.innerHTML = `<div class="card"><h3>Search results for "${escapeHtml(q)}"</h3></div>`;
    if(userMatches.length){ const c = document.createElement('div'); c.className='card'; c.innerHTML='<h4>Users</h4>'; userMatches.forEach(u=>{ const d=document.createElement('div'); d.textContent = u.name + ' ('+u.email+')'; c.appendChild(d); }); feed.appendChild(c); }
    if(postMatches.length){ const c=document.createElement('div'); c.className='card'; c.innerHTML='<h4>Posts</h4>'; postMatches.forEach(p=>{ const u = users.find(x=>x.id===p.userId)||{name:'Unknown'}; const d=document.createElement('div'); d.innerHTML = `<strong>${escapeHtml(u.name)}</strong>: ${escapeHtml(p.text)}`; c.appendChild(d); }); feed.appendChild(c); }
    showSection('home');
  }

  // small utility
  function escapeHtml(s){ if(!s) return ''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

})();
