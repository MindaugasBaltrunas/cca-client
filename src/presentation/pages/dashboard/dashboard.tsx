import { NavLink } from "react-router-dom";
import { safeDisplay } from "xss-safe-display";

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard Dashboard</h1>
      <div >
        <NavLink to={safeDisplay.url("/profile")}>Forgot Password?</NavLink>
      </div>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, corrupti
        incidunt in impedit commodi voluptate! Exercitationem quidem aperiam
        minus magnam fugit mollitia eum aliquam, doloremque accusantium magni
        fuga, culpa nostrum.
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, corrupti
        incidunt in impedit commodi voluptate! Exercitationem quidem aperiam
        minus magnam fugit mollitia eum aliquam, doloremque accusantium magni
        fuga, culpa nostrum.
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, corrupti
        incidunt in impedit commodi voluptate! Exercitationem quidem aperiam
        minus magnam fugit mollitia eum aliquam, doloremque accusantium magni
        fuga, culpa nostrum.
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, corrupti
        incidunt in impedit commodi voluptate! Exercitationem quidem aperiam
        minus magnam fugit mollitia eum aliquam, doloremque accusantium magni
        fuga, culpa nostrum.
      </p>
    </div>
  );
};

export default Dashboard;
