// lib/types.ts
export interface EmailPayload {
    subject: string;
    from: string;
    to?: string;
    date: string;
    text: string;
    html?: string;
    attachments?: EmailAttachment[];
  }
  
  export interface EmailAttachment {
    filename: string;
    contentType: string;
    size: number;
    content?: string; // Base64 encoded
  }
  
  export interface AnalysisResult {
    text: string;
    insights: string;
    actionItems: string[];
    priority: 'Alta' | 'Média' | 'Baixa';
  }
  
  export interface NotionPageResult {
    success: boolean;
    pageUrl: string;
    pageId: string;
  }
  
  export interface WhatsAppResult {
    success: boolean;
    messageSid: string;
    status: string;
  }
  
  export interface WebhookResponse {
    success: boolean;
    message: string;
    processingTime: number;
    notion?: NotionPageResult;
    whatsapp?: WhatsAppResult;
    analysis?: AnalysisResult;
  }