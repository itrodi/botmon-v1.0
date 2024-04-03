import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Overview from './components/Dashboard/Overview';
import ProductPage from './components/DashboardSubPages/ProductPage';
import Shop from './components/Dashboard/Shop';
import ServicesPage from './components/DashboardSubPages/ServicesPage';
import AddProductPage from './components/DashboardSubPages/AddProductPage';
import Customers from './components/DashboardSubPages/Customers';
import SingleCustomerPage from './components/DashboardSubPages/SingleCustomerPage';


function App() {

  return (
 <Router>
 <div className="App"> 
   <Routes>
   <Route exact path="/" element={<Overview/>}/>  
   <Route exact path="/ProductPage" element={<ProductPage/>}/> 
   <Route exact path="/Shop" element={<Shop/>}/> 
   <Route exact path="/ServicesPage" element={<ServicesPage/>}/> 
   <Route exact path="/AddProductPage" element={<AddProductPage/>}/> 
   <Route exact path="/Customers" element={<Customers/>}/> 
   <Route exact path="/SingleCustomerPage" element={<SingleCustomerPage/>}/> 
   </Routes>
 </div>
 </Router>
  );
}

export default App;