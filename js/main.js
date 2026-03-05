// Main JS for SmartStudy AI demo UI

document.addEventListener("DOMContentLoaded", function () {
  handleSidebarToggle();
  handlePasswordToggles();
  handlePasswordStrength();
  handleUploadDropzone();
  handleAIToolsCopy();
  handleQuizFlow();
  initAnalyticsCharts();
});

function handleSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  const toggleBtn = document.querySelector("[data-sidebar-toggle]");
  const pinBtn = document.querySelector("[data-sidebar-pin]");
  const body = document.body;

  // create hover zone for showing sidebar when collapsed (desktop)
  const hoverZone = document.createElement("div");
  hoverZone.className = "sidebar-hover-zone";
  document.body.appendChild(hoverZone);

  const collapse = () => {
    if (!body.classList.contains("sidebar-pinned")) {
      body.classList.add("sidebar-collapsed");
    }
  };

  const expand = () => {
    body.classList.remove("sidebar-collapsed");
  };

  // initial state: collapsed on small screens; on desktop collapsed unless pinned
  if (window.innerWidth < 992 || !body.classList.contains("sidebar-pinned")) {
    body.classList.add("sidebar-collapsed");
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      if (body.classList.contains("sidebar-collapsed")) {
        expand();
        body.classList.add("sidebar-pinned");
      } else {
        body.classList.remove("sidebar-pinned");
        collapse();
      }
    });
  }

  if (pinBtn) {
    pinBtn.addEventListener("click", function () {
      if (body.classList.contains("sidebar-pinned")) {
        body.classList.remove("sidebar-pinned");
        collapse();
      } else {
        body.classList.add("sidebar-pinned");
        expand();
      }
    });
  }

  hoverZone.addEventListener("mouseenter", function () {
    if (window.innerWidth >= 992 && body.classList.contains("sidebar-collapsed") && !body.classList.contains("sidebar-pinned")) {
      expand();
    }
  });

  sidebar.addEventListener("mouseleave", function () {
    if (window.innerWidth >= 992 && !body.classList.contains("sidebar-pinned")) {
      collapse();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth < 992) {
      body.classList.add("sidebar-collapsed");
    } else if (body.classList.contains("sidebar-pinned")) {
      expand();
    }
  });
}

function handlePasswordToggles() {
  const toggles = document.querySelectorAll(".toggle-password");
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const targetSelector = this.getAttribute("data-target");
      if (!targetSelector) return;
      const input = document.querySelector(targetSelector);
      if (!input) return;

      const currentType = input.getAttribute("type");
      input.setAttribute("type", currentType === "password" ? "text" : "password");

      const icon = this.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });
  });
}

function handlePasswordStrength() {
  const passwordInput = document.querySelector("[data-password-strength]");
  const bar = document.querySelector(".password-strength-bar");
  if (!passwordInput || !bar) return;

  passwordInput.addEventListener("input", function () {
    const value = this.value || "";
    let score = 0;

    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    let width = 0;
    let color = "#e5e7eb";
    if (score === 1) {
      width = 25;
      color = "#f97316"; // orange
    } else if (score === 2) {
      width = 50;
      color = "#facc15"; // amber
    } else if (score === 3) {
      width = 75;
      color = "#22c55e"; // green
    } else if (score >= 4) {
      width = 100;
      color = "#16a34a";
    }

    bar.style.width = width + "%";
    bar.style.backgroundColor = color;
  });
}

function handleUploadDropzone() {
  const zone = document.querySelector(".upload-dropzone");
  if (!zone) return;

  const input = document.querySelector("#uploadInputHidden");

  const addHover = () => zone.classList.add("hover");
  const removeHover = () => zone.classList.remove("hover");

  ["dragenter", "dragover"].forEach((evt) => {
    zone.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      addHover();
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    zone.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      removeHover();
    });
  });

  zone.addEventListener("click", function () {
    if (input) input.click();
  });
}

function handleAIToolsCopy() {
  const btn = document.querySelector("[data-copy-summary]");
  const summary = document.querySelector("[data-summary-text]");
  if (!btn || !summary) return;

  btn.addEventListener("click", async function () {
    const text = summary.innerText.trim();
    try {
      await navigator.clipboard.writeText(text);
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      setTimeout(() => {
        btn.innerHTML = original;
      }, 1200);
    } catch (e) {
      console.warn("Clipboard copy failed", e);
    }
  });
}

function handleQuizFlow() {
  const quizContainer = document.querySelector("[data-quiz]");
  if (!quizContainer) return;

  const questions = [
    {
      text: "What is the time complexity of binary search on a sorted array?",
      options: [
        "O(n)",
        "O(log n)",
        "O(n log n)",
        "O(1)"
      ],
      correctIndex: 1
    },
    {
      text: "Which structure is ideal for implementing a First-In-First-Out (FIFO) collection?",
      options: [
        "Stack",
        "Queue",
        "Heap",
        "Tree"
      ],
      correctIndex: 1
    },
    {
      text: "In Big-O notation, which of the following grows the fastest?",
      options: [
        "O(n)",
        "O(n log n)",
        "O(2^n)",
        "O(log n)"
      ],
      correctIndex: 2
    }
  ];

  const questionText = document.querySelector("[data-quiz-question-text]");
  const optionNodes = Array.from(document.querySelectorAll("[data-quiz-option]"));
  const progressBar = document.querySelector("[data-quiz-progress]");
  const progressLabel = document.querySelector("[data-quiz-progress-label]");
  const nextBtn = document.querySelector("[data-quiz-next]");
  const resultModalEl = document.getElementById("quizResultModal");

  let currentIndex = 0;
  let selectedIndex = null;
  let correctCount = 0;

  function renderQuestion() {
    const current = questions[currentIndex];
    if (!current) return;

    questionText.textContent = current.text;
    optionNodes.forEach((node, idx) => {
      node.classList.remove("selected", "correct", "incorrect");
      node.querySelector("[data-quiz-option-label]").textContent = current.options[idx];
      node.setAttribute("data-option-index", String(idx));
    });
    selectedIndex = null;
    nextBtn.disabled = true;

    const pct = Math.round(((currentIndex + 1) / questions.length) * 100);
    if (progressBar) {
      progressBar.style.width = pct + "%";
      progressBar.setAttribute("aria-valuenow", String(pct));
    }
    if (progressLabel) {
      progressLabel.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
    }
  }

  optionNodes.forEach((node) => {
    node.addEventListener("click", function () {
      optionNodes.forEach((n) => n.classList.remove("selected"));
      this.classList.add("selected");
      selectedIndex = Number(this.getAttribute("data-option-index"));
      nextBtn.disabled = false;
    });
  });

  nextBtn.addEventListener("click", function () {
    if (selectedIndex == null) return;
    const current = questions[currentIndex];
    if (!current) return;

    // mark correct / incorrect visually
    optionNodes.forEach((node) => {
      const idx = Number(node.getAttribute("data-option-index"));
      if (idx === current.correctIndex) {
        node.classList.add("correct");
      } else if (idx === selectedIndex) {
        node.classList.add("incorrect");
      }
    });

    if (selectedIndex === current.correctIndex) {
      correctCount++;
    }

    // brief delay, then show next
    setTimeout(() => {
      currentIndex++;
      if (currentIndex >= questions.length) {
        showQuizResults(resultModalEl, questions.length, correctCount);
      } else {
        renderQuestion();
      }
    }, 700);
  });

  renderQuestion();
}

function showQuizResults(modalEl, total, correct) {
  const percent = Math.round((correct / total) * 100);
  const circle = document.querySelector("[data-quiz-score-circle]");
  const detail = document.querySelector("[data-quiz-score-detail]");
  const message = document.querySelector("[data-quiz-score-message]");

  if (circle) {
    circle.textContent = percent + "%";
  }
  if (detail) {
    detail.textContent = `Correct: ${correct} / ${total}`;
  }
  if (message) {
    if (percent >= 80) {
      message.textContent = "Great job! You're mastering this topic.";
    } else if (percent >= 50) {
      message.textContent =
        "Nice effort! Review the weak areas and try again.";
    } else {
      message.textContent =
        "Keep going — focus on the fundamentals and practice more.";
    }
  }

  if (modalEl && typeof bootstrap !== "undefined") {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

function initAnalyticsCharts() {
  const trendCanvas = document.getElementById("scoreTrendChart");
  const subjectCanvas = document.getElementById("subjectPerformanceChart");
  if (!trendCanvas || !subjectCanvas || typeof Chart === "undefined") return;

  const ctxTrend = trendCanvas.getContext("2d");
  const ctxSubject = subjectCanvas.getContext("2d");

  // Line chart: last 10 quizzes
  new Chart(ctxTrend, {
    type: "line",
    data: {
      labels: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10"],
      datasets: [
        {
          label: "Score (%)",
          data: [62, 70, 68, 75, 81, 78, 84, 90, 88, 92],
          borderColor: "#4F46E5",
          backgroundColor: "rgba(79, 70, 229, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#4F46E5"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20
          },
          grid: {
            color: "rgba(148, 163, 184, 0.35)"
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });

  // Bar chart: performance by subject
  new Chart(ctxSubject, {
    type: "bar",
    data: {
      labels: [
        "Data Structures",
        "Linear Algebra",
        "Organic Chemistry",
        "Psychology",
        "Microeconomics"
      ],
      datasets: [
        {
          label: "Average Score (%)",
          data: [88, 82, 69, 91, 76],
          backgroundColor: [
            "#4F46E5",
            "#0EA5E9",
            "#10B981",
            "#F59E0B",
            "#6366F1"
          ],
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20
          },
          grid: {
            color: "rgba(148, 163, 184, 0.35)"
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

