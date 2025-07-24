import { z } from 'zod';

// Base message structure
export const MessageMetaSchema = z.object({
  timestamp: z.date(),
  timeMillies: z.number().int().positive(),
  id: z.string().uuid(),
});

export const BaseMessageSchema = z.object({
  type: z.string(),
  meta: MessageMetaSchema,
  payload: z.record(z.any())
});

// Device schemas
export const AddDevicePayloadSchema = z.object({
  deviceName: z.string().optional()
});

export const UpdateDevicePayloadSchema = z.object({
  deviceName: z.string().optional(),
  deviceState: z.enum(['TEST', 'IDLE', 'ACTIVE-ON', 'ACTIVE-OFF', 'ERROR']).optional()
});

export const AddResultPayloadSchema = z.object({
  deviceName: z.string().optional(),
  result: z.enum(['hit', 'miss'])
});

// Complete message schemas
export const AddDeviceMessageSchema = BaseMessageSchema.extend({
  type: z.literal('DEVICE/ADDED'),
  payload: AddDevicePayloadSchema
});

export const UpdateDeviceMessageSchema = BaseMessageSchema.extend({
  type: z.literal('DEVICE/UPDATED'),
  payload: UpdateDevicePayloadSchema
});

export const AddResultMessageSchema = BaseMessageSchema.extend({
  type: z.literal('RESULTS/ADDED'),
  payload: AddResultPayloadSchema
});

export const ResetResultsMessageSchema = BaseMessageSchema.extend({
  type: z.literal('RESULTS/RESET'),
  payload: z.object({})
});

// Union of all message types
export const MqttMessageSchema = z.discriminatedUnion('type', [
  AddDeviceMessageSchema,
  UpdateDeviceMessageSchema,
  AddResultMessageSchema,
  ResetResultsMessageSchema
]);

// TypeScript types
export type MessageMeta = z.infer<typeof MessageMetaSchema>;
export type BaseMessage = z.infer<typeof BaseMessageSchema>;
export type AddDevicePayload = z.infer<typeof AddDevicePayloadSchema>;
export type UpdateDevicePayload = z.infer<typeof UpdateDevicePayloadSchema>;
export type AddResultPayload = z.infer<typeof AddResultPayloadSchema>;
export type AddDeviceMessage = z.infer<typeof AddDeviceMessageSchema>;
export type UpdateDeviceMessage = z.infer<typeof UpdateDeviceMessageSchema>;
export type AddResultMessage = z.infer<typeof AddResultMessageSchema>;
export type ResetResultsMessage = z.infer<typeof ResetResultsMessageSchema>;
export type MqttMessage = z.infer<typeof MqttMessageSchema>;

// Validation helpers
export const validateMqttMessage = (data: unknown): MqttMessage => {
  return MqttMessageSchema.parse(data);
};

export const validateAddDeviceMessage = (data: unknown): AddDeviceMessage => {
  return AddDeviceMessageSchema.parse(data);
};

export const validateUpdateDeviceMessage = (data: unknown): UpdateDeviceMessage => {
  return UpdateDeviceMessageSchema.parse(data);
};

export const validateAddResultMessage = (data: unknown): AddResultMessage => {
  return AddResultMessageSchema.parse(data);
};