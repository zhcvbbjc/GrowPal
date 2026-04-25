/**
 * Main SandboxClient class for interacting with the sandbox server API.
 */
import type { CaptureSnapshotOptions, CreateSandboxOptions, CreateSnapshotOptions, ListSnapshotsOptions, ResourceStatus, SandboxClientConfig, Snapshot, StartSandboxOptions, UpdateSandboxOptions, WaitForSandboxOptions, WaitForSnapshotOptions } from "./types.js";
import { Sandbox } from "./sandbox.js";
/**
 * Client for interacting with the Sandbox Server API.
 *
 * This client provides a simple interface for managing sandboxes and snapshots.
 *
 * @example
 * ```typescript
 * import { SandboxClient } from "langsmith/experimental/sandbox";
 *
 * // Uses LANGSMITH_ENDPOINT and LANGSMITH_API_KEY from environment
 * const client = new SandboxClient();
 *
 * // Or with explicit configuration
 * const client = new SandboxClient({
 *   apiEndpoint: "https://api.smith.langchain.com/v2/sandboxes",
 *   apiKey: "your-api-key",
 * });
 *
 * // Build a snapshot, then create a sandbox from it
 * const snapshot = await client.createSnapshot(
 *   "python",
 *   "python:3.12-slim",
 *   1_073_741_824 // 1 GiB
 * );
 * const sandbox = await client.createSandbox(snapshot.id);
 * try {
 *   const result = await sandbox.run("python --version");
 *   console.log(result.stdout);
 * } finally {
 *   await sandbox.delete();
 * }
 * ```
 *
 * @experimental This feature is experimental, and breaking changes are expected.
 */
export declare class SandboxClient {
    private _baseUrl;
    private _apiKey?;
    private _fetchImpl;
    private _caller;
    constructor(config?: SandboxClientConfig);
    /**
     * Create a new Sandbox from a snapshot.
     *
     * Remember to call `sandbox.delete()` when done to clean up resources.
     *
     * Exactly one of `snapshotId` (positional) or `options.snapshotName` must
     * be provided. When `snapshotName` is used, the server resolves it to a
     * snapshot owned by the caller's tenant.
     *
     * @param snapshotId - ID of the snapshot to boot from. Create one with
     *   `createSnapshot()` or `captureSnapshot()`, or pass an existing snapshot ID.
     *   Pass `undefined` when booting by name via `options.snapshotName`.
     * @param options - Creation options. Use `options.snapshotName` to boot
     *   by snapshot name instead of ID.
     * @returns Created Sandbox.
     * @throws ResourceTimeoutError if timeout waiting for sandbox to be ready.
     * @throws SandboxCreationError if sandbox creation fails.
     * @throws LangSmithValidationError if TTL values are invalid, or if neither
     *   (or both) of `snapshotId` / `options.snapshotName` are provided.
     *
     * @example
     * ```typescript
     * const snapshot = await client.createSnapshot(
     *   "python",
     *   "python:3.12-slim",
     *   1_073_741_824
     * );
     * const sandbox = await client.createSandbox(snapshot.id);
     * // Or, resolve by snapshot name:
     * const sandbox = await client.createSandbox(undefined, {
     *   snapshotName: "python",
     * });
     * try {
     *   const result = await sandbox.run("echo hello");
     *   console.log(result.stdout);
     * } finally {
     *   await sandbox.delete();
     * }
     * ```
     */
    createSandbox(snapshotId?: string, options?: CreateSandboxOptions): Promise<Sandbox>;
    /**
     * Get a Sandbox by name.
     *
     * The sandbox is NOT automatically deleted. Use deleteSandbox() for cleanup.
     *
     * @param name - Sandbox name.
     * @returns Sandbox.
     * @throws LangSmithResourceNotFoundError if sandbox not found.
     */
    getSandbox(name: string, options?: {
        signal?: AbortSignal;
    }): Promise<Sandbox>;
    /**
     * List all Sandboxes.
     *
     * @returns List of Sandboxes.
     */
    listSandboxes(): Promise<Sandbox[]>;
    /**
     * Update a sandbox's display name.
     *
     * @param name - Current sandbox name.
     * @param newName - New display name.
     */
    updateSandbox(name: string, newName: string): Promise<Sandbox>;
    /**
     * Update a sandbox's name and/or TTL settings.
     *
     * @param name - Current sandbox name.
     * @param options - Fields to update. Omit a field to leave it unchanged.
     * @returns Updated Sandbox. If no fields are provided, returns the current sandbox.
     * @throws LangSmithResourceNotFoundError if sandbox not found.
     * @throws LangSmithResourceNameConflictError if newName is already in use.
     * @throws LangSmithValidationError if TTL values are invalid.
     */
    updateSandbox(name: string, options: UpdateSandboxOptions): Promise<Sandbox>;
    /**
     * Delete a Sandbox.
     *
     * @param name - Sandbox name.
     * @throws LangSmithResourceNotFoundError if sandbox not found.
     */
    deleteSandbox(name: string): Promise<void>;
    /**
     * Get the provisioning status of a sandbox.
     *
     * This is a lightweight endpoint designed for polling during async creation.
     * Use this instead of getSandbox() when you only need the status.
     *
     * @param name - Sandbox name.
     * @returns ResourceStatus with status and optional status_message.
     * @throws LangSmithResourceNotFoundError if sandbox not found.
     */
    getSandboxStatus(name: string, options?: {
        signal?: AbortSignal;
    }): Promise<ResourceStatus>;
    /**
     * Wait for a sandbox to become ready.
     *
     * Polls getSandboxStatus() until the sandbox reaches "ready" or "failed" status,
     * then returns the full Sandbox object.
     *
     * @param name - Sandbox name.
     * @param options - Polling options (timeout, pollInterval).
     * @returns Ready Sandbox.
     * @throws LangSmithResourceCreationError if sandbox status becomes "failed".
     * @throws LangSmithResourceTimeoutError if timeout expires while still provisioning.
     * @throws LangSmithResourceNotFoundError if sandbox not found.
     *
     * @example
     * ```typescript
     * const sandbox = await client.createSandbox(snapshot.id, { waitForReady: false });
     * // ... do other work ...
     * const readySandbox = await client.waitForSandbox(sandbox.name);
     * ```
     */
    waitForSandbox(name: string, options?: WaitForSandboxOptions): Promise<Sandbox>;
    /**
     * Start a stopped sandbox and wait until ready.
     *
     * @param name - Sandbox name.
     * @param options - Options with timeout.
     * @returns Sandbox in "ready" status.
     */
    startSandbox(name: string, options?: StartSandboxOptions): Promise<Sandbox>;
    /**
     * Stop a running sandbox (preserves sandbox files for later restart).
     *
     * @param name - Sandbox name.
     */
    stopSandbox(name: string): Promise<void>;
    /**
     * Build a snapshot from a Docker image.
     *
     * Blocks until the snapshot is ready (polls with 2s interval).
     *
     * @param name - Snapshot name.
     * @param dockerImage - Docker image to build from (e.g., "python:3.12-slim").
     * @param fsCapacityBytes - Filesystem capacity in bytes.
     * @param options - Additional options (registry credentials, timeout).
     * @returns Snapshot in "ready" status.
     */
    createSnapshot(name: string, dockerImage: string, fsCapacityBytes: number, options?: CreateSnapshotOptions): Promise<Snapshot>;
    /**
     * Capture a snapshot from a running sandbox.
     *
     * Blocks until the snapshot is ready (polls with 2s interval).
     *
     * @param sandboxName - Name of the sandbox to capture from.
     * @param name - Snapshot name.
     * @param options - Capture options (timeout).
     * @returns Snapshot in "ready" status.
     */
    captureSnapshot(sandboxName: string, name: string, options?: CaptureSnapshotOptions): Promise<Snapshot>;
    /**
     * Get a snapshot by ID.
     *
     * @param snapshotId - Snapshot UUID.
     * @returns Snapshot.
     */
    getSnapshot(snapshotId: string, options?: {
        signal?: AbortSignal;
    }): Promise<Snapshot>;
    /**
     * List snapshots, optionally filtered and paginated server-side.
     *
     * The backend always paginates this endpoint. When `limit` is omitted the
     * server applies a default page size (currently 50), so a single call is
     * not guaranteed to return every snapshot visible to the tenant. To iterate
     * through all results, repeat the call with increasing `offset` values (or
     * an explicit `limit`) until fewer than `limit` snapshots come back.
     *
     * @param options - Optional filter/pagination options.
     *   - `nameContains`: case-insensitive substring match on snapshot name.
     *   - `limit`: page size; must be between 1 and 500 (inclusive). Defaults
     *     to 50 server-side when omitted.
     *   - `offset`: number of snapshots to skip; must be `>= 0`.
     *
     *   Values outside those ranges are rejected by the server.
     * @returns A single page of Snapshots matching the provided filters.
     *
     * @example
     * ```typescript
     * const firstPage = await client.listSnapshots();
     * const page = await client.listSnapshots({
     *   nameContains: "python",
     *   limit: 100,
     *   offset: 0,
     * });
     * ```
     */
    listSnapshots(options?: ListSnapshotsOptions): Promise<Snapshot[]>;
    /**
     * Delete a snapshot.
     *
     * @param snapshotId - Snapshot UUID.
     */
    deleteSnapshot(snapshotId: string): Promise<void>;
    /**
     * Poll until a snapshot reaches "ready" or "failed" status.
     *
     * @param snapshotId - Snapshot UUID.
     * @param options - Polling options (timeout, pollInterval).
     * @returns Snapshot in "ready" status.
     */
    waitForSnapshot(snapshotId: string, options?: WaitForSnapshotOptions): Promise<Snapshot>;
    /**
     * Returns a string representation of the SandboxClient instance.
     * This method is called when the object is converted to a string
     * or logged, ensuring sensitive information like API keys is not exposed.
     *
     * @returns A string representation of the SandboxClient.
     */
    toString(): string;
}
