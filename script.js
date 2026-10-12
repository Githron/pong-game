const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

const paddleWidth = 14;
const paddleHeight = 100;
const ballRadius = 8;
const baseSpeed = 6;

const leftPaddle = {
  x: 20,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 8,
  targetY: canvas.height / 2 - paddleHeight / 2,
};

const rightPaddle = {
  x: canvas.width - 20 - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 5.2,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  speedX: baseSpeed,
  speedY: baseSpeed,
};

let playerScore = 0;
let computerScore = 0;
let upPressed = false;
let downPressed = false;

function resetBall(direction) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  const angle = (Math.random() * 1.2 - 0.6);
  const speed = baseSpeed + Math.random() * 1.5;

  ball.speedX = direction * speed;
  ball.speedY = Math.sin(angle) * speed;
}

function updateScoreboard() {
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
}

function movePlayerPaddle() {
  if (upPressed) {
    leftPaddle.targetY -= leftPaddle.speed;
  }
  if (downPressed) {
    leftPaddle.targetY += leftPaddle.speed;
  }

  leftPaddle.targetY = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.targetY));
  leftPaddle.y += (leftPaddle.targetY - leftPaddle.y) * 0.3;
  leftPaddle.y = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.y));
}

function updateComputerPaddle() {
  const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
  const ballCenter = ball.y;

  if (ballCenter > paddleCenter + 10) {
    rightPaddle.y += rightPaddle.speed;
  } else if (ballCenter < paddleCenter - 10) {
    rightPaddle.y -= rightPaddle.speed;
  }

  rightPaddle.y = Math.max(0, Math.min(canvas.height - rightPaddle.height, rightPaddle.y));
}

function handleBallWallCollision() {
  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.speedY *= -1;
    ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
  }
}

function handleBallPaddleCollision(paddle) {
  const paddleLeft = paddle.x;
  const paddleRight = paddle.x + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  if (
    ball.x - ball.radius <= paddleRight &&
    ball.x + ball.radius >= paddleLeft &&
    ball.y >= paddleTop &&
    ball.y <= paddleBottom &&
    (ball.speedX < 0 && paddle === leftPaddle || ball.speedX > 0 && paddle === rightPaddle)
  ) {
    const relativeIntersectY = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
    const bounceAngle = relativeIntersectY * 1.05;
    const speed = Math.hypot(ball.speedX, ball.speedY) + 0.4;

    if (paddle === leftPaddle) {
      ball.x = paddleLeft + paddle.width + ball.radius;
      ball.speedX = Math.cos(bounceAngle) * speed;
      ball.speedY = Math.sin(bounceAngle) * speed;
    } else {
      ball.x = paddleRight - ball.radius;
      ball.speedX = -Math.cos(bounceAngle) * speed;
      ball.speedY = Math.sin(bounceAngle) * speed;
    }
  }
}

function updateBall() {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  handleBallWallCollision();
  handleBallPaddleCollision(leftPaddle);
  handleBallPaddleCollision(rightPaddle);

  if (ball.x - ball.radius < 0) {
    computerScore += 1;
    updateScoreboard();
    resetBall(1);
  }

  if (ball.x + ball.radius > canvas.width) {
    playerScore += 1;
    updateScoreboard();
    resetBall(-1);
  }
}

function drawCenterLine() {
  ctx.beginPath();
  ctx.setLineDash([10, 16]);
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(paddle) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fbbf24';
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCenterLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();
}

function gameLoop() {
  movePlayerPaddle();
  updateComputerPaddle();
  updateBall();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    upPressed = true;
    event.preventDefault();
  }
  if (event.key === 'ArrowDown') {
    downPressed = true;
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp') {
    upPressed = false;
  }
  if (event.key === 'ArrowDown') {
    downPressed = false;
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  leftPaddle.targetY = mouseY - leftPaddle.height / 2;
  leftPaddle.targetY = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.targetY));
});

updateScoreboard();
resetBall(1);
gameLoop();