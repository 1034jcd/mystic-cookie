export function downloadFortuneCard(fortune: {
  text: string;
  category: string;
  luckyNumbers: number[];
  weekLabel: string;
}): void {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 340;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, 340);
  gradient.addColorStop(0, "#0a0a0f");
  gradient.addColorStop(1, "#12121a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 340);

  // Subtle grid of dots
  ctx.fillStyle = "rgba(212,175,116,0.05)";
  for (let x = 0; x <= 600; x += 20) {
    for (let y = 0; y <= 340; y += 20) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Top Left "MYSTIC COOKIE"
  ctx.fillStyle = "#d4af74";
  ctx.font = "13px Courier New, monospace";
  ctx.textAlign = "left";
  ctx.fillText("MYSTIC COOKIE", 24, 30);

  // Top Right weekLabel
  ctx.fillStyle = "#8a8a93"; // muted
  ctx.font = "12px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(fortune.weekLabel, 576, 30);

  // Center vertical fortune text
  ctx.fillStyle = "#d4af74";
  ctx.font = "italic 18px Georgia, serif";
  ctx.textAlign = "center";
  
  const words = fortune.text.split(" ");
  let line = "";
  let lines: string[] = [];
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 520 && n > 0) {
      lines.push(line);
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  const startY = 170 - (lines.length * 24) / 2 - 20;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i].trim(), 300, startY + i * 24);
  }

  // Lucky numbers
  const lnY = startY + lines.length * 24 + 20;
  const spacing = 45;
  const startX = 300 - ((fortune.luckyNumbers.length - 1) * spacing) / 2;
  
  for (let i = 0; i < fortune.luckyNumbers.length; i++) {
    const x = startX + i * spacing;
    ctx.beginPath();
    ctx.arc(x, lnY, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#00d4a8";
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fortune.luckyNumbers[i].toString(), x, lnY);
    ctx.textBaseline = "alphabetic"; // reset
  }

  // Bottom Category
  ctx.fillStyle = "#8a8a93";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(fortune.category, 24, 316);

  // Bottom Right "mystic-cookie.app"
  ctx.fillStyle = "#d4af74";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("mystic-cookie.app", 576, 316);

  // 1px gold border (inset 8px, opacity 30%)
  ctx.strokeStyle = "rgba(212,175,116,0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, 600 - 16, 340 - 16);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mystic-prophecy-week-${fortune.weekLabel.replace(/\\s+/g, '-').toLowerCase()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}