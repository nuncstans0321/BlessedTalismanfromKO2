const $ = (sel) => document.querySelector(sel);

const scenes = {
  opening: $("#scene-opening"),
  story: $("#scene-story"),
  draw: $("#scene-draw"),
  card: $("#scene-card"),
  ending: $("#scene-ending"),
};

const fxCanvas = $("#fx");
const bgm = $("#bgm");
const sfxDraw = $("#sfxDraw");
const sfxChime = $("#sfxChime");
const topicSfx = $("#topicSfx");

const stick = $("#stick");
const glow = $("#glow");
const aura = document.querySelector(".talisman-aura");

let topicsData = [];
let selectedTopicId = null;

function showScene(name){
  Object.values(scenes).forEach(s => s.classList.remove("active"));
  scenes[name].classList.add("active");
  scenes[name].classList.add("fade-in");
  setTimeout(()=>scenes[name].classList.remove("fade-in"), 700);
}

async function loadText(){
  const res = await fetch("./story.txt");
  const txt = await res.text();
  $("#storyText").textContent = txt.trim();
}

async function loadTopics(){
  const res = await fetch("./data/draws.json");
  const json = await res.json();
  topicsData = json.topics || [];
  renderTopics();
  applyDrawBackground();
}

function renderTopics(){
  const wrap = $("#topics");
  wrap.innerHTML = "";
  topicsData.forEach(t => {
    const el = document.createElement("div");
    el.className = "topic" + (t.id === selectedTopicId ? " active" : "");
    el.textContent = t.label;
    el.dataset.id = t.id;
    el.onclick = () => {
      selectedTopicId = t.id;
      [...wrap.children].forEach(c => c.classList.remove("active"));
      el.classList.add("active");
      applyDrawBackground();
      sparkBurst(0.6);
    };
    wrap.appendChild(el);
  });

  if(!selectedTopicId && topicsData[0]){
    selectedTopicId = topicsData[0].id;
    wrap.children[0].classList.add("active");
  }
}

function applyDrawBackground(){
  const scene = scenes.draw;
  // clear any bg-* class
  scene.className = scene.className.replace(/\bbg-\S+/g, "").trim();
  const t = topicsData.find(x => x.id === selectedTopicId);
  if(t?.bgClass) scene.classList.add(t.bgClass);
}

function transitionFromOpening(){
  const img = $("#openingPhoto");
  img.classList.add("fade-out");
  setTimeout(()=> {
    img.classList.remove("fade-out");
    showScene("story");
    sparkBurst(1.0);
  }, 900);
}

async function playAudioSafe(audioEl){
  try{ await audioEl.play(); } catch(e){ /* ignore */ }
}

function ensureAudioStarted(){
  playAudioSafe(bgm);
}

function pickCard(){
  return topicsData.find(x => x.id === selectedTopicId) || topicsData[0];
}

function stickOut(){
  stick.classList.remove("return-in");
  // restart transition reliably
  stick.classList.remove("draw-out");
  void stick.offsetWidth;
  stick.classList.add("draw-out");
}
function stickIn(){
  stick.classList.remove("draw-out");
  stick.classList.add("return-in");
}

function glowOn(){
  glow.classList.add("on");
  setTimeout(()=>glow.classList.remove("on"), 520);
}

function auraOn(){
  aura?.classList.add("on");
  setTimeout(()=>aura?.classList.remove("on"), 2200);
}

async function onDraw(){
  if(!topicsData.length) return;

  // Stage effects
  stickOut();
  glowOn();
  sparkBurst(1.4);

  // Draw sfx
  sfxDraw.currentTime = 0;
  await playAudioSafe(sfxDraw);

  // Chime and reveal
  setTimeout(async ()=>{
    sfxChime.currentTime = 0;
    await playAudioSafe(sfxChime);

    const card = pickCard();

    // per-topic sfx
    if(card?.sfx){
      topicSfx.src = card.sfx;
      topicSfx.currentTime = 0;
      playAudioSafe(topicSfx);
    }

    $("#cardImg").src = card.card;
    showScene("card");
    auraOn();

    // return stick (so next draw animates again)
    setTimeout(()=>stickIn(), 650);
  }, 520);
}

/* Share */
async function shareLink(){
  const url = window.location.href;
  const title = document.title;

  if(navigator.share){
    try{
      await navigator.share({ title, url });
      $("#shareTip").textContent = "已呼叫系統分享。";
      return;
    }catch(e){}
  }

  try{
    await navigator.clipboard.writeText(url);
    $("#shareTip").textContent = "已複製連結，可直接貼給對方！";
  }catch(e){
    $("#shareTip").textContent = `請手動複製：${url}`;
  }
}

/* Simple particle shards */
const fx = (() => {
  const ctx = fxCanvas.getContext("2d");
  let W=0,H=0, parts=[];

  function resize(){
    W = fxCanvas.width = window.innerWidth * devicePixelRatio;
    H = fxCanvas.height = window.innerHeight * devicePixelRatio;
  }
  window.addEventListener("resize", resize);

  function addBurst(intensity=1){
    const cx = (window.innerWidth/2) * devicePixelRatio;
    const cy = (window.innerHeight/2) * devicePixelRatio;

    const n = Math.floor(40 * intensity);
    for(let i=0;i<n;i++){
      const a = Math.random()*Math.PI*2;
      const sp = (1 + Math.random()*3) * devicePixelRatio;
      parts.push({
        x: cx, y: cy,
        vx: Math.cos(a)*sp,
        vy: Math.sin(a)*sp,
        life: 50 + Math.random()*40,
        size: (1 + Math.random()*3) * devicePixelRatio,
        rot: Math.random()*Math.PI
      });
    }
  }

  function tick(){
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation = "lighter";

    parts.forEach(p=>{
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98; p.vy *= 0.98;
      p.life -= 1;

      const alpha = Math.max(0, Math.min(1, p.life/80));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillRect(-p.size, -p.size, p.size*2, p.size*2);
      ctx.restore();
    });

    parts = parts.filter(p=>p.life>0);
    requestAnimationFrame(tick);
  }

  resize();
  tick();

  return { addBurst };
})();

function sparkBurst(intensity){ fx.addBurst(intensity); }

/* Events */
$("#btnStart").onclick = async () => {
  ensureAudioStarted();
  transitionFromOpening();
};

$("#btnToDraw").onclick = () => {
  showScene("draw");
  sparkBurst(0.9);
};

$("#btnDraw").onclick = async () => {
  ensureAudioStarted();
  await onDraw();
};

$("#btnBackToDraw").onclick = () => showScene("draw");
$("#btnToEnd").onclick = () => showScene("ending");
$("#btnSkipToEnd").onclick = () => showScene("ending");
$("#btnReplay").onclick = () => showScene("opening");
$("#btnShare").onclick = shareLink;

/* Init */
(async function init(){
  await loadText();
  await loadTopics();
  showScene("opening");
})();
