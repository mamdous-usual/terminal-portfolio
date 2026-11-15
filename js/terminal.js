/* Terminal in the hero section.
   Add a command by adding an entry to `commands`.
   `help` makes it show up in help / tab-complete; leave it out to hide it. */

(() => {

const output  = document.getElementById('term-output');
const input   = document.getElementById('term-input');
const body    = document.getElementById('term-body');
const suggest = document.getElementById('suggest');

const ps      = 'visitor@localhost:~$';
const startedAt = Date.now();
const past = [];
let pastPos = 0;
let suggestPos = -1;
let game = { active: false, target: 0, tries: 0 };


/* ---------- helpers ---------- */

const esc  = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tag  = (cls, text) => `<span class="${cls}">${text}</span>`;
const link = (url, text) => `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
const pick = list => list[Math.floor(Math.random() * list.length)];

// "label   value" lines become two-column rows so wrapped text keeps its
// alignment on narrow screens instead of running back under the label.
const ROW = /^(\s*)(<span class="info">([^<]{1,40})<\/span>)(\s+)(?!$)(.+)$/;
function rowify(html) {
  const lines = html.split('\n');
  let out = '';
  lines.forEach((line, i) => {
    const m = ROW.exec(line);
    if (m && /^[^<]*[:>]?$/.test(m[3]) && (m[3].trim().endsWith(':') || m[5].startsWith('—'))) {
      const width = m[1].length + m[3].length + m[4].length;
      out += `<span class="row" style="--kw:${width}ch">` +
             `<span class="k">${m[1]}${m[2]}${m[4]}</span><span class="v">${m[5]}</span></span>`;
    } else {
      out += line + (i < lines.length - 1 ? '\n' : '');
    }
  });
  return out;
}

function print(html, cls = '') {
  const el = document.createElement('pre');
  el.className = cls;
  el.innerHTML = rowify(html);
  output.appendChild(el);
}

function scrollDown() {
  body.scrollTop = body.scrollHeight;
}

function uptime() {
  const secs = Math.floor((Date.now() - startedAt) / 1000);
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}


/* ---------- guessing game ---------- */

function guess(n) {
  game.tries++;
  if (n === game.target) {
    game.active = false;
    return tag('ok', `🎯 Correct! The number was ${n}. You got it in ${game.tries} ${game.tries === 1 ? 'try' : 'tries'}.`);
  }
  const hint = n < game.target ? 'Higher ↑' : 'Lower ↓';
  return `${tag('info', hint)}  ${tag('warn', `(try ${game.tries}, type 'quit' to give up)`)}`;
}


/* ---------- commands ---------- */

const files = {
  'about.txt':   () => commands.about.run(),
  'skills.txt':  () => commands.skills.run(),
  'contact.txt': () => commands.contact.run(),
  'resume.pdf':  () => commands.resume.run()
};

const commands = {
  help: {
    help: 'Show available commands',
    run: () => {
      const rows = Object.entries(commands)
        .filter(([name, c]) => c.help && name !== 'help')
        .map(([name, c]) => tag('info', '  ' + esc((c.usage || name).padEnd(15))) + '— ' + c.help);
      return `${tag('ok', 'Available commands:')}\n${rows.join('\n')}\n${tag('warn', '  (There are a few more easter eggs hidden in here too)')}`;
    }
  },

  about: {
    help: 'who I am',
    run: () => `${tag('ok', 'Mamdous Laskar')}
BCA Student · Karimganj College, Assam University
2nd year · Expected graduation: 2028

I'm learning by building. Most of what I know comes from
creating real projects, reading docs, and breaking things.
Interested in web dev, clean UI, and practical software.

${tag('info', 'Open to:')} internships, projects, collaborations`
  },

  skills: {
    help: 'tech stack',
    run: () => `${tag('ok', 'Tech skills')}
${tag('info', 'Languages:')}  JavaScript · Java · Python · C/C++
${tag('info', 'Frontend:')}   HTML · CSS · React
${tag('info', 'Backend:')}    Node.js · Express · Spring Boot
${tag('info', 'Databases:')}  MySQL · MongoDB · PostgreSQL
${tag('info', 'Tools:')}      Git · Docker · Linux · VS Code
${tag('warn', 'Learning:')}   DSA · System Design`
  },

  projects: {
    help: "what I've built",
    run: () => `${tag('ok', 'Projects (4)')}

${tag('info', '01. Paper-Notebook')}
    Minimal notebook + whiteboard app. 5 paper types, pen/eraser/text
    tools, multi-page sidebar, PNG export, autosave. React + Vite.
    ${link('https://papernotebook.vercel.app', '↗ papernotebook.vercel.app')}

${tag('info', '02. Speedometer PWA')}
    GPS-based speed app. Works offline, installable.
    ${link('https://speedometerweb.vercel.app', '↗ speedometerweb.vercel.app')}

${tag('info', '03. Productivity Core')}
    Tasks + Pomodoro + focus tools. No login needed.
    ${link('https://productivitycore.vercel.app', '↗ productivitycore.vercel.app')}

${tag('info', '04. Terminal Audio Player')}
    Rust music player w/ real-time spectrum visualizer.
    ${link('https://github.com/mamdous-usual/terminal-audio-player', '↗ github.com/mamdous-usual/terminal-audio-player')}`
  },

  contact: {
    help: 'how to reach me',
    run: () => `${tag('ok', 'Contact')}
${tag('info', 'Email:')}    <a href="mailto:mamdouslaskar@protonmail.com">mamdouslaskar@protonmail.com</a>
${tag('info', 'LinkedIn:')} ${link('https://linkedin.com/in/mamdousahmedlaskar', 'linkedin.com/in/mamdousahmedlaskar')}
${tag('info', 'GitHub:')}   ${link('https://github.com/mamdous-usual', 'github.com/mamdous-usual')}`
  },

  resume: {
    help: 'get my CV',
    run: () => {
      location.href = 'mailto:mamdouslaskar@protonmail.com?subject=Resume%20Request&body=Hi%20Mamdous%2C%0A%0AI%27d%20like%20a%20copy%20of%20your%20resume.%0A%0AThanks!';
      return `${tag('ok', 'Opening your email client...')}
If it didn't open, email me at:
<a href="mailto:mamdouslaskar@protonmail.com">mamdouslaskar@protonmail.com</a>
Subject: Resume Request`;
    }
  },

  social: {
    help: 'social links',
    run: () => `${tag('ok', 'Social')}
${link('https://github.com/mamdous-usual', '    GitHub   →  github.com/mamdous-usual')}
${link('https://linkedin.com/in/mamdousahmedlaskar', '    LinkedIn →  linkedin.com/in/mamdousahmedlaskar')}
${link('https://x.com/mamdouslaskar', '    Twitter  →  x.com/mamdouslaskar')}`
  },

  neofetch: {
    help: 'system info, dev edition',
    run: () => `${tag('ok', 'visitor@mamdous.me')}
-------------------
${tag('info', 'OS:')}      PortfolioOS (Terminal Edition)
${tag('info', 'Host:')}    mamdous.me
${tag('info', 'Shell:')}   visitor-sh 1.0
${tag('info', 'Uptime:')}  ${uptime()}
${tag('info', 'Stack:')}   JS · Java · Python · C/C++`
  },

  cat: {
    help: 'read a file (try: ls)',
    usage: 'cat <file>',
    run: args => {
      const name = (args[0] || '').toLowerCase();
      if (!name) return tag('warn', 'Usage: cat &lt;file&gt;  (try: ls)');
      if (name === 'projects' || name === 'projects/') return tag('err', 'cat: projects/: Is a directory');
      if (files[name]) return files[name]();
      return tag('err', `cat: ${esc(name)}: No such file or directory`);
    }
  },

  echo: {
    help: 'repeat text back',
    usage: 'echo <text>',
    run: args => args.length ? esc(args.join(' ')) : tag('warn', 'Usage: echo &lt;text&gt;')
  },

  man: {
    help: 'manual page for a command',
    usage: 'man <command>',
    run: args => {
      const name = (args[0] || '').toLowerCase();
      if (!name) return tag('warn', 'Usage: man &lt;command&gt;');
      if (!commands[name]) return tag('err', `No manual entry for ${esc(name)}`);
      const text = commands[name].help || 'No description available. Try running it and see what happens.';
      return `${tag('ok', esc(name.toUpperCase()) + '(1)')}\n${esc(text)}`;
    }
  },

  history: {
    help: 'show command history',
    run: () => past.length
      ? past.map((c, i) => `${tag('info', i + 1)}  ${esc(c)}`).join('\n')
      : tag('warn', 'No history yet.')
  },

  banner: {
    help: 'ASCII banner',
    run: () => tag('ok', `+-------------------------------+
|        MAMDOUS LASKAR          |
|   &lt; building stuff daily &gt;     |
+-------------------------------+`)
  },

  uptime: {
    help: 'session uptime',
    run: () => `${tag('info', 'Session uptime:')} ${uptime()}`
  },

  joke: {
    help: 'random programming joke',
    run: () => tag('ok', pick([
      'Why do programmers prefer dark mode? Because light attracts bugs.',
      'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?"',
      "There are 10 types of people: those who understand binary and those who don't.",
      'I would tell you a UDP joke, but you might not get it.',
      "Why do Java developers wear glasses? Because they don't C#.",
      '99 little bugs in the code. Take one down, patch it around — 127 little bugs in the code.'
    ]))
  },

  quote: {
    help: 'random dev quote',
    run: () => tag('info', pick([
      '"Talk is cheap. Show me the code." — Linus Torvalds',
      '"Simplicity is the soul of efficiency." — Austin Freeman',
      '"First, solve the problem. Then, write the code." — John Johnson',
      '"Make it work, make it right, make it fast." — Kent Beck',
      '"The best error message is the one that never shows up." — Thomas Fuchs'
    ]))
  },

  rps: {
    help: 'rock, paper, scissors',
    usage: 'rps <choice>',
    run: args => {
      const moves = ['rock', 'paper', 'scissors'];
      const you = (args[0] || '').toLowerCase();
      if (!moves.includes(you)) return tag('warn', 'Usage: rps &lt;rock|paper|scissors&gt;');

      const me = pick(moves);
      const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
      const result = you === me ? tag('warn', 'Tie!')
        : beats[you] === me ? tag('ok', 'You win!')
        : tag('err', 'You lose!');
      return `You chose ${tag('info', you)}, I chose ${tag('info', me)}. ${result}`;
    }
  },

  guess: {
    help: 'number guessing game',
    run: () => {
      game = { active: true, target: Math.floor(Math.random() * 100) + 1, tries: 0 };
      return `${tag('ok', "I'm thinking of a number between 1 and 100.")}
Type a number to guess it. Type ${tag('info', 'quit')} to give up.`;
    }
  },

  date: {
    help: 'current date/time',
    run: () => new Date().toLocaleString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  },

  clear: {
    help: 'clear terminal',
    run: () => { output.innerHTML = ''; return ''; }
  },

  /* hidden */
  'sudo rm -rf /': { run: () => tag('err', 'Nice try. No root access here.') },
  sudo:   { run: () => tag('err', 'You are not in the sudoers file. This incident will be reported.') },
  exit:   { run: () => tag('warn', 'No escape from the matrix.') },
  matrix: { run: () => tag('ok', 'Wake up, Neo…') },
  coffee: { run: () => tag('info', '☕  Brewing… please wait.') },
  vim:    { run: () => tag('err', 'vim: not found. This is a web terminal.') },
  hello:  { run: () => tag('ok', "Hello there! Type 'help' to get started.") },
  whoami: { run: () => 'visitor' },
  pwd:    { run: () => '/home/mamdous/portfolio' },
  ls:     { run: () => `${tag('info', 'about.txt')}  ${tag('ok', 'projects/')}  ${tag('warn', 'resume.pdf')}  ${tag('info', 'skills.txt')}  ${tag('info', 'contact.txt')}` }
};

const publicNames = Object.keys(commands).filter(name => commands[name].help);


/* ---------- running a line ---------- */

function run(line) {
  line = line.trim();
  if (!line) return;

  past.push(line);
  pastPos = past.length;
  print(`${tag('ps', ps)} ${esc(line)}`, 'echo');

  if (game.active) {
    if (/^-?\d+$/.test(line)) return finish(guess(parseInt(line, 10)));
    if (line.toLowerCase() === 'quit') {
      game.active = false;
      return finish(tag('warn', `Gave up. The number was ${game.target}.`));
    }
  }

  const [first, ...args] = line.split(/\s+/);
  const command = commands[line.toLowerCase()] || commands[first.toLowerCase()];

  if (command) finish(command.run(args));
  else finish(`${tag('err', 'command not found: ' + esc(line))}\n${tag('info', "type 'help' to see available commands.")}`);
}

function finish(html) {
  if (html) print(html);
  scrollDown();
}


/* ---------- autocomplete ---------- */

function showSuggestions(matches) {
  suggestPos = -1;
  suggest.classList.toggle('open', matches.length > 0);
  suggest.innerHTML = matches.map(m => `<div role="option">${m}</div>`).join('');
  suggest.querySelectorAll('div').forEach(el => {
    el.onclick = () => { input.value = el.textContent; hideSuggestions(); input.focus(); };
  });
}

function hideSuggestions() {
  suggest.classList.remove('open');
}

function moveSuggestion(step) {
  const items = [...suggest.children];
  suggestPos = Math.min(items.length - 1, Math.max(0, suggestPos + step));
  items.forEach((el, i) => el.classList.toggle('active', i === suggestPos));
  input.value = items[suggestPos].textContent;
}

const suggestionsOpen = () => suggest.classList.contains('open') && suggest.children.length > 0;


/* ---------- input handling ---------- */

input.addEventListener('keydown', e => {
  switch (e.key) {
    case 'Enter':
      hideSuggestions();
      run(input.value);
      input.value = '';
      break;

    case 'ArrowUp':
      e.preventDefault();
      if (suggestionsOpen()) moveSuggestion(-1);
      else if (pastPos > 0) input.value = past[--pastPos];
      break;

    case 'ArrowDown':
      e.preventDefault();
      if (suggestionsOpen()) moveSuggestion(1);
      else {
        pastPos = Math.min(past.length, pastPos + 1);
        input.value = past[pastPos] || '';
      }
      break;

    case 'Tab': {
      e.preventDefault();
      const typed = input.value.trim().toLowerCase();
      const matches = publicNames.filter(name => name.startsWith(typed));
      if (matches.length === 1) { input.value = matches[0]; hideSuggestions(); }
      else showSuggestions(matches);
      break;
    }

    case 'Escape':
      hideSuggestions();
      break;

    case 'l':
      if (e.ctrlKey) { e.preventDefault(); commands.clear.run(); }
      break;
  }
});

input.addEventListener('input', () => {
  const typed = input.value.trim().toLowerCase();
  if (typed) showSuggestions(publicNames.filter(name => name.startsWith(typed)));
  else hideSuggestions();
});

// click anywhere in the terminal to focus, unless the visitor is selecting text
body.addEventListener('click', e => {
  if (e.target.closest('a') || getSelection().toString()) return;
  input.focus({ preventScroll: true });
});

document.addEventListener('click', e => {
  if (!suggest.contains(e.target) && e.target !== input) hideSuggestions();
});


/* ---------- start ---------- */

print(tag('info', "Welcome! Type 'help' to explore, or just scroll down."));

// don't pop the keyboard open on phones
if (matchMedia('(hover: hover)').matches) input.focus({ preventScroll: true });

})();
