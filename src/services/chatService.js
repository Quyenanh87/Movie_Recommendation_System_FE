const API_URL = 'http://localhost:8000';

export const getChatResponse = async (message, userId = null, conversationHistory = []) => {
  try {
    console.log('Sending message:', message);
    console.log('With user ID:', userId);
    console.log('With conversation history:', conversationHistory);

    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user_id: userId ? parseInt(userId) : null,
        conversation_history: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response:', data);
    return data.response;

  } catch (error) {
    console.error('Error calling chat API:', error);
    throw error;
  }
};

export const getUserWatchHistory = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/user/history?user_id=${userId}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting user watch history:', error);
    throw error;
  }
};
