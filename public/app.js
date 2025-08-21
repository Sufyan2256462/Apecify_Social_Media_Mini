const API = '/api';
let token = localStorage.getItem('token') || null;
let currentUser = null;

function setActiveTab(id){
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
}
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
});

function headers(){
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = 'Bearer ' + token;
  return h;
}

async function fetchJSON(url, opts={}){
  const res = await fetch(url, opts);
  if (!res.ok) {
    const msg = await res.json().catch(()=>({message: res.statusText}));
    throw new Error(msg.message || 'Request failed');
  }
  return res.json();
}

function fmtTime(ts){
  const d = new Date(ts);
  return d.toLocaleString();
}

function toast(msg){
  alert(msg);
}

// AUTH
async function signup(){
  try{
    const username = document.getElementById('su_username').value.trim();
    const name = document.getElementById('su_name').value.trim();
    const password = document.getElementById('su_password').value;
    const data = await fetchJSON(API + '/auth/register', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ username, password, name })
    });
    token = data.token; localStorage.setItem('token', token);
    await loadMe(); setActiveTab('feed'); initUIAuth();
  }catch(e){ toast(e.message); }
}
async function login(){
  try{
    const username = document.getElementById('li_username').value.trim();
    const password = document.getElementById('li_password').value;
    const data = await fetchJSON(API + '/auth/login', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ username, password })
    });
    token = data.token; localStorage.setItem('token', token);
    await loadMe(); setActiveTab('feed'); initUIAuth();
  }catch(e){ toast(e.message); }
}
async function loadMe(){
  if (!token) { currentUser = null; return; }
  try{
    currentUser = await fetchJSON(API + '/auth/me', { headers: headers() });
  }catch(_){
    currentUser = null; token=null; localStorage.removeItem('token');
  }
}

function initUIAuth(){
  const composer = document.getElementById('composer');
  if (currentUser){ composer.classList.remove('hidden'); }
  else { composer.classList.add('hidden'); }
}

document.getElementById('signupBtn').addEventListener('click', signup);
document.getElementById('loginBtn').addEventListener('click', login);

// FEED
async function createPost(){
  const text = document.getElementById('postText').value.trim();
  const imageUrl = document.getElementById('postImage').value.trim();
  if (!text) return toast('Say something!');
  try{
    await fetchJSON(API + '/posts', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ text, imageUrl })
    });
    document.getElementById('postText').value=''; document.getElementById('postImage').value='';
    await loadFeed();
  }catch(e){ toast(e.message); }
}
document.getElementById('postBtn').addEventListener('click', createPost);

function postCard(p){
  return `<div class="card">
    <div class="post">
      <div class="avatar"></div>
      <div class="content">
        <strong>@${p.author.username}</strong>
        <div class="meta">${fmtTime(p.createdAt)}</div>
        <p>${escapeHtml(p.text)}</p>
        ${p.imageUrl ? `<img src="${p.imageUrl}" style="width:100%; border-radius:12px; margin-top:6px;">` : ''}
        <div class="actions">
          <button data-like="${p._id}">♥ ${p.likes.length}</button>
          <span class="badge" data-open="${p._id}">Open</span>
        </div>
      </div>
    </div>
  </div>`;
}

function escapeHtml(str){
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

async function loadFeed(){
  const feedList = document.getElementById('feedList');
  feedList.innerHTML = '<div class="card">Loading feed...</div>';
  try{
    const posts = await fetchJSON(API + '/posts/feed', { headers: headers() });
    feedList.innerHTML = posts.map(postCard).join('') || '<div class="card">No posts yet. Be the first!</div>';
    // attach events
    feedList.querySelectorAll('[data-like]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!token) return toast('Login required');
        const id = btn.getAttribute('data-like');
        const res = await fetchJSON(API + '/posts/' + id + '/like', { method: 'POST', headers: headers() });
        btn.textContent = '♥ ' + res.likes;
      });
    });
    feedList.querySelectorAll('[data-open]').forEach(b => {
      b.addEventListener('click', () => openPost(b.getAttribute('data-open')));
    });
  }catch(e){
    feedList.innerHTML = '<div class="card">Error: ' + e.message + '</div>';
  }
}

async function openPost(id){
  const modal = document.createElement('div');
  modal.className = 'card';
  modal.style.position='fixed'; 
  modal.style.inset='20%'; 
  modal.style.zIndex=10; 
  modal.style.background='rgba(20,22,45,.96)';
  modal.style.maxHeight = '80vh'; /* Set maximum height */
  modal.style.overflowY = 'auto'; /* Enable scrolling */
  modal.innerHTML = '<div>Loading...</div>';
  document.body.appendChild(modal);
  try{
    const p = await fetchJSON(API + '/posts/' + id);
    const comments = await fetchJSON(API + '/comments/' + id);
    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3>Post by @${p.author.username}</h3>
        <button id="closeModal">Close</button>
        ${currentUser && p.author._id === currentUser._id ? `
          <button id="editPost">Edit</button> <!-- Button to edit the post -->
          <button id="deletePost">Delete</button> <!-- Button to delete the post -->
        ` : ''}
      </div>
      <p>${escapeHtml(p.text)}</p>
      ${p.imageUrl ? `<img src="${p.imageUrl}" style="width:100%; border-radius:12px;">` : ''}
      <div class="meta">${fmtTime(p.createdAt)} • ♥ ${p.likes.length}</div>
      <h4>Comments</h4>
      <div id="commentList">${comments.map(c => `<div class="card" style="padding:8px; margin:6px 0;"><strong>@${c.author.username}</strong><div class="meta">${fmtTime(c.createdAt)}</div><div>${escapeHtml(c.text)}</div></div>`).join('')}</div>
      ${token ? `
      <div style="display:flex; gap:6px; margin-top:6px;">
        <input id="commentText" placeholder="Write a comment...">
        <button id="commentBtn">Comment</button>
      </div>`: '<div class="meta">Login to comment</div>'}
    `;
    document.getElementById('closeModal').onclick = () => modal.remove();
    if (currentUser && p.author._id === currentUser._id) {
      document.getElementById('editPost').onclick = () => editPost(p);
      document.getElementById('deletePost').onclick = () => deletePost(p._id, modal);
    }
    if (token){
      document.getElementById('commentBtn').onclick = async () => {
        const text = document.getElementById('commentText').value.trim();
        if (!text) return;
        const newC = await fetchJSON(API + '/comments/' + id, {
          method: 'POST', headers: headers(), body: JSON.stringify({ text })
        });
        const list = document.getElementById('commentList');
        const el = document.createElement('div');
        el.className = 'card'; el.style.padding='8px'; el.style.margin='6px 0';
        el.innerHTML = `<strong>@${newC.author.username}</strong><div class="meta">${fmtTime(newC.createdAt)}</div><div>${escapeHtml(newC.text)}</div>`;
        list.appendChild(el);
        document.getElementById('commentText').value='';
      };
    }
  }catch(e){
    modal.innerHTML = '<div class="card">Error: ' + e.message + '</div>';
  }
}

async function deletePost(id, modalElement) {
  if (!confirm('Are you sure you want to delete this post?')) return;
  try {
    await fetchJSON(API + '/posts/' + id, { method: 'DELETE', headers: headers() });
    toast('Post deleted successfully!');
    modalElement.remove();
    await loadFeed();
  } catch (e) {
    toast('Error deleting post: ' + e.message);
  }
}

async function editPost(post) {
  const modal = document.createElement('div');
  modal.className = 'card';
  modal.style.position = 'fixed';
  modal.style.inset = '20%';
  modal.style.zIndex = 10;
  modal.style.background = 'rgba(20,22,45,.96)';
  modal.style.maxHeight = '80vh';
  modal.style.overflowY = 'auto';
  modal.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3>Edit Post</h3>
      <button id="closeEditModal">Close</button>
    </div>
    <div>
      <textarea id="editText" style="width:100%; height:100px; margin-bottom:10px;">${escapeHtml(post.text)}</textarea>
      <input id="editImageUrl" type="text" placeholder="Image URL" value="${post.imageUrl}" style="width:100%; margin-bottom:10px;">
      <button id="saveEditBtn">Save Changes</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('closeEditModal').onclick = () => modal.remove();
  document.getElementById('saveEditBtn').onclick = async () => {
    const newText = document.getElementById('editText').value.trim();
    const newImageUrl = document.getElementById('editImageUrl').value.trim();
    if (!newText) return toast('Post text cannot be empty!');

    try {
      await fetchJSON(API + '/posts/' + post._id, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ text: newText, imageUrl: newImageUrl })
      });
      toast('Post updated successfully!');
      modal.remove();
      await loadFeed();
    } catch (e) {
      toast('Error updating post: ' + e.message);
    }
  };
}

// EXPLORE
async function searchUsers(){
  const q = document.getElementById('userSearch').value.trim();
  const users = await fetchJSON(API + '/users/search?q=' + encodeURIComponent(q));
  const list = document.getElementById('exploreList');
  list.innerHTML = users.map(u => `<div class="card">
    <div class="post">
      <div class="avatar"></div>
      <div class="content">
        <strong>@${u.username}</strong><div class="meta">${u.name||''}</div>
        <div class="actions">
          ${token ? `<button data-follow="${u._id}">Follow</button>` : ''}
          <button data-view="${u.username}">View</button>
        </div>
      </div>
    </div>
  </div>`).join('') || '<div class="card">No users</div>';
  list.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => viewProfile(b.getAttribute('data-view'))));
  list.querySelectorAll('[data-follow]').forEach(b => b.addEventListener('click', async () => {
    try{
      await fetchJSON(API + '/users/' + b.getAttribute('data-follow') + '/follow', { method: 'POST', headers: headers() });
      toast('Followed!');
    }catch(e){ toast(e.message); }
  }));
}
document.getElementById('searchBtn').addEventListener('click', searchUsers);

// PROFILE
async function renderMyProfile(){
  if (!currentUser){ document.getElementById('profileCard').innerHTML = '<div class="card">Login to see profile</div>'; return; }
  const u = currentUser;
  document.getElementById('profileCard').innerHTML = `<div class="card">
    <div class="post">
      <div class="avatar"></div>
      <div class="content">
        <h3>@${u.username}</h3>
        <div class="meta">${u.name || ''} • Followers: ${u.followers?.length || 0} • Following: ${u.following?.length || 0}</div>
        <p>${escapeHtml(u.bio || '')}</p>
      </div>
    </div>
  </div>`;
  const posts = await fetchJSON(API + '/posts/user/' + u._id);
  document.getElementById('myPosts').innerHTML = posts.map(postCard).join('') || '<div class="card">No posts yet</div>';
}

async function viewProfile(username){
  setActiveTab('profile');
  try{
    const u = await fetchJSON(API + '/users/' + encodeURIComponent(username));
    const userPosts = await fetchJSON(API + '/posts/user/' + u._id); // Fetch posts for the user
    document.getElementById('profileCard').innerHTML = `<div class="card">
      <div class="post">
        <div class="avatar"></div>
        <div class="content">
          <h3>@${u.username}</h3>
          <div class="meta">${u.name || ''} • Followers: ${u.followers.length} • Following: ${u.following.length}</div>
          <p>${escapeHtml(u.bio || '')}</p>
          ${token ? `<button id="followThis" data-id="${u._id}">Follow</button>` : ''}
        </div>
      </div>
    </div>`;
    if (token){
      document.getElementById('followThis').onclick = async (ev) => {
        await fetchJSON(API + '/users/' + ev.target.getAttribute('data-id') + '/follow', { method: 'POST', headers: headers() });
        toast('Followed');
      };
    }
    const posts = await fetchJSON(API + '/posts/user/' + u._id);
    document.getElementById('myPosts').innerHTML = posts.map(postCard).join('') || '<div class="card">No posts</div>';
  }catch(e){
    document.getElementById('profileCard').innerHTML = '<div class="card">Error: ' + e.message + '</div>';
  }
}

// init
(async function(){
  await loadMe(); initUIAuth();
  await loadFeed();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loadFeed(); });
  // simple tab deep link support
  if (location.hash) {
    const id = location.hash.replace('#','');
    if (document.getElementById('tab-' + id)) setActiveTab(id);
  }
})();
