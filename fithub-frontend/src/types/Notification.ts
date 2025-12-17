import { TargetType } from './TargetType';

export interface NotificationRequest {
    phoneNumber: string;
    message: string;
}

export interface PromotionalNotificationRequest {
    targetType: TargetType;
    targetIdentifiers?: string[]; // Optional, used for SPECIFIC_PHONES
    messageContent: string;
    imageUrl?: string; // Optional
}

export interface NotificationResult {
    success: boolean;
    message: string;
    externalMessageId?: string;
}
