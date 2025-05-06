import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Globe, Send, Lock, CheckCircle, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import PublicNavbar from '../components/Layout/PublicNavbar';
import { useLanguage } from '../contexts/LanguageContext';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <Send className="h-16 w-16 mx-auto mb-8" />
          <h1 className="text-5xl font-bold mb-6">{t('hero.title')}</h1>
          <p className="text-xl max-w-3xl mx-auto mb-10">
            {t('hero.description')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/login">
              <Button size="lg" className="bg-white !text-blue-700 hover:bg-gray-200">
                {t('hero.start_free')}
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="border-white text-white hover:text-blue-700 hover:bg-blue-700">
                {t('hero.learn_more')}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t('features.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Zap className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.fast_publication')}</h3>
                <p className="text-gray-600">
                  {t('features.fast_publication_description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Globe className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.multiple_channels')}</h3>
                <p className="text-gray-600">
                  {t('features.multiple_channels_description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Sparkles className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.ai_content')}</h3>
                <p className="text-gray-600">
                  {t('features.ai_content_description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.security')}</h3>
                <p className="text-gray-600">
                  {t('features.security_description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Lock className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.privacy')}</h3>
                <p className="text-gray-600">
                  {t('features.privacy_description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <CheckCircle className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.easy_interface')}</h3>
                <p className="text-gray-600">
                  {t('features.easy_interface_description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t('pricing.title')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('pricing.free')}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">$0<span className="text-sm text-gray-500 font-normal">/{t('pricing.mounth')}</span></p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">{t('pricing.free_channels')}</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">{t('pricing.basic-tools')}</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">{t('pricing.free_publications')}</span>
                  </li>
                </ul>
                <Link to="/login">
                  <Button variant="outline" fullWidth>{t('pricing.start-free')}</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-500 shadow-md hover:shadow-lg transition-shadow relative">
              <div className="absolute top-4 right-1 transform -translate-y-1/2">
                <div className="bg-blue-600 text-white text-xs font-semibold py-1 px-3 rounded-full inline-block">
                  {t('pricing.popular')}
                </div>
              </div>
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('pricing.standard')}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">$10<span className="text-sm text-gray-500 font-normal">/{t('pricing.mounth')}</span></p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">{t('pricing.standard_channels')}</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">{t('pricing.standard_publications')}</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">{t('pricing.standard_support')}</span>
                  </li>
                </ul>
                <Link to="/login">
                  <Button fullWidth>{t('pricing.choose_plan')}</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('pricing.business')}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">$30<span className="text-sm text-gray-500 font-normal">/{t('pricing.mounth')}</span></p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">{t('pricing.business_channels')}</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">{t('pricing.business_publications')}</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">{t('pricing.business_support')}</span>
                  </li>
                </ul>
                <Link to="/login">
                  <Button variant="outline" fullWidth>{t('pricing.choose_plan')}</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t('security.title')}
          </h2>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <div className="flex items-center justify-center mb-8">
              <Shield className="h-16 w-16 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">
              {t('security.description')}
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">{t('security.login')}</h4>
                <p className="text-blue-800">
                  {t('security.no_password')}
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">{t('security.no_data')}</h4>
                <p className="text-blue-800">
                  {t('security.no_data_description')}
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">{t('security.transparency')}</h4>
                <p className="text-blue-800">
                  {t('security.transparency_description')}
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">{t('security.protection')}</h4>
                <p className="text-blue-800">
                  {t('security.protection_description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">{t('call_to_action.title')}</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            {t('call_to_action.description')}
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-white hover:bg-gray-300 !text-blue-700">
              {t('call_to_action.start_free')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <Send className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-xl font-semibold text-white">TelePublisher</span>
              </div>
              <p className="mt-4 max-w-md text-gray-400">
                {t('footer.description')}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  {t('footer.product')}
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#features" className="hover:text-white">{t('footer.features')}</a>
                  </li>
                  <li>
                    <a href="#pricing" className="hover:text-white">{t('footer.pricing')}</a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  {t('footer.company')}
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="hover:text-white">{t('footer.contact')}</a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  {t('footer.legal_info')}
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="hover:text-white">{t('footer.terms_of_service')}</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">{t('footer.privacy_policy')}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-sm text-gray-400 text-center">
            <p>&copy; {new Date().getFullYear()} TelePublisher. {t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 