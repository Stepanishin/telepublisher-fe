import React from 'react';
import { BarChart2, Check, X } from 'lucide-react';
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
  const hasValidOptions = options.filter(o => o.text.trim()).length >= 2;
  
  // Filter out empty options
  const validOptions = options.filter(o => o.text.trim());
  
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
      <div className="bg-blue-50 p-4 border-b border-gray-200">
        <h3 className="text-base font-medium text-gray-900 flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
          {t('poll_preview.title') || 'Telegram Poll Preview'}
        </h3>
      </div>
      
      <div className="p-4">
        {/* Mock Telegram Message Container */}
        <div className="max-w-md mx-auto rounded-lg overflow-hidden bg-white shadow">
          {/* Telegram Poll Header */}
          <div className="bg-[#F0F2F5] p-3 flex items-start">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <span className="text-sm font-medium">T</span>
            </div>
            <div className="ml-3">
              <div className="font-semibold text-sm">Telegram</div>
              <div className="text-xs text-gray-500">Poll</div>
            </div>
          </div>
          
          {/* Poll Content */}
          <div className="p-4">
            {question ? (
              <div className="font-medium text-base mb-3">{question}</div>
            ) : (
              <div className="font-medium text-base mb-3 text-gray-400 italic">
                {t('poll_preview.question_placeholder') || 'Your poll question will appear here'}
              </div>
            )}
            
            {/* Poll Options */}
            {hasValidOptions ? (
              <div className="space-y-2">
                {validOptions.map((option, index) => (
                  <div 
                    key={index}
                    className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className={`h-5 w-5 mr-3 rounded-full border flex items-center justify-center ${allowsMultipleAnswers ? 'border-gray-400' : 'border-gray-400'}`}>
                      {/* Empty circle/square for options */}
                      {allowsMultipleAnswers ? (
                        <div className="h-4 w-4 rounded-sm border border-gray-400"></div>
                      ) : null}
                    </div>
                    <span className="text-sm">{option.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 italic text-sm">
                {t('poll_preview.options_placeholder') || 'Add at least two options to see the preview'}
              </div>
            )}
            
            {/* Poll Footer */}
            <div className="mt-4 text-xs text-gray-500 flex items-center">
              <div className="flex items-center mr-4">
                {isAnonymous ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-gray-400" />
                    <span>{t('poll_preview.anonymous') || 'Anonymous'}</span>
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 mr-1 text-gray-400" />
                    <span>{t('poll_preview.not_anonymous') || 'Not anonymous'}</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                {allowsMultipleAnswers ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-gray-400" />
                    <span>{t('poll_preview.multiple_answers') || 'Multiple answers'}</span>
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 mr-1 text-gray-400" />
                    <span>{t('poll_preview.single_answer') || 'Single answer'}</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Vote Count */}
            <div className="mt-2 text-xs text-gray-500">
              <span>{t('poll_preview.no_votes') || '0 votes'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramPollPreview; 