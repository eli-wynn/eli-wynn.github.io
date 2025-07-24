const pre = document.getElementById('solar-system');
const charWidth = 7;   // Approximate width of a character in px
const charHeight = 14; // Approximate height of a character in px

let width = Math.floor(window.innerWidth / charWidth);
let height = Math.floor(window.innerHeight / charHeight);

let angle = 0;
let frameCounter = 0;

let previousFrame = Array.from({ length: height }, () =>
    Array(width).fill({ char: ' ', color: '' })
  );
  

const colorPalette = ['#FFB6C1', '#ADD8E6', '#90EE90', '#FFFFE0', '#FFA07A', '#E6E6FA', '#00FFFF', '#FFD700'];
const chars = ['.', ':', '+', '*', 'o', 'O'];

window.addEventListener('resize', () => {
    width = Math.floor(window.innerWidth / charWidth);
    height = Math.floor(window.innerHeight / charHeight);
  });
  

  function generateGalaxy(angle) {
    const newFrame = Array.from({ length: height }, () =>
      Array(width).fill({ char: ' ', color: '' })
    );
    const centerX = width / 2;
    const centerY = height / 2;
    const numArms = 6;
    const spiralTightness = 0.13;
    const starCount = 2400;
  
    for (let i = 0; i < starCount; i++) {
      const arm = i % numArms;
      const t = i * 0.045;
      const radius = t;
      const theta = spiralTightness * t + (arm * Math.PI * 2 / numArms) + angle;
  
      const baseX = centerX + radius * Math.cos(theta + 0.6);
      const baseY = centerY + radius * Math.sin(theta) * 0.35 + radius * 0.03;
  
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          const x = Math.floor(baseX + j);
          const y = Math.floor(baseY + k);
          const distFromCenter = Math.hypot(x - centerX, y - centerY);
          if (distFromCenter > 4 && x >= 0 && x < width && y >= 0 && y < height) {
            const prev = previousFrame[y][x];
            const shouldChange = frameCounter % 2 === 0;
  
            const char = shouldChange ? chars[Math.floor(Math.random() * chars.length)] : prev.char;
            const color = shouldChange ? colorPalette[Math.floor(Math.random() * colorPalette.length)] : prev.color;
  
            newFrame[y][x] = { char, color };
          }
        }
      }
    }
  
    previousFrame = newFrame;
  
    return newFrame.map(row =>
      row.map(({ char, color }) =>
        color ? `<span style="color:${color}">${char}</span>` : ' '
      ).join('')
    ).join('\n');
  }
  

function drawFrame() {
  const frame = generateGalaxy(angle);
  pre.innerHTML = frame;
  angle += 0.0004;
  frameCounter++;
  requestAnimationFrame(drawFrame);
}

drawFrame();
