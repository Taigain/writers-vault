# Writer's Vault — операционное состояние
Обновлено: 23.10.2026 (фиксация №18). Точка правды перед релизом 1.6.8.

## Выпущено
- ≤ 1.5.5: ядро (док справок, рейка, полотно, masonry, грамматика, вкладки персонажа, облако связей).
- 1.6.0 (ручное распространение; GH-релиз снят): гейт языка, загрузочный экран, полка с окном создания
  и стилями корешков, доска идей, BookBar с автоколлапсом рейки, единые настройки + FontPicker.
- 1.6.1: словарь v2, языковые зоны [lng]…[/lng] с заменой по человеческим формам и сохранением регистра.
- 1.6.2: автосоздание событий из меток [#…], человеческие метки, таймлайн-синопсис (TimelineCard),
  стабильный редактор на циклах «обернуть/снять зону».
- 1.6.3: окно «Что нового» с cookie-отметкой, серии инлайн в паспорте, ссылка разработчика, корешки по
  корню из объёма, три галочки экспорта DOCX, пакет .wvproj (экспорт/импорт).
- 1.6.4: альбом полароидов и пробковая доска персонажей, полноэкранное досье, симметричные связи,
  сюжетный холст (drag-биты, нити от четырёх якорей, двойной клик создаёт бит).
- 1.6.5: профиль автора с чистой статистикой, имя автора на паспорте, справка-журнал со скроллспаем,
  единая ссылка /profile в sb-bottom, гидратация layout (next/script beforeInteractive).
- 1.6.6: мульти-словарь за премиум-гейтом (группы, [lang:slug], палитра образцов, dev-разблокировка),
  линтер с маскировкой маркеров и разделитель `***` → `* * *`, экспорт в Markdown (front matter,
  RFC 5987), групповое оглавление справки.
- 1.6.7: состав серии за премиум-гейтом (души, дубли, ввод в книгу, канон, чипы «также в: …»),
  финальная панель зон (Languages-тумблер общей зоны, премиальная Earth-кнопка с меню, чип языка),
  оптимистичный указатель серии в паспорте, минимальная рейка без аватарок, компактная сортировка главной.

## Рабочий набор 1.6.8 (реализовано, ждёт релиза)
1. Резервные снимки книги:
   - schema: model BookSnapshot (id, bookId, createdAt, label, payload JSON, @@index[bookId,createdAt])
     + Book.snapshots; MIGRATIONS = 55 операторов всего.
   - lib/actions.ts: takeSnapshot(bookId, label, force) с троттлингом SNAPSHOT_MIN_MS = 10 минут для
     автоснимков (force=true минует троттлинг) и обрезкой по SNAPSHOT_KEEP = 10; вызовы: saveChapter
     (после синков, если !noSnap), deleteChapter (ДО удаления, метка «Перед удалением: …», force),
     createManualSnapshot (force, метка по языку); getBookSnapshots/deleteSnapshot/restoreSnapshot;
     восстановление = транзакция (deleteMany глав вне payload, upsert глав payload с order/actName,
     update structure) + тихий прогон saveChapter(id, title, content, true) по каждой главе —
     упоминания, события и сцены пересинхронизируются тем же кодом, бэклог не тратится;
     saveChapter получил четвёртый параметр noSnap?: boolean.
   - components/SnapshotsButton.tsx: кнопка «Снимки книги» (History) + диалог: список до 10 снимков
     (дата toLocaleString по языку, метка), «Восстановить» с window.confirm по дате, удалить снимок,
     «Снимок сейчас»; встроена в шапку раздела «Главы» рядом с экспортом DOCX.
   - i18n: snTitle/snHint/snEmpty/snTake/snRestore/snRestoreConfirm; snHint честно описывает троттлинг
     и принудительные снимки.
   - Объём снимка: главы (id, title, content, order, actName) + structure книги; персонажи, словарь,
     изображения вне бэклога сознательно; удаление книги каскадно уносит снимки.
2. Парсер меток — посимвольный сканер (лечение регресса после ручных правок richtext):
   - lib/richtext.ts: parseInline БЕЗ регулярных выражений по токенам: сканер по символам, тип токена
     по startsWith; ветки в порядке: [@ / [# → mention-пробеги (события с подчёркивания→пробелы),
     [sc: / [/sc] → невидимы, [hl= / [/hl] → стек подсветок, [lng] [/lng] [lang: [/lang] → невидимы,
     '**' → рекурсия жирного СТРОГО раньше одиночной '*', '[size=' → рекурсия размера, '*' → рекурсия
     курсива; TOKEN_RE удалён полностью, остались ALIGN_RE и isSeparatorLine + sep-блок '* * *'.
   - Контракт наружу прежний: InlineRun/RichLine/RichBlock, mention/refKind для кликабельных имён и
     дока справок, sep для разделителя — RichPreview, ReadMode, маршрут DOCX и markdown-экспорт
     работают без правок и снова чисто снимают все метки.
   - Диагностические зонды (console.log RICHTEXT…) удалены после проверки; класс регресса (битые
     экранирования, съехавшие группы, перемешанные ветки, залипший lastIndex) закрыт структурно.
3. Премиум-реестр без изменений: dictGroups и seriesRelations со visible 'hidden'; usePremium с
   dev-разблокировкой (NODE_ENV === 'development').

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
- Полноэкранные оверлеи — только через createPortal в document.body.
- ResizeObserver без петель; высота — функция данных.
- Boxed String не использовать; пометки-плейсхолдеры никогда не вставлять в код.
- Инлайн-скрипты в layout — только next/script (beforeInteractive); localStorage/window в клиентских
  компонентах — только в useEffect, первый рендер идентичен серверному.
- Линтер всегда маскирует текст через maskMarkers перед правилами; офсеты читаются из оригинала.
- Next 15+ route handlers: params — Promise, всегда `const { bookId } = await ctx.params`.
- Content-Disposition с не-ASCII — только RFC 5987 (filename*=UTF-8''…).
- Статистика профиля без вех до решения о наградах.
- Массивы FAQ обоих языков держат одинаковый порядок статей.
- Премиум-срезы guarded на СЕРВЕРЕ в каждом пишущем экшене (seriesPremiumOk-паттерн); клиентский
  usePremium отвечает только за видимость UI.
- У Character нет createdAt — сортировки «ранний» по id asc (cuid начинается с метки времени).
- Модель панели зон: свободная кнопка (Languages) = общая зона с тумблером; премиальная (Earth+стрелка)
  = меню выбора словаря; чип = индикатор языка; кнопка одиночного слова НЕ возвращается.
- Рейка минимальна по решению автора: логотип, «Домой», низ профиль/настройки/помощь.
- Снимки — событийная модель без настроек периодичности: автоснимок с троттлингом 10 минут,
  принудительные снимки минуют троттлинг; глубина 10 — константа безопасности.
- Восстановление идёт через тихий saveChapter(noSnap=true) — единый код синков; параллельных
  реализаций синхронизации не добавлять.
- НОВОЕ: парсер меток — посимвольный сканер; новые типы токенов добавлять веткой startsWith в
  parseInline и (для линтера) в MARKER_RE маски; регулярки для поиска токенов не возвращать.
- НОВОЕ: диагностические зонды (console.log с меткой версии) живут только на время расследования и
  удаляются до фиксации; в зафиксированном дереве console.log в lib/richtext.ts отсутствует.

## Не проверено после последних правок
- Релизный цикл 1.6.8: 55 миграций на старой базе при автообновлении; окно «Что нового» с тремя
  пунктами на обоих языках.
- Боевой прогон снимков: 12 быстрых сохранений дают 1–2 автоснимка (троттлинг); «Снимок сейчас» и
  снимок перед удалением создаются мгновенно; восстановление возвращает текст/порядок/акты и
  пересинхронизирует вкладки сцен и упоминаний; удаление книги уносит снимки.
- Чистота меток на контрольной главе со всеми типами: предпросмотр, режим чтения, DOCX, Markdown —
  ни одной служебной скобки; `***` даёт центрированный разделитель; жирный/курсив/размер на месте.
- Прод-невидимость премиума 1.6.7 повторно на сборке 1.6.8 (без PRO: группы словаря, Earth-меню,
  блок «В серии», кнопка состава скрыты).

## Хрупкие места (grep перед КАЖДЫМ релизом; прикрепления к чату могут содержать старые черновики!)
- lib/richtext.ts: сканер с порядком веток ('**' раньше '*', '[size=' раньше '*'); mention-пробеги
  bold:true + refKind char/event; НЕТ TOKEN_RE; НЕТ console.log; ALIGN_RE + isSeparatorLine + sep-блок.
- lib/mask.ts: MARKER_RE синхронен с набором токенов сканера (новые метки добавлять в оба места).
- lib/actions.ts: SNAPSHOT_KEEP/SNAPSHOT_MIN_MS/takeSnapshot(force)/noSnap в saveChapter/снимок ДО
  удаления в deleteChapter/restoreSnapshot с тихим прогоном; серийные экшены с seriesPremiumOk;
  unlink orderBy id asc; getCharacters include seriesChar с soul/seriesCharId; react-импортов НЕТ.
- components/SnapshotsButton.tsx существует; в app/book/[id]/page.tsx вставлен <SnapshotsButton
  bookId={id} /> рядом с экспортом DOCX + импорт компонента.
- components/ChapterEditor.tsx: ОДИН span.zm-wrap (чип + Languages-кнопка commonZoneToggle + Earth-кнопка
  + один ZoneMenu); НЕТ хвоста-дубля (кнопка zmPick, второй ZoneMenu, лишний </span>); предпросмотр
  через applyDictFull(c, dictRows, zoneGroups) + эффект загрузки dictRows; usePremium ИМЕНОВАННЫМ
  импортом; caret в updateSel; zoneAt/zoneSlug/zoneGroup после счётчиков.
- components/ReadMode.tsx: RichPreview через applyDictFull(cur.content, dictRows, zoneGroups).
- app/api/export/[bookId]/route.ts: prepMarkers снимает [sc:]/[hl] до parseRichText; cleanPlain для
  заголовков; applyDictFull для содержимого; титульные параграфы по галочкам без плейсхолдеров.
- lib/markdown.ts: richToMarkdown = applyDictFull первой, затем собственная зачистка (повтор безопасен).
- lib/prisma.ts: MIGRATIONS = 55; runMigrations ровно один раз в finally ensureSchema.
- prisma/schema.prisma: BookSnapshot + Book.snapshots + SeriesChar/SeriesRelation/Character.seriesCharId;
  клиент перегенерирован.
- lib/faq.ts: статьи 1.6.8 (резервные снимки после автосохранения, дополнение в «Где хранятся мои
  данные?», гарантийное предложение в «Командах форматирования») в обоих языках на одинаковых позициях.
- lib/changelog.ts: запись 1.6.8 первая, три пункта на обоих языках.
- Прежний список: punct/grammar импорт maskMarkers + правила по src; dictzones applyDictFull;
  export-md маршрут (await ctx.params, filename*=UTF-8''); DictSection без мусорных импортов;
  LicenseProvider dev-флаг; SidebarNav рейка без аватарок и групповых иконок; HomeView селект с
  инлайн-геометрией + проп forceGroup; page.tsx forceGroup из searchParams; BookPassport seriesSel;
  CharacterModal SoulBlock перед cdMain; CharactersRegistry кнопка состава + SeriesCastDialog +
  RelateDialog; CharacterTile чип soul.books; WhatsNewModal LS+cookie; projectPack + маршруты;
  LICENSE_PUB_B64 не плейсхолдер.

## Бэклог (после 1.6.8)
- Стадия E2: связи серии между душами (SeriesRelation UI): тумблер «Книга / Серия» во вкладке связей,
  серийное облако с узлами-душами, серверный гейт на создание/удаление.
- Удаление dormant-цепочки ?g= (forceGroup в page.tsx/HomeView, forceOpen в CollapsibleSection).
- Награды профиля: вернуть «/ N» и полосы + чипы наград (решение автора).
- Кнопки оплаты/триала/PRO в карточке плана при запуске подписки (PREMIUM_LAUNCH = true).
- Счётчики использований словаря: расширить на зонные подстановки, а не только [~ключ].
- Расширение .wvproj: boardX/boardY/canvasX/canvasY, BeatLink, DictGroup, seriesCharId-связки и
  (опционально) включение списка снимков в пакет.
- Облачная синхронизация срезы 2–4; мудборд заметок; онбординг; управление сериями (архив/удаление);
  стили корешков «С полосами»/«Гримуар»; счётчики BookBar; накопление премиума; эстетический проход;
  Yandex Speller opt-in.

## Процедура релиза
Grep-чек-лист выше → changelog → FAQ → bump package.json + appinfo до 1.6.8 → db push --skip-generate
+ generate → dist:win → коммит, тег, push → GH (setup + blockmap + latest.yml) → контроль
автообновления, премиум-невидимости и чистоты меток в прод-сборке.