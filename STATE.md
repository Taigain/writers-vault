# Writer's Vault — операционное состояние
Обновлено: 14.10.2026 (фиксация №9). Точка правды перед релизом 1.6.4.

## Выпущено
- ≤ 1.5.5: ядро (док справок, рейка, полотно, masonry, грамматика, вкладки персонажа, облако связей).
- 1.6.0 (ручное распространение; GH-релиз снят): гейт языка, загрузочный экран, полка с окном создания
  и стилями корешков (первая тройка), доска идей, BookBar с автоколлапсом рейки, единые настройки +
  FontPicker. Урок цикла: 1.6.0 падала на старых базах без миграций → правило MIGRATIONS ниже.
- 1.6.1: словарь v2 (видимые ошибки, поиск, счётчики, инлайн-редактирование), языковые зоны [lng]…[/lng]
  с заменой по человеческим формам и сохранением регистра.
- 1.6.2: автосоздание событий из меток [#…], человеческие метки с пробелами + чистка легаси-подчёркиваний,
  таймлайн-синопсис (TimelineCard), стабильный редактор на циклах «обернуть/снять зону».
- 1.6.3: окно «Что нового» с cookie-отметкой, серии инлайн в паспорте, ссылка разработчика, корешки по
  корню из объёма, три галочки экспорта DOCX, пакет .wvproj (экспорт/импорт).

## Рабочий набор 1.6.4 (реализовано, ждёт релиза)
1. Персонажи, срез A: CharactersRegistry (поиск, тумблер Альбом/Доска), CharacterTile (полароид с
   seed-наклоном и смещением, ховер-действия редактировать/дублировать/удалить), CharacterBoard (пробковая
   доска, скотч, кнопки-пины .cr-pin, SVG-нити от пина к пину поверх карточек через relationColor,
   легенда, ручка растягивания .cr-board-resize с Book.boardH и dblclick-сбросом, драг карточек с
   запоминанием Character.boardX/boardY через moveCharacterOnBoard, порог 4px и подавление клика
   justDragged), characterTypes.ts, lib/relations.ts, lib/portrait.ts (цепочка portraitSrc: портрет →
   пол male/female → neutral, onError-фолбэк в инициал), public/portraits/{male,female,neutral}.png,
   экшены duplicateCharacter/createCharacterMinimal/getCharacterRelations/moveCharacterOnBoard/
   setBookBoardHeight.
2. Персонажи, срез B: CharacterModal — полноэкранная страница-досье через createPortal(document.body)
   со стражем mounted; липкая шапка (Закрыть, имя, чип роли, Сохранить через form="charpage-form");
   CharacterTabs в основной колонке; aside с полароидом и селектом пола (setCharacterPortrait сохраняет
   фото и пол одним экшеном, genderDraft даёт мгновенный предпросмотр заглушки); секции анкеты: основная
   (имя, роль, псевдонимы, предыстория), демография (возраст, рождение, раса, страна, язык), детали
   личности (архетип, цель, конфликт, травма, одержимость, сильные/слабые + характер/решения/арка),
   внешность (рост, вес, телосложение, глаза, волосы, одежда, осанка, голос + свободное описание);
   21 колонка Character; onCreate приводит на страницу нового героя.
3. Симметрия связей: CharacterRelation.kind ('mutual'/'oneway'); addCharacterRelation с kind и
   OR-защитой от дублей в обе стороны; getCharacters возвращает relationsAll (обе стороны: otherId/
   otherName/note/kind/dir); CharacterModal читает relationsAll, односторонние помечены →/←;
   RelateDialog (направленность, восемь пресетов с цветами relationColor, свой вариант); режим
   «Связать персонажей» на доске (onRelate, выбор пары кликами, обводка .cr-board-card-sel, драг
   в режиме отключён).
4. Сюжетный холст: тумблер Список/Холст в StorylineSection; PlotCanvas.tsx (W=240/H=168, anchorPt/
   bestSides для четырёх якорей .pc-anchor, кривые Безье с выбором ближайших сторон, клик по нити
   удаляет с подтверждением, драг карточек с порогом 4px и сохранением PlotBeat.canvasX/canvasY через
   moveBeatOnCanvas, двойной клик по полотну создаёт бит createBeatAt и открывает редактор); редактор
   бита поверх saveBeat со скрытым eventId (не теряет привязку события) и CharChips участников;
   удаление бита из редактора; подсказки pcHint/pcNoChars; группа «Биты вне линий» в списке (orphans =
   allBeats минус связанные с линиями) с привязкой к линии и удалением; экшены getCanvasBeats/
   getBeatLinks/linkBeats/unlinkBeats; модель BeatLink с @@unique([aId, bId]).
5. lib/prisma.ts: MIGRATIONS = 42 оператора (13 ревизии 6 + 21 колонка персонажа + boardX/boardY +
   boardH + kind + canvasX/canvasY + CREATE BeatLink + его уникальный индекс); runMigrations ровно
   один раз в finally ensureSchema.

## Правила проекта
- Переменной --bg НЕТ; фоны явные или --soft-bg/--line с проверкой [data-theme='dark']
  (charpage: #f6f3ec, тёмная #201b16).
- Дропдауны/попапы внутри карточек: родитель overflow: visible.
- В обработчиках input/textarea — e.currentTarget; в асинхронных формах ссылка на form до первого await.
- Server Actions в пропсах клиентских компонентов — Promise<unknown>.
- Любые изменения схемы И данных боевых баз — только через MIGRATIONS в lib/prisma.ts.
- Нормализация (пробелы→'_') только для сравнения, никогда в вставляемых строках.
- Ссылка разработчика: https://taigadev.ru (APP_URL в lib/appinfo.ts).
- Публично (changelog, FAQ, окно «Что нового») о PRO/премиуме не пишем до решения автора о запуске
  продажи; премиум копится в реестре lib/premium.ts со visible: 'hidden' и PREMIUM_LAUNCH = false.
- Полноэкранные оверлеи и страницы — только через createPortal в document.body: предки с
  transform/анимацией (.anim-fade) ломают position: fixed.
- ResizeObserver без петель обратной связи: наблюдатель мерит только ширину; высота — чистая функция
  данных (ряды доски/холста); minHeight никогда не выводится из измеренной высоты.
- Boxed String в типах не использовать — только примитив string.
- НОВОЕ: после правок серверных файлов в dev перезагрузить страницу перед проверкой экшенов — старый id
  серверного экшена даёт 500 «An unexpected response was received from the server»; в сборке не встречается.
- Служебные пометки в духе «…ваш существующий include без изменений…» никогда не вставлять в код как
  строки: только готовый код.

## Не проверено после последних правок
- Холст на 10+ битах: читаемость нитей, авто-сетка против сохранённых позиций, клампы при ужании.
- Тёмная тема: .pc-card, .charpage, пробковая доска и полароиды без светлых полос.
- .wvproj: boardX/boardY/canvasX/canvasY и BeatLink в пакет НЕ входят (packBook/unpackBook не обновлены
  под холст и доску) — расширение пакета отдельным срезом.
- Полный релизный цикл 1.6.4: 42 миграции на старой базе, окно «Что нового» с пятью пунктами.

## Хрупкие места (grep перед КАЖДЫМ релизом; прикрепления к чату могут содержать старые черновики!)
- lib/prisma.ts: верх = импорт + g/prisma + MIGRATIONS(42) + runMigrations; вызов ровно один (finally).
- lib/actions.ts: getCharacters с рабочим include relations.related и relationsAll (НИКАКИХ пометок-
  плейсхолдеров!); addCharacterRelation(kind) с OR-дубль-защитой; setCharacterPortrait с gender;
  setBookBoardHeight(h: number | null); moveCharacterOnBoard; холстовые getCanvasBeats/getBeatLinks/
  moveBeatOnCanvas/linkBeats/unlinkBeats/createBeatAt + тип CanvasBeat; событийный блок saveChapter с
  авто-созданием и try/catch; extractFirstSentence с полной зачисткой; getTimeline с именами участников.
- components/PlotCanvas.tsx: W/H константы, anchorPt/bestSides, link через elementFromPoint и
  closest('[data-beat-id]'), dblclick только при target === wrap, скрытый eventId в редакторе,
  CharChips локальный, deleteBeat из редактора.
- components/CharacterBoard.tsx: CARD_W=180/CARD_H=290/TOP_PAD=130/PIN_Y=6; observer только ширины;
  autoH = max(620, TOP_PAD + rows*(CARD_H+50) + 60); boardH = stretch ?? boardHeight ?? autoH; jitter
  по id; нити от (px, py) пинов; connect-режим с justDragged и onRelate; setBookBoardHeight импортом
  из actions, boardHeight в деструктуризации.
- components/CharacterModal.tsx: createPortal + mounted; genderDraft; шапка с form="charpage-form";
  массивы DEMO/PERSON/LOOK; aside-форма setCharacterPortrait; ego старт { center: null, nodes: [],
  edges: [] }; relations из relationsAll с стрелками →/←.
- components/CharactersRegistry.tsx: relatePair + RelateDialog после CharacterModal; onCreate
  (setCreating(false) + setOpenId(nid)); boardHeight принят и передан.
- components/RelateDialog.tsx существует; lib/relations.ts relationColor/relationLegend; lib/portrait.ts
  portraitSrc с neutral.png.
- components/StorylineSection.tsx: тумблер view list/canvas, PlotCanvas импортом, orphans-группа
  (linkedIds/orphans) после формы создания линии.
- app/book/[id]/page.tsx: charactersSection = CharactersRegistry с boardHeight={book.boardH};
  CharacterCard НЕ импортируется; exportSynopsis={book.exportSynopsis}.
- app/globals.css: .cr-* (toolbar/grid/polaroid/board/legend/pin/resize/connect-bar/card-sel),
  .charpage-*, .pc-* (wrap/lines/card/anchor); пробка = 3 radial-слоя; у .cr-board НЕТ min-height;
  .cr-strings z-index 3; line-clamp стандартный рядом с -webkit-.
- lib/i18n.ts: cr*, cm*, cd*, rl*, slViewList/slViewCanvas, slOrphans, pc* (Hint/Title/Summary/
  NoChapter/Chars/Save/LinkDel/Delete/DeleteConfirm/NoChars), crBoardStretch + прежние наборы
  (wnTitle/wnOk, ppExport/ppImport, emInclude/emTitle/emAnnotation/emSynopsis, cbSeries*, lic*).
- prisma/schema.prisma: Character +21 колонка + boardX/boardY; CharacterRelation.kind; Book.boardH;
  PlotBeat.canvasX/canvasY + linksA/linksB; model BeatLink; клиент перегенерирован.
- Прежний список: richtext один `} else if (m[3]` после mention-push; RichPreview onRef ×3; RefDock
  GripVertical/onReorder; ImageAttach showPreview ×2; SidebarNav wv-sb-set и НЕТ битых комментариев;
  ExportButton chapterId/mini; HomeView SpineDeco/SWATCHES/isDark/Promise<unknown> + sqrt-ширина;
  IdeaBoard onUp(n.id)/currentTarget/Pin; BookBar 11 пунктов + wv-sb-set; FontPicker явный фон списка;
  settings set-row сетка + FontPicker ×2 + wv-sb-auto + секция «Лицензия» под PREMIUM_LAUNCH + донат под
  !state.isPro; BookPassport без exportMeta, с тремя флагами экспорта, селектом серии с '__new' и
  ссылкой /api/project/export; export-маршрут с select synopsis+флаги; ExportMetaToggle v2;
  WhatsNewModal LS+cookie; projectPack + маршруты + ImportProjectButton; лицензионный слой с
  LICENSE_PUB_B64 не плейсхолдер.

## Бэклог (после 1.6.4)
- Расширение .wvproj: boardX/boardY/canvasX/canvasY и BeatLink в packBook/unpackBook.
- Облачная синхронизация, срезы 2–4: OAuth-каркас с PKCE и localhost-callback, адаптеры Яндекс.Диск →
  Google → Dropbox → OneDrive (upload-сессии), push/pull маршруты за ProGate cloudSync.
- Мудборд заметок: готовый пакет (расширение model Note + NotesBoard.tsx + CSS .nb-* + i18n nb*) —
  НЕ применён; начинать со схемы и db push.
- Онбординг-слайды поверх гейта языка; унификация редакторных компонентов настроек в set-row; возврат
  управления сериями (архив/удаление); стили корешков «С полосами»/«Гримуар»; счётчики на BookBar.
- Накопление премиума (реестр, visible: 'hidden'): cloudSync, worldCalendar, dictGroups + кандидаты
  (карта мира, древо, паки тем); запуск продажи = перевод visible в 'badge' + PREMIUM_LAUNCH = true +
  первое публичное упоминание в changelog.
- Эстетический проход; монетизация фазы 0–3 вне накопления; Yandex Speller opt-in.

## Процедура релиза
Grep-чек-лист выше → changelog → FAQ → bump package.json + appinfo → db push --skip-generate + generate →
dist:win → коммит, тег, push → GH (setup + blockmap + latest.yml) → контроль автообновления.