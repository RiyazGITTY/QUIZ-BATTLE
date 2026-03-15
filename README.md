# 🎮 Quiz Battle — Multiplayer English Game
## Grade 8 English | Up to 10 Students | English + Arabic

---

## 📋 WHAT YOU NEED
- A computer (Windows / Mac / Linux)
- Node.js installed (free download: https://nodejs.org)
- All devices (teacher + students) on the SAME WiFi network

---

## 🚀 HOW TO SET UP (One Time Only)

### Step 1 — Install Node.js
Go to https://nodejs.org and download the LTS version. Install it.

### Step 2 — Open Terminal / Command Prompt
- **Windows**: Press Win+R, type `cmd`, press Enter
- **Mac**: Press Cmd+Space, type `terminal`, press Enter

### Step 3 — Go to this folder
```
cd path/to/quiz-battle
```
(drag the folder into the terminal window to get the path)

### Step 4 — Install dependencies (one time only)
```
npm install
```

### Step 5 — Start the server
```
npm start
```

You will see:
```
✅ Quiz Battle Server running!
👩‍🏫 Teacher opens: http://localhost:3000/teacher.html
📱 Students scan QR or go to: http://YOUR_IP:3000/student.html
```

---

## 👩‍🏫 HOW TO PLAY

### Teacher:
1. Open **http://localhost:3000/teacher.html** on your phone/laptop
2. A **QR code** appears on screen
3. Show the QR code to students
4. Wait for students to join (you'll see their names appear)
5. Choose a game type:
   - 📚 Vocabulary Quiz
   - 🔤 Spelling Bee
   - ✏️ Fill in the Blank
   - 🔀 Word Scramble
6. Set the timer and press **Start Game**
7. Press **Next Question** for each round
8. For Vocabulary: press ✓ Correct or ✗ Wrong after a student buzzes
9. Winner is announced at the end with confetti! 🎉

### Students:
1. Open camera and scan the QR code on teacher's screen
2. Enter your name and tap **Join Game**
3. Wait for teacher to start
4. Play! Buzz in, answer questions, earn points!
5. 3 wrong answers = eliminated
6. Highest score wins!

---

## 🎮 GAMES EXPLAINED

| Game | How it works |
|------|-------------|
| 📚 Vocabulary Quiz | Question appears. First to buzz in and answer correctly gets +10 |
| 🔤 Spelling Bee | Hint shown. Type the correct spelling of the word |
| ✏️ Fill in the Blank | Sentence with a gap. Choose from 4 options |
| 🔀 Word Scramble | Jumbled word shown. Unscramble it and type the answer |

---

## 📱 SCORING
- ✅ Correct answer: **+10 points**
- ❌ Wrong answer: **−1 life** (3 lives total)
- 💀 No lives left: **Eliminated**

---

## 🔧 TROUBLESHOOTING

**Students can't connect?**
- Make sure teacher's computer and student phones are on the SAME WiFi
- Try turning off the computer's firewall temporarily
- Use the URL shown in the terminal (not localhost)

**QR code not loading?**
- Refresh the teacher page
- Make sure npm install completed successfully

**Port already in use?**
- Change PORT=3000 to PORT=3001 in server.js line 7

---

## 📦 FILES
```
quiz-battle/
├── server.js          ← Main server (runs everything)
├── package.json       ← Dependencies
├── README.md          ← This file
└── public/
    ├── teacher.html   ← Teacher's dashboard
    └── student.html   ← Student's mobile page
```

---
Built with ❤️ for English teachers | Grade 8 | English + Arabic
