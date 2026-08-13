const users=[
{id:'P',password:'1111',name:'P'},
{id:'M',password:'2222',name:'M'},
{id:'J',password:'3333',name:'J'},
{id:'D',password:'4444',name:'D'}
];

function login(){
 const id=document.getElementById('userid').value;
 const pass=document.getElementById('password').value;
 const user=users.find(u=>u.id===id && u.password===pass);
 if(user){
   localStorage.setItem('currentUser',JSON.stringify(user));
   location='chat.html';
 }else{
   document.getElementById('msg').innerText='Invalid Login';
 }
}

function loadMessages(){
 const user=JSON.parse(localStorage.getItem('currentUser'));
 if(!user){ location='index.html'; return; }

 const msgs=JSON.parse(localStorage.getItem('messages')||'[]');
 const box=document.getElementById('chatBox');
 box.innerHTML='';
 msgs.forEach(m=>{
   box.innerHTML+=`<p><b>${m.sender}</b>: ${m.text}</p>`;
 });
}

function sendMessage(){
 const user=JSON.parse(localStorage.getItem('currentUser'));
 const text=document.getElementById('message').value;
 if(!text) return;

 const msgs=JSON.parse(localStorage.getItem('messages')||'[]');
 msgs.push({sender:user.name,text:text});
 localStorage.setItem('messages',JSON.stringify(msgs));
 document.getElementById('message').value='';
 loadMessages();
}

function logout(){
 localStorage.removeItem('currentUser');
 location='index.html';
}
