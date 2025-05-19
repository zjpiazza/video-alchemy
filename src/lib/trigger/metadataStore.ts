import { metadata } from "@trigger.dev/sdk/v3";
import { MetadataSchema, MetadataStatus } from "./schemas";

/**
 * Update the status of the task. Wraps the `metadata.set` method.
 */
export function updateStatus(status: MetadataStatus) {
  metadata.set("status", status);
}

/**
 * Parse the status from the metadata.
 *
 * Used by hooks or other consumers to parse the status
 */
export function parseStatus(data: unknown): MetadataStatus {
  return MetadataSchema.parse(data).status;
}