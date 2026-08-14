const users = [
  { id: 'P', password: '1111', name: 'P' },
  { id: 'M', password: '2222', name: 'M' },
  { id: 'J', password: '3333', name: 'J' },
  { id: 'D', password: '4444', name: 'D' }
];

const SUPABASE_URL = 'https://heussoxojmdwennqaaxi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_W9afjzQnvnzKnQkKlJydmg_8s2pPkD7';

let db = null;
if (typeof supabase !== 'undefined') {
  const { createClient } = supabase;
  db = createClient(SUPABASE_URL, SUPABASE_KEY);
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser'));
  } catch (_) {
    return null;
  }
}

function login() {
  const id = document.getElementById('userid')?.value.trim();
  const password = document.getElementById('password')?.value.trim();
  const msg = document.getElementById('msg');

  const user = users.find((u) => u.id === id && u.password === password);

  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'chat.html';
  } else if (msg) {
    msg.textContent = 'Invalid ID or password.';
  }
}

function togglePassword() {
  const field = document.getElementById('password');
  if (!field) return;
  field.type = field.type === 'password' ? 'text' : 'password';
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initials(name) {
  return String(name || '?').slice(0, 2).toUpperCase();
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

async function loadMessages() {
  if (!db) return;

  const box = document.getElementById('chatBox');
  if (!box) return;

  const current = getCurrentUser();
  if (!current) {
    window.location.href = 'index.html';
    return;
  }

  const { data, error } = await db
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Load messages error:', error);
    box.innerHTML = '<div class="empty-state">Could not load messages. Check your Supabase table and policies.</div>';
    return;
  }

  if (!data || data.length === 0) {
    box.innerHTML = '<div class="empty-state">No messages yet. Start the conversation.</div>';
    return;
  }

  box.innerHTML = data.map((message) => {
    const mine = message.sender === current.name;
    const sender = escapeHtml(message.sender);
    const text = escapeHtml(message.text);
    const time = escapeHtml(formatTime(message.created_at));

    return `
      <div class="message-row ${mine ? 'me' : ''}">
        ${mine ? '' : `<div class="avatar message-avatar">${escapeHtml(initials(message.sender))}</div>`}
        <div>
          ${mine ? '' : `<div class="message-sender">${sender}</div>`}
          <div class="message-bubble">
            <div class="message-text">${text}</div>
          </div>
          <div class="message-meta">${time}${mine ? ' · ✓✓' : ''}</div>
        </div>
      </div>
    `;
  }).join('');

  requestAnimationFrame(() => { box.scrollTop = box.scrollHeight; });
}

async function sendMessage() {
  if (!db) {
    alert('Supabase is not loaded. Refresh the page and try again.');
    return;
  }

  const user = getCurrentUser();
  const input = document.getElementById('message');
  if (!user || !input) return;

  const text = input.value.trim();
  if (!text) return;

  const { error } = await db.from('messages').insert([{
    sender: user.name,
    text
  }]);

  if (error) {
    alert(error.message);
    console.error('Send message error:', error);
    return;
  }

  input.value = '';
  await loadMessages();
  input.focus();
}

function handleMessageKey(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function renderUsers() {
  const current = getCurrentUser();
  const list = document.getElementById('chatUsers');
  const avatar = document.getElementById('userAvatar');
  if (!list || !current) return;

  if (avatar) avatar.textContent = initials(current.name);

  list.innerHTML = users.map((user, index) => `
    <div class="chat-user ${user.id === current.id ? 'selected' : ''}" data-name="${escapeHtml(user.name)}">
      <div class="avatar">${escapeHtml(initials(user.name))}</div>
      <div class="chat-user-info">
        <div class="chat-user-top">
          <span class="chat-user-name">${escapeHtml(user.name === current.name ? `${user.name} (You)` : user.name)}</span>
          <span class="chat-user-time">${index === 0 ? 'Now' : '—'}</span>
        </div>
        <div class="chat-user-sub">${user.id === current.id ? 'Your account' : 'Campus member'}</div>
      </div>
    </div>
  `).join('');
}

function filterUsers() {
  const query = document.getElementById('searchChats')?.value.toLowerCase().trim() || '';
  document.querySelectorAll('.chat-user').forEach((item) => {
    const name = item.dataset.name.toLowerCase();
    item.style.display = name.includes(query) ? 'flex' : 'none';
  });
}

async function initChatPage() {
  if (!window.location.pathname.includes('chat')) return;

  const current = getCurrentUser();
  if (!current) {
    window.location.href = 'index.html';
    return;
  }

  renderUsers();
  await loadMessages();
  window.setInterval(loadMessages, 2500);
}
