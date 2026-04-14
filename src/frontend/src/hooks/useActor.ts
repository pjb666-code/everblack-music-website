import { createActor } from "@/backend";
import type { ExternalBlob, backendInterface } from "@/backend";
/**
 * Re-exports useActor from core-infrastructure, bound to the project's backend.
 * All components should import from here: import { useActor } from '@/hooks/useActor'
 */
import {
  useActor as _useActor,
  createActorWithConfig,
} from "@caffeineai/core-infrastructure";
import type { createActorFunction } from "@caffeineai/core-infrastructure";

const boundCreateActor: createActorFunction<backendInterface> = (
  canisterId: string,
  uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
  downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
  options,
) => createActor(canisterId, uploadFile, downloadFile, options);

export function useActor() {
  return _useActor<backendInterface>(boundCreateActor);
}

export { createActorWithConfig };
