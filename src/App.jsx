import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Overview from './components/Dashboard/Overview';
import ProductPage from './components/DashboardSubPages/ProductPage';
import Shop from './components/Dashboard/Shop';
import AddProductPage from './components/DashboardSubPages/AddProductPage';
import Customers from './components/DashboardSubPages/Customers';
import SingleCustomerPage from './components/DashboardSubPages/SingleCustomerPage';
import Orders from './components/DashboardSubPages/Orders';
import ServicesPage from './components/DashboardSubPages/ServicesPage';
import OrdersDialog from './components/OrdersDialog';
import Bookings from './components/DashboardSubPages/Bookings';
import BookingDetails from './components/BookingDetails';
import Notifications from './components/Notifications';
import AuthenticationPage from './components/Auth/AuthenticationPage';
import Login from './components/Auth/Login';
import Payments from './components/Dashboard/Payments';
import Onboarding1 from './components/Onboarding/Onboarding1';
import Onboarding2 from './components/Onboarding/Onboarding2';
import Settings from './components/Settings/Settings';
import Chatbot from './components/Dashboard/Chatbot';


function App() {

  return (
 <Router>
 <div className="App"> 
   <Routes>
   <Route exact path="/" element={<AuthenticationPage/>}/> 
   <Route exact path="/Login" element={<Login/>}/>   
   <Route exact path="/Overview" element={<Overview/>}/>
   <Route exact path="/ProductPage" element={<ProductPage/>}/> 
   <Route exact path="/Shop" element={<Shop/>}/> 
   <Route exact path="/AddProductPage" element={<AddProductPage/>}/> 
   <Route exact path="/Customers" element={<Customers/>}/> 
   <Route exact path="/SingleCustomerPage" element={<SingleCustomerPage/>}/>
   <Route exact path="/Orders" element={<Orders/>}/>
   <Route exact path="/ServicesPage" element={<ServicesPage/>}/>
   <Route exact path="/OrdersDialog" element={<OrdersDialog/>}/>
   <Route exact path="/Bookings" element={<Bookings/>}/>
   <Route exact path="/BookingDetails" element={<BookingDetails/>}/>
   <Route exact path="/Notifications" element={<Notifications/>}/>
   <Route exact path="/Payments" element={<Payments/>}/>
   <Route exact path="/Onboarding1" element={<Onboarding1/>}/>
   <Route exact path="/Onboarding2" element={<Onboarding2/>}/>
   <Route exact path="/Settings" element={<Settings/>}/>
   <Route exact path="/Chatbot" element={<Chatbot/>}/>

   </Routes>
 </div>
 </Router>
  );
}

export default App;