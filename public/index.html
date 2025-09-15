<!doctype html>
<html lang="en">  
<head>  
<meta charset="utf-8"/>  
<meta name="viewport" content="width=device-width,initial-scale=1"/>  
<title>PRIVATE ACCOUNT VIEWER</title>  
<style>  
  :root {  
    --accent-p: #b14bff;  
    --accent-r: #ff6a88;  
    --accent-y: #ffd36b;  
    --accent-g: #59d0ff;  
    --text: #f5f5f5;  
    --glass: rgba(255,255,255,0.05);  
  }  
  body {  
    margin:0; height:100vh; display:flex; align-items:center; justify-content:center;  
    font-family: 'Poppins',sans-serif; background:#05010f; overflow:hidden; color:var(--text);  
  }  

  /* background RGB blobs */
  .blob {
    position:absolute; border-radius:50%; filter:blur(120px); opacity:0.4; mix-blend-mode:screen;
    animation: float 18s infinite ease-in-out;
  }
  .blob.red {background:#ff3366;width:600px;height:600px;top:-150px;left:-200px;}
  .blob.green {background:#33ffaa;width:500px;height:500px;bottom:-200px;left:20%;}
  .blob.blue {background:#3399ff;width:500px;height:500px;top:40%;right:-200px;}
  @keyframes float {50%{transform:translateY(-60px) scale(1.05);} }

  /* particles canvas */
  canvas#particles {position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.8;}

  /* card container */
  .card {
    z-index:10; background:var(--glass); border:1px solid rgba(255,255,255,0.08);
    border-radius:20px; padding:32px 28px; width:380px; text-align:center;
    backdrop-filter:blur(12px); box-shadow:0 30px 90px rgba(0,0,0,0.7);
    transform-style:preserve-3d; animation: pop .9s cubic-bezier(.2,.9,.3,1);
  }
  @keyframes pop {from{transform:scale(.7) translateY(60px);opacity:0;}to{transform:scale(1) translateY(0);opacity:1;}}

  .logo {
    font-size:52px; margin-bottom:10px; filter:drop-shadow(0 0 12px rgba(255,255,255,.3));
  }
  h1 {
    margin:0; font-size:22px; font-weight:900; letter-spacing:1.5px;
    background:linear-gradient(90deg,var(--accent-p),#ff9a8b,#ffd36b);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    text-transform:uppercase; text-shadow:0 0 18px rgba(177,75,255,.4);
  }
  .sub {
    font-size:13px; opacity:.8; margin:12px 0 20px;
  }

  label {display:block; text-align:left; font-size:12px; margin-top:12px; opacity:.7; letter-spacing:1px;}
  input {
    width:100%; padding:12px 14px; margin-top:6px;
    border-radius:12px; border:none; outline:none;
    background:rgba(255,255,255,0.08); color:var(--text);
    font-size:14px; box-shadow:inset 0 8px 20px rgba(0,0,0,.6);
    text-align:center;
  }
  input::placeholder {color:rgba(255,255,255,0.5);}

  .btn {
    margin-top:18px; padding:14px; width:100%; border-radius:12px; border:none;
    background:linear-gradient(90deg,var(--accent-r),var(--accent-y));
    color:#111; font-weight:800; font-size:15px; cursor:pointer;
    box-shadow:0 20px 60px rgba(0,0,0,0.7); transition:.2s;
  }
  .btn:hover {transform:translateY(-3px) scale(1.03);}

  .status {
    margin-top:16px; font-size:13px; opacity:.85; min-height:20px;
  }

  /* result */
  .result {
    margin-top:20px; padding:18px; border-radius:14px;
    background:rgba(255,255,255,0.05); display:none;
    animation: fade .6s ease forwards;
  }
  @keyframes fade {from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
  .dp {width:100px;height:100px;border-radius:20px;overflow:hidden;margin:0 auto 14px;box-shadow:0 12px 30px rgba(0,0,0,0.5);}
  .dp img {width:100%;height:100%;object-fit:cover;}
  .handle {color:var(--accent-p);font-weight:700;margin-top:8px;}
  .bio {font-size:14px;opacity:.9;margin-top:10px;}
  .stats {display:flex;justify-content:space-around;margin-top:14px;font-weight:700;}
</style>  
</head>  
<body>  
<div class="blob red"></div>  
<div class="blob green"></div>  
<div class="blob blue"></div>  
<canvas id="particles"></canvas>  

<div class="card">  
  <div class="logo">👁️</div>  
  <h1>PRIVATE ACCOUNT VIEWER</h1>  
  <div class="sub">🔑 Enter your username & the account you want to search</div>  

  <label>Your Username</label>
  <input id="me" type="text" placeholder="@yourname">

  <label>Target Username</label>
  <input id="target" type="text" placeholder="@username_to_search">

  <button class="btn" id="searchBtn">🔍 Search</button>

  <div class="status" id="status">Waiting…</div>    

  <div class="result" id="result">  
    <div class="dp" id="dp"><img src="https://via.placeholder.com/100" alt="dp"></div>  
    <div class="handle" id="handle">@username</div>  
    <div class="bio" id="bio">Demo bio information shown here</div>  
    <div class="stats">  
      <div><span id="f1">--</span><br>Followers</div>  
      <div><span id="f2">--</span><br>Following</div>  
      <div><span id="f3">--</span><br>Posts</div>  
    </div>  
  </div>  
</div>  

<script>  
/* particles background */  
const c=document.getElementById("particles"),ctx=c.getContext("2d");  
let W,H;function resize(){W=innerWidth;H=innerHeight;c.width=W;c.height=H}resize();addEventListener("resize",resize);  
let p=[];for(let i=0;i<60;i++){p.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,r:40+Math.random()*80,c:["#ff4d6d","#47e6a6","#4fa9ff"][i%3]});}  
function draw(){ctx.clearRect(0,0,W,H);for(const o of p){o.x+=o.vx;o.y+=o.vy;if(o.x<-100)o.x=W+100;if(o.x>W+100)o.x=-100;if(o.y<-100)o.y=H+100;if(o.y>H+100)o.y=-100;const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);g.addColorStop(0,o.c+"55");g.addColorStop(1,"transparent");ctx.fillStyle=g;ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.fill();}requestAnimationFrame(draw);}draw();  

/* connect to backend API */  
const btn=document.getElementById("searchBtn"),
      status=document.getElementById("status"),
      res=document.getElementById("result");

btn.onclick=async ()=>{  
  const u=document.getElementById("target").value.trim();  
  if(!u){alert("Enter a username!");return;}  

  res.style.display="none";  
  status.textContent="🔍 Searching…";  

  try {
    const r=await fetch(`/api/profile?username=${encodeURIComponent(u)}`);
    const j=await r.json();

    if(!j.ok){
      status.textContent="⚠️ "+(j.error || "Not found / Private account");
      return;
    }

    status.textContent="✅ Found public info";
    document.getElementById("handle").textContent="@"+j.username;
    document.getElementById("bio").textContent=j.biography || "—";
    document.getElementById("f1").textContent=j.followers || "--";
    document.getElementById("f2").textContent=j.following || "--";
    document.getElementById("f3").textContent=j.posts || "--";

    // profile picture
    if(j.profile_pic_url){
      document.querySelector("#dp img").src=j.profile_pic_url;
    } else {
      document.querySelector("#dp img").src="https://via.placeholder.com/100";
    }

    res.style.display="block";
  } catch(err){
    status.textContent="❌ Error fetching data";
    console.error(err);
  }
};
</script>  
</body>  
</html>
