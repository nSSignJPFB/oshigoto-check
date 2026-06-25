const DATE_KEY = "nssignSupportTracker.date.v2";
const STORAGE_PREFIX = "nssignSupportTracker.v2.";

const pageConfigs = {
  daily: {
    title: "投票アイテムを集めよう！",
    description: "日々の集票状況をチェックできるリストです<br>チェックは同日内だけ保存されます<br>日付が変わると自動リセットされます<br>※手動リセットは画面最下部にあります",
    notice: "有効期限：180日〜年内期限",
    completeMessage: "コンプリート🎉 きょうの推しごと完了！",
    apps: [
      {
        name: "IDOL CHAMP",
        image: "assets/idolchamp.svg",
        description: "💙月末まで<br>❤️90日(投票券にすると年末まで)",
        tasks: [
          "出席後広告視聴❤️",
          "ルーレット❤️",
          "クイズ💙(5日連続満点❤️)",
        ]
      },
      {
        name: "LiNC",
        image: "assets/Linc.svg",
        description: "💜180日",
        tasks: [
          "広告視聴💜 [30回]<br>※1回ごとにインターバルあり",
        ]
      },
      {
        name: "tin",
        image: "assets/tin.svg",
        description: "💜180日",
        tasks: [
          "広告視聴💜 [20回]<br>※1回ごとにインターバルあり",
        ]
      },
      {
        name: "BIGC",
        image: "assets/BIGC.svg",
        description: "🟣１年",
        tasks: [
          "出席🟣",
          "招待イベントをチェック🟣",
          "BIGCのSNSを訪問🟣",
          "広告視聴🟣[100回]<br>※1回ごとに短いインターバル",
          "K-POPゲーム🟣",
        ]
      }
    ]
  },

  boost: {
    title: "投票アイテムを集めよう！",
    description:"日々の集票状況をチェックできるリストです<br>チェックは同日内だけ保存されます<br>日付が変わると自動リセットされます<br>※手動リセットは画面最下部にあります",
    notice: "⏱️ 60日〜90日",
    completeMessage: "コンプリート🎉 上乗せ推しごと完了！",
    apps: [
      {
        name: "mubeat",
        image: "assets/mubeat.svg",
        description: "💗90日(延長クーポンあり)",
        tasks: [
          "広告視聴💗 [15回]<br>※1回ごとに10秒インターバル",
          "クイズに挑戦💗<br>※1日1回は無料"
        ]
      },
      {
        name: "MUNIVERSE",
        image: "assets/muniverse.svg",
        description: " ⬜30日 ／ 🟦60日",
        tasks: [
          "広告視聴🟦 [20回]<br>※1回ごとに1分程度インターバル"
        ]
      },
      {
        name: "Higher",
        image: "assets/Higer.svg",
        description: "🔴90日",
        tasks: [
          "出席+広告視聴ボーナス🔴",
          "ルーレット🔴 [3回]",
          "はしご乗り🔴 [3回]",
          "広告視聴🔴 [50回]<br>※10回ごとに5分インターバル"
        ]
      }
    ]
  },

  final: {
    title: "投票アイテムを集めよう！",
    description: "日々の集票状況をチェックできるリストです<br>チェックは同日内だけ保存されます<br>日付が変わると自動リセットされます<br>※手動リセットは画面最下部にあります",
    notice: "⏱️ 30日以内",
    completeMessage: "コンプリート🎉 限界突破推しごと完了！",
    apps: [
      {
        name: "Fancast",
        image: "assets/Fancast.svg",
        description: "💙30日(チェックイン・広告)",
        tasks: [
          "チェックイン💙",
          "広告視聴💙 [視聴ボタン3つ×20回]<br>※1回ごとに10分インターバル",
          "FreeRoulette💙 [1回]　"
        ]
      },
      {
        name: "MUNIVERSE",
        image: "assets/muniverse.svg",
        description: "⬜30日 ／ 🟦60日",
        tasks: [
          "出席⬜"
        ]
      }
    ]
  }
};

const todayText = document.getElementById("todayText");
const pageTitle = document.getElementById("pageTitle");
const pageDescription = document.getElementById("pageDescription");
const pageNotice = document.getElementById("pageNotice");
const taskContainer = document.getElementById("taskContainer");
const progressText = document.getElementById("progressText");
const countText = document.getElementById("countText");
const progressFill = document.getElementById("progressFill");
const completeText = document.getElementById("completeText");
const manualResetButton = document.getElementById("manualResetButton");
const installButton = document.getElementById("installButton");

let currentPage = "daily";
let deferredPrompt = null;

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTodayJapanese() {
  const now = new Date();

  const weekdays = [
    "日",
    "月",
    "火",
    "水",
    "木",
    "金",
    "土"
  ];

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekday = weekdays[now.getDay()];

  return `${year}年${month}月${day}日（${weekday}）`;
}

function getPageFromHash() {
  const hash = location.hash.replace("#", "");
  return pageConfigs[hash] ? hash : "daily";
}

function getStorageKey(pageKey) {
  return `${STORAGE_PREFIX}${pageKey}`;
}

function ensureTodayStorage() {
  const today = getTodayKey();
  const savedDate = localStorage.getItem(DATE_KEY);

  if (savedDate !== today) {
    localStorage.setItem(DATE_KEY, today);

    Object.keys(pageConfigs).forEach((pageKey) => {
      localStorage.setItem(getStorageKey(pageKey), JSON.stringify({}));
    });
  }
}

function loadCheckedState(pageKey = currentPage) {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(pageKey))) || {};
  } catch {
    return {};
  }
}

function saveCheckedState(state, pageKey = currentPage) {
  localStorage.setItem(getStorageKey(pageKey), JSON.stringify(state));
}

function getTaskId(pageKey, appIndex, taskIndex) {
  return `${pageKey}-app-${appIndex}-task-${taskIndex}`;
}

function getAllTasks(pageKey) {
  return pageConfigs[pageKey].apps.flatMap((app) => app.tasks);
}

function calculatePageProgress(pageKey) {
  const state = loadCheckedState(pageKey);
  const total = getAllTasks(pageKey).length;

  if (total === 0) {
    return { checked: 0, total: 0, percent: 0 };
  }

  let checked = 0;

  pageConfigs[pageKey].apps.forEach((app, appIndex) => {
    app.tasks.forEach((task, taskIndex) => {
      const id = getTaskId(pageKey, appIndex, taskIndex);
      if (state[id]) checked += 1;
    });
  });

  return {
    checked,
    total,
    percent: Math.round((checked / total) * 100)
  };
}

function updateMiniProgress() {
  Object.keys(pageConfigs).forEach((pageKey) => {
    const element = document.getElementById(`${pageKey}MiniProgress`);
    if (!element) return;

    const progress = calculatePageProgress(pageKey);
    element.textContent = `${progress.percent}%`;
  });
}

function updateActiveTab() {
  document.querySelectorAll(".support-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.page === currentPage);
  });
}

function renderPage() {
  currentPage = getPageFromHash();
  const config = pageConfigs[currentPage];

  pageTitle.textContent = config.title;
  pageTitle.classList.toggle(
    "long-title",
    config.title === "投票アイテムを集めよう！"
  );
  pageDescription.innerHTML = config.description;
  pageNotice.innerHTML = config.notice || "";
  todayText.textContent = formatTodayJapanese();

  taskContainer.innerHTML = "";
  const checkedState = loadCheckedState(currentPage);

  config.apps.forEach((app, appIndex) => {
    const card = document.createElement("section");
    card.className = "app-card";

    const header = document.createElement("div");
    header.className = "app-card__header";

    const img = document.createElement("img");
    img.className = "app-icon";
    img.src = app.image;
    img.alt = `${app.name} icon`;

    const titleWrap = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = app.name;

    const desc = document.createElement("p");
    desc.className = "app-card__desc";
    desc.innerHTML = app.description;

    titleWrap.append(title, desc);
    header.append(img, titleWrap);

    const list = document.createElement("div");
    list.className = "task-list";

    app.tasks.forEach((task, taskIndex) => {
      const id = getTaskId(currentPage, appIndex, taskIndex);

      const label = document.createElement("label");
      label.className = "task-item";
      label.setAttribute("for", id);

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = id;
      checkbox.checked = Boolean(checkedState[id]);

      checkbox.addEventListener("change", () => {
        const nextState = loadCheckedState(currentPage);
        nextState[id] = checkbox.checked;
        saveCheckedState(nextState, currentPage);
        updateProgress();
        updateMiniProgress();
      });

      const span = document.createElement("span");
span.innerHTML = task;

label.append(checkbox, span);
list.append(label);
    });

    card.append(header, list);
    taskContainer.append(card);
  });

  updateActiveTab();
  updateProgress();
  updateMiniProgress();
}

function updateProgress() {
  const config = pageConfigs[currentPage];
  const progress = calculatePageProgress(currentPage);

  progressText.textContent = `${progress.percent}%`;
  countText.textContent = `${progress.checked} / ${progress.total}`;
  progressFill.style.width = `${progress.percent}%`;

  completeText.textContent =
    progress.total > 0 && progress.checked === progress.total
      ? config.completeMessage
      : "";
}

function manualReset() {
  if (!confirm("このページのチェックをリセットしますか？")) return;

  saveCheckedState({}, currentPage);
  renderPage();
}

function scheduleMidnightCheck() {
  setInterval(() => {
    const today = getTodayKey();
    const savedDate = localStorage.getItem(DATE_KEY);

    if (savedDate !== today) {
      ensureTodayStorage();
      renderPage();
    }
  }, 60 * 1000);
}

window.addEventListener("hashchange", () => {
  renderPage();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    return;
  }

  alert(
    "iPhoneの場合：Safariの共有ボタンから「ホーム画面に追加」を選んでください。\n\nAndroidの場合：Chromeのメニューから「ホーム画面に追加」を選んでください。"
  );
});

manualResetButton.addEventListener("click", manualReset);


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}


if (!location.hash || !pageConfigs[location.hash.replace("#", "")]) {
  location.hash = "daily";
}

ensureTodayStorage();
renderPage();
scheduleMidnightCheck();