import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { CheckCircle, Crown, AlertCircle, AlertTriangle } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-hot-toast';
import { getCreditInfo, createCheckoutSession, createPortalSession } from '../../services/api';
import { CreditInfo } from '../../types/index';
import { useLanguage } from '../../contexts/LanguageContext';

// Helper function to format a date in the current locale
const formatDate = (date: Date | string) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
};

const SubscriptionManager: React.FC = () => {
  const { user } = useUserStore();
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [managePaymentLoading, setManagePaymentLoading] = useState(false);
  const { t } = useLanguage();

  // Create plans dynamically based on translations
  const plans = [
    {
      id: 'free',
      type: 'free',
      name: t('subscription.free'),
      price: t('subscription.free_price'),
      period: t('subscription.month'),
      credits: 10,
      features: [
        t('subscription.free_features_1'),
        t('subscription.free_features_2'),
        t('subscription.free_features_3'),
        t('subscription.free_features_4'),
      ],
      isPopular: false,
      buttonVariant: 'outline' as const,
    },
    {
      id: 'basic',
      type: 'basic',
      name: t('subscription.standard'),
      price: t('subscription.standard_price'),
      period: t('subscription.month'),
      credits: 100,
      features: [
        t('subscription.standard_features_1'),
        t('subscription.standard_features_2'),
        t('subscription.standard_features_3'),
        t('subscription.standard_features_4'),
      ],
      isPopular: true,
      buttonVariant: 'primary' as const,
    },
    {
      id: 'business',
      type: 'business',
      name: t('subscription.business'),
      price: t('subscription.business_price'),
      period: t('subscription.month'),
      credits: 400,
      features: [
        t('subscription.business_features_1'),
        t('subscription.business_features_2'),
        t('subscription.business_features_3'),
        t('subscription.business_features_4'),
      ],
      isPopular: false,
      buttonVariant: 'outline' as const,
    },
  ];

  // Fetch credit info when component mounts
  useEffect(() => {
    const fetchCreditInfo = async () => {
      try {
        const creditData = await getCreditInfo();
        console.log('Subscription data from server:', creditData);
        setCreditInfo(creditData);
      } catch (error) {
        console.error('Error fetching credit info:', error);
        toast.error(t('subscription.error_load'));
      } finally {
        setLoading(false);
      }
    };

    fetchCreditInfo();
  }, [t]);

  // Check for payment status in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentSuccess = params.get('payment_success');
    const paymentCancelled = params.get('payment_cancelled');
    
    if (paymentSuccess === 'true') {
      toast.success(t('subscription.payment_success'));
      
      // Refresh credit info only after successful payment
      const fetchCreditInfo = async () => {
        try {
          // Add a small delay to give the server webhook time to process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Fetch updated subscription info
          const creditData = await getCreditInfo();
          console.log('Updated subscription data after payment:', creditData);
          setCreditInfo(creditData);
          
          // Verify the subscription was actually updated
          if (creditData.subscriptionType === 'free') {
            console.warn('Payment successful but subscription not updated');
            toast.error(t('subscription.payment_processed_not_updated'));
          }
        } catch (error) {
          console.error('Error fetching credit info:', error);
          toast.error(t('subscription.error_load'));
        }
      };
      
      fetchCreditInfo();
      
      // Remove query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentCancelled === 'true') {
      toast.error(t('subscription.payment_cancelled'));
      
      // Refresh credit info to ensure we have the correct state
      const fetchCreditInfo = async () => {
        try {
          // We still need the latest info even if cancelled
          const creditData = await getCreditInfo();
          setCreditInfo(creditData);
        } catch (error) {
          console.error('Error fetching credit info:', error);
        }
      };
      
      fetchCreditInfo();
      
      // Remove query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [t]);

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
      
      // Redirect to checkout page
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(t('subscription.error_payment'));
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

  // Helper function to format a translated string with parameters
  const formatString = (key: string, ...params: (string | number)[]) => {
    let result = t(key);
    params.forEach((param, index) => {
      result = result.replace(`{${index}}`, String(param));
    });
    return result;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center">
          <Crown className="h-5 w-5 text-blue-600 mr-2" />
          <CardTitle>{t('subscription.title')}</CardTitle>
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
                      {t('subscription.current_plan')}: {plans.find(p => String(p.type).toLowerCase() === String(creditInfo.subscriptionType).toLowerCase())?.name || creditInfo.subscriptionType}
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>{formatString('subscription.credits_available', creditInfo.currentCredits, creditInfo.maxCredits)}</p>
                      <p>{formatString('subscription.total_used', creditInfo.totalUsed)}</p>
                      {creditInfo.resetDate && (
                        <p>{formatString('subscription.reset_date', formatDate(creditInfo.resetDate))}</p>
                      )}
                      
                      {/* Show downgrade notice if applicable */}
                      {creditInfo.downgradeOnExpiry && creditInfo.endDate && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                          <p className="text-amber-700 font-medium">
                            <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                            {t('subscription.cancelled')}
                          </p>
                          <p className="text-amber-600 text-xs mt-1">
                            {formatString('subscription.cancel_notice', formatDate(creditInfo.endDate))}
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
                
                // Определяем текст и состояние кнопки в зависимости от текущего плана
                const buttonText = isCurrentPlan 
                  ? t('subscription.current_plan_button')
                  : t('subscription.subscribe_button');
                
                // Для текущего плана используем disabled, для остальных проверяем processingPayment
                const isButtonDisabled = processingPayment || loading || isCurrentPlan;
                
                // Проверяем, нужно ли показывать кнопку
                // Не показываем кнопку для бесплатного тарифа, если у пользователя платный тариф
                const shouldShowButton = !(planType === 'free' && currentType !== 'free' && !creditInfo?.downgradeOnExpiry);
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`border ${plan.isPopular ? 'border-blue-500 shadow-md' : 'border-gray-200'} relative`}
                  >
                    {plan.isPopular && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {t('subscription.popular')}
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
                      {shouldShowButton && (
                        <Button
                          variant={isCurrentPlan ? 'outline' : plan.buttonVariant}
                          className={`w-full`}
                          disabled={isButtonDisabled}
                          onClick={() => plan.type !== 'free' && !isCurrentPlan && handleUpgrade(plan.type)}
                        >
                          {processingPayment ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                          ) : (
                            buttonText
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            {/* Manage Subscription Buttons */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              {creditInfo && creditInfo.subscriptionType !== 'free' && (
                <Button
                  variant="secondary"
                  onClick={handleManageSubscription}
                  disabled={managePaymentLoading}
                  className="w-full"
                >
                  {managePaymentLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>{t('subscription.loading')}</span>
                    </div>
                  ) : (
                    <span>{t('subscription.manage_payments')}</span>
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