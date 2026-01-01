function nextScene(current) {
    const currentScene = document.getElementById(`scene-${current}`);
    const nextScene = document.getElementById(`scene-${current + 1}`);

    if (!nextScene) {
        console.error("找不到下一個場景，請檢查 index.html 中的 id 是否為 scene-" + (current + 1));
        return;
    }

    // 啟動音樂（僅在第一幕進入第二幕時）
    if (current === 1) {
        const bgm = document.getElementById('bgm');
        if (bgm) bgm.play().catch(e => console.log("音樂播放受限"));
        loadContent(); // 確保進入第二頁時才加載內容
    }

    // 執行轉場
    currentScene.style.opacity = "0";
    setTimeout(() => {
        currentScene.classList.remove('active');
        nextScene.classList.add('active');
        // 強制瀏覽器重繪，確保動畫觸發
        setTimeout(() => {
            nextScene.style.opacity = "1";
        }, 50);
    }, 800);
}

// 獨立載入文案函數，增加錯誤檢查
function loadContent() {
    fetch('content.txt')
        .then(response => {
            if (!response.ok) throw new Error("文案檔讀取失敗");
            return response.text();
        })
        .then(data => {
            document.getElementById('text-display').innerText = data;
        })
        .catch(err => {
            console.error(err);
            document.getElementById('text-display').innerText = "祝福內容載入中...";
        });
}

// 抽籤邏輯：確保點擊按鈕會觸發
function startDraw(category) {
    console.log("開始抽籤：" + category);
    const bucket = document.getElementById('main-bucket');
    const sfx = document.getElementById('drawSfx');
    
    if (sfx) sfx.play();
    if (bucket) bucket.classList.add('shaking');

    setTimeout(() => {
        if (bucket) bucket.classList.remove('shaking');
        showTalisman();
    }, 1800);
}
