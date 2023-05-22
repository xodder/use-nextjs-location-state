import get from 'lodash/get';
import { NextRouter, useRouter } from 'next/router';
import React from 'react';
import URL, { Url } from 'url';
import useRouterQuery from './utils/use-router-query';

export function useLocationState<T = unknown>(key: string, defaultValue?: T) {
  const updateLocationState = useUpdateLocationState();

  const value: T = useLocationStateValue(key, defaultValue);
  const setValue = (value: T) => {
    void updateLocationState({ [key]: value }, true);
  };

  return [value, setValue] as const;
}

export function useLocationStateValue(key: string, defaultValue?: unknown) {
  const query = useRouterQuery();

  if (!query) {
    return defaultValue;
  }

  const value = get(query, key, defaultValue);

  if (!value) {
    return undefined;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(value as string);
  } catch (e) {
    return value;
  }
}

type StateFn =
  | Record<string, unknown>
  | ((state: Record<string, unknown>) => Record<string, unknown>);

type Options =
  | boolean
  | {
      replace?: boolean;
      excludeHash?: boolean;
    };

export function useUpdateLocationState() {
  const whenRouterIsReady = useWhenRouterIsReady();

  return (stateFn: StateFn, optionsOrReplace: Options = true) => {
    whenRouterIsReady(async (router) => {
      const options =
        typeof optionsOrReplace === 'boolean'
          ? { replace: !!optionsOrReplace }
          : optionsOrReplace;

      const newState =
        typeof stateFn === 'function'
          ? stateFn(router.query)
          : { ...router.query, ...stateFn };

      const hash =
        !options?.excludeHash && router.asPath.indexOf('#') !== -1
          ? URL.parse(router.asPath).hash
          : '';

      const url = { hash, query: newState } as Url;

      if (options?.replace) {
        return router.replace(url, undefined, {
          scroll: false,
          shallow: true,
        });
      } else {
        return router.push(url, undefined, {
          scroll: false,
          shallow: true,
        });
      }
    });
  };
}

type Callback = (router: NextRouter) => any;

function useWhenRouterIsReady() {
  const queueRef = React.useRef<Callback[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    if (router.isReady && queueRef.current.length > 0) {
      queueRef.current.forEach((callback) => callback(router));
      queueRef.current = [];
    }
  }, [router]);

  return (callback: Callback) => {
    if (router.isReady) {
      callback(router);
    } else {
      queueRef.current.push(callback);
    }
  };
}
