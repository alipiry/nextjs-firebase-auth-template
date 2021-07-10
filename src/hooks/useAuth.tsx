import { useContext } from 'react';
import { AuthContext, IAuthContext } from '@providers';

export function useAuth(): IAuthContext {
  return useContext(AuthContext);
}
