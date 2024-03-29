import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Overview from './components/Dashboard/Overview';
import ProductPage from './components/DashboardSubPages/ProductPage';


function App() {

  return (
 <Router>
 <div className="App"> 
   <Routes>
   <Route exact path="/" element={<Overview/>}/>  
   <Route exact path="/ProductPage" element={<ProductPage/>}/> 
   </Routes>
 </div>
 </Router>
  );
}

export default App;