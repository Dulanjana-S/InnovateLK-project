import { createBrowserRouter } from 'react-router';
import { RootLayout } from './components/layout/RootLayout';
import { HomePage } from './pages/HomePage';
import { BrowsePatentsPage } from './pages/BrowsePatentsPage';
import { PatentDetailPage } from './pages/PatentDetailPage';
import { InnovatorDashboard } from './pages/InnovatorDashboard';
import { InvestorDashboard } from './pages/InvestorDashboard';
import { ManufacturerDashboard } from './pages/ManufacturerDashboard';
import { ChatbotPage } from './pages/ChatbotPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UploadPatentPage } from './pages/UploadPatentPage';
import { MessagesPage } from './pages/MessagesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { MyPatentsPage } from './pages/MyPatentsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { HelpSupportPage } from './pages/HelpSupportPage';
import { DashboardRedirect } from './pages/DashboardRedirect';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { PeopleDirectoryPage } from './pages/PeopleDirectoryPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { FavoritesPage } from './pages/FavoritesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'dashboard', Component: DashboardRedirect },
      { path: 'browse', Component: BrowsePatentsPage },
      { path: 'patent/:id', Component: PatentDetailPage },
      { path: 'innovator-dashboard', Component: InnovatorDashboard },
      { path: 'investor-dashboard', Component: InvestorDashboard },
      { path: 'manufacturer-dashboard', Component: ManufacturerDashboard },
      { path: 'ai-chatbot', Component: ChatbotPage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'about', Component: AboutPage },
      { path: 'upload-patent', Component: UploadPatentPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'people', Component: PeopleDirectoryPage },
      { path: 'people/:id', Component: UserProfilePage },
      { path: 'analytics', Component: AnalyticsPage },
      { path: 'admin', Component: AdminPanelPage },
      { path: 'investments', Component: InvestmentsPage },
      { path: 'profile-settings', Component: ProfileSettingsPage },
      { path: 'my-patents', Component: MyPatentsPage },
      { path: 'notifications', Component: NotificationsPage },
      { path: 'favorites', Component: FavoritesPage },
      { path: 'help', Component: HelpSupportPage },
      { path: 'privacy', Component: PrivacyPolicyPage },
      { path: 'terms', Component: TermsOfServicePage },
      { path: 'forgot-password', Component: ForgotPasswordPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
