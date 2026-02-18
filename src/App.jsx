// App.jsx
import './utils/axiosConfig'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Overview from './components/Dashboard/Overview';
import ProductPage from './components/DashboardSubPages/ProductPage';
import TransactionDetails from './components/TransactionDetails';
import AddProductPage from './components/DashboardSubPages/AddProductPage';
import Customers from './components/DashboardSubPages/Customers';
import SingleCustomerPage from './components/DashboardSubPages/SingleCustomerPage';
import Orders from './components/DashboardSubPages/Orders';
import ServicesPage from './components/DashboardSubPages/ServicesPage';
import OrdersDialog from './components/OrdersDialog';
import Bookings from './components/DashboardSubPages/Bookings';
import BookingDetails from './components/BookingDetails';
import NotificationPage from './components/NotificationPage';
import AuthenticationPage from './components/Auth/AuthenticationPage';
import Login from './components/Auth/Login';
import Payments from './components/Dashboard/Payments';
import Onboarding1 from './components/Onboarding/Onboarding1';
import Onboarding2 from './components/Onboarding/Onboarding2';
import Settings from './components/Settings/Settings';
import Chatbot from './components/Dashboard/Chatbot';
import ManageStore from './components/Dashboard/ManageStore';
import Services from './components/DashboardSubPages/Services';
import AddServicesPage from './components/DashboardSubPages/AddServicesPage';
import EditProductPage from './components/DashboardSubPages/EditProductPage';
import EditServices from './components/DashboardSubPages/EditServices';
import Messages from './components/Dashboard/Messages';
import Chatlist from './components/DashboardSubPages/Chatlist';
import PersonalDetails from './components/DashboardSubPages/Personaldetails';
import Store from './components/DashboardSubPages/Store';
import Analytics from './components/Dashboard/Analytics';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import StoreSettings from './components/DashboardSubPages/StoreSettings';
import BankAccount from './components/DashboardSubPages/BankAccount';
import LinkAccount from './components/DashboardSubPages/LinkAccount';
import AdvanceSetting from './components/DashboardSubPages/AdvanceSetting';
import IndividualProductPage from './components/IndividualProductPage';
import IndividualServicePage from './components/IndividualServicePage';
import AdminAnalytics from './components/Auth/AdminAnalytics';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import SupportPage from './components/SupportPage';

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="App"> 
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes */}
            <Route exact path="/" element={<AuthenticationPage/>}/> 
            <Route exact path="/Login" element={<Login/>}/>   
            <Route exact path="/AdminAnalytics" element={<AdminAnalytics/>}/>
            <Route exact path="/forgot-password" element={<ForgotPassword/>}/>
            <Route exact path="/reset-password" element={<ResetPassword/>}/>
            {/* Protected routes */}
            <Route exact path="/Overview" element={
              <ProtectedRoute>
                <Overview/>
              </ProtectedRoute>
            }/>
            <Route exact path="/ProductPage" element={
              <ProtectedRoute>
                <ProductPage/>
              </ProtectedRoute>
            }/> 
            <Route exact path="/TransactionDetails" element={
              <ProtectedRoute>
                <TransactionDetails/>
              </ProtectedRoute>
            }/>
            <Route exact path="/AddProductPage" element={
              <ProtectedRoute>
                <AddProductPage/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Customers" element={
              <ProtectedRoute>
                <Customers/>
              </ProtectedRoute>
            }/>
            <Route exact path="/customer/:id" element={
              <ProtectedRoute>
                <SingleCustomerPage/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Orders" element={
              <ProtectedRoute>
                <Orders/>
              </ProtectedRoute>
            }/>
            <Route exact path="/ServicesPage" element={
              <ProtectedRoute>
                <ServicesPage/>
              </ProtectedRoute>
            }/>
            <Route exact path="/OrdersDialog" element={
              <ProtectedRoute>
                <OrdersDialog/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Bookings" element={
              <ProtectedRoute>
                <Bookings/>
              </ProtectedRoute>
            }/>
            <Route exact path="/BookingDetails" element={
              <ProtectedRoute>
                <BookingDetails/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Notifications" element={
              <ProtectedRoute>
                <NotificationPage/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Payments" element={
              <ProtectedRoute>
                <Payments/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Settings" element={
              <ProtectedRoute>
                <Settings/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Chatbot" element={
              <ProtectedRoute>
                <Chatbot/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Analytics" element={
              <ProtectedRoute>
                <Analytics/>
              </ProtectedRoute>
            }/>
            <Route exact path="/ManageStore" element={
              <ProtectedRoute>
                <ManageStore/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Services" element={
              <ProtectedRoute>
                <Services/>
              </ProtectedRoute>
            }/>
            <Route exact path="/AddServices" element={
              <ProtectedRoute>
                <AddServicesPage/>
              </ProtectedRoute>
            }/>
            <Route exact path="/EditProduct" element={
              <ProtectedRoute>
                <EditProductPage/>
              </ProtectedRoute>
            }/>
            <Route exact path="/EditService" element={
              <ProtectedRoute>
                <EditServices/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Messages" element={
              <ProtectedRoute>
                <Messages/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Chats" element={
              <ProtectedRoute>
                <Chatlist/>
              </ProtectedRoute>
            }/>
            <Route exact path="/PersonalDetails" element={
              <ProtectedRoute>
                <PersonalDetails/>
              </ProtectedRoute>
            }/>
            <Route exact path="/StoreSettings" element={
              <ProtectedRoute>
                <Store/>
              </ProtectedRoute>
            }/>
            <Route exact path="/StoreSetting" element={
              <ProtectedRoute>
                <StoreSettings/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Bank" element={
              <ProtectedRoute>
                <BankAccount/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Link" element={
              <ProtectedRoute>
                <LinkAccount/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Advance" element={
              <ProtectedRoute>
                <AdvanceSetting/>
              </ProtectedRoute>
            }/>
            <Route exact path="/product/:id" element={
              <ProtectedRoute>
                <IndividualProductPage/>
              </ProtectedRoute>
            }/>
            <Route exact path="/service/:id" element={
              <ProtectedRoute>
                <IndividualServicePage/>
              </ProtectedRoute>
            }/>
            
            {/* Onboarding routes - protected */}
            <Route exact path="/Onboarding1" element={
              <ProtectedRoute>
                <Onboarding1/>
              </ProtectedRoute>
            }/>
            <Route exact path="/Onboarding2" element={
              <ProtectedRoute>
                <Onboarding2/>
              </ProtectedRoute>
            }/>
            <Route exact path="/SupportPage" element={
              <ProtectedRoute>
                <SupportPage/>
              </ProtectedRoute>
            }/>
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;