// iPhone Duo 内屏横屏截图尺寸（App Store Connect 截图规范）
const W = 2853;
const H = 2007;
const FOLD = 14; // 中缝宽度
const STRIP = 210; // 右侧竖排状态栏/工具栏宽度（参照 HIG Notes 示意图）
const BTN = 124; // 工具栏按钮直径
// iPhone 截图顶部状态栏占高比例（灵动岛机型 59pt/852pt），被右侧竖排状态栏取代
const STATUS_RATIO = 0.069;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = reject;
    img.src = url;
  });
}

// 窗格 [x, x+w)：背景保持黑色，截图按高度铺满并在 [x, x+w-inset) 内居中
function drawPane(ctx, img, x, w, inset = 0) {
  const crop = img.height / img.width > 2 ? img.height * STATUS_RATIO : 0;
  const sh = img.height - crop;
  const s = H / sh;
  const dw = img.width * s;
  ctx.drawImage(img, 0, crop, img.width, sh, x + (w - inset - dw) / 2, 0, dw, H);
}

// ---- 图标（均以 (0,0) 为中心，尺寸约 ±28） ----
const ICONS = {
  expand(c) {
    c.beginPath();
    c.moveTo(-22, -22); c.lineTo(22, 22);
    c.moveTo(-22, -22); c.lineTo(-22, -6); c.moveTo(-22, -22); c.lineTo(-6, -22);
    c.moveTo(22, 22); c.lineTo(22, 6); c.moveTo(22, 22); c.lineTo(6, 22);
    c.stroke();
  },
  share(c) {
    c.beginPath();
    c.moveTo(0, 8); c.lineTo(0, -26);
    c.moveTo(-12, -14); c.lineTo(0, -26); c.lineTo(12, -14);
    c.moveTo(-12, -4); c.lineTo(-24, -4); c.lineTo(-24, 26); c.lineTo(24, 26); c.lineTo(24, -4); c.lineTo(12, -4);
    c.stroke();
  },
  more(c) {
    for (const dx of [-18, 0, 18]) {
      c.beginPath();
      c.arc(dx, 0, 4.5, 0, Math.PI * 2);
      c.fill();
    }
  },
  list(c) {
    c.beginPath();
    c.arc(-16, -13, 7, 0, Math.PI * 2); c.fill();
    c.beginPath();
    c.arc(-16, 13, 7, 0, Math.PI * 2); c.stroke();
    c.beginPath();
    c.moveTo(0, -13); c.lineTo(24, -13);
    c.moveTo(0, 13); c.lineTo(24, 13);
    c.stroke();
  },
  clip(c) {
    c.save();
    c.rotate(Math.PI / 4);
    c.beginPath();
    c.roundRect(-10, -26, 20, 52, 10);
    c.stroke();
    c.beginPath();
    c.moveTo(0, -12); c.lineTo(0, 14);
    c.stroke();
    c.restore();
  },
  markup(c) {
    c.beginPath();
    c.arc(0, 0, 25, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.moveTo(-9, 12); c.lineTo(0, -14); c.lineTo(9, 12);
    c.moveTo(-5, 4); c.lineTo(5, 4);
    c.stroke();
  },
  compose(c) {
    c.beginPath();
    c.moveTo(14, -24); c.lineTo(-14, -24); c.quadraticCurveTo(-26, -24, -26, -12);
    c.lineTo(-26, 14); c.quadraticCurveTo(-26, 26, -14, 26); c.lineTo(14, 26);
    c.quadraticCurveTo(26, 26, 26, 14); c.lineTo(26, 4);
    c.stroke();
    c.beginPath();
    c.moveTo(-6, 8); c.lineTo(-2, -6); c.lineTo(22, -30); c.lineTo(30, -22); c.lineTo(6, 2); c.closePath();
    c.stroke();
  },
};

function circle(c, x, y, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.arc(x, y, BTN / 2, 0, Math.PI * 2);
  c.fill();
}

function pill(c, x, y, h, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.roundRect(x - BTN / 2, y, BTN, h, BTN / 2);
  c.fill();
}

// 右侧竖排状态栏 + 工具栏：时间、状态指示环、顶部按钮组、底部按钮组
function drawStrip(ctx, dark) {
  const ink = dark ? "#fff" : "#111";
  const glass = dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.055)";
  const cx = W - STRIP / 2 - 6;
  ctx.save();
  ctx.lineWidth = 5.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;

  // 时间
  ctx.font = '700 46px -apple-system, "SF Pro", Helvetica, Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("9:41", cx, 78);

  // 状态指示环：Wi-Fi 图标，下方为电量点
  ctx.beginPath();
  ctx.arc(cx, 190, 42, Math.PI * 0.62, Math.PI * 2.38);
  ctx.stroke();
  ctx.save();
  ctx.translate(cx, 192);
  ctx.lineWidth = 4.5;
  for (const r of [10, 20, 30]) {
    ctx.beginPath();
    ctx.arc(0, 12, r, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 12, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(cx + i * 12, 246, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const icon = (name, y) => {
    ctx.save();
    ctx.translate(cx, y);
    ctx.fillStyle = ink;
    ICONS[name](ctx);
    ctx.restore();
  };

  // 顶部：圆形按钮 + 双图标按钮组
  const y1 = 360;
  circle(ctx, cx, y1, glass);
  icon("expand", y1);
  const pillTop = y1 + BTN / 2 + 32;
  pill(ctx, cx, pillTop, BTN * 2, glass);
  icon("share", pillTop + BTN / 2);
  icon("more", pillTop + BTN * 1.5);

  // 底部：三图标按钮组 + 圆形按钮
  const yb = H - 130;
  circle(ctx, cx, yb, glass);
  icon("compose", yb);
  const pill3 = BTN * 3;
  const pill3Top = yb - BTN / 2 - 32 - pill3;
  pill(ctx, cx, pill3Top, pill3, glass);
  icon("list", pill3Top + BTN / 2);
  icon("clip", pill3Top + BTN * 1.5);
  icon("markup", pill3Top + BTN * 2.5);

  ctx.restore();
}

export async function compose(files) {
  const loaded = await Promise.all(files.map(loadImage));
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  if (loaded.length === 1) {
    drawPane(ctx, loaded[0].img, 0, W, STRIP);
  } else {
    const pw = (W - FOLD) / 2;
    drawPane(ctx, loaded[0].img, 0, pw);
    drawPane(ctx, loaded[1].img, pw + FOLD, pw, STRIP);
  }

  drawStrip(ctx, true);

  loaded.forEach((l) => URL.revokeObjectURL(l.url));
  return canvas;
}
