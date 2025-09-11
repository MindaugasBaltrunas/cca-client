// Dashboard.tsx
import { NavLink } from "react-router-dom";
import { ALLOWED_ROUTES } from "../../routes/constants/constants";

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>

      <div>
        <NavLink to={ALLOWED_ROUTES.GET_ALL_POSTS}>View Posts</NavLink>
      </div>

      {/* Probably not "Forgot Password?" to /profile — double-check this */}
      <div>
        <NavLink to={ALLOWED_ROUTES.PROFILE}>Profile</NavLink>
      </div>
    </div>
  );
};
export default Dashboard;
