document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     GLOBAL HELPER: MOUSE TRACKING & CUSTOM CURSOR
     ========================================================================== */
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');
  let isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (!isMobile && cursor && cursorDot) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
      cursor.style.opacity = '1';
      cursorDot.style.opacity = '1';
    });

    // Add scale effects on interactive elements
    const hoverables = document.querySelectorAll('a, button, .quest-card, .suggest-btn, input, textarea');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '35px';
        cursor.style.height = '35px';
        cursor.style.borderColor = 'var(--neon-purple)';
        cursor.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.borderColor = 'var(--neon-cyan)';
        cursor.style.backgroundColor = 'transparent';
      });
    });
  }

  // Handle window resizing for mobile check
  window.addEventListener('resize', () => {
    isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile && cursor && cursorDot) {
      cursor.style.opacity = '0';
      cursorDot.style.opacity = '0';
    }
  });

  /* ==========================================================================
     MOBILE NAVIGATION TOGGLE
     ========================================================================== */
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  /* ==========================================================================
     HEADER SCROLL CLASS
     ========================================================================== */
  const header = document.querySelector('.main-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  /* ==========================================================================
     SCROLL REVEAL ANIMATION
     ========================================================================== */
  // Create intersection observer for scroll reveals
  const revealElements = document.querySelectorAll('section, .glass-card:not(.chatbot-window):not(.level-up-card), .roadmap-item');
  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ==========================================================================
     PARTICLE VECTOR FLOWFIELD (CANVAS)
     ========================================================================== */
  const canvas = document.getElementById('flowfield-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let particles = [];
    const maxParticles = isMobile ? 35 : 75;
    
    // Mouse coords for flow repulsion
    let mouse = { x: null, y: null, radius: 150 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.3 + 0.1;
        this.color = Math.random() > 0.5 ? 'rgba(6, 182, 212, ' : 'rgba(99, 102, 241, ';
      }

      update() {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;

        // Bounce walls
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;

        // Mouse attraction/repulsion physics
        if (mouse.x !== null && mouse.y !== null) {
          let dx = this.x - mouse.x;
          let dy = this.y - mouse.y;
          let dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < mouse.radius) {
            let force = (mouse.radius - dist) / mouse.radius;
            // Push away gently
            this.x += (dx / dist) * force * 1.5;
            this.y += (dy / dist) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color + '1)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, W, H);
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 0.5;
      const gridSize = 100;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Draw and link particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Render links
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < 120) {
            let alpha = (1 - (dist / 120)) * 0.08;
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initParticles();
    });

    initParticles();
    animateParticles();
  }

  /* ==========================================================================
     IDENTITY CARD INTERACTION
     ========================================================================== */
  const identCard = document.getElementById('identity-card');
  if (identCard) {
    const glow = identCard.querySelector('.card-glow');
    identCard.addEventListener('mousemove', (e) => {
      const rect = identCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
    });
  }

  /* ==========================================================================
     RYZMAX LEVEL SIMULATOR (RPG MECHANICS)
     ========================================================================== */
  // RPG State Variables
  let rpgState = {
    level: 12,
    xp: 1850,
    maxXP: 3000,
    int: 82,
    fsd: 74,
    agi: 68,
    lc: 90
  };

  const levelText = document.getElementById('ryzmax-level');
  const xpText = document.getElementById('ryzmax-xp-text');
  const xpFill = document.getElementById('ryzmax-xp-fill');
  const questCards = document.querySelectorAll('.quest-card');
  const resetQuestsBtn = document.getElementById('reset-quests-btn');
  
  // Attribute DOM pointers
  const barInt = document.getElementById('attr-int');
  const barFsd = document.getElementById('attr-fsd');
  const barAgi = document.getElementById('attr-agi');
  const barLc = document.getElementById('attr-lc');
  
  const valInt = document.getElementById('attr-int-val');
  const valFsd = document.getElementById('attr-fsd-val');
  const valAgi = document.getElementById('attr-agi-val');
  const valLc = document.getElementById('attr-lc-val');

  // Level Up Modal DOM pointers
  const lvlUpModal = document.getElementById('level-up-modal');
  const lvlUpClose = document.getElementById('level-up-close');
  const modalLvlNum = document.getElementById('modal-level-num');
  
  const oldIntText = document.getElementById('old-int');
  const newIntText = document.getElementById('new-int');
  const oldFsdText = document.getElementById('old-fsd');
  const newFsdText = document.getElementById('new-fsd');
  const oldAgiText = document.getElementById('old-agi');
  const newAgiText = document.getElementById('new-agi');

  // Update RPG views
  function updateRPGViews() {
    if (levelText) levelText.innerText = rpgState.level;
    if (xpText) xpText.innerText = `${rpgState.xp} / ${rpgState.maxXP} XP`;
    if (xpFill) xpFill.style.width = `${(rpgState.xp / rpgState.maxXP) * 100}%`;
    
    // Stats
    if (barInt) barInt.style.width = `${Math.min(rpgState.int, 100)}%`;
    if (valInt) valInt.innerText = rpgState.int;
    
    if (barFsd) barFsd.style.width = `${Math.min(rpgState.fsd, 100)}%`;
    if (valFsd) valFsd.innerText = rpgState.fsd;
    
    if (barAgi) barAgi.style.width = `${Math.min(rpgState.agi, 100)}%`;
    if (valAgi) valAgi.innerText = rpgState.agi;
    
    if (barLc) barLc.style.width = `${Math.min(rpgState.lc, 100)}%`;
    if (valLc) valLc.innerText = rpgState.lc;
  }

  // Trigger level up modal
  function triggerLevelUp() {
    const oldInt = rpgState.int;
    const oldFsd = rpgState.fsd;
    const oldAgi = rpgState.agi;

    // Increment level & stats
    rpgState.level++;
    rpgState.xp -= rpgState.maxXP;
    rpgState.maxXP = Math.floor(rpgState.maxXP * 1.2); // Make next level harder
    
    rpgState.int += Math.floor(Math.random() * 3) + 2; // +2 to +4
    rpgState.fsd += Math.floor(Math.random() * 3) + 2;
    rpgState.agi += Math.floor(Math.random() * 3) + 2;
    rpgState.lc += 1; // Little boost

    // Populate modal comparison
    if (modalLvlNum) modalLvlNum.innerText = rpgState.level;
    if (oldIntText) oldIntText.innerText = oldInt;
    if (newIntText) newIntText.innerText = rpgState.int;
    if (oldFsdText) oldFsdText.innerText = oldFsd;
    if (newFsdText) newFsdText.innerText = rpgState.fsd;
    if (oldAgiText) oldAgiText.innerText = oldAgi;
    if (newAgiText) newAgiText.innerText = rpgState.agi;

    // Show modal
    setTimeout(() => {
      if (lvlUpModal) lvlUpModal.classList.add('active');
    }, 400);

    updateRPGViews();
  }

  // Bind quest cards
  questCards.forEach(card => {
    const btn = card.querySelector('.btn-quest-complete');
    
    const handler = (e) => {
      e.stopPropagation();
      if (card.classList.contains('completed')) return;

      // Add completed styles
      card.classList.add('completed');
      btn.innerText = "Completed";
      
      // Parse rewards
      const addXP = parseInt(card.dataset.xp);
      const statBonus = card.dataset.stat;

      // Update XP & attributes
      rpgState.xp += addXP;
      if (statBonus === 'int') rpgState.int += 2;
      else if (statBonus === 'fsd') rpgState.fsd += 3;
      else if (statBonus === 'agi') rpgState.agi += 4;

      // Check level up
      if (rpgState.xp >= rpgState.maxXP) {
        triggerLevelUp();
      } else {
        updateRPGViews();
      }
    };

    if (btn) btn.addEventListener('click', handler);
    card.addEventListener('click', handler);
  });

  // Level Up close
  if (lvlUpClose) {
    lvlUpClose.addEventListener('click', () => {
      lvlUpModal.classList.remove('active');
    });
  }

  // Reset quests button
  if (resetQuestsBtn) {
    resetQuestsBtn.addEventListener('click', () => {
      questCards.forEach(card => {
        card.classList.remove('completed');
        const btn = card.querySelector('.btn-quest-complete');
        if (btn) btn.innerText = "Complete";
      });
      // Reset RPG slightly to keep it playable
      rpgState.xp = 1850;
      rpgState.maxXP = 3000;
      rpgState.level = 12;
      rpgState.int = 82;
      rpgState.fsd = 74;
      rpgState.agi = 68;
      updateRPGViews();
    });
  }

  /* ==========================================================================
     INTERACTIVE SHELL CLI TERMINAL CONSOLE
     ========================================================================== */
  const termInput = document.getElementById('terminal-input');
  const termHistory = document.getElementById('terminal-history');
  const termBody = document.getElementById('terminal-body');
  let commandHistory = [];
  let historyIndex = -1;

  if (termInput && termHistory && termBody) {
    // Focus input on console body clicks
    termBody.addEventListener('click', () => {
      termInput.focus();
    });

    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = termInput.value.trim();
        if (cmd) {
          processCommand(cmd);
          commandHistory.push(cmd);
          historyIndex = commandHistory.length;
        }
        termInput.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          termInput.value = commandHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          termInput.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          termInput.value = '';
        }
      }
    });

    function processCommand(rawCmd) {
      const parts = rawCmd.split(' ');
      const cmd = parts[0].toLowerCase();
      
      // Output user command prompt to history
      const promptRow = document.createElement('div');
      promptRow.className = 'terminal-log-row';
      promptRow.innerHTML = `<span class="terminal-prompt">guest@tuhin-node:~$</span> <span class="terminal-log-cmd">${escapeHTML(rawCmd)}</span>`;
      termHistory.appendChild(promptRow);

      let outputHTML = '';
      switch (cmd) {
        case 'help':
          outputHTML = `Available commands:
  <span class="text-neon-cyan">about</span>       - Brief background about Tuhin Ghorui.
  <span class="text-neon-cyan">skills</span>      - Render full technical stacks capabilities.
  <span class="text-neon-cyan">projects</span>    - Audit key production builds.
  <span class="text-neon-cyan">ryzmax</span>      - Display current RPG level configurations.
  <span class="text-neon-cyan">contact</span>     - View contact connection endpoints.
  <span class="text-neon-cyan">clear</span>       - Clear the screen shell buffer.
  <span class="text-neon-cyan">social</span>      - Open GitHub repositories node.`;
          break;

        case 'about':
          outputHTML = `Tuhin Ghorui is a Computer Applications (BCA) student currently located in Goa, India.
His core development focus centers on building AI products, orchestrating agent context windows, and refining full-stack development nodes. 
He builds high-performance responsive web environments and is aiming to design a personalized agentic assistant from scratch.`;
          break;

        case 'skills':
          outputHTML = `TECHNICAL STACK AUDIT LOG [SUCCESS]:
  ==========================================
  COMFORT STACK  : [ HTML5, CSS3, ES6 JS, Python ]
  ACTIVE RESEACH : [ Node.js, Express.js, React, React Native, OpenAI API ]
  EXPLORATORY    : [ MongoDB, PostgreSQL, System Design, Figma ]
  ==========================================`;
          break;

        case 'projects':
          outputHTML = `1. <span class="text-neon-green">RyzMax (RyzMax-level-Up)</span> - Gamified self-improvement mobile app MVP. [STATUS: Active MVP / Expo]
2. <span class="text-neon-cyan">AI Push-Up Counter</span> - Browser-based webcam pose tracker using MediaPipe. [STATUS: Live Demo]
3. <span class="text-neon-purple">EduMentor AI</span> - Course mentorship platform with Hugging Face chatbot. [STATUS: Active Prototype]
4. <span class="text-neon-green">Notes Sharing System</span> - Full-stack document CRUD sharing system. [STATUS: PHP + MySQL]`;
          break;

        case 'ryzmax':
          outputHTML = `RYZMAX RPG CORE CONFIGURATIONS:
  ==========================================
  PLAYER CLASS   : AI Specialist Node
  LEVEL STATUS   : Level ${rpgState.level}
  EXPERIENCE     : ${rpgState.xp} / ${rpgState.maxXP} XP
  STATS VALUES   : INT [${rpgState.int}], FSD [${rpgState.fsd}], AGI [${rpgState.agi}], LC [${rpgState.lc}]
  ==========================================`;
          break;

        case 'contact':
          outputHTML = `CONNECTION METRIC ENDPOINTS:
  ==========================================
  EMAIL ACCESS   : tuhinghorui553@gmail.com
  GITHUB ACCESS  : github.com/tuhin-ghorui
  LOCATION NODE  : Goa, India [GMT +5:30]
  ==========================================`;
          break;

        case 'clear':
          termHistory.innerHTML = '';
          return;

        case 'social':
          outputHTML = `Launching connection route to github.com/tuhin-ghorui...`;
          window.open('https://github.com/tuhin-ghorui', '_blank');
          break;

        default:
          outputHTML = `<span class="text-neon-red">Command not recognized: "${escapeHTML(cmd)}". Type 'help' to verify endpoints.</span>`;
      }

      // Output reply to terminal
      const replyRow = document.createElement('div');
      replyRow.className = 'terminal-log-row';
      replyRow.innerHTML = `<div class="terminal-log-output">${outputHTML}</div>`;
      termHistory.appendChild(replyRow);

      // Auto scroll terminal to bottom
      termBody.scrollTop = termBody.scrollHeight;
    }

    function escapeHTML(str) {
      return str.replace(/[&<>'"]/g, 
        tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag] || tag)
      );
    }
  }

  /* ==========================================================================
     FLOATING AI ASSISTANT CHATBOT
     ========================================================================== */
  const chatWrapper = document.getElementById('chatbot-wrapper');
  const chatTrigger = document.getElementById('chatbot-trigger');
  const chatClose = document.getElementById('chatbot-close-btn');
  const chatMessages = document.getElementById('chatbot-messages');
  const chatInput = document.getElementById('chatbot-input');
  const chatSend = document.getElementById('chatbot-send');
  const suggestButtons = document.querySelectorAll('.suggest-btn');

  // Seeded responses database
  const chatbotBrain = {
    whois: "Tuhin Ghorui is a BCA student & computer science builder currently working from Goa, India. His key projects include the RyzMax self-improvement mobile app (Expo React Native/TypeScript), an AI Push-Up Counter (MediaPipe webcam pose tracking), EduMentor AI (Hugging Face tutoring website), and a student Notes Sharing System (PHP/MySQL). He is dedicated to building intelligent systems and shipping products in public.",
    ryzmax: "RyzMax is Tuhin's central project. It is a gamified self-improvement mobile app (with the active MVP built in Expo React Native & TypeScript). It gamifies daily habit tracking with XP rewards, customizable missions, streaks, achievements, and an AI coaching concept.",
    stack: "Tuhin's core capability matrix spans JavaScript (ES6), HTML5, CSS3, PHP, MySQL, and Python. His frameworks and libraries of choice include React, React Native, Expo, MediaPipe computer vision APIs, and Hugging Face inference APIs.",
    contact: "You can reach Tuhin directly via email at <span class='text-neon-cyan'>tuhinghorui553@gmail.com</span>, or audit his daily contributions on GitHub at <span class='text-neon-cyan'>github.com/tuhin-ghorui</span>.",
    hire: "Tuhin is currently looking for technical internships, collaborations, or developer roles focusing on full-stack building and AI product design. Feel free to contact him via email or dispatch a form message!",
    default: "I didn't quite parse that request. Try selecting one of the prompt chips below, or ask directly about: Tuhin, RyzMax, his technical Stack, or Connection metrics."
  };

  if (chatWrapper && chatTrigger && chatClose && chatMessages && chatInput && chatSend) {
    
    // Toggle chat widget
    chatTrigger.addEventListener('click', () => {
      chatWrapper.classList.toggle('active');
      if (chatWrapper.classList.contains('active')) {
        chatInput.focus();
      }
    });

    chatClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      chatWrapper.classList.remove('active');
    });

    // Send click
    chatSend.addEventListener('click', () => {
      handleUserChatSubmit();
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleUserChatSubmit();
      }
    });

    // Suggestion chips
    suggestButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.dataset.question;
        addUserMessage(question);
        respondToUser(question);
      });
    });

    function handleUserChatSubmit() {
      const msg = chatInput.value.trim();
      if (!msg) return;

      addUserMessage(msg);
      chatInput.value = '';
      
      // AI Processing Delay
      setTimeout(() => {
        respondToUser(msg);
      }, 500);
    }

    function addUserMessage(text) {
      const row = document.createElement('div');
      row.className = 'chat-message user';
      row.innerHTML = `<div class="message-content"><p>${escapeText(text)}</p></div>`;
      chatMessages.appendChild(row);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function respondToUser(userMsg) {
      const cleanMsg = userMsg.toLowerCase();
      let replyText = chatbotBrain.default;

      if (cleanMsg.includes('who') || cleanMsg.includes('tuhin') || cleanMsg.includes('bio') || cleanMsg.includes('about')) {
        replyText = chatbotBrain.whois;
      } else if (cleanMsg.includes('ryzmax') || cleanMsg.includes('level') || cleanMsg.includes('quest') || cleanMsg.includes('game')) {
        replyText = chatbotBrain.ryzmax;
      } else if (cleanMsg.includes('stack') || cleanMsg.includes('skill') || cleanMsg.includes('languages') || cleanMsg.includes('framework')) {
        replyText = chatbotBrain.stack;
      } else if (cleanMsg.includes('contact') || cleanMsg.includes('email') || cleanMsg.includes('github') || cleanMsg.includes('mail')) {
        replyText = chatbotBrain.contact;
      } else if (cleanMsg.includes('hire') || cleanMsg.includes('work') || cleanMsg.includes('intern') || cleanMsg.includes('job')) {
        replyText = chatbotBrain.hire;
      }

      // Add loading typing container
      const botRow = document.createElement('div');
      botRow.className = 'chat-message bot';
      botRow.innerHTML = `<div class="message-content"><p class="typing-placeholder">Typing...</p></div>`;
      chatMessages.appendChild(botRow);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Simulating streamed word-by-word typing response
      const containerP = botRow.querySelector('.message-content p');
      containerP.innerHTML = '';
      containerP.classList.remove('typing-placeholder');
      
      const words = replyText.split(' ');
      let currentWordIndex = 0;

      function typeWord() {
        if (currentWordIndex < words.length) {
          containerP.innerHTML += words[currentWordIndex] + ' ';
          currentWordIndex++;
          chatMessages.scrollTop = chatMessages.scrollHeight;
          setTimeout(typeWord, 35); // Fast typing pace
        }
      }

      // Start typing simulation after slight placeholder delay
      setTimeout(() => {
        typeWord();
      }, 300);
    }

    function escapeText(str) {
      return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag));
    }
  }

  /* ==========================================================================
     CONTACT FORM COMPONENT
     ========================================================================== */
  const contactForm = document.getElementById('portfolio-contact-form');
  const successOverlay = document.getElementById('form-success-overlay');
  const successClose = document.getElementById('form-success-close');

  if (contactForm && successOverlay) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simulate form submission to backend node
      const submitBtn = document.getElementById('form-submit-btn');
      const submitText = submitBtn.querySelector('span');
      
      submitBtn.style.pointerEvents = 'none';
      submitText.innerText = "CONNECTING NODE...";
      
      setTimeout(() => {
        // Success response simulation
        successOverlay.classList.add('active');
        submitBtn.style.pointerEvents = 'auto';
        submitText.innerText = "DISPATCH TRANSMISSION";
        contactForm.reset();
      }, 1200);
    });

    if (successClose) {
      successClose.addEventListener('click', () => {
        successOverlay.classList.remove('active');
      });
    }
  }

  /* ==========================================================================
     3D TILT EFFECT FOR PROJECTS GRID
     ========================================================================== */
  const projectCards = document.querySelectorAll('.project-card');
  if (!isMobile) {
    projectCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate tilt
        const dx = x - (rect.width / 2);
        const dy = y - (rect.height / 2);
        const tiltX = (dy / (rect.height / 2)) * -5; // tilt max 5deg
        const tiltY = (dx / (rect.width / 2)) * 5;
        
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
        card.style.boxShadow = `0 15px 35px rgba(6, 182, 212, 0.15)`;
        card.style.borderColor = 'rgba(6, 182, 212, 0.25)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        card.style.boxShadow = 'none';
        card.style.borderColor = 'var(--glass-border)';
      });
    });
  }

});
