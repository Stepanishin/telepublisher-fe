import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TelegramPollPreviewProps {
  question: string;
  options: { text: string }[];
  isAnonymous: boolean;
  allowsMultipleAnswers: boolean;
}

const TelegramPollPreview: React.FC<TelegramPollPreviewProps> = ({
  question,
  options,
  isAnonymous,
  allowsMultipleAnswers
}) => {
  const { t } = useLanguage();

  const validOptions = options.filter(option => option.text.trim());

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-blue-500 text-white p-3">
        <h3 className="font-medium text-sm">
          {t('poll_preview.title') || 'Предварительный просмотр опроса Telegram'}
        </h3>
      </div>
      
      <div className="p-4">
        {/* Poll Question */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-900 mb-2">
            {question || (t('poll_preview.question_placeholder') || 'Ваш вопрос опроса появится здесь')}
          </div>
          
          {/* Poll Options */}
          {validOptions.length === 0 ? (
            <div className="text-sm text-gray-500 italic">
              {t('poll_preview.options_placeholder') || 'Добавьте минимум два варианта для просмотра'}
            </div>
          ) : (
            <div className="space-y-2">
              {validOptions.map((option, index) => (
                <div 
                  key={index}
                  className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="mr-3">
                    {allowsMultipleAnswers ? (
                      <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm text-gray-900">{option.text}</span>
                  <div className="ml-auto text-xs text-gray-500">0%</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Poll Settings */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="space-x-4">
              <span>
                {isAnonymous 
                  ? (t('poll_preview.anonymous') || 'Анонимный')
                  : (t('poll_preview.not_anonymous') || 'Не анонимный')
                }
              </span>
              <span>
                {allowsMultipleAnswers 
                  ? (t('poll_preview.multiple_answers') || 'Несколько ответов')
                  : (t('poll_preview.single_answer') || 'Один ответ')
                }
              </span>
            </div>
            <span>
              {t('poll_preview.no_votes') || '0 голосов'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramPollPreview; 