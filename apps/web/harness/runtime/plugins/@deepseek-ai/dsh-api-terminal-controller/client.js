window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-api-terminal-controller",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let _deepseek_ai_dsh_api_gateway_client = require("@deepseek-ai/dsh-api-gateway/client");
		//#region ../../typert/protocol/lib/index.js
		/** The one Remote failure class shared by owners, the Gateway, and consumers. */
		/**
		* One Remote call failure: a real Error carrying its stable code and typed
		* details. Owners throw it at the failure point; the Host Gateway encodes it
		* onto the wire unchanged; the Client face rebuilds an instance for the
		* `RemoteResult` error branch, so `throw result.error` keeps throw semantics.
		* Discrimination is always by `code`, never by instanceof.
		*/
		var RemoteError = class extends Error {
			code;
			details;
			/** Structural marker: cross-realm/bundle identification never uses instanceof. */
			isDSHRemoteError = true;
			/**
			* @param code - stable failure code declared in {@link RemoteErrorDetailsMap}.
			* @param message - human diagnostic carried across the wire.
			* @param details - structured payload typed by the code.
			* @param options - standard Error options (`cause` survives in-process only).
			*/
			constructor(code, message, details, options) {
				super(message, options);
				this.code = code;
				this.details = details;
				this.name = "RemoteError";
			}
		};
		/**
		* Structurally identify a RemoteError thrown across module or realm copies of
		* this class. Mechanism-internal: the Gateway and test assertions use it;
		* business code receives typed failures and never needs it.
		* @param value - a caught value.
		* @returns the failure when the marker matches, otherwise undefined.
		*/
		function remoteErrorOf(value) {
			if (typeof value === "object" && value !== null && value.isDSHRemoteError === true && typeof value.code === "string") return value;
		}
		//#endregion
		//#region lib/types/client/shell-preference.js
		/** Browser-local shell preference; Host discovery decides whether the saved path is usable. */
		const KEY = "dsh.terminal.shell";
		/**
		* Read the browser preference.
		* @returns the last selected shell path, or null when storage is unavailable.
		*/
		function preferredShell() {
			try {
				return typeof localStorage === "undefined" ? null : localStorage.getItem(KEY);
			} catch (_storageUnavailable) {
				return null;
			}
		}
		/**
		* Remember the selected shell without making storage a startup dependency.
		* @param path - verified executable path offered by the Host.
		*/
		function rememberShell(path) {
			try {
				if (typeof localStorage !== "undefined") localStorage.setItem(KEY, path);
			} catch (_storageUnavailable) {}
		}
		//#endregion
		//#region ../../util/deque/lib/index.js
		/**
		* Zero-dependency circular deque for queues that retain entries across asynchronous work.
		* @module @deepseek-ai/dsh-deque
		*/
		const MIN_CAPACITY = 16;
		/**
		* A circular deque with amortized constant-time insertion and removal.
		* Removed entries are cleared immediately, and sparse storage shrinks after
		* the live entry count reaches one quarter of its capacity.
		*/
		var Deque = class {
			buffer = new Array(MIN_CAPACITY);
			head = 0;
			count = 0;
			/** Number of entries available to remove. */
			get size() {
				return this.count;
			}
			/**
			* Append one entry after the current tail.
			* @param value - entry to append.
			*/
			pushBack(value) {
				this.ensureCapacity();
				const tail = this.head + this.count;
				this.buffer[tail < this.buffer.length ? tail : tail - this.buffer.length] = value;
				this.count += 1;
			}
			/**
			* Insert one entry before the current head.
			* @param value - entry to prepend.
			*/
			pushFront(value) {
				this.ensureCapacity();
				this.head = this.head === 0 ? this.buffer.length - 1 : this.head - 1;
				this.buffer[this.head] = value;
				this.count += 1;
			}
			/**
			* Remove the current head entry and clear its retained reference.
			* Callers whose element type includes `undefined` use {@link size} to
			* distinguish an empty deque from an `undefined` entry.
			* @returns the removed entry, or `undefined` when the deque is empty.
			*/
			popFront() {
				if (this.count === 0) return void 0;
				const value = this.buffer[this.head];
				this.buffer[this.head] = void 0;
				this.head += 1;
				if (this.head === this.buffer.length) this.head = 0;
				this.count -= 1;
				this.compact();
				return value;
			}
			/** Drop every entry and release the current backing storage. */
			clear() {
				this.buffer = new Array(MIN_CAPACITY);
				this.head = 0;
				this.count = 0;
			}
			ensureCapacity() {
				if (this.count < this.buffer.length) return;
				this.resize(this.buffer.length * 2);
			}
			compact() {
				if (this.count === 0) {
					this.head = 0;
					return;
				}
				if (this.buffer.length > MIN_CAPACITY && this.count <= this.buffer.length / 4) this.resize(Math.max(MIN_CAPACITY, this.buffer.length / 2));
			}
			resize(capacity) {
				const next = new Array(capacity);
				let source = this.head;
				for (let index = 0; index < this.count; index += 1) {
					next[index] = this.buffer[source];
					source += 1;
					if (source === this.buffer.length) source = 0;
				}
				this.buffer = next;
				this.head = 0;
			}
		};
		//#endregion
		//#region lib/types/client/model.js
		/** React-free browser terminal state and reconnecting Remote-stream ownership. */
		var TerminalViewError = class extends RemoteError {
			constructor(issue, message = issue) {
				super("terminal/view", message, { issue });
			}
		};
		/** A view survives DOM unmount; its process only ends on explicit close. */
		var TerminalView = class {
			sessionId;
			remote;
			gateway;
			inventory;
			id;
			createWhenMissing;
			shellPath;
			retain;
			/** Observable controls, process metadata and the next screen update awaiting acknowledgement. */
			state = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				phase: "idle",
				writable: false
			});
			lifetime = new AbortController();
			stream;
			mounted = false;
			attachment;
			pendingRender;
			revision = 0;
			creation;
			loading;
			closing;
			detaching = /* @__PURE__ */ new Set();
			/**
			* @param sessionId - Session owning the terminal.
			* @param remote - typed terminal Remote operations.
			* @param gateway - reconnecting stream factory.
			* @param inventory - Session-owned terminal list shared by all views.
			* @param id - Host terminal identity, reused when recovering an item from its Session list.
			* @param createWhenMissing - allow allocation only for a new tab, never a listed terminal.
			* @param shellPath - explicit shell chosen at the guide; omission uses the remembered available shell.
			* @param retain - window hold acknowledgement required before output attachment.
			*/
			constructor(sessionId, remote, gateway, inventory, id, createWhenMissing = true, shellPath, retain) {
				this.sessionId = sessionId;
				this.remote = remote;
				this.gateway = gateway;
				this.inventory = inventory;
				this.id = id;
				this.createWhenMissing = createWhenMissing;
				this.shellPath = shellPath;
				this.retain = retain;
			}
			/**
			* Attach the DOM lifetime, starting the chosen shell or reconnecting the saved process.
			* @returns a detach callback that leaves the terminal process alive.
			*/
			mount() {
				this.mounted = true;
				const state = this.state.getSnapshot();
				if (state.phase === "idle") this.refresh();
				else if (state.info !== void 0 && state.phase !== "failed" && state.phase !== "closed") this.connect();
				return () => {
					this.mounted = false;
					this.detach();
				};
			}
			/**
			* Start or explicitly retry this tab, sharing Session discovery with other views.
			* New identities allocate directly; confirmed or restored terminals cannot be replaced.
			* @returns after environment lookup and creation or recovery settle.
			*/
			refresh() {
				if (this.creation !== void 0) return this.creation;
				if (this.loading !== void 0) return this.loading;
				if (this.closing !== void 0 || this.lifetime.signal.aborted) return Promise.resolve();
				const retry = this.state.getSnapshot().phase !== "idle";
				this.patch({
					phase: "loading",
					error: void 0,
					issue: void 0
				});
				this.loading = (async () => {
					const [environment, available] = await Promise.all([this.remote.environment(this.sessionId, this.lifetime.signal), this.createWhenMissing ? void 0 : this.inventory.read(retry)]);
					if (this.stopped()) return;
					this.patch({ environment: valueOf(environment) });
					const info = available?.get(this.id);
					if (info !== void 0) this.adopt(info);
					else if (this.createWhenMissing) {
						let path = this.shellPath;
						if (path === void 0) {
							const shells = valueOf(await this.remote.shells(this.sessionId, this.lifetime.signal));
							const previous = preferredShell();
							path = shells.find((shell) => shell.path === previous)?.path ?? shells[0]?.path;
						}
						if (this.stopped()) return;
						if (path !== void 0) rememberShell(path);
						await this.create(valueOf(environment), path);
					} else throw new TerminalViewError("missingTerminal");
				})().catch((error) => {
					this.fail(error);
				}).finally(() => {
					this.loading = void 0;
				});
				return this.loading;
			}
			stopped() {
				return this.lifetime.signal.aborted || this.closing !== void 0;
			}
			async create(environment, shellPath) {
				this.patch({
					phase: "creating",
					error: void 0,
					issue: void 0
				});
				this.creation = (async () => {
					const info = valueOf(await this.remote.create(this.sessionId, {
						id: this.id,
						...shellPath === void 0 ? {} : { shellPath },
						cols: Math.min(80, environment.maxCols),
						rows: Math.min(24, environment.maxRows)
					}, this.lifetime.signal));
					if (!this.lifetime.signal.aborted) {
						this.inventory.update(info);
						this.adopt(info);
					}
				})().catch((error) => {
					this.fail(error);
				}).finally(() => {
					this.creation = void 0;
				});
				await this.creation;
			}
			adopt(info) {
				this.createWhenMissing = false;
				this.patch({
					info,
					title: info.title
				});
				if (this.retain === void 0) {
					if (this.mounted && this.closing === void 0) this.connect();
					return;
				}
				this.retain(this.lifetime.signal).then(() => {
					if (this.mounted && this.closing === void 0) this.connect();
				}).catch((error) => {
					if (!this.stopped()) this.fail(error);
				});
			}
			/** Reattach with a fresh screen and regain input control. */
			connect() {
				const info = this.state.getSnapshot().info;
				if (info === void 0 || !this.mounted || this.closing !== void 0 || this.lifetime.signal.aborted) return;
				this.detach();
				const stream = this.gateway.$stream({
					name: "Browser terminal output",
					open: async function* (signal) {
						await this.retain?.(signal);
						signal.throwIfAborted();
						const handle = this.remote.attach(this.sessionId, info.id, signal);
						const attachment = {
							handle,
							signal,
							sequence: 0,
							acknowledged: 0,
							pending: /* @__PURE__ */ new Map(),
							queued: new Deque(),
							window: void 0,
							bytes: 0,
							bufferedBytes: 0,
							inFlightBytes: 0
						};
						this.attachment = attachment;
						try {
							for await (const frame of handle) {
								if (frame.type === "snapshot") attachment.window = frame.inputWindow;
								yield frame;
							}
						} finally {
							if (this.attachment === attachment) this.attachment = void 0;
						}
					}.bind(this),
					ended: () => new TerminalViewError("attachmentEnded"),
					carrierFailed: () => {
						if (this.stream === stream) this.patch({
							phase: "disconnected",
							writable: false
						});
					}
				});
				this.stream = stream;
				this.patch({
					phase: "connecting",
					writable: false,
					error: void 0,
					issue: void 0,
					render: void 0
				});
				this.consume(stream);
			}
			/**
			* Release the next stream item after xterm has parsed this frame.
			* @param revision - locally delivered render revision.
			*/
			acknowledge(revision) {
				if (this.pendingRender?.revision !== revision) return;
				this.pendingRender.resolve();
				this.pendingRender = void 0;
			}
			/**
			* Queue input within the raw UTF-8 and encoded-frame budgets, waiting for carrier capacity.
			* @param data - input from the terminal emulator; never replayed after disconnection.
			*/
			write(data) {
				const state = this.state.getSnapshot();
				const attachment = this.attachment;
				if (!state.writable || state.info === void 0 || attachment === void 0 || attachment.signal.aborted) return;
				if (data.length === 0) return;
				const bytes = new TextEncoder().encode(data).byteLength;
				if (attachment.bytes + bytes > (state.environment?.maxInputBytes ?? 0)) {
					this.failInput(new TerminalViewError("inputFull"));
					return;
				}
				this.send(attachment, {
					type: "write",
					sequence: attachment.sequence + 1,
					data
				}, bytes);
			}
			/**
			* Resize only from the currently writable view, ordered with keyboard input.
			* @param cols - measured column count.
			* @param rows - measured row count.
			*/
			resize(cols, rows) {
				const state = this.state.getSnapshot();
				const attachment = this.attachment;
				if (!state.writable || state.info === void 0 || attachment === void 0 || attachment.signal.aborted) return;
				if (state.info.cols === cols && state.info.rows === rows) return;
				cols = Math.min(cols, state.environment?.maxCols ?? cols);
				rows = Math.min(rows, state.environment?.maxRows ?? rows);
				this.send(attachment, {
					type: "resize",
					sequence: attachment.sequence + 1,
					cols,
					rows
				}, 0);
			}
			send(attachment, command, bytes) {
				const frameBytes = new TextEncoder().encode(JSON.stringify(command)).byteLength + (attachment.window?.frameOverheadBytes ?? 0);
				if (attachment.bufferedBytes + frameBytes > (this.state.getSnapshot().environment?.maxBufferedBytes ?? 0) || attachment.window !== void 0 && frameBytes > attachment.window.maxBytes) {
					this.failInput(new TerminalViewError("inputFull"));
					return;
				}
				attachment.queued.pushBack({
					command,
					inputBytes: bytes,
					frameBytes
				});
				attachment.sequence = command.sequence;
				attachment.bytes += bytes;
				attachment.bufferedBytes += frameBytes;
				this.flushInput(attachment);
			}
			flushInput(attachment) {
				while (this.attachment === attachment && !attachment.signal.aborted && this.state.getSnapshot().writable) {
					const next = attachment.queued.popFront();
					if (next === void 0) return;
					if (attachment.window !== void 0 && attachment.inFlightBytes + next.frameBytes > attachment.window.maxBytes) {
						attachment.queued.pushFront(next);
						return;
					}
					try {
						attachment.handle.send(next.command);
					} catch (error) {
						this.failInput(error);
						return;
					}
					attachment.pending.set(next.command.sequence, {
						inputBytes: next.inputBytes,
						frameBytes: next.frameBytes
					});
					attachment.inFlightBytes += next.frameBytes;
				}
			}
			failInput(error) {
				this.fail(error);
				this.detach();
			}
			/**
			* Update the Host terminal's display name.
			* @param title - user-entered terminal title.
			* @returns after the rename settles and its result is reflected in view state.
			*/
			async rename(title) {
				if (title.trim() === this.state.getSnapshot().title || this.lifetime.signal.aborted) return;
				try {
					valueOf(await this.remote.rename(this.sessionId, this.id, title));
					if (this.stopped()) return;
					const current = this.state.getSnapshot().info;
					if (current !== void 0) this.inventory.update({
						...current,
						title: title.trim()
					});
					this.patch({
						...current === void 0 ? {} : { info: {
							...current,
							title: title.trim()
						} },
						title: title.trim()
					});
				} catch (error) {
					this.fail(error);
				}
			}
			/**
			* Explicitly terminate this view's process independently of its DOM lifetime.
			* @returns after Host process cleanup succeeds; failures remain retryable by the owner.
			*/
			close() {
				if (this.closing !== void 0) return this.closing;
				this.patch({
					phase: "closing",
					writable: false,
					error: void 0,
					issue: void 0
				});
				this.detach();
				this.closing = (async () => {
					await this.creation;
					valueOf(await this.remote.close(this.sessionId, this.id));
					this.inventory.remove(this.id);
					this.detach();
					this.patch({
						phase: "closed",
						writable: false
					});
				})().catch((error) => {
					this.closing = void 0;
					this.fail(error);
					throw error;
				});
				return this.closing;
			}
			/**
			* Stop Client work on plugin unload without closing Host terminals.
			* @returns after active and previously detached stream iterators have closed.
			*/
			async dispose() {
				this.mounted = false;
				this.lifetime.abort();
				this.detach();
				await Promise.all(this.detaching);
			}
			detach() {
				const previous = this.stream;
				this.stream = void 0;
				this.attachment = void 0;
				this.pendingRender?.resolve();
				this.pendingRender = void 0;
				if (previous !== void 0) {
					const cleanup = previous.dispose().finally(() => {
						this.detaching.delete(cleanup);
					});
					this.detaching.add(cleanup);
				}
			}
			async consume(stream) {
				let generation = 0;
				let sequence = 0;
				try {
					for await (const item of stream) {
						if (this.stream !== stream) return;
						const frame = item.value;
						if (generation !== item.generation) {
							if (frame.type !== "snapshot") throw new TerminalViewError("invalidOutput", "Terminal output generation is missing its screen snapshot");
							generation = item.generation;
							sequence = frame.sequence;
							item.accept();
						} else if (frame.type === "output") {
							if (frame.sequence !== sequence + 1) throw new TerminalViewError("invalidOutput", "Terminal output sequence has a gap");
							sequence = frame.sequence;
						} else if (frame.type === "snapshot") throw new TerminalViewError("invalidOutput", "Unexpected terminal screen snapshot");
						if (frame.type === "ack") {
							const attachment = this.attachment;
							/* v8 ignore next -- the physical opener retains its handle until this consumer advances. */
							if (attachment === void 0) throw new TerminalViewError("invalidOutput", "Terminal acknowledgement has no attachment");
							const pending = attachment.pending.get(frame.sequence);
							if (frame.sequence !== attachment.acknowledged + 1 || pending === void 0) throw new TerminalViewError("invalidOutput", "Terminal input acknowledgement is out of order");
							attachment.acknowledged = frame.sequence;
							attachment.bytes -= pending.inputBytes;
							attachment.bufferedBytes -= pending.frameBytes;
							attachment.inFlightBytes -= pending.frameBytes;
							attachment.pending.delete(frame.sequence);
							if (frame.refusal !== void 0) this.patch({ writable: false });
							this.flushInput(attachment);
							continue;
						}
						if (frame.type !== "output") {
							this.inventory.update(frame.info);
							this.patch({
								info: frame.info,
								title: frame.info.title,
								phase: "connected",
								writable: frame.info.state === "running" && frame.writable
							});
						}
						if (frame.type !== "state") {
							const revision = ++this.revision;
							await new Promise((resolve) => {
								this.pendingRender = {
									revision,
									resolve
								};
								const aborted = () => {
									this.acknowledge(revision);
								};
								item.signal.addEventListener("abort", aborted, { once: true });
								this.pendingRender.resolve = () => {
									item.signal.removeEventListener("abort", aborted);
									resolve();
								};
								this.patch({ render: {
									revision,
									frame
								} });
								if (item.signal.aborted) aborted();
							});
						}
					}
				} catch (error) {
					if (this.stream === stream) if (this.state.getSnapshot().info?.state === "exited") this.patch({
						phase: "closed",
						writable: false
					});
					else this.fail(error);
				}
			}
			patch(patch) {
				if (this.lifetime.signal.aborted) return;
				this.state.set({
					...this.state.getSnapshot(),
					...patch
				});
			}
			fail(error) {
				const failure = remoteErrorOf(error);
				const issue = failure?.code === "terminal/view" ? failure.details.issue : failure?.code === "terminal/limit-reached" ? "terminalLimit" : failure?.code === "terminal/unavailable" ? "missingTerminal" : void 0;
				if (!this.stopped() && issue === "missingTerminal") this.inventory.remove(this.id);
				this.patch({
					phase: error instanceof _deepseek_ai_dsh_api_gateway_client.RemoteStreamCarrierError ? "disconnected" : "failed",
					writable: false,
					issue,
					error: error instanceof Error ? error.message : String(error)
				});
			}
		};
		function valueOf(result) {
			if (!result.ok) throw result.error;
			return result.value;
		}
		//#endregion
		//#region ../../util/crypto/lib/index.js
		/**
		* Random v4 UUID, minted from `crypto.getRandomValues`.
		* @returns the UUID string.
		*/
		function randomUUID() {
			const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
			const hex = Array.from(bytes, (byte, index) => {
				return (index === 6 ? byte & 15 | 64 : index === 8 ? byte & 63 | 128 : byte).toString(16).padStart(2, "0");
			}).join("");
			return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
		}
		//#endregion
		//#region lib/types/client/close-requests.js
		const PREFIX$1 = "dsh.terminal.close.v1.";
		/** Each request has its own storage key, so other browser windows cannot overwrite its cleanup. */
		var TerminalCloseRequests = class {
			requests = /* @__PURE__ */ new Map();
			constructor() {
				try {
					if (typeof localStorage === "undefined") return;
					for (let index = 0; index < localStorage.length; index++) {
						const key = localStorage.key(index);
						if (key?.startsWith(PREFIX$1)) this.load(key);
					}
				} catch (error) {
					console.error("Terminal cleanup recovery failed:", error);
				}
			}
			/**
			* Read cleanup work still awaiting Host confirmation.
			* @returns unfinished requests owned by this browser instance.
			*/
			pending() {
				return [...this.requests.values()];
			}
			/**
			* Retain cleanup across reload before removing a tab.
			* @param request - close intent to save before removing its tab.
			*/
			save(request) {
				this.requests.set(request.id, request);
				try {
					if (typeof localStorage !== "undefined") localStorage.setItem(PREFIX$1 + request.id, JSON.stringify(request));
				} catch (error) {
					console.error("Terminal cleanup persistence failed:", error);
				}
			}
			/**
			* Forget confirmed cleanup in memory and browser storage.
			* @param id - terminal whose Host cleanup succeeded.
			*/
			remove(id) {
				this.requests.delete(id);
				try {
					if (typeof localStorage !== "undefined") localStorage.removeItem(PREFIX$1 + id);
				} catch (error) {
					console.error("Terminal cleanup persistence failed:", error);
				}
			}
			load(key) {
				try {
					const raw = localStorage.getItem(key);
					if (raw === null) return;
					const parsed = JSON.parse(raw);
					if (!isRequest(parsed) || key !== PREFIX$1 + parsed.id) throw new Error("Invalid terminal cleanup request");
					this.requests.set(parsed.id, parsed);
				} catch (error) {
					console.error("Terminal cleanup recovery failed:", error);
				}
			}
		};
		function isRequest(value) {
			if (typeof value !== "object" || value === null) return false;
			const request = value;
			return typeof request.sessionId === "string" && request.sessionId.length > 0 && typeof request.id === "string" && /^[\w-]{1,128}$/u.test(request.id) && typeof request.title === "string";
		}
		//#endregion
		//#region lib/types/client/retention.js
		/** A stream acknowledgement gates output attachment for each physical connection. */
		var TerminalWindowHold = class {
			stream;
			waiters = /* @__PURE__ */ new Set();
			generation;
			failure;
			/**
			* @param gateway - reconnecting stream owner.
			* @param remote - typed terminal namespace.
			* @param sessionId - saved layout's Session, without Agent activation.
			* @param id - existing Host terminal.
			*/
			constructor(gateway, remote, sessionId, id) {
				this.stream = gateway.$stream({
					name: "Browser terminal window hold",
					open: (signal) => remote.retain(sessionId, id, signal),
					ended: () => new RemoteError("terminal/unavailable", "Terminal hold ended", {})
				});
				this.consume();
			}
			/** Whether a terminal-domain failure ended this hold, allowing an explicit retry. */
			get failed() {
				return this.failure !== void 0;
			}
			/**
			* Wait for an acknowledged current physical hold before following its screen.
			* @param signal - output request or view lifetime.
			* @returns after acknowledgement, or rejects on cancellation/unavailability.
			*/
			async ready(signal) {
				signal.throwIfAborted();
				if (this.failure !== void 0) throw this.failure;
				if (this.generation !== void 0 && !this.generation.aborted) return;
				const waiting = Promise.withResolvers();
				const abort = () => {
					waiting.reject(signal.reason);
				};
				this.waiters.add(waiting);
				signal.addEventListener("abort", abort, { once: true });
				try {
					await waiting.promise;
				} finally {
					this.waiters.delete(waiting);
					signal.removeEventListener("abort", abort);
				}
			}
			/**
			* Release this window's stream and all acknowledgement waiters.
			* @returns after the stream consumer closes.
			*/
			dispose() {
				this.reject(/* @__PURE__ */ new Error("Terminal window hold released"));
				return this.stream.dispose();
			}
			async consume() {
				try {
					for await (const item of this.stream) {
						item.accept();
						this.generation = item.signal;
						for (const waiter of this.waiters) waiter.resolve();
						this.waiters.clear();
					}
				} catch (error) {
					this.reject(error);
				}
			}
			reject(error) {
				this.failure = error instanceof Error ? error : new Error("Terminal window hold failed", { cause: error });
				this.generation = void 0;
				for (const waiter of this.waiters) waiter.reject(error);
				this.waiters.clear();
			}
		};
		//#endregion
		//#region lib/types/client/bindings.js
		const PREFIX = "dsh.terminal.binding.v1.";
		/** Saved recovery targets keyed by Session and globally unique terminal content identity. */
		var TerminalBindings = class {
			memory = /* @__PURE__ */ new Map();
			/**
			* Read a saved target, retaining this window's value when storage is unavailable.
			* @param sessionId - owning Session.
			* @param contentId - terminal content identity, shared only by deliberate copies.
			* @returns the existing Host identity, if one has been saved.
			*/
			get(sessionId, contentId) {
				const key = this.key(sessionId, contentId);
				const known = this.memory.get(key);
				if (known !== void 0) return known;
				if (typeof localStorage === "undefined") return void 0;
				try {
					const raw = localStorage.getItem(key);
					if (raw === null) return void 0;
					const value = JSON.parse(raw);
					if (typeof value !== "string" || !/^[\w-]{1,128}$/u.test(value)) return void 0;
					this.memory.set(key, value);
					return value;
				} catch (_storageUnavailable) {
					return;
				}
			}
			/**
			* Save an identity before its Host allocation begins.
			* @param sessionId - owning Session.
			* @param contentId - globally unique terminal content identity.
			* @param id - existing or newly allocated Host identity.
			*/
			set(sessionId, contentId, id) {
				const key = this.key(sessionId, contentId);
				this.memory.set(key, id);
				if (typeof localStorage === "undefined") return;
				try {
					localStorage.setItem(key, JSON.stringify(id));
				} catch (error) {
					console.error("Terminal binding persistence failed:", error);
				}
			}
			/**
			* Remove this content's target after its close intent has been saved.
			* @param sessionId - owning Session.
			* @param contentId - closing terminal content identity.
			*/
			delete(sessionId, contentId) {
				const key = this.key(sessionId, contentId);
				this.memory.delete(key);
				if (typeof localStorage === "undefined") return;
				try {
					localStorage.removeItem(key);
				} catch (error) {
					console.error("Terminal binding cleanup failed:", error);
				}
			}
			/** Release cached values when the Client service is disposed. */
			clear() {
				this.memory.clear();
			}
			key(sessionId, contentId) {
				return PREFIX + JSON.stringify([sessionId, contentId]);
			}
		};
		//#endregion
		//#region lib/types/client/inventory.js
		/** One Session's cached list, retained failures and in-flight mutation reconciliation. */
		var TerminalInventory = class {
			load;
			state = { kind: "unloaded" };
			items = /* @__PURE__ */ new Map();
			pending = /* @__PURE__ */ new Set();
			/** @param load - fetch the Session's retained Host terminals. */
			constructor(load) {
				this.load = load;
			}
			/**
			* Read the cached list or join its single in-flight request.
			* @param refresh - explicitly replace a settled result or failure; overlapping refreshes share one request.
			* @returns current terminal metadata; failures remain cached until refresh or reset.
			*/
			read(refresh = false) {
				if (this.state.kind === "disposed") return Promise.reject(/* @__PURE__ */ new Error("Terminal inventory disposed"));
				if (this.state.kind === "loading") return this.state.promise;
				if (!refresh && this.state.kind === "ready") return Promise.resolve(this.items);
				if (!refresh && this.state.kind === "failed") return Promise.reject(this.state.error);
				const completed = Promise.withResolvers();
				const request = {
					kind: "loading",
					promise: completed.promise,
					updates: /* @__PURE__ */ new Map()
				};
				this.state = request;
				this.pending.add(completed.promise);
				this.loadRequest(request).then(completed.resolve, completed.reject);
				completed.promise.then(() => {
					this.pending.delete(completed.promise);
				}, () => {
					this.pending.delete(completed.promise);
				});
				return completed.promise;
			}
			async loadRequest(request) {
				try {
					const result = await this.load();
					if (this.state !== request) return await this.read();
					if (!result.ok) throw result.error;
					const items = new Map(result.value.map((info) => [info.id, info]));
					for (const [id, info] of request.updates) if (info === void 0) items.delete(id);
					else items.set(id, info);
					this.items = items;
					this.state = { kind: "ready" };
					return items;
				} catch (error) {
					if (this.state !== request) return this.read();
					const failure = error instanceof Error ? error : new Error("Terminal discovery failed", { cause: error });
					this.state = {
						kind: "failed",
						error: failure
					};
					throw failure;
				}
			}
			/**
			* Preserve acknowledged mutations and attachment metadata across a pending list response.
			* @param info - latest confirmed terminal metadata.
			*/
			update(info) {
				if (this.state.kind === "disposed") return;
				this.items.set(info.id, info);
				if (this.state.kind === "loading") this.state.updates.set(info.id, info);
			}
			/**
			* Remove a terminal after confirmed closure or unavailability.
			* @param id - terminal identity.
			*/
			remove(id) {
				if (this.state.kind === "disposed") return;
				this.items.delete(id);
				if (this.state.kind === "loading") this.state.updates.set(id, void 0);
			}
			/**
			* Replace discovery after a connection change; never discover a Session that has not needed a list.
			* @returns the replacement lookup, or undefined for an unused or disposed inventory.
			*/
			reset() {
				if (this.state.kind === "unloaded" || this.state.kind === "disposed") return void 0;
				this.state = { kind: "unloaded" };
				return this.read();
			}
			/**
			* Discard metadata and prevent late responses from publishing.
			* @returns after all owned list requests settle.
			*/
			async dispose() {
				this.state = { kind: "disposed" };
				this.items.clear();
				await Promise.allSettled(this.pending);
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Client terminal model service; views are keyed independently from Host terminal identities. */
		/** Session and occurrence lookup, independent tab and terminal identities and background cleanup. */
		var ClientTerminals = class extends _deepseek_ai_cordis.Service {
			remote;
			/** Failed cleanup tasks; successful and in-progress closes have no visible notification. */
			closeFailures = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)([]);
			requests = new TerminalCloseRequests();
			closing = /* @__PURE__ */ new Map();
			closed = new Set(this.requests.pending().map((request) => request.id));
			disposed = false;
			views = /* @__PURE__ */ new Map();
			inventories = /* @__PURE__ */ new Map();
			bindings = new TerminalBindings();
			holds = /* @__PURE__ */ new Map();
			releasing = /* @__PURE__ */ new Set();
			openTabs = [];
			/**
			* @param ctx - Client root Context with Gateway and terminal Remote namespace.
			* @param remote - generated terminal namespace.
			*/
			constructor(ctx, remote) {
				super(ctx, "webTerminals");
				this.remote = remote;
				let connected = ctx.get("connection").generation.getSnapshot() !== void 0;
				ctx.on("connection/reset", () => {
					if (!connected) {
						connected = true;
						return;
					}
					for (const [sessionId, inventory] of this.inventories) inventory.reset()?.catch((error) => {
						if (!this.disposed) this.ctx.logger.warn("Terminal list refresh failed; retry terminal recovery", {
							sessionId,
							error
						});
					});
				});
				ctx.effect(() => async () => {
					this.disposed = true;
					const listing = [...this.inventories.values()].map((inventory) => inventory.dispose());
					this.inventories.clear();
					const detaching = [...this.views.values()].flatMap((views) => [...views.values()].map((view) => view.dispose()));
					this.views.clear();
					this.bindings.clear();
					const holds = [...this.holds.values()].flatMap((holds) => [...holds.values()].map((hold) => hold.dispose()));
					this.holds.clear();
					await Promise.all([
						...listing,
						...detaching,
						...holds,
						...this.releasing,
						...this.closing.values()
					]);
				}, "terminal-controller.client.views");
				for (const request of this.requests.pending()) this.cleanup(request);
			}
			/**
			* Return the stable model for one sidebar occurrence.
			* @param sessionId - owning Session.
			* @param key - sidebar occurrence key.
			* @param contentId - globally unique content identity; layout-local tab ids are not persistence keys.
			* @param terminalId - existing Host identity when restoring a listed terminal; otherwise reuse the saved content identity.
			* @param shellPath - explicit shell for a new terminal; restored terminals retain their own shell.
			* @returns its observable state and terminal commands.
			*/
			view(sessionId, key, contentId, terminalId, shellPath) {
				let views = this.views.get(sessionId);
				if (views === void 0) {
					views = /* @__PURE__ */ new Map();
					this.views.set(sessionId, views);
				}
				let view = views.get(key);
				if (view === void 0) {
					const saved = terminalId ?? this.bindings.get(sessionId, contentId);
					const id = saved ?? randomUUID();
					this.bindings.set(sessionId, contentId, id);
					view = new TerminalView(sessionId, this.remote, this.ctx.remote, this.inventory(sessionId), id, saved === void 0, shellPath, (signal) => this.hold(sessionId, id).ready(signal));
					views.set(key, view);
					this.reconcileHolds();
					view.refresh();
				}
				return view;
			}
			inventory(sessionId) {
				let inventory = this.inventories.get(sessionId);
				if (inventory === void 0) {
					inventory = new TerminalInventory(() => this.remote.list(sessionId));
					this.inventories.set(sessionId, inventory);
				}
				return inventory;
			}
			/**
			* Discover available launch choices on demand without allocating a PTY.
			* @param sessionId - target Session.
			* @param signal - the menu request lifetime.
			* @returns installed shells and the currently usable browser preference.
			*/
			async launchShells(sessionId, signal) {
				const result = await this.remote.shells(sessionId, signal);
				if (!result.ok) throw new Error(result.error.message);
				const previous = preferredShell();
				return {
					shells: result.value,
					selectedShell: result.value.find((shell) => shell.path === previous)?.path ?? result.value[0]?.path
				};
			}
			/**
			* Remember the guide selection before allocating its terminal tab.
			* @param path - shell selected from Host discovery.
			*/
			selectShell(path) {
				rememberShell(path);
			}
			/**
			* Save a close intent and release the tab immediately; cleanup outlives DOM unmount and reload.
			* @param sessionId - owning Session.
			* @param key - sidebar occurrence key, including an inactive restored tab.
			* @param contentId - globally unique content identity whose binding is removed.
			* @param terminalId - restored identity if the tab has no model yet.
			*/
			close(sessionId, key, contentId, terminalId) {
				const views = this.views.get(sessionId);
				const view = views?.get(key);
				const id = view?.id ?? terminalId ?? this.bindings.get(sessionId, contentId);
				if (id === void 0) return;
				const request = {
					sessionId,
					id,
					title: view?.state.getSnapshot().title ?? key
				};
				this.closed.add(id);
				this.requests.save(request);
				this.bindings.delete(sessionId, contentId);
				views?.delete(key);
				if (views?.size === 0) this.views.delete(sessionId);
				this.cleanup(request, view);
				this.reconcileHolds();
			}
			/**
			* Reconcile this window's open terminal occurrences, including dormant saved Sessions.
			* @param tabs - terminal-kind membership supplied by the sidebar layout owner.
			*/
			retainTabs(tabs) {
				this.openTabs = tabs;
				this.reconcileHolds();
			}
			hold(sessionId, id) {
				let holds = this.holds.get(sessionId);
				if (holds === void 0) {
					holds = /* @__PURE__ */ new Map();
					this.holds.set(sessionId, holds);
				}
				let hold = holds.get(id);
				if (hold === void 0 || hold.failed) {
					if (hold !== void 0) this.release(hold);
					hold = new TerminalWindowHold(this.ctx.remote, this.remote, sessionId, id);
					holds.set(id, hold);
				}
				return hold;
			}
			reconcileHolds() {
				if (this.disposed) return;
				const wanted = /* @__PURE__ */ new Map();
				for (const tab of this.openTabs) {
					const id = this.bindings.get(tab.sessionId, tab.contentId);
					if (id === void 0 || this.closed.has(id)) continue;
					let ids = wanted.get(tab.sessionId);
					if (ids === void 0) {
						ids = /* @__PURE__ */ new Set();
						wanted.set(tab.sessionId, ids);
					}
					ids.add(id);
					const view = this.views.get(tab.sessionId)?.get(tab.tabId);
					if (view === void 0 || view.state.getSnapshot().info !== void 0) {
						if (!this.holds.get(tab.sessionId)?.has(id)) this.hold(tab.sessionId, id);
					}
				}
				for (const [sessionId, holds] of this.holds) {
					for (const [id, hold] of holds) if (!wanted.get(sessionId)?.has(id)) {
						holds.delete(id);
						this.release(hold);
					}
					if (holds.size === 0) this.holds.delete(sessionId);
				}
			}
			release(hold) {
				const releasing = hold.dispose().finally(() => {
					this.releasing.delete(releasing);
				});
				this.releasing.add(releasing);
				releasing.catch((error) => {
					this.ctx.logger.warn("Terminal hold release failed", error);
				});
			}
			/**
			* Read shared Session discovery without a live view or unfinished close.
			* @param sessionId - Session being displayed.
			* @param refresh - explicitly replace settled discovery, including a previous failure.
			* @returns terminals available for opening as recovered tabs.
			*/
			async recover(sessionId, refresh = false) {
				const available = await this.inventory(sessionId).read(refresh);
				const held = new Set([...this.views.get(sessionId)?.values() ?? []].map((view) => view.id));
				const closing = new Set(this.requests.pending().map((request) => request.id));
				return [...available.values()].filter((info) => !held.has(info.id) && !closing.has(info.id) && !this.closed.has(info.id));
			}
			/**
			* Retry a saved close request without reopening its tab.
			* @param id - failed terminal identity.
			*/
			retryClose(id) {
				const record = this.requests.pending().find((item) => item.id === id);
				if (record !== void 0) this.cleanup(record);
			}
			cleanup(record, view) {
				if (this.closing.has(record.id) || this.disposed) return;
				this.closeFailures.set(this.closeFailures.getSnapshot().filter((failure) => failure.id !== record.id));
				const pending = (async () => {
					if (view !== void 0) await view.close();
					else {
						const result = await this.remote.close(record.sessionId, record.id);
						if (!result.ok) throw result.error;
					}
					this.inventories.get(record.sessionId)?.remove(record.id);
					this.requests.remove(record.id);
				})().catch((error) => {
					if (remoteErrorOf(error)?.code === "session/not-found") {
						this.requests.remove(record.id);
						return;
					}
					if (!this.disposed) this.closeFailures.set([...this.closeFailures.getSnapshot(), {
						id: record.id,
						title: record.title,
						message: error instanceof Error ? error.message : String(error)
					}]);
				}).then(async () => {
					await view?.dispose();
					this.closing.delete(record.id);
				});
				this.closing.set(record.id, pending);
			}
		};
		/** Required Client transport and terminal namespace. */
		const inject = [
			"remote",
			"remote.terminal",
			"connection"
		];
		/**
		* Install the Client terminal models.
		* @param ctx - Client root Context.
		*/
		function apply(ctx) {
			new ClientTerminals(ctx, ctx.remote.terminal);
		}
		//#endregion
		exports.ClientTerminals = ClientTerminals;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map