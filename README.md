# TelePublisher - Управление контентом для Telegram-каналов

TelePublisher - это React приложение для генерации и публикации контента в Telegram-каналы.

## Технологии

- React с функциональными компонентами и хуками
- TypeScript для типизации
- Tailwind CSS для стилизации
- Zustand для управления состоянием
- React Router для маршрутизации

## Функциональность

- Авторизация через Telegram (мок)
- Генерация контента (текст, изображения, теги)
- Управление каналами
- Публикация контента в выбранные каналы

## Запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev
```

## Мок-данные

Приложение использует мок-данные и мок-API для симуляции работы с бекендом. Мок-данные расположены в директории `src/mocks/api.ts`.

Вы можете изменять мок-данные для тестирования различных сценариев:

- Изменить список каналов по умолчанию
- Настроить задержку ответов API
- Создать другие сценарии ответов от сервера

## Структура проекта

```
src/
├── components/      # UI компоненты
│   ├── Dashboard/   # Компоненты дашборда
│   ├── Layout/      # Компоненты макета
│   └── ui/          # Базовые UI компоненты
├── mocks/           # Мок-данные и API
├── pages/           # Страницы приложения
├── services/        # Сервисы API
├── store/           # Хранилище состояния (Zustand)
└── types/           # TypeScript типы
```

## Дальнейшая разработка

Для подключения реального API вместо моков:

1. Обновите функции в `src/services/api.ts`, заменив вызовы мок-функций на реальные запросы к API
2. Настройте конфигурацию axios с базовым URL вашего API
3. Добавьте обработку аутентификации и токенов