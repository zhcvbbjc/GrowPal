/** 主屏切换（社区详情在 CommunityScreen 内部状态完成，不占用独立路由名） */
export type Screen = 'home' | 'community' | 'chat' | 'messages' | 'profile' | 'LoginPage' | 'search' | 'searchRecommend' | 'userPage' | 'userSearch' | 'postDetail' | 'questionDetail';

export type NavigateFunction = (screen: Screen | { screen: Screen; query: string; userId?: number; postId?: number; questionId?: number }) => void;

export interface Post {
  id: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    verified?: boolean;
  };
  timestamp: string;
  content: string;
  tags: string[];
  image?: string;
  likes: number;
  comments: number;
  type?: 'insight' | 'question' | 'article';
}

export interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
    online?: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isAI?: boolean;
}
