# Writer's Vault — операционное состояние
Обновлено: 09.10.2026 (фиксация №4). Точка правды перед релизом 1.6.0.

## Выпущено (≤ 1.5.5)
- 1.5.4: надёжность запуска (waitForServer 160), грамматический слой (lib/grammar.ts),
  вкладки карточки персонажа (CharacterTabs), облако связей (CharacterEgo + getCharacterEgo).
- 1.5.5: рейка сайдбара (--sbw, sb-hide), динамическое полотно (--content-max), masonry-сетки,
  одиночное изображение локации (ImageAttach showPreview), док справок (richtext refKind →
  RichPreview onRef → RefDock: редактируемые bio/decisions/arc, карточка события, перестановка
  грип-ручкой; actions getRefInfo/updateCharacterFields; ChapterEditor editor-shell + reorderRefs).

## Рабочий набор 1.6.0 (реализовано, ждёт релиза)
1. Загрузочный экран: electron/main.cjs loadingPage — лого-pop, печатающееся имя, чернильная роспись,
   пульс-точки, prefers-reduced-motion.
2. Гейт языка: components/LanguageGate.tsx (zIndex 400, фон #f6f3ec), монтаж в layout перед WhatsNewModal;
   пишет wv-lang в localStorage+cookie, перезагрузка; CSS .lang-tile.
3. Полка: HomeView.tsx — виды shelf/tiles (wv-home-view), сортировка (статус/жанр/серия/дата), корешки
   368px, ширина 55+sheets*18 (55..172), цвет = spineColor || статусный, значки статусов, ховер --tilt +
   подъём без изменения шрифта (antialiased, без filter), тултип с жанром и объёмом.
4. Окно создания (CreateBookModal): живой предпросмотр корешка/обложки, классические жанры чипами,
   комбобокс серии с «Новая серия…» (findOrCreate в createBook), 8 свотчей + свой цвет, isDark-текст,
   стили корешка первой тройкой (SpineDeco: tome/classic/plain), импорт DOCX; createAction Promise<unknown>
   на обоих уровнях.
5. Доска идей: model IdeaNote (id, text, color, x, y, createdAt); 4 экшена; IdeaBoard.tsx — попап по
   двойному клику (textarea в цвете бумаги, «Закрепить» при пустом тексте недоступна), 8 COLORS, авто-высота
   autoGrow (e.currentTarget!), булавка <Pin>, drag pointer-capture с клампом, сохранения на blur/pointerup;
   секция CollapsibleSection id="idea-board" на главной; CSS .idea-*/.note-swatch/.idea-modal-ta.
6. BookBar: components/BookBar.tsx — пилюля снизу (паспорт + 9 разделов, активный подписан), bookId из
   пути, tab из query, монтаж в layout; автоколлапс рейки на переходе паспорт→раздел через событие
   wv-sb-set (слушатель в SidebarNav) и флаг wv-sb-auto (тумблер в настройках, дефолт '1'); body.has-book-bar
   даёт main padding-bottom 96px; скрытие вне книжных страниц и на <900px; zen перекрывает.
7. Настройки единым стилем: app/settings/page.tsx — шапка с setSub, группы set-label, карточки .set-card
   со строками .set-row/.set-ctl/.set-t/.set-h/.set-ico/.set-block; FontPicker (components/FontPicker.tsx)
   вместо select: кнопка и опции набраны своими шрифтами; лечения: .set-card overflow visible, фон списка
   явный #fffdf8 + [data-theme='dark'] #2a2622.
8. Схема: Book.genre, Book.spineColor, Book.spineStyle (@default), model IdeaNote с color; db push +
   generate + рестарт TS-сервера обязательны.
9. i18n набора: hv*, cb* (включая cbStyle, cbSort*, cbPreview*, cbSeries*), st_tome/st_classic/st_plain,
   g_* классические + легаси, ib* (ibTitle/ibHint/ibPh/ibNew/ibPin/ibCancel), setSub/setGroup*/
   setUpdatesRow/setSbAuto/setSbAutoHint/setOn/setOff, bbPassport, c* свотчи.
10. Словарь v2: DictSection.tsx — поиск, счётчики использований (getDictUsage в actions.ts), видимые ошибки
    добавления, инлайн-редактирование пар d/b; кнопки копирования [~ключ] и подтверждения удаления;
    применение словаря через onsubmit с router.refresh() и сохранённой ссылкой на форму.
11. Языковые зоны [lng]…[/lng]: lib/dict.ts (applyDictZones с ZONE_RE, substituteToken, transferCase),
    границы зон невидимы в richtext.ts (TOKEN_RE группы m[10]/m[11]), кнопка Globe2 на панели редактора,
    снятие зон в clearFormatting.
12. Премиум-задел: группы словарей с именованными зонами [lang:имя] — архитектура готова (applyDictZones
    принимает карту словаря параметром), схема не требует миграций.

## Правила проекта (из выстраданных ошибок)
- Переменной --bg НЕТ: фоны — явные цвета или --soft-bg/--line с проверкой [data-theme='dark'].
- Дропдауны/попапы внутри карточек: родитель overflow: visible.
- В обработчиках input/textarea — e.currentTarget, не e.target.
- Server Actions в пропсах клиентских компонентов — Promise<unknown>, не Promise<void>.

## Не проверено после последних правок (первым делом)
- BookBar: пилюля на книжных страницах, автоколлапс паспорт→раздел, тумблер в настройках, отступ main.
- Слушатель wv-sb-set в SidebarNav; флаг wv-sb-auto читается.
- FontPicker: непрозрачный список в обеих темах, опции своими шрифтами.

## Хрупкие места (grep перед КАЖДЫМ релизом; прикрепления к чату могут содержать старые черновики!)
- lib/richtext.ts: после mention-push ровно один `} else if (m[3]`; refKind в типе, push, ветке mention.
- components/RichPreview.tsx: onRef в props компонента, props RunView, кнопка ветки mention.
- components/ChapterEditor.tsx: editor-shell-обёртка return, onRef={openRef}, reorderRefs, <RefDock onReorder>.
- components/RefDock.tsx: GripVertical, onReorder, updateCharacterFields, календарная строка даты.
- components/ImageAttach.tsx: `showPreview = true` в деструктуризации И `{showPreview && shown &&`.
- components/SidebarNav.tsx: кнопка toggleCollapsed и рейка в render, sb-hide на текстовых узлах,
   слушатель wv-sb-set, ОТСУТСТВИЕ битых комментариев вида `/* ignore /`.
- components/ExportButton.tsx: chapterId/mini, хуки только верхним уровнем.
- components/BookBar.tsx: существует, монтирован в layout, ITEMS 11, событие wv-sb-set.
- components/FontPicker.tsx: существует, используется в настройках дважды.
- components/IdeaBoard.tsx: onUp(n.id), autoGrow(e.currentTarget), Pin, COLORS 8.
- components/HomeView.tsx: SpineDeco, StatusIcon, GENRES классические, SWATCHES 8, isDark, CreateBookModal
   с Promise<unknown> и скрытыми полями genre/spineColor/spineStyle/seriesId/seriesNew.
- app/page.tsx: HomeView с series-пропом и shelfBooks (genre/spineColor/spineStyle/createdAt), секция
   idea-board, отсутствие старых форм создания книги/серий.
- app/settings/page.tsx: set-label/set-row/set-ctl-сетка, FontPicker вместо select, тумблер wv-sb-auto.
- electron/main.cjs: node --check; waitForServer 160; loadingPage с анимацией.
- app/globals.css: --sbw/.sb-aside/sb-collapsed .sb-hide; ширина полотна; .masonry; .editor-shell/.ref-dock/
   .run-mention; .lang-tile; .shelf/.spine/.spine-add/.shelf-board/.spine-preview/.spine-deco/.style-pick;
   .swatch*/.create-win; .set-*/.font-picker*; .idea-*/.note-swatch/.idea-modal-ta; .book-bar*.
- lib/i18n.ts: dock*, sb*, hv*, cb*, st_*, g_* (новые+легаси), ib*, setSub/setGroup*/setUpdatesRow/
   setSbAuto/setOn/setOff, bbPassport, c*, ego*, pnDupWord/pnSplit.
- prisma/schema.prisma: Book.genre/spineColor/spineStyle, model IdeaNote с color; клиент перегенерирован.

## Бэклог (после 1.6.0)
- Онбординг-слайды поверх гейта языка (wv-onboarding-done, 5 слайдов, «Пропустить», сброс в настройках).
- Унификация внутренностей редакторных компонентов настроек (AutosaveSetting, QuoteStyleSetting,
   DashSetting, PaletteSetting) в строки set-row — вторым проходом.
- Возврат управления сериями (архив/удаление) — место: окно создания или настройки.
- Стили корешков «С полосами» и «Гримуар»; счётчики на пилюле BookBar.
- Карта мира с точками; генеалогическое древо; эстетический проход (облако, виджеты);
   календарь мира — премиум; монетизация фазы 0–3; Yandex Speller opt-in.
- Премиум-словари: группировка записей по языкам + именованные зоны [lang:имя]; фильтрующий слой перед applyDictZones.

## Процедура релиза
Grep-чек-лист выше → changelog → FAQ → bump package.json + appinfo → db push --skip-generate + generate →
dist:win → коммит, тег, push → GH (setup + blockmap + latest.yml) → контроль автообновления.