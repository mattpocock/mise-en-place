export type ReferencedTweet = {
  type: "replied_to" | "quoted" | "retweeted";
  id: string;
};

export type Tweet = {
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
  referenced_tweets?: ReferencedTweet[];
};

export type Mention = Tweet;

export type MentionAuthor = {
  id: string;
  username: string;
  name: string;
  verified: boolean;
};

export type MentionsResponse = {
  data?: Mention[];
  includes?: { users?: MentionAuthor[]; tweets?: Tweet[] };
  meta: {
    newest_id?: string;
    oldest_id?: string;
    result_count: number;
    next_token?: string;
  };
};

export type TweetsLookupResponse = {
  data?: Tweet[];
  includes?: { users?: MentionAuthor[]; tweets?: Tweet[] };
};

export type Me = {
  data: { id: string; username: string; name: string };
};

const API_BASE = "https://api.x.com/2";

const TWEET_FIELDS = "created_at,public_metrics,author_id,referenced_tweets";
const TWEET_EXPANSIONS = "author_id,referenced_tweets.id,referenced_tweets.id.author_id";
const USER_FIELDS = "username,verified,name";

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
    max_results: "5",
    "tweet.fields": TWEET_FIELDS,
    expansions: TWEET_EXPANSIONS,
    "user.fields": USER_FIELDS,
  };
  if (opts.sinceId) params.since_id = opts.sinceId;
  if (opts.paginationToken) params.pagination_token = opts.paginationToken;
  return xGet<MentionsResponse>(
    `/users/${opts.userId}/mentions`,
    opts.accessToken,
    params,
  );
}

export function searchQuotes(opts: {
  accessToken: string;
  username: string;
  sinceId?: string;
  paginationToken?: string;
}): Promise<MentionsResponse> {
  const params: Record<string, string> = {
    query: `quotes_of:${opts.username}`,
    max_results: "10",
    "tweet.fields": TWEET_FIELDS,
    expansions: TWEET_EXPANSIONS,
    "user.fields": USER_FIELDS,
  };
  if (opts.sinceId) params.since_id = opts.sinceId;
  if (opts.paginationToken) params.next_token = opts.paginationToken;
  return xGet<MentionsResponse>("/tweets/search/recent", opts.accessToken, params);
}

export function getTweets(opts: {
  accessToken: string;
  ids: string[];
}): Promise<TweetsLookupResponse> {
  if (opts.ids.length === 0 || opts.ids.length > 100) {
    throw new Error(`getTweets: ids.length must be 1..100, got ${opts.ids.length}`);
  }
  return xGet<TweetsLookupResponse>("/tweets", opts.accessToken, {
    ids: opts.ids.join(","),
    "tweet.fields": TWEET_FIELDS,
    expansions: TWEET_EXPANSIONS,
    "user.fields": USER_FIELDS,
  });
}
