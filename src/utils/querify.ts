import qs from 'qs';

export function querify(url: string, data: unknown) {
  const query = qs.stringify(data, {
    strictNullHandling: true,
  });

  return query ? `${url}?${query}` : url;
}

export function dequerify(query: string) {
  return qs.parse(query, {
    ignoreQueryPrefix: true,
    strictNullHandling: true,
  });
}
