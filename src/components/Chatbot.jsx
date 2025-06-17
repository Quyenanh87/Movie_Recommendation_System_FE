import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getChatResponse, getUserWatchHistory } from '../services/chatService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { CircularProgress } from '@mui/material';

const MarkdownWrapper = ({ children }) => (
  <div className="prose prose-invert max-w-none">{children}</div>
);

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [watchHistory, setWatchHistory] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchWatchHistory = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (userId) {
          const history = await getUserWatchHistory(userId);
          setWatchHistory(history);
        }
      } catch (error) {
        console.error('Error fetching watch history:', error);
      }
    };

    fetchWatchHistory();
  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const updatedMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(updatedMessages);

    try {
      const userId = localStorage.getItem('user_id');

      const response = await getChatResponse(
        userMessage,
        userId,
        updatedMessages.map(msg => ({
          ...msg,
          watch_history: msg.role === 'user' ? watchHistory : undefined
        }))
      );

      setMessages(messages => [...messages, {
        role: 'assistant',
        content: response
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(messages => [...messages, {
        role: 'assistant',
        content: '❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const MarkdownComponents = {
    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 text-blue-400" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3 text-blue-400" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2 text-blue-400" {...props} />,
    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-gray-50" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-bold text-white drop-shadow-[0_0_0.1rem_#ffffff70]" {...props} />,
    em: ({ node, ...props }) => <em className="italic text-gray-200" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-3 text-gray-50" {...props} />,
    li: ({ node, ...props }) => <li className="text-gray-50 hover:text-white transition-colors duration-200" {...props} />,
    code: ({ node, inline, ...props }) =>
      inline ? (
        <code className="px-1 py-0.5 bg-gray-700 rounded text-sm text-gray-100" {...props} />
      ) : (
        <pre className="bg-gray-700 p-4 rounded-lg overflow-x-auto mb-4">
          <code className="text-sm text-gray-100" {...props} />
        </pre>
      ),
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="absolute bottom-16 right-0 w-96 h-[600px] bg-gray-900 rounded-lg shadow-xl flex flex-col border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span role="img" aria-label="robot">🤖</span>
            Movie Assistant
          </h2>
          <button
            onClick={clearChat}
            className="text-gray-400 hover:text-white text-sm"
            title="Xóa lịch sử chat"
          >
            🗑️ Xóa chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-white'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <MarkdownWrapper>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={MarkdownComponents}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </MarkdownWrapper>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-3 bg-gray-800 rounded-lg">
                <CircularProgress size={20} className="text-blue-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-500 text-white rounded-lg px-4 py-2
                       hover:bg-blue-600 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 disabled:opacity-50"
            >
              Gửi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
