// LOA TẮT/MỞ

const btn = document.getElementById("btn-volume");
const loaMo = document.getElementById("loaMo");
const loaTat = document.getElementById("loaTat");

btn.addEventListener("click", () => {
  if (loaMo.style.display === "none") {
    loaMo.style.display = "block";
    loaTat.style.display = "none";
  } else {
    loaMo.style.display = "none";
    loaTat.style.display = "block";
  }
});

// =====================================================================================================================
// NÚT "NEW GAME"

document.querySelector(".BatDau-NewGame").addEventListener("click", () => {
  location.reload();
});

// =====================================================================================================================
// NÚT "GAME MODE"

const btnGameMode = document.querySelector(".BatDau-GameMode");
const khungGameMode = document.querySelector(".BatDau-KhungGameMode");
const modeButtons = document.querySelectorAll(
  ".GameMode-Easy, .GameMode-Medium, .GameMode-Hard"
);

// Khi bấm Game Mode
btnGameMode.addEventListener("click", () => {
  if (btnGameMode.classList.contains("active")) return; // đã bật rồi, không bấm lại nữa

  btnGameMode.classList.add("active");
  khungGameMode.style.display = "flex"; // hiện khung chọn chế độ
});

// Khi chọn chế độ
modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Nếu Game Mode chưa bật thì bỏ qua
    if (!btnGameMode.classList.contains("active")) return;

    // Nếu Play đang bật -> không cho đổi, làm nút Pause nhấp nháy
    if (btnPlay.classList.contains("active")) {
      btnPause.classList.add("blink");
      setTimeout(() => btnPause.classList.remove("blink"), 600);
      return;
    }

    // Nếu Pause đang bật -> cho phép đổi chế độ + reset game
    if (btnPause.classList.contains("active")) {
      // Bỏ active ở tất cả
      modeButtons.forEach((b) => b.classList.remove("active"));
      // Gắn active cho nút vừa bấm
      btn.classList.add("active");

      // Reset game
      resetGame();

      // Sau reset: Play & Pause đều tắt
      btnPlay.classList.remove("active");
      btnPause.classList.remove("active");
      isPlaying = false;

      return;
    }

    // Trường hợp bình thường (Game Mode vừa bật, chưa Play/Pause) -> cho chọn chế độ
    modeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

function resetGame() {
  // Reset bàn cờ
  document.querySelectorAll(".Game-KhungCaro td").forEach((cell) => {
    cell.innerHTML = "";
    cell.style.backgroundColor = "#85ceff";
  });

  // Reset trạng thái
  turn = "X";
  gameOver = false;
  luotChoi.textContent = "Player's Turn";

  // Reset Undo/Redo
  history = [];
  redoStack = [];

  // Reset điểm Player
  // playerScore = 0;
  // scoreElement.querySelector("svg").nextSibling.textContent = " " + playerScore;
}

// =====================================================================================================================
// NÚT "PLAY" và "PAUSE"

const btnPlay = document.querySelector(".BatDau-Play");
const btnPause = document.querySelector(".BatDau-Pause");
let isPlaying = false; // biến trạng thái cho phép chơi

// Bấm Play
btnPlay.addEventListener("click", () => {
  if (btnPlay.classList.contains("active")) return;

  // Nếu chưa bật Game Mode
  if (!btnGameMode.classList.contains("active")) {
    btnGameMode.classList.add("blink");
    setTimeout(() => btnGameMode.classList.remove("blink"), 600);
    return;
  }

  // Nếu đã bật Game Mode nhưng chưa chọn chế độ
  const modeSelected = document.querySelector(
    ".GameMode-Easy.active, .GameMode-Medium.active, .GameMode-Hard.active"
  );
  if (!modeSelected) {
    modeButtons.forEach((btn) => {
      btn.classList.add("blink");
      setTimeout(() => btn.classList.remove("blink"), 600);
    });
    return;
  }
  // Nếu bấm Play thì xóa nội dung trong bảng "Search Tree Log"
  if (modeSelected) {
    document.querySelector(".SearchTreeLog-NoiDung").innerHTML = "";
  }

  // Nếu đã chọn chế độ -> cho Play hoạt động
  btnPlay.classList.add("active");
  btnPause.classList.remove("active");
  isPlaying = true; // bật trạng thái chơi

  // Reset lại AI Stats khi Play
  document.querySelector(".AIstats-NoiDung").innerHTML =
    "Nodes explored: ...<br/>" +
    "Pruned nodes: ...<br/>" +
    "Search depth: ...<br/>" +
    "Computation time: ... ms";
});

// Bấm Pause
btnPause.addEventListener("click", () => {
  if (!btnPlay.classList.contains("active")) return;
  if (btnPause.classList.contains("active")) return;

  btnPause.classList.add("active");
  btnPlay.classList.remove("active");
  isPlaying = false; // tạm dừng, không cho chơi
});

// =====================================================================================================================
// GAME CARO

// Lấy SVG X và O từ phần comment bạn đã chuẩn bị sẵn
const svgX = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <g>
        <title>Layer 1</title>
        <line stroke="#ffffff" fill="none" x1="69.14678" y1="19.21374" x2="23.09671" y2="82.316"
          stroke-width="20"/>
        <line stroke="#ffffff" fill="none" x1="23.90284" y1="17.68358" x2="76.79614" y2="82.31641"
          stroke-width="20"/>
        <line fill="none" x1="25.04568" y1="19.39785" x2="75.6533" y2="80.60215"
          stroke-width="16" stroke="#0991ea"/>
        <line fill="none" x1="67.57536" y1="20.99943" x2="24.34671" y2="80.56601"
          stroke-width="16" stroke="#0991ea"/>
      </g>
    </svg>`;

const svgO = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <g>
        <title>Layer 1</title>
        <path transform="rotate(26 50.0029 50)" stroke="#ffffff"
          d="m18.42095,49.99999c0,-19.87036 14.13974,-35.97847 31.58198,-35.97847
          c8.37606,0 16.40906,3.79058 22.33183,10.53785c5.92277,6.74728 9.25015,15.89854 9.25015,25.44063
          c0,19.87036 -14.13974,35.97847 -31.58198,35.97847c-17.44224,0 -31.58198,-16.10812 -31.58198,-35.97847zm15.79099,0
          c0,9.93518 7.06987,17.98924 15.79099,17.98924c8.72112,0 15.79099,-8.05406 15.79099,-17.98924
          c0,-9.93518 -7.06987,-17.98924 -15.79099,-17.98924c-8.72112,0 -15.79099,8.05406 -15.79099,17.98924z"
          stroke-width="2" fill="#ff9a00"/>
      </g>
    </svg>`;

let turn = "X";
let gameOver = false;
let aiStartTime = 0;
const luotChoi = document.querySelector(".Game-LuotChoi p");

// === UNDO/REDO STACK ===
let history = [];
let redoStack = [];

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWin() {
  const cells = document.querySelectorAll(".Game-KhungCaro td");
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    const va = cells[a].innerHTML.trim();
    const vb = cells[b].innerHTML.trim();
    const vc = cells[c].innerHTML.trim();

    if (va !== "" && va === vb && vb === vc) {
      cells[a].style.backgroundColor = "#00CF46";
      cells[b].style.backgroundColor = "#00CF46";
      cells[c].style.backgroundColor = "#00CF46";
      gameOver = true;

      // Kiểm tra ai thắng
      if (va.includes("svg") && va.includes("#0991ea")) {
        updateScore("win"); // Player thắng
        setTimeout(() => showGameMessage("win"), 500);
      } else {
        updateScore("lose"); // Máy thắng
        setTimeout(() => showGameMessage("lose"), 500);
      }

      return true;
    }
  }

  // Nếu bàn đầy mà chưa ai thắng => hòa
  const full = [...cells].every((c) => c.innerHTML.trim() !== "");
  if (full) {
    gameOver = true;
    updateScore("draw");
    setTimeout(() => showGameMessage("draw"), 500);
    return true;
  }

  return false;
}

document.querySelectorAll(".Game-KhungCaro td").forEach((cell) => {
  cell.addEventListener("click", () => {
    if (!isPlaying) return;
    if (gameOver) return;
    if (cell.innerHTML.trim() !== "") return;

    const index = cell.dataset.index;

    if (turn === "X") {
      cell.innerHTML = svgX;
      history.push({ index, player: "X" });
      redoStack = [];
      turn = "O";
      luotChoi.textContent = "Computer's Turn";

      // Bắt đầu tính giờ AI
      aiStartTime = performance.now();

      // Nếu đang ở chế độ Easy thì cho AI đánh luôn (có delay)
      if (document.querySelector(".GameMode-Easy.active")) {
        setTimeout(() => {
          if (!gameOver) aiMoveEasy();
        }, 0); // delay 0.0s để giả lập suy nghĩ
      } else if (document.querySelector(".GameMode-Medium.active")) {
        setTimeout(() => {
          if (!gameOver) aiMoveMedium();
        }, 0);
      } else if (document.querySelector(".GameMode-Hard.active")) {
        setTimeout(() => {
          if (!gameOver) aiMoveHard();
        }, 0);
      }
    } else {
      cell.innerHTML = svgO;
      history.push({ index, player: "O" });
      redoStack = [];
      turn = "X";
      luotChoi.textContent = "Player's Turn";
    }

    checkWin();
  });
});

// =====================================================================================================================
// NÚT UNDO

function undoOnce() {
  if (history.length === 0 || gameOver) return;

  const lastMove = history.pop();
  redoStack.push(lastMove);

  const cell = document.querySelector(`td[data-index="${lastMove.index}"]`);
  cell.innerHTML = "";
  cell.style.backgroundColor = "#85ceff";

  turn = lastMove.player;
  luotChoi.textContent = turn === "X" ? "Player's Turn" : "Computer's Turn";
}

// Undo 2 bước khi click
document.querySelector(".Undo").addEventListener("click", () => {
  undoOnce();
  undoOnce();
});

// =====================================================================================================================
// NÚT REDO

function redoOnce() {
  if (redoStack.length === 0 || gameOver) return;

  const move = redoStack.pop();
  history.push(move);

  const cell = document.querySelector(`td[data-index="${move.index}"]`);
  if (move.player === "X") {
    cell.innerHTML = svgX;
    turn = "O";
    luotChoi.textContent = "Computer's Turn";
  } else {
    cell.innerHTML = svgO;
    turn = "X";
    luotChoi.textContent = "Player's Turn";
  }

  checkWin();
}

// Redo 2 bước khi click
document.querySelector(".Redo").addEventListener("click", () => {
  redoOnce();
  redoOnce();
});

// =====================================================================================================================
// TÍNH ĐIỂM KHI NGƯỜI CHƠI THẮNG

let playerScore = 0; // điểm mặc định
const scoreElement = document.querySelector(".TuyChon-Sao"); // chỗ hiển thị điểm

function updateScore(result) {
  if (result === "win") {
    playerScore = Math.min(9999, playerScore + 1);
  } else if (result === "lose") {
    playerScore = Math.max(0, playerScore - 1);
  } else if (result === "draw") {
    // +0 => không thay đổi
  }
  scoreElement.querySelector("svg").nextSibling.textContent = " " + playerScore;
}

// =====================================================================================================================
// GAME MODE: EASY

function aiMoveEasy() {
  if (gameOver) return;

  const cells = document.querySelectorAll(".Game-KhungCaro td");
  const emptyCells = [...cells].filter((c) => c.innerHTML.trim() === "");
  if (emptyCells.length === 0) return;

  // Chọn random 1 ô
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const index = randomCell.dataset.index;
  randomCell.innerHTML = svgO;
  history.push({ index, player: "O" });
  redoStack = [];
  turn = "X";
  luotChoi.textContent = "Player's Turn";

  // Cập nhật AI Stats (tính cả delay)
  const end = performance.now();
  const time = Math.round(end - aiStartTime);
  document.querySelector(".AIstats-NoiDung").innerHTML =
    `Nodes explored: 0<br/>` +
    `Pruned nodes: 0<br/>` +
    `Search depth: 0<br/>` +
    `Computation time: ${time} ms`;

  // Cập nhật Search Tree Log
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const log = document.querySelector(".SearchTreeLog-NoiDung");
  log.innerHTML += `Move (${row}, ${col}) → Random Pick<br/>`;

  checkWin();
}

// =====================================================================================================================
// GAME MODE: MEDIUM

function aiMoveMedium() {
  const cells = document.querySelectorAll(".Game-KhungCaro td");
  let board = [...cells].map((c) =>
    c.innerHTML.includes("svg")
      ? c.innerHTML.includes("#0991ea")
        ? "X"
        : "O"
      : ""
  );

  let bestMove = null;
  let bestValue = -Infinity;
  let nodesExplored = 0;

  const start = performance.now();

  document.querySelector(".SearchTreeLog-NoiDung").innerHTML = ""; // clear log

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O"; // giả lập nước đi AI
      let value = minimaxMedium(board, 2, false, () => nodesExplored++);
      board[i] = "";

      // log vào SearchTreeLog
      const row = Math.floor(i / 3) + 1; // +1 để hiển thị từ 1
      const col = (i % 3) + 1;
      document.querySelector(
        ".SearchTreeLog-NoiDung"
      ).innerHTML += `Move (${row}, ${col}) → Value = ${value}<br/>`;

      if (value > bestValue) {
        bestValue = value;
        bestMove = i;
      }
    }
  }

  const end = performance.now();

  // Update AI Stats
  document.querySelector(
    ".AIstats-NoiDung"
  ).innerHTML = `Nodes explored: ${nodesExplored}<br/>
     Pruned nodes: 0<br/>
     Search depth: 2<br/>
     Computation time: ${(end - start).toFixed(2)} ms`;

  if (bestMove !== null) {
    cells[bestMove].innerHTML = svgO;
    history.push({ index: bestMove, player: "O" });
    redoStack = [];
    turn = "X";
    luotChoi.textContent = "Player's Turn";
    checkWin();
  }
}

function minimaxMedium(board, depth, isMaximizing, countNode) {
  let result = evaluateBoard(board);
  if (result !== null || depth === 0) {
    return result;
  }

  if (countNode) countNode();

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        best = Math.max(
          best,
          minimaxMedium(board, depth - 1, false, countNode)
        );
        board[i] = "";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        best = Math.min(best, minimaxMedium(board, depth - 1, true, countNode));
        board[i] = "";
      }
    }
    return best;
  }
}

function evaluateBoard(board) {
  const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let [a, b, c] of winCombos) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] === "O" ? 1 : -1; // O thắng: 1, X thắng: -1
    }
  }

  if (board.every((cell) => cell !== "")) return 0; // hòa
  return null; // game chưa kết thúc
}

// =====================================================================================================================
// GAME MODE: HARD

function evaluateBoardHard(cells) {
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    const va = cells[a],
      vb = cells[b],
      vc = cells[c];
    if (va && va === vb && vb === vc) {
      if (va === "O") return 1; // AI thắng
      if (va === "X") return -1; // Player thắng
    }
  }
  return 0;
}

function minimaxAlphaBeta(board, depth, isMax, alpha, beta, log, movePath) {
  let score = evaluateBoardHard(board);
  if (score !== 0) return score;
  if (board.every((cell) => cell !== "")) return 0; // hòa

  let bestVal = isMax ? -Infinity : Infinity;

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = isMax ? "O" : "X"; // AI = O
      let childPath = movePath.concat(i);

      let value = minimaxAlphaBeta(
        board,
        depth + 1,
        !isMax,
        alpha,
        beta,
        log,
        childPath
      );
      board[i] = "";

      if (isMax) {
        if (value > bestVal) bestVal = value;
        alpha = Math.max(alpha, bestVal);
        log.push(
          `Move (${Math.floor(i / 3) + 1}, ${(i % 3) + 1}) → Value = ...`
        );
      } else {
        if (value < bestVal) bestVal = value;
        beta = Math.min(beta, bestVal);
        log.push(
          `Move (${Math.floor(i / 3) + 1}, ${(i % 3) + 1}) → Value = ...`
        );
      }

      if (beta <= alpha) {
        log.push(`Move (${Math.floor(i / 3) + 1}, ${(i % 3) + 1}) → Pruned`);
        break;
      }
    }
  }

  return bestVal;
}

function aiMoveHard() {
  const cells = document.querySelectorAll(".Game-KhungCaro td");
  let board = Array.from(cells).map((c) => {
    if (c.innerHTML.includes("#0991ea")) return "X";
    if (c.innerHTML.includes("#ff9a00")) return "O";
    return "";
  });

  let bestVal = -Infinity;
  let bestMove = -1;
  let log = [];

  let nodes = 0,
    pruned = 0;
  const start = performance.now();

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      let value = minimaxAlphaBeta(board, 0, false, -Infinity, Infinity, log, [
        i,
      ]);
      board[i] = "";
      if (value > bestVal) {
        bestVal = value;
        bestMove = i;
      }
    }
  }

  const end = performance.now();

  if (bestMove !== -1) {
    cells[bestMove].innerHTML = svgO;
    history.push({ index: bestMove, player: "O" });
    redoStack = [];
    turn = "X";
    luotChoi.textContent = "Player's Turn";
  }

  // Cập nhật log
  document.querySelector(".SearchTreeLog-NoiDung").innerHTML = log.join("<br>");

  // Cập nhật AI Stats
  document.querySelector(".AIstats-NoiDung").innerHTML =
    `Nodes explored: ${log.length}<br/>` +
    `Pruned nodes: ${log.filter((l) => l.includes("Pruned")).length}<br/>` +
    `Search depth: full<br/>` +
    `Computation time: ${(end - start).toFixed(2)} ms`;

  checkWin();
}

// =====================================================================================================================
// THÔNG BÁO KQ KHI KẾT THÚC GAME

function showGameMessage(result) {
  const overlay = document.getElementById("gameOverlay");
  const message = document.getElementById("gameMessage");

  if (result === "win") message.textContent = "You Win!";
  else if (result === "lose") message.textContent = "You Lose!";
  else message.textContent = "It's a Draw!";

  overlay.style.display = "flex";

  // Click vào nền tối để tắt overlay
  overlay.onclick = () => {
    overlay.style.display = "none";
    resetBoardAfterGame();
  };
}

function resetBoardAfterGame() {
  // Reset bàn cờ
  document.querySelectorAll(".Game-KhungCaro td").forEach((cell) => {
    cell.innerHTML = "";
    cell.style.backgroundColor = "#85ceff";
  });

  // Reset trạng thái
  turn = "X";
  gameOver = false;
  luotChoi.textContent = "Player's Turn";

  // Reset Undo/Redo
  history = [];
  redoStack = [];

  // Tắt Play nếu đang bật
  btnPlay.classList.remove("active");
  btnPause.classList.remove("active");
  isPlaying = false;

  // Bật lại Game Mode button nếu muốn người chơi có thể nhấn Play tiếp
  if (!btnGameMode.classList.contains("active")) {
    btnGameMode.classList.add("active");
  }

  // Reset AI stats và Search Tree Log
  document.querySelector(".AIstats-NoiDung").innerHTML =
    "Nodes explored: ...<br/>" +
    "Pruned nodes: ...<br/>" +
    "Search depth: ...<br/>" +
    "Computation time: ... ms";

  document.querySelector(".SearchTreeLog-NoiDung").innerHTML = "";
}

// =====================================================================================================================
