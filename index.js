<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Private Account Viewer — Demo (Ethical)</title>
  <style>
    :root{
      --bg1: #0f172a;
      --glass: rgba(255,255,255,0.06);
      --accent: rgba(255,255,255,0.06);
    }
    *{box-sizing:border-box}
    html,body{height:100%;margin:0;font-family:Inter,ui-sans-serif,system-ui,Segoe UI,Roboto,'Helvetica Neue',Arial}
    body{
      background: radial-gradient( circle at 10% 20%, rgba(255,110,64,0.12), transparent 8%),
                  radial-gradient( circle at 90% 80%, rgba(99,102,241,0.12), transparent 8%),
                  linear-gradient(120deg,#07103a 0%, #001529 40%, #0b1f2f 100%);
      color:#e6eef8;
      display:flex;align-items:center;justify-content:center;padding:32px;
      -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
    }

    /* floating blobs */
    .blob{position:fixed;border-radius:50%;filter:blur(60px);opacity:0.7;mix-blend-mode:screen}
    .b1{width:380px;height:380px;left:-80px;top:-60px;background:linear-gradient(45deg,#ff7a59,#ffd36b)}
    .b2{width:320px;height:320px;right:-60px;bottom:-80px;background:linear-gradient(45deg,#7c5cff,#59d0ff)}

    .container{width:920px;max-width:100%;display:grid;grid-template-columns:420px 1fr;gap:28px;align-items:center}

    .card{
      background:linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));
      border-radius:18px;padding:26px;backdrop-filter: blur(10px);box-shadow: 0 8px 30px rgba(2,6,23,0.6);
      border:1px solid rgba(255,255,255,0.03);
    }

    h1{margin:0 0 6px 0;font-size:20px;letter-spacing:0.2px}
    p.lead{margin:0 0 18px 0;color:rgba(230,238,248,0.8);font-size:13px}

    label{display:block;font-size:12px;color:rgba(230,238,248,0.7);margin-bottom:6px}
    input[type=text]{width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:inherit;font-size:14px}

    .btn{display:inline-flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;border:none;background:linear-gradient(90deg,#7c5cff,#59d0ff);color:white;font-weight:600;cursor:pointer}
    .btn:active{transform:translateY(1px)}

    .preview{display:flex;flex-direction:column;gap:12px}
    .avatar{width:86px;height:86px;border-radius:18px;display:inline-grid;place-items:center;font-weight:700;font-size:28px;color:rgba(2,6,23,0.9);background:linear-gradient(120deg,#fff,#f1f5f9)}

    .meta{display:flex;gap:12px;align-items:center}
    .meta .stat{font-size:13px;color:rgba(230,238,248,0.9)}

    .note{font-size:12px;color:rgba(230,238,248,0.6);margin-top:12px}

    /* responsive */
    @media (max-width:880px){
      .container{grid-template-columns:1fr;}
    }

    footer{margin-top:18px;font-size:12px;color:rgba(230,238,248,0.6)}
  </style>
</head>
<body>
  <div class="blob b1" aria-hidden></div>
  <div class="blob b2" aria-hidden></div>

  <div class="container">
    <div class="card">
      <h1>Private Account Viewer — Demo</h1>
      <p class="lead">Safe demo UI — this version <strong>only</strong> sends the two usernames (requester &amp; target) to your server for notification. <em>No passwords, no tokens, no private data.</em></p>

      <form id="viewerForm" onsubmit="return false;">
        <div style="margin-bottom:14px">
          <label for="me">Your username</label>
          <input id="me" type="text" placeholder="e.g. @rahul_raj" autocomplete="off" />
        </div>

        <div style="margin-bottom:16px">
          <label for="target">Username to view</label>
          <input id="target" type="text" placeholder="e.g. @private_person" autocomplete="off" />
        </div>

        <div style="display:flex;gap:10px;align-items:center">
          <button id="viewBtn" class="btn">View (Demo)</button>
          <div style="font-size:13px;color:rgba(230,238,248,0.7)" id="statusText">Preview will be generated locally.</div>
        </div>

        <div class="note">This will send only the two usernames to the server endpoint <code>/request-access</code> for admin notification (example: Telegram). Do not enter passwords here.</div>
      </form>

      <footer>Made for ethical demos — does not retrieve real data.</footer>
    </div>

    <div class="card">
      <div id="previewArea" class="preview" aria-live="polite">
        <div style="display:flex;align-items:center;gap:16px">
          <div class="avatar" id="avatar">?</div>
          <div style="flex:1">
            <div id="displayName" style="font-weight:700;font-size:18px">—</div>
            <div id="displayHandle" style="color:rgba(230,238,248,0.7);font-size:13px">—</div>
          </div>
        </div>

        <div class="meta">
          <div class="stat">Followers: <span id="followers">—</span></div>
          <div class="stat">Following: <span id="following">—</span></div>
          <div class="stat">Posts: <span id="posts">—</span></div>
        </div>

        <div id="bio" style="font-size:14px;color:rgba(230,238,248,0.85);line-height:1.4">Enter usernames and click "View (Demo)" to see a mock preview.</div>

        <div style="margin-top:12px;font-size:12px;color:rgba(230,238,248,0.6)">Disclaimer: This is a local demo. It is intentionally designed to avoid any network calls or attempts to access external services unless you configure a safe backend endpoint.</div>
      </div>
    </div>
  </div>

  <script>
    const form = document.getElementById('viewerForm');
    const meInput = document.getElementById('me');
    const targetInput = document.getElementById('target');
    const avatar = document.getElementById('avatar');
    const displayName = document.getElementById('displayName');
    const displayHandle = document.getElementById('displayHandle');
    const followers = document.getElementById('followers');
    const following = document.getElementById('following');
    const posts = document.getElementById('posts');
    const bio = document.getElementById('bio');
    const statusText = document.getElementById('statusText');

    function initials(name){
      if(!name) return '?';
      const n = name.replace(/^@/, '').trim();
      const parts = n.split(/[_\-\.\s]+/).filter(Boolean);
      if(parts.length===1) return parts[0].slice(0,2).toUpperCase();
      return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    }

    function randomInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min }

    async function sendRequestNotification(requester, target){
      try{
        // Only sending two safe fields — no passwords or tokens EVER
        const res = await fetch('/request-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requester, target })
        });
        const data = await res.json().catch(()=>({}));
        if(res.ok) return { ok:true, data };
        return { ok:false, data };
      }catch(e){
        return { ok:false, error: e.message };
      }
    }

    document.getElementById('viewBtn').addEventListener('click', async ()=>{
      const me = meInput.value.trim() || '@you';
      const target = targetInput.value.trim() || '@target';

      // local mock preview
      displayName.textContent = target.replace(/^@/,'') || 'target';
      displayHandle.textContent = 'Viewed by ' + me.replace(/^@/,'');
      avatar.textContent = initials(target);
      followers.textContent = randomInt(120, 12800).toLocaleString();
      following.textContent = randomInt(10, 1500).toLocaleString();
      posts.textContent = randomInt(5, 420).toLocaleString();

      if(/^@?private/i.test(target) || /private/i.test(target)){
        bio.textContent = "This account appears private. Respect privacy — request access or follow the platform's process.";
      } else {
        const bios = [
          "Designing interfaces is half the battle — always show users what will happen with clear permissions.",
          "Friendly reminder: this is a demo. To view real profiles you must use official APIs with permission.",
          "Create clear audit trails when you build features that request access to private data."
        ];
        bio.textContent = bios[randomInt(0,bios.length-1)];
      }

      // send safe notification to backend
      statusText.textContent = 'Sending notification...';
      const result = await sendRequestNotification(me.replace(/^@/,'') , target.replace(/^@/,''));
      if(result.ok){
        statusText.textContent = 'Notification sent (usernames only).';
      } else {
        statusText.textContent = 'Could not send notification (server unreachable).';
      }

      avatar.animate([{transform:'scale(0.96)'},{transform:'scale(1)'}],{duration:260,easing:'cubic-bezier(.2,.9,.3,1)'});
    });

    form.addEventListener('keydown', e => { if(e.key==='Enter'){ document.getElementById('viewBtn').click(); e.preventDefault(); } });
  </script>
</body>
</html>
