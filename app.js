(function () {
  const allQuestions = Array.isArray(window.QUESTIONS_DATA) ? window.QUESTIONS_DATA : [];

  // Phân loại toàn bộ 220 câu thành đúng 7 bộ chuyên đề, bảo đảm phủ đủ 220/220 câu (0 câu bị sót)
  function classifyQuestion(q) {
    const tags = [];
    const qLower = q.question.toLowerCase();
    const opts = Object.values(q.options || {}).filter(Boolean);
    const optsText = opts.join(" ").toLowerCase();
    const chap = (q.chapter || "").toUpperCase();

    // Bộ 1: Ngày tháng năm & Giai đoạn
    const isDateAnswer =
      opts.every((o) =>
        /^(trước năm|năm|thời kỳ|đêm ngày|ngày)?\s*(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{4}|\d{4}(\s*[-–]\s*\d{4})?)/i.test(
          o.trim()
        )
      ) ||
      /(vào thời gian nào|vào năm nào|năm bao nhiêu|vào ngày tháng năm nào|vào ngày bao nhiêu|vào thời điểm nào|từ khi nào|thuộc giai đoạn nào|là thời kỳ nào|là giai đoạn nào|xuất bản năm nào)/i.test(
        qLower
      );
    if (isDateAnswer) {
      tags.push("date_time");
    }

    // Bộ 2: Con số (Mấy / Bao nhiêu)
    const isNumberAnswer =
      opts.every((o) => /^(có\s*)?\d+(\s*phương pháp)?\.?$/i.test(o.trim())) ||
      /(mấy nội dung|mấy giai đoạn|mấy nguyên tắc|mấy chuẩn mực|mấy điều kiện|mấy phương pháp|mấy đặc trưng|mấy phương thức|bao nhiêu đạo luật|bao nhiêu nguyên tắc)/i.test(
        qLower
      );
    if (isNumberAnswer && !tags.includes("date_time")) {
      tags.push("number_count");
    }

    // Bộ 3: Đại hội, Văn kiện & Sự kiện
    const isCongressOrEvent =
      /(đại hội|văn kiện|cương lĩnh|hội nghị|mặt trận dân tộc|mặt trận nào|tổ chức nào|unesco|phong trào nào|tên gọi là gì|tuyên ngôn độc lập|quốc hội khóa)/i.test(
        qLower
      ) ||
      /(văn kiện đại hội|đại hội đại biểu|đại hội lần thứ|cương lĩnh xây dựng|mặt trận nhân dân|mặt trận tổ quốc|mặt trận độc lập|mặt trận việt minh|mặt trận dân chủ|bản yêu sách|đông du|hiến pháp năm)/i.test(
        optsText
      );
    if (isCongressOrEvent && !tags.includes("number_count")) {
      tags.push("congress_event");
    }

    // Bộ 4: Tác phẩm & Bài viết của Bác
    const isHcmWork =
      /(tác phẩm nào|bài viết nào|tác phẩm đầu tiên|văn bản nào)/i.test(qLower) ||
      /(đường cách mệnh|đường kách mệnh|sửa đổi lối làm việc|thường thức chính trị|đạo đức cách mạng|di chúc|bản án chế độ|lời kêu gọi toàn quốc|con đường dẫn tôi|hiến pháp năm 1946|người cán bộ cách mạng|đề cương văn hóa)/i.test(
        optsText
      );
    if (isHcmWork) {
      tags.push("hcm_works");
    }

    // Bộ 5: Cặp dễ nhầm & Giải nghĩa Luận điểm / Khái niệm
    const isCompareOrQuote =
      /(động lực của văn hóa|quan hệ giữa văn hóa|mối quan hệ giữa văn hóa|mục tiêu về .* của chủ nghĩa xã hội|đặc trưng .* của chủ nghĩa xã hội|giương cao ngọn cờ gì|tuyên bố nào|nhà nước của nhân dân|nhà nước vì dân|nền tảng của khối đại đoàn kết|dựa trên nền tảng nào)/i.test(
        qLower
      ) ||
      ((/[“"'].*[”"']/.test(q.question) ||
        /(có nghĩa là|nghĩa là gì|khẳng định điều gì|nói lên điều gì|đề cập đến điều gì|được hiểu như thế nào|ví như|nói lên nội dung gì)/i.test(
          qLower
        )) &&
        !tags.includes("date_time") &&
        !tags.includes("hcm_works") &&
        !tags.includes("congress_event"));
    if (isCompareOrQuote) {
      tags.push("compare_quotes");
    }

    // Bộ 6: Cơ sở, CM Giải phóng dân tộc, CNXH, Đảng & Nhà nước (Chương 1-4)
    const isCoreCh1to4 =
      chap.includes("1") ||
      chap.includes("2") ||
      chap.includes("3") ||
      chap.includes("4") ||
      /(đảng cộng sản|nhà nước pháp quyền|cách mạng giải phóng dân tộc|chủ nghĩa xã hội|chủ nghĩa mác|tư tưởng hồ chí minh)/i.test(
        qLower
      );
    if (isCoreCh1to4 && tags.length === 0) {
      tags.push("ch1_4_theory");
    }

    // Bộ 7: Đại đoàn kết, Đoàn kết quốc tế, Đạo đức, Văn hóa & Con người (Chương 5-6)
    const isCoreCh5to6 =
      chap.includes("5") ||
      chap.includes("6") ||
      /(đại đoàn kết|đoàn kết quốc tế|đạo đức|văn hóa|con người|cần, kiệm|yêu thương)/i.test(
        qLower
      );
    if (isCoreCh5to6 && tags.length === 0) {
      tags.push("ch5_6_theory");
    }

    // Bảo hiểm: nếu vẫn chưa thuộc bộ nào, đưa vào Bộ 6 hoặc 7 theo chương
    if (tags.length === 0) {
      tags.push(chap.includes("5") || chap.includes("6") ? "ch5_6_theory" : "ch1_4_theory");
    }

    return tags;
  }

  allQuestions.forEach((q) => {
    q.tags = classifyQuestion(q);
  });

  const CATEGORIES = [
    {
      id: "all",
      icon: "📚",
      name: "Toàn bộ 220 câu hỏi",
      desc: "Đầy đủ 220 câu gốc (phủ 100%)",
    },
    {
      id: "date_time",
      icon: "📅",
      name: "Bộ 1: Ngày tháng năm & Giai đoạn",
      desc: "Đáp án là mốc thời gian, năm, giai đoạn",
    },
    {
      id: "number_count",
      icon: "🔢",
      name: "Bộ 2: Con số (Mấy / Bao nhiêu)",
      desc: "Đáp án là số lượng 2, 3, 4, 5, 16...",
    },
    {
      id: "congress_event",
      icon: "🏛️",
      name: "Bộ 3: Đại hội, Văn kiện & Sự kiện",
      desc: "Đại hội VII–XIII, Cương lĩnh, Hội nghị, Tổ chức",
    },
    {
      id: "hcm_works",
      icon: "📖",
      name: "Bộ 4: Tác phẩm & Bài viết của Bác",
      desc: "Gợi ý: Trích trong tác phẩm/bài viết nào",
    },
    {
      id: "compare_quotes",
      icon: "🧭",
      name: "Bộ 5: Cặp dễ nhầm & Giải nghĩa",
      desc: "Gợi ý: Động lực VH, Mục tiêu CNXH, Câu nói",
    },
    {
      id: "ch1_4_theory",
      icon: "⚖️",
      name: "Bộ 6: Lý thuyết Đảng, Nhà nước & CM",
      desc: "Gợi ý: Các câu trọng tâm Chương 1–4 còn lại",
    },
    {
      id: "ch5_6_theory",
      icon: "🤝",
      name: "Bộ 7: Lý thuyết Đoàn kết, Đạo đức, VH",
      desc: "Gợi ý: Các câu trọng tâm Chương 5–6 còn lại",
    },
    {
      id: "wrong_only",
      icon: "❌",
      name: "Câu đang làm sai",
      desc: "Xem lại hoặc bấm Làm lại câu sai",
    },
    {
      id: "starred_only",
      icon: "⭐",
      name: "Câu đã đánh dấu sao",
      desc: "Các câu khó bạn bấm ngôi sao lưu lại",
    },
  ];

  const CHAPTERS = [
    { id: "ALL", name: "Tất cả các chương" },
    { id: "CHƯƠNG 1 + 2", name: "Chương 1 + 2" },
    { id: "CHƯƠNG 3 + 4", name: "Chương 3 + 4" },
    { id: "CHƯƠNG 5", name: "Chương 5" },
    { id: "CHƯƠNG 6", name: "Chương 6" },
  ];

  const TAG_LABELS = {
    date_time: "📅 Bộ 1: Ngày tháng",
    number_count: "🔢 Bộ 2: Con số",
    congress_event: "🏛️ Bộ 3: Đại hội & Sự kiện",
    hcm_works: "📖 Bộ 4: Tác phẩm HCM",
    compare_quotes: "🧭 Bộ 5: Cặp dễ nhầm & Giải nghĩa",
    ch1_4_theory: "⚖️ Bộ 6: Đảng, NN & CM",
    ch5_6_theory: "🤝 Bộ 7: Đoàn kết, Đạo đức, VH",
  };

  // Persistent state in localStorage
  const STORAGE_KEY = "tthcm_quiz_state_v1";
  let savedState = {
    answers: {}, // { [questionId]: "A" | "B" | "C" | "D" }
    starred: {}, // { [questionId]: true }
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      savedState.answers = parsed.answers || {};
      savedState.starred = parsed.starred || {};
    }
  } catch (e) {}

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    } catch (e) {}
  }

  // Active runtime state
  let currentMode = "practice"; // practice | flashcard | list | cheatsheet
  let currentCategory = "all";
  let currentChapter = "ALL";
  let filteredQuestions = [];
  let currentIndex = 0;
  let shuffleOptionsEnabled = false;
  let optionPermutations = {}; // { [qId]: ["A","B","C","D"] }
  let retryQueueIds = null; // Array of question IDs during active "Làm lại câu sai" session

  // DOM Elements
  const sidebar = document.getElementById("sidebar");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  const btnCloseSidebar = document.getElementById("btnCloseSidebar");
  const categoryListEl = document.getElementById("categoryList");
  const chapterListEl = document.getElementById("chapterList");
  const currentSetBadge = document.getElementById("currentSetBadge");
  const progressCounter = document.getElementById("progressCounter");
  const progressBarFill = document.getElementById("progressBarFill");
  const statCorrect = document.getElementById("statCorrect");
  const statWrong = document.getElementById("statWrong");
  const statStarred = document.getElementById("statStarred");
  const btnRetryWrongTop = document.getElementById("btnRetryWrongTop");
  const btnRetryWrongSidebar = document.getElementById("btnRetryWrongSidebar");

  const viewPractice = document.getElementById("viewPractice");
  const viewFlashcard = document.getElementById("viewFlashcard");
  const viewList = document.getElementById("viewList");
  const viewCheatsheet = document.getElementById("viewCheatsheet");

  const qChapter = document.getElementById("qChapter");
  const qTypeBadge = document.getElementById("qTypeBadge");
  const qIdLabel = document.getElementById("qIdLabel");
  const btnStarQuestion = document.getElementById("btnStarQuestion");
  const qText = document.getElementById("qText");
  const optionsContainer = document.getElementById("optionsContainer");
  const feedbackBanner = document.getElementById("feedbackBanner");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const gridDoneCount = document.getElementById("gridDoneCount");
  const questionGrid = document.getElementById("questionGrid");

  function getAllWrongQuestions() {
    return allQuestions.filter((q) => {
      const ans = savedState.answers[q.id];
      return ans && ans !== q.answer;
    });
  }

  function startRetryWrongSession() {
    const wrongList = getAllWrongQuestions();
    if (wrongList.length === 0) {
      alert("Hiện tại bạn chưa có câu nào làm sai để làm lại!");
      return;
    }
    retryQueueIds = wrongList.map((q) => q.id);
    // Xóa đáp án sai cũ của các câu này để làm lại từ đầu
    retryQueueIds.forEach((id) => {
      delete savedState.answers[id];
    });
    saveState();
    currentCategory = "retry_wrong";
    currentChapter = "ALL";
    if (currentMode !== "practice") {
      setMode("practice");
    }
    applyFilter(true);
    closeMobileSidebar();
  }

  function getQuestionsForFilter(catId, chapId) {
    if (catId === "retry_wrong" && Array.isArray(retryQueueIds)) {
      const idSet = new Set(retryQueueIds);
      return allQuestions.filter((q) => idSet.has(q.id));
    }
    return allQuestions.filter((q) => {
      if (chapId !== "ALL" && q.chapter.toUpperCase() !== chapId.toUpperCase()) {
        return false;
      }
      if (catId === "all") return true;
      if (catId === "wrong_only") {
        const userAns = savedState.answers[q.id];
        return userAns && userAns !== q.answer;
      }
      if (catId === "starred_only") {
        return !!savedState.starred[q.id];
      }
      return q.tags && q.tags.includes(catId);
    });
  }

  function applyFilter(resetIdx = true) {
    filteredQuestions = getQuestionsForFilter(currentCategory, currentChapter);
    if (resetIdx) currentIndex = 0;
    if (currentIndex >= filteredQuestions.length) {
      currentIndex = Math.max(0, filteredQuestions.length - 1);
    }
    renderSidebar();
    renderCurrentView();
  }

  function renderSidebar() {
    categoryListEl.innerHTML = "";
    CATEGORIES.forEach((cat) => {
      const count = getQuestionsForFilter(cat.id, currentChapter).length;
      const btn = document.createElement("button");
      btn.className = "cat-item" + (currentCategory === cat.id ? " active" : "");
      btn.innerHTML = `
        <div class="cat-item-left">
          <span>${cat.icon}</span>
          <div>
            <div>${cat.name}</div>
            <span class="cat-item-desc">${cat.desc}</span>
          </div>
        </div>
        <span class="cat-count">${count}</span>
      `;
      btn.addEventListener("click", () => {
        retryQueueIds = null;
        currentCategory = cat.id;
        if (currentMode === "cheatsheet") {
          setMode("practice");
        }
        applyFilter(true);
        closeMobileSidebar();
      });
      categoryListEl.appendChild(btn);
    });

    chapterListEl.innerHTML = "";
    CHAPTERS.forEach((ch) => {
      const count = getQuestionsForFilter(currentCategory, ch.id).length;
      const btn = document.createElement("button");
      btn.className = "cat-item" + (currentChapter === ch.id ? " active" : "");
      btn.innerHTML = `
        <span>${ch.name}</span>
        <span class="cat-count">${count}</span>
      `;
      btn.addEventListener("click", () => {
        currentChapter = ch.id;
        applyFilter(true);
        closeMobileSidebar();
      });
      chapterListEl.appendChild(btn);
    });
  }

  function updateTopStats() {
    let correct = 0;
    let wrong = 0;
    let doneInSet = 0;

    filteredQuestions.forEach((q) => {
      const ans = savedState.answers[q.id];
      if (ans) {
        doneInSet++;
        if (ans === q.answer) correct++;
        else wrong++;
      }
    });

    const totalWrongAll = getAllWrongQuestions().length;
    const totalStarred = Object.keys(savedState.starred).filter((k) => savedState.starred[k]).length;
    statCorrect.textContent = correct;
    statWrong.textContent = wrong;
    statStarred.textContent = totalStarred;

    if (totalWrongAll > 0) {
      if (btnRetryWrongTop) {
        btnRetryWrongTop.classList.remove("hidden");
        btnRetryWrongTop.textContent = `🔁 Làm lại ${totalWrongAll} câu sai`;
      }
      if (btnRetryWrongSidebar) {
        btnRetryWrongSidebar.textContent = `🔁 Làm lại ${totalWrongAll} câu sai`;
      }
    } else {
      if (btnRetryWrongTop) btnRetryWrongTop.classList.add("hidden");
      if (btnRetryWrongSidebar) btnRetryWrongSidebar.textContent = "🔁 Làm lại các câu sai (0)";
    }

    if (currentCategory === "retry_wrong") {
      currentSetBadge.textContent = `🔁 Đang làm lại câu sai (${filteredQuestions.length} câu)`;
    } else {
      const activeCat = CATEGORIES.find((c) => c.id === currentCategory);
      const chapSuffix = currentChapter !== "ALL" ? ` (${currentChapter})` : "";
      currentSetBadge.textContent = (activeCat ? activeCat.name : "Bộ đề") + chapSuffix;
    }

    if (filteredQuestions.length > 0) {
      progressCounter.textContent = `Câu ${currentIndex + 1}/${filteredQuestions.length}`;
      const pct = Math.round(((currentIndex + 1) / filteredQuestions.length) * 100);
      progressBarFill.style.width = `${pct}%`;
    } else {
      progressCounter.textContent = "0/0 câu";
      progressBarFill.style.width = "0%";
    }

    gridDoneCount.textContent = `${doneInSet}/${filteredQuestions.length}`;
  }

  function renderPracticeQuestion() {
    updateTopStats();
    if (filteredQuestions.length === 0) {
      qChapter.textContent = "TRỐNG";
      qTypeBadge.classList.add("hidden");
      qIdLabel.textContent = "";
      qText.textContent =
        currentCategory === "wrong_only"
          ? "Chưa có câu nào sai! Khi bạn chọn sai một câu, câu đó sẽ tự động vào đây để bạn làm lại."
          : "Không có câu hỏi nào trong mục này.";
      optionsContainer.innerHTML = "";
      feedbackBanner.classList.add("hidden");
      questionGrid.innerHTML = "";
      return;
    }

    const q = filteredQuestions[currentIndex];
    qChapter.textContent = q.chapter;
    if (q.tags && q.tags.length > 0) {
      qTypeBadge.textContent = q.tags.map((t) => TAG_LABELS[t] || t).join(" • ");
      qTypeBadge.classList.remove("hidden");
    } else {
      qTypeBadge.classList.add("hidden");
    }

    qIdLabel.textContent = `Câu gốc #${q.id}`;
    const isStar = !!savedState.starred[q.id];
    btnStarQuestion.textContent = isStar ? "★" : "☆";
    btnStarQuestion.classList.toggle("starred", isStar);

    qText.textContent = q.question;

    const baseKeys = ["A", "B", "C", "D"].filter((k) => q.options[k] && q.options[k].trim() !== "");
    const displayKeys =
      shuffleOptionsEnabled && optionPermutations[q.id] ? optionPermutations[q.id] : baseKeys;

    const userAns = savedState.answers[q.id];
    optionsContainer.innerHTML = "";

    displayKeys.forEach((origKey, idx) => {
      const displayLetter = ["A", "B", "C", "D"][idx];
      const btn = document.createElement("button");
      btn.className = "option-btn";
      if (userAns) {
        if (origKey === q.answer) {
          btn.classList.add("correct");
        } else if (origKey === userAns && userAns !== q.answer) {
          btn.classList.add("wrong");
        }
      }

      btn.innerHTML = `
        <span class="option-letter">${displayLetter}</span>
        <span class="option-text">${q.options[origKey]}</span>
      `;

      btn.addEventListener("click", () => {
        selectAnswer(q, origKey);
      });
      optionsContainer.appendChild(btn);
    });

    if (userAns) {
      feedbackBanner.classList.remove("hidden", "is-correct", "is-wrong");
      const correctDisplayIdx = displayKeys.indexOf(q.answer);
      const correctDisplayLetter = ["A", "B", "C", "D"][correctDisplayIdx] || q.answer;
      if (userAns === q.answer) {
        feedbackBanner.classList.add("is-correct");
        feedbackBanner.textContent = "✓ Chính xác!";
      } else {
        feedbackBanner.classList.add("is-wrong");
        feedbackBanner.textContent = `✗ Chưa đúng. Đáp án đúng là ${correctDisplayLetter}.`;
      }
    } else {
      feedbackBanner.classList.add("hidden");
    }

    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === filteredQuestions.length - 1;

    renderQuestionGrid();
  }

  function selectAnswer(q, chosenOrigKey) {
    savedState.answers[q.id] = chosenOrigKey;
    saveState();
    renderPracticeQuestion();
    renderSidebar();
  }

  function renderQuestionGrid() {
    questionGrid.innerHTML = "";
    filteredQuestions.forEach((q, idx) => {
      const cell = document.createElement("button");
      cell.className = "grid-cell";
      if (idx === currentIndex) cell.classList.add("current");
      const ans = savedState.answers[q.id];
      if (ans) {
        if (ans === q.answer) cell.classList.add("answered-correct");
        else cell.classList.add("answered-wrong");
      }
      if (savedState.starred[q.id]) cell.classList.add("starred");
      cell.textContent = idx + 1;
      cell.title = `Câu ${idx + 1} (Gốc #${q.id})`;
      cell.addEventListener("click", () => {
        currentIndex = idx;
        renderPracticeQuestion();
      });
      questionGrid.appendChild(cell);
    });
  }

  // FLASHCARD MODE
  const fcBadges = document.getElementById("fcBadges");
  const fcQuestion = document.getElementById("fcQuestion");
  const fcAnswerBox = document.getElementById("fcAnswerBox");
  const fcAnswerText = document.getElementById("fcAnswerText");
  const fcAllOptions = document.getElementById("fcAllOptions");
  const flashcardBox = document.getElementById("flashcardBox");

  function renderFlashcard() {
    updateTopStats();
    fcAnswerBox.classList.add("hidden");
    if (filteredQuestions.length === 0) {
      fcBadges.innerHTML = "";
      fcQuestion.textContent = "Không có câu hỏi nào trong bộ lọc này.";
      return;
    }
    const q = filteredQuestions[currentIndex];
    fcBadges.innerHTML = `
      <span class="chapter-badge">${q.chapter}</span>
      <span class="q-id-label">Câu gốc #${q.id}</span>
    `;
    fcQuestion.textContent = q.question;
    fcAnswerText.textContent = `${q.answer}. ${q.options[q.answer]}`;
    const others = ["A", "B", "C", "D"]
      .filter((k) => q.options[k] && q.options[k].trim() !== "")
      .map((k) => `<div><b>${k}:</b> ${q.options[k]}</div>`)
      .join("");
    fcAllOptions.innerHTML = others;
  }

  flashcardBox.addEventListener("click", () => {
    fcAnswerBox.classList.toggle("hidden");
  });
  document.getElementById("btnFcFlip").addEventListener("click", () => {
    fcAnswerBox.classList.toggle("hidden");
  });
  document.getElementById("btnFcPrev").addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderFlashcard();
    }
  });
  document.getElementById("btnFcNext").addEventListener("click", () => {
    if (currentIndex < filteredQuestions.length - 1) {
      currentIndex++;
      renderFlashcard();
    }
  });

  // LIST & SEARCH MODE
  const searchInput = document.getElementById("searchInput");
  const chkHideAnswersInList = document.getElementById("chkHideAnswersInList");
  const listCountInfo = document.getElementById("listCountInfo");
  const questionsListView = document.getElementById("questionsListView");

  function renderListView() {
    updateTopStats();
    const query = (searchInput.value || "").trim().toLowerCase();
    const hideAns = chkHideAnswersInList.checked;

    const list = filteredQuestions.filter((q) => {
      if (!query) return true;
      const inQ = q.question.toLowerCase().includes(query);
      const inOpts = Object.values(q.options).some((o) => (o || "").toLowerCase().includes(query));
      return inQ || inOpts || String(q.id) === query;
    });

    listCountInfo.textContent = `Hiển thị ${list.length} / ${filteredQuestions.length} câu hỏi trong bộ đang chọn`;
    questionsListView.innerHTML = "";

    list.forEach((q, idx) => {
      const card = document.createElement("div");
      card.className = "list-q-card";
      const tagPills = (q.tags || [])
        .map((t) => `<span class="type-badge">${TAG_LABELS[t] || t}</span>`)
        .join("");

      const optsHtml = ["A", "B", "C", "D"]
        .filter((k) => q.options[k] && q.options[k].trim() !== "")
        .map((k) => {
          const isAns = !hideAns && k === q.answer;
          return `<div class="list-opt ${isAns ? "is-ans" : ""}"><b>${k}.</b> ${q.options[k]}</div>`;
        })
        .join("");

      card.innerHTML = `
        <div class="badges-row">
          <span class="chapter-badge">${q.chapter}</span>
          ${tagPills}
          <span class="q-id-label">#${q.id}</span>
        </div>
        <div class="list-q-title">Câu ${idx + 1}: ${q.question}</div>
        <div class="list-q-options">${optsHtml}</div>
      `;
      questionsListView.appendChild(card);
    });
  }

  searchInput.addEventListener("input", renderListView);
  chkHideAnswersInList.addEventListener("change", renderListView);

  // CHEATSHEET MODE
  const cheatsheetContainer = document.getElementById("cheatsheetContainer");

  function renderCheatsheet() {
    updateTopStats();
    const groups = [
      {
        tag: "date_time",
        title: "📅 Bộ 1: Mốc Thời Gian, Ngày Tháng Năm & Giai Đoạn",
      },
      {
        tag: "number_count",
        title: "🔢 Bộ 2: Các Con Số Dễ Nhầm (Mấy / Bao Nhiêu)",
      },
      {
        tag: "congress_event",
        title: "🏛️ Bộ 3: Sự Kiện, Đại Hội, Văn Kiện & Tổ Chức",
      },
      {
        tag: "hcm_works",
        title: "📖 Bộ 4: Tác Phẩm & Bài Viết Của Hồ Chí Minh",
      },
      {
        tag: "compare_quotes",
        title: "🧭 Bộ 5: Cặp Dễ Nhầm & Giải Nghĩa Luận Điểm",
      },
    ];

    const trapNotes = `
      <div class="cheat-card" style="border-color: rgba(251, 191, 36, 0.45);">
        <h3 style="color: #fbbf24;">⚠️ Lưu ý các cặp câu gần giống nhau trong bộ 220 câu (rất dễ mất điểm)</h3>
        <table class="cheat-table">
          <thead>
            <tr>
              <th style="width:32%">Cặp câu hỏi</th>
              <th>Điểm khác biệt / Cách nhớ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Câu #16 (Chương 6)</b> vs <b>Câu #85 (Chương 5)</b></td>
              <td>• "Xây dựng con người cần chú ý <b>mấy nội dung</b>?" (Chương 6) → <span class="cheat-highlight">4</span><br>• "Xây dựng con người cần chú ý <b>trên mấy nội dung</b>?" (Chương 5) → <span class="cheat-highlight">3</span></td>
            </tr>
            <tr>
              <td><b>Câu #202 (Chương 5)</b> vs <b>Câu #220 (Chương 3+4)</b></td>
              <td>Cùng hỏi <i>"Trong giai đoạn hiện nay, để xây dựng được khối đại đoàn kết dân tộc vững chắc, cần dựa trên nền tảng nào"</i>:<br>• Câu có dấu hỏi <code>?</code> (Chương 5) → <span class="cheat-highlight">Giai cấp công nhân</span><br>• Câu không có dấu hỏi (Chương 3+4) → <span class="cheat-highlight">Liên minh công - nông - trí thức</span></td>
            </tr>
            <tr>
              <td><b>5 câu Động lực Văn hóa</b></td>
              <td>• Văn hóa <b>văn nghệ</b> → Nâng cao lòng yêu nước, lý tưởng...<br>• Văn hóa <b>chính trị</b> → Soi đường cho quốc dân đi...<br>• Văn hóa <b>pháp luật</b> → Bảo dân chủ, trật tự, kỷ cương, phép nước.<br>• Văn hóa <b>đạo đức</b> → Nâng cao phẩm giá, chân thiện mỹ.<br>• Văn hóa <b>giáo dục</b> → Diệt giặc dốt, xóa mù chữ, trồng người.</td>
            </tr>
            <tr>
              <td><b>Các kỳ Đại hội Đảng</b></td>
              <td>• <b>Đại hội VII (1991)</b>: Lần đầu nêu TTHCM + "Đảng lấy CN Mác-Lênin & TTHCM làm nền tảng..." + kết quả vận dụng sáng tạo.<br>• <b>Đại hội IX (2001)</b>: Định nghĩa đầu tiên (chưa có cụm <i>"vô cùng to lớn và quý giá... mãi mãi soi đường"</i>).<br>• <b>Đại hội XI (2011)</b>: Khái niệm hoàn chỉnh nhất đến nay + Cương lĩnh 2011 (<i>"Con người là trung tâm..."</i>).<br>• <b>Đại hội XII</b>: <i>"Đại đoàn kết dân tộc là đường lối chiến lược... động lực và nguồn lực to lớn..."</i><br>• <b>Đại hội XIII</b>: <i>"Phát huy sức mạnh đại đoàn kết... tăng cường pháp chế, bảo đảm kỷ cương xã hội"</i>.</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    cheatsheetContainer.innerHTML =
      trapNotes +
      groups
        .map((g) => {
          const qs = allQuestions.filter((q) => q.tags && q.tags.includes(g.tag));
          const rows = qs
            .map(
              (q, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><span class="chapter-badge">${q.chapter}</span></td>
            <td>${q.question}</td>
            <td class="cheat-highlight">${q.options[q.answer] || q.answer}</td>
          </tr>
        `
            )
            .join("");
          return `
        <div class="cheat-card">
          <h3>${g.title} (${qs.length} câu)</h3>
          <table class="cheat-table">
            <thead>
              <tr>
                <th style="width:45px">#</th>
                <th style="width:125px">Chương</th>
                <th>Câu hỏi / Dấu hiệu nhận biết</th>
                <th style="width:34%">Đáp án chuẩn</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
        })
        .join("");
  }

  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll(".mode-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.mode === mode);
    });
    viewPractice.classList.toggle("hidden", mode !== "practice");
    viewFlashcard.classList.toggle("hidden", mode !== "flashcard");
    viewList.classList.toggle("hidden", mode !== "list");
    viewCheatsheet.classList.toggle("hidden", mode !== "cheatsheet");
    renderCurrentView();
  }

  function renderCurrentView() {
    if (currentMode === "practice") renderPracticeQuestion();
    else if (currentMode === "flashcard") renderFlashcard();
    else if (currentMode === "list") renderListView();
    else if (currentMode === "cheatsheet") renderCheatsheet();
  }

  // Event Listeners
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setMode(btn.dataset.mode);
      closeMobileSidebar();
    });
  });

  if (btnRetryWrongTop) btnRetryWrongTop.addEventListener("click", startRetryWrongSession);
  if (btnRetryWrongSidebar) btnRetryWrongSidebar.addEventListener("click", startRetryWrongSession);

  btnPrev.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderPracticeQuestion();
    }
  });

  btnNext.addEventListener("click", () => {
    if (currentIndex < filteredQuestions.length - 1) {
      currentIndex++;
      renderPracticeQuestion();
    }
  });

  btnStarQuestion.addEventListener("click", () => {
    if (!filteredQuestions[currentIndex]) return;
    const q = filteredQuestions[currentIndex];
    savedState.starred[q.id] = !savedState.starred[q.id];
    if (!savedState.starred[q.id]) delete savedState.starred[q.id];
    saveState();
    renderPracticeQuestion();
    renderSidebar();
  });

  document.getElementById("btnShuffle").addEventListener("click", () => {
    for (let i = filteredQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredQuestions[i], filteredQuestions[j]] = [filteredQuestions[j], filteredQuestions[i]];
    }
    currentIndex = 0;
    renderCurrentView();
  });

  document.getElementById("btnShuffleOptions").addEventListener("click", (e) => {
    shuffleOptionsEnabled = !shuffleOptionsEnabled;
    if (shuffleOptionsEnabled) {
      allQuestions.forEach((q) => {
        const keys = ["A", "B", "C", "D"].filter((k) => q.options[k] && q.options[k].trim() !== "");
        for (let i = keys.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [keys[i], keys[j]] = [keys[j], keys[i]];
        }
        optionPermutations[q.id] = keys;
      });
      e.currentTarget.textContent = "🔄 Đang đảo A/B/C/D (Bật)";
    } else {
      optionPermutations = {};
      e.currentTarget.textContent = "🔄 Đảo đáp án A/B/C/D";
    }
    renderCurrentView();
  });

  document.getElementById("btnResetProgress").addEventListener("click", () => {
    if (confirm("Bạn có chắc muốn xóa lịch sử đúng/sai để làm lại từ đầu không?")) {
      savedState.answers = {};
      retryQueueIds = null;
      if (currentCategory === "retry_wrong") currentCategory = "all";
      saveState();
      applyFilter(false);
    }
  });

  function closeMobileSidebar() {
    sidebar.classList.remove("open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("open");
  }

  function openMobileSidebar() {
    sidebar.classList.add("open");
    if (sidebarBackdrop) sidebarBackdrop.classList.add("open");
  }

  document.getElementById("btnToggleSidebar").addEventListener("click", () => {
    if (sidebar.classList.contains("open")) closeMobileSidebar();
    else openMobileSidebar();
  });

  if (btnCloseSidebar) btnCloseSidebar.addEventListener("click", closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeMobileSidebar);

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (currentMode === "practice" && filteredQuestions[currentIndex]) {
      const q = filteredQuestions[currentIndex];
      const baseKeys = ["A", "B", "C", "D"].filter((k) => q.options[k] && q.options[k].trim() !== "");
      const displayKeys =
        shuffleOptionsEnabled && optionPermutations[q.id] ? optionPermutations[q.id] : baseKeys;

      const keyMap = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        a: 0,
        b: 1,
        c: 2,
        d: 3,
      };
      const kLower = e.key.toLowerCase();
      if (kLower in keyMap) {
        const idx = keyMap[kLower];
        if (idx < displayKeys.length) {
          e.preventDefault();
          selectAnswer(q, displayKeys[idx]);
        }
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (currentIndex < filteredQuestions.length - 1) {
          currentIndex++;
          renderPracticeQuestion();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) {
          currentIndex--;
          renderPracticeQuestion();
        }
      } else if (kLower === "s") {
        e.preventDefault();
        btnStarQuestion.click();
      }
    } else if (currentMode === "flashcard") {
      if (e.key === " ") {
        e.preventDefault();
        fcAnswerBox.classList.toggle("hidden");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        document.getElementById("btnFcNext").click();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        document.getElementById("btnFcPrev").click();
      }
    }
  });

  // Initialize
  applyFilter(true);
})();
