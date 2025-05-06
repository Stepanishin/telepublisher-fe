import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { CheckCircle, Crown, AlertCircle, AlertTriangle } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-hot-toast';
import { getCreditInfo, createCheckoutSession, createPortalSession, cancelSubscription } from '../../services/api';
import { SubscriptionType, CreditInfo } from '../../types';

// Subscription plans
const plans = [
  {
    id: 'free',
    type: 'free',
    name: 'Бесплатный',
    price: '0 $',
    period: 'месяц',
    credits: 10,
    features: [
      '10 AI-кредитов в месяц',
      'До 2 каналов',
      'Базовые инструменты',
      '2-10 пробных публикаций',
    ],
    isPopular: false,
    buttonText: 'Текущий тариф',
    buttonVariant: 'outline' as const,
  },
  {
    id: 'basic',
    type: 'basic',
    name: 'Стандарт',
    price: '10$',
    period: 'месяц',
    credits: 100,
    features: [
      '100 AI-кредитов в месяц',
      'До 10 каналов',
      'До 100 публикаций',
      'Приоритетная поддержка',
    ],
    isPopular: true,
    buttonText: 'Оформить подписку',
    buttonVariant: 'primary' as const,
  },
  {
    id: 'business',
    type: 'business',
    name: 'Бизнес',
    price: '30$',
    period: 'месяц',
    credits: 400,
    features: [
      '400 AI-кредитов в месяц',
      'Неограниченное количество каналов',
      'До 400 публикаций',
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
  const [cancelSubscriptionLoading, setCancelSubscriptionLoading] = useState(false);

  // Fetch credit info when component mounts
  useEffect(() => {
    const fetchCreditInfo = async () => {
      try {
        const creditData = await getCreditInfo();
        console.log('Subscription data from server:', creditData);
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
    console.log('handleUpgrade', subscriptionType, user);
    if (!user) return;
    
    // Если это текущий план, не делаем ничего
    const currentType = String(creditInfo?.subscriptionType || '').toLowerCase();
    const newType = String(subscriptionType).toLowerCase();
    
    if (currentType === newType) {
      console.log('Уже используется этот тариф, обновление не требуется');
      return;
    }
    
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
    } catch (error: unknown) {
      console.error('Error creating portal session:', error);
      
      // Проверка, связана ли ошибка с настройкой Customer Portal
      if (error instanceof Error && error.message && (
        error.message.includes('Portal not configured') || 
        error.message.includes('not been created') ||
        error.message.includes('configuration'))) {
        toast.error('Портал управления подпиской не настроен. Пожалуйста, обратитесь к администратору.');
      } else {
        toast.error('Произошла ошибка при создании сессии управления подпиской. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setManagePaymentLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    
    setCancelSubscriptionLoading(true);
    
    try {
      console.log('Sending cancel subscription request...');
      const response = await cancelSubscription();
      console.log('Server response:', response);
      
      if (response.success) {
        toast.success(response.message || 'Subscription cancelled. Your privileges will remain until the end of the current period.');
        
        // Update credit info with data directly from the response
        if (response.data) {
          // Only update if we have creditInfo
          if (creditInfo) {
            const updatedCreditInfo: CreditInfo = {
              ...creditInfo,
              downgradeOnExpiry: response.data.downgradeOnExpiry || true,
              endDate: response.data.endDate ? new Date(response.data.endDate) : creditInfo.endDate,
              subscriptionType: (response.data.subscriptionType || creditInfo.subscriptionType) as SubscriptionType,
              isActive: response.data.isActive !== undefined ? response.data.isActive : creditInfo.isActive
            };
            
            console.log('Updating subscription info:', updatedCreditInfo);
            setCreditInfo(updatedCreditInfo);
          } else {
            // If we don't have creditInfo, fetch it from the server
            const creditData = await getCreditInfo();
            setCreditInfo(creditData);
          }
        } else {
          // Fallback: fetch fresh data from server
          const creditData = await getCreditInfo();
          setCreditInfo(creditData);
        }
      } else {
        console.error('Error cancelling subscription:', response.message);
        toast.error(response.message || 'Unable to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('An error occurred while cancelling your subscription. Please try again or contact support.');
      
      // Always refresh data on error to ensure UI is in sync
      try {
        const creditData = await getCreditInfo();
        setCreditInfo(creditData);
      } catch (refreshError) {
        console.error('Error refreshing credit info:', refreshError);
      }
    } finally {
      setCancelSubscriptionLoading(false);
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
                      Текущий план: {plans.find(p => String(p.type).toLowerCase() === String(creditInfo.subscriptionType).toLowerCase())?.name || creditInfo.subscriptionType}
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Доступно кредитов: {creditInfo.currentCredits} из {creditInfo.maxCredits}</p>
                      <p>Использовано всего: {creditInfo.totalUsed} кредитов</p>
                      {creditInfo.resetDate && (
                        <p>Дата обновления кредитов: {new Date(creditInfo.resetDate).toLocaleDateString()}</p>
                      )}
                      
                      {/* Show downgrade notice if applicable */}
                      {creditInfo.downgradeOnExpiry && creditInfo.endDate && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                          <p className="text-amber-700 font-medium">
                            <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                            Подписка отменена
                          </p>
                          <p className="text-amber-600 text-xs mt-1">
                            Ваша подписка будет действовать до {new Date(creditInfo.endDate).toLocaleDateString()}, 
                            после чего будет автоматически переведена на бесплатный план. 
                            Ваши накопленные кредиты будут сохранены.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => {
                // Более надежная проверка с приведением типов и значений к строке
                const currentType = String(creditInfo?.subscriptionType || '').toLowerCase();
                const planType = String(plan.type || '').toLowerCase();
                const isCurrentPlan = currentType === planType;
                
                console.log(`Plan type: "${planType}", current subscription type: "${currentType}", isMatch: ${isCurrentPlan}`);
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`border ${plan.isPopular ? 'border-blue-500 shadow-md' : 'border-gray-200'} relative`}
                  >
                    {plan.isPopular && (
                      <div className="absolute top-2 right-2">
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
                        disabled={processingPayment || loading || isCurrentPlan}
                        onClick={() => plan.type !== 'free' && handleUpgrade(plan.type)}
                      >
                        {processingPayment ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        ) : isCurrentPlan ? (
                          'Текущий тариф'
                        ) : (
                          plan.buttonText
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            {/* Manage Subscription Buttons */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              {creditInfo && creditInfo.subscriptionType !== 'free' && !creditInfo.downgradeOnExpiry && (
                <>
                  <Button
                    variant="secondary"
                    onClick={handleManageSubscription}
                    disabled={managePaymentLoading}
                    className="flex-1"
                  >
                    {managePaymentLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>Загрузка...</span>
                      </div>
                    ) : (
                      <span>Управление платежами</span>
                    )}
                  </Button>
                  
                  <Button
                    variant="danger"
                    onClick={handleCancelSubscription}
                    disabled={cancelSubscriptionLoading || creditInfo.downgradeOnExpiry}
                    className="flex-1"
                  >
                    {cancelSubscriptionLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>Отмена...</span>
                      </div>
                    ) : (
                      <span>Отменить подписку</span>
                    )}
                  </Button>
                </>
              )}
              
              {creditInfo && (creditInfo.subscriptionType === 'free' || creditInfo.downgradeOnExpiry) && (
                <Button
                  variant="primary"
                  onClick={() => handleUpgrade('basic')}
                  disabled={processingPayment}
                  className="flex-1"
                >
                  {processingPayment ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Загрузка...</span>
                    </div>
                  ) : (
                    <span>{creditInfo.downgradeOnExpiry ? 'Возобновить подписку' : 'Оформить подписку'}</span>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager; 