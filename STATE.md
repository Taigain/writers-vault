# Writer's Vault — операционное состояние
Обновлено: 22.10.2026 (фиксация №16). Точка правды перед релизом 1.6.7.

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

## Рабочий набор 1.6.7 (реализовано, ждёт релиза)
1. Состав серии (премиум seriesRelations, в dev открыт): model SeriesChar (@@unique[seriesId,name],
   canonId) + SeriesRelation (@@unique[aId,bId]) + Character.seriesCharId (SetNull) + Series.cast;
   MIGRATIONS = 53; экшены getSeriesCast/createSoulFromCharacter/linkCharacterToSoul/
   unlinkCharacterFromSoul (канон на раннего выжившего, orderBy id asc — у Character НЕТ createdAt)/
   setSoulCanon/bringSoulIntoBook (копия всех полей досье + портрет с канона) с серверным гейтом
   seriesPremiumOk в каждом пишущем; SoulBlock первой карточкой вкладки «Анкета»; SeriesCastDialog +
   кнопка «Из состава серии…» в тулбаре реестра; чип .cr-polaroid-soul «также в: …» на полароидах.
2. Панель зон языка (финальная модель): lib/zones.ts (findZoneAt/zoneSpan/rezoneText/маркеры);
   components/ZoneMenu.tsx (общий словарь + группы с цветами + замки без премиума + «Управление
   группами…»); ChapterEditor: ОДИН span.zm-wrap = чип текущей зоны (caret из updateSel) + свободная
   кнопка (иконка Languages, commonZoneToggle: курсор в общей зоне → снять, в именованной → в общую,
   иначе wrapPair-тумблер) + премиальная кнопка (Earth + ChevronDown, открывает ZoneMenu) + один
   ZoneMenu; applyZonePick для выбора из меню (перезаворачивание/оборачивание/пара на курсор);
   кнопка одиночного слова ([~ключ]) из панели УБРАНА решением автора — движок, чип копирования и
   ручной ввод сохранены; i18n zm* + chTbZoneCommon/chTbZonePick.
3. BookPassport: оптимистичный seriesSel (useState + useEffect-синхронизация с пропом seriesId);
   onChange селекта пишет локально и уходит в setBookSeries; createSeriesInline фиксирует newId;
   крестик отмены сбрасывает seriesSel к пропу.
4. Рейка сайдбара минимальная: эксперимент с групповыми иконками ЗАКРЫТ решением автора; в рейке
   только логотип, «Домой» и нижние профиль/настройки/помощь; аватарок книг и иконок групп нет;
   развёрнутый сайдбар и навигация главной не изменились.
5. Главная: строка сортировки — селект с инлайн-геометрией (width 260, height 34, padding 0 10px,
   boxSizing border-box) в существующей обёртке flex justify-end; обрезка текста закрытого селекта
   устранена; globals.css не тронут.
6. Dormant-цепочка ?g=: page.tsx считает forceGroup и передаёт в HomeView, CollapsibleSection имеет
   forceOpen-эффект; входов из интерфейса нет (ссылок /?g= больше нет) — поведение нейтрально,
   удаление опционально двумя правками после релиза.
7. Премиум-реестр: ключи dictGroups и seriesRelations со visible 'hidden'; usePremium с
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
- Массивы FAQ обоих языков держат одинаковый порядок статей (и group, если живёт группированная версия).
- Премиум-срезы guarded на СЕРВЕРЕ в каждом пишущем экшене (seriesPremiumOk-паттерн); клиентский
  usePremium отвечает только за видимость UI.
- У Character нет createdAt — сортировки «ранний» по id asc (cuid начинается с метки времени).
- Модель панели зон: свободная кнопка (Languages) = общая зона с тумблером; премиальная (Earth+стрелка)
  = меню выбора словаря; чип = индикатор языка; кнопка одиночного слова НЕ возвращается.
- НОВОЕ: рейка минимальна по решению автора — без аватарок книг и без групповых иконок; каталог книг
  живёт только в развёрнутом сайдбаре и на главной; новые эксперименты с рейкой начинать с её макета.

## Не проверено после последних правок
- Релизный цикл 1.6.7: 53 миграции на старой базе при автообновлении; окно «Что нового» с четырьмя
  пунктами на обоих языках.
- Прод-невидимость: без PRO и вне dev премиальная Earth-кнопка, блок «В серии», кнопка «Из состава
  серии…» и группы словаря скрыты; серверный гейт отклоняет прямые вызовы экшенов состава.
- Живое дерево линтера: punct.ts/grammar.ts импортируют maskMarkers и гоняют правила по src (в
  прикреплениях встречались черновики без импорта и с правилами по text — сверять grep'ом).
- Живой richtext: ужесточённый курсив и ветка isSeparatorLine (черновики встречались старые).
- Живой DictSection: без мусорных импортов, с ColorSwatches и setDictEntryGroup (черновики встречались
  сломанные).
- SeriesRelation в схеме есть, но UI связей серии (стадия E2) НЕ построен: строки серийных связей
  создать нечем — это задел, не функция.

## Хрупкие места (grep перед КАЖДЫМ релизом; прикрепления к чату могут содержать старые черновики!)
- lib/prisma.ts: MIGRATIONS = 53; runMigrations ровно один раз в finally ensureSchema.
- prisma/schema.prisma: SeriesChar + SeriesRelation + Character.seriesCharId + Series.cast; клиент
  перегенерирован.
- lib/actions.ts: серийные экшены с seriesPremiumOk; unlink orderBy id asc; setSoulCanon select
  { id, bookId, seriesCharId }; getCharacters include seriesChar с doubles и полями soul/seriesCharId
  в map; react-импортов в шапке НЕТ.
- components/ChapterEditor.tsx: ОДИН span.zm-wrap (чип + Languages-кнопка commonZoneToggle + Earth-кнопка
  + один ZoneMenu); НЕТ хвоста-дубля (кнопка zmPick с marginLeft -2, второй ZoneMenu, лишний </span>);
  Earth в lucide-импорте; caret в updateSel; zoneAt/zoneSlug/zoneGroup после счётчиков; applyZonePick +
  commonZoneToggle + useRouter; usePremium ИМЕНОВАННЫМ импортом; type DictGroupRow; кнопки chTbDict НЕТ.
- components/SidebarNav.tsx: рейка = логотип + Home + низ (профиль/настройки/помощь); НЕТ books.map
  аватарок и НЕТ групповых иконок; Lightbulb/PenLine/Archive используются только в развёрнутом списке.
- components/HomeView.tsx: селект сортировки с инлайн-геометрией (width 260, height 34, padding 0 10px,
  boxSizing border-box), обёртка flex justify-end items-center gap-2; проп forceGroup принимается.
- app/page.tsx: forceGroup считается из searchParams и передаётся в HomeView; renderGroup без forceOpen
  ИЛИ с ним — цепочка dormant, на поведение не влияет.
- components/CollapsibleSection.tsx: forceOpen-эффект (если вставлен) раскрытие + scrollIntoView по id;
  корневой элемент несёт id={id}.
- lib/zones.ts и components/ZoneMenu.tsx существуют; стили .zm-* в globals.css.
- lib/punct.ts и lib/grammar.ts: import maskMarkers из './mask'; ВСЕ matchAll по src; в punct.ts НЕТ
  грамматического блока после сборки res.
- lib/richtext.ts: курсив /\*([^*\n]+)\*/g; жирный раньше; ветка isSeparatorLine с sep:true; RichBlock.sep.
- components/DictSection.tsx: импорты без мусора (DictGroupRow — тип из actions); группы и loadGroups на
  уровне секции; EntryCard получает unlocked/groups пропсами; ColorSwatches; setDictEntryGroup.
- components/LicenseProvider.tsx: usePremium с dev-флагом NODE_ENV.
- components/BookPassport.tsx: seriesSel + useEffect-синхронизация; крестик отмены сбрасывает к пропу.
- components/CharacterModal.tsx: SoulBlock первой карточкой перед секцией t('cdMain'); usePremium и
  SoulBlock импортированы.
- components/CharactersRegistry.tsx: castUnlocked + cast + castOpen; кнопка «Из состава серии…»;
  SeriesCastDialog в конце; RelateDialog рендерится.
- components/CharacterTile.tsx: чип soul.books + .cr-polaroid-soul.
- components/characterTypes.ts: CharRow с seriesCharId и soul.
- lib/faq.ts: семь правок фиксации №16 (рейка минимальная, состав серии, зоны с двумя кнопками, маркер
  слова без кнопки, мульти-словарь с Earth-меню, профиль без полос, альбом восстановлен); порядок RU/EN
  идентичен.
- lib/changelog.ts: запись 1.6.7 первая, четыре пункта на обоих языках.
- Прежний список: mask.ts MARKER_RE/isSeparatorLine; dictzones applyDictFull; markdown.ts + export-md
  маршрут (await ctx.params, filename*=UTF-8''); settings import Link; StorylineSection тумблер
  list/canvas + PlotCanvas; help page групповые заголовки; ExportMdButton на паспорте и в Главах;
  WhatsNewModal LS+cookie; projectPack + маршруты; LICENSE_PUB_B64 не плейсхолдер.

## Бэклог (после 1.6.7)
- Стадия E2: связи серии между душами (SeriesRelation UI): тумблер «Книга / Серия» во вкладке связей,
  серийное облако с узлами-душами, серверный гейт на создание/удаление.
- Удаление dormant-цепочки ?g= (forceGroup в page.tsx/HomeView, forceOpen в CollapsibleSection).
- Награды профиля: вернуть «/ N» и полосы + чипы наград (решение автора).
- Кнопки оплаты/триала/PRO в карточке плана при запуске подписки (PREMIUM_LAUNCH = true).
- Счётчики использований словаря: расширить на зонные подстановки, а не только [~ключ].
- Расширение .wvproj: boardX/boardY/canvasX/canvasY, BeatLink, DictGroup и seriesCharId-связки.
- Облачная синхронизация срезы 2–4; мудборд заметок; онбординг; управление сериями (архив/удаление);
  стили корешков «С полосами»/«Гримуар»; счётчики BookBar; накопление премиума; эстетический проход;
  Yandex Speller opt-in.

## Процедура релиза
Grep-чек-лист выше → changelog → FAQ → bump package.json + appinfo до 1.6.7 → db push --skip-generate
+ generate → dist:win → коммит, тег, push → GH (setup + blockmap + latest.yml) → контроль
автообновления и премиум-невидимости в проде.