import { z } from 'zod';

/**
 * SSO Login Request Validator
 */
export const ssoLoginSchema = z.object({
  body: z.object({
    ssoToken: z.string().min(1, 'SSO token is required'),
    clientId: z.string().optional(),
  }),
});

/**
 * SSO Token Verify Request Validator
 */
export const verifySSOTokenSchema = z.object({
  body: z.object({
    ssoToken: z.string().min(1, 'SSO token is required'),
  }),
});

export type SSOLoginInput = z.infer<typeof ssoLoginSchema>;
export type VerifySSOTokenInput = z.infer<typeof verifySSOTokenSchema>;
