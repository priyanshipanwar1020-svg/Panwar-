
const users=[{id:'P',password:'1111',name:'P'},{id:'M',password:'2222',name:'M'},{id:'J',password:'3333',name:'J'},{id:'D',password:'4444',name:'D'}];
const SUPABASE_URL='https://heussoxojmdwennqaaxi.supabase.co';
const SUPABASE_KEY='sb_publishable_W9afjzQnvnzKnQkKlJydmg_8s2pPkD7';
let db=null;
if(typeof supabase!=='undefined'){const {createClient}=supabase;db=createClient(SUPABASE_URL,SUPABASE_KEY);}
function login(){const id=document.getElementById('userid').value.trim();const password=document.getElementById('password').value.trim();const user=users.find(u=>u.id===id&&u.password===password);if(user){localStorage.setItem('currentUser',JSON.stringify(user));window.location.href='chat.html';}else{document.getElementById('msg').innerText='Invalid Login';}}
function logout(){localStorage.removeItem('currentUser');window.location.href='index.html';}
async function loadMessages(){if(!db)return;const box=document.getElementById('chatBox');if(!box)return;const {data,error}=await db.from('messages').select('*').order('created_at');if(error){console.error(error);return;}box.innerHTML='';(data||[]).forEach(m=>{box.innerHTML+=`<p><b>${m.sender}</b>: ${m.text}</p>`;});}
async function sendMessage(){const user=JSON.parse(localStorage.getItem('currentUser'));const text=document.getElementById('message').value.trim();if(!text)return;const {error}=await db.from('messages').insert([{sender:user.name,text:text}]);if(error){alert(error.message);console.error(error);return;}document.getElementById('message').value='';loadMessages();}
if(window.location.pathname.includes('chat')){setInterval(loadMessages,2000);}
