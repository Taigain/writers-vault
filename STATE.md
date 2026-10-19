# Writer's Vault — операционное состояние
Обновлено: 20.10.2026 (фиксация №13). Точка правды перед релизом 1.6.6.

## Выпущено
- ≤ 1.5.5: ядро (док справок, рейка, полотно, masonry, грамматика, вкладки персонажа, облако связей).
- 1.6.0 (ручное распространение; GH-релиз снят): гейт языка, загрузочный экран, полка с окном создания
  и стилями корешков, доска идей, BookBar с автоколлапсом рейки, единые настройки + FontPicker.
- 1.6.1: словарь v2, языковые зоны [lng]…[/lng] с заменой по человеческим формам и сохранением регистра.
- 1.6.2: автосоздание событий из меток [#…], человеческие метки, таймлайн-синопсис (TimelineCard),
  стабильный редактор на циклах «обернуть/снять зону».
- 1.6.3: окно «Что нового» с cookie-отметкой, серии инлайн в паспорте, ссылка разработчика, корешки по
  корню из объёма, три галочки экспорта DOCX, пакет .wvproj (экспорт/импорт).
- 1.6.4: альбом полароидов и пробковая доска персонажей (пины, нити по типу связи, драг с запоминанием,
  растягивание, режим «Связать персонажей» с диалогом типа), полноэкранное досье с секциями и стоковыми
  портретами по полу, симметричные связи (kind mutual/oneway), сюжетный холст (drag-биты, нити от четырёх
  якорей, двойной клик создаёт бит, группа «Биты вне линий»).
- 1.6.5: профиль автора (AuthorProfile + страница /profile с именем/псевдонимами/жанрами, карточкой плана
  «В разработке» и чистой статистикой без вех), имя автора на паспорте (витрина + селект + четвёртая
  галочка emAuthor + курсивная строка DOCX), справка-журнал (липкое оглавление, скроллспай), единая ссылка
  /profile в sb-bottom, гидратация layout (next/script beforeInteractive, гейты без localStorage в рендере).

## Рабочий набор 1.6.6 (реализовано, ждёт релиза)
1. Мульти-словарь (премиум за гейтом usePremium('dictGroups'), в dev открыт): model DictGroup
   (@@unique[bookId,slug]) + DictEntry.groupId + Book.dictGroups; экшены getDictGroups/createDictGroup/
   renameDictGroup (переписывает [lang:старый] по главам)/deleteDictGroup (SetNull в общий)/
   setDictEntryGroup; getDict отдаёт groupId; lib/dictzones.ts applyDictFull — один проход: [~ключ]
   глобально, [lang:slug] только своей группой (неизвестный slug → общий), [lng] только общим;
   DictSection: блок групп при unlocked, палитра ColorSwatches из 10 образцов (скрытый input цвета,
   активный — двойной box-shadow + scale + белая галочка + hex текстом), селект принадлежности в карточке.
2. Лечение линтера и разделитель `***`: lib/mask.ts maskMarkers (пробелы той же длины, офсеты 1:1) +
   isSeparatorLine; punct.ts и grammar.ts маскируют текст и гоняют правила по src (bad/pos из оригинала),
   мёртвый грамматический блок из punct.ts удалён; richtext.ts: курсив /\*([^*\n]+)\*/g, жирный раньше,
   parseRichText первой проверкой ловит '***' и пушит блок {align:'center', sep:true, '* * *'},
   RichBlock.sep?: boolean; рендереры добавляют ...(b.sep ? {letterSpacing:8, color:var(--soft)} : null);
   export-маршрут DOCX пушит центрированный Paragraph '* * *'.
3. Экспорт в Markdown: lib/markdown.ts (mdSlug, mdQuote, richToMarkdown: applyDictFull → снятие меток →
   -- в тире); маршрут /api/export-md/[bookId] с await ctx.params (Next 15) и Content-Disposition через
   filename*=UTF-8'' (RFC 5987); ExportMdButton на паспорте (перед .wvproj) и в шапке Глав.
4. Справка с группами: lib/faq.ts FaqItem.group?: string, девять групп в обоих языках одинаковым порядком
   (Начало работы / Книги и структура / Редактор и текст / Персонажи / Сюжет и мир / Словарь и языки /
   Экспорт и чтение / Интерфейс / Профиль автора); app/help/page.tsx строит оглавление по первым
   вхождениям групп и рисует серифные групповые заголовки внутри потока статей; CSS .help-toc-group,
   .help-toc-group-gap, .help-group-head, .help-toc > ul против вложенных ul; статьи мульти-словаря,
   Markdown-экспорта, альбома/доски (полный текст) и профиля (чистые счётчики) приведены к боевому коду.
5. lib/prisma.ts: MIGRATIONS = 48 операторов (45 фиксации №12 + CREATE DictGroup + UNIQUE INDEX +
   ALTER DictEntry groupId); runMigrations ровно один раз в finally ensureSchema.

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
- ResizeObserver без петель: наблюдатель мерит только ширину; высота — функция данных.
- Boxed String в типах не использовать; служебные пометки-плейсхолдеры никогда не вставлять в код.
- Инлайн-скрипты в layout — только next/script (beforeInteractive); чтение localStorage/window в
  клиентских компонентах — только в useEffect, первый рендер идентичен серверному.
- Линтер всегда маскирует текст через maskMarkers перед правилами; офсеты читаются из оригинала.
- Next 15 route handlers: params — Promise, всегда `const { bookId } = await ctx.params`.
- HTTP-заголовки с не-ASCII в Content-Disposition — только через RFC 5987 (filename*=UTF-8''…).
- Статистика профиля без вех до решения о наградах; полосы и «/ N» вернутся вместе с наградами.
- НОВОЕ: массивы FAQ обоих языков держат одинаковый порядок статей и одинаковую последовательность
  group — оглавление и якоря строятся по индексу, рассинхрон языков ломает навигацию справки.

## Не проверено после последних правок
- Релизный цикл 1.6.6: 48 миграций на старой базе при автообновлении; окно «Что нового» с четырьмя
  пунктами на обоих языках.
- Справка: групповое оглавление и групповые заголовки в RU и EN, скроллспай поверх групповых заголовков,
  узкое окно без оглавления с заголовками групп в потоке.
- Мульти-словарь в dev end-to-end: две группы, скоуп подстановки, фолбэк неизвестного slug,
  переименование с переписыванием глав, удаление с возвратом в общий.
- Markdown-файл с кириллическим названием книги скачивается без кракозябр; разделитель `***` в md/docx.

## Хрупкие места (grep перед КАЖДЫМ релизом; прикрепления к чату могут содержать старые черновики!)
- lib/prisma.ts: верх = импорт + g/prisma + MIGRATIONS(48) + runMigrations; вызов ровно один (finally).
- lib/mask.ts: MARKER_RE содержит все сервис-метки приложения; isSeparatorLine = '***'.
- lib/punct.ts и lib/grammar.ts: импорт maskMarkers из './mask'; первая строка функции — const src =
  maskMarkers(text); ВСЕ matchAll по src; bad/pos из text; в punct.ts НЕТ грамматического блока.
- lib/richtext.ts: курсив /\*([^*\n]+)\*/g; жирный раньше курсива; ветка isSeparatorLine с sep:true;
  RichBlock.sep?: boolean; ветки [lng] НЕ завалены внутрь ветки size.
- lib/dictzones.ts: applyDictFull — три regex-слоя с разными скоупами; фолбэк неизвестного slug на общий.
- lib/markdown.ts + app/api/export-md/[bookId]/route.ts: await ctx.params; filename*=UTF-8''.
- components/DictSection.tsx: импорты без мусора (DictGroupRow — тип из actions, Trash2/Plus — lucide);
  группы и loadGroups на уровне секции (bookId в скоупе); EntryCard получает unlocked/groups пропсами.
- components/LicenseProvider.tsx: usePremium с dev-разблокировкой (NODE_ENV === 'development').
- components/SidebarNav.tsx: ОДНА ссылка /profile в sb-bottom; в рейке профиля НЕТ.
- app/settings/page.tsx: import Link from 'next/link' для карточки профиля.
- components/CharactersRegistry.tsx: relatePair + рендер RelateDialog после CharacterModal + useRouter.
- components/StorylineSection.tsx: тумблер view list/canvas + PlotCanvas + orphans-группа.
- lib/faq.ts: FaqItem с group?: string; девять групп; RU и EN одинаковым порядком; статьи мульти-словаря/
  markdown/альбома(полный)/профиля(чистые счётчики) в актуальных формулировках.
- app/help/page.tsx: groups по первым вхождениям; help-group-head при смене группы; якоря faq-i;
  скроллспай IntersectionObserver rootMargin '-30% 0px -60% 0px'.
- app/globals.css: .help-toc > ul, .help-toc-group, .help-toc-group-gap, .help-group-head, .dg-swatch,
  .pf-stat-row, .bp-author-display, .pc-*, .cr-*, .charpage-*; html scroll-behavior smooth один.
- lib/i18n.ts: dg* (Title/Name/Create/DeleteConfirm/Common/EntryGroup), exMd, pf*, help*, bpAuthor*,
  emAuthor + прежние наборы (cr*/cm*/cd*/rl*/slView*/slOrphans/pc*, wnTitle/wnOk, ppExport/ppImport,
  emInclude/emTitle/emAnnotation/emSynopsis, cbSeries*, lic*).
- prisma/schema.prisma: DictGroup + DictEntry.groupId + Book.dictGroups; AuthorProfile; Book.authorName/
  exportAuthor/boardH; Character +21 + boardX/boardY; CharacterRelation.kind; PlotBeat.canvasX/canvasY +
  linksA/linksB; BeatLink; клиент перегенерирован.
- Прежний список: richtext один `} else if (m[3]` после mention-push; RichPreview onRef ×3; RefDock
  GripVertical/onReorder; ImageAttach showPreview ×2; ExportButton chapterId/mini; HomeView sqrt-ширина;
  IdeaBoard onUp(n.id); BookBar 11 пунктов; FontPicker явный фон; WhatsNewModal LS+cookie; projectPack +
  маршруты + ImportProjectButton; LICENSE_PUB_B64 не плейсхолдер; getCharacters с relationsAll и рабочим
  include (НИКАКИХ пометок-плейсхолдеров).

## Бэклог (после 1.6.6)
- Шаг D2: сплит-кнопка языковой зоны в панели редактора с меню групп и чипом текущей зоны у курсора.
- Подключение applyDictFull к предпросмотру/чтению, если grep найдёт старые точки подстановки.
- Счётчики использований словаря: расширить на зонные подстановки, а не только [~ключ].
- Награды профиля: вернуть «/ N» и полосы + чипы наград (решение автора).
- Кнопки оплаты/триала/PRO в карточке плана при запуске подписки (PREMIUM_LAUNCH = true).
- Расширение .wvproj: boardX/boardY/canvasX/canvasY, BeatLink и DictGroup в packBook/unpackBook.
- Облачная синхронизация срезы 2–4; мудборд заметок; онбординг; управление сериями; стили корешков
  «С полосами»/«Гримуар»; счётчики BookBar; накопление премиума; эстетический проход; Speller opt-in.

## Процедура релиза
Аудит-чек-лист ниже → changelog → FAQ → bump package.json + appinfo до 1.6.6 → db push --skip-generate +
generate → dist:win → коммит, тег, push → GH (setup + blockmap + latest.yml) → контроль автообновления.