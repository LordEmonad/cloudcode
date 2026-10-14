const params = new URLSearchParams(location.search);
const canvas = document.getElementById('game') as HTMLCanvasElement;

async function start(): Promise<void> {
  const lab = params.get('lab');
  if (lab) {
    document.getElementById('loading')?.remove();
    const { runLab } = await import('./lab');
    await runLab(canvas, lab);
    return;
  }
  const { Game } = await import('./game');
  const game = new Game(canvas);
  await game.init();
}

start().catch((err) => {
  console.error(err);
  const el = document.getElementById('loading');
  if (el) el.innerHTML = `<div class="loading-error">Something broke (not a bone).<br>${String(err?.message ?? err)}</div>`;
});
