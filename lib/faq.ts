import type { Lang } from './i18n'

export type FaqItem = { q: string; a: string }

export const FAQ: Record<Lang, FaqItem[]> = {
  ru: [
    {
      q: 'Где хранятся мои данные?',
      a: 'В локальной базе на вашем компьютере. Установленная версия: %APPDATA%\\writer-app\\dev.db (вставьте путь в адресную строку проводника). Dev-версия: prisma\\dev.db в папке проекта. В интернет не отправляется ничего. Резервная копия = скопировать файл dev.db на внешний диск.',
    },
    {
      q: 'Как связывать персонажей и события?',
      a: 'В тексте главы пишите [@имя] для персонажей и [#описание] для событий — или выделите текст и нажмите кнопки @ и # на панели редактора, метки вставятся сами. Персонажи дополнительно отзываются на псевдонимы, события — на метки (см. следующие пункты). После сохранения главы связи появятся в карточках, на таймлайне и в облаке связей.',
    },
    {
      q: 'Что такое «Тэги и псевдонимы» персонажа?',
      a: 'Поле в карточке персонажа: перечислите через запятую варианты имени, фамилию, прозвища («Соколов, Дим»). Тогда [@Соколов] в тексте привяжет главу к той же карточке, что и [@имя]. Удобно, когда герой появляется в тексте под разными формами имени.',
    },
    {
      q: 'Что такое метка события?',
      a: 'Короткий код события в таймлайне, например #падение_станции (поле в карточке события). В главе достаточно написать [#падение_станции] вместо полного описания события — связь создастся по метке. Полное описание в [#…] продолжает работать для старых глав. Метка видна чипом в карточке события.',
    },
    {
      q: 'Команды форматирования текста',
      a: '**жирный** — полужирный, *курсив* — курсив, [size=24]текст[/size] — размер шрифта, [center], [right], [left] в начале абзаца — выравнивание. Кнопки панели инструментов сами ставят и снимают эти метки с выделенного текста.',
    },
    {
      q: 'Как убрать форматирование?',
      a: 'Выделите фрагмент и нажмите «Ластик» на панели. Он снимет теги размера, жирный, курсив и метки выравнивания внутри выделения.',
    },
    {
      q: 'Автосохранение и защита от потерь',
      a: 'Редактор сохраняет изменения сам: частота настраивается в «Настройки → Редактор» (по умолчанию 1 минута, можно выключить). Кнопка Save на панели главы сохраняет мгновенно и подсвечивается золотым, пока есть несохранённые изменения. При закрытии приложения с несохранённым текстом появится диалог: сохранить и выйти, выйти без сохранения или отмена. Статус внизу редактора: «сохранено в ЧЧ:ММ» или «есть несохранённые изменения».',
    },
    {
      q: 'Дзен-режим: как писать без отвлекающих элементов?',
      a: 'Кнопка с квадратом и стрелками на панели главы разворачивает редактор на весь экран: белый лист шириной 80%, сверху тонкая шапка с названием, статусом сохранения и панелью инструментов. Выход — та же кнопка, кнопка свернуть в шапке или Esc. Текст, автосохранение и поиск продолжают работать.',
    },
    {
      q: 'Поиск: по книге и внутри главы',
      a: 'Строка «Поиск по тексту книги» сверху раздела «Главы» ищет по названиям и тексту всех глав: клик по результату раскрывает главу, прокручивает к совпадению и выделяет его, счётчик «Совпадение N из M» листает вхождения. Внутри главы есть собственная строка «Поиск в главе…»: Enter и стрелки переходят по совпадениям, F3/Shift+F3 работают прямо из текста, Esc возвращает курсор в строку поиска.',
    },
    {
      q: 'Как считаются слова и знаки?',
      a: 'Объём главы = слова названия плюс слова текста; знаки — длина названия плюс длина текста. Чип в шапке главы, счётчики панели и дзена показывают это значение, суммы актов и всей книги складываются из него. Переименование главы пересчитывает всё мгновенно. Когда в редакторе выделен фрагмент, внизу дополнительно показываются слова и знаки выделения — удобно считать объём цитаты или сцены.',
    },
    {
      q: 'Изображения: локации, портреты, мир',
      a: 'К картинкам прикрепляются: локации (изображение в карточке), персонажи (вертикальный портрет 3:4, виден в аватаре карточки), записи о мире, заметки. Большие файлы сжимаются на вашем устройстве перед сохранением, поэтому база не раздувается. Клик по изображению открывает полноэкранный просмотр; Esc, клик по фону или крестик закрывают его.',
    },
    {
      q: 'Как работает экспорт в DOCX?',
      a: 'Кнопка «Экспорт в DOCX» в разделе «Главы» и на паспорте книги. В документ попадают заголовок книги, аннотация, акты (заголовки 1 уровня) и главы внутри актов (уровень 2), одиночные главы — уровнем 1. Формат по умолчанию — стандарт сдаваемых рукописей: Times New Roman 11 pt, интервал после абзаца 8 pt, межстрочный 1.08. Жирный, курсив и выравнивание сохраняются; явный [size=NN] в тексте перебивает кегль по умолчанию. Служебные символы (@, #, звёздочки) не попадают. Тумблер «Включать название, аннотацию и синопсис в экспорт DOCX» на паспорте книги управляет составом титульного блока: настройка каждой книги, запоминается. Куда сохраняется: в папку из настроек (Chrome/Edge) или в «Загрузки».',
    },
    {
      q: 'Как импортировать книгу из DOCX?',
      a: 'Кнопка «Импорт из DOCX» на главной создаёт новую книгу из файла: главы разбиваются по заголовкам H1 и H2, текст до первого заголовка попадает в «Главу 1», жирный и курсив сохраняются. Изображение обложки с первой страницы (картинка до первого текста) подтягивается автоматически и нормализуется до 1400 px. Кнопка «Импорт глав из DOCX» в разделе «Главы» дописывает главы в конец существующей книги, её обложка не трогается. Старый формат .doc не поддерживается: сохраните файл как .docx в Word или LibreOffice и повторите.',
    },
    {
      q: 'Режим чтения: как прочитать написанное как книгу?',
      a: 'Кнопка «Читать» в разделе «Главы» открывает полноэкранный книжный экран: главы в порядке книги с актами, навигация списком глав, стрелками на экране и клавишами ←/→, выход по Esc. Текст показывается форматированным, как в готовой книге — удобно вычитывать рукопись целиком.',
    },
    {
      q: 'Что такое серии и циклы?',
      a: 'Серия — общий заголовок для нескольких книг (например, «Трилогия огня»). Создаётся на главной странице в разделе «Серии и циклы». В паспорте книги привязываете её к серии — на главной книги автоматически группируются под заголовком серии со счётчиком. Группы серий и блок «Без серии» сворачиваются кликом по заголовку — удобно при большом количестве книг, состояние запоминается. Удаление серии не удаляет книги, а возвращает их в «Вне серии».',
    },
    {
      q: 'Что такое акты внутри книги?',
      a: 'Акт — именованная часть произведения: пролог, Акт I, Акт II, эпилог и т.п. В шапке каждой главы есть селект акта и кнопка «+» для создания нового на месте. Главы внутри акта перемещаются стрелками ↑↓ только внутри своего акта. Переименовать акт, удалить (расформировать) или переместить его целиком можно на панели акта над его главами.',
    },
    {
      q: 'Как менять порядок глав и актов?',
      a: 'Стрелки ↑↓ в шапке главы перемещают её внутри акта (или среди глав вне актов). Стрелки на панели акта двигают акт блоком вместе с главами. Перемещать можно и в свёрнутом виде. Порядок в списке, в сайдбаре, в режиме чтения и в экспорте всегда одинаковый; привязки таймлайна и упоминания не страдают.',
    },
    {
      q: 'Группы книг: задумки, в работе, архив',
      a: 'Главная страница делит книги на три сворачиваемые группы: «Задумки», «В работе» и «Архив». Книга переносится между ними переключателем статуса на её паспорте — новая книга по умолчанию попадает в «В работе». Серия архивируется и возвращается целиком кнопкой с иконкой архива на её чипе в блоке «Серии и циклы»: это переводит все книги серии сразу. Пустые группы не отображаются, состояние групп запоминается.',
    },
    {
      q: 'Заметки: список и доска',
      a: 'Раздел «Заметки» книги — рабочий журнал автора: у заметки есть тип (персонажи, локации, события, сюжет, другое), чекбокс «Готово» с зачёркиванием и прикрепляемое изображение. Два вида: список (сворачиваемые карточки с редактором) и доска (карточки свободно перетаскиваются мышью, раскладка запоминается). Клик по карточке на доске открывает окошко с подробностями, редактором и удалением. Выбранный вид запоминается отдельно для каждой книги.',
    },
    {
      q: 'Сюжетные линии и биты',
      a: 'Раздел «Сюжет» держит движение линий произведения: создайте линии (основную и второстепенные) и разложите внутри каждой биты — сцены в нужном порядке. Бит связывается с главой и с событием таймлайна: чипы «Глава N» и «книжное: год X, день Y» показывают позицию бита в изложении и в хронологии рядом — сюжетные скачки и одновременные события видны сразу. Бит без главы — запланированная сцена (черновое движение линии); поставьте ссылку, когда сцена написана. Стрелки меняют порядок битов и линий.',
    },
    {
      q: 'Чем календарное время отличается от книжного?',
      a: 'Календарное — обычные даты. Книжное — год и день года (1–365) от начала истории. Год может быть отрицательным: −2 означает «за два года до начала истории»; года 0 не существует, используйте 1 или −1. Событие можно привязать к главе напрямую или меткой [#…] в тексте — тогда оно появится в списке «В главах-упоминаниях».',
    },
    {
      q: 'Зачем хэштеги у записей о мире?',
      a: 'Теги вида #магия #лор задаются при создании записи. В разделе «Мир» есть фильтр по хэштегам — нажмите тег, чтобы видеть только связанные записи. К записи можно прикрепить изображение-иллюстрацию.',
    },
    {
      q: 'Режимы облака связей',
      a: '«Сюжет» — главы и что с ними связано. «Персонажи» — персонажи и их появления. «События» — события таймлайна и участники. Колесо мыши — масштаб, перетаскивание мышью — перемещение, кнопки — зум и полный экран.',
    },
    {
      q: 'Как сменить язык, тему, шрифты?',
      a: 'Флажки RU/EN в боковой панели над пунктом «Помощь» переключают язык мгновенно, без захода в настройки. В разделе «Настройки»: язык интерфейса, тема (светлая/тёмная), шрифт интерфейса и шрифт текста глав, папка экспорта по умолчанию, частота автосохранения. Всё применяется сразу и запоминается.',
    },
    {
      q: 'Как обновить приложение и не потерять книги?',
      a: 'Начиная с версии 1.1.2 приложение обновляется само: находит новую версию, скачивает в фоне и предлагает перезапуск. Кнопка «Проверить обновления» в «Настройки → О программе» запускает проверку вручную. Ручная установка поверх старой тоже безопасна: книги лежат отдельно от файлов программы (в %APPDATA%\\writer-app) и установщиком не затрагиваются. База мигрирует автоматически: новые колонки и таблицы добавляются без потери книг. Перед крупными обновлениями делайте копию dev.db.',
    },
    {
      q: 'Как сообщить об ошибке или предложить идею?',
      a: 'В «Настройки → О программе» есть форма связи: опишите проблему или идею и нажмите «Открыть в почтовой программе» — письмо уйдёт автору с автоматически приложенными версией приложения и системой. Кнопки рядом копируют адрес и текст письма в буфер, если почтовый клиент не настроен. Адрес автора продублирован там же.',
    },
    {
      q: 'Как перенести книги на другой компьютер?',
      a: 'Скопируйте файл dev.db (см. «Где хранятся мои данные?») и положите его по тому же пути на новом компьютере с установленным приложением — перенесутся все книги, персонажи и связи.',
    },
    {
      q: 'Как поддержать автора?',
      a: 'В разделе «Настройки», блок «О программе», есть кнопки «Поблагодарить автора». Они открывают платёжные страницы во внешнем браузере.',
    },
  ],
  en: [
    {
      q: 'Where is my data stored?',
      a: 'In a local database on your computer. Installed version: %APPDATA%\\writer-app\\dev.db (paste the path into Explorer). Dev version: prisma\\dev.db in the project folder. Nothing is ever sent online. Backup = copy the dev.db file to an external drive.',
    },
    {
      q: 'How do character and event links work?',
      a: 'In chapter text write [@name] for characters and [#description] for events — or select text and press the @ and # buttons on the editor toolbar to insert the markers automatically. Characters also respond to aliases, events to tags (see next items). After saving the chapter, links appear on cards, on the timeline and in the relationship cloud.',
    },
    {
      q: 'What are character "Tags & aliases"?',
      a: 'A field on the character card: list name variants, last name, nicknames comma-separated ("Sokolov, Dim"). Then [@Sokolov] in the text links the chapter to the same card as [@name]. Handy when a character appears under different name forms.',
    },
    {
      q: 'What is an event tag?',
      a: 'A short code for a timeline event, e.g. #station_fall (field on the event card). In a chapter it is enough to write [#station_fall] instead of the full event description — the link is created by tag. Full descriptions in [#…] keep working for older chapters. The tag is shown as a chip on the event card.',
    },
    {
      q: 'Text formatting commands',
      a: '**bold** — bold, *italic* — italic, [size=24]text[/size] — font size, [center], [right], [left] at paragraph start — alignment. Toolbar buttons add and remove these markers on selected text automatically.',
    },
    {
      q: 'How do I clear formatting?',
      a: 'Select the fragment and press the Eraser on the toolbar. It removes size tags, bold, italic and alignment markers inside the selection.',
    },
    {
      q: 'Auto-save and loss protection',
      a: 'The editor saves changes by itself: frequency is set in Settings → Editor (1 minute by default, can be turned off). The Save button on the chapter toolbar saves instantly and glows gold while there are unsaved changes. Closing the app with unsaved text shows a dialog: save and exit, exit without saving, or cancel. Status at the editor footer: "saved at HH:MM" or "unsaved changes".',
    },
    {
      q: 'Zen mode: how do I write without distractions?',
      a: 'The expand button on the chapter toolbar opens the editor fullscreen: a white sheet 80% wide with a thin header holding the title, save status and toolbar. Exit via the same button, the minimize button in the header, or Esc. Text, auto-save and search keep working.',
    },
    {
      q: 'Search: book-wide and inside a chapter',
      a: 'The "Search book text" bar pinned at the top of the Chapters section searches all chapter titles and texts: clicking a result opens the chapter, scrolls to the match and selects it, and the "Match N of M" counter cycles occurrences. Inside a chapter there is its own "Find in chapter…" field: Enter and arrows cycle matches, F3/Shift+F3 work from the text, Esc returns the cursor to the find field.',
    },
    {
      q: 'How are words and characters counted?',
      a: 'A chapter volume = words of the title plus words of the text; characters = title length plus text length. The header chip, toolbar counters and zen counters show this value; act and book totals sum it. Renaming a chapter recalculates everything instantly. When a fragment is selected in the editor, the footer additionally shows the selection\'s words and characters — handy for quoting or scene sizing.',
    },
    {
      q: 'Images: locations, portraits, world',
      a: 'Images can be attached to locations (image on the card), characters (vertical 3:4 portrait shown in the card avatar), world lore entries and notes. Large files are downscaled on your device before saving, so the database stays lean. Clicking an image opens full-screen view; Esc, backdrop click or the cross closes it.',
    },
    {
      q: 'How does DOCX export work?',
      a: 'The "Export to DOCX" button in the Chapters section and on the book passport. The document receives the book title, annotation, acts (level-1 headings) and their chapters (level 2); standalone chapters are level 1. Default format matches submission standards: Times New Roman 11 pt, 8 pt after paragraphs, 1.08 line spacing. Bold, italic and alignment are preserved; explicit [size=NN] overrides the default size. Service symbols (@, #, asterisks) are excluded. The "Include title, annotation and synopsis in DOCX export" toggle on the book passport controls the title block contents: per-book and persisted. Saved to the folder from settings (Chrome/Edge) or to Downloads.',
    },
    {
      q: 'How do I import a book from DOCX?',
      a: 'The "Import from DOCX" button on the home page creates a new book from a file: chapters are split by H1 and H2 headings, text before the first heading goes into "Chapter 1", bold and italic are preserved. A cover image from the first page (an image before the first text) is pulled in automatically and normalized to 1400 px. The "Import chapters from DOCX" button in the Chapters section appends chapters to an existing book without touching its cover. Legacy .doc is not supported: save the file as .docx in Word or LibreOffice and retry.',
    },
    {
      q: 'Reading mode: how do I read my work like a book?',
      a: 'The "Read" button in the Chapters section opens a fullscreen book view: chapters in book order with acts, navigation via the chapter list, on-screen arrows and ←/→ keys, Esc to close. The text is shown formatted, like a finished book — convenient for proofreading the whole manuscript.',
    },
    {
      q: 'What are series and cycles?',
      a: 'A series is a shared title for several books (e.g. "Fire Trilogy"). Create one on the home page in "Series and cycles". Link a book to a series in its passport — books on the home page automatically group under the series heading with a count. Series groups and the "Standalone" block collapse by clicking their headings — handy with many books; the state is remembered. Deleting a series does not delete books, it returns them to "Standalone".',
    },
    {
      q: 'What are acts inside a book?',
      a: 'An act is a named part of the work: prologue, Act I, Act II, epilogue, etc. Each chapter header has an act selector and a "+" button to create a new act on the spot. Chapters move up/down with arrows only within their own act. Rename, delete (dissolve) or move an act as a whole via the act panel above its chapters.',
    },
    {
      q: 'How do I reorder chapters and acts?',
      a: 'The ↑↓ arrows in a chapter header move it within its act (or among act-free chapters). The arrows on the act panel move the act as a block with its chapters. Reordering works from the collapsed state. The order in the list, the sidebar, reading mode and the export is always the same; timeline links and mentions are preserved.',
    },
    {
      q: 'Book groups: ideas, in progress, archive',
      a: 'The home page splits books into three collapsible groups: "Ideas", "In progress" and "Archive". A book moves between them via the status switch on its passport — new books land in "In progress" by default. A series is archived and restored as a whole via the archive icon button on its chip in the "Series and cycles" block: it moves all books of the series at once. Empty groups are hidden; group state is remembered.',
    },
    {
      q: 'Notes: list and board',
      a: 'The book\'s "Notes" section is the author\'s working journal: a note has a type (characters, locations, events, plot, other), a "Done" checkbox with strikethrough and an attachable image. Two views: list (collapsible cards with an editor) and board (cards dragged freely with the mouse, layout persisted). Clicking a card on the board opens a details window with the editor and delete. The chosen view is remembered per book.',
    },
    {
      q: 'Storylines and beats',
      a: 'The "Plot" section tracks the movement of storylines: create lines (main and secondary) and lay out beats — scenes in the order you need — inside each. A beat links to a chapter and to a timeline event: the chips "Chapter N" and "book time: year X, day Y" show the beat\'s position in narration and in chronology side by side, so plot jumps and simultaneous events become visible. A beat without a chapter is a planned scene (draft movement); set the link once the scene is written. Arrows reorder beats and lines.',
    },
    {
      q: 'Calendar time vs book time?',
      a: 'Calendar — real-world dates. Book — year and day of year (1–365) since the story start. The year can be negative: −2 means "two years before the story begins"; there is no year 0, use 1 or −1. An event can be pinned to a chapter directly or via a [#…] tag in the text — it then appears in "In chapters".',
    },
    {
      q: 'What are world-lore hashtags for?',
      a: 'Tags like #magic #lore are set when creating an entry. The World section has a hashtag filter — click a tag to see only related entries. An illustration image can be attached to an entry.',
    },
    {
      q: 'Relationship cloud modes',
      a: '"Plot" — chapters and their links. "Characters" — characters and their appearances. "Events" — timeline events and participants. Mouse wheel — zoom, drag — pan, buttons — zoom and fullscreen.',
    },
    {
      q: 'How do I change language, theme, fonts?',
      a: 'RU/EN flags in the sidebar above Help switch the language instantly, without opening Settings. The Settings section holds interface language, theme (light/dark), interface font and chapter text font, default export folder and auto-save frequency. Everything applies instantly and is remembered.',
    },
    {
      q: 'How do I update without losing books?',
      a: 'Since version 1.1.2 the app updates itself: it finds a new version, downloads it in the background and offers a restart. The "Check for updates" button in Settings → About triggers a manual check. Manual install over the old version is also safe: books live separately from program files (in %APPDATA%\\writer-app) and are untouched by the installer. The database auto-migrates: new columns and tables are added without losing books. Make a dev.db copy before major updates.',
    },
    {
      q: 'How do I report a bug or suggest an idea?',
      a: 'Settings → About has a contact form: describe the issue or idea and press "Open in mail app" — the letter goes to the author with the app version and system details attached automatically. Buttons nearby copy the address and the letter text to the clipboard if no mail client is configured. The author email is shown there as well.',
    },
    {
      q: 'How do I move books to another PC?',
      a: 'Copy the dev.db file (see "Where is my data stored?") and place it at the same path on the new computer with the app installed — all books, characters and links will transfer.',
    },
    {
      q: 'How do I support the author?',
      a: 'In Settings → About there are "Thank the author" buttons. They open the payment pages in the external browser.',
    },
  ],
}