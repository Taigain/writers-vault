# Writer's Vault — операционное состояние
Обновлено: 27.10.2026 (фиксация №21). Точка правды перед релизом 1.6.10.

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
- 1.6.8: резервные снимки книги (бэклог 10, троттлинг 10 минут, ручной чекпоинт, снимок перед удалением
  главы, восстановление с пересинком сцен/упоминаний/событий), посимвольный парсер меток без регулярок —
  чистота предпросмотра, чтения и экспортов.
- 1.6.9 (хотфикс): кнопка «Новая книга» в плиточном виде главной в строке сортировки/видов; объявлено
  восстановление титульного блока DOCX — живой статус блока проверяется аудитом релиза (см. «Не проверено»).

## Рабочий набор 1.6.10 (реализовано, ждёт релиза)
1. Облачный резерв (премиум cloudSync, в dev открыт):
   - schema: model CloudTarget (id, provider, name, rootPath, enabled, lastRunAt, lastStatus,
     createdAt) + Book.cloudBackup; MIGRATIONS += 2 (плюс 2 на SceneImage, итог 59).
   - lib/cloudScan.ts: scanCloudClients — Яндекс Диск (home/YandexDisk), Dropbox (info.json из
     %APPDATA% с фолбэком home/Dropbox), OneDrive (env OneDrive/OneDriveConsumer/OneDriveCommercial
     плюс скан папок home), Google Drive (home/Google Drive); дедупликация по provider+path, isDir.
   - lib/actions.ts: cloudPremiumOk серверный гейт; detectCloudClients/getCloudTargets/addCloudTarget/
     removeCloudTarget/setBookCloudBackup; cloudBackupBook = packBook → WriterVault/<mdSlug>/
     <штамп>.wvproj + latest.wvproj, атомарно через .tmp+rename, prune CLOUD_KEEP=5, статусы ok/ошибка
     по каждой цели, revalidate паспорта.
   - components/CloudBackupSection.tsx: секция настроек (поиск клиентов, список найденного минус уже
     добавленные пути, ручное поле пути, цели со статусами и удалением); рендер только при unlocked.
   - components/CloudUploadButton.tsx: на паспорте чекбокс cloudBackup + кнопка «Выгрузить сейчас» +
     строка результата; без премиума не рисуется.
   - i18n: префикс cld* (cl* занят окном истории обновлений), оба языка.
2. Иллюстрации сцен (премиум inlineImages, в dev открыт):
   - schema: model SceneImage (id, sceneId, bookId, caption, align, widthPct, base64, order, createdAt,
     @@index[sceneId]) + Scene.images; MIGRATIONS = 59 операторов всего.
   - lib/actions.ts: inlineImagesOk серверный гейт; getSceneImages/getSceneImagesForScene/
     getChapterSceneImages; createSceneImage (readImageField + order); updateSceneImage
     (caption/align/widthPct с зажимом 30–100); deleteSceneImage со sweep-вычисткой маркеров
     [img:id] из содержимого всех глав книги.
   - lib/richtext.ts: ветка сканера `tok.startsWith('[img:')` → run с imgId и пустым text;
     InlineRun.imgId опционален; альтернатив в регулярках нет (сканер ловит любой […]).
   - components/RichPreview.tsx: export type PreviewImage; проп images у RichPreview И у RunView;
     figure-рендер (img + подпись + textAlign по align + widthPct).
   - components/SceneSection.tsx: imgsUnlocked (usePremium inlineImages) + imgMap книги (getSceneImages)
     + <SceneImagesBlock sceneId unlocked> в карточке сцены перед предпросмотром + images в RichPreview
     карточки.
   - components/SceneImagesBlock.tsx: БЕЗ собственного <form> (карточка сцены уже форма — вложенные
     формы ломают гидратацию); одна кнопка «Добавить иллюстрацию» с скрытым file-инпутом; клиентский
     ресайз fileToBase64 (MAX_DIM 1600, jpeg 0.82); FormData строится на клиенте и уходит в
     createSceneImage напрямую; карточки изображений с подписью/селектом выравнивания/шириной/удалением.
   - components/InsertImageDialog.tsx + премиум-кнопка ChapterEditor (ImageIcon): диалог со сценами
     главы и миниатюрами, клик вставляет '[img:' + id + ']' в курсор через setC + restore; imgMap
     главы для предпросмотра редактора.
   - components/ReadMode.tsx: imgMap + getSceneImages в openReader третьим элементом Promise.all +
     проп images у RichPreview.
   - i18n: si* ключи (siTitle…siTb) в обоих языках.
3. Экспорты пока пропускают иллюстрации: DOCX-маршрут отбрасывает строки без текстовых ранов,
   Markdown ветки imgId не имеет — срез I2 в бэклоге.

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
- Премиум-срезы: dictGroups и seriesRelations с серверными гейтами; inlineImages гейтится только в UI и рендере (метка — свободный текст); облачный папочный контур
  и коллекция иллюстраций сцены — базовые без серверных гейтов.
- У Character нет createdAt — сортировки «ранний» по id asc (cuid начинается с метки времени).
- Модель панели зон: свободная кнопка (Languages) = общая зона с тумблером; премиальная (Earth+стрелка)
  = меню выбора словаря; чип = индикатор языка; кнопка одиночного слова НЕ возвращается.
- Рейка минимальна по решению автора: логотип, «Домой», низ профиль/настройки/помощь.
- Снимки книги — событийная модель без настроек периодичности; восстановление через тихий
  saveChapter(noSnap=true).
- Парсер меток — посимвольный сканер; новые токены веткой startsWith + (для линтера) MARKER_RE маски;
  диагностические зонды удаляются до фиксации.
- НОВОЕ: компоненты, встраиваемые в карточки сцен/глав, НЕ приносят собственных <form> — карточка уже
  форма; загрузка файлов идёт прямым вызовом экшена с FormData, собранной на клиенте.
- НОВОЕ: все новые.image-входы ресайзятся на клиенте (MAX_DIM 1600, jpeg 0.82) до сохранения base64.
- НОВОЕ: маркеры [img:id] вычищаются sweep'ом при удалении изображения; при каскадном удалении сцены
  маркеры остаются в тексте и рендерятся невидимо (карты нет) — чистит автор или sweep среза I2.

## Не проверено после последних правок
- Релизный цикл 1.6.10: 59 миграций на старой базе при автообновлении; окно «Что nuovo» с двумя
  пунктами на обоих языках.
- Аудит живого app/api/export/[bookId]/route.ts: титульный блок живыми параграфами (grep
  "children.push\(/" = 0 и "style: 'Title'" есть); прикрепления к чату ДО СИХ ПОР показывают
  комментарии-плейсхолдеры — если они живые, восстановить блок по пакету 1.6.9 ДО сборки.
- Прод-невидимость inlineImages: без PRO блок сцены, кнопка редактора и диалог скрыты; серверный гейт
  отклоняет createSceneImage/updateSceneImage.
- Живой контур облачного резерва C1: CloudTarget в схеме, cld* ключи без дублей, CloudBackupSection в
  настройках, CloudUploadButton на паспорте, детектор находит Яндекс Диск.
- I2 не построен: DOCX и Markdown пропускают иллюстрации (честно указано в FAQ).

## Хрупкие места (grep перед КАЖДЫМ релизом; прикрепления к чату могут содержать старые черновики!)
- lib/prisma.ts: MIGRATIONS = 59; runMigrations ровно один раз в finally ensureSchema.
- prisma/schema.prisma: SceneImage + Scene.images + CloudTarget + Book.cloudBackup + BookSnapshot +
  Book.snapshots + SeriesChar/SeriesRelation/Character.seriesCharId; клиент перегенерирован.
- lib/richtext.ts: ветка '[img:' ДО финального else зон; НЕТ TOKEN_RE; НЕТ console.log.
- components/RichPreview.tsx: images в сигнатуре RunView И RichPreview; export PreviewImage; передача
  images в RunView.
- components/ReadMode.tsx: imgMap состояние + getSceneImages в openReader + images у RichPreview.
- components/SceneSection.tsx: imgsUnlocked + imgMap + SceneImagesBlock перед предпросмотром карточки +
  images в RichPreview карточки.
- components/SceneImagesBlock.tsx: НЕТ тега <form>; одна кнопка добавления; fileToBase64; busy-метка
  через t('cldUploading').
- components/InsertImageDialog.tsx существует; ChapterEditor импортирует его из './InsertImageDialog'
  (НЕ из '@/lib/actions'!), ImageIcon в lucide-строке, imgMap + диалог с вставкой в курсор.
- lib/premium.ts: канонические четыре ключа (dictGroups, seriesRelations, cloudSync, inlineImages),
  union и REGISTRY без синтаксических дыр.
- lib/actions.ts: sceneImage-функции со sweep; cloudTarget-функции; mdSlug и packBook импорты;
  НЕТ react-импортов; НЕТ orderBy createdAt у Character.
- lib/i18n.ts: si* и cld* в обоих языках; clTitle принадлежит окну истории обновлений; дублей нет.
- app/api/export/[bookId]/route.ts: титульный блок живыми параграфами, без плейсхолдеров.
- Прежний список: punct/grammar импорт maskMarkers + правила по src; dictzones applyDictFull;
  export-md маршрут; DictSection без мусорных импортов; LicenseProvider dev-флаг; SidebarNav рейка;
  HomeView селект с инлайн-геометрией + кнопка «Новая книга» в тулбаре плиток; BookPassport seriesSel;
  CharacterModal SoulBlock; CharactersRegistry кнопка состава + SeriesCastDialog; CharacterTile чип
  soul.books; SnapshotsButton в шапке глав; WhatsNewModal LS+cookie; projectPack; LICENSE_PUB_B64.

## Бэклог (после 1.6.10)
- Срез I2: ImageRun в DOCX с подписью и выравниванием, data-URI в Markdown, sweep висячих маркеров при
  каскадном удалении сцен.
- Облака: расписание выгрузок (интервал-проверка по lastRunAt), OAuth Яндекс Диск (C2: localhost-callback,
  токены, refresh, REST-загрузка), адаптеры Google Drive/Dropbox (C3), pull-восстановление из облака.
- Стадия E2: связи серии между душами (SeriesRelation UI).
- Удаление dormant-цепочки ?g= (forceGroup в page.tsx/HomeView).
- Награды профиля; кнопки оплаты/триала/PRO при запуске подписки; счётчики использований словаря;
- Расширение .wvproj (boardX/boardY/canvasX/canvasY, BeatLink, DictGroup, seriesCharId-связки);
- Облачная синхронизация срезы 2–4; мудборд заметок; онбординг; управление сериями; стили корешков
  «С полосами»/«Гримуар»; счётчики BookBar; накопление премиума; эстетический проход; Yandex Speller opt-in.

## Процедура релиза
Аудит route.ts (титульный блок) → grep-чек-лист выше → changelog → FAQ → README-дельта → bump
package.json + appinfo до 1.6.10 → db push --skip-generate + generate → dist:win → коммит, тег, push →
GH (setup + blockmap + latest.yml) → контроль автообновления, премиум-невидимости inlineImages и
облачного контура в проде.