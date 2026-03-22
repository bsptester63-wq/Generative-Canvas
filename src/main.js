const palettes = {
  aurora: {
    mood: 'Dreamy',
    background: ['#070b16', '#0e1631', '#1e2d63'],
    colors: ['#99f6ff', '#78ffd6', '#a38bff', '#ffffff'],
  },
  sunset: {
    mood: 'Warm',
    background: ['#18070f', '#3d0d2b', '#7e2c44'],
    colors: ['#ffb36b', '#ff7f96', '#ffd2b0', '#fff3d2'],
  },
  midnight: {
    mood: 'Cosmic',
    background: ['#02030a', '#0f1030', '#232862'],
    colors: ['#88a3ff', '#ff79f2', '#7afcff', '#ffffff'],
  },
  lagoon: {
    mood: 'Electric',
    background: ['#031218', '#063c4a', '#0b6870'],
    colors: ['#86fff7', '#53d2ff', '#d7ff7c', '#ffffff'],
  },
};

const canvas = document.querySelector('#artCanvas');
const ctx = canvas.getContext('2d');
const densityRange = document.querySelector('#densityRange');
const symmetryRange = document.querySelector('#symmetryRange');
const paletteSelect = document.querySelector('#paletteSelect');
const densityValue = document.querySelector('#densityValue');
const symmetryValue = document.querySelector('#symmetryValue');
const layersValue = document.querySelector('#layersValue');
const mirrorsValue = document.querySelector('#mirrorsValue');
const paletteMood = document.querySelector('#paletteMood');
const seedChip = document.querySelector('#seedChip');
const generateButton = document.querySelector('#generateButton');
const exportButton = document.querySelector('#exportButton');

const state = {
  density: Number(densityRange.value),
  symmetry: Number(symmetryRange.value),
  palette: paletteSelect.value,
  seed: Math.floor(Math.random() * 1000000),
};

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function updateReadout() {
  densityValue.textContent = String(state.density);
  symmetryValue.textContent = String(state.symmetry);
  layersValue.textContent = String(state.density);
  mirrorsValue.textContent = `${state.symmetry}x`;
  paletteMood.textContent = palettes[state.palette].mood;
  seedChip.textContent = `Seed ${String(state.seed).padStart(6, '0')}`;
}

function createBackgroundGradient(gradientPalette) {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, gradientPalette[0]);
  gradient.addColorStop(0.5, gradientPalette[1]);
  gradient.addColorStop(1, gradientPalette[2]);
  return gradient;
}

function drawGlow(random, x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `${color}99`);
  gradient.addColorStop(0.35, `${color}30`);
  gradient.addColorStop(1, `${color}00`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (random() > 0.5) {
    ctx.strokeStyle = `${color}18`;
    ctx.lineWidth = 1 + random() * 2;
    ctx.beginPath();
    ctx.arc(x, y, radius * (1.1 + random() * 0.4), 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawShapeSet(random, palette) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const rotations = state.symmetry;
  const baseRadius = canvas.width * (0.18 + random() * 0.28);
  const angleOffset = random() * Math.PI * 2;

  for (let mirror = 0; mirror < rotations; mirror += 1) {
    const angle = angleOffset + (Math.PI * 2 * mirror) / rotations;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    const shapeColor = palette[Math.floor(random() * palette.length)];
    const width = baseRadius * (0.25 + random() * 0.6);
    const height = baseRadius * (0.08 + random() * 0.28);
    const distance = canvas.width * (0.06 + random() * 0.28);
    const alpha = 0.22 + random() * 0.48;

    ctx.fillStyle = `${shapeColor}${Math.round(alpha * 255)
      .toString(16)
      .padStart(2, '0')}`;
    ctx.strokeStyle = `${shapeColor}99`;
    ctx.lineWidth = 1 + random() * 3.4;
    ctx.shadowColor = `${shapeColor}66`;
    ctx.shadowBlur = 30 + random() * 36;

    if (random() > 0.45) {
      ctx.beginPath();
      ctx.ellipse(distance, 0, width, height, random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(distance - width * 0.5, 0);
      ctx.quadraticCurveTo(distance, -height * (1.2 + random()), distance + width * 0.65, 0);
      ctx.quadraticCurveTo(distance, height * (1.2 + random()), distance - width * 0.5, 0);
      ctx.fill();
      ctx.stroke();
    }

    if (random() > 0.28) {
      ctx.strokeStyle = `${shapeColor}55`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(distance + width, 0);
      ctx.stroke();
    }

    ctx.restore();
  }
}

function drawTexture(random, palette) {
  for (let index = 0; index < state.density * 10; index += 1) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const size = random() * 3;
    ctx.fillStyle = `${palette[Math.floor(random() * palette.length)]}${random() > 0.7 ? '66' : '22'}`;
    ctx.fillRect(x, y, size, size);
  }
}

function render() {
  const random = mulberry32(state.seed);
  const selectedPalette = palettes[state.palette];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = createBackgroundGradient(selectedPalette.background);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let glowIndex = 0; glowIndex < 8; glowIndex += 1) {
    drawGlow(
      random,
      random() * canvas.width,
      random() * canvas.height,
      canvas.width * (0.08 + random() * 0.18),
      selectedPalette.colors[Math.floor(random() * selectedPalette.colors.length)],
    );
  }

  for (let layer = 0; layer < state.density; layer += 1) {
    drawShapeSet(random, selectedPalette.colors);
  }

  drawTexture(random, selectedPalette.colors);
  ctx.restore();

  updateReadout();
}

function regenerate() {
  state.seed = Math.floor(Math.random() * 1000000);
  render();
}

function syncAndRender() {
  state.density = Number(densityRange.value);
  state.symmetry = Number(symmetryRange.value);
  state.palette = paletteSelect.value;
  render();
}

[densityRange, symmetryRange].forEach((input) => {
  input.addEventListener('input', syncAndRender);
});

paletteSelect.addEventListener('change', syncAndRender);
generateButton.addEventListener('click', regenerate);
exportButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `generative-canvas-${state.seed}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

render();
