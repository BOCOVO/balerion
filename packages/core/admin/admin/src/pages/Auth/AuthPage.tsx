import { Navigate, useLocation, useMatch } from 'react-router-dom';

import { useAuth } from '../../features/Auth';
import { useInitQuery } from '../../services/admin';

import { Login } from './components/Login';
import { FORMS, FormDictionary } from './constants';

/* -------------------------------------------------------------------------------------------------
 * AuthPage
 * -----------------------------------------------------------------------------------------------*/

const AuthPage = () => {
  const { search } = useLocation();
  const match = useMatch('/auth/:authType');
  const authType = match?.params.authType;
  const { data } = useInitQuery();
  const { hasAdmin } = data ?? {};

  const { token } = useAuth('AuthPage', (auth) => auth);

  if (!authType || !FORMS) {
    return <Navigate to="/" />;
  }

  const Component = FORMS[authType as keyof FormDictionary];

  // Redirect the user to the login page if
  // the endpoint does not exists
  if (!Component) {
    return <Navigate to="/" />;
  }

  // User is already logged in
  if (authType !== 'register-admin' && authType !== 'register' && token) {
    return <Navigate to="/" />;
  }

  // there is already an admin user oo
  if (hasAdmin && authType === 'register-admin' && token) {
    return <Navigate to="/" />;
  }

  // Redirect the user to the register-admin if it is the first user
  if (!hasAdmin && authType !== 'register-admin') {
    return (
      <Navigate
        to={{
          pathname: '/auth/register-admin',
          // Forward the `?redirectTo` from /auth/login
          // /abc => /auth/login?redirectTo=%2Fabc => /auth/register-admin?redirectTo=%2Fabc
          search,
        }}
      />
    );
  }

  if (Login && authType === 'login') {
    // Assign the component to render for the login form
    return <Login />;
  } else if (authType === 'login' && !Login) {
    // block rendering until the Login EE component is fully loaded
    return null;
  }

  return <Component hasAdmin={hasAdmin} />;
};

export { AuthPage };
