import React, { useState } from 'react';
import { Bot, ChevronDown, ChevronUp, ExternalLink, Copy, Check, Info, Send, MessageSquare, List, Calendar, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

const BotInstructionsPanel: React.FC = () => {
  const [isBotInstructionsExpanded, setBotInstructionsExpanded] = useState(true);
  const [isServiceInstructionsExpanded, setServiceInstructionsExpanded] = useState(true);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const { t } = useLanguage();

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
                <CardTitle>{t('instructions.service_title')}</CardTitle>
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
                {t('instructions.service_description')}
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-4">
                    <Send className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('instructions.getting_started')}</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                      <li>{t('instructions.getting_started_step_1')}</li>
                      <li>{t('instructions.getting_started_step_2')}</li>
                      <li>{t('instructions.getting_started_step_3')}</li>
                      <li>{t('instructions.getting_started_step_4')}</li>
                    </ol>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-4">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('instructions.content_creation')}</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                      <li>{t('instructions.content_creation_step_1')}</li>
                      <li>{t('instructions.content_creation_step_2')}</li>
                      <li>{t('instructions.content_creation_step_3')}</li>
                      <li>{t('instructions.content_creation_step_4')}</li>
                    </ol>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-4">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('instructions.publishing')}</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                      <li>{t('instructions.publishing_step_1')}</li>
                      <li>{t('instructions.publishing_step_2')}</li>
                      <li>{t('instructions.publishing_step_3')}</li>
                      <li>{t('instructions.publishing_step_4')}</li>
                    </ol>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-4">
                    <List className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('instructions.channel_management')}</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                      <li>{t('instructions.channel_management_step_1')}</li>
                      <li>{t('instructions.channel_management_step_2')}</li>
                      <li>{t('instructions.channel_management_step_3')}</li>
                      <li>{t('instructions.channel_management_step_4')}</li>
                    </ol>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-4">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('instructions.usage_tips')}</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>{t('instructions.usage_tips_item_1')}</li>
                      <li>{t('instructions.usage_tips_item_2')}</li>
                      <li>{t('instructions.usage_tips_item_3')}</li>
                      <li>{t('instructions.usage_tips_item_4')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  {t('instructions.questions')}
                </h4>
                <p className="text-blue-700 text-sm">
                  {t('instructions.support_text')} <a href="https://t.me/telepublisher_support" target="_blank" rel="noopener noreferrer" className="underline">@telepublisher_support</a>
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={toggleServiceInstructions}
                  variant="outline"
                  size="sm"
                >
                  {t('instructions.collapse')}
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
                <CardTitle>{t('instructions.bot_title')}</CardTitle>
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
                {t('instructions.bot_desc')}
              </p>

              <ol className="list-decimal pl-5 space-y-4">
                <li className="text-gray-700">
                  <div className="font-medium mb-1">{t('instructions.step1_title')}</div>
                  <p className="text-sm text-gray-600 mb-2">
                    {t('instructions.step1_desc')}
                  </p>
                  <div className="flex">
                    <a 
                      href="https://t.me/botfather" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 flex items-center hover:underline"
                    >
                      {t('instructions.open_botfather')} <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </li>

                <li className="text-gray-700">
                  <div className="font-medium mb-1">{t('instructions.step2_title')}</div>
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
                    {t('instructions.step2_desc')}
                  </p>
                </li>

                <li className="text-gray-700">
                  <div className="font-medium mb-1">{t('instructions.step3_title')}</div>
                  <p className="text-sm text-gray-600 mb-2">
                    {t('instructions.step3_desc')}
                  </p>
                  <div className="bg-gray-100 rounded p-2 font-mono text-sm text-gray-700 mb-2">
                    123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('instructions.step3_note')}
                  </p>
                </li>

                <li className="text-gray-700">
                  <div className="font-medium mb-1">{t('instructions.step4_title')}</div>
                  <p className="text-sm text-gray-600 mb-2">
                    {t('instructions.step4_desc')}
                  </p>
                </li>

                <li className="text-gray-700">
                  <div className="font-medium mb-1">{t('instructions.step5_title')}</div>
                  <p className="text-sm text-gray-600 mb-2">
                    {t('instructions.step5_desc')}
                  </p>
                </li>
              </ol>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Bot className="h-4 w-4 mr-2" />
                  {t('instructions.security_title')}
                </h4>
                <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                  <li>{t('instructions.security_tip_1')}</li>
                  <li>{t('instructions.security_tip_2')}</li>
                  <li>{t('instructions.security_tip_3')}</li>
                  <li>{t('instructions.security_tip_4')}</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={toggleBotInstructions}
                  variant="outline"
                  size="sm"
                >
                  {t('instructions.collapse')}
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