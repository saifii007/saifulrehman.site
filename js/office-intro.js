/* Animated portfolio intro. Uses the supplied office panorama asset when it is present. Keeps the existing desktop and taskbar intact. */
(() => {
  "use strict";
  if (sessionStorage.getItem("saifIntroSeen") === "1") return;

  const style = document.createElement("style");
  style.textContent = `
    #saif-office-intro{position:fixed;inset:0 0 var(--taskbar-h,48px);z-index:9998;overflow:hidden;color:#f8fafc;font-family:var(--font-ui,"Segoe UI",sans-serif);background:#101a23;isolation:isolate}
    #saif-office-intro *{box-sizing:border-box}
    #saif-office-intro .office-scene{position:absolute;inset:-4%;background-image:linear-gradient(90deg,rgba(8,15,23,.76),rgba(8,15,23,.20) 58%,rgba(8,15,23,.46)),linear-gradient(0deg,rgba(23,33,43,.9) 0%,transparent 38%),url("office-panorama.jpg"),linear-gradient(125deg,#344a55 0%,#172b37 45%,#71858b 70%,#263c48 100%);background-size:cover,cover,cover,cover;background-position:center,center,center,center;background-repeat:no-repeat;animation:saifOfficePan 18s ease-in-out infinite alternate}
    #saif-office-intro .office-scene:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 12%,rgba(4,12,19,.42) 12.2% 12.8%,transparent 13% 24%),linear-gradient(180deg,rgba(255,255,255,.09),transparent 32%);transform:perspective(900px) rotateY(-8deg) scale(1.08)}
    #saif-office-intro .office-scene:after{content:"";position:absolute;left:15%;right:8%;bottom:-10%;height:46%;background:linear-gradient(165deg,#293842,#111c25 70%);clip-path:polygon(0 14%,100% 0,100% 100%,0 100%);box-shadow:0 -1px rgba(255,255,255,.12)}
    #saif-office-intro .scene-glow{position:absolute;width:38vw;height:38vw;right:8%;top:-18%;border-radius:50%;background:rgba(170,207,221,.13);filter:blur(40px);animation:saifGlow 8s ease-in-out infinite alternate}
    #saif-office-intro .intro-content{position:absolute;left:clamp(24px,9vw,140px);top:50%;transform:translateY(-50%);max-width:590px;width:calc(100% - 48px);animation:saifCardIn 1s cubic-bezier(.16,1,.3,1) both}
    #saif-office-intro .eyebrow{display:flex;align-items:center;gap:10px;color:#b8c9d3;text-transform:uppercase;letter-spacing:.19em;font-size:11px;font-weight:700}
    #saif-office-intro .live-dot{width:7px;height:7px;border-radius:50%;background:#7ee0b4;box-shadow:0 0 14px #7ee0b4}
    #saif-office-intro h1{font-size:clamp(42px,6.8vw,86px);line-height:.99;letter-spacing:-.065em;margin:24px 0 18px;font-weight:650}
    #saif-office-intro h1 span{color:#a8c6d5}
    #saif-office-intro .intro-copy{max-width:460px;color:#c1ccd3;font-size:clamp(14px,1.45vw,17px);line-height:1.75;margin:0}
    #saif-office-intro .intro-actions{display:flex;gap:12px;align-items:center;margin-top:30px;flex-wrap:wrap}
    #saif-office-intro button{font:600 14px inherit;border:0;cursor:pointer;border-radius:8px;padding:13px 19px;transition:transform .2s,background .2s}
    #saif-office-intro button:hover{transform:translateY(-2px)}
    #saif-office-intro .explore{background:#e9f2f6;color:#13232d;box-shadow:0 8px 32px #0004}
    #saif-office-intro .replay{color:#edf4f7;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22)}
    #saif-office-intro .skip{position:absolute;right:clamp(18px,4vw,54px);top:28px;background:rgba(8,15,23,.36);color:#f3f7f9;border:1px solid rgba(255,255,255,.25);padding:9px 14px;font-size:12px}
    #saif-office-intro .status-chip{position:absolute;right:clamp(20px,5vw,72px);bottom:38px;padding:13px 16px;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:rgba(8,15,23,.52);backdrop-filter:blur(16px);font-size:12px;color:#d6e0e5;animation:saifCardIn 1s .5s both}
    #saif-office-intro .status-chip strong{display:block;font-size:13px;color:#fff;margin-bottom:4px}
    #saif-office-intro .ticker{position:absolute;left:0;right:0;bottom:0;padding:12px 20px;border-top:1px solid rgba(255,255,255,.15);background:rgba(7,14,20,.42);font-size:10px;letter-spacing:.17em;color:#aebdc5;text-transform:uppercase;white-space:nowrap;overflow:hidden}
    #saif-office-intro .ticker span{display:inline-block;animation:saifTicker 24s linear infinite}
    #saif-office-intro .notification{position:absolute;right:clamp(18px,4vw,54px);top:82px;max-width:300px;padding:15px 17px;border-radius:12px;background:rgba(244,248,250,.94);color:#17232b;box-shadow:0 18px 55px #0005;opacity:0;transform:translateY(-10px);animation:saifNotify .7s 4.2s forwards;font-size:12px}
    #saif-office-intro .notification strong{display:block;font-size:13px;margin-bottom:5px}
    #saif-office-intro.leaving{animation:saifFadeOut .65s ease forwards;pointer-events:none}
    @keyframes saifOfficePan{from{transform:scale(1.02) translateX(1%)}to{transform:scale(1.12) translateX(-2%)}}
    @keyframes saifGlow{from{opacity:.45;transform:translateX(-12%)}to{opacity:1;transform:translateX(10%)}}
    @keyframes saifCardIn{from{opacity:0;translate:0 14px}to{opacity:1;translate:0 0}}
    @keyframes saifNotify{to{opacity:1;transform:translateY(0)}}
    @keyframes saifTicker{from{transform:translateX(100vw)}to{transform:translateX(-100%)}}
    @keyframes saifFadeOut{to{opacity:0;visibility:hidden}}
    @media(max-width:680px){#saif-office-intro .status-chip{display:none}#saif-office-intro .intro-content{top:46%}#saif-office-intro h1{font-size:clamp(42px,12vw,68px)}#saif-office-intro .notification{top:auto;bottom:72px;left:18px;right:18px;max-width:none}}
    @media(prefers-reduced-motion:reduce){#saif-office-intro *,#saif-office-intro *:before,#saif-office-intro *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}}
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("section");
  overlay.id = "saif-office-intro";
  overlay.setAttribute("aria-label", "Portfolio introduction");
  overlay.innerHTML = `
    <div class="office-scene" aria-hidden="true"></div><div class="scene-glow" aria-hidden="true"></div>
    <button class="skip" type="button">Skip intro ↗</button>
    <div class="intro-content">
      <div class="eyebrow"><i class="live-dot"></i> Personal workspace · Online</div>
      <h1>Good work.<br><span>Quietly built.</span></h1>
      <p class="intro-copy">A glimpse into the workspace behind the systems, products, and ideas. Welcome to my corner of the internet.</p>
      <div class="intro-actions"><button class="explore" type="button">Explore portfolio <span aria-hidden="true">↗</span></button><button class="replay" type="button">Replay intro ↻</button></div>
    </div>
    <div class="status-chip"><strong>Saif Ul Rehman</strong>Senior Software Engineer · Builder<br>Systems, products &amp; thoughtful engineering</div>
    <div class="notification"><strong>Workspace notification</strong>Welcome in. Take a look around when you're ready.</div>
    <div class="ticker"><span>ENGINEERING · PRODUCT THINKING · SAAS PLATFORMS · SYSTEM DESIGN · ANGUNET · ENGINEERING · PRODUCT THINKING ·</span></div>
  `;
  document.body.appendChild(overlay);

  function enterPortfolio() {
    sessionStorage.setItem("saifIntroSeen", "1");
    overlay.classList.add("leaving");
    window.setTimeout(() => overlay.remove(), 700);
  }
  overlay.querySelector(".explore").addEventListener("click", enterPortfolio);
  overlay.querySelector(".skip").addEventListener("click", enterPortfolio);
  overlay.querySelector(".replay").addEventListener("click", () => {
    overlay.classList.remove("leaving");
    overlay.querySelector(".notification").style.animation = "none";
    void overlay.querySelector(".notification").offsetWidth;
    overlay.querySelector(".notification").style.animation = "";
    overlay.querySelector(".intro-content").style.animation = "none";
    void overlay.querySelector(".intro-content").offsetWidth;
    overlay.querySelector(".intro-content").style.animation = "";
  });
})();
