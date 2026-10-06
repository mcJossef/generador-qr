import QRCode from 'qrcode';
import './style.css';

const $ = (id) => document.getElementById(id);

const els = {
  url: $('url'),
  size: $('size'),
  ecc: $('ecc'),
  dark: $('dark'),
  light: $('light'),
  canvas: $('qr'),
  empty: $('empty'),
  message: $('message'),
  dlPng: $('dl-png'),
  dlSvg: $('dl-svg'),
  copy: $('copy'),
};

let currentText = '';
let logoImg = null;
let logoUrl = '';


function normalize(raw) {
  const value = raw.trim();
  if (!value) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value; 
  if (/^[^\s/]+\.[a-z]{2,}(\/.*)?$/i.test(value)) return `https://${value}`;
  return value;
}

function qrOptions() {
  return {
    width: Number(els.size.value),
    margin: 2,
    errorCorrectionLevel: logoImg ? 'H' : els.ecc.value,
    color: { dark: els.dark.value, light: els.light.value },
  };
}

function setReady(ready) {
  els.canvas.classList.toggle('hidden', !ready);
  els.empty.classList.toggle('hidden', ready);
  [els.dlPng, els.dlSvg, els.copy].forEach((b) => (b.disabled = !ready));
}

function drawLogo(canvas) {
  const ctx = canvas.getContext('2d');
  const box = canvas.width * 0.22;           
  const pad = box * 0.12;                    
  const x = (canvas.width - box) / 2;
  const y = (canvas.height - box) / 2;

  ctx.fillStyle = els.light.value;
  ctx.fillRect(x - pad, y - pad, box + pad * 2, box + pad * 2);

  const scale = Math.min(box / logoImg.width, box / logoImg.height);
  const w = logoImg.width * scale;
  const h = logoImg.height * scale;
  ctx.drawImage(logoImg, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
}

async function render() {
  currentText = normalize(els.url.value);
  els.message.textContent = '';

  if (!currentText) {
    setReady(false);
    return;
  }

  try {
    await QRCode.toCanvas(els.canvas, currentText, qrOptions());
    if (logoImg) drawLogo(els.canvas);
    setReady(true);
  } catch {
    setReady(false);
    els.message.textContent = 'El texto es demasiado largo para un QR. Prueba con un enlace más corto.';
  }
}

function download(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

els.dlPng.addEventListener('click', () => {
  els.canvas.toBlob((blob) => blob && download(blob, 'qr.png'), 'image/png');
});

els.dlSvg.addEventListener('click', async () => {
  let svg = await QRCode.toString(currentText, { ...qrOptions(), type: 'svg' });
  if (logoUrl) {
    const n = Number(svg.match(/viewBox="0 0 (\d+)/)[1]);
    const box = n * 0.22;
    const pad = box * 0.12;
    const pos = (n - box) / 2;
    svg = svg.replace(
      '</svg>',
      `<rect x="${pos - pad}" y="${pos - pad}" width="${box + pad * 2}" height="${box + pad * 2}" fill="${els.light.value}"/>` +
      `<image href="${logoUrl}" x="${pos}" y="${pos}" width="${box}" height="${box}"/></svg>`
    );
  }
  download(new Blob([svg], { type: 'image/svg+xml' }), 'qr.svg');
});

els.copy.addEventListener('click', () => {
  els.canvas.toBlob(async (blob) => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      els.message.textContent = 'Imagen copiada.';
    } catch {
      els.message.textContent = 'Tu navegador no permitió copiar. Usa "Descargar PNG".';
    }
  }, 'image/png');
});


let timer;
els.url.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(render, 150);
});
[els.size, els.ecc, els.dark, els.light].forEach((el) => el.addEventListener('input', render));
els.logo = document.getElementById('logo');
els.logo.addEventListener('change', () => {
  const file = els.logo.files[0];
  if (!file) {
    logoImg = null;
    logoUrl = '';
    render();
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      logoImg = img;
      logoUrl = reader.result;
      render();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});
render();
