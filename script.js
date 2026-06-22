(function () {
  "use strict";

  /* ── Theme Manager ── */
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;
  const header = document.querySelector(".header");

  function getPreferredTheme() {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function setTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  setTheme(getPreferredTheme());

  themeToggle.addEventListener("click", function () {
    const current = html.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  });

  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", function (e) {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "light" : "dark");
      }
    });

  /* ── Scroll Header ── */
  let lastScroll = 0;
  function onScroll() {
    const y = window.scrollY;
    if (y > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    lastScroll = y;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── Mobile Nav Toggle ── */
  const navToggle = document.querySelector(".nav__toggle");
  const navList = document.querySelector(".nav__list");

  navToggle.addEventListener("click", function () {
    const expanded = this.getAttribute("aria-expanded") === "true" ? false : true;
    this.setAttribute("aria-expanded", expanded);
    this.classList.toggle("active");
    navList.classList.toggle("active");
  });

  document.querySelectorAll(".nav__link").forEach(function (link) {
    link.addEventListener("click", function () {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.classList.remove("active");
      navList.classList.remove("active");
    });
  });

  /* ── Scroll Reveal (IntersectionObserver) ── */
  function initReveal(selector) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    const obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach(function (el) {
      obs.observe(el);
    });
  }

  initReveal(".reveal");
  initReveal(".reveal-stagger");

  /* ── Animated Counters ── */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;

    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + "+";
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const statNumbers = document.querySelectorAll(".stat__number");

  const counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ── Contact Form ── */
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  function showFieldError(input, message) {
    const error = input.parentElement.querySelector(".form__error");
    input.classList.add("error");
    if (error) error.textContent = message;
  }

  function clearFieldError(input) {
    const error = input.parentElement.querySelector(".form__error");
    input.classList.remove("error");
    if (error) error.textContent = "";
  }

  function validateField(input) {
    const value = input.value.trim();

    if (input.required && !value) {
      showFieldError(input, "This field is required");
      return false;
    }

    if (input.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        showFieldError(input, "Please enter a valid email");
        return false;
      }
    }

    clearFieldError(input);
    return true;
  }

  form.querySelectorAll(".form__input").forEach(function (input) {
    input.addEventListener("blur", function () {
      validateField(this);
    });

    input.addEventListener("input", function () {
      if (this.classList.contains("error")) {
        validateField(this);
      }
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let valid = true;
    const inputs = form.querySelectorAll(".form__input");

    inputs.forEach(function (input) {
      if (!validateField(input)) valid = false;
    });

    if (!valid) return;

    formStatus.textContent = "Thank you! Your message has been sent.";
    formStatus.className = "form__status success";
    form.reset();

    setTimeout(function () {
      formStatus.textContent = "";
      formStatus.className = "form__status";
    }, 5000);
  });

  /* ── Fact Card Flip ── */
  document.querySelectorAll(".fact-card").forEach(function (card) {
    card.addEventListener("click", function () {
      this.classList.toggle("flipped");
    });

    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.classList.toggle("flipped");
      }
    });
  });

  /* ── Dev or Dud? Game ── */
  const gameTerms = [
    { term: "Babel", answer: "real", hint: "JavaScript compiler for backwards-compatible code." },
    { term: "Webpack", answer: "real", hint: "Static module bundler for JavaScript applications." },
    { term: "GraphQL", answer: "real", hint: "Query language for APIs developed by Meta." },
    { term: "Sass", answer: "real", hint: "CSS preprocessor with variables and nesting." },
    { term: "Docker", answer: "real", hint: "Containerization platform for application deployment." },
    { term: "Kubernetes", answer: "real", hint: "Container orchestration system (often called K8s)." },
    { term: "QueryLoom", answer: "dud", hint: "Sounds plausible but completely made up!" },
    { term: "FlexGrid", answer: "dud", hint: "Nope — CSS Grid and Flexbox are real, but this isn't." },
    { term: "TypeScript", answer: "real", hint: "Superset of JavaScript with static typing." },
    { term: "Tailwind", answer: "real", hint: "Utility-first CSS framework." },
    { term: "ScriptSync", answer: "dud", hint: "Nice try — this sounds real but doesn't exist!" },
    { term: "Zustand", answer: "real", hint: "Small, fast state management library for React." },
    { term: "Rust", answer: "real", hint: "Systems programming language focused on safety." },
    { term: "DataMesh", answer: "dud", hint: "Made up! (Though 'data mesh' is a real architectural concept.)" },
    { term: "WebForge", answer: "dud", hint: "This one's fictional — no such framework exists!" },
    { term: "Prisma", answer: "real", hint: "Next-generation ORM for Node.js and TypeScript." },
    { term: "StylusX", answer: "dud", hint: "Completely fabricated! Stylus is real though." },
    { term: "Vite", answer: "real", hint: "Next-generation frontend build tool." },
    { term: "RouteCraft", answer: "dud", hint: "Made up — sounds like a routing library but isn't real." },
    { term: "Astro", answer: "real", hint: "Web framework for content-focused websites." }
  ];

  const game = document.getElementById("devGame");
  if (game) {
    const scoreEl = document.getElementById("gameScore");
    const roundEl = document.getElementById("gameRound");
    const totalEl = document.getElementById("gameTotal");
    const termEl = document.getElementById("gameTerm");
    const feedbackEl = document.getElementById("gameFeedback");
    const resultsEl = document.getElementById("gameResults");
    const resultsTitle = document.getElementById("resultsTitle");
    const resultsText = document.getElementById("resultsText");
    const restartBtn = document.getElementById("gameRestart");
    const realBtn = document.querySelector(".game__btn--real");
    const dudBtn = document.querySelector(".game__btn--dud");

    let currentRound = 0;
    let score = 0;
    let shuffledTerms = [];
    let answered = false;

    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function startGame() {
      currentRound = 0;
      score = 0;
      answered = false;
      shuffledTerms = shuffle([].concat(gameTerms)).slice(0, 8);
      totalEl.textContent = shuffledTerms.length;
      resultsEl.classList.remove("show");
      resultsEl.style.display = "none";
      realBtn.disabled = false;
      dudBtn.disabled = false;
      realBtn.classList.remove("correct", "wrong");
      dudBtn.classList.remove("correct", "wrong");
      feedbackEl.textContent = "";
      feedbackEl.className = "game__feedback";
      updateScore();
      showTerm();
    }

    function showTerm() {
      if (currentRound >= shuffledTerms.length) {
        endGame();
        return;
      }
      answered = false;
      const t = shuffledTerms[currentRound];
      termEl.textContent = t.term;
      termEl.classList.remove("pop-in");
      void termEl.offsetWidth;
      termEl.classList.add("pop-in");
      roundEl.textContent = currentRound + 1;
      realBtn.disabled = false;
      dudBtn.disabled = false;
      realBtn.classList.remove("correct", "wrong");
      dudBtn.classList.remove("correct", "wrong");
      feedbackEl.textContent = "";
      feedbackEl.className = "game__feedback";
    }

    function handleGuess(guess) {
      if (answered) return;
      if (currentRound >= shuffledTerms.length) return;

      answered = true;
      const t = shuffledTerms[currentRound];
      const correct = guess === t.answer;
      const btn = guess === "real" ? realBtn : dudBtn;
      const otherBtn = guess === "real" ? dudBtn : realBtn;

      otherBtn.disabled = true;

      if (correct) {
        score++;
        btn.classList.add("correct");
        feedbackEl.textContent = "✓ Correct! " + t.hint;
        feedbackEl.className = "game__feedback correct";
      } else {
        btn.classList.add("wrong");
        feedbackEl.textContent = "✗ Nope! It was " + (t.answer === "real" ? "real" : "a dud") + ". " + t.hint;
        feedbackEl.className = "game__feedback wrong";
        otherBtn.classList.add(t.answer === "real" ? "correct" : "wrong");
      }

      updateScore();

      setTimeout(function () {
        currentRound++;
        showTerm();
      }, 2000);
    }

    function updateScore() {
      scoreEl.textContent = score;
      if (score > 0) {
        scoreEl.classList.remove("score-pulse");
        void scoreEl.offsetWidth; // trigger reflow
        scoreEl.classList.add("score-pulse");
      }
    }

    function endGame() {
      realBtn.disabled = true;
      dudBtn.disabled = true;
      resultsEl.style.display = "block";

      setTimeout(function () {
        resultsEl.classList.add("show");
        const pct = Math.round((score / shuffledTerms.length) * 100);
        const icon = resultsEl.querySelector(".game__results-icon");

        if (pct === 100) {
          icon.textContent = "🏆";
          resultsTitle.textContent = "Perfect Score!";
          resultsText.textContent = "You're a true dev legend. Nothing gets past you!";
        } else if (pct >= 75) {
          icon.textContent = "👏";
          resultsTitle.textContent = "Great Job!";
          resultsText.textContent = "You really know your tech. Senior dev material!";
        } else if (pct >= 50) {
          icon.textContent = "😄";
          resultsTitle.textContent = "Not Bad!";
          resultsText.textContent = "You've got solid intuition. A few more years of experience and you'll be unstoppable.";
        } else if (pct >= 25) {
          icon.textContent = "🤔";
          resultsTitle.textContent = "Keep Learning!";
          resultsText.textContent = "Some of those were tricky! Time to brush up on your dev trivia.";
        } else {
          icon.textContent = "😅";
          resultsTitle.textContent = "Oof!";
          resultsText.textContent = "Hey, we all start somewhere. Want to give it another shot?";
        }
      }, 500);
    }

    realBtn.addEventListener("click", function () { handleGuess("real"); });
    dudBtn.addEventListener("click", function () { handleGuess("dud"); });
    restartBtn.addEventListener("click", startGame);

    startGame();
  }

  /* ── Dev Quote Generator ── */
  const quotes = [
    { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
    { text: "First solve the problem, then write the code.", author: "John Johnson" },
    { text: "It's not a bug — it's an undocumented feature.", author: "Anonymous" },
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
    { text: "Programming isn't about what you know; it's about what you can figure out.", author: "Chris Pine" },
    { text: "The best way to get a project done faster is to start sooner.", author: "Anonymous" },
    { text: "Software is a great combination between artistry and engineering.", author: "Bill Gates" },
    { text: "The most dangerous phrase in the language is: 'We've always done it this way.'", author: "Grace Hopper" },
    { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
    { text: "Debugging is twice as hard as writing the code in the first place.", author: "Brian Kernighan" },
    { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" }
  ];

  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");
  const quoteShuffle = document.getElementById("quoteShuffle");

  if (quoteText && quoteShuffle) {
    let currentQuoteIdx = -1;

    function showRandomQuote() {
      let idx;
      do {
        idx = Math.floor(Math.random() * quotes.length);
      } while (idx === currentQuoteIdx && quotes.length > 1);
      currentQuoteIdx = idx;
      const q = quotes[idx];
      quoteText.textContent = "\u201C" + q.text + "\u201D";
      quoteAuthor.textContent = "\u2014 " + q.author;
    }

    showRandomQuote();
    quoteShuffle.addEventListener("click", showRandomQuote);
  }

  /* ── Particle Network Background ── */
  var particleCanvas = document.getElementById("particleCanvas");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var particleColor = "59, 130, 246";

  function updateParticleColor() {
    particleColor = html.getAttribute("data-theme") === "dark" ? "59, 130, 246" : "37, 99, 235";
  }
  updateParticleColor();

  if (particleCanvas && !prefersReducedMotion) {
    var pCtx = particleCanvas.getContext("2d");
    var particles = [];
    var pMouse = { x: null, y: null, radius: 160 };
    var pAnimId = null;

    // Fixed node limit to prevent lag
    function pResize() {
      particleCanvas.width = window.innerWidth;
      particleCanvas.height = window.innerHeight;
    }

    function pInit(count) {
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * particleCanvas.width,
          y: Math.random() * particleCanvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2 + 0.8
        });
      }
    }

    function pAnimate() {
      pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > particleCanvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > particleCanvas.height) p.vy *= -1;

        var dotBright = 1;
        if (pMouse.x !== null) {
          var dx = pMouse.x - p.x;
          var dy = pMouse.y - p.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < pMouse.radius) {
            var force = (pMouse.radius - dist) / pMouse.radius;
            p.x -= (dx / dist) * force * 1.2;
            p.y -= (dy / dist) * force * 1.2;
            dotBright = 1 + (1 - dist / pMouse.radius) * 1.5;
          }
        }

        // Render actual dot node for particle
        pCtx.fillStyle = "rgba(" + particleColor + ", " + (0.2 * dotBright) + ")";
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        pCtx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var cx = p.x - q.x;
          var cy = p.y - q.y;
          var cd = Math.sqrt(cx * cx + cy * cy);
          var maxD = 130;

          if (cd < maxD) {
            var alpha = (1 - cd / maxD) * 0.2;
            var bright = 1;

            if (pMouse.x !== null) {
              var mx = (p.x + q.x) / 2;
              var my = (p.y + q.y) / 2;
              var mdx = pMouse.x - mx;
              var mdy = pMouse.y - my;
              var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
              if (mdist < pMouse.radius) {
                bright = 1 + (1 - mdist / pMouse.radius) * 2;
              }
            }

            pCtx.strokeStyle = "rgba(" + particleColor + ", " + (alpha * bright) + ")";
            pCtx.lineWidth = 0.7;
            pCtx.beginPath();
            pCtx.moveTo(p.x, p.y);
            pCtx.lineTo(q.x, q.y);
            pCtx.stroke();
          }
        }
      }

      pAnimId = requestAnimationFrame(pAnimate);
    }

    pResize();
    pInit(Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 12000)));

    window.addEventListener("resize", function () {
      pResize();
      pInit(Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 12000)));
    });

    document.addEventListener("mousemove", function (e) {
      pMouse.x = e.clientX;
      pMouse.y = e.clientY;
    });

    document.addEventListener("mouseleave", function () {
      pMouse.x = null;
      pMouse.y = null;
    });

    pAnimate();

    themeToggle.addEventListener("click", function () {
      setTimeout(updateParticleColor, 50);
    });
  }

  /* ── Progress Bar ── */
  var progressBar = document.getElementById("progressBar");
  if (progressBar) {
    window.addEventListener("scroll", function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = "scaleX(" + (docHeight > 0 ? scrollTop / docHeight : 0) + ")";
    });
  }

  /* ── Global Mouse Tracking (Glow Grid & Lerped Follower) ── */
  var bgMouse = { x: -999, y: -999 };
  var bgMouseLerp = { x: -999, y: -999 };
  var hasMovedMouse = false;

  if (!prefersReducedMotion) {
    document.addEventListener("mousemove", function (e) {
      bgMouse.x = e.clientX;
      bgMouse.y = e.clientY;
      if (!hasMovedMouse) {
        bgMouseLerp.x = bgMouse.x;
        bgMouseLerp.y = bgMouse.y;
        hasMovedMouse = true;
      }
      document.documentElement.style.setProperty("--bg-mouse-x", bgMouse.x + "px");
      document.documentElement.style.setProperty("--bg-mouse-y", bgMouse.y + "px");
    });

    function animateMouseGlow() {
      if (hasMovedMouse) {
        bgMouseLerp.x += (bgMouse.x - bgMouseLerp.x) * 0.08;
        bgMouseLerp.y += (bgMouse.y - bgMouseLerp.y) * 0.08;
        document.documentElement.style.setProperty("--bg-mouse-x-lerp", bgMouseLerp.x + "px");
        document.documentElement.style.setProperty("--bg-mouse-y-lerp", bgMouseLerp.y + "px");
      }
      requestAnimationFrame(animateMouseGlow);
    }
    animateMouseGlow();
  }

  /* ── 3D Hero Scene Parallax Tilt ── */
  var heroScene = document.getElementById("heroScene");
  var hero = document.getElementById("hero");
  if (heroScene && hero && !prefersReducedMotion) {
    hero.addEventListener("mousemove", function (e) {
      var rect = heroScene.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;

      var nx = dx / (window.innerWidth / 2);
      var ny = dy / (window.innerHeight / 2);

      var rx = -ny * 12;
      var ry = nx * 12;
      var px = nx * 15;
      var py = ny * 15;

      heroScene.style.setProperty("--hero-rotate-x", rx + "deg");
      heroScene.style.setProperty("--hero-rotate-y", ry + "deg");
      heroScene.style.setProperty("--hero-offset-x", px + "px");
      heroScene.style.setProperty("--hero-offset-y", py + "px");
    });

    hero.addEventListener("mouseleave", function () {
      heroScene.style.setProperty("--hero-rotate-x", "0deg");
      heroScene.style.setProperty("--hero-rotate-y", "0deg");
      heroScene.style.setProperty("--hero-offset-x", "0px");
      heroScene.style.setProperty("--hero-offset-y", "0px");
    });
  }

  /* ── 3D Card Tilt & Mouse Spotlight ── */
  function initCardTilt() {
    var tiltCards = document.querySelectorAll(".project-card, .skill-category");
    var len = tiltCards.length;

    for (var i = 0; i < len; i++) {
      var card = tiltCards[i];
      card.classList.add("tilt-card");

      (function (el) {
        el.addEventListener("mousemove", function (e) {
          var rect = el.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var y = e.clientY - rect.top;

          // Set custom CSS coordinates for spotlight border radial-gradient
          el.style.setProperty("--mouse-x", x + "px");
          el.style.setProperty("--mouse-y", y + "px");

          var cx = rect.width / 2;
          var cy = rect.height / 2;
          var rx = ((y - cy) / cy) * -8;
          var ry = ((x - cx) / cx) * 8;
          el.style.transform = "perspective(1000px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
        });

        el.addEventListener("mouseleave", function () {
          el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
          el.style.setProperty("--mouse-x", "-999px");
          el.style.setProperty("--mouse-y", "-999px");
        });
      })(card);
    }
  }
  initCardTilt();

  /* ── Magnetic Button Glow ── */
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("mousemove", function (e) {
      var rect = this.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      this.style.setProperty("--mx", x + "%");
      this.style.setProperty("--my", y + "%");
    });
  });

  /* ── Typewriter Animation ── */
  var typewriterEl = document.getElementById("typewriter");
  if (typewriterEl) {
    var codeLines = [
      "function buildApp() {",
      "  const idea = \"your vision\";",
      "  const stack = [\"React\", \"Node\", \"Postgres\"];",
      "  return stack",
      "    .reduce(build, idea)",
      "    .then(deploy);",
      "}"
    ];
    var codeText = codeLines.join("\n");
    var twIndex = 0;
    var twTyping = false;
    var twTimeout = null;

    function highlightSyntax(str) {
      var h = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      h = h.replace(/"([^"]*)"/g, '<span class="code-string">"$1"</span>');
      h = h.replace(/\b(function|const|return|let|var|if|else|for|while|class|import|export|from|async|await|new|this|throw|try|catch)\b/g, '<span class="code-keyword">$1</span>');
      h = h.replace(/\b([a-zA-Z_$][\w$]*)\s*\(/g, '<span class="code-func">$1</span>(');
      return h;
    }

    function twDelete() {
      if (twIndex <= 0) {
        twTyping = false;
        setTimeout(twStart, 1000);
        return;
      }
      twTyping = true;
      typewriterEl.innerHTML = highlightSyntax(codeText.slice(0, twIndex - 1));
      twIndex--;
      twTimeout = setTimeout(twDelete, 15);
    }

    function twType() {
      if (twIndex >= codeText.length) {
        twTyping = false;
        typewriterEl.classList.add("done");
        codeWindow.classList.remove("typing-active");
        twTimeout = setTimeout(twDelete, 6000);
        return;
      }
      twTyping = true;
      typewriterEl.innerHTML = highlightSyntax(codeText.slice(0, twIndex + 1));
      twIndex++;
      var char = codeText[twIndex - 1];
      var delay = char === "\n" ? 200 : char === " " ? 40 : 20 + Math.random() * 60;
      twTimeout = setTimeout(twType, delay);
    }

    function twStart() {
      if (twTyping) { clearTimeout(twTimeout); }
      twIndex = 0;
      typewriterEl.classList.remove("done");
      typewriterEl.innerHTML = "";
      codeWindow.classList.add("typing-active");
      setTimeout(twType, 400);
    }

    var codeWindow = typewriterEl.closest(".hero__code-window");
    if (codeWindow) {
      var twObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !twTyping && twIndex === 0) {
            twStart();
            twObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      twObs.observe(codeWindow);

      codeWindow.classList.add("click-hint");
      codeWindow.addEventListener("click", twStart);
    }
  }

  /* ── Smooth Scroll for older browsers ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });
})();
