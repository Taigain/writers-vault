# Writer's Vault

**Локальный кабинет писателя для Windows.** Книги, главы с форматированием, персонажи, мир, локации, таймлайн и облако связей. Все данные хранятся только на вашем компьютере — ничего не уходит в облако.

**A local-first writing cabinet for Windows.** Books, formatted chapters, characters, world lore, locations, timeline and a relationship cloud. All data stays on your machine — nothing is uploaded.

---

## Возможности / Features

- Главы с форматированием: жирный, курсив, размер шрифта, выравнивание; счётчики слов и знаков
- Акты: группируйте главы в структуры «Пролог — Акт I — Акт II — Эпилог»
- Серии и циклы: объединяйте книги в серии на главной странице
- Автоматические связи: персонажи `[@Имя]`, события `[#Название]`
- Персонажи с ролями и отношениями, записи о мире с хэштегами, локации с изображениями
- Таймлайн: календарное и книжное время, визуальная лента записок
- Облако связей: сюжет / персонажи / события, зум и полноэкранный режим
- Поиск по тексту книги с подсветкой и переходом к главе
- Экспорт книги в DOCX с сохранением форматирования и актов
- Интерфейсы RU/EN, светлая и тёмная темы, настройка шрифтов
- Справка и FAQ внутри приложения: раздел «Помощь»

- Chapters with rich formatting: bold, italic, font size, alignment; word & character counters
- Acts: group chapters into structures like "Prologue — Act I — Act II — Epilogue"
- Series & cycles: group books into series on the home page
- Automatic links: characters `[@Name]`, events `[#Title]`
- Characters with roles and relationships, hashtagged world lore, locations with images
- Timeline: calendar time and in-book time, visual note feed
- Relationship cloud: plot / characters / events modes, zoom and fullscreen
- In-book search with highlighting and one-click jump to chapter
- DOCX export preserving formatting and acts
- RU/EN interfaces, light & dark themes, font settings
- Built-in help: see the "Help" section inside the app

## Системные требования / System requirements

- Windows 10 / 11 (64-bit)
- ~350 МБ свободного места / ~350 MB free space
- Интернет не требуется после установки / No internet needed after installation

## Установка / Installation

1. Скачайте `Writer's Vault Setup X.X.X.exe` со страницы Releases.
2. Запустите установщик и следуйте инструкциям. При появлении запроса SmartScreen нажмите «Подробнее» → «Выполнить» (приложение не подписано коммерческим сертификатом).
3. Запустите ярлык на рабочем столе. База данных создастся автоматически при первом запуске.

1. Download `Writer's Vault Setup X.X.X.exe` from the Releases page.
2. Run the installer and follow the prompts. If SmartScreen appears, click "More info" → "Run" (the app is not commercially signed).
3. Launch the desktop shortcut. The database is created automatically on first run.

## Быстрый старт / Quick start

1. Главная → «Создать книгу»: название и обложка.
2. Раздел «Главы» → «Добавить главу»; при необходимости создайте акты и распределите главы по актам.
3. Пишите текст; панель инструментов ставит форматирование и метки связей за вас.
4. Персонажи, мир, локации, таймлайн и связи пополняются из упоминаний в главах автоматически.
5. «Экспорт в DOCX» — готовый документ книги с актами и форматированием.

1. Home → "Create book": title and cover.
2. Chapters → "Add chapter"; create acts if needed and assign chapters to acts.
3. Write; the toolbar applies formatting and link markers for you.
4. Characters, lore, locations, timeline and links grow automatically from mentions in chapters.
5. "Export to DOCX" — a ready book document with acts and formatting.

## Команды разметки / Markup commands

| Команда / Command | Результат / Result |
|---|---|
| `**текст / text**` | полужирный / bold |
| `*текст / text*` | курсив / italic |
| `[size=24]текст / text[/size]` | размер шрифта / font size |
| `[center]`, `[right]`, `[left]` | выравнивание абзаца / paragraph alignment |
| `[@Имя / Name]` | связь с персонажем / character link |
| `[#Название / Title]` | связь с событием / event link |

Кнопки панели инструментов вставляют и снимают эти метки с выделенного текста. Полное описание — в разделе «Помощь» внутри приложения.
Toolbar buttons add and remove these markers on selected text. Full guide — in the "Help" section inside the app.

## Данные и резервные копии / Data & backups

База книг: `%APPDATA%\writer-app\dev.db` (вставьте путь в адресную строку проводника).
Резервная копия или перенос на другой ПК: скопируйте этот файл и положите по тому же пути при установленном приложении.
Book database: `%APPDATA%\writer-app\dev.db` (paste the path into Explorer's address bar).
Backup or transfer: copy this file and place it at the same path on a machine with the app installed.

## Обновление / Updating

Устанавливайте новую версию поверх старой — книги, черновики и настройки сохраняются, база мигрирует автоматически.
Install the new version over the old one — books, drafts and settings are kept; the database migrates automatically.

## Поддержка / Support

Кнопка поддержки автора — в приложении: Настройки → О программе.
Вопросы и предложения: taigadevelop@ya.ru
Support the author — in the app: Settings → About.
Questions and suggestions: taigadevelop@ya.ru

## Автор / Author

Taiga Develop · taigadevelop@ya.ru