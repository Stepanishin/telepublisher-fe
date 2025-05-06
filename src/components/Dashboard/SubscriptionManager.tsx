import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { CheckCircle, Crown, AlertCircle, CreditCard } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-hot-toast';
import { getCreditInfo, createCheckoutSession, createPortalSession } from '../../services/api';
import { CreditInfo } from '../../types';

// Subscription plans
const plans = [
  {
    id: 'free',
    type: 'free',
    name: 'Бесплатный',
    price: '0 $',
    period: 'месяц',
    credits: 50,
    features: [
      '50 AI-кредитов в месяц',
      'До 3 каналов',
      'Базовые инструменты',
      'До 30 публикаций в месяц',
    ],
    isPopular: false,
    buttonText: 'Текущий тариф',
    buttonVariant: 'outline' as const,
  },
  {
    id: 'basic',
    type: 'basic',
    name: 'Стандарт',
    price: '1 $',
    period: 'месяц',
    credits: 300,
    features: [
      '300 AI-кредитов в месяц',
      'До 10 каналов',
      'Планирование публикаций',
      'Неограниченные публикации',
      'Приоритетная поддержка',
    ],
    isPopular: true,
    buttonText: 'Оформить подписку',
    buttonVariant: 'primary' as const,
  },
  {
    id: 'professional',
    type: 'professional',
    name: 'Профессиональный',
    price: '1 $',
    period: 'месяц',
    credits: 1000,
    features: [
      '1000 AI-кредитов в месяц',
      'До 20 каналов',
      'Продвинутая генерация контента',
      'Все функции планирования',
      'Аналитика и отчеты',
    ],
    isPopular: false,
    buttonText: 'Оформить подписку',
    buttonVariant: 'outline' as const,
  },
  {
    id: 'business',
    type: 'business',
    name: 'Бизнес',
    price: '1 $',
    period: 'месяц',
    credits: 3000,
    features: [
      '3000 AI-кредитов в месяц',
      'Неограниченное количество каналов',
      'Все функции продвинутой генерации',
      'API для интеграций',
      'Выделенная поддержка 24/7',
    ],
    isPopular: false,
    buttonText: 'Оформить подписку',
    buttonVariant: 'outline' as const,
  },
];

const SubscriptionManager: React.FC = () => {
  const { user } = useUserStore();
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [managePaymentLoading, setManagePaymentLoading] = useState(false);

  // Fetch credit info when component mounts
  useEffect(() => {
    const fetchCreditInfo = async () => {
      try {
        const creditData = await getCreditInfo();
        setCreditInfo(creditData);
      } catch (error) {
        console.error('Error fetching credit info:', error);
        toast.error('Не удалось загрузить информацию о подписке');
      } finally {
        setLoading(false);
      }
    };

    fetchCreditInfo();
  }, []);

  const handleUpgrade = async (subscriptionType: string) => {
    console.log('handleUpgrade', user);
    if (!user) return;
    
    setProcessingPayment(true);
    
    try {
      // Current URL for return after payment
      const returnUrl = window.location.href;
      
      // Create checkout session and get the URL
      const checkoutUrl = await createCheckoutSession(
        subscriptionType,
        `${returnUrl}?payment_success=true`,
        `${returnUrl}?payment_cancelled=true`
      );
      
      // Redirect to checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Произошла ошибка при создании платежной сессии');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    setManagePaymentLoading(true);
    
    try {
      // Current URL for return after managing subscription
      const returnUrl = window.location.href;
      
      // Create portal session and get the URL
      const portalUrl = await createPortalSession(returnUrl);
      
      // Redirect to customer portal
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Произошла ошибка при создании сессии управления подпиской');
    } finally {
      setManagePaymentLoading(false);
    }
  };

  // Check for payment status in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentSuccess = params.get('payment_success');
    const paymentCancelled = params.get('payment_cancelled');
    
    if (paymentSuccess === 'true') {
      toast.success('Оплата прошла успешно! Подписка активирована.');
      
      // Refresh credit info
      const fetchCreditInfo = async () => {
        try {
          const creditData = await getCreditInfo();
          setCreditInfo(creditData);
        } catch (error) {
          console.error('Error fetching credit info:', error);
        }
      };
      
      fetchCreditInfo();
      
      // Remove query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentCancelled === 'true') {
      toast.error('Оплата была отменена.');
      
      // Remove query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center">
          <Crown className="h-5 w-5 text-blue-600 mr-2" />
          <CardTitle>Управление подпиской</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div>
            {creditInfo && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Текущий план: {plans.find(p => p.type === creditInfo.subscriptionType)?.name || creditInfo.subscriptionType}
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Доступно кредитов: {creditInfo.currentCredits} из {creditInfo.maxCredits}</p>
                      <p>Использовано всего: {creditInfo.totalUsed} кредитов</p>
                      {creditInfo.resetDate && (
                        <p>Дата обновления кредитов: {new Date(creditInfo.resetDate).toLocaleDateString()}</p>
                      )}
                      {creditInfo.subscriptionType !== 'free' && (
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManageSubscription}
                            disabled={managePaymentLoading}
                            className="flex items-center"
                          >
                            {managePaymentLoading ? (
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></span>
                            ) : (
                              <CreditCard className="h-4 w-4 mr-2" />
                            )}
                            Управление платежами
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      className={`w-full`}
                      disabled={processingPayment || (creditInfo?.subscriptionType === plan.type)}
                      onClick={() => plan.type !== 'free' && handleUpgrade(plan.type)}
                    >
                      {processingPayment ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      ) : creditInfo?.subscriptionType === plan.type ? (
                        'Текущий тариф'
                      ) : (
                        plan.buttonText
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager; 