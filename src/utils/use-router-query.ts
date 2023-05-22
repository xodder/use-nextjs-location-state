import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import URL from 'url';
import { dequerify } from './querify';

function useRouterQuery() {
  const router = useRouter();

  if (!isEmpty(router.query)) {
    return router.query;
  }

  const parsed = dequerify(URL.parse(router.asPath).query!);

  if (!isEmpty(parsed)) {
    return parsed;
  }

  return undefined;
}

export default useRouterQuery;
