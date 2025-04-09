import { JSX, Suspense } from "react"; 
import { Routes, Route, Navigate } from "react-router-dom"; 
import { ProtectedRoute } from "./ProtectedRoute"; 
import Preloader from "../pages/preloader/preloader"; 
import Layout from "../components/Layout/Layout"; 
import Dashboard from "../pages/dashboard/dashboard"; 
import LoginForm from "../pages/loginPage/LoginPage";

const Routing = (): JSX.Element => {   
  return (     
    <Suspense fallback={<Preloader isLoading={true} />}>       
      <Routes>         
        {/* Login route without Layout */}         
        <Route path="/login" element={<LoginForm />} />          
        
        {/* Protected routes with Layout */}         
        <Route element={<ProtectedRoute />}>           
          <Route             
            path="/"             
            element={               
              <Layout>                 
                <Dashboard />               
              </Layout>             
            }           
          />            
          {/* Add other protected routes similarly */}         
        </Route>
        
        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>     
    </Suspense>   
  ); 
};  

export default Routing;