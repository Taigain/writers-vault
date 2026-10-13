# Writer's Vault — операционное состояние
Обновлено: 13.10.2026 (фиксация №8). Точка правды перед релизом 1.6.3.

## Выпущено
- ≤ 1.5.5: ядро (док справок, рейка, полотно, masonry, грамматика, вкладки персонажа, облако связей).
- 1.6.0 (ручное распространение; GH-релиз снят): гейт языка, загрузочный экран, полка с окном создания
  и стилями корешков (первая тройка), доска идей, BookBar с автоколлапсом рейки, единые настройки +
  FontPicker. Урок цикла: 1.6.0 падала на старых базах без миграций → правило MIGRATIONS ниже.
- 1.6.1: словарь v2 (видимые ошибки, поиск, счётчики, инлайн-редактирование), языковые зоны [lng]…[/lng]
  с заменой по человеческим формам и сохранением регистра.
- 1.6.2: автосоздание событий из меток [#…], человеческие метки с пробелами + чистка легаси-подчёркиваний,
  таймлайн-синопсис (TimelineCard: дата, название, тег, описание, глава, участники), стабильный редактор
  на циклах «обернуть/снять зону».

## Рабочий набор 1.6.3 (реализовано, ждёт релиза)
1. WhatsNewModal: отметка в localStorage + cookie (переживает смену порта десктопа), запасной выбор
   последней непустой записи changelog; ключи wnTitle/wnOk.
2. Серии в паспорте: собственный селект с «Новая серия…» и инлайн-созданием (createSeriesNamed,
   findOrCreate); BookPassport переписан целиком; SeriesPicker не используется.
3. Корешки: ширина = 46 + 26*sqrt(sheets), клампы 46..132 (HomeView).
4. Экспорт DOCX: три независимые галочки exportTitle/exportAnnotation/exportSynopsis (схема + MIGRATIONS
   + setBookExportFlag + ExportMetaToggle v2); select маршрута с synopsis и флагами.
5. Пакет проекта: lib/projectPack.ts (PACK_FORMAT 1, packBook/unpackBook с переклёпкой id), маршруты
   /api/project/export|import, ImportProjectButton на главной, ключи ppExport/ppImport, jszip.
6. Лицензионная инфраструктура (ТИХО до запуска продажи): lib/license.ts (Ed25519 офлайн), licenseActions,
   LicenseProvider/LicenseDialog/ProGate, реестр lib/premium.ts — все visible: 'hidden' + флаг
   PREMIUM_LAUNCH = false прячет секцию «Лицензия»; триал кнопкой из PRO-замка; PRO скрывает донат-блок;
   keys/ вне репозитория (scripts/make-license-keys.mjs, sign-license.mjs).
7. Персонажи, срез A: CharactersRegistry (поиск, тумблер Альбом/Доска), CharacterTile (полароид с
   seed-наклоном и смещением, ховер-действия), CharacterBoard (пробковая доска, легенда),
   characterTypes.ts, lib/relations.ts (relationColor/relationLegend), экшены duplicateCharacter/
   createCharacterMinimal/getCharacterRelations.
8. Персонажи, срез B: CharacterModal — полноэкранная страница-досье через createPortal(document.body)
   со стражем mounted; липкая шапка (Закрыть, имя, чип роли, Сохранить через form="charpage-form");
   CharacterTabs в основной колонке; aside с полароидом и полом; секции анкеты: основная (имя, роль,
   псевдонимы, предыстория), демография (возраст, рождение, раса, страна, язык), детали личности
   (архетип, цель, конфликт, травма, одержимость, сильные/слабые + характер/решения/арка), внешность
   (рост, вес, телосложение, глаза, волосы, одежда, осанка, голос + свободное описание); 21 колонка
   Character + 21 ALTER в MIGRATIONS; setCharacterPortrait сохраняет фото и пол одним экшеном;
   genderDraft для мгновенного предпросмотра заглушки; onCreate приводит на страницу нового героя.
9. Доска, интерактив: перетаскивание карточек с запоминанием (Character.boardX/boardY + moveCharacterOnBoard,
   порог сдвига 4px и подавление клика justDragged); кнопки-пины .cr-pin и нити от пина к пину поверх
   карточек (svg z-index 3, пины z 4); растягивание доски ручкой .cr-board-resize с сохранением
   Book.boardH (setBookBoardHeight, двойной клик — сброс в null); авто-высота autoH =
   max(620, TOP_PAD + rows*(CARD_H+50) + 60), boardH = stretch ?? boardHeight ?? autoH.
10. Стоковые портреты: lib/portrait.ts portraitSrc (портрет → пол male/female → neutral);
    public/portraits/{male,female,neutral}.png; onError-фолбэк в инициал на плитке, доске и в досье.
11. lib/prisma.ts: консолидированный верх, MIGRATIONS = 37 операторов (13 ревизии 6 + 21 колонка
    персонажа + boardX/boardY + boardH), runMigrations ровно один раз в finally ensureSchema.

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
  данных (ряды доски); minHeight никогда не выводится из измеренной высоты.
- Boxed String в типах не использовать — только примитив string (инциденты: characterTypes, CharacterInput).

## Не проверено после последних правок
- Доска на 7+ персонажах: два и более ряда, нити через ряд, клампы сохранённых позиций при ужании доски.
- Тёмная тема: charpage и полароиды без светлых полос; доска читаема.
- Отсутствие neutral.png: onError показывает инициал вместо битой картинки (плитка, доска, досье).
- Импорт .wvproj на живой книге; три галочки в реальном DOCX; WhatsNewModal на десктопе после смены порта.

## Хрупкие места (grep перед КАЖДЫМ релизом; прикрепления к чату могут содержать старые черновики!)
- lib/prisma.ts: верх = импорт + g/prisma + MIGRATIONS(37) + runMigrations; вызов ровно один (finally).
- components/CharacterModal.tsx: createPortal + mounted; genderDraft; шапка с form="charpage-form";
  массивы DEMO/PERSON/LOOK; aside-форма setCharacterPortrait (фото+пол); ego старт
  { center: null, nodes: [], edges: [] }.
- components/CharactersRegistry.tsx: состояния view/q/openId/creating; проп boardHeight принят и
  передан в CharacterBoard; CharacterModal с onCreate (setCreating(false) + setOpenId(nid)).
- components/CharacterBoard.tsx: CARD_W=180/CARD_H=290/TOP_PAD=130/PIN_Y=6; observer только ширины;
  autoH/boardH/stretch; ручка .cr-board-resize с setBookBoardHeight и dblclick-сбросом; drag с порогом
  4px, justDragged и setPointerCapture; нити от (px, py) пинов; setBookBoardHeight импортирован из
  actions (НЕ из пропсов!), boardHeight в деструктуризации.
- components/CharacterTile.tsx: seedRand наклон/смещение; portraitSrc; три ховер-действия.
- lib/portrait.ts и lib/relations.ts существуют; characterTypes.ts CharRow: 21 поле строками +
  boardX/boardY: number | null.
- lib/actions.ts: moveCharacterOnBoard, setBookBoardHeight(h: number | null), setCharacterPortrait с
  gender, duplicateCharacter, createCharacterMinimal, getCharacterRelations, createSeriesNamed,
  setBookExportFlag, CharacterInput с 21 опциональным string; событийный блок saveChapter с
  авто-созданием и try/catch; extractFirstSentence с полной зачисткой; getTimeline с именами участников.
- app/book/[id]/page.tsx: charactersSection = <CharactersRegistry bookId characters relations
  boardHeight={book.boardH} />; CharacterCard НЕ импортируется; exportSynopsis={book.exportSynopsis}.
- app/globals.css: блоки .cr-* (toolbar/grid/polaroid/board/legend/pin/resize) и .charpage-*; пробка =
  3 radial-слоя без repeating-radial-gradient; у .cr-board НЕТ min-height; .cr-strings z-index 3.
- lib/i18n.ts: ключи cr*, cm*, cd*, crBoardStretch + wnTitle/wnOk, ppExport/ppImport, emInclude/emTitle/
  emAnnotation/emSynopsis, cbSeries*, lic*.
- public/portraits/: male.png, female.png, neutral.png.
- Прежний список: richtext один `} else if (m[3]` после mention-push; RichPreview onRef ×3; RefDock
  GripVertical/onReorder; ImageAttach showPreview ×2; SidebarNav wv-sb-set и НЕТ битых комментариев;
  ExportButton chapterId/mini; HomeView SpineDeco/SWATCHES/isDark/Promise<unknown> + sqrt-ширина;
  IdeaBoard onUp(n.id)/currentTarget/Pin; BookBar 11 пунктов + wv-sb-set; FontPicker явный фон списка;
  settings set-row сетка + FontPicker ×2 + wv-sb-auto + секция «Лицензия» под PREMIUM_LAUNCH + донат под
  !state.isPro; BookPassport без exportMeta, с тремя флагами экспорта и селектом серии с '__new'.
- prisma/schema.prisma: Book.genre/spineColor/spineStyle/exportTitle/exportAnnotation/exportSynopsis/
  boardH, Character +21 колонка + boardX/boardY, IdeaNote с color, License, CloudAccount, CloudSyncState;
  model Note НЕ расширена (мудборд не применён); клиент перегенерирован.

## Бэклог (после 1.6.3)
- Облачная синхронизация, срезы 2–4: OAuth-каркас с PKCE и localhost-callback, адаптеры Яндекс.Диск →
  Google → Dropbox → OneDrive (upload-сессии), push/pull маршруты за ProGate cloudSync.
- Мудборд заметок: готовый пакет (расширение model Note + NotesBoard.tsx + CSS .nb-* + i18n nb*) —
  НЕ применён; начинать со схемы и db push.
- Персонажи, срез C: тумблер реестр/связи на уровне раздела, сортировка по роли, экспорт списка
  персонажей; новые поля карточки по мере ваших решений.
- Онбординг-слайды поверх гейта языка; унификация редакторных компонентов настроек в set-row; возврат
  управления сериями (архив/удаление); стили корешков «С полосами»/«Гримуар»; счётчики на BookBar.
- Накопление премиума (реестр, visible: 'hidden'): cloudSync, worldCalendar, dictGroups + кандидаты
  (карта мира, древо, паки тем); запуск продажи = перевод visible в 'badge' + PREMIUM_LAUNCH = true +
  первое публичное упоминание в changelog.
- Эстетический проход; монетизация фазы 0–3 вне накопления; Yandex Speller opt-in.

## Процедура релиза
Grep-чек-лист выше → changelog → FAQ → bump package.json + appinfo → db push --skip-generate + generate →
dist:win → коммит, тег, push → GH (setup + blockmap + latest.yml) → контроль автообновления.