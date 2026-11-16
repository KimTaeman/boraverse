export function wrapPostcard(text: string, measure: (text: string) => number, width: number) {
  const lines: string[] = []; let line = "";
  for (const char of text.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n")) {
    if (char === "\n") { lines.push(line.trimEnd()); line = ""; continue; }
    if (line && measure(line + char) > width) { lines.push(line.trimEnd()); line = char.trimStart(); }
    else line += char;
  }
  if (line) lines.push(line.trimEnd());
  return lines;
}
export function drawPostcard(ctx: CanvasRenderingContext2D, title: string, text: string) {
  ctx.fillStyle = "#241833"; ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = "#fff5e9"; ctx.fillRect(70, 260, 940, 1390);
  ctx.textAlign = "center"; ctx.fillStyle = "#dec9ef"; ctx.font = "34px Georgia";
  ctx.fillText("The Little Boraverse", 540, 170);
  ctx.fillStyle = "#30213d"; ctx.font = "58px Georgia"; ctx.fillText(title, 540, 380, 830);
  let lines: string[] = [], font = 40;
  for (; font >= 18; font -= 2) {
    ctx.font = `${font}px Georgia`;
    lines = wrapPostcard(text, value => ctx.measureText(value).width, 810);
    if (lines.length * font * 1.55 <= 1100) break;
  }
  if (font < 18) throw new Error("Text does not fit this image");
  ctx.textAlign = "left";
  for (const [index, line] of lines.entries()) ctx.fillText(line, 135, 500 + index * font * 1.55);
  ctx.textAlign = "center"; ctx.fillStyle = "#fff5e9"; ctx.font = "28px sans-serif";
  ctx.fillText("Unofficial ARMY-made keepsake · Bangkok 2026", 540, 1790);
}
