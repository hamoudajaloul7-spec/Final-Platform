import React, { Suspense } from 'react';

const PageLoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-600 text-sm">جاري التحميل...</p>
    </div>
  </div>
);

export const withSuspense = (Component: React.LazyExoticComponent<any>) => {
  return (props: any) => (
    <Suspense fallback={<PageLoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

export const lazyPages = {
  PartnersPage: React.lazy(() => import('@/pages/PartnersPage')),
  DiscountSlider: React.lazy(() => import('@/pages/DiscountSlider')),
  ModernStorePage: React.lazy(() => import('@/pages/ModernStorePage')),
  EnhancedProductPage: React.lazy(() => import('@/pages/EnhancedProductPage')),
  CartPage: React.lazy(() => import('@/pages/CartPage')),
  EnhancedCheckoutPage: React.lazy(() => import('@/pages/EnhancedCheckoutPage')),
  CompleteOrdersPage: React.lazy(() => import('@/pages/CompleteOrdersPage')),
  ShopLoginPage: React.lazy(() => import('@/pages/ShopLoginPage')),
  AuthCallbackPage: React.lazy(() => import('@/pages/AuthCallbackPage')),
  CreateStorePage: React.lazy(() => import('@/pages/CreateStorePage')),
  AccountTypeSelectionPage: React.lazy(() => import('@/pages/AccountTypeSelectionPage')),
  VisitorRegistrationPage: React.lazy(() => import('@/pages/VisitorRegistrationPage')),
  MerchantTermsAcceptance: React.lazy(() => import('@/pages/MerchantTermsAcceptance')),
  MerchantPersonalInfo: React.lazy(() => import('@/pages/MerchantPersonalInfo')),
  MerchantStoreInfo: React.lazy(() => import('@/pages/MerchantStoreInfo')),
  MerchantStoreSuccess: React.lazy(() => import('@/pages/MerchantStoreSuccess')),
  CreateStoreWizard: React.lazy(() => import('@/pages/CreateStoreWizard')),
  StoreCreationSuccessPage: React.lazy(() => import('@/pages/StoreCreationSuccessPage')),
  MerchantProductManagement: React.lazy(() => import('@/pages/MerchantProductManagement')),
  TermsAndConditionsPage: React.lazy(() => import('@/pages/TermsAndConditionsPage')),
  EnhancedMerchantDashboard: React.lazy(() => import('@/pages/EnhancedMerchantDashboard')),
  MerchantAnalytics: React.lazy(() => import('@/pages/MerchantAnalytics')),
  MerchantFinance: React.lazy(() => import('@/pages/MerchantFinance')),
  MerchantSettings: React.lazy(() => import('@/pages/MerchantSettings')),
  AdminPortal: React.lazy(() => import('@/pages/AdminPortal')),
  CustomerDashboard: React.lazy(() => import('@/pages/CustomerDashboard')),
  HelpCenter: React.lazy(() => import('@/pages/HelpCenterPage')),
};

export const PartnersPageLazy = withSuspense(lazyPages.PartnersPage);
export const DiscountSliderLazy = withSuspense(lazyPages.DiscountSlider);
export const ModernStorePageLazy = withSuspense(lazyPages.ModernStorePage);
export const EnhancedProductPageLazy = withSuspense(lazyPages.EnhancedProductPage);
export const CartPageLazy = withSuspense(lazyPages.CartPage);
export const EnhancedCheckoutPageLazy = withSuspense(lazyPages.EnhancedCheckoutPage);
export const CompleteOrdersPageLazy = withSuspense(lazyPages.CompleteOrdersPage);
export const ShopLoginPageLazy = withSuspense(lazyPages.ShopLoginPage);
export const AuthCallbackPageLazy = withSuspense(lazyPages.AuthCallbackPage);
export const CreateStorePageLazy = withSuspense(lazyPages.CreateStorePage);
export const AccountTypeSelectionPageLazy = withSuspense(lazyPages.AccountTypeSelectionPage);
export const VisitorRegistrationPageLazy = withSuspense(lazyPages.VisitorRegistrationPage);
export const MerchantTermsAcceptanceLazy = withSuspense(lazyPages.MerchantTermsAcceptance);
export const MerchantPersonalInfoLazy = withSuspense(lazyPages.MerchantPersonalInfo);
export const MerchantStoreInfoLazy = withSuspense(lazyPages.MerchantStoreInfo);
export const MerchantStoreSuccessLazy = withSuspense(lazyPages.MerchantStoreSuccess);
export const CreateStoreWizardLazy = withSuspense(lazyPages.CreateStoreWizard);
export const StoreCreationSuccessPageLazy = withSuspense(lazyPages.StoreCreationSuccessPage);
export const MerchantProductManagementLazy = withSuspense(lazyPages.MerchantProductManagement);
export const TermsAndConditionsPageLazy = withSuspense(lazyPages.TermsAndConditionsPage);
export const EnhancedMerchantDashboardLazy = withSuspense(lazyPages.EnhancedMerchantDashboard);
export const MerchantAnalyticsLazy = withSuspense(lazyPages.MerchantAnalytics);
export const MerchantFinanceLazy = withSuspense(lazyPages.MerchantFinance);
export const MerchantSettingsLazy = withSuspense(lazyPages.MerchantSettings);
export const AdminPortalLazy = withSuspense(lazyPages.AdminPortal);
export const CustomerDashboardLazy = withSuspense(lazyPages.CustomerDashboard);
export const HelpCenterLazy = withSuspense(lazyPages.HelpCenter);
