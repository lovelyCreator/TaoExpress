import { getStoredToken } from './authApi';
import { SocketMessage, GeneralInquiry } from './socketService';

const API_BASE_URL = 'https://todaymall.co.kr/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface GetInquiryResponse {
  inquiry: GeneralInquiry;
}

export interface GetInquiriesByOrderResponse {
  inquiries: GeneralInquiry[];
}

export interface UnreadCountsResponse {
  totalUnread: number;
  inquiries: Array<{
    inquiryId: string;
    unreadCount: number;
  }>;
}

export interface CreateInquiryRequest {
  orderId: string;
  message: string;
  attachments?: File[];
}

export interface CreateInquiryResponse {
  inquiry: GeneralInquiry;
}

export interface SendMessageRequest {
  message: string;
  attachments?: File[];
}

export interface SendMessageResponse {
  message: SocketMessage;
  inquiry: GeneralInquiry;
}

export const inquiryApi = {
  /**
   * Create a new inquiry for an order
   */
  createInquiry: async (orderId: string, message: string, files: File[] = []): Promise<ApiResponse<CreateInquiryResponse>> => {
    try {
      const token = await getStoredToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please log in again.',
        };
      }

      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('message', message);
      files.forEach((file, index) => {
        formData.append('attachments', file as any);
      });

      const url = `${API_BASE_URL}/inquiries`;
      // console.log('Sending create inquiry request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid response from server. Please try again.',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || `Request failed with status ${response.status}`,
        };
      }

      if (responseData.status !== 'success') {
        return {
          success: false,
          error: responseData?.message || 'Failed to create inquiry',
        };
      }

      return {
        success: true,
        message: responseData.message || 'Inquiry created successfully',
        data: responseData.data,
      };
    } catch (error: any) {
      // console.error('Create inquiry error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.',
      };
    }
  },

  /**
   * Send a message in an inquiry
   */
  sendMessage: async (inquiryId: string, message: string, files: File[] = []): Promise<ApiResponse<SendMessageResponse>> => {
    try {
      const token = await getStoredToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please log in again.',
        };
      }

      const formData = new FormData();
      formData.append('message', message);
      files.forEach((file) => {
        formData.append('attachments', file as any);
      });

      const url = `${API_BASE_URL}/inquiries/${inquiryId}/messages`;
      // console.log('Sending message request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid response from server. Please try again.',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || `Request failed with status ${response.status}`,
        };
      }

      if (responseData.status !== 'success') {
        return {
          success: false,
          error: responseData?.message || 'Failed to send message',
        };
      }

      return {
        success: true,
        message: responseData.message || 'Message sent successfully',
        data: responseData.data,
      };
    } catch (error: any) {
      // console.error('Send message error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.',
      };
    }
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (inquiryId: string): Promise<ApiResponse<{ inquiry: GeneralInquiry }>> => {
    try {
      const token = await getStoredToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please log in again.',
        };
      }

      const url = `${API_BASE_URL}/inquiries/${inquiryId}/mark-read`;
      // console.log('Sending mark as read request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid response from server. Please try again.',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || `Request failed with status ${response.status}`,
        };
      }

      if (responseData.status !== 'success') {
        return {
          success: false,
          error: responseData?.message || 'Failed to mark as read',
        };
      }

      return {
        success: true,
        message: responseData.message || 'Messages marked as read',
        data: responseData.data,
      };
    } catch (error: any) {
      // console.error('Mark as read error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.',
      };
    }
  },

  /**
   * Close an inquiry
   */
  closeInquiry: async (inquiryId: string): Promise<ApiResponse<{ inquiry: GeneralInquiry }>> => {
    try {
      const token = await getStoredToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please log in again.',
        };
      }

      const url = `${API_BASE_URL}/inquiries/${inquiryId}/close`;
      // console.log('Sending close inquiry request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid response from server. Please try again.',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || `Request failed with status ${response.status}`,
        };
      }

      if (responseData.status !== 'success') {
        return {
          success: false,
          error: responseData?.message || 'Failed to close inquiry',
        };
      }

      return {
        success: true,
        message: responseData.message || 'Inquiry closed successfully',
        data: responseData.data,
      };
    } catch (error: any) {
      // console.error('Close inquiry error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.',
      };
    }
  },

  /**
   * Get a single inquiry by ID
   */
  getInquiry: async (inquiryId: string): Promise<ApiResponse<GetInquiryResponse>> => {
    try {
      const token = await getStoredToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please log in again.',
        };
      }

      const url = `${API_BASE_URL}/inquiries/${inquiryId}`;
      // console.log('Sending get inquiry request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      // console.log('Get inquiry response status:', response.status);

      const responseText = await response.text();
      // console.log('Get inquiry response text:', responseText.substring(0, 500));

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid response from server. Please try again.',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || `Request failed with status ${response.status}`,
        };
      }

      if (responseData.status !== 'success') {
        return {
          success: false,
          error: responseData?.message || 'Failed to get inquiry',
        };
      }

      return {
        success: true,
        message: responseData.message || 'Inquiry retrieved successfully',
        data: responseData.data,
      };
    } catch (error: any) {
      // console.error('Get inquiry error:', error);
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get inquiries by order ID
   */
  getInquiriesByOrderId: async (orderId: string): Promise<ApiResponse<GetInquiriesByOrderResponse>> => {
    try {
      const token = await getStoredToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please log in again.',
        };
      }

      const url = `${API_BASE_URL}/inquiries/order/${orderId}`;
      // console.log('Sending get inquiries by order ID request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      // console.log('Get inquiries by order ID response status:', response.status);

      const responseText = await response.text();
      // console.log('Get inquiries by order ID response text:', responseText.substring(0, 500));

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid response from server. Please try again.',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || `Request failed with status ${response.status}`,
        };
      }

      if (responseData.status !== 'success') {
        return {
          success: false,
          error: responseData?.message || 'Failed to get inquiries',
        };
      }

      return {
        success: true,
        message: responseData.message || 'Inquiries retrieved successfully',
        data: responseData.data,
      };
    } catch (error: any) {
      // console.error('Get inquiries by order ID error:', error);
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get inquiries by order number (fallback)
   */
  getInquiriesByOrderNumber: async (orderNumber: string): Promise<ApiResponse<GetInquiriesByOrderResponse>> => {
    try {
      const token = await getStoredToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please log in again.',
        };
      }

      const url = `${API_BASE_URL}/inquiries/order/${orderNumber}`;
      // console.log('Sending get inquiries by order number request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      // console.log('Get inquiries by order number response status:', response.status);

      const responseText = await response.text();
      // console.log('Get inquiries by order number response text:', responseText.substring(0, 500));

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid response from server. Please try again.',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || `Request failed with status ${response.status}`,
        };
      }

      if (responseData.status !== 'success') {
        return {
          success: false,
          error: responseData?.message || 'Failed to get inquiries',
        };
      }

      return {
        success: true,
        message: responseData.message || 'Inquiries retrieved successfully',
        data: responseData.data,
      };
    } catch (error: any) {
      // console.error('Get inquiries by order number error:', error);
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get all user inquiries
   */
  getInquiries: async (status?: 'open' | 'closed' | 'resolved'): Promise<ApiResponse<GetInquiriesByOrderResponse>> => {
    try {
      const token = await getStoredToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please log in again.',
        };
      }

      const url = status 
        ? `${API_BASE_URL}/inquiries?status=${status}`
        : `${API_BASE_URL}/inquiries`;
      // console.log('Sending get inquiries request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      // console.log('Get inquiries response status:', response.status);

      const responseText = await response.text();
      // console.log('Get inquiries response text:', responseText.substring(0, 500));

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid response from server. Please try again.',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || `Request failed with status ${response.status}`,
        };
      }

      if (responseData.status !== 'success') {
        return {
          success: false,
          error: responseData?.message || 'Failed to get inquiries',
        };
      }

      return {
        success: true,
        message: responseData.message || 'Inquiries retrieved successfully',
        data: responseData.data,
      };
    } catch (error: any) {
      // console.error('Get inquiries error:', error);
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get unread counts for all inquiries
   */
  getUnreadCounts: async (): Promise<ApiResponse<UnreadCountsResponse>> => {
    try {
      const token = await getStoredToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please log in again.',
        };
      }

      const url = `${API_BASE_URL}/inquiries/unread-counts`;
      // console.log('Sending get unread counts request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      // console.log('Get unread counts response status:', response.status);

      const responseText = await response.text();
      // console.log('Get unread counts response text:', responseText.substring(0, 500));

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid response from server. Please try again.',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || `Request failed with status ${response.status}`,
        };
      }

      if (responseData.status !== 'success') {
        return {
          success: false,
          error: responseData?.message || 'Failed to get unread counts',
        };
      }

      return {
        success: true,
        message: responseData.message || 'Unread counts retrieved successfully',
        data: responseData.data,
      };
    } catch (error: any) {
      // console.error('Get unread counts error:', error);
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

