// Сайт галереи на GitHub Pages: страница _site/index.html из карточек cards/*.json.
// Тексты карточек — ввод участников: всё экранируется, ссылки — только https://.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const link = (u) => (typeof u === 'string' && /^https:\/\/\S+$/.test(u) ? esc(u) : null);

const cards = [];
for (const f of fs.readdirSync(path.join(root, 'cards')).filter((n) => n.endsWith('.json')).sort()) {
  try {
    const c = JSON.parse(fs.readFileSync(path.join(root, 'cards', f), 'utf8'));
    if (c && typeof c === 'object' && typeof c.name === 'string') cards.push({ login: f.slice(0, -5), ...c });
  } catch (e) {
    console.warn(`пропущена ${f}: ${e.message}`);
  }
}
cards.sort((a, b) => a.name.localeCompare(b.name, 'ru'));

const item = (c) => {
  const profile = link(c.profile);
  const project = link(c.project);
  const stack = typeof c.stack === 'string' ? c.stack.split(',').map((s) => s.trim()).filter(Boolean) : [];
  return `    <li class="card">
      <h2>${esc(c.name)}</h2>
      <p class="login">${profile ? `<a href="${profile}">@${esc(c.login)}</a>` : `@${esc(c.login)}`}</p>
      ${project ? `<p><a href="${project}">${esc(c.project.replace(/^https:\/\//, ''))}</a></p>` : ''}
      <p class="stack">${stack.map((s) => `<span>${esc(s)}</span>`).join(' ')}</p>
    </li>`;
};

const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Галерея выпускников · Graduates · Галерея випускників</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 960px; padding: 0 1rem; color: #1f2328; }
    h1 { margin-bottom: .25rem; } .sub { color: #59636e; margin-top: 0; }
    ul { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
    .card { border: 1px solid #d1d9e0; border-radius: 12px; padding: 1rem 1.25rem; }
    .card h2 { margin: 0 0 .25rem; font-size: 1.2rem; } .login { margin: 0 0 .5rem; color: #59636e; }
    .stack span { display: inline-block; background: #ddf4ff; border-radius: 1rem; padding: .1rem .6rem; margin: .1rem 0; font-size: .85rem; }
    a { color: #0969da; }
  </style>
</head>
<body>
  <h1>Галерея выпускников</h1>
  <p class="sub">Graduates gallery · Галерея випускників — ${cards.length} · <a href="https://github.com/${esc(process.env.GITHUB_REPOSITORY || '')}">GitHub</a></p>
  <ul>
${cards.map(item).join('\n')}
  </ul>
</body>
</html>
`;

fs.mkdirSync(path.join(root, '_site'), { recursive: true });
fs.writeFileSync(path.join(root, '_site', 'index.html'), html);
console.log(`карточек: ${cards.length}`);
