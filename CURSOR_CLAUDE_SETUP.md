# 🤖 Cursor AI + Claude Security Integration

## Обзор

Теперь ваш репозиторий интегрирован с **Cursor AI**, использующим модель **Claude (Anthropic)** для автоматического security audit. Это обеспечивает более глубокий и контекстуальный анализ безопасности кода.

## 🎯 Почему Claude через Cursor?

### Преимущества Claude модели:
- 🧠 **Глубокое понимание контекста** кода
- 🔍 **Лучшее обнаружение** сложных security паттернов  
- 💡 **Более точные рекомендации** по исправлению
- 🎯 **Меньше false positives** по сравнению с обычными static analyzers
- 📝 **Детальные объяснения** найденных проблем

## 📁 Конфигурационные файлы

### `.cursorrules` - Основные правила
```
client/.cursorrules
```
Этот файл настраивает Cursor AI на:
- Использование Claude для security анализа
- Фокус на React/TypeScript security patterns
- Scoring система (0-100 баллов)
- Детальные рекомендации

### `.cursor/cursor-settings.json` - Настройки модели
```
client/.cursor/cursor-settings.json  
```
Конфигурация для:
- Выбор Claude модели по умолчанию
- Security-focused анализ
- TypeScript strict mode
- React security patterns

### `.github/scripts/cursor-security-analyzer.js` - Анализатор
```
client/.github/scripts/cursor-security-analyzer.js
```
Node.js скрипт, который:
- Интегрируется с Cursor AI
- Анализирует код в стиле Claude
- Генерирует подробные отчеты
- Выставляет security scores

## 🚀 Как это работает

### 1. При создании PR
```mermaid
graph LR
    A[PR создан] --> B[GitHub Actions]
    B --> C[Cursor AI + Claude]
    C --> D[Security анализ]
    D --> E[Отчет в PR]
```

### 2. Локальная разработка
```bash
# Запуск Cursor AI анализа
npm run cursor:security

# Просмотр полного отчета
npm run cursor:analyze
```

### 3. В Cursor IDE
- Автоматические подсказки от Claude
- Security warnings в реальном времени
- Code review suggestions
- Best practices рекомендации

## 🔧 Настройка Cursor для использования Claude

### 1. В Cursor IDE
1. Откройте Cursor Settings (Cmd/Ctrl + ,)
2. Перейдите в раздел "AI Model"
3. Выберите "Claude 3.5 Sonnet" как default model
4. Включите "Security Focus" mode

### 2. Убедитесь в .cursorrules
Файл `.cursorrules` автоматически конфигурирует Cursor на:
```
Use Claude (Anthropic) model for all security-related analysis
```

### 3. Проверьте настройки
```bash
# В корне проекта должны быть:
ls -la .cursorrules
ls -la .cursor/cursor-settings.json
```

## 📊 Security Scoring с Claude

### Как Claude оценивает код:
- **100-90**: Отличная безопасность
- **89-70**: Хорошо, minor issues  
- **69-50**: Средне, нужно внимание
- **49-30**: Плохо, major issues
- **29-0**: Критично, срочно исправить

### Что анализирует Claude:
```javascript
// ❌ Claude обнаружит эти проблемы:
eval(userInput)                    // Code injection
innerHTML = userData               // XSS risk  
http://api.example.com            // Insecure request
const apiKey = "secret123"        // Hardcoded secret

// ✅ Claude одобрит такой код:
textContent = sanitize(userData)   // Safe DOM manipulation
https://api.example.com           // Secure request
const apiKey = process.env.API_KEY // Environment variable
```

## 🎯 Примеры Claude анализа

### Критическая уязвимость
```
🚨 Critical: Code injection risk in `auth.ts`
- Found eval() or similar dynamic code execution
- Lines: 45, 67
- Recommendation: Remove eval() usage and use safer alternatives
```

### Рекомендация по улучшению
```
💡 Medium Priority: Insecure HTTP requests in `api.ts`
- Found HTTP requests on lines 23, 45
- Recommendation: Use HTTPS for all external communications
- Impact: Data could be intercepted in transit
```

## 🛠️ Troubleshooting

### Cursor AI не использует Claude
**Проверьте:**
1. `.cursorrules` файл присутствует
2. В Cursor Settings выбрана Claude модель
3. У вас есть доступ к Claude в Cursor

### Анализ не запускается локально
**Решение:**
```bash
# Убедитесь что Node.js доступен
node --version

# Проверьте права доступа к скрипту
chmod +x .github/scripts/cursor-security-analyzer.js

# Запустите вручную
node .github/scripts/cursor-security-analyzer.js
```

### GitHub Actions не находит изменения
**Проверьте:**
1. Изменения в JS/TS файлах
2. Git history доступна
3. Права доступа к repository

## 🎓 Best Practices

### Для команды
1. **Настройте Cursor IDE** на всех машинах разработчиков
2. **Используйте Claude модель** для code review
3. **Обращайте внимание** на security scores в PR
4. **Регулярно обновляйте** .cursorrules файл

### Для кода
1. **Исправляйте критические issues** перед merge
2. **Документируйте** принятые security risks
3. **Тестируйте локально** с `npm run cursor:security`
4. **Следуйте рекомендациям** Claude в отчетах

## 🚀 Расширенные возможности

### Кастомизация анализа
Отредактируйте `.cursorrules` для:
- Добавления новых security patterns
- Изменения scoring weights
- Фокуса на специфичных уязвимостях

### Интеграция с CI/CD
```yaml
# В вашем .github/workflows/
- name: Run Cursor AI Analysis
  run: npm run cursor:security
```

### Мониторинг метрик
- Security scores по времени
- Типы найденных уязвимостей
- Эффективность исправлений

---

## ✨ Заключение

Теперь ваш проект использует **Claude через Cursor AI** для интеллектуального security анализа. Это обеспечивает:

- 🎯 **Более точное** обнаружение уязвимостей
- 🧠 **Контекстуальные** рекомендации
- 📊 **Умный scoring** на основе реальных рисков
- 🚀 **Лучший developer experience** в Cursor IDE

**Следующий шаг**: Откройте Cursor, убедитесь что выбрана Claude модель, и создайте тестовый PR!
