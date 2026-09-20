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
      q: 'Изображения: локации, портреты, мир',
      a: 'К картинкам прикрепляются: локации (изображение в карточке), персонажи (вертикальный портрет 3:4, виден в аватаре карточки), записи о мире. Большие файлы сжимаются на вашем устройстве перед сохранением, поэтому база не раздувается. Клик по изображению открывает полноэкранный просмотр; Esc, клик по фону или крестик закрывают его.',
    },
    {
      q: 'Как работает экспорт в DOCX?',
      a: 'Кнопка «Экспорт в DOCX» в разделе «Главы» и на паспорте книги. В документ попадают заголовок книги, аннотация, акты (заголовки 1 уровня) и главы внутри актов (уровень 2), одиночные главы — уровнем 1. Формат по умолчанию — стандарт сдаваемых рукописей: Times New Roman 11 pt, интервал после абзаца 8 pt, межстрочный 1.08. Жирный, курсив и выравнивание сохраняются; явный [size=NN] в тексте перебивает кегль по умолчанию. Служебные символы (@, #, звёздочки) не попадают. Куда сохраняется: в папку из настроек (Chrome/Edge) или в «Загрузки».',
    },
    {
      q: 'Что такое серии и циклы?',
      a: 'Серия — общий заголовок для нескольких книг (например, «Трилогия огня»). Создаётся на главной странице в разделе «Серии и циклы». В паспорте книги привязываете её к серии — на главной книги автоматически группируются под заголовком серии со счётчиком. Удаление серии не удаляет книги, а возвращает их в «Вне серии».',
    },
    {
      q: 'Что такое акты внутри книги?',
      a: 'Акт — именованная часть произведения: пролог, Акт I, Акт II, эпилог и т.п. В шапке каждой главы есть селект акта и кнопка «+» для создания нового на месте. Главы внутри акта перемещаются стрелками ↑↓ только внутри своего акта. Переименовать акт, удалить (расформировать) или переместить его целиком можно на панели акта над его главами.',
    },
    {
      q: 'Как менять порядок глав и актов?',
      a: 'Стрелки ↑↓ в шапке главы перемещают её внутри акта (или среди глав вне актов). Стрелки на панели акта двигают акт блоком вместе с главами. Перемещать можно и в свёрнутом виде. Порядок в списке, в сайдбаре и в экспорте всегда одинаковый; привязки таймлайна и упоминания не страдают.',
    },
    {
      q: 'Поиск по книге',
      a: 'В разделе «Главы» сверху закреплена строка поиска: введите 2+ символа — получите главы с совпадениями, числом совпадений и сниппетами с подсветкой. Клик по результату раскрывает главу, прокручивает к совпадению и выделяет его. Внутри главы работает счётчик «Совпадение N из M» со стрелками для перехода между вхождениями, а в предпросмотре все совпадения подсвечены. Поиск учитывает названия глав и их текст; регистр не важен.',
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
      a: 'Раздел «Настройки»: язык интерфейса (RU/EN), тема (светлая/тёмная), шрифт интерфейса и шрифт текста глав, папка экспорта по умолчанию, частота автосохранения. Всё применяется мгновенно и запоминается.',
    },
    {
      q: 'Как обновить приложение и не потерять книги?',
      a: 'Начиная с версии 1.1.2 приложение обновляется само: находит новую версию, скачивает в фоне и предлагает перезапуск. Ручная установка поверх старой тоже безопасна: книги лежат отдельно от файлов программы (в %APPDATA%\\writer-app) и установщиком не затрагиваются. База мигрирует автоматически: новые колонки добавляются без потери книг. Перед крупными обновлениями делайте копию dev.db.',
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
      q: 'Images: locations, portraits, world',
      a: 'Images can be attached to locations (image on the card), characters (vertical 3:4 portrait shown in the card avatar) and world lore entries. Large files are downscaled on your device before saving, so the database stays lean. Clicking an image opens full-screen view; Esc, backdrop click or the cross closes it.',
    },
    {
      q: 'How does DOCX export work?',
      a: 'The "Export to DOCX" button in the Chapters section and on the book passport. The document receives the book title, annotation, acts (level-1 headings) and their chapters (level 2); standalone chapters are level 1. Default format matches submission standards: Times New Roman 11 pt, 8 pt after paragraphs, 1.08 line spacing. Bold, italic and alignment are preserved; explicit [size=NN] overrides the default size. Service symbols (@, #, asterisks) are excluded. Saved to the folder from settings (Chrome/Edge) or to Downloads.',
    },
    {
      q: 'What are series and cycles?',
      a: 'A series is a shared title for several books (e.g. "Fire Trilogy"). Create one on the home page in "Series and cycles". Link a book to a series in its passport — books on the home page automatically group under the series heading with a count. Deleting a series does not delete books, it returns them to "Standalone".',
    },
    {
      q: 'What are acts inside a book?',
      a: 'An act is a named part of the work: prologue, Act I, Act II, epilogue, etc. Each chapter header has an act selector and a "+" button to create a new act on the spot. Chapters move up/down with arrows only within their own act. Rename, delete (dissolve) or move an act as a whole via the act panel above its chapters.',
    },
    {
      q: 'How do I reorder chapters and acts?',
      a: 'The ↑↓ arrows in a chapter header move it within its act (or among act-free chapters). The arrows on the act panel move the act as a block with its chapters. Reordering works from the collapsed state. The order in the list, the sidebar and the export is always the same; timeline links and mentions are preserved.',
    },
    {
      q: 'Book-wide search',
      a: 'In the Chapters section the search bar is pinned at the top: type 2+ characters to get chapters with matches, counts and highlighted snippets. Clicking a result opens the chapter, scrolls to the match and selects it. Inside the chapter a "Match N of M" counter with arrows cycles through occurrences, and the preview highlights all matches. Search covers titles and text; case is ignored.',
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
      a: 'Settings section: interface language (RU/EN), theme (light/dark), interface font and chapter text font, default export folder, auto-save frequency. Everything applies instantly and is remembered.',
    },
    {
      q: 'How do I update without losing books?',
      a: 'Since version 1.1.2 the app updates itself: it finds a new version, downloads it in the background and offers a restart. Manual install over the old version is also safe: books live separately from program files (in %APPDATA%\\writer-app) and are untouched by the installer. The database auto-migrates: new columns are added without losing books. Make a dev.db copy before major updates.',
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