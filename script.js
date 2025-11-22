const gameState = {
    board: [],
    currentPlayer: 1,
    gameOver: false,
    boardSize: 15,
    gameMode: 'pvp', // 'pvp'或'pvc'(人机对战)
    aiPlayer: 2 // AI执白棋
};

const elements = {
    board: document.getElementById('board'),
    status: document.getElementById('status'),
    resetBtn: document.getElementById('reset'),
    modeBtn: document.getElementById('modeBtn')
};

function initGame() {
    gameState.board = Array(gameState.boardSize).fill().map(() => 
        Array(gameState.boardSize).fill(0)
    );
    
    gameState.currentPlayer = 1;
    gameState.gameOver = false;
    elements.status.textContent = '黑方回合';
    
    elements.board.innerHTML = '';
    for (let i = 0; i < gameState.boardSize; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < gameState.boardSize; j++) {
            const cell = document.createElement('td');
            cell.dataset.row = i;
            cell.dataset.col = j;
            row.appendChild(cell);
        }
        elements.board.appendChild(row);
    }
}

function placeStone(row, col) {
    if (gameState.gameOver || gameState.board[row][col] !== 0) return false;
    
    gameState.board[row][col] = gameState.currentPlayer;
    
    const stone = document.createElement('div');
    stone.className = `stone ${gameState.currentPlayer === 1 ? 'black' : 'white'}`;
    elements.board.rows[row].cells[col].appendChild(stone);
    
    if (checkWin(row, col)) {
        gameState.gameOver = true;
        elements.status.textContent = `${gameState.currentPlayer === 1 ? '黑方' : '白方'}获胜！`;
        return true;
    }
    
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    elements.status.textContent = `${gameState.currentPlayer === 1 ? '黑方' : '白方'}回合`;
    
    // 如果是人机对战且轮到AI，则触发AI落子
    if (gameState.gameMode === 'pvc' && gameState.currentPlayer === gameState.aiPlayer && !gameState.gameOver) {
        setTimeout(aiMove, 500); // 添加延迟使AI落子更自然
    }
    
    return true;
}

// AI评分函数
function evaluatePosition(row, col, player) {
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    let score = 0;
    
    for (const [dx, dy] of directions) {
        let count = 1;
        let openEnds = 0;
        
        // 正向检查
        for (let i = 1; i < 5; i++) {
            const r = row + dx * i;
            const c = col + dy * i;
            if (r < 0 || r >= gameState.boardSize || c < 0 || c >= gameState.boardSize) break;
            if (gameState.board[r][c] === player) count++;
            else if (gameState.board[r][c] === 0) { openEnds++; break; }
            else break;
        }
        
        // 反向检查
        for (let i = 1; i < 5; i++) {
            const r = row - dx * i;
            const c = col - dy * i;
            if (r < 0 || r >= gameState.boardSize || c < 0 || c >= gameState.boardSize) break;
            if (gameState.board[r][c] === player) count++;
            else if (gameState.board[r][c] === 0) { openEnds++; break; }
            else break;
        }
        
        // 棋型评分
        if (count >= 5) score += 100000; // 五连
        else if (count === 4 && openEnds >= 1) score += 10000; // 活四
        else if (count === 4) score += 1000; // 冲四
        else if (count === 3 && openEnds >= 1) score += 100; // 活三
        else if (count === 3) score += 10; // 眠三
        else if (count === 2 && openEnds >= 1) score += 5; // 活二
    }
    
    return score;
}

// AI寻找最佳落子
function findBestMove() {
    let bestScore = -1;
    let bestMove = null;
    
    for (let i = 0; i < gameState.boardSize; i++) {
        for (let j = 0; j < gameState.boardSize; j++) {
            if (gameState.board[i][j] === 0) {
                // 进攻分(己方)
                const attackScore = evaluatePosition(i, j, gameState.aiPlayer);
                // 防守分(对方)
                const defendScore = evaluatePosition(i, j, gameState.aiPlayer === 1 ? 2 : 1);
                const totalScore = attackScore + defendScore * 0.8;
                
                if (totalScore > bestScore) {
                    bestScore = totalScore;
                    bestMove = { row: i, col: j };
                }
            }
        }
    }
    
    return bestMove;
}

// AI落子
function aiMove() {
    const move = findBestMove();
    if (move) placeStone(move.row, move.col);
}

// 切换游戏模式
function toggleGameMode() {
    gameState.gameMode = gameState.gameMode === 'pvp' ? 'pvc' : 'pvp';
    elements.modeBtn.textContent = gameState.gameMode === 'pvp' ? '人机对战' : '双人对战';
    initGame();
}

function checkWin(row, col) {
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    const player = gameState.board[row][col];
    
    for (const [dx, dy] of directions) {
        let count = 1;
        
        for (let i = 1; i < 5; i++) {
            const r = row + dx * i;
            const c = col + dy * i;
            if (r < 0 || r >= gameState.boardSize || c < 0 || c >= gameState.boardSize || 
                gameState.board[r][c] !== player) break;
            count++;
        }
        
        for (let i = 1; i < 5; i++) {
            const r = row - dx * i;
            const c = col - dy * i;
            if (r < 0 || r >= gameState.boardSize || c < 0 || c >= gameState.boardSize || 
                gameState.board[r][c] !== player) break;
            count++;
        }
        
        if (count >= 5) return true;
    }
    
    return false;
}

elements.board.addEventListener('click', (e) => {
    const cell = e.target.closest('td');
    if (cell) placeStone(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
});

elements.resetBtn.addEventListener('click', initGame);
elements.modeBtn.addEventListener('click', toggleGameMode);

// 初始化游戏
initGame();