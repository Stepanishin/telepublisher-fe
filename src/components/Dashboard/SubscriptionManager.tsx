import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { CheckCircle, Crown, AlertCircle, ArrowUpRight, CreditCard } from 'lucide-react';

// Mock data for subscription plans
const plans = [
  {
    id: 'free',
    name: 'Бесплатный',
    price: '0 ₽',
    period: 'месяц',
    features: [
      'До 3 каналов',
      'Базовые инструменты',
      'До 30 публикаций в месяц',
    ],
    isPopular: false,
    buttonText: 'Текущий тариф',
    buttonVariant: 'outline' as const,
    disabled: true,
  },
  {
    id: 'standard',
    name: 'Стандарт',
    price: '1 499 ₽',
    period: 'месяц',
    features: [
      'До 10 каналов',
      'Планирование публикаций',
      'Неограниченные публикации',
      'Приоритетная поддержка',
    ],
    isPopular: true,
    buttonText: 'Оформить подписку',
    buttonVariant: 'primary' as const,
    disabled: false,
  },
  {
    id: 'business',
    name: 'Бизнес',
    price: '4 999 ₽',
    period: 'месяц',
    features: [
      'Неограниченное количество каналов',
      'Все функции планирования',
      'Аналитика и отчеты',
      'API для интеграций',
      'Выделенная поддержка 24/7',
    ],
    isPopular: false,
    buttonText: 'Оформить подписку',
    buttonVariant: 'outline' as const,
    disabled: false,
  },
];

const SubscriptionManager: React.FC = () => {
  const [currentPlan] = useState('free'); // В реальном приложении это бы загружалось из данных пользователя
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const selectedPlanDetails = plans.find(plan => plan.id === selectedPlan);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center">
          <Crown className="h-5 w-5 text-blue-600 mr-2" />
          <CardTitle>Управление подпиской</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Текущий план: {plans.find(p => p.id === currentPlan)?.name}</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Вы можете в любой момент изменить свой тарифный план для получения доступа к расширенным возможностям.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`border ${plan.isPopular ? 'border-blue-500 shadow-md' : 'border-gray-200'} relative`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Популярный
                    </span>
                  </div>
                )}
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-500">/{plan.period}</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pb-5">
                  <Button
                    variant={plan.buttonVariant}
                    className={`w-full ${currentPlan === plan.id ? 'cursor-default' : ''}`}
                    disabled={plan.disabled || currentPlan === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {currentPlan === plan.id ? 'Текущий тариф' : plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlanDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Оформление подписки
                </h3>
                <button 
                  onClick={closePaymentModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Закрыть</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Тариф</span>
                  <span className="font-medium">{selectedPlanDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Стоимость</span>
                  <span className="font-medium">{selectedPlanDetails.price}/{selectedPlanDetails.period}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">
                  В настоящий момент форма оплаты находится в разработке. Для активации тарифа, пожалуйста, 
                  свяжитесь с нашей службой поддержки через Telegram.
                </p>
              </div>

              <div className="flex justify-between space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={closePaymentModal}
                >
                  Отмена
                </Button>
                <a 
                  href="https://t.me/telepublisher_support" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button 
                    className="w-full flex items-center justify-center"
                  >
                    Связаться с поддержкой
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SubscriptionManager; 