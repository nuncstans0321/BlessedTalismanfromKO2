// 載入文案
window.onload = () => {
    fetch('content.txt')
        .then(response => response.text())
        .then(data => {
            document.getElementById('text-display').innerText = data;
        })
        .catch(err => console.error("無法載入文案檔案"));
};

// 場景轉換
function nextScene(current) {
    const currentScene = document.getElementById(`scene-${current}`);
    const nextScene = document.getElementById(`scene-${current + 1}`);
    
    if (current === 1) {
        document.getElementById('bgm').play().catch(e => console.log("音效自動播放受限"));
    }
    
    // 轉場淡出特效
    currentScene.style.opacity = "0";
    setTimeout(() => {
        currentScene.classList.remove('active');
        nextScene.classList.add('active');
        nextScene.style.opacity = "1";
    }, 600);
}

// 抽籤啟動
function startDraw(category) {
    const bucket = document.getElementById('main-bucket');
    const sfx = document.getElementById('drawSfx');
    
    sfx.play();
    bucket.classList.add('shaking');

    // 模擬抽籤過程
    setTimeout(() => {
        bucket.classList.remove('shaking');
        showTalisman();
    }, 1800);
}

// 顯示結果
function showTalisman() {
    const overlay = document.getElementById('card-overlay');
    const resultImg = document.getElementById('talisman-result');
    
    // 隨機選取 1-11 張平安符圖檔
    const randomIdx = Math.floor(Math.random() * 11) + 1;
    resultImg.src = `assets/card_${randomIdx}.png`;
    
    overlay.classList.remove('hidden');
}

function closeTalisman() {
    document.getElementById('card-overlay').classList.add('hidden');
    // 閱讀完後自動跳到結尾
    setTimeout(() => nextScene(3), 300);
}

function shareLink() {
    navigator.clipboard.writeText(window.location.href);
    alert("祝福連結已複製！");
}
