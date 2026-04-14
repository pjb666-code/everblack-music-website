/**
 * Re-exports useInternetIdentity from core-infrastructure.
 * All components should import from here: import { useInternetIdentity } from '@/hooks/useInternetIdentity'
 */
export {
  useInternetIdentity,
  InternetIdentityProvider,
  type InternetIdentityContext,
  type Status,
} from "@caffeineai/core-infrastructure";
