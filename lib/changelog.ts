export type ChangeEntry = {
  version: string
  date: string
  ru: string[]
  en: string[]
}

export const CHANGELOG: ChangeEntry[] = [ 
  {
    version: '1.6.1',
    date: '10.10.2026',
    ru: [
      'Словарь полностью переработан: видимые ошибки при пустых полях, мгновенный поиск, счётчики использований маркеров [~ключ] по главам и инлайн-редактирование без модалок',
      'Языковые зоны: выделите речь в [lng]…[/lng] — в предпросмотре, чтении и экспорте слова внутри автоматически заменяются на термины словаря с сохранением регистра',
      'Подготовлена основа премиум-функции: группы словарей с именованными зонами ([lang:эльфийский]…[/lang]) для нескольких языков в одной книге',
    ],
    en: [
      'Dictionary fully reworked: visible errors on empty fields, instant search, usage counters of [~key] marks across chapters, and inline editing without modals',
      'Language zones: wrap speech in [lng]…[/lng] — in preview, reading and export, the words inside automatically become dictionary terms with case preserved',
      'Foundation for a premium feature laid: dictionary groups with named zones ([lang:Elvish]…[/lang]) for several languages in one book',
    ],
  }, 
  {
    version: '1.6.0',
    date: '09.10.2026',
    ru: [
      'Выбор языка при первом запуске: полноэкранный гейт с двумя плитками до интерфейса; выбор запоминается и меняется в настройках',
      'Анимированный экран запуска: логотип, «печатающееся» имя и чернильная роспись с пульсом ожидания вместо технической заглушки',
      'Книжная полка на «Моих книгах»: корешки с толщиной по объёму, цветом по палитре или статусу, значком статуса и орнаментом стиля; виды и сортировка; окно создания книги с живым предпросмотром, жанрами, серией (существующей или новой) и палитрой цветов',
      'Доска идей на главной: липкие заметки с созданием через попап, восемью цветами бумаги, авто-высотой по тексту, булавками и перетаскиванием',
      'Нижняя панель разделов книги и автосворачивание сайдбара в рейку при уходе с паспорта книги (отключается в настройках)',
      'Настройки в едином стиле: группы строк с подсказками; выпадающие списки шрифтов показывают каждый шрифт его собственным начертанием',
      'Надёжность обновлений: приложение само достраивает схему базы при старте — новые поля книг и таблица заметок появляются на любых старых базах без ручных действий',
    ],
    en: [
      'Language choice on first launch: a fullscreen gate with two tiles before the interface; the choice is remembered and changeable in settings',
      'Animated startup screen: logo, a "typing" name and an ink signature with a waiting pulse instead of the technical placeholder',
      'Book shelf on "My Books": spines with volume-based thickness, palette or status color, status icon and style ornament; views and sorting; the creation window with live preview, genres, series (existing or new) and a color palette',
      'Idea board on the home page: sticky notes created via a popup, eight paper colors, auto-height by text, pins and dragging',
      'Bottom section bar on book pages and sidebar auto-collapse to the rail when leaving the book passport (disableable in settings)',
      'Settings in a unified style: grouped rows with hints; font dropdowns render every font in its own typeface',
      'Update reliability: the app extends the database schema on startup — new book columns and the notes table appear on any old database without manual steps',
    ],
  },
  {
    version: '1.5.5',
    date: '07.10.2026',
    ru: [
      'Сворачивание сайдбара в рейку 60 px: кнопка-стрелка, аватарки книг с тултипами, иконки настроек и помощи; состояние запоминается, рабочая область расширяется синхронно с шириной полотна страницы',
      'Динамические мозаичные сетки в «Локациях», «Мире» и «Персонажах»: карточки естественной высоты, две колонки, три при свёрнутой панели и одна на узких окнах; в карточке локации изображение стало одиночным',
      'Док справок справа от редактора: клик по имени или метке события в предпросмотре закрепляет карточку; у персонажа редактируемые описание, решения и арка с автосохранением, у события дата и описание',
      'Карточки дока переставляются перетаскиванием за ручку, закрываются крестиком и ведут в свой раздел; zen-режим док скрывает',
    ],
    en: [
      'Sidebar collapses to a 60 px rail: arrow toggle, book avatars with tooltips, settings and help icons; the state is remembered and the working area grows together with the page canvas width',
      'Dynamic masonry grids in Locations, World and Characters: natural-height cards, two columns, three with the collapsed panel and one on narrow windows; the location card now shows a single image',
      'Reference dock to the right of the editor: clicking a name or an event mark in the preview pins a card; characters offer editable description, decisions and arc with autosave, events show date and description',
      'Dock cards reorder by dragging their grip handle, close with the cross and link to their section; zen mode hides the dock',
    ],
  },
  {
    version: '1.5.4',
    date: '06.10.2026',
    ru: [
      'Надёжность запуска: увеличен запас ожидания локального сервера после обновления — приложение доживает холодный старт и антивирусное сканирование первого запуска вместо экрана ошибки',
      'Грамматический слой линтера: повторы слов подряд («решил решил»), разрывы слитных форм пробелом («по чувствовал») и дефисом («по-смотреть», «об-катать») с автоправкой; словарь и пунктуационная панель работают как прежде',
      'Карточка персонажа стала вкладочной: Анкета, Связи, Упоминания (компактные строки с заметками состояния и постраничным показом), Сцены и присутствие, Облако связей — высота страницы больше не растёт от объёма книги',
      'Облако связей персонажа: звезда вокруг героя с подписями на линиях (заметка отношения, тип связи, вес ×N), перетаскивание узлов мышью с запоминанием раскладки и кнопкой сброса, клик по узлу открывает карточку соседа',
    ],
    en: [
      'Startup reliability: the wait budget for the local server after an update is increased — the app survives cold start and first-run antivirus scanning instead of showing the failure screen',
      'Grammar layer of the linter: back-to-back word repeats ("решил решил"), split joined forms with a space ("по чувствовал") and with a hyphen ("по-смотреть", "об-катать"), all with auto-fix; the dictionary and the punctuation panel work as before',
      'The character card is now tabbed: Profile, Relations, Mentions (compact rows with state notes and paged display), Scenes & presence, Relations cloud — page height no longer grows with the book',
      'Per-character relations cloud: a star around the hero with labels on the lines (relation note, connection type, weight ×N), mouse-draggable nodes with a remembered layout and a reset button, clicking a node opens that character card',
    ],
  },
  {
    version: '1.5.3',
    date: '05.10.2026',
    ru: [
      'Типографское тире: двойной дефис -- в тексте глав и сцен заменяется в предпросмотре, режиме чтения и DOCX на тире из настроек (– среднее или — длинное); одиночный дефис остаётся собой',
      'Поглавный экспорт: кнопка в панели редактора сохраняет DOCX только текущей главы (название + текст), имя файла берётся из заголовка главы',
      'Статистика книги: раскрывающийся блок на паспорте — главы, сцены, слова, знаки, авторские листы и книжные страницы со сносками о стандартах, а также счётчики персонажей, локаций и записей о мире',
      'Версия приложения продублирована внизу сайдбара: установленный релиз виден без открытия настроек',
    ],
    en: [
      'Typographic dash: a double hyphen -- in chapter and scene text is replaced in preview, reading mode and DOCX with the dash chosen in settings (– en dash or — em dash); a single hyphen stays a hyphen',
      'Per-chapter export: a toolbar button in the editor saves a DOCX of the current chapter only (title + text), named after the chapter heading',
      'Book statistics: a collapsible block on the passport — chapters, scenes, words, characters, author sheets and book pages with footnotes about the standards, plus counts of characters, locations and world entries',
      'The app version is duplicated at the bottom of the sidebar: the installed release is visible without opening settings',
    ],
  },
  {
    version: '1.5.2',
    date: '02.10.2026',
    ru: [
      'Защита от несохранённых изменений: перед переходом между разделами, закрытием вкладки в веб-версии и закрытием окна в десктопной приложение спрашивает «Сохранить изменения?»; «Сохранить и перейти» сохраняет текст глав и отправляет грязные формы, затем переходит',
      'Кнопки маркеров стали тумблерами: повторное нажатие сцены, цвета или события на том же выделении снимает метки вместо наслоения; сцены не могут пересекаться — приложение предупреждает собственным диалогом «Предупреждение» вместо системного окна',
      'Вложенные подсветки разных цветов рисуются непрерывно: внутренний фрагмент своим цветом, внешний после него продолжается до своего закрытия',
      'Установщик стал мастером с выбором папки установки для новых установок; уже установленные копии обновляются на месте, удаление приложения не трогает книги',
    ],
    en: [
      'Unsaved-changes protection: before switching sections, closing a web tab or closing the desktop window the app asks "Save changes?"; "Save and continue" saves chapter text and submits dirty forms, then navigates',
      'Marker buttons became toggles: pressing scene, color or event again on the same selection removes the markers instead of stacking; scenes cannot overlap — the app warns with its own "Warning" dialog instead of a system box',
      'Nested highlights of different colors render continuously: the inner fragment glows in its color and the outer one resumes after it until its closing marker',
      'The installer is now a wizard with an installation folder choice for fresh installs; existing copies update in place, and uninstalling never touches books',
    ],
  },
  {
    version: '1.5.1',
    date: '02.10.2026',
    ru: [
      'Технический выпуск вместо отозванной 1.5.0: автообновление переведено на полные пакеты без дельт, кэш рендерера сбрасывается при смене версии — разделы книг после обновления больше не отдают 404',
      'Окно «Что нового» в десктопной версии хранит просмотренную версию в данных приложения, а не в localStorage, и показывается после обновления стабильно',
    ],
    en: [
      'Technical release replacing the withdrawn 1.5.0: auto-update switched to full packages without deltas, renderer cache resets on version change — book sections no longer 404 after an update',
      'The "What\'s new" window in the desktop build stores the seen version in app data instead of localStorage and reliably appears after updates',
    ],
  },
  {
    version: '1.5.0',
    date: '02.10.2026',
    ru: [
      'Сцены: парные метки [sc:]…[/sc] с явными началом и концом, вкладка «Сцены» рядом с «Сюжетом» с карточками: текст сцены редактируется синхронно с главой, чипы персонажей, переход к месту в тексте, полный предпросмотр как в редакторе',
      'Цветовые метки ключевых моментов [hl=N]…[/hl]: шесть цветов в редакторе и карточках сцен, подсветка в предпросмотре и режиме чтения, в экспорт метки не попадают',
      'Карточка персонажа: поштучные строки упоминаний с контекстом и полем состояния (заметки переживают правки глав), список сцен персонажа с переходом, тепловая карта с двумя статистиками — присутствие в главах и в сценах, построчно по всем главам',
      'Раздел «Мир»: режим «Облако» — облако тегов с размером и жирностью по числу записей и цветом из палитры, записки по клику на тег, модальное окно редактирования записи',
      'Сайдбар вернул брендовый блок: логотип в светлом круге, название и подзаголовок, подпись о локальном хранении внизу',
    ],
    en: [
      'Scenes: pair markers [sc:]…[/sc] with explicit start and end, a "Scenes" tab next to "Plot" with cards: scene text editable in sync with the chapter, character chips, jump to the place in text, the same rich preview as the editor',
      'Color highlights of key moments [hl=N]…[/hl]: six colors in the editor and scene cards, glow in preview and reading mode, stripped in export',
      'Character card: per-occurrence mention rows with context and a state note (notes survive chapter edits), the character\'s scene list with jumps, a two-stat heat map — presence in chapters and in scenes, row per chapter',
      'The World section gains a "Cloud" mode: a tag cloud sized and weighted by entry count and colored by the palette, notes on tag click, a modal window for entry editing',
      'The sidebar brand block is back: logo in a light circle, name and tagline, local-storage footnote at the bottom',
    ],
  },
  {
    version: '1.4.0',
    date: '28.09.2026',
    ru: [
      'Облако связей стало кластерным: острова-сообщества с пунктирными контурами и подписями, изоляция кластера кликом, легенда кластеров; палитры в настройках (тёплая, дальтоник-безопасная, моно-контрастная) перекрашивают облако и карту сюжета одинаково',
      'События стали якорями: метка [#…] ставится по выделению с авто-подчёркиваниями, неизвестное событие создаётся из редактора в один клик с пустыми датами и авто-главой, чипы глав в таймлайне открывают текст ровно на месте метки, приложение подсвечивает конфликты книжных дат и порядка глав',
      'Пунктуационный линтер в редакторе: список проблем с переходом и точечными или массовыми автоправками; стили кавычек (ёлочки, лапки, английские) в настройках и кнопка нормализации пар кавычек',
      'Экспорт DOCX по методике Word: каждый абзац автора — абзац документа с интервалом после 8 пт; подчёркивания меток событий в текст не попадают',
      'Режим чтения открывается полноэкранным, с закреплённой шапкой и загрузкой глав по требованию',
    ],
    en: [
      'The relationship cloud is now clustered: community islands with dashed hulls and labels, click-to-isolate, cluster legend; settings palettes (warm, color-blind safe, mono contrast) recolor the cloud and the story map consistently',
      'Events became anchors: the [#…] marker wraps a selection with auto-underscores, an unknown event is created from the editor in one click with empty dates and an auto-chapter, timeline chapter chips open the text exactly at the mark, and the app flags conflicts between book dates and chapter order',
      'Punctuation linter in the editor: an issue list with jump and single or bulk auto-fixes; quote styles (guillemets, laps, English) in settings with a pair-normalization button',
      'DOCX export follows the Word methodology: every author paragraph is a document paragraph with 8 pt after; underscores from event markers never reach the text',
      'Reading mode opens fullscreen with a pinned header and on-demand chapter loading',
    ],
  },
  {
    version: '1.3.5',
    date: '27.09.2026',
    ru: [
      'Технический перевыпуск отозванной 1.3.4: исправлен крах запуска приложения (дубликат объявления модуля в главном процессе); данные книг не затрагивались',
    ],
    en: [
      'Technical re-release of the withdrawn 1.3.4: fixed app launch crash (duplicate module declaration in the main process); book data was never affected',
    ],
  },
    {
    version: '1.3.4',
    date: '27.09.2026',
    ru: [
      'После обновления при первом запуске открывается окно «Что нового» со списком изменений с вашей прошлой версии; полная история обновлений — в «Настройки → О программе → Лог обновлений»',
      'Скачивание изображений: кнопка в полноэкранном просмотре любой картинки и рядом с обложкой на паспорте книги; файл сохраняется под именем сущности',
      'Проверка орфографии в редакторе: подчёркивания ошибок, варианты исправления по правому клику, «Добавить в словарь» с запоминанием между запусками',
      'Заметное ускорение на больших книгах: обложки один раз нормализуются, страницы и обновления не тянут лишний вес',
      'Справка обновлена целиком: все разделы версий 1.3.x в FAQ, включая словарь мира, сюжет с картой, заметки, группы книг и импорт',
    ],
    en: [
      'After an update, the first launch opens a "What\'s new" window listing changes since your previous version; the full update history lives in Settings → About → Changelog',
      'Image download: a button in the fullscreen view of any image and next to the cover on the book passport; the file is saved under the entity name',
      'Spell checking in the editor: misspell underlines, fix suggestions on right-click, "Add to dictionary" persisted across launches',
      'Noticeable speedup on large books: covers are normalized once, pages and refreshes no longer carry extra weight',
      'Help fully refreshed: all 1.3.x sections in the FAQ, including the world dictionary, plot map, notes, book groups and import',
    ],
  },
  {
    version: '1.3.3',
    date: '25.09.2026',
    ru: [
      'Словарь мира: пары «слово книги ↔ черновое слово», формы слов и метки [~ключ] кнопкой с иконкой языков; подстановка в предпросмотре, режиме чтения и экспорте DOCX с переносом регистра',
      'Сюжет: пересечения линий через общие биты («также в: …»), привязка существующих битов, карта с нитями персонажей и событий, панорама, зум и полный экран',
      'Кнопки меток [@…], [#…], [~…] стали переключателями: повторное нажатие снимает метку',
      'Безопасная миграция таблицы битов: обновление со старых версий больше не требует ручных действий и не теряет данные',
    ],
    en: [
      'World dictionary: "book word ↔ draft word" pairs, word forms, [~key] marker via the languages-icon button; substitution in preview, reading mode and DOCX export with case transfer',
      'Plot: line intersections via shared beats ("also in: …"), linking existing beats, map with character and event threads, pan, zoom and fullscreen',
      'The [@…], [#…], [~…] toolbar buttons are toggles: pressing again removes the marker',
      'Safe beats-table migration: updates from older versions no longer require manual steps and lose no data',
    ],
  },
  {
    version: '1.3.2',
    date: '25.09.2026',
    ru: ['Первая публикация словаря и пересечений сюжетных линий (заменена исправленной 1.3.3)'],
    en: ['First release of the dictionary and storyline intersections (superseded by 1.3.3)'],
  },
  {
    version: '1.3.1',
    date: '24.09.2026',
    ru: [
      'Заметки: рабочий журнал книги — типы, чекбокс «Готово», изображения; виды «список» и «доска» со свободным перетаскиванием карточек',
      'Сюжетные линии и биты со связями с главами и событиями таймлайна',
      'Три группы книг («Задумки», «В работе», «Архив») на главной и трёхуровневый сайдбар, архив серии одной кнопкой',
      'Импорт DOCX: новая книга с разбивкой на главы по H1/H2 и обложкой с первой страницы; дозагрузка глав в существующую книгу',
    ],
    en: [
      'Notes: the book working journal — types, a Done checkbox, images; list and board views with free card dragging',
      'Storylines and beats linked to chapters and timeline events',
      'Three book groups (Ideas, In progress, Archive) on the home page and a three-level sidebar, series archiving with one button',
      'DOCX import: a new book split by H1/H2 headings with the cover from the first page; appending chapters to an existing book',
    ],
  },
  {
    version: '1.3.0',
    date: '23.09.2026',
    ru: [
      'Режим чтения книги на весь экран с навигацией по главам и стрелками',
      'Счётчик слов и знаков выделения в редакторе',
      'Тумблер титульного блока в экспорте DOCX (настройка каждой книги)',
      'Сворачиваемые группы серий и блок «Без серии» на главной',
    ],
    en: [
      'Fullscreen reading mode with chapter navigation and arrows',
      'Selection word and character counters in the editor',
      'Title-block toggle for DOCX export (per-book setting)',
      'Collapsible series groups and the "Standalone" block on the home page',
    ],
  },
  {
    version: '1.2.0',
    date: '10.09.2026',
    ru: [
      'Акты и произвольная структура книги (перемещение актов блоками)',
      'Дзен-режим редактора и поиск по книге с переходом к совпадениям',
      'Автообновление приложения через GitHub Releases',
    ],
    en: [
      'Acts and free book structure (moving acts as blocks)',
      'Editor zen mode and book-wide search with match navigation',
      'App auto-update via GitHub Releases',
    ],
  },
]

export function cmpVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0)
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0
    const db = pb[i] ?? 0
    if (da !== db) return da < db ? -1 : 1
  }
  return 0
}

export function entriesBetween(oldV: string, newV: string): ChangeEntry[] {
  return CHANGELOG.filter((e) => cmpVersions(e.version, oldV) > 0 && cmpVersions(e.version, newV) <= 0)
}