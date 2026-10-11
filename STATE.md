# Writer's Vault — операционное состояние
Обновлено: 11.10.2026 (фиксация №5). Точка правды перед релизом 1.6.2.

## Выпущено
- ≤ 1.5.5: ядро (док справок, рейка, полотно, masonry, грамматика, вкладки персонажа, облако связей).
- 1.6.0 (ручное распространение; GH-релиз снят): гейт языка, загрузочный экран, полка с окном создания
  и стилями корешков (первая тройка), доска идей, BookBar с автоколлапсом рейки, единые настройки +
  FontPicker. Урок цикла: 1.6.0 падала на старых базах без миграций → правило MIGRATIONS ниже.
- 1.6.1: словарь v2 (видимые ошибки, поиск, счётчики, инлайн-редактирование), языковые зоны [lng]…[/lng]
  с заменой по человеческим формам и сохранением регистра.

## Рабочий набор 1.6.2 (реализовано, ждёт релиза)
1. Автосоздание событий: в saveChapter метка [#…] без пары создаёт TimelineEvent (tag/description с
   пробелами), создание обёрнуто в try/catch — сохранение главы не падает на событийной секции;
   unknownEvents остаётся страховкой.
2. Человеческие метки: createEventFromMark хранит raw; MIGRATIONS чистят легаси (UPDATE TimelineEvent
   REPLACE '_'→' ' с instr-страховкой); ChapterEditor wrapEvent вставляет сырое выделение (rawSel),
   ветки снятия зоны конвертируют '_'→' ', restore считает по rawSel.length; поиск метки для панели —
   matchAll-цикл со нормализованным сравнением.
3. Таймлайн-синопсис: components/TimelineCard.tsx (дата с иконкой, title = description || chapterTitle,
   чип тега, summary автора или очищенная первая фраза курсивом, строка главы, чипы участников до 4 +N);
   TimelineVisual передаёт dateLabel через fmtCalendarShort/fmtBookDate (ключи tlYearDay/tlYearOnly НЕ
   нужны — удалить, если добавлены); getTimeline возвращает participants с именами; extractFirstSentence
   снимает всю разметку ([@], [#], [sc:], [/sc], [hl=], [/hl], [lng], [/lng], [size=], жирный/курсив).

## Правила проекта
- Переменной --bg НЕТ: фоны явные или --soft-bg/--line с проверкой [data-theme='dark'].
- Дропдауны/попапы внутри карточек: родитель overflow: visible.
- В обработчиках input/textarea — e.currentTarget, не e.target.
- Server Actions в пропсах клиентских компонентов — Promise<unknown>, не Promise<void>.
- Любые изменения схемы И данных боевых баз — только через MIGRATIONS в lib/prisma.ts (идемпотентные
  операторы, try/catch на каждый); dev db push не гарантия для пользовательских баз.
- Нормализация (пробелы→'_') только для сравнения, никогда в вставляемых строках.
- Асинхронные обработчики форм: ссылка на form сохраняется до первого await (кейс e.currentTarget.reset).

## Не проверено после последних правок
- Карточки таймлайна на живой книге: чипы участников, курсивная запасная фраза без маркеров, скрытие
  строки главы при совпадении с заголовком.
- Записи 1.6.2 в changelog/faq, версия 1.6.2 в package.json + lib/appinfo.ts.

## Хрупкие места (grep перед КАЖДЫМ релизом; прикрепления к чату могут содержать старые черновики!)
- lib/actions.ts: событийный блок saveChapter с авто-созданием и try/catch ('event autocreate skipped');
  createEventFromMark с raw; extractFirstSentence с полной зачисткой разметки; getTimeline: participants
  с именами в include, mapped и типе TimelineRow.
- components/ChapterEditor.tsx: wrapEvent с rawSel (normSel отсутствует!), ветки снятия зоны с
  .replace(/_/g, ' '), matchAll-поиск метки, кнопка Globe2 (chTbLang), editor-shell, onRef={openRef},
  reorderRefs.
- components/TimelineCard.tsx существует; TimelineVisual рендерит <TimelineCard row dateLabel icon />,
  внутри пина НЕТ tv-date/tv-title/tv-summary.
- lib/prisma.ts: MIGRATIONS = 4 операторa схемы + 2 UPDATE TimelineEvent; runMigrations в finally
  ensureSchema.
- lib/dict.ts: ZONE_RE/applyDictZones/substituteToken; lib/richtext.ts: [lng]-токены m[10]/m[11] невидимы,
  после mention-push ровно один `} else if (m[3]`.
- components/DictSection.tsx v2 (поиск, usage, form-ссылка до await); components/IdeaBoard.tsx
  (onUp(n.id), autoGrow currentTarget, Pin, COLORS 8).
- components/HomeView.tsx: SpineDeco, StatusIcon, GENRES классические, SWATCHES 8, isDark, CreateBookModal
  с Promise<unknown> и скрытыми полями genre/spineColor/spineStyle/seriesId/seriesNew.
- components/BookBar.tsx: 11 пунктов, событие wv-sb-set, монтаж в layout; SidebarNav: слушатель wv-sb-set,
  toggleCollapsed, рейка, sb-hide, НЕТ битых комментариев `/* ignore /`.
- components/FontPicker.tsx: фон списка явный + [data-theme='dark']; app/settings/page.tsx: set-row сетка,
  FontPicker ×2, тумблер wv-sb-auto; app/page.tsx: HomeView + idea-board, без старых форм.
- components/RichPreview.tsx onRef ×3; components/RefDock.tsx GripVertical/onReorder/updateCharacterFields;
  components/ImageAttach.tsx showPreview ×2; components/ExportButton.tsx chapterId/mini.
- app/globals.css: .book-bar*, .tl-card*, .set-*, .font-picker*, .idea-*, .shelf/.spine*/.style-pick,
  .swatch*/.create-win, .lang-tile, .editor-shell/.ref-dock/.run-mention, .masonry, --sbw/--content-max.
  Блоков .nb-* (мудборд) НЕТ — пакет не применён.
- lib/i18n.ts: bbPassport, setSbAuto/setOn/setOff, ib*, st_*, cb*, g_* (новые+легаси), dcZoneHint, chTbLang,
  dock*, sb*, hv*, ego*, pnDupWord/pnSplit.
- prisma/schema.prisma: Book.genre/spineColor/spineStyle, model IdeaNote с color; model Note НЕ расширена
  (мудборд не применён); клиент перегенерирован.

## Бэклог (после 1.6.2)
- Мудборд заметок: готовый пакет (расширение model Note: width/height/zIndex/colorHex/characterId/
  loreEntryId/fileBase64/fileName/tableData/quoteText/drawingData + NotesBoard.tsx + CSS .nb-* + i18n nb*)
  — НЕ применён; начинать со схемы и db push, затем компонент и интеграция в таб notes.
- Онбординг-слайды поверх гейта языка (wv-onboarding-done, 5 слайдов, «Пропустить», сброс в настройках).
- Унификация внутренностей редакторных компонентов настроек в set-row.
- Возврат управления сериями (архив/удаление).
- Стили корешков «С полосами»/«Гримуар»; счётчики на BookBar.
- Премиум: группы словарей с именованными зонами [lang:имя]; карта мира с точками; генеалогическое древо;
  эстетический проход; календарь мира; монетизация фазы 0–3; Yandex Speller opt-in.

## Процедура релиза
Grep-чек-лист выше → changelog → FAQ → bump package.json + appinfo → db push --skip-generate + generate →
dist:win → коммит, тег, push → GH (setup + blockmap + latest.yml) → контроль автообновления.