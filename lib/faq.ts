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
      a: 'В тексте главы пишите [@имя] для персонажей и [#описание] для событий — или выделите текст и нажмите кнопки @ и # на панели: метки вставятся сами, а для событий пробелы выделения автоматически станут подчёркиваниями ([#падение_станции]) — в тексте и экспорте они вернутся пробелами. Если помеченного события ещё нет, после сохранения редактор покажет баннер с чипом и плюсом: один клик создаёт событие в таймлайне с пустыми датами и привязкой к этой главе. В таймлайне чипы глав-упоминаний кликабельны и открывают текст ровно на месте метки; если книжная дата события спорит с порядком глав, карточка получит чип «Проверьте порядок». Персонажи дополнительно отзываются на псевдонимы, события — на метки-теги.',
    },
    {
      q: 'Персонаж: упоминания, состояния, сцены и тепловая карта',
      a: 'Каждая метка [@имя] в тексте становится отдельной строкой в карточке персонажа: глава, фрагмент контекста вокруг метки и поле состояния («ранен», «сомневается», «союзник») — заметка сохраняется при последующих правках главы. Чип главы в строке открывает текст на месте упоминания. Ниже — список сцен, в которых персонаж отмечен чипом (клик открывает карточку сцены), и тепловая карта с двумя цифрами: присутствие в главах (главы с упоминаниями / всех глав) и в сценах (сцены с персонажем / всех сцен), построчно по всем главам, включая главы без сцен. Первая цифра показывает, насколько персонаж проходит сквозь книгу, вторая — насколько он вовлечён в разыгранные сцены.',
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
      q: 'Сцены: начало, конец и синхронность с текстом',
      a: 'Сцена ограничивается в тексте главы парным маркером [sc:]…[/sc]: выделите фрагмент и нажмите кнопку сцены на панели — выделение обернётся маркерами; без выделения пара встанет на курсор. Сцены могут идти вплотную, без пустых строк: граница — маркер, а не разрыв абзаца. Вкладка «Сцены» собирает все сцены книги по главам: в карточке полный текст сцены (редактируется — правка синхронно уходит в главу), чипы персонажей сцены, цветовые метки и предпросмотр. Кнопка «Открыть в тексте» ведёт к месту сцены в главе. Границы и текст сцены живут только в главе: вкладка показывает живой срез, поэтому рассинхрона не бывает. В экспорте DOCX маркеры сцен снимаются без следа, текст течёт непрерывно.',
    },
    {
      q: 'Цветовые метки ключевых моментов',
      a: 'Выделите фрагмент в главе или в сцене и нажмите одну из шести цветных точек на панели — фрагмент обернётся в [hl=N]…[/hl]. В предпросмотре, режиме чтения и карточках сцены фрагмент подсвечивается соответствующим цветом; разные точки позволяют пометить несколько моментов разными цветами. В экспорте DOCX метки снимаются до обычного текста: цвет — рабочий инструмент внутри приложения, а не оформление рукописи. Точки доступны и в редакторе главы, и в карточке сцены.',
    },
    {
      q: 'Маркеры и подсветки: тумблеры и вложенность',
      a: 'Кнопки сцены, цвета и события работают как тумблеры: повторное нажатие на то же выделение (или на выделение, захватившее маркеры) снимает метки вместо добавления второго слоя. Сцены не могут пересекаться и вкладываться: если выделение касается существующей сцены, приложение показывает внутриапповое предупреждение и не вставляет метку — снимите прежнюю метку сцены или выберите участок вне её. Подсветки разных цветов вкладываться могут: внутренний фрагмент рисуется своим цветом, а после его закрытия внешний цвет продолжается до своей закрывающей метки.',
    },
    {
      q: 'Сохранение и защита от потери текста',
      a: 'Если в редакторе главы или в формах страницы остались несохранённые изменения, перед любым выходом приложение спрашивает, что делать. Переход между разделами внутри приложения открывает окно с тремя кнопками: «Сохранить и перейти» (текст глав сохраняется, грязные формы отправляются, затем происходит переход), «Не сохранять», «Отмена». Закрытие вкладки в веб-версии даёт нативный вопрос браузера, закрытие окна в десктопной — диалог «Сохранить и выйти / Выйти без сохранения / Отмена». Форма считается грязной с момента ввода до отправки, редактор главы — до сохранения или автосохранения.',
    },
    {
      q: 'Куда устанавливается приложение и можно ли сменить папку',
      a: 'Установщик-мастер предлагает папку установки (по умолчанию %LOCALAPPDATA%\\Programs\\writer-app) — при новой установке можно выбрать любой диск. Книги и данные лежат вне папки установки, в %APPDATA%\\writer-app, поэтому переезд и переустановка приложения их не трогают. Уже установленные копии обновляются на месте: автообновление ставит каждую новую версию в ту папку, которая записана в реестре. Удаление приложения данные не удаляет.',
    },
    {
      q: 'Как убрать форматирование?',
      a: 'Выделите фрагмент и нажмите «Ластик» на панели. Он снимет теги размера, жирный, курсив и метки выравнивания внутри выделения.',
    },
        {
      q: 'Проверка пунктуации и стили кавычек',
      a: 'Кнопка со значком проверки на панели главы открывает панель пунктуации: лишние пробелы, пробел перед знаком, повторы знаков, три точки вместо многоточия, дефис вместо тире. Стрелка ставит курсор на место, галочка чинит одно вхождение, «Исправить всё» чинит список целиком; правки применяются к тексту главы и уходят в экспорт уже исправленными. Кнопка со значком кавычек приводит пары кавычек в главе (или в выделении) к стилю из настроек: «ёлочки», «лапки» или английские. Линтер консервативен: берёт только уверенные паттерны, спорные случаи оставляет автору.',
    },
    {
      q: 'Как работает проверка орфографии?',
      a: 'Редактор подчёркивает слова с ошибками — словари русский и английский, по языку интерфейса. Правый клик по подчёркнутому слову открывает меню с вариантами исправления: клик по варианту заменяет слово на месте. Пункт «Добавить в словарь» убирает подчёркивание и запоминает слово между запусками приложения; пользовательские слова хранятся на этой машине и не входят в базу книг. В dev-версии в браузере работают родные подсказки браузера.',
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
      a: 'Строка «Поиск по тексту книги» сверху раздела «Главы» ищет по названиям и тексту всех глав: клик по результату раскрывает главу, прокручивает к совпадению и выделяет его, счётчик «Совпадение N из M» листает вхождения. Индекс глав подгружается при первом клике в строку поиска, поэтому страница книги открывается быстро даже на больших рукописях. Внутри главы есть собственная строка «Поиск в главе…»: Enter и стрелки переходят по совпадениям, F3/Shift+F3 работают прямо из текста, Esc возвращает курсор в строку поиска.',
    },
    {
      q: 'Как считаются слова и знаки?',
      a: 'Объём главы = слова названия плюс слова текста; знаки — длина названия плюс длина текста. Чип в шапке главы, счётчики панели и дзена показывают это значение, суммы актов и всей книги складываются из него. Переименование главы пересчитывает всё мгновенно. Когда в редакторе выделен фрагмент, внизу и в дзен-режиме дополнительно показываются слова и знаки выделения — удобно считать объём цитаты или сцены.',
    },
    {
      q: 'Словарь мира: как работают метки [~…]?',
      a: 'Раздел «Словарь» книги хранит пары «слово книги ↔ черновое слово» (например, око ↔ глаз) и формы слова (глаза → очи). В черновике напишите черновое слово, выделите его и нажмите кнопку с иконкой языков на панели — получится метка [~ключ]. В предпросмотре, режиме чтения и экспорте DOCX метка превратится в слово книги; регистр переносится ([~Глаз] → «Око», [~ГЛАЗ] → «ОКО»), формы подставляются по парам, неизвестная форма даёт базовое слово. Переименование слова в словаре обновляет все метки во всей книге без правки глав. Кнопка-чип с меткой на карточке статьи копирует метку в буфер.',
    },
    {
      q: 'Изображения: локации, портреты, мир, заметки',
      a: 'К картинкам прикрепляются: локации (изображение в карточке), персонажи (вертикальный портрет 3:4, виден в аватаре карточки), записи о мире и заметки. Большие файлы сжимаются на вашем устройстве перед сохранением, обложки книг дополнительно один раз нормализуются, чтобы база и страницы оставались лёгкими. Клик по изображению открывает полноэкранный просмотр с кнопкой «Скачать изображение» — файл сохранится на диск под именем сущности; обложку можно скачать прямо с паспорта книги. Esc, клик по фону или крестик закрывают просмотр.',
    },
    {
      q: 'Как работает экспорт в DOCX?',
      a: 'Кнопка «Экспорт в DOCX» в разделе «Главы» и на паспорте книги. Документ собирается по методике Word: каждый абзац автора (всё до нажатия Enter) становится отдельным абзацем документа с интервалом после 8 пт и межстрочным 1.08, пустых строк-прокладок нет; заголовки книги, актов и глав несут свои отступы и уровни оглавления. Формат по умолчанию — Times New Roman 11 pt. Жирный, курсив и выравнивание сохраняются; явный [size=NN] перебивает кегль. Служебные символы меток не попадают: [@имя] даёт имя, [#метка] — текст метки с пробелами вместо подчёркиваний, [~ключ] заменяется словом книги из словаря. Тумблер «Включать название, аннотацию и синопсис в экспорт DOCX» на паспорте управляет титульным блоком по каждой книге. Куда сохраняется: в папку из настроек (Chrome/Edge) или в «Загрузки».',
    },
    {
      q: 'Как импортировать книгу из DOCX?',
      a: 'Кнопка «Импорт из DOCX» на главной создаёт новую книгу из файла: главы разбиваются по заголовкам H1 и H2, текст до первого заголовка попадает в «Главу 1», жирный и курсив сохраняются. Изображение обложки с первой страницы (картинка до первого текста) подтягивается автоматически и нормализуется. Кнопка «Импорт глав из DOCX» в разделе «Главы» дописывает главы в конец существующей книги, её обложка не трогается. Старый формат .doc не поддерживается: сохраните файл как .docx в Word или LibreOffice и повторите.',
    },
    {
      q: 'Режим чтения: как прочитать написанное как книгу?',
      a: 'Кнопка «Читать» в разделе «Главы» открывает полноэкранный книжный экран: шапка с названием, счётчиком «N / M», списком глав и крестиком закреплена сверху, прокручивается только текст. Главы идут в порядке книги с актами, навигация списком, стрелками на экране и клавишами ←/→; Esc или выход из полноэкранного режима закрывает чтение. Текст показывается форматированным и с подстановкой словаря, как в готовой книге. Главы подгружаются при открытии, поэтому страница книги остаётся лёгкой.',
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
      a: 'Главная страница делит книги на три сворачиваемые группы: «Задумки», «В работе» и «Архив». Книга переносится между ними переключателем статуса на её паспорте; новая книга по умолчанию попадает в «В работе». Серия архивируется и возвращается целиком кнопкой с иконкой архива на её чипе в блоке «Серии и циклы» — все книги серии переходят сразу. Пустые группы не отображаются, состояние групп запоминается. Сайдбар отражает то же деление тремя уровнями: группа → серия → книга; у каждой книги раскрывается список разделов, группа «Архив» свёрнута по умолчанию, активная книга раскрывает свою группу и серию сама.',
    },
    {
      q: 'Заметки: список и доска',
      a: 'Раздел «Заметки» книги — рабочий журнал автора: у заметки есть тип (персонажи, локации, события, сюжет, другое), чекбокс «Готово» с зачёркиванием и прикрепляемое изображение. Два вида: список (сворачиваемые карточки с редактором) и доска (карточки свободно перетаскиваются мышью, раскладка запоминается). Клик по карточке на доске открывает окно с подробностями, редактором и удалением. Выбранный вид запоминается отдельно для каждой книги.',
    },
    {
      q: 'Сюжетные линии, биты и карта сюжета',
      a: 'Раздел «Сюжет» держит движение линий произведения: создайте линии (основную и второстепенные) и разложите внутри каждой биты — сцены в нужном порядке. Бит связывается с главой, событием таймлайна и персонажами (чипы-переключатели в форме бита). Один бит может принадлежать нескольким линиям — так строятся пересечения: чип «также в: …» показывает соседние линии, привязать существующий бит можно селектом под списком битов, «Отцепить от линии» убирает связь (если линия была последней, бит удаляется). Сверху раздела — карта: цветные цепочки линий со стрелками порядка, узлы-биты, нити персонажей и события, входные и выходные стрелки с названиями линий. Колесо мыши — зум, перетаскивание за фон — панорама, кнопки — масштаб и полный экран; наведение открывает окошко с описанием, клик по узлу подсвечивает его связи и приглушает остальное.',
    },
    {
      q: 'Чем календарное время отличается от книжного?',
      a: 'Календарное — обычные даты. Книжное — год и день года (1–365) от начала истории. Год может быть отрицательным: −2 означает «за два года до начала истории»; года 0 не существует, используйте 1 или −1. Событие можно привязать к главе напрямую или меткой [#…] в тексте — тогда оно появится в списке «В главах-упоминаниях».',
    },
    {
      q: 'Мир: хэштеги и облако тегов',
      a: 'Хэштеги задаются при создании записи. У раздела «Мир» два вида: «Список» (фильтр по хэштегам и сворачиваемые карточки) и «Облако» — теги плавают облаком, где кегль и жирность зависят от числа записей с тегом, а цвет берётся из выбранной палитры. Клик по тегу облака открывает «записки»: короткие карточки с фрагментом, миниатюрой и тегами; клик по карточке — модальное окно редактирования записи (текст, изображение, теги, сохранить/удалить). Облако быстро показывает, какие темы доминируют в мире, а какие существуют в наброске.',
    },
    {
      q: 'Режимы облака связей',
      a: '«Сюжет» — главы и что с ними связано. «Персонажи» — персонажи и их появления. «События» — события таймлайна и участники. Колесо мыши — масштаб, перетаскивание мышью — перемещение, кнопки — зум и полный экран.',
    },
    {
      q: 'Кластеры и палитры в облаке связей',
      a: 'Облако само находит сообщества плотно связанных сущностей и раскладывает их островами с пунктирным контуром и подписью «Кластер N · K»: видно, из каких кусков состоит история и где они соприкасаются длинными перемычками. Клик по контуру или чипу кластера изолирует его (остальное приглушается), повторный клик или клик по фону возвращает всё. В настройках раздел палитр меняет цветовой язык визуализаций: тёплая по умолчанию, дальтоник-безопасная и моно-контрастная для тёмной темы; выбранные цвета одинаково применяются к кластерам облака и нитям карты сюжета. Цвета узлов по типам (главы, персонажи, события) остаются фиксированными — это легенда типов.',
    },
    {
      q: 'Как сменить язык, тему, шрифты?',
      a: 'Флажки RU/EN в боковой панели над пунктом «Помощь» переключают язык мгновенно, без захода в настройки. В разделе «Настройки»: язык интерфейса, тема (светлая/тёмная), шрифт интерфейса и шрифт текста глав, папка экспорта по умолчанию, частота автосохранения. Всё применяется сразу и запоминается.',
    },
    {
      q: 'Как обновить приложение и не потерять книги?',
      a: 'Начиная с версии 1.1.2 приложение обновляется само: находит новую версию, скачивает в фоне и предлагает перезапуск. Кнопка «Проверить обновления» в «Настройки → О программе» запускает проверку вручную. После установки новой версии при первом запуске открывается окно «Что нового» со списком изменений с вашей прошлой версии; полная история релизов — там же, кнопка «Лог обновлений». Ручная установка поверх старой тоже безопасна: книги лежат отдельно от файлов программы (в %APPDATA%\\writer-app) и установщиком не затрагиваются. База мигрирует автоматически: новые колонки и таблицы добавляются без потери книг. Перед крупными обновлениями делайте копию dev.db.',
    },
    {
      q: 'Как сообщить об ошибке или предложить идею?',
      a: 'В «Настройки → О программе» есть форма связи: опишите проблему или идею и нажмите «Открыть в почтовой программе» — письмо уйдёт автору с автоматически приложенными версией приложения и системой. Кнопки рядом копируют адрес и текст письма в буфер, если почтовый клиент не настроен. Адрес автора продублирован там же.',
    },
    {
      q: 'Как перенести книги на другой компьютер?',
      a: 'Скопируйте файл dev.db (см. «Где хранятся мои данные?») и положите его по тому же пути на новом компьютере с установленным приложением — перенесутся все книги, персонажи, связи, заметки, словари и изображения. Пользовательские слова проверки орфографии и настройки интерфейса (тема, свёрнутые группы) хранятся вне базы книг и остаются на старой машине.',
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
      a: 'In chapter text write [@name] for characters and [#description] for events — or select text and press the @ and # toolbar buttons: markers insert themselves, and for events the selection spaces automatically become underscores ([#station_fall]) — in the text and export they return as spaces. If the marked event does not exist yet, after saving the editor shows a banner with a chip and a plus: one click creates the event in the timeline with empty dates and a link to this chapter. In the timeline, mention chapter chips are clickable and open the text exactly at the mark; if an event\'s book date conflicts with chapter order, the card gets a "Check the order" chip. Characters also respond to aliases, events to tag marks.',
    },
    {
      q: 'Character: mentions, state, scenes and heat map',
      a: 'Every [@name] tag in the text becomes its own row on the character card: chapter, a context excerpt around the tag and a state field ("wounded", "doubts", "ally") — the note survives later chapter edits. The row\'s chapter chip opens the text at the mention. Below sit the list of scenes the character is checked into (a click opens the scene card) and a two-number heat map: presence in chapters (chapters with mentions / all chapters) and in scenes (scenes with the character / all scenes), row per chapter including chapters without scenes. The first number shows how fully the character traverses the book, the second how deeply they are woven into played scenes.',
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
      q: 'Scenes: start, end and sync with the text',
      a: 'A scene is bounded in chapter text by the pair marker [sc:]…[/sc]: select a passage and press the scene button on the toolbar — the selection is wrapped in markers; with no selection the pair is placed at the cursor. Scenes may sit back-to-back without blank lines: the boundary is the marker, not a paragraph break. The "Scenes" tab gathers all scenes of the book grouped by chapter: the card holds the full scene text (editable — changes sync back into the chapter), character chips, color highlights and a preview. The "Open in text" button jumps to the scene\'s place in the chapter. Scene bounds and text live only in the chapter: the tab shows a live slice, so nothing drifts. In DOCX export scene markers are removed without trace and the text flows continuously.',
    },
    {
      q: 'Color highlights of key moments',
      a: 'Select a passage in a chapter or a scene and press one of the six color dots on the toolbar — the passage is wrapped in [hl=N]…[/hl]. In preview, reading mode and scene cards the passage glows with the matching color; pressing different dots tags multiple moments. In DOCX export the tags are stripped to plain text: color is an in-app working tool, not manuscript formatting. The dots are available both in the chapter editor and in scene cards.',
    },
    {
      q: 'Markers and highlights: toggles and nesting',
      a: 'The scene, color and event buttons work as toggles: pressing again on the same selection (or a selection that captures the markers) removes the markers instead of adding a second layer. Scenes cannot overlap or nest: if the selection touches an existing scene, the app shows an in-app warning and inserts nothing — remove the old scene marker or pick a range outside it. Highlights of different colors may nest: the inner fragment glows in its color, and after its closing marker the outer color resumes until its own closing marker.',
    },
    {
      q: 'Saving and protection from lost text',
      a: 'If unsaved changes remain in the chapter editor or in page forms, the app asks before any exit. Switching sections inside the app opens a window with three buttons: "Save and continue" (chapter text is saved and dirty forms are submitted, then navigation proceeds), "Discard", "Cancel". Closing a tab in the web version triggers the native browser prompt; closing the desktop window triggers the "Save and exit / Exit without saving / Cancel" dialog. A form counts as dirty from the first input until submitted; the chapter editor — until saved or autosaved.',
    },
    {
      q: 'Where is the app installed and can I change the folder',
      a: 'The installer wizard offers the installation folder (by default %LOCALAPPDATA%\\Programs\\writer-app) — a fresh install can pick any disk. Books and data live outside the install folder, in %APPDATA%\\writer-app, so moving or reinstalling the app never touches them. Existing copies update in place: auto-update installs each new version into the folder recorded in the registry. Uninstalling the app does not delete your data.',
    },
    {
      q: 'How do I clear formatting?',
      a: 'Select the fragment and press the Eraser on the toolbar. It removes size tags, bold, italic and alignment markers inside the selection.',
    },
    {
      q: 'Punctuation check and quote styles',
      a: 'The check-icon button on the chapter toolbar opens the punctuation panel: extra spaces, space before punctuation, repeated signs, three dots instead of an ellipsis, hyphen instead of a dash. The arrow puts the cursor at the place, the tick fixes one occurrence, "Fix all" fixes the whole list; fixes apply to the chapter text and reach the export already corrected. The quote-icon button normalizes quote pairs in the chapter (or in the selection) to the style from settings: guillemets, laps or English. The linter is conservative: it takes only confident patterns and leaves borderline cases to the author.',
    },
    {
      q: 'How does spell checking work?',
      a: 'The editor underlines misspelled words using Russian and English dictionaries, following the interface language. Right-click an underlined word to open a menu with fix suggestions; clicking a suggestion replaces the word in place. The "Add to dictionary" item removes the underline and remembers the word across app launches; custom words live on this machine and are not part of the book database. In the dev version inside a browser, the browser\'s native suggestions apply.',
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
      a: 'The "Search book text" bar pinned at the top of the Chapters section searches all chapter titles and texts: clicking a result opens the chapter, scrolls to the match and selects it, and the "Match N of M" counter cycles occurrences. The chapter index loads on the first click into the search bar, so the book page stays fast even on large manuscripts. Inside a chapter there is its own "Find in chapter…" field: Enter and arrows cycle matches, F3/Shift+F3 work from the text, Esc returns the cursor to the find field.',
    },
    {
      q: 'How are words and characters counted?',
      a: 'A chapter volume = words of the title plus words of the text; characters = title length plus text length. The header chip, toolbar counters and zen counters show this value; act and book totals sum it. Renaming a chapter recalculates everything instantly. When a fragment is selected in the editor, the footer and zen mode additionally show the selection\'s words and characters — handy for quoting or scene sizing.',
    },
    {
      q: 'World dictionary: how do [~…] markers work?',
      a: 'The book\'s "Dictionary" section stores "book word ↔ draft word" pairs (e.g. oko ↔ eye) plus word forms (eyes → ochi). In the draft, write the draft word, select it and press the languages-icon button on the toolbar to get a [~key] marker. In preview, reading mode and DOCX export the marker becomes the book word; case transfers ([~Glaz] → "Oko", [~GLAZ] → "OKO"), forms substitute by pairs, an unknown form falls back to the base word. Renaming a word in the dictionary updates every marker in the book without editing chapters. The marker chip on an entry card copies the marker to the clipboard.',
    },
    {
      q: 'Images: locations, portraits, world, notes',
      a: 'Images can be attached to locations (image on the card), characters (vertical 3:4 portrait shown in the card avatar), world lore entries and notes. Large files are downscaled on your device before saving; book covers are additionally normalized once to keep the database and pages light. Clicking an image opens full-screen view with a "Download image" button — the file is saved to disk under the entity name; the cover can be downloaded right from the book passport. Esc, backdrop click or the cross closes the view.',
    },
    {
      q: 'How does DOCX export work?',
      a: 'The "Export to DOCX" button in the Chapters section and on the book passport. The document follows the Word methodology: every author paragraph (everything up to Enter) becomes its own document paragraph with 8 pt after and 1.08 line spacing, no empty spacer lines; book, act and chapter headings carry their own spacing and outline levels. Default format is Times New Roman 11 pt. Bold, italic and alignment are preserved; explicit [size=NN] overrides the size. Marker service symbols never leak: [@name] yields the name, [#mark] yields the mark text with spaces instead of underscores, [~key] is replaced with the book word from the dictionary. The "Include title, annotation and synopsis in DOCX export" toggle on the passport controls the title block per book. Saved to the folder from settings (Chrome/Edge) or to Downloads.',
    },
    {
      q: 'How do I import a book from DOCX?',
      a: 'The "Import from DOCX" button on the home page creates a new book from a file: chapters are split by H1 and H2 headings, text before the first heading goes into "Chapter 1", bold and italic are preserved. A cover image from the first page (an image before the first text) is pulled in automatically and normalized. The "Import chapters from DOCX" button in the Chapters section appends chapters to an existing book without touching its cover. Legacy .doc is not supported: save the file as .docx in Word or LibreOffice and retry.',
    },
    {
      q: 'Reading mode: how do I read my work like a book?',
      a: 'The "Read" button in the Chapters section opens a fullscreen book screen: the header with the title, the "N / M" counter, the chapter list and the cross is pinned on top, only the text scrolls. Chapters follow book order with acts; navigation via the list, on-screen arrows and ←/→ keys; Esc or exiting fullscreen closes reading. The text is shown formatted and with dictionary substitution, like a finished book. Chapters load on open, so the book page stays light.',
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
      a: 'The home page splits books into three collapsible groups: "Ideas", "In progress" and "Archive". A book moves between them via the status switch on its passport; new books land in "In progress" by default. A series is archived and restored as a whole via the archive icon button on its chip in the "Series and cycles" block — all books of the series move at once. Empty groups are hidden; group state is remembered. The sidebar mirrors the same division in three levels: group → series → book; each book expands to its sections, the "Archive" group is collapsed by default, and the active book opens its group and series automatically.',
    },
    {
      q: 'Notes: list and board',
      a: 'The book\'s "Notes" section is the author\'s working journal: a note has a type (characters, locations, events, plot, other), a "Done" checkbox with strikethrough and an attachable image. Two views: list (collapsible cards with an editor) and board (cards dragged freely with the mouse, layout persisted). Clicking a card on the board opens a details window with the editor and delete. The chosen view is remembered per book.',
    },
    {
      q: 'Storylines, beats and the story map',
      a: 'The "Plot" section tracks the movement of storylines: create lines (main and secondary) and lay out beats — scenes in the order you need — inside each. A beat links to a chapter, a timeline event and characters (toggle chips in the beat form). One beat can belong to several lines — that is how intersections are built: the "also in: …" chip shows the neighbouring lines, an existing beat is attached via the select under the beat list, and "Unlink from line" removes the link (if it was the last line, the beat is deleted). At the top of the section sits the map: colored line chains with order arrows, beat nodes, character and event threads, entry and exit arrows with line names. Mouse wheel — zoom, dragging the background — pan, buttons — scale and fullscreen; hovering opens a description window, clicking a node highlights its connections and dims the rest.',
    },
    {
      q: 'Calendar time vs book time?',
      a: 'Calendar — real-world dates. Book — year and day of year (1–365) since the story start. The year can be negative: −2 means "two years before the story begins"; there is no year 0, use 1 or −1. An event can be pinned to a chapter directly or via a [#…] tag in the text — it then appears in "In chapters".',
    },
    {
      q: 'World: hashtags and the tag cloud',
      a: 'Tags are set when creating an entry. The World section has two views: "List" (hashtag filter and collapsible cards) and "Cloud" — tags float in a cloud where size and weight depend on the number of entries with the tag, and the color comes from the chosen palette. Clicking a cloud tag opens "notes": short cards with an excerpt, thumbnail and tags; clicking a card opens the modal edit window for the entry (text, image, tags, save/delete). The cloud quickly shows which themes dominate the world and which exist in outline.',
    },
    {
      q: 'Relationship cloud modes',
      a: '"Plot" — chapters and their links. "Characters" — characters and their appearances. "Events" — timeline events and participants. Mouse wheel — zoom, drag — pan, buttons — zoom and fullscreen.',
    },
    {
      q: 'Clusters and palettes in the relationship cloud',
      a: 'The cloud detects communities of tightly linked entities on its own and lays them out as islands with a dashed hull and a "Cluster N · K" label: you see which pieces the story consists of and where they touch via long bridges. Clicking a hull or a cluster chip isolates it (the rest dims); clicking again or clicking the background restores everything. In settings, the palette section changes the visual color language: warm by default, color-blind safe, and mono contrast for the dark theme; the chosen colors apply equally to cloud clusters and story-map threads. Node colors by type (chapters, characters, events) stay fixed — that is the type legend.',
    },
    {
      q: 'How do I change language, theme, fonts?',
      a: 'RU/EN flags in the sidebar above Help switch the language instantly, without opening Settings. The Settings section holds interface language, theme (light/dark), interface font and chapter text font, default export folder and auto-save frequency. Everything applies instantly and is remembered.',
    },
    {
      q: 'How do I update without losing books?',
      a: 'Since version 1.1.2 the app updates itself: it finds a new version, downloads it in the background and offers a restart. The "Check for updates" button in Settings → About triggers a manual check. After installing a new version, the first launch opens a "What\'s new" window listing changes since your previous version; the full release history lives next to it, behind the "Changelog" button. Manual install over the old version is also safe: books live separately from program files (in %APPDATA%\\writer-app) and are untouched by the installer. The database auto-migrates: new columns and tables are added without losing books. Make a dev.db copy before major updates.',
    },
    {
      q: 'How do I report a bug or suggest an idea?',
      a: 'Settings → About has a contact form: describe the issue or idea and press "Open in mail app" — the letter goes to the author with the app version and system details attached automatically. Buttons nearby copy the address and the letter text to the clipboard if no mail client is configured. The author email is shown there as well.',
    },
    {
      q: 'How do I move books to another PC?',
      a: 'Copy the dev.db file (see "Where is my data stored?") and place it at the same path on the new computer with the app installed — all books, characters, links, notes, dictionaries and images will transfer. Custom spell-check words and interface settings (theme, collapsed groups) live outside the book database and stay on the old machine.',
    },
    {
      q: 'How do I support the author?',
      a: 'In Settings → About there are "Thank the author" buttons. They open the payment pages in the external browser.',
    },
  ],
}