# Как добавить свою карточку

1. Откройте Issue «Карточка <логин>» по шаблону.
2. Сделайте форк, ветку `card-<логин>` от свежей `main`.
3. Файл `cards/<логин>.json`: поля `name`, `profile`, `project` — адреса полностью, с `https://`; `stack` — технологии через запятую с пробелом.
4. Один коммит с сообщением `feat: карточка <логин>`; исправления — `fix: …`.
5. Pull Request в `main` галереи, в описании — `Closes #<номер Issue>`.

Правьте только свой файл: чужие карточки и общие файлы — отдельным Issue.

## Помощь ИИ

Агента можно. В описании PR — что делал ИИ и что вы проверили сами; в коммите — строка `Assisted-by: <агент> (<что делал>)`. Отвечайте на ревью сами.

---

# How to add your card (English)

1. Open an Issue "Card <username>" using the template.
2. Fork the gallery and create the branch `card-<username>` from a fresh `main`.
3. The file `cards/<username>.json`: the fields `name`, `profile`, `project` — `profile` and `project` are full addresses starting with `https://`; `stack` — technologies separated by a comma and a space.
4. One commit with the message `feat: card <username>`; fixes — `fix: …`.
5. A Pull Request to the gallery's `main`, with `Closes #<Issue number>` in the description.

Edit only your own file: other people's cards and shared files — a separate Issue.

## AI help

An agent is fine. In the PR description, say what the AI did and what you checked yourself; in the commit, add the line `Assisted-by: <agent> (<what it did>)`. Answer the review yourself.

---

# Як додати свою картку (українською)

1. Відкрийте Issue «Картка <логін>» за шаблоном.
2. Зробіть форк, гілку `card-<логін>` від свіжої `main`.
3. Файл `cards/<логін>.json`: поля `name`, `profile`, `project` — `profile` і `project` адресами повністю, з `https://`; `stack` — технології через кому з пробілом.
4. Один коміт із повідомленням `feat: картка <логін>`; виправлення — `fix: …`.
5. Pull Request у `main` галереї, в описі — `Closes #<номер Issue>`.

Правте тільки свій файл: чужі картки й спільні файли — окремим Issue.

## Допомога ШІ

Агента можна. В описі PR — що робив ШІ і що ви перевірили самі; у коміті — рядок `Assisted-by: <агент> (<що робив>)`. Відповідайте на ревʼю самі.
