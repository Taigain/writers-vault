import type { Lang } from './i18n'

export type FaqItem = { q: string; a: string }

export const FAQ: Record<Lang, FaqItem[]> = {
  ru: [
    { q: 'Где хранятся мои данные?', a: 'В локальной базе на вашем компьютере. Установленная версия: %APPDATA%\\writer-app\\dev.db (вставьте путь в адресную строку проводника). Dev-версия: prisma\\dev.db в папке проекта. В интернет не отправляется ничего. Резервная копия = скопировать файл dev.db на внешний диск.' },
    { q: 'Как связывать персонажей и события?', a: 'В тексте главы пишите [@Имя] для персонажей и [#Название] для событий. После сохранения главы связи появятся в карточках персонажей и локаций, на таймлайне и в облаке связей.' },
    { q: 'Команды форматирования текста', a: '**жирный** — полужирный, *курсив* — курсив, [size=24]текст[/size] — размер шрифта, [center], [right], [left] в начале абзаца — выравнивание. Кнопки панели инструментов сами ставят и снимают эти метки с выделенного текста.' },
    { q: 'Как убрать форматирование?', a: 'Выделите фрагмент и нажмите «Ластик» на панели. Он снимет теги размера, жирный, курсив и метки выравнивания внутри выделения.' },
    { q: 'Как работает экспорт в DOCX?', a: 'Кнопки «Экспорт в DOCX» в разделе «Главы» и на паспорте книги. В документ попадают заголовки глав и текст с жирным, курсивом, размерами и выравниванием. Служебные символы (@, #, звёздочки) не попадают. Куда сохраняется: в папку из настроек (Chrome/Edge) или в «Загрузки».' },
    { q: 'Чем календарное время отличается от книжного?', a: 'Календарное — обычные даты. Книжное — год и день от начала истории (для миров с вымышленной хронологией). Событие можно привязать к главе: тогда дата и записка подтянутся из неё.' },
    { q: 'Зачем хэштеги у записей о мире?', a: 'Теги вида #магия #лор задаются при создании записи. В разделе «Мир» есть фильтр по хэштегам — нажмите тег, чтобы видеть только связанные записи.' },
    { q: 'Режимы облака связей', a: '«Сюжет» — главы и что с ними связано. «Персонажи» — персонажи и их появления. «События» — события таймлайна и участники. Колесо мыши — масштаб, перетаскивание мышью — перемещение, кнопки — зум и полный экран.' },
    { q: 'Как сменить язык, тему, шрифты?', a: 'Раздел «Настройки»: язык интерфейса (RU/EN), тема (светлая/тёмная), шрифт интерфейса и шрифт текста глав, папка экспорта по умолчанию. Всё применяется мгновенно и запоминается.' },
    { q: 'Как обновить приложение и не потерять книги?', a: 'Устанавливайте новую версию поверх старой: книги лежат отдельно от файлов программы (в %APPDATA%\\writer-app) и установщиком не затрагиваются. Перед крупными обновлениями делайте копию dev.db.' },
    { q: 'Как перенести книги на другой компьютер?', a: 'Скопируйте файл dev.db (см. «Где хранятся мои данные?») и положите его по тому же пути на новом компьютере с установленным приложением — перенесутся все книги, персонажи и связи.' },
  ],
  en: [
    { q: 'Where is my data stored?', a: 'In a local database on your computer. Installed version: %APPDATA%\\writer-app\\dev.db (paste the path into Explorer). Dev version: prisma\\dev.db in the project folder. Nothing is ever sent online. Backup = copy the dev.db file to an external drive.' },
    { q: 'How do character and event links work?', a: 'In chapter text write [@Name] for characters and [#Title] for events. After saving the chapter, links appear on character and location cards, on the timeline and in the relationship cloud.' },
    { q: 'Text formatting commands', a: '**bold** — bold, *italic* — italic, [size=24]text[/size] — font size, [center], [right], [left] at paragraph start — alignment. Toolbar buttons add and remove these markers on selected text automatically.' },
    { q: 'How do I clear formatting?', a: 'Select the fragment and press the Eraser on the toolbar. It removes size tags, bold, italic and alignment markers inside the selection.' },
    { q: 'How does DOCX export work?', a: 'Use "Export to DOCX" in the Chapters section or on the book passport. The document receives chapter headings and text with bold, italic, sizes and alignment. Service symbols (@, #, asterisks) are excluded. Saved to the folder from settings (Chrome/Edge) or to Downloads.' },
    { q: 'Calendar time vs book time?', a: 'Calendar — real-world dates. Book — year and day since the story start (for worlds with fictional chronology). An event can be pinned to a chapter: its date and note are then pulled from the chapter.' },
    { q: 'What are world-lore hashtags for?', a: 'Tags like #magic #lore are set when creating an entry. The World section has a hashtag filter — click a tag to see only related entries.' },
    { q: 'Relationship cloud modes', a: '"Plot" — chapters and their links. "Characters" — characters and their appearances. "Events" — timeline events and participants. Mouse wheel — zoom, drag — pan, buttons — zoom and fullscreen.' },
    { q: 'How do I change language, theme, fonts?', a: 'Settings section: interface language (RU/EN), theme (light/dark), interface font and chapter text font, default export folder. Everything applies instantly and is remembered.' },
    { q: 'How do I update without losing books?', a: 'Install the new version over the old one: books live separately from program files (in %APPDATA%\\writer-app) and are untouched by the installer. Make a dev.db copy before major updates.' },
    { q: 'How do I move books to another PC?', a: 'Copy the dev.db file (see "Where is my data stored?") and place it at the same path on the new computer with the app installed — all books, characters and links will transfer.' },
  ],
}