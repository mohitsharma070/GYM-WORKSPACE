import { TargetType } from './TargetType';

export interface PromotionalNotificationRequest {
    targetType: TargetType;
    targetIdentifiers?: string[]; // Optional, used for SPECIFIC_PHONES
    messageContent: string;
    imageUrl?: string; // Optional
}
