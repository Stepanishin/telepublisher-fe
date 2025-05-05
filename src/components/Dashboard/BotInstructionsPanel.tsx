import React, { useState } from 'react';
import { Bot, ChevronDown, ChevronUp, ExternalLink, Copy, Check, Info, Send, MessageSquare, List, Calendar, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';

const BotInstructionsPanel: React.FC = () => {
  const [isBotInstructionsExpanded, setBotInstructionsExpanded] = useState(true);
  const [isServiceInstructionsExpanded, setServiceInstructionsExpanded] = useState(true);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const toggleBotInstructions = () => {
    setBotInstructionsExpanded(!isBotInstructionsExpanded);
  };

  const toggleServiceInstructions = () => {
    setServiceInstructionsExpanded(!isServiceInstructionsExpanded);
  };

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* TelePublisher Service Instructions */}
      <Card className="mb-6">
        <div className="cursor-pointer" onClick={toggleServiceInstructions}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>Инструкция по использованию сервиса TelePublisher</CardTitle>
              </div>
              {isServiceInstructionsExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </CardHeader>
        </div>

        {isServiceInstructionsExpanded && (
          <CardContent>
            <div className="space-y-6">
              <p className="text-gray-600">
                TelePublisher — это сервис для управления контентом в Telegram-каналах. Вот краткая инструкция, как использовать наш сервис:
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-4">
                    <Send className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Начало работы</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                      <li>Создайте Telegram бота через BotFather (см. инструкцию ниже)</li>
                      <li>Добавьте ваш Telegram-канал в разделе "Управление каналами"</li>
                      <li>Укажите токен бота для вашего канала</li>
                      <li>Убедитесь, что бот добавлен в канал как администратор</li>
                    </ol>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-4">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Создание контента</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                      <li>Перейдите во вкладку "Генерация контента"</li>
                      <li>Используйте редактор для создания нового поста</li>
                      <li>Вы можете форматировать текст, добавлять эмодзи и медиафайлы</li>
                      <li>Предварительный просмотр поста доступен в правой части экрана</li>
                    </ol>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-4">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Публикация и планирование</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                      <li>Выберите канал для публикации в панели справа</li>
                      <li>Для мгновенной публикации нажмите "Опубликовать сейчас"</li>
                      <li>Для планирования публикации выберите дату и время, затем нажмите "Запланировать"</li>
                      <li>Запланированные публикации можно редактировать и отменять до момента отправки</li>
                    </ol>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-4">
                    <List className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Управление каналами</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                      <li>Перейдите во вкладку "Управление каналами"</li>
                      <li>Добавьте новый канал, указав его username</li>
                      <li>Для каждого канала необходимо настроить токен бота</li>
                      <li>Вы можете управлять несколькими каналами одновременно (лимит зависит от тарифного плана)</li>
                    </ol>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-4">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Советы по использованию</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Используйте разные боты для разных каналов для повышения безопасности</li>
                      <li>Планируйте контент заранее, чтобы обеспечить регулярность публикаций</li>
                      <li>Используйте функцию предпросмотра перед публикацией, чтобы убедиться в корректном отображении</li>
                      <li>В платных тарифах доступно больше каналов и расширенная функциональность</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Если у вас возникли вопросы
                </h4>
                <p className="text-blue-700 text-sm">
                  Свяжитесь с нашей службой поддержки через Telegram: <a href="https://t.me/telepublisher_support" target="_blank" rel="noopener noreferrer" className="underline">@telepublisher_support</a>
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={toggleServiceInstructions}
                  variant="outline"
                  size="sm"
                >
                  Свернуть инструкцию
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bot Creation Instructions */}
      <Card className="mb-6">
        <div className="cursor-pointer" onClick={toggleBotInstructions}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Bot className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>Инструкция по созданию бота</CardTitle>
              </div>
              {isBotInstructionsExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </CardHeader>
        </div>

        {isBotInstructionsExpanded && (
          <CardContent>
            <div className="space-y-6">
              <p className="text-gray-600">
                Для публикации постов в Telegram-каналы вам необходимо создать бота и получить его токен.
                Следуйте инструкции ниже:
              </p>

              <ol className="list-decimal pl-5 space-y-4">
                <li className="text-gray-700">
                  <div className="font-medium mb-1">Откройте BotFather в Telegram</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Перейдите к официальному боту Telegram для создания других ботов
                  </p>
                  <div className="flex">
                    <a 
                      href="https://t.me/botfather" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 flex items-center hover:underline"
                    >
                      Открыть BotFather <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </li>

                <li className="text-gray-700">
                  <div className="font-medium mb-1">Отправьте команду для создания нового бота</div>
                  <div className="flex items-center bg-gray-100 rounded p-2 mb-2">
                    <code className="text-blue-700 font-mono">/newbot</code>
                    <button 
                      onClick={() => copyToClipboard("/newbot", 2)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {copiedStep === 2 ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    BotFather попросит вас задать имя и имя пользователя для бота.
                  </p>
                </li>

                <li className="text-gray-700">
                  <div className="font-medium mb-1">Сохраните токен API</div>
                  <p className="text-sm text-gray-600 mb-2">
                    После создания бота вы получите токен API, выглядящий примерно так:
                  </p>
                  <div className="bg-gray-100 rounded p-2 font-mono text-sm text-gray-700 mb-2">
                    123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ
                  </div>
                  <p className="text-sm text-gray-600">
                    Этот токен вам понадобится для настройки канала в нашей системе.
                  </p>
                </li>

                <li className="text-gray-700">
                  <div className="font-medium mb-1">Добавьте бота в ваш канал как администратора</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Откройте настройки канала, перейдите в "Администраторы" и добавьте вашего бота,
                    предоставив ему права на публикацию сообщений. 
                    <b> Используйте только мобильную версию Telegram для добавления бота в канал</b>
                  </p>
                </li>

                <li className="text-gray-700">
                  <div className="font-medium mb-1">Введите токен бота в настройках канала</div>
                  <p className="text-sm text-gray-600 mb-2">
                    В разделе "Управление каналами" добавьте ваш Telegram-канал и укажите токен бота,
                    который вы получили от BotFather.
                  </p>
                </li>
              </ol>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Bot className="h-4 w-4 mr-2" />
                  Рекомендации по безопасности
                </h4>
                <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                  <li>Никогда не делитесь токеном бота с третьими лицами</li>
                  <li>Используйте отдельного бота для каждого канала</li>
                  <li>Регулярно проверяйте активность ваших ботов</li>
                  <li>При подозрении на компрометацию токена, создайте нового бота</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={toggleBotInstructions}
                  variant="outline"
                  size="sm"
                >
                  Свернуть инструкцию
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default BotInstructionsPanel; 