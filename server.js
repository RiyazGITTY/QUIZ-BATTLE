const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const os = require('os');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const QUESTIONS = require('./questions.js');

let usedQuestions = { vocab: new Set(), spelling: new Set(), fillblank: new Set(), scramble: new Set() };
let customQuestions = { vocab: [], spelling: [], fillblank: [], scramble: [] };

function getUniqueQuestions(game, count) {
  const pool = [...QUESTIONS[game], ...customQuestions[game]];
  const used = usedQuestions[game];
  if (used.size >= pool.length) usedQuestions[game] = new Set();
  const available = pool.map((q, i) => ({ q, i })).filter(({ i }) => !usedQuestions[game].has(i));
  const shuffled = available.sort(() => Math.random() - 0.5).slice(0, Math.min(count, available.length));
  shuffled.forEach(({ i }) => usedQuestions[game].add(i));
  return shuffled.map(({ q }) => q);
}

let state = {
  phase: 'lobby', game: null, players: {}, currentQ: -1,
  questions: [], buzzed: null, timerMax: 15, timerLeft: 0, timerHandle: null,
};

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

function resetState() {
  clearInterval(state.timerHandle);
  state = { phase:'lobby', game:null, players:{}, currentQ:-1, questions:[], buzzed:null, timerMax:15, timerLeft:0, timerHandle:null };
}

function broadcastState() {
  const players = Object.values(state.players).map(p => ({ name: p.name, score: p.score, lives: p.lives, active: p.active }));
  io.emit('state_update', { phase: state.phase, game: state.game, players, currentQ: state.currentQ, total: state.questions.length, buzzed: state.buzzed ? state.players[state.buzzed]?.name : null, timerLeft: state.timerLeft, timerMax: state.timerMax });
}

function sendQuestion() {
  const q = state.questions[state.currentQ];
  if (!q) return;
  state.buzzed = null;
  Object.values(state.players).forEach(p => p.answered = false);
  let payload = { index: state.currentQ, total: state.questions.length, game: state.game };
  if (state.game === 'vocab') {
    payload.question = q.q; payload.answer = q.a;
  } else if (state.game === 'spelling') {
    payload.hint = q.hint; payload.answer = q.word;
  } else if (state.game === 'fillblank') {
    payload.question = q.q; payload.options = q.options; payload.answer = q.a;
  } else if (state.game === 'scramble') {
    payload.scrambled = q.scrambled; payload.hint = q.hint; payload.answer = q.answer;
  } else if (state.game === 'islamic') {
    payload.question = q.q; payload.answer = q.a; payload.category = q.category || 'general';
  }
  io.emit('question', payload);
  broadcastState();
  startTimer();
}

function startTimer() {
  clearInterval(state.timerHandle);
  state.timerLeft = state.timerMax;
  io.emit('timer', { left: state.timerLeft, max: state.timerMax });
  state.timerHandle = setInterval(() => {
    state.timerLeft--;
    io.emit('timer', { left: state.timerLeft, max: state.timerMax });
    if (state.timerLeft <= 0) { clearInterval(state.timerHandle); io.emit('time_up', {}); }
  }, 1000);
}

function stopTimer() { clearInterval(state.timerHandle); }
function getLeaderboard() { return Object.values(state.players).sort((a, b) => b.score - a.score).map(p => ({ name: p.name, score: p.score })); }
function endGame() { stopTimer(); state.phase = 'results'; io.emit('game_over', { leaderboard: getLeaderboard() }); broadcastState(); }

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('teacher_join', () => {
    socket.join('teacher');
    socket.emit('player_list', Object.values(state.players).map(p => p.name));
    broadcastState();
  });

  socket.on('student_join', ({ name }) => {
    if (Object.keys(state.players).length >= 30) { socket.emit('error_msg', 'Room is full (max 30 students)'); return; }
    if (state.phase !== 'lobby') { socket.emit('error_msg', 'Game already started'); return; }
    state.players[socket.id] = { name, score: 0, lives: 3, active: true, answered: false };
    io.to('teacher').emit('player_list', Object.values(state.players).map(p => p.name));
    socket.emit('joined', { name });
    broadcastState();
  });

  socket.on('start_game', ({ game, timerMax, questionCount }) => {
    if (Object.keys(state.players).length < 1) return;
    state.game = game; state.phase = 'playing'; state.timerMax = timerMax || 15;
    state.questions = getUniqueQuestions(game, questionCount || 10);
    state.currentQ = -1;
    Object.values(state.players).forEach(p => { p.score = 0; p.lives = 3; p.active = true; });
    io.emit('game_started', { game }); broadcastState();
  });

  socket.on('next_question', () => {
    state.currentQ++;
    if (state.currentQ >= state.questions.length) { endGame(); return; }
    sendQuestion();
  });

  socket.on('buzz', () => {
    if (state.buzzed || !state.players[socket.id]?.active) return;
    stopTimer(); state.buzzed = socket.id;
    io.emit('buzzed', { name: state.players[socket.id].name, socketId: socket.id }); broadcastState();
  });

  socket.on('submit_answer', ({ answer }) => {
    const player = state.players[socket.id];
    if (!player || !player.active || player.answered) return;
    const q = state.questions[state.currentQ];
    if (!q) return;
    const qAnswer = (q.answer || q.a || q.word || '').trim().toLowerCase();
    const correct = answer.trim().toLowerCase() === qAnswer;
    player.answered = true;
    if (correct) { stopTimer(); player.score += 10; io.emit('correct_answer', { name: player.name, answer: q.answer || q.a || q.word }); }
    else { socket.emit('wrong_answer', { correct: false }); }
    broadcastState();
  });

  socket.on('mark_correct', () => {
    const targetId = state.buzzed;
    if (!targetId || !state.players[targetId]) return;
    state.players[targetId].score += 10;
    const q = state.questions[state.currentQ];
    io.emit('correct_answer', { name: state.players[targetId].name, answer: q.answer || q.a || q.word });
    state.buzzed = null; broadcastState();
  });

  socket.on('mark_wrong', ({ socketId }) => {
    const tid = socketId || state.buzzed;
    if (!tid || !state.players[tid]) return;
    state.players[tid].lives--;
    if (state.players[tid].lives <= 0) { state.players[tid].active = false; io.emit('player_eliminated', { name: state.players[tid].name }); }
    state.buzzed = null;
    const activePlayers = Object.values(state.players).filter(p => p.active);
    if (activePlayers.length <= 1) { endGame(); return; }
    io.emit('wrong_buzz', { name: state.players[tid]?.name }); broadcastState();
    if (state.game === 'vocab') startTimer();
  });

  socket.on('reveal_answer', () => {
    stopTimer();
    const q = state.questions[state.currentQ];
    if (!q) { socket.emit('error_msg', 'No question loaded yet'); return; }
    const answer = q.answer || q.a || q.word || 'N/A';
    io.emit('answer_revealed', { answer });
    state.buzzed = null; broadcastState();
  });

  socket.on('end_game', () => endGame());
  socket.on('reset_lobby', () => { resetState(); io.emit('lobby_reset', {}); });

  socket.on('disconnect', () => {
    if (state.players[socket.id]) {
      const name = state.players[socket.id].name;
      delete state.players[socket.id];
      io.to('teacher').emit('player_list', Object.values(state.players).map(p => p.name));
      io.emit('player_left', { name }); broadcastState();
    }
  });
});

// ── Teacher Auth ─────────────────────────────────────────────
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || 'teacher123';

app.use(express.json());

app.post('/auth', (req, res) => {
  const { password } = req.body;
  if (password === TEACHER_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Wrong password' });
  }
});

app.get('/qr', async (req, res) => {
  // Auto-detect host from request headers — works on Railway, local, everywhere
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || (getLocalIP() + ':' + PORT);
  const url = proto + '://' + host + '/student.html';
  try {
    const qr = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#0f1923', light: '#ffffff' } });
    res.json({ qr, url });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log(`\n✅ Quiz Battle Server running!`);
  console.log(`👩‍🏫 Teacher opens: http://localhost:${PORT}/teacher.html`);
  console.log(`📱 Students scan QR or go to: http://${ip}:${PORT}/student.html\n`);
});

// ── Custom Question Socket Handlers (appended) ────────────────
// Override teacher_join to also send custom questions
const _origConn = io.listeners('connection')[0];
io.removeAllListeners('connection');
io.on('connection', (socket) => {
  _origConn(socket);

  socket.on('add_custom_question', ({ game, question }) => {
    if (!customQuestions[game]) return;
    customQuestions[game].push(question);
    usedQuestions[game] = new Set();
    io.to('teacher').emit('custom_questions_update', customQuestions);
    console.log('Custom question added to', game);
  });

  socket.on('delete_custom_question', ({ game, index }) => {
    if (!customQuestions[game]) return;
    customQuestions[game].splice(index, 1);
    usedQuestions[game] = new Set();
    io.to('teacher').emit('custom_questions_update', customQuestions);
  });

  socket.on('clear_custom_questions', ({ game }) => {
    customQuestions[game] = [];
    usedQuestions[game] = new Set();
    io.to('teacher').emit('custom_questions_update', customQuestions);
  });

  socket.on('get_custom_questions', () => {
    socket.emit('custom_questions_update', customQuestions);
    socket.emit('default_counts', {
      vocab: QUESTIONS.vocab.length,
      spelling: QUESTIONS.spelling.length,
      fillblank: QUESTIONS.fillblank.length,
      scramble: QUESTIONS.scramble.length
    });
  });
});