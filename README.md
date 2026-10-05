# Бекенд для бронирования авиабилетов (Node.js)

[![hexlet-check](https://github.com/lightlivermorium/middle-nodejs-project-430/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/lightlivermorium/middle-nodejs-project-430/actions)
[![ci](https://github.com/lightlivermorium/middle-nodejs-project-430/actions/workflows/ci.yml/badge.svg)](https://github.com/lightlivermorium/middle-nodejs-project-430/actions/workflows/ci.yml)

Демонстрация: https://middle-nodejs-project-430.onrender.com/

Реализуйте бекенд сервиса бронирования авиабилетов: справочник городов, поиск рейсов,
оформление, просмотр и отмену брони. Код на TypeScript, данные храните в PostgreSQL,
фреймворк выбираете сами.
Фронтенд предоставляет Хекслет — готовое приложение, которое подключается к вашему API
и работает только тогда, когда API отвечает по описанному контракту.

Учебный проект Хекслета: https://ru.hexlet.io/programs/middle-nodejs
Как это должно работать: https://files.hexlet.app/a/5bi6gu

## Стек

- TypeScript
- Fastify
- Kysely

## Установка

```bash
git clone https://github.com/lightlivermorium/middle-nodejs-project-430.git
cd middle-nodejs-project-430
nvm use
docker compose up -d
make install
make build
make start
```

Проверки:

```bash
make lint
make test
```

## Использование

```bash
make start
```

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
