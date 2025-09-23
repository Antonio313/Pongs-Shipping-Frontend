import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import { ActivityProvider } from '../context/ActivityContext.jsx'
import { PreAlertProvider } from '../context/PreAlertContext.jsx'
import { PackagesProvider } from '../context/PackagesContext.jsx'
import { AdminProvider } from '../context/AdminContext.jsx'
import './index.css'
import Home from './Home.jsx'
import Login from './Login.jsx'
import Error404 from './Error404.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import Signup from './Signup.jsx'
import CustomerDashboard from './CustomerDashboard.jsx'
import EmailVerification from './EmailVerification.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import AdminProfile from '../pages/admin/AdminProfile.jsx'
import AdminSettings from '../pages/admin/AdminSettings.jsx'
import CustomerProfile from '../pages/customer/CustomerProfile.jsx'
import CustomerSettings from '../pages/customer/CustomerSettings.jsx'
import ResetPassword from './ResetPassword.jsx'
import TransfersPage from '../pages/admin/TransfersPage.jsx'
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard.jsx'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ActivityProvider>
        <PreAlertProvider>
          <PackagesProvider>
            <AdminProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup/>} />
                <Route path="/customerDashboard" element={<CustomerDashboard />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/adminDashboard" element={<AdminDashboard />} />
                <Route path="/adminProfile" element={<AdminProfile />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/transfers" element={<TransfersPage />} />
                <Route path="/superAdminDashboard" element={<SuperAdminDashboard />} />
                <Route path="/customer/profile" element={<CustomerProfile />} />
                <Route path="/customer/settings" element={<CustomerSettings />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<Error404 />} />
              </Routes>
            </Router>
            </AdminProvider>
          </PackagesProvider>
        </PreAlertProvider>
      </ActivityProvider>
    </AuthProvider>
  </StrictMode>,
)