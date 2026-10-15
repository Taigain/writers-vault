# Writer's Vault — операционное состояние
Обновлено: 15.10.2026 (фиксация №11). Точка правды перед релизом 1.6.5.

## Выпущено
- ≤ 1.5.5: ядро (док справок, рейка, полотно, masonry, грамматика, вкладки персонажа, облако связей).
- 1.6.0 (ручное распространение; GH-релиз снят): гейт языка, загрузочный экран, полка с окном создания
  и стилями корешков, доска идей, BookBar с автоколлапсом рейки, единые настройки + FontPicker.
  Урок цикла: 1.6.0 падала на старых базах без миграций → правило MIGRATIONS ниже.
- 1.6.1: словарь v2, языковые зоны [lng]…[/lng] с заменой по человеческим формам и сохранением регистра.
- 1.6.2: автосоздание событий из меток [#…], человеческие метки, таймлайн-синопсис (TimelineCard),
  стабильный редактор на циклах «обернуть/снять зону».
- 1.6.3: окно «Что нового» с cookie-отметкой, серии инлайн в паспорте, ссылка разработчика, корешки по
  корню из объёма, три галочки экспорта DOCX, пакет .wvproj (экспорт/импорт).
- 1.6.4: альбом полароидов и пробковая доска персонажей (пины, нити по типу связи, драг с запоминанием,
  растягивание, режим «Связать персонажей» с диалогом типа), полноэкранное досье с секциями и стоковыми
  портретами по полу, симметричные связи (kind mutual/oneway), сюжетный холст (drag-биты, нити от четырёх
  якорей, двойной клик создаёт бит, группа «Биты вне линий»).

## Рабочий набор 1.6.5 (реализовано, ждёт релиза)
1. Профиль автора: model AuthorProfile (id 'local', name, penNames, genres, createdAt) + CREATE в
   MIGRATIONS; экшены getAuthorProfile (авто-создание строки), saveAuthorProfile, getProfileStats
   (words = сумма слов глав по всем книгам + books/series/characters/events/scenes); серверная страница
   app/profile/page.tsx: аватар-инициал, «В системе с …», форма имя/псевдонимы/жанры, карточка «План и
   подписка» (Бесплатная версия + чип «В разработке» + неактивная кнопка «Повысить план» + подсказка о
   будущих кнопках оплаты/триала/PRO), панель «Активность» — ЧИСТЫЕ счётчики строками .pf-stat-row без
   вех и полос (награды отложены решением автора: полосы и «/ N» вернутся вместе с ними); входы:
   карточка-ссылка в настройках и ЕДИНСТВЕННАЯ ссылка /profile в sb-bottom сайдбара (дубль из рейки
   удалён после наблюдения двух профилей в свёрнутом виде).
2. Имя автора на паспорте: Book.authorName String? + Book.exportAuthor Boolean @default(false) + два
   ALTER в MIGRATIONS; экшен setBookAuthorName(id, name|null); setBookExportFlag расширен union'ом до
   'exportAuthor'; ExportMetaToggle v3 с четвёртой галочкой (emAuthor); BookPassport: витрина
   .bp-author-display сверху (крупный сериф, без пояснений; пусто → «Не указано»), снизу селект «Выбор
   имени автора» (опции из профиля: реальное имя + псевдонимы split /[,;]/, value = чистое имя, пояснения
   только в label; страховка: сохранённое имя вне профиля остаётся опцией); маршрут экспорта: select с
   authorName/exportAuthor + курсивный абзац автора ВЫШЕ названия при включённой галочке и непустом имени.
3. Справка-журнал: app/help/page.tsx (клиентская): двухколоночная сетка — липкое оглавление всех статей
   FAQ со скроллспаем (IntersectionObserver, rootMargin '-30% 0px -60% 0px', активная статья — красная
   черта) и плавными якорями #faq-i; справа серифные h2, абзацы 15px/1.75, волосяные разделители; уже
   900px оглавление скрывается; lib/faq.ts не тронут — оглавление строится из массива, новые статьи
   попадают в навигацию сами; ключи helpToc/helpTitle/helpSub.
4. Гидратация и бутстрап: layout использует next/script strategy="beforeInteractive" вместо нативного
   <script>; гейты читают localStorage только в useEffect, первый рендер сервера и клиента идентичен
   (скрытый скелет через visibility, а не ветвление тегов) — ошибки hydration и «state update before
   mount» устранены; правило dev: после правок серверных файлов перезагрузить страницу перед проверкой
   экшенов (старый id экшена даёт 500 «unexpected response»; в сборке не встречается).
5. lib/prisma.ts: MIGRATIONS = 45 операторов (42 фиксации №10 + CREATE AuthorProfile + ALTER authorName
   + ALTER exportAuthor); runMigrations ровно один раз в finally ensureSchema.

## Правила проекта
- Переменной --bg НЕТ; фоны явные или --soft-bg/--line с проверкой [data-theme='dark'].
- Дропдауны/попапы внутри карточек: родитель overflow: visible.
- В обработчиках input/textarea — e.currentTarget; в асинхронных формах ссылка на form до первого await.
- Server Actions в пропсах клиентских компонентов — Promise<unknown>.
- Любые изменения схемы И данных боевых баз — только через MIGRATIONS в lib/prisma.ts.
- Нормализация (пробелы→'_') только для сравнения, никогда в вставляемых строках.
- Ссылка разработчика: https://taigadev.ru (APP_URL в lib/appinfo.ts).
- Публично о PRO/премиуме не пишем до решения автора о запуске продажи; премиум копится в реестре
  lib/premium.ts со visible: 'hidden' и PREMIUM_LAUNCH = false.
- Полноэкранные оверлеи — только через createPortal в document.body (предки с transform ломают fixed).
- ResizeObserver без петель: наблюдатель мерит только ширину; высота — функция данных.
- Boxed String в типах не использовать; служебные пометки-плейсхолдеры никогда не вставлять в код.
- Инлайн-скрипты в layout — только next/script (beforeInteractive); чтение localStorage/window в
  клиентских компонентах — только в useEffect, первый рендер идентичен серверному.
- НОВОЕ: статистика профиля без вех до решения о наградах — счётчики чистые; полосы и «/ N» возвращаются
  вместе с наградами, а не раньше.

## Не проверено после последних правок
- Релизный цикл 1.6.5: 45 миграций на старой пользовательской базе при автообновлении; окно «Что нового»
  с тремя пунктами на обоих языках.
- Курсивная строка автора в реальном DOCX (галочка + выбранное имя; пустое имя строки не даёт).
- Справка: скроллспай в десктопном окне и на узком экране (оглавление скрыто), переключение RU/EN без
  потери подсветки; якоря не прыгают при первом рендере.
- Профиль на пустой базе: нули и пустые строки активности без артефактов.

## Хрупкие места (grep перед КАЖДЫМ релизом; прикрепления к чату могут содержать старые черновики!)
- lib/prisma.ts: верх = импорт + g/prisma + MIGRATIONS(45) + runMigrations; вызов ровно один (finally).
- app/profile/page.tsx: серверная страница, form action={saveAuthorProfile}, строки .pf-stat-row без
  cap/bar, fmt по языку, since через toLocaleDateString.
- components/SidebarNav.tsx: ОДНА ссылка /profile (sb-bottom перед settings, UserRound в импортах);
  в рейке профиля НЕТ.
- app/settings/page.tsx: import Link from 'next/link'; карточка профиля с pfOpen; секция «Лицензия» под
  PREMIUM_LAUNCH; донат под !state.isPro.
- components/BookPassport.tsx: витрина .bp-author-display + селект bpAuthorSelect + authorOptions из
  getAuthorProfile (real + penNames split /[,;]/ + страховка сохранённого имени); пропсы authorName/
  exportAuthor; ExportMetaToggle initial с author.
- components/ExportMetaToggle.tsx v3: ExportFlags с author; четыре items; emAuthor.
- app/api/export/[bookId]/route.ts: select с authorName/exportAuthor; курсивный абзац автора ВЫШЕ
  названия внутри children-сборки (НЕ doc.addParagraph; блока выше объявления doc быть не должно).
- app/help/page.tsx: клиентская страница; refs.current массив; data-idx; IntersectionObserver rootMargin
  '-30% 0px -60% 0px'; якоря faq-i; helpToc/helpTitle/helpSub.
- app/layout.tsx: Script из next/script strategy="beforeInteractive" с BOOTSTRAP; гейты без чтения
  localStorage в рендере.
- app/globals.css: .pf-* (head/title/sub/grid/avatar/plan-name/activity/stat-row/stat-label/stat-val),
  .bp-author-display, .help-* (wrap/toc/toc-title/toc-active/head/section), .cr-*, .charpage-*, .pc-*;
  у .cr-board НЕТ min-height; line-clamp стандартный рядом с -webkit-; html scroll-behavior smooth один.
- lib/i18n.ts: pf* (Title/Sub/Author/Since/Name/NamePh/PenNames/PenNamesPh/Genres/GenresPh/Save/Plan/
  PlanFree/Upgrade/InDev/PlanHint/Activity/StatWords/StatBooks/StatSeries/StatCharacters/StatEvents/
  StatScenes), navProfile/pfOpen/pfHint, bpAuthorName/bpAuthorNone/bpAuthorReal/bpAuthorPen/
  bpAuthorSelect, emAuthor, helpToc/helpTitle/helpSub + прежние наборы (cr*/cm*/cd*/rl*/slView*/
  slOrphans/pc*/crBoardStretch, wnTitle/wnOk, ppExport/ppImport, emInclude/emTitle/emAnnotation/
  emSynopsis, cbSeries*, lic*).
- lib/faq.ts: плоские массивы обоих языков в одинаковом порядке — оглавление и якоря строятся по
  индексу; новые статьи дописываются в конец обоих массивов синхронно.
- prisma/schema.prisma: model AuthorProfile; Book.authorName/exportAuthor; Character +21 + boardX/
  boardY; CharacterRelation.kind; Book.boardH; PlotBeat.canvasX/canvasY + linksA/linksB; model BeatLink;
  клиент перегенерирован.
- Прежний список: richtext один `} else if (m[3]` после mention-push; RichPreview onRef ×3; RefDock
  GripVertical/onReorder; ImageAttach showPreview ×2; ExportButton chapterId/mini; HomeView sqrt-ширина;
  IdeaBoard onUp(n.id); BookBar 11 пунктов; FontPicker явный фон; WhatsNewModal LS+cookie; projectPack +
  маршруты + ImportProjectButton; LICENSE_PUB_B64 не плейсхолдер; getCharacters с relationsAll и рабочим
  include (НИКАКИХ пометок-плейсхолдеров).

## Бэклог (после 1.6.5)
- Награды профиля за стандартные цели: вернуть «/ N» и полосы в активность + чипы наград (решение автора).
- Кнопки оплаты/триала/PRO в карточке плана профиля при запуске подписки (PREMIUM_LAUNCH = true).
- Групповые заголовки оглавления справки (опциональное поле группы у статей FAQ) по аналогии с ForgeTales.
- Расширение .wvproj: boardX/boardY/canvasX/canvasY и BeatLink в packBook/unpackBook.
- Облачная синхронизация, срезы 2–4: OAuth PKCE + localhost-callback, адаптеры, push/pull за ProGate.
- Мудборд заметок: пакет НЕ применён; начинать со схемы и db push.
- Онбординг-слайды; унификация настроек в set-row; управление сериями (архив/удаление); стили корешков
  «С полосами»/«Гримуар»; счётчики на BookBar.
- Накопление премиума (реестр hidden): cloudSync, worldCalendar, dictGroups + кандидаты.
- Эстетический проход; монетизация фазы 0–3 вне накопления; Yandex Speller opt-in.

## Процедура релиза
Grep-чек-лист выше → changelog → FAQ → bump package.json + appinfo до 1.6.5 → db push --skip-generate +
generate → dist:win → коммит, тег, push → GH (setup + blockmap + latest.yml) → контроль автообновления.