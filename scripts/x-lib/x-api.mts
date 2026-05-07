export type Mention = {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
};

export type MentionAuthor = {
  id: string;
  username: string;
  name: string;
  verified: boolean;
};

export type MentionsResponse = {
  data?: Mention[];
  includes?: { users?: MentionAuthor[] };
  meta: {
    newest_id?: string;
    oldest_id?: string;
    result_count: number;
    next_token?: string;
  };
};

export type Me = {
  data: { id: string; username: string; name: string };
};

const API_BASE = "https://api.x.com/2";

async function xGet<T>(
  path: string,
  accessToken: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`X API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T;
}

export const getMe = (accessToken: string) =>
  xGet<Me>("/users/me", accessToken);

export function getMentions(opts: {
  accessToken: string;
  userId: string;
  sinceId?: string;
  paginationToken?: string;
}): Promise<MentionsResponse> {
  const params: Record<string, string> = {
    max_results: "100",
    "tweet.fields": "created_at,public_metrics,author_id",
    expansions: "author_id",
    "user.fields": "username,verified,name",
  };
  if (opts.sinceId) params.since_id = opts.sinceId;
  if (opts.paginationToken) params.pagination_token = opts.paginationToken;
  return xGet<MentionsResponse>(
    `/users/${opts.userId}/mentions`,
    opts.accessToken,
    params,
  );
}
