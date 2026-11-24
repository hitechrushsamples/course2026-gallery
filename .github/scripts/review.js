// Мейнтейнер галереи: проверяет PR карточки по CONTRIBUTING.md и ставит ревью.
// Нарушено правило — Request changes с замечанием к строке; всё верно — Approve и Squash and merge.
// Запускается из pull_request_target: код из PR не выполняется, файл карточки читается через API как текст.

const MSG = {
  ru: {
    files: (login) => `В PR должен быть ровно один файл — \`cards/${login}.json\`. Чужие карточки и общие файлы — отдельным Issue.`,
    filename: (login, got) => `Файл карточки называется по вашему логину: \`cards/${login}.json\`, а в PR — \`${got}\`.`,
    json: (err) => `JSON карточки не читается: ${err}. Проверьте кавычки и запятые между полями.`,
    object: 'Карточка — один объект JSON в фигурных скобках с полями `name`, `profile`, `project`, `stack`.',
    missing: (f) => `Нет поля \`${f}\` — оно обязательно.`,
    empty: (f) => `Поле \`${f}\` пустое — впишите значение строкой.`,
    url: (f) => `\`${f}\` — адрес полностью, с \`https://\`.`,
    stack: 'stack — технологии через запятую с пробелом, как у других: `"TypeScript, Node.js"`.',
    commits: (n, login) => `В ветке ${n} коммит${n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'а' : 'ов'} — сожмите их в один \`feat: карточка ${login}\`.`,
    message: (got, login) => `Сообщение коммита — \`feat: карточка ${login}\`, а сейчас \`${got}\`.`,
    commitsFix: (n) => `В ветке ${n} коммит${n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'а' : 'ов'} — правку своей карточки сожмите в один коммит \`fix: …\`.`,
    messageFix: (got) => `Правка своей карточки — коммит \`fix: …\` (например, \`fix: поле stack\`), а сейчас \`${got}\`.`,
    closes: 'В описании PR нет `Closes #<номер Issue>` — укажите номер своего Issue «Карточка <логин>».',
    issue: (n) => `Issue #${n} в галерее не найден — укажите в \`Closes #…\` номер своего Issue «Карточка <логин>».`,
    request: (items) => `Сливать пока рано — поправьте, пожалуйста:\n\n${items}\n\nПравку отправьте в ту же ветку — PR обновится сам, и я проверю снова.`,
    approve: 'Карточка по правилам, спасибо за вклад! Сливаю.',
    conflict: 'Карточка по правилам, но PR не сливается: обновите ветку от свежей `main` галереи и отправьте её снова.',
  },
  en: {
    files: (login) => `The PR must contain exactly one file — \`cards/${login}.json\`. Other people's cards and shared files go to a separate Issue.`,
    filename: (login, got) => `The card file is named after your username: \`cards/${login}.json\`, but the PR has \`${got}\`.`,
    json: (err) => `The card JSON can't be read: ${err}. Check the quotes and the commas between the fields.`,
    object: 'A card is one JSON object in curly braces with the fields `name`, `profile`, `project`, `stack`.',
    missing: (f) => `The field \`${f}\` is missing — it is required.`,
    empty: (f) => `The field \`${f}\` is empty — write its value as a string.`,
    url: (f) => `\`${f}\` is a full address starting with \`https://\`.`,
    stack: 'stack — technologies separated by a comma and a space, like the other cards: `"TypeScript, Node.js"`.',
    commits: (n, login) => `The branch has ${n} commits — squash them into one \`feat: card ${login}\`.`,
    message: (got, login) => `The commit message is \`feat: card ${login}\`, but now it is \`${got}\`.`,
    commitsFix: (n) => `The branch has ${n} commits — squash the fix of your card into one commit \`fix: …\`.`,
    messageFix: (got) => `A fix of your own card is a \`fix: …\` commit (for example, \`fix: stack field\`), but now it is \`${got}\`.`,
    closes: 'The PR description has no `Closes #<Issue number>` — add the number of your Issue "Card <username>".',
    issue: (n) => `Issue #${n} isn't found in the gallery — put the number of your Issue "Card <username>" into \`Closes #…\`.`,
    request: (items) => `Not ready to merge yet — please fix:\n\n${items}\n\nPush the fix to the same branch: the PR updates itself, and I'll check it again.`,
    approve: 'The card follows the rules, thank you for your contribution! Merging.',
    conflict: 'The card follows the rules, but the PR can\'t be merged: update the branch from the fresh `main` of the gallery and push it again.',
  },
  ua: {
    files: (login) => `У PR має бути рівно один файл — \`cards/${login}.json\`. Чужі картки й спільні файли — окремим Issue.`,
    filename: (login, got) => `Файл картки називається за вашим логіном: \`cards/${login}.json\`, а в PR — \`${got}\`.`,
    json: (err) => `JSON картки не читається: ${err}. Перевірте лапки й коми між полями.`,
    object: 'Картка — один обʼєкт JSON у фігурних дужках з полями `name`, `profile`, `project`, `stack`.',
    missing: (f) => `Немає поля \`${f}\` — воно обовʼязкове.`,
    empty: (f) => `Поле \`${f}\` порожнє — впишіть значення рядком.`,
    url: (f) => `\`${f}\` — адреса повністю, з \`https://\`.`,
    stack: 'stack — технології через кому з пробілом, як в інших: `"TypeScript, Node.js"`.',
    commits: (n, login) => `У гілці ${n} коміт${n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'и' : 'ів'} — стисніть їх в один \`feat: картка ${login}\`.`,
    message: (got, login) => `Повідомлення коміту — \`feat: картка ${login}\`, а зараз \`${got}\`.`,
    commitsFix: (n) => `У гілці ${n} коміт${n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'и' : 'ів'} — виправлення своєї картки стисніть в один коміт \`fix: …\`.`,
    messageFix: (got) => `Виправлення своєї картки — коміт \`fix: …\` (наприклад, \`fix: поле stack\`), а зараз \`${got}\`.`,
    closes: 'В описі PR немає `Closes #<номер Issue>` — укажіть номер свого Issue «Картка <логін>».',
    issue: (n) => `Issue #${n} у галереї не знайдено — укажіть у \`Closes #…\` номер свого Issue «Картка <логін>».`,
    request: (items) => `Зливати поки зарано — виправте, будь ласка:\n\n${items}\n\nВиправлення надішліть у ту саму гілку — PR оновиться сам, і я перевірю знову.`,
    approve: 'Картка за правилами, дякую за внесок! Зливаю.',
    conflict: 'Картка за правилами, але PR не зливається: оновіть гілку від свіжої `main` галереї й надішліть її знову.',
  },
};

// слово карточки в сообщении коммита — по языку CONTRIBUTING: ru «карточка», en «card», ua «картка»
const CARD_WORD = { ru: 'карточка', en: 'card', ua: 'картка' };
const FIELDS = ['name', 'profile', 'project', 'stack'];
const MARK = '<!-- gallery-review -->';

function language(...texts) {
  const t = texts.join('\n').toLowerCase();
  if (/\bcard\b/.test(t)) return 'en';
  if (/картк|логін|виправ/.test(t)) return 'ua';
  return 'ru';
}

// номер строки, на которой стоит ключ "field" (для замечания к строке), или null
function lineOf(text, field) {
  const lines = text.split('\n');
  const i = lines.findIndex((l) => new RegExp(`"${field}"\\s*:`).test(l));
  return i >= 0 ? i + 1 : null;
}

module.exports = async ({ github, context, core }) => {
  const pr = context.payload.pull_request;
  const { owner, repo } = context.repo;
  const login = pr.user.login;
  core.setOutput('merged', 'false');

  if (pr.state !== 'open' || pr.draft) return core.info('PR закрыт или черновик — пропускаю');
  if (pr.base.ref !== context.payload.repository.default_branch) return core.info('PR не в main — пропускаю');
  if (['OWNER', 'MEMBER', 'COLLABORATOR'].includes(pr.author_association)) return core.info(`PR владельца ${login} — без бота`);

  const files = await github.paginate(github.rest.pulls.listFiles, { owner, repo, pull_number: pr.number, per_page: 100 });
  const commits = await github.paginate(github.rest.pulls.listCommits, { owner, repo, pull_number: pr.number, per_page: 100 });
  const lang = language(pr.title, pr.body || '', ...commits.map((c) => c.commit.message));
  const M = MSG[lang];
  const problems = []; // { text, path?, line? }
  const want = `cards/${login}.json`;

  // 1. Ровно один файл — cards/<логин>.json
  const cardFiles = files.filter((f) => /^cards\/[^/]+\.json$/.test(f.filename));
  let card = null;
  if (files.length !== 1 || cardFiles.length !== 1 || files[0].status === 'removed') {
    problems.push({ text: M.files(login) });
  } else if (files[0].filename.toLowerCase() !== want.toLowerCase()) {
    problems.push({ text: M.filename(login, files[0].filename) });
  } else {
    card = files[0];
  }

  // 2. Карточка читается и в ней нужные поля (файл — из ветки PR через API, как текст)
  if (card) {
    const { data } = await github.rest.repos.getContent({
      owner: pr.head.repo.owner.login, repo: pr.head.repo.name, path: card.filename, ref: pr.head.sha,
    });
    const text = Buffer.from(data.content, 'base64').toString('utf8');
    let obj = null;
    try {
      obj = JSON.parse(text);
    } catch (e) {
      problems.push({ text: M.json(e.message), path: card.filename, line: 1 });
    }
    if (obj !== null && (typeof obj !== 'object' || Array.isArray(obj))) {
      problems.push({ text: M.object, path: card.filename, line: 1 });
    } else if (obj) {
      for (const f of FIELDS) {
        const at = lineOf(text, f);
        if (!(f in obj)) { problems.push({ text: M.missing(f) }); continue; }
        if (typeof obj[f] !== 'string' || !obj[f].trim()) { problems.push({ text: M.empty(f), path: card.filename, line: at }); continue; }
        if ((f === 'profile' || f === 'project') && !/^https:\/\/\S+$/.test(obj[f])) {
          problems.push({ text: M.url(f), path: card.filename, line: at });
        }
        if (f === 'stack' && (/,(?! )/.test(obj[f]) || /[;|]/.test(obj[f]) || /\s,/.test(obj[f]))) {
          problems.push({ text: M.stack, path: card.filename, line: at });
        }
      }
    }
  }

  // 3. Один коммит: новая карточка — feat: карточка <логин>; правка своей карточки (CONTRIBUTING, п. 4) — fix: …
  const fix = !!card && card.status !== 'added';
  const expected = new RegExp(`^feat: (${Object.values(CARD_WORD).join('|')}) ${login}$`, 'i');
  if (commits.length !== 1) {
    problems.push({ text: fix ? M.commitsFix(commits.length) : M.commits(commits.length, login) });
  } else {
    const first = commits[0].commit.message.split('\n')[0].trim();
    if (!(expected.test(first) || (fix && /^fix: \S/.test(first)))) problems.push({ text: fix ? M.messageFix(first) : M.message(first, login) });
  }

  // 4. Closes #N на свой Issue
  const m = (pr.body || '').match(/\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/i);
  if (!m) {
    problems.push({ text: M.closes });
  } else {
    try {
      const { data: issue } = await github.rest.issues.get({ owner, repo, issue_number: Number(m[1]) });
      if (issue.pull_request) problems.push({ text: M.issue(m[1]) });
    } catch (e) {
      problems.push({ text: M.issue(m[1]) });
    }
  }

  // не повторять то же ревью на тот же коммит (событие edited без правок)
  const event = problems.length ? 'REQUEST_CHANGES' : 'APPROVE';
  const items = problems.map((p) => `- ${p.text}`).join('\n');
  const body = `${MARK}\n${problems.length ? M.request(items) : M.approve}`;
  const reviews = await github.paginate(github.rest.pulls.listReviews, { owner, repo, pull_number: pr.number, per_page: 100 });
  const same = reviews.find((r) => r.commit_id === pr.head.sha && r.body === body && r.user.type === 'Bot');
  if (!same) {
    const comments = problems.filter((p) => p.path && p.line).map((p) => ({ path: p.path, line: p.line, side: 'RIGHT', body: p.text }));
    try {
      await github.rest.pulls.createReview({ owner, repo, pull_number: pr.number, commit_id: pr.head.sha, event, body, comments });
    } catch (e) {
      // строка вне diff (правка старой карточки) — замечания только в тексте ревью
      core.warning(`ревью с замечаниями к строкам не прошло: ${e.message}`);
      await github.rest.pulls.createReview({ owner, repo, pull_number: pr.number, commit_id: pr.head.sha, event, body });
    }
  }
  if (problems.length) return core.info(`Request changes: ${problems.length}`);

  // 5. Всё верно — Squash and merge одним коммитом с тем же сообщением: заголовок + (#N), тело коммита студента сохраняется
  // (строка Assisted-by из CONTRIBUTING, «Помощь ИИ», доходит до main), Closes #M — перед блоком трейлеров
  const lines = commits[0].commit.message.split('\n');
  const title = lines[0].trim();
  const closes = `Closes #${m[1]}`;
  const paras = lines.slice(1).join('\n').trim().split(/\n\s*\n/).filter((x) => x.trim());
  const trailer = (para) => para.split('\n').every((l) => /^[A-Za-z][\w-]*: \S/.test(l.trim()));
  const said = new RegExp(`\\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\s+#${m[1]}\\b`, 'i').test(paras.join('\n'));
  if (!said) {
    if (paras.length && trailer(paras[paras.length - 1])) paras.splice(paras.length - 1, 0, closes);
    else paras.push(closes);
  }
  try {
    await github.rest.pulls.merge({
      owner, repo, pull_number: pr.number, merge_method: 'squash', sha: pr.head.sha,
      commit_title: `${title} (#${pr.number})`, commit_message: paras.join('\n\n'),
    });
    core.setOutput('merged', 'true');
    core.info(`слит PR #${pr.number}`);
  } catch (e) {
    core.warning(`не слился: ${e.message}`);
    await github.rest.issues.createComment({ owner, repo, issue_number: pr.number, body: `${MARK}\n${M.conflict}` });
  }
};
