import http, { getApiMessage } from './api';

export { getApiMessage };

export type PostRow = {
  id?: number;
  post_id: number;
  user_id: number;
  title: string | null;
  content: string;
  ai_summary: string | null;
  cover_image: string | null;
  tags: string | null;
  image_path: string | null; // 多张图片以逗号分隔
  username?: string;
  avatar?: string | null;
  created_at?: string;
  like_count?: number;
  comment_count?: number;
};

export type QuestionRow = {
  id?: number;
  question_id: number;
  user_id: number;
  title: string;
  content: string;
  ai_answer: string | null;
  image_path: string | null;
  tags: string | null;
  username?: string;
  avatar?: string | null;
  created_at?: string;
  like_count?: number;
  comment_count?: number;
};

export type CommentRow = {
  id: number;
  user_id: number;
  content: string;
  username?: string;
  avatar?: string | null;
  created_at?: string;
};

export async function fetchPosts() {
  const { data } = await http.get<PostRow[]>('/posts');
  return data;
}

export async function fetchPost(id: number) {
  const { data } = await http.get<PostRow>(`/posts/${id}`);
  return data;
}

export async function fetchQuestions() {
  const { data } = await http.get<QuestionRow[]>('/questions');
  return data;
}

export async function fetchQuestion(id: number) {
  const { data } = await http.get<QuestionRow>(`/questions/${id}`);
  return data;
}

export async function fetchMyPosts() {
  const { data } = await http.get<PostRow[]>('/posts/my/posts');
  return data;
}

export async function fetchMyQuestions() {
  const { data } = await http.get<QuestionRow[]>('/questions/my/questions');
  return data;
}

export async function fetchPostComments(postId: number) {
  const { data } = await http.get<CommentRow[]>(`/posts/${postId}/comments`);
  return data;
}

export async function fetchQuestionComments(qId: number) {
  const { data } = await http.get<CommentRow[]>(`/questions/${qId}/comments`);
  return data;
}

export async function togglePostLike(postId: number) {
  const { data } = await http.post<{ liked: boolean }>(`/posts/${postId}/like`);
  return data;
}

export async function toggleQuestionLike(qId: number) {
  const { data } = await http.post<{ liked: boolean }>(`/questions/${qId}/like`);
  return data;
}

export async function getPostLikeCount(postId: number) {
  const { data } = await http.get<{ count: number }>(`/posts/${postId}/likes`);
  return data.count;
}

export async function getQuestionLikeCount(qId: number) {
  const { data } = await http.get<{ count: number }>(`/questions/${qId}/likes`);
  return data.count;
}

export async function createPostComment(postId: number, content: string) {
  const { data } = await http.post(`/posts/${postId}/comments`, { content });
  return data;
}

export async function createQuestionComment(qId: number, content: string) {
  const { data } = await http.post(`/questions/${qId}/comments`, { content });
  return data;
}

/** AI 对话 */
export async function createAiSession(title?: string) {
  const { data } = await http.post<{ sessionId: number; title: string }>('/aichat/sessions', {
    title,
  });
  return data;
}

export async function listAiSessions() {
  const { data } = await http.get<
    { id: number; title: string; created_at: string; updated_at: string }[]
  >('/aichat/sessions');
  return data;
}

export async function getAiMessages(sessionId: number, limit?: number) {
  const { data } = await http.get<{
    session: { id: number; title: string };
    messages: { id: number; role: string; content: string; created_at: string; images?: { url: string; type: string; sort: number }[] | null }[];
  }>(`/aichat/sessions/${sessionId}/messages`, { params: { limit } });
  return data;
}

export async function sendAiMessage(sessionId: number, content: string, images?: File[]) {
  const formData = new FormData();
  formData.append('content', content);
  if (images && images.length > 0) {
    images.forEach((file) => {
      formData.append('images', file);
    });
  }
  const { data } = await http.post<{
    reply: string;
    assistantMessageId: number;
    imageDescription?: string | null;
  }>(`/aichat/sessions/${sessionId}/messages`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteAiSession(sessionId: number) {
  await http.delete(`/aichat/sessions/${sessionId}`);
}

/** 用户私聊 */
export type ConversationRow = {
  id: number;
  updated_at: string;
  peer_id: number;
  peer_username: string;
  peer_avatar: string | null;
  last_message: string | null;
  unread_count: number;
};

export async function listUserConversations() {
  const { data } = await http.get<ConversationRow[]>('/userchat/conversations');
  return data;
}

export async function searchChatUsers(q: string) {
  const { data } = await http.get<
    { user_id: number; username: string; avatar: string | null; phone: string }[]
  >('/userchat/users/search', { params: { q } });
  return data;
}

export async function openUserConversation(peerId: number) {
  const { data } = await http.post<{ conversationId: number }>('/userchat/conversations', {
    peer_id: peerId,
  });
  return data;
}

export type UserMessageRow = {
  id: number;
  sender_id: number;
  content: string;
  created_at: string;
  username?: string;
  avatar?: string | null;
};

export async function getUserMessages(conversationId: number, params?: { before?: number; limit?: number }) {
  const { data } = await http.get<{
    conversation: object;
    peer_id: number;
    messages: UserMessageRow[];
  }>(`/userchat/conversations/${conversationId}/messages`, { params });
  return data;
}

export async function sendUserMessage(conversationId: number, content: string) {
  const { data } = await http.post<{ messageId: number }>(
    `/userchat/conversations/${conversationId}/messages`,
    { content }
  );
  return data;
}

export async function fetchMe() {
  const { data } = await http.get<{
    id: number;
    nickname: string;
    avatar: string | null;
    phone: string | null;
    email: string | null;
    bio: string | null;
    role: string | null;
  }>('/auth/me');
  return data;
}

/** 更新个人信息 */
export async function updateProfile(payload: {
  username?: string;
  email?: string;
  bio?: string;
}) {
  const { data } = await http.put<{
    message: string;
    user: {
      id: number;
      nickname: string;
      avatar: string | null;
      phone: string | null;
      email: string | null;
      bio: string | null;
      role: string | null;
    };
  }>('/auth/profile', payload);
  return data;
}

/** 上传头像 */
export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await http.post<{
    message: string;
    avatar: string;
  }>('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** 创建文章 */
export async function createPost(content: string, images?: File[], title?: string, tags?: string[]) {
  const formData = new FormData();
  if (title) {
    formData.append('title', title);
  }
  formData.append('content', content);
  if (tags && tags.length > 0) {
    formData.append('tags', JSON.stringify(tags));
  }
  if (images && images.length > 0) {
    images.forEach((file) => {
      formData.append('images', file);
    });
  }
  const { data } = await http.post<{ id: number }>('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** 删除文章 */
export async function deletePost(postId: number) {
  const { data } = await http.delete<{ message: string }>(`/posts/${postId}`);
  return data;
}

/** 删除问题 */
export async function deleteQuestion(questionId: number) {
  const { data } = await http.delete<{ message: string }>(`/questions/${questionId}`);
  return data;
}

/** 删除换花帖子 */
export async function deleteExchangeFlower(exchangeId: number) {
  const { data } = await http.delete<{ message: string }>(`/exchange-flowers/${exchangeId}`);
  return data;
}

/** 创建问题 */
export async function createQuestion(title: string, content: string, images?: File[], tags?: string[]) {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  if (tags && tags.length > 0) {
    formData.append('tags', JSON.stringify(tags));
  }
  if (images && images.length > 0) {
    images.forEach((file) => {
      formData.append('images', file);
    });
  }
  const { data } = await http.post<{ id: number }>('/questions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** 定位和天气 */
export type LocationData = {
  province: string;
  city: string;
  adcode: string;
};

export type WeatherCast = {
  date: string;
  dayweather: string;
  nightweather: string;
  daytemp: string;
  nighttemp: string;
  daywind: string;
  nightwind: string;
  week: string;
};

export type WeatherData = {
  city: string;
  adcode: string;
  province: string;
  reporttime: string;
  casts: WeatherCast[];
};

export async function getCurrentLocationAndWeather() {
  const { data } = await http.get<{
    success: boolean;
    location: LocationData;
    weather: WeatherData;
  }>('/location/current');
  return data;
}

export async function getLocation() {
  const { data } = await http.get<{
    success: boolean;
    data: LocationData & { rectangle?: string };
  }>('/location/location');
  return data;
}

export async function getWeather(adcode: string, extensions: 'all' | 'base' = 'all') {
  const { data } = await http.get<{
    success: boolean;
    data: WeatherData;
  }>(`/location/weather/${adcode}`, { params: { extensions } });
  return data;
}

/** 搜索相关类型 */
export type SearchResult = {
  id: number;
  type: 'post' | 'question';
  title: string | null;
  content: string;
  tags: string[];
  cover_image: string | null;
  created_at: string;
  user: {
    user_id: number;
    username: string;
    avatar: string | null;
    bio: string | null;
  } | null;
};

export type SearchUser = {
  id: number;
  user_id: number;
  username: string;
  bio: string | null;
  avatar: string | null;
  role: string | null;
};

export type SearchResults = {
  users: SearchUser[];
  postsByTitle: SearchResult[];
  postsByContent: SearchResult[];
  questionsByTitle: SearchResult[];
  questionsByContent: SearchResult[];
};

export type SearchResponse = {
  success: boolean;
  results: SearchResults;
  hasResults: boolean;
};

export async function search(keyword: string) {
  const { data } = await http.get<SearchResponse>('/search', {
    params: { q: keyword },
  });
  return data;
}

/** 用户相关 */
export type UserProfile = {
  user_id: number;
  username: string;
  bio: string | null;
  avatar: string | null;
  role: string | null;
  created_at: string;
};

export async function fetchUserProfile(userId: number) {
  const { data } = await http.get<{ success: boolean; user: UserProfile }>(`/users/${userId}`);
  return data.user;
}

export async function fetchUserPosts(userId: number) {
  const { data } = await http.get<PostRow[]>(`/users/${userId}/posts`);
  return data;
}

export async function fetchUserQuestions(userId: number) {
  const { data } = await http.get<QuestionRow[]>(`/users/${userId}/questions`);
  return data;
}

/** 换花帖子 */
export type ExchangeFlowerRow = {
  id?: number;
  exchange_id: number;
  user_id: number;
  title: string | null;
  content: string;
  exchange_status: string; // pending/confirmed/completed
  cover_image: string | null;
  tags: string | null;
  image_path: string | null;
  username?: string;
  avatar?: string | null;
  created_at?: string;
  like_count?: number;
  comment_count?: number;
};

export async function fetchExchangeFlowers() {
  const { data } = await http.get<ExchangeFlowerRow[]>('/exchange-flowers');
  return data;
}

export async function fetchExchangeFlower(id: number) {
  const { data } = await http.get<ExchangeFlowerRow>(`/exchange-flowers/${id}`);
  return data;
}

export async function fetchMyExchangeFlowers() {
  const { data } = await http.get<ExchangeFlowerRow[]>('/exchange-flowers/my/posts');
  return data;
}

export async function createExchangeFlower(content: string, images?: File[], title?: string, tags?: string[], exchange_status?: string) {
  const formData = new FormData();
  if (title) {
    formData.append('title', title);
  }
  formData.append('content', content);
  if (tags && tags.length > 0) {
    formData.append('tags', JSON.stringify(tags));
  }
  if (exchange_status) {
    formData.append('exchange_status', exchange_status);
  }
  if (images && images.length > 0) {
    images.forEach((file) => {
      formData.append('images', file);
    });
  }
  const { data } = await http.post<{ id: number }>('/exchange-flowers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function fetchExchangeFlowerComments(exchangeId: number) {
  const { data } = await http.get<CommentRow[]>(`/exchange-flowers/${exchangeId}/comments`);
  return data;
}

export async function toggleExchangeFlowerLike(exchangeId: number) {
  const { data } = await http.post<{ liked: boolean }>(`/exchange-flowers/${exchangeId}/like`);
  return data;
}

export async function getExchangeFlowerLikeCount(exchangeId: number) {
  const { data } = await http.get<{ count: number }>(`/exchange-flowers/${exchangeId}/likes`);
  return data.count;
}

export async function createExchangeFlowerComment(exchangeId: number, content: string) {
  const { data } = await http.post(`/exchange-flowers/${exchangeId}/comments`, { content });
  return data;
}
