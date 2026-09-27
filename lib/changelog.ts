export type ChangeEntry = {
  version: string
  date: string
  ru: string[]
  en: string[]
}

export const CHANGELOG: ChangeEntry[] = [
  {
    version: '1.3.5',
    date: '27.09.2026',
    ru: [
      'Технический перевыпуск отозванной 1.3.4: исправлен крах запуска приложения (дубликат объявления модуля в главном процессе); данные книг не затрагивались',
    ],
    en: [
      'Technical re-release of the withdrawn 1.3.4: fixed app launch crash (duplicate module declaration in the main process); book data was never affected',
    ],
  },
    {
    version: '1.3.4',
    date: '27.09.2026',
    ru: [
      'После обновления при первом запуске открывается окно «Что нового» со списком изменений с вашей прошлой версии; полная история обновлений — в «Настройки → О программе → Лог обновлений»',
      'Скачивание изображений: кнопка в полноэкранном просмотре любой картинки и рядом с обложкой на паспорте книги; файл сохраняется под именем сущности',
      'Проверка орфографии в редакторе: подчёркивания ошибок, варианты исправления по правому клику, «Добавить в словарь» с запоминанием между запусками',
      'Заметное ускорение на больших книгах: обложки один раз нормализуются, страницы и обновления не тянут лишний вес',
      'Справка обновлена целиком: все разделы версий 1.3.x в FAQ, включая словарь мира, сюжет с картой, заметки, группы книг и импорт',
    ],
    en: [
      'After an update, the first launch opens a "What\'s new" window listing changes since your previous version; the full update history lives in Settings → About → Changelog',
      'Image download: a button in the fullscreen view of any image and next to the cover on the book passport; the file is saved under the entity name',
      'Spell checking in the editor: misspell underlines, fix suggestions on right-click, "Add to dictionary" persisted across launches',
      'Noticeable speedup on large books: covers are normalized once, pages and refreshes no longer carry extra weight',
      'Help fully refreshed: all 1.3.x sections in the FAQ, including the world dictionary, plot map, notes, book groups and import',
    ],
  },
  {
    version: '1.3.3',
    date: '25.09.2026',
    ru: [
      'Словарь мира: пары «слово книги ↔ черновое слово», формы слов и метки [~ключ] кнопкой с иконкой языков; подстановка в предпросмотре, режиме чтения и экспорте DOCX с переносом регистра',
      'Сюжет: пересечения линий через общие биты («также в: …»), привязка существующих битов, карта с нитями персонажей и событий, панорама, зум и полный экран',
      'Кнопки меток [@…], [#…], [~…] стали переключателями: повторное нажатие снимает метку',
      'Безопасная миграция таблицы битов: обновление со старых версий больше не требует ручных действий и не теряет данные',
    ],
    en: [
      'World dictionary: "book word ↔ draft word" pairs, word forms, [~key] marker via the languages-icon button; substitution in preview, reading mode and DOCX export with case transfer',
      'Plot: line intersections via shared beats ("also in: …"), linking existing beats, map with character and event threads, pan, zoom and fullscreen',
      'The [@…], [#…], [~…] toolbar buttons are toggles: pressing again removes the marker',
      'Safe beats-table migration: updates from older versions no longer require manual steps and lose no data',
    ],
  },
  {
    version: '1.3.2',
    date: '25.09.2026',
    ru: ['Первая публикация словаря и пересечений сюжетных линий (заменена исправленной 1.3.3)'],
    en: ['First release of the dictionary and storyline intersections (superseded by 1.3.3)'],
  },
  {
    version: '1.3.1',
    date: '24.09.2026',
    ru: [
      'Заметки: рабочий журнал книги — типы, чекбокс «Готово», изображения; виды «список» и «доска» со свободным перетаскиванием карточек',
      'Сюжетные линии и биты со связями с главами и событиями таймлайна',
      'Три группы книг («Задумки», «В работе», «Архив») на главной и трёхуровневый сайдбар, архив серии одной кнопкой',
      'Импорт DOCX: новая книга с разбивкой на главы по H1/H2 и обложкой с первой страницы; дозагрузка глав в существующую книгу',
    ],
    en: [
      'Notes: the book working journal — types, a Done checkbox, images; list and board views with free card dragging',
      'Storylines and beats linked to chapters and timeline events',
      'Three book groups (Ideas, In progress, Archive) on the home page and a three-level sidebar, series archiving with one button',
      'DOCX import: a new book split by H1/H2 headings with the cover from the first page; appending chapters to an existing book',
    ],
  },
  {
    version: '1.3.0',
    date: '23.09.2026',
    ru: [
      'Режим чтения книги на весь экран с навигацией по главам и стрелками',
      'Счётчик слов и знаков выделения в редакторе',
      'Тумблер титульного блока в экспорте DOCX (настройка каждой книги)',
      'Сворачиваемые группы серий и блок «Без серии» на главной',
    ],
    en: [
      'Fullscreen reading mode with chapter navigation and arrows',
      'Selection word and character counters in the editor',
      'Title-block toggle for DOCX export (per-book setting)',
      'Collapsible series groups and the "Standalone" block on the home page',
    ],
  },
  {
    version: '1.2.0',
    date: '10.09.2026',
    ru: [
      'Акты и произвольная структура книги (перемещение актов блоками)',
      'Дзен-режим редактора и поиск по книге с переходом к совпадениям',
      'Автообновление приложения через GitHub Releases',
    ],
    en: [
      'Acts and free book structure (moving acts as blocks)',
      'Editor zen mode and book-wide search with match navigation',
      'App auto-update via GitHub Releases',
    ],
  },
]

export function cmpVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0)
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0
    const db = pb[i] ?? 0
    if (da !== db) return da < db ? -1 : 1
  }
  return 0
}

export function entriesBetween(oldV: string, newV: string): ChangeEntry[] {
  return CHANGELOG.filter((e) => cmpVersions(e.version, oldV) > 0 && cmpVersions(e.version, newV) <= 0)
}