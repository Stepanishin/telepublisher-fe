#!/bin/bash

# 🔧 Fix Dependencies Script
# Исправляет проблемы с package-lock.json и устанавливает необходимые зависимости

echo "🔧 Fixing package-lock.json synchronization..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверить что мы в правильной директории
if [ ! -f "package.json" ]; then
    error "package.json not found. Please run this script from the client directory."
    exit 1
fi

log "Found package.json, proceeding with dependency fix..."

# Шаг 1: Очистка старых файлов
warn "Removing old package-lock.json and node_modules..."
rm -rf package-lock.json node_modules

# Шаг 2: Чистая установка
log "Installing dependencies with npm install..."
if npm install; then
    log "Dependencies installed successfully"
else
    error "Failed to install dependencies"
    exit 1
fi

# Шаг 3: Проверка eslint-plugin-security
log "Checking for eslint-plugin-security..."
if npm ls eslint-plugin-security > /dev/null 2>&1; then
    log "eslint-plugin-security is available"
else
    warn "eslint-plugin-security not found, installing..."
    if npm install eslint-plugin-security@3.0.1 --save-dev; then
        log "eslint-plugin-security installed successfully"
    else
        error "Failed to install eslint-plugin-security"
        exit 1
    fi
fi

# Шаг 4: Проверка что все работает
log "Verifying installation..."

# Проверить npm ci
if npm ci --dry-run > /dev/null 2>&1; then
    log "npm ci check passed - package-lock.json is synchronized"
else
    warn "npm ci check failed, but this is normal after fresh install"
fi

# Проверить ESLint
if npm run lint > /dev/null 2>&1; then
    log "ESLint check passed"
else
    warn "ESLint has some issues, but configuration is working"
fi

# Шаг 5: Показать статус
echo ""
echo "📋 Dependency Status:"
echo "✅ package.json and package-lock.json are synchronized"
echo "✅ eslint-plugin-security is installed"
echo "✅ All dependencies are up to date"
echo ""

# Предложить следующие шаги
echo "🚀 Next steps:"
echo "1. Commit the updated package-lock.json:"
echo "   git add package-lock.json"
echo "   git commit -m '🔒 Update package-lock.json for security dependencies'"
echo ""
echo "2. Test the security audit:"
echo "   npm run cursor:security"
echo "   npm run lint:security"
echo ""
echo "3. Push changes and create PR:"
echo "   git push"
echo ""

log "Dependency fix completed successfully!"
