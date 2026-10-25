window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-api-gateway",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
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
		/** Generic invocation-owned values returned by synchronous Client Context resolvers. */
		/** Shared identity across independently bundled Context providers and Gateway. */
		const TYPERT_OWNED_VALUE = Symbol.for("dsh.typert.owned-value");
		/**
		* Identify invocation-owned values using the shared marker.
		* @param value - borrowed or owned resolver result.
		* @returns whether the result carries invocation cleanup.
		*/
		function isTypertOwnedValue(value) {
			return typeof value === "object" && value !== null && TYPERT_OWNED_VALUE in value && value[TYPERT_OWNED_VALUE] === true;
		}
		/**
		* Lossless JSON checks every Remote carrier shares: the Client handle before it
		* queues an uplink item, the Gateway at its wire and codec-less uplink
		* boundaries, and the in-process mock.
		*/
		/**
		* Test whether a value crosses JSON transport without coercion or omission.
		* @param value - candidate boundary value.
		* @returns whether the value is losslessly JSON-compatible.
		*/
		function isRemoteJsonValue(value) {
			return visitJsonValue(value, /* @__PURE__ */ new Set());
		}
		/**
		* Test whether a value may travel as one uplink item: a lossless JSON value, or
		* a top-level `undefined`, which the wire carries as an `item` frame without
		* `value`. Nested `undefined`, `NaN`, and infinities stay rejected.
		* @param value - candidate uplink item.
		* @returns whether the item crosses every carrier unchanged.
		*/
		function isRemoteUplinkItem(value) {
			return value === void 0 || isRemoteJsonValue(value);
		}
		function visitJsonValue(value, ancestors) {
			if (value === null || typeof value === "string" || typeof value === "boolean") return true;
			if (typeof value === "number") return Number.isFinite(value) && !Object.is(value, -0);
			if (typeof value !== "object") return false;
			if (ancestors.has(value)) return false;
			ancestors.add(value);
			try {
				if (Array.isArray(value)) {
					if (Object.getPrototypeOf(value) !== Array.prototype || Reflect.ownKeys(value).length !== value.length + 1) return false;
					for (let index = 0; index < value.length; index++) if (!Object.hasOwn(value, index) || !visitJsonValue(value[index], ancestors)) return false;
					return true;
				}
				const prototype = Object.getPrototypeOf(value);
				if (prototype !== Object.prototype && prototype !== null) return false;
				for (const key of Reflect.ownKeys(value)) {
					if (typeof key !== "string") return false;
					if (Object.getOwnPropertyDescriptor(value, key)?.enumerable !== true || !visitJsonValue(Reflect.get(value, key), ancestors)) return false;
				}
				return true;
			} finally {
				ancestors.delete(value);
			}
		}
		//#endregion
		//#region lib/types/stream-protocol.js
		/** Wire messages for Gateway-owned Remote streams and event-result RPCs. */
		/** Exact WebSocket route carrying every Typert Remote stream. */
		const REMOTE_STREAM_MUX_PATH = "/api/remote.mux";
		/** Gateway-internal logical stream carrying application-selected Cordis events. */
		const REMOTE_EVENT_STREAM_ENDPOINT = "$events";
		/** Gateway-internal unary endpoint returning one Client Remote Event outcome. */
		const REMOTE_EVENT_RESULT_ENDPOINT = "$events/result";
		/** Empty standard Remote payload used to open the forwarded-event stream. */
		const REMOTE_EVENT_STREAM_PAYLOAD = { args: {} };
		/**
		* Project an arbitrary rejection to stable, JSON-safe error fields.
		* @param reason - value thrown or rejected by a Client listener.
		* @returns wire-safe rejection fields.
		*/
		function projectRemoteEventRejection(reason) {
			const record = typeof reason === "object" && reason !== null ? reason : void 0;
			const name = stringProperty(record, "name") ?? "Error";
			const message = stringProperty(record, "message") ?? String(reason);
			const code = stringProperty(record, "code");
			const details = record === void 0 ? void 0 : Reflect.get(record, "details");
			return {
				name,
				message,
				...code === void 0 ? {} : { code },
				...details === void 0 || !isRemoteJsonValue(details) ? {} : { details }
			};
		}
		/**
		* Recognize a non-empty Remote Event correlation id at a wire boundary.
		* @param value - untrusted wire value.
		* @returns whether the value is a valid Remote Event id.
		*/
		function isRemoteEventId(value) {
			return typeof value === "string" && value.length > 0;
		}
		/**
		* Recognize a non-empty Remote Event Client id at a wire boundary.
		* @param value - untrusted wire value.
		* @returns whether the value identifies one event-stream generation.
		*/
		function isRemoteEventClientId(value) {
			return typeof value === "string" && value.length > 0;
		}
		/**
		* Recognize the direct Agent identity used by a scoped Remote Event.
		* @param value - untrusted wire value.
		* @returns whether the value is a non-empty Agent identity.
		*/
		function isRemoteEventAgentId(value) {
			return typeof value === "string" && value.length > 0;
		}
		/**
		* Parse and validate one Host-to-browser text message.
		* @param text - complete WebSocket text message.
		* @returns the validated logical-stream frame.
		*/
		function parseRemoteStreamServerMessage(text) {
			return parseMessage(text, (value) => {
				if (value.type === "item" && (exactKeys(value, ["type", "streamId"]) || exactKeys(value, [
					"type",
					"streamId",
					"value"
				])) && validId(value.streamId)) return value;
				if (value.type === "end" && exactKeys(value, ["type", "streamId"]) && validId(value.streamId)) return value;
				if (value.type === "error" && exactKeys(value, [
					"type",
					"streamId",
					"error"
				]) && validId(value.streamId) && isRecord(value.error) && exactKeys(value.error, [
					"code",
					"message",
					"details"
				]) && typeof value.error.code === "string" && typeof value.error.message === "string" && isRecord(value.error.details)) return value;
				throw new Error("api gateway: invalid Remote stream server message");
			});
		}
		function parseMessage(text, validate) {
			let decoded;
			try {
				decoded = JSON.parse(text);
			} catch (cause) {
				throw new Error("api gateway: Remote stream message is not JSON", { cause });
			}
			if (!isRecord(decoded)) throw new Error("api gateway: Remote stream message must be an object");
			return validate(decoded);
		}
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		function exactKeys(value, expected) {
			return Reflect.ownKeys(value).length === expected.length && expected.every((key) => Object.hasOwn(value, key));
		}
		function validId(value) {
			return typeof value === "string" && value.length > 0;
		}
		function stringProperty(value, key) {
			if (value === void 0) return void 0;
			const candidate = Reflect.get(value, key);
			return typeof candidate === "string" ? candidate : void 0;
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
		//#region lib/types/client/stream-client.js
		/** Client owner for the Gateway multiplexed Remote stream socket. */
		/** Physical Remote stream socket failure that may be retried by a domain transport. */
		var RemoteStreamCarrierError = class extends Error {
			/**
			* @param message - physical carrier failure description.
			* @param options - optional causal error.
			*/
			constructor(message, options) {
				super(message, options);
				this.name = "RemoteStreamCarrierError";
			}
		};
		const UPLINK_DONE = {
			value: void 0,
			done: true
		};
		/**
		* Keep one physical WebSocket and share it among independently cancellable
		* Remote streams. A carrier that supplies an in-process stream opener never
		* starts one.
		*/
		var RemoteStreamMuxClient = class {
			openSocket;
			waitForReconnect;
			socket;
			cancelCandidate;
			keepAlive;
			revision = 0;
			streams = /* @__PURE__ */ new Map();
			waiters = /* @__PURE__ */ new Set();
			socketClosures = /* @__PURE__ */ new Set();
			running = false;
			disposed = false;
			failure;
			/**
			* @param openSocket - selected authenticated carrier; omission uses the browser socket.
			* @param waitForReconnect - answering Clients wait for Connection to replace a lost socket; passive Clients fail later opens immediately.
			*/
			constructor(openSocket = () => new WebSocket(remoteStreamUrl()), waitForReconnect = false) {
				this.openSocket = openSocket;
				this.waitForReconnect = waitForReconnect;
			}
			/** Ensure a physical attempt exists, following the current attempt once if needed. */
			start() {
				if (this.disposed) return;
				this.running = true;
				if (this.socket?.readyState === 1) return;
				const pending = this.keepAlive;
				if (pending === void 0) this.maintain();
				else pending.then(() => {
					this.maintain();
				});
			}
			/** Cancel the current socket or retry wait and start a fresh attempt immediately. */
			reconnect() {
				if (!this.running || this.disposed) return;
				const failure = new RemoteStreamCarrierError("api gateway: Remote stream reconnect requested");
				const pending = this.keepAlive;
				this.revision++;
				this.failure = void 0;
				this.cancelCandidate?.(failure);
				const socket = this.socket;
				if (socket !== void 0) {
					this.socket = void 0;
					this.failAll(failure);
					socket.close(4e3, "reconnect requested");
				}
				if (pending === void 0) this.maintain();
				else pending.then(() => {
					this.maintain();
				});
			}
			/**
			* Open one logical stream on the persistent physical connection.
			* After an established socket is lost, answering Clients wait for Connection
			* to reconnect or for their signal to abort; passive Clients reject immediately.
			* An initial socket failure rejects both modes.
			* @param endpoint - Typert Remote stream endpoint.
			* @param payload - endpoint request encoded on the wire.
			* @param signal - cancellation for this logical stream.
			* @param uplink - the Client's items: each is sent as an `item` frame, its end as `end`; its `return()`
			* runs when the stream finishes, and its failure cancels the stream and fails the downlink.
			* @returns Host items until completion, cancellation, or failure.
			*/
			async *open(endpoint, payload, signal, uplink) {
				signal.throwIfAborted();
				const streamId = randomUUID();
				const inbox = new StreamInbox();
				const stream = {
					inbox,
					pump: void 0
				};
				let carrier;
				let opened = false;
				let terminal = false;
				const abort = () => {
					inbox.fail(signal.reason);
				};
				signal.addEventListener("abort", abort, { once: true });
				try {
					const socket = await this.waitForSocket(signal);
					signal.throwIfAborted();
					carrier = socket;
					this.streams.set(streamId, stream);
					this.send(socket, {
						type: "open",
						streamId,
						endpoint,
						payload
					});
					opened = true;
					if (uplink !== void 0) stream.pump = this.pumpUplink(socket, streamId, uplink, signal, inbox);
					while (true) {
						const frame = await inbox.next();
						signal.throwIfAborted();
						if (frame.type === "item") {
							yield frame.value;
							continue;
						}
						terminal = true;
						if (frame.type === "error") throw new RemoteError(frame.error.code, frame.error.message, frame.error.details);
						return;
					}
				} finally {
					signal.removeEventListener("abort", abort);
					this.streams.delete(streamId);
					stream.pump?.stop();
					if (opened && !terminal && carrier?.readyState === 1) this.send(carrier, {
						type: "cancel",
						streamId
					});
					if (stream.pump !== void 0) await stream.pump.done;
				}
			}
			/**
			* Send the caller's uplink items on this generation's socket. `stop()`
			* interrupts a pump blocked on `uplink.next()` and releases the iterator: a
			* handle's queue closes at once, so `send()` throws from then on, and any
			* other iterator's `return()` is invoked without being awaited because a
			* generator blocked in `next()` only completes it once it yields.
			*/
			pumpUplink(socket, streamId, uplink, signal, inbox) {
				let stopped;
				const interruption = {
					value: void 0,
					done: true
				};
				const uplinkIterator = uplink[Symbol.asyncIterator]();
				const state = {
					stopping: false,
					exhausted: false,
					released: false
				};
				const release = () => {
					if (state.released || state.exhausted) return;
					state.released = true;
					if (uplink instanceof ClientUplinkQueue) uplink.close();
					Promise.resolve().then(() => uplinkIterator.return?.()).catch(() => void 0);
				};
				return {
					done: (async () => {
						try {
							while (true) {
								if (state.stopping) return;
								stopped = Promise.withResolvers();
								const next = await Promise.race([uplinkIterator.next(), stopped.promise]);
								stopped = void 0;
								if (state.stopping || next === interruption || signal.aborted || this.socket !== socket) return;
								if (next.done === true) {
									state.exhausted = true;
									break;
								}
								this.send(socket, {
									type: "item",
									streamId,
									value: next.value
								});
							}
							this.send(socket, {
								type: "end",
								streamId
							});
						} catch (error) {
							inbox.fail(error);
						} finally {
							stopped = void 0;
							release();
						}
					})(),
					stop: () => {
						if (state.stopping) return;
						state.stopping = true;
						stopped?.resolve(interruption);
						release();
					}
				};
			}
			/**
			* Permanently stop the carrier, close the physical socket, and fail every
			* active logical stream.
			* @returns once the connection attempt and every physical socket have closed.
			*/
			async close() {
				if (!this.disposed) {
					this.disposed = true;
					this.running = false;
					const error = /* @__PURE__ */ new Error("api gateway: Remote stream client disposed");
					this.failAll(error);
					for (const waiter of [...this.waiters]) waiter.reject(error);
					this.cancelCandidate?.(error);
					const socket = this.socket;
					this.socket = void 0;
					socket?.close(1e3, "disposed");
				}
				await this.keepAlive;
				await Promise.all(this.socketClosures);
			}
			async connect() {
				const socket = this.openSocket(REMOTE_STREAM_MUX_PATH);
				const closed = new Promise((resolve) => {
					socket.addEventListener("close", () => {
						resolve();
					}, { once: true });
				});
				this.socketClosures.add(closed);
				closed.then(() => {
					this.socketClosures.delete(closed);
				});
				return new Promise((resolve, reject) => {
					let settled = false;
					const rejectCandidate = (error) => {
						settled = true;
						socket.removeEventListener("open", opened);
						socket.removeEventListener("message", received);
						this.cancelCandidate = void 0;
						if (socket.readyState < 2) socket.close();
						reject(error);
					};
					const opened = () => {
						settled = true;
						this.cancelCandidate = void 0;
						this.socket = socket;
						for (const waiter of [...this.waiters]) waiter.resolve(socket);
						resolve(socket);
					};
					const failed = () => {
						if (!settled) {
							rejectCandidate(new RemoteStreamCarrierError("api gateway: Remote stream WebSocket failed to open"));
							return;
						}
						const error = new RemoteStreamCarrierError("api gateway: Remote stream WebSocket failed");
						this.lost(socket, error);
						if (socket.readyState < 2) socket.close();
					};
					const closed = () => {
						socket.removeEventListener("open", opened);
						socket.removeEventListener("error", failed);
						socket.removeEventListener("message", received);
						if (!settled) {
							rejectCandidate(new RemoteStreamCarrierError("api gateway: Remote stream WebSocket closed before opening"));
							return;
						}
						this.lost(socket);
					};
					const received = (event) => {
						this.receive(socket, event.data);
					};
					this.cancelCandidate = rejectCandidate;
					socket.addEventListener("open", opened, { once: true });
					socket.addEventListener("error", failed);
					socket.addEventListener("message", received);
					socket.addEventListener("close", closed, { once: true });
				});
			}
			waitForSocket(signal) {
				signal.throwIfAborted();
				if (this.socket?.readyState === 1) return Promise.resolve(this.socket);
				if (this.disposed) return Promise.reject(/* @__PURE__ */ new Error("api gateway: Remote stream client disposed"));
				if (!this.running) return Promise.reject(/* @__PURE__ */ new Error("api gateway: Remote stream client not started"));
				if (this.failure !== void 0) return Promise.reject(this.failure);
				return new Promise((resolve, reject) => {
					const aborted = () => {
						waiter.reject(signal.reason);
					};
					const cleanup = () => {
						this.waiters.delete(waiter);
						signal.removeEventListener("abort", aborted);
					};
					const waiter = {
						revision: this.revision,
						resolve: (socket) => {
							cleanup();
							resolve(socket);
						},
						reject: (error) => {
							cleanup();
							reject(error);
						}
					};
					this.waiters.add(waiter);
					signal.addEventListener("abort", aborted, { once: true });
				});
			}
			receive(socket, data) {
				if (socket !== this.socket) return;
				try {
					if (typeof data !== "string") throw new Error("api gateway: Remote stream WebSocket requires text messages");
					const frame = parseRemoteStreamServerMessage(data);
					const stream = this.streams.get(frame.streamId);
					if (stream === void 0) return;
					stream.inbox.push(frame);
					if (frame.type !== "item") stream.pump?.stop();
				} catch (error) {
					const failure = new RemoteStreamCarrierError("api gateway: invalid Remote stream frame", { cause: error });
					this.failAll(failure);
					this.lost(socket, failure);
					socket.close(4002, "invalid Remote stream frame");
				}
			}
			lost(socket, error = new RemoteStreamCarrierError("api gateway: Remote stream WebSocket closed")) {
				if (this.socket !== socket) return;
				this.socket = void 0;
				if (!this.waitForReconnect) this.failure = error;
				this.failAll(error);
				if (!this.waitForReconnect) for (const waiter of [...this.waiters]) waiter.reject(error);
			}
			maintain() {
				if (!this.running || this.disposed) return;
				if (this.socket?.readyState === 1 || this.keepAlive !== void 0) return;
				const revision = this.revision;
				this.failure = void 0;
				const task = this.connect().then(() => void 0, (error) => {
					if (!this.running) return;
					const failure = error instanceof RemoteStreamCarrierError ? error : new RemoteStreamCarrierError("api gateway: Remote stream WebSocket failed to open", { cause: error });
					if (this.revision === revision) this.failure = failure;
					for (const waiter of [...this.waiters]) if (waiter.revision <= revision) waiter.reject(failure);
				});
				this.keepAlive = task;
				task.then(() => {
					this.keepAlive = void 0;
				});
			}
			failAll(error) {
				for (const stream of this.streams.values()) {
					stream.inbox.fail(error);
					stream.pump?.stop();
				}
			}
			send(socket, message) {
				socket.send(JSON.stringify(message));
			}
		};
		var StreamInbox = class {
			frames = new Deque();
			wake;
			failure;
			push(frame) {
				if (this.failure !== void 0) return;
				this.frames.pushBack(frame);
				this.wake?.();
				this.wake = void 0;
			}
			fail(error) {
				if (this.failure !== void 0) return;
				this.failure = error instanceof Error ? error : new Error(String(error), { cause: error });
				this.frames.clear();
				this.wake?.();
				this.wake = void 0;
			}
			async next() {
				while (this.frames.size === 0) {
					if (this.failure !== void 0) throw this.failure;
					await new Promise((resolve) => {
						this.wake = resolve;
					});
				}
				return this.frames.popFront();
			}
		};
		/**
		* Uplink items a stream handle queues for its carrier: the mux pump or the
		* in-process Host decoder iterates it as the stream's uplink. `end()` is the
		* Client half-close; `close()` marks the stream terminated, after which
		* `push()` throws. One consumer reads it, one read at a time.
		*/
		var ClientUplinkQueue = class {
			endpoint;
			items = new Deque();
			ended = false;
			closed = false;
			wake;
			/** @param endpoint - canonical Remote endpoint named by failures. */
			constructor(endpoint) {
				this.endpoint = endpoint;
			}
			/**
			* Queue one item for the carrier.
			* @param item - item the Host validates against the method's uplink codec.
			* @throws {Error} after `end()` or once the stream has terminated.
			*/
			push(item) {
				if (this.closed) throw new Error(`client api: ${this.endpoint} stream has terminated`);
				if (this.ended) throw new Error(`client api: ${this.endpoint} uplink was ended`);
				this.items.pushBack(item);
				this.signal();
			}
			/** Half-close: the carrier reads the queued items, then `end`. Idempotent; ignored after termination. */
			end() {
				if (this.ended || this.closed) return;
				this.ended = true;
				this.signal();
			}
			/** The carrier stopped reading: the logical stream terminated or was disposed. Idempotent. */
			close() {
				if (this.closed) return;
				this.closed = true;
				this.items.clear();
				this.signal();
			}
			[Symbol.asyncIterator]() {
				return this;
			}
			/**
			* Take the next queued item, waiting for one; ends after `end()` or `close()`.
			* @returns the next item, or the end of the uplink.
			* @throws {Error} when a read is already pending.
			*/
			async next() {
				while (true) {
					if (this.closed) return UPLINK_DONE;
					if (this.items.size > 0) return {
						value: this.items.popFront(),
						done: false
					};
					if (this.ended) return UPLINK_DONE;
					if (this.wake !== void 0) throw new Error(`client api: ${this.endpoint} uplink has one pending read`);
					await new Promise((resolve) => {
						this.wake = resolve;
					});
				}
			}
			/**
			* The carrier is done with the uplink: close it.
			* @returns the end of the uplink.
			*/
			return() {
				this.close();
				return Promise.resolve(UPLINK_DONE);
			}
			signal() {
				const wake = this.wake;
				this.wake = void 0;
				wake?.();
			}
		};
		function remoteStreamUrl() {
			const globals = globalThis;
			const url = new URL(REMOTE_STREAM_MUX_PATH.slice(1), globals.__DSH_TRANSPORT__?.streamBaseUrl ?? document.baseURI);
			url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
			return url.href;
		}
		//#endregion
		//#region lib/types/client/remote-events.js
		/** Client owner for forwarded Remote Event subscriptions and deliveries. */
		/** Private end-of-chain marker that cannot collide with a JSON listener result. */
		const REMOTE_EVENT_NEXT = Symbol("api-gateway.remote-event.next");
		/** Own Cordis registrations, generation pumping, waterfall dispatch, and HTTP replies. */
		var ClientRemoteEvents = class {
			ownerCtx;
			connection;
			openStream;
			eventPrefix = `internal/api-gateway/remote-event/${randomUUID()}/`;
			unregisterGeneration;
			activeGeneration;
			/**
			* @param ownerCtx - Client Gateway root used for Agent Context resolution.
			* @param connection - Connection carrier used for HTTP result calls.
			* @param openStream - selected in-process or WebSocket stream opener.
			*/
			constructor(ownerCtx, connection, openStream) {
				this.ownerCtx = ownerCtx;
				this.connection = connection;
				this.openStream = openStream;
				this.unregisterGeneration = connection.registerGenerationSource(this.runGeneration);
			}
			/**
			* Register one typed Remote Event listener in its calling fiber.
			* @param callerCtx - fiber Context owning the registration.
			* @param event - selected forwarded event.
			* @param listener - listener derived from that event's declaration.
			* @returns disposer for this exact registration.
			*/
			subscribe(callerCtx, event, listener) {
				const dispose = privateEvents(callerCtx).on(this.eventKey(event), listener);
				return () => {
					dispose();
				};
			}
			/** Withdraw the generation source and wait for active listener work to quiesce. */
			async dispose() {
				this.unregisterGeneration();
				await Promise.allSettled([this.activeGeneration]);
			}
			/** Track the current generation so plugin disposal waits for listener work to stop. */
			runGeneration = (signal, ready) => {
				const tracked = this.pumpEvents(signal, ready).finally(() => {
					if (this.activeGeneration === tracked) this.activeGeneration = void 0;
				});
				this.activeGeneration = tracked;
				return tracked;
			};
			/** Deliver one notification through Cordis while containing listener failures. */
			deliver(frame) {
				privateEvents(this.ownerCtx).parallel(this.eventKey(frame.event), ...frame.args).catch((error) => {
					this.reportError(frame.event, error);
				});
			}
			/** Run one Connection generation over the forwarded-event logical stream. */
			async pumpEvents(signal, ready) {
				let clientId;
				const failed = new AbortController();
				const generationSignal = AbortSignal.any([signal, failed.signal]);
				const active = /* @__PURE__ */ new Map();
				const tasks = /* @__PURE__ */ new Set();
				const source = this.openStream(REMOTE_EVENT_STREAM_ENDPOINT, REMOTE_EVENT_STREAM_PAYLOAD, generationSignal);
				let streamFailed = false;
				let streamError;
				try {
					for await (const value of source) {
						if (clientId === void 0) {
							const opening = parseRemoteEventReady(value);
							clientId = opening.clientId;
							ready(opening.host);
							continue;
						}
						const frame = parseRemoteEventFrame(value);
						if (frame.type === "cancel") {
							active.get(frame.eventId)?.abort(/* @__PURE__ */ new Error("client api: Remote event was cancelled by the Host"));
							continue;
						}
						if (frame.type === "emit") {
							this.deliver(frame);
							continue;
						}
						const controller = new AbortController();
						active.set(frame.eventId, controller);
						const deliverySignal = AbortSignal.any([generationSignal, controller.signal]);
						const task = this.answer(frame, clientId, deliverySignal).catch((error) => {
							if (!deliverySignal.aborted) failed.abort(error);
						}).finally(() => {
							active.delete(frame.eventId);
							tasks.delete(task);
						});
						tasks.add(task);
					}
				} catch (error) {
					streamFailed = true;
					streamError = error;
				} finally {
					for (const controller of active.values()) controller.abort(/* @__PURE__ */ new Error("client api: Remote event generation ended"));
					await Promise.allSettled(tasks);
				}
				if (failed.signal.aborted) throw toError(failed.signal.reason, "client api: Remote event result delivery failed");
				if (signal.aborted) return;
				if (streamFailed) throw streamError;
				throw new Error("client api: forwarded Remote event stream ended unexpectedly");
			}
			async answer(frame, clientId, signal) {
				const adapter = this.ownerCtx.typert.contexts.getClient("agent");
				let resolved;
				try {
					resolved = adapter?.resolve(frame.agentId);
				} catch (error) {
					this.reportError(frame.event, error);
				}
				const owned = isTypertOwnedValue(resolved) ? resolved : void 0;
				try {
					const target = isTypertOwnedValue(resolved) ? resolved.value : resolved;
					let outcome = { kind: "next" };
					if (target !== void 0) try {
						outcome = await this.dispatchWaterfall(target, frame, signal);
					} catch (error) {
						if (signal.aborted) return;
						outcome = {
							kind: "rejected",
							error: projectRemoteEventRejection(error)
						};
					}
					if (signal.aborted) return;
					const result = {
						clientId,
						eventId: frame.eventId,
						outcome: outcome.kind === "result" && outcome.value === void 0 ? { kind: "result" } : outcome
					};
					const response = await this.connection.rpc.call("/api", REMOTE_EVENT_RESULT_ENDPOINT, { args: result }, signal);
					if (!response.ok) throw new Error(response.error.message);
				} finally {
					owned?.[Symbol.dispose]();
				}
			}
			async dispatchWaterfall(target, frame, signal) {
				const request = {
					...frame.request,
					agent: target,
					signal
				};
				const value = await privateEvents(target).waterfall(target, this.eventKey(frame.event), request, () => Promise.resolve(REMOTE_EVENT_NEXT));
				if (value !== REMOTE_EVENT_NEXT && value !== void 0 && !isRemoteJsonValue(value)) throw new TypeError("Remote event listener result is not lossless JSON data");
				return value === REMOTE_EVENT_NEXT ? { kind: "next" } : {
					kind: "result",
					value
				};
			}
			eventKey(event) {
				return `${this.eventPrefix}${event}`;
			}
			reportError(event, error) {
				console.error(`client api: Remote event ${JSON.stringify(event)} listener threw:`, error);
			}
		};
		/** Validate and return one generation's Client identity and Host facts. */
		function parseRemoteEventReady(value) {
			if (!isRemoteEventRecord(value) || !hasExactRemoteEventKeys(value, [
				"type",
				"clientId",
				"host"
			]) || value.type !== "ready" || !isRemoteEventClientId(value.clientId) || !isRemoteEventRecord(value.host) || !hasExactRemoteEventKeys(value.host, ["home"]) || typeof value.host.home !== "string") throw new TypeError("client api: forwarded Remote event stream did not begin with ready");
			return {
				clientId: value.clientId,
				host: { home: value.host.home }
			};
		}
		/** Validate one untrusted value from the Gateway-internal forwarded-event stream. */
		function parseRemoteEventFrame(value) {
			if (!isRemoteEventRecord(value)) invalidRemoteEventFrame();
			if (value.type === "cancel" && hasExactRemoteEventKeys(value, ["type", "eventId"]) && isRemoteEventId(value.eventId)) return {
				type: "cancel",
				eventId: value.eventId
			};
			if (value.type === "emit" && hasExactRemoteEventKeys(value, [
				"type",
				"event",
				"args"
			]) && validRemoteEventName(value.event) && Array.isArray(value.args) && isRemoteJsonValue(value.args)) return {
				type: "emit",
				event: value.event,
				args: value.args
			};
			if (value.type === "waterfall" && hasExactRemoteEventKeys(value, [
				"type",
				"event",
				"eventId",
				"agentId",
				"request"
			]) && validRemoteEventName(value.event) && isRemoteEventId(value.eventId) && isRemoteEventAgentId(value.agentId) && isRemoteEventRecord(value.request) && !Object.hasOwn(value.request, "agent") && !Object.hasOwn(value.request, "signal") && isRemoteJsonValue(value.request)) return {
				type: "waterfall",
				event: value.event,
				eventId: value.eventId,
				agentId: value.agentId,
				request: value.request
			};
			invalidRemoteEventFrame();
		}
		function isRemoteEventRecord(value) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
			const prototype = Object.getPrototypeOf(value);
			return prototype === Object.prototype || prototype === null;
		}
		function hasExactRemoteEventKeys(value, keys) {
			return Reflect.ownKeys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
		}
		function validRemoteEventName(value) {
			return typeof value === "string" && value.length > 0;
		}
		function invalidRemoteEventFrame() {
			throw new TypeError("client api: invalid forwarded Remote event frame");
		}
		function privateEvents(ctx) {
			return ctx;
		}
		function toError(reason, message) {
			return reason instanceof Error ? reason : new Error(message, { cause: reason });
		}
		//#endregion
		//#region lib/types/client/remote-stream.js
		/** Reconnecting lifecycle for one single-consumer Remote stream. */
		/**
		* Reopens one logical Remote stream across carrier generations.
		*
		* Connection owns physical retry timing; Gateway performs each requested
		* replacement. The domain consumer owns its opening item and every later
		* item, and calls {@link RemoteStreamItem.accept} only after validating the
		* opening baseline or cursor.
		*/
		var RemoteStream = class {
			connection;
			options;
			lifetime = new AbortController();
			generationAbort;
			iterator;
			closing;
			revision = 0;
			taken = false;
			/**
			* @param connection - observable Host generation source used to pace retries.
			* @param options - domain stream opener, end classification, and diagnostics.
			*/
			constructor(connection, options) {
				this.connection = connection;
				this.options = options;
			}
			/** Cancellation lifetime shared by the stream and sibling page requests. */
			get signal() {
				return this.lifetime.signal;
			}
			/** Interrupt the current generation and immediately request a replacement. */
			restart() {
				if (this.lifetime.signal.aborted) return;
				this.revision++;
				this.generationAbort?.abort(/* @__PURE__ */ new Error(`${this.options.name} generation restarted`));
			}
			/**
			* Permanently stop this stream and wait for its iterator to close.
			* @returns when the active generation and consumer iterator are quiescent.
			*/
			dispose() {
				if (this.closing !== void 0) return this.closing;
				if (!this.lifetime.signal.aborted) {
					const reason = /* @__PURE__ */ new Error(`${this.options.name} disposed`);
					this.lifetime.abort(reason);
					this.generationAbort?.abort(reason);
				}
				const iterator = this.iterator;
				if (iterator === void 0) return Promise.resolve();
				const closing = closeRemoteStreamIterator(iterator);
				this.closing = closing;
				return closing;
			}
			/** @inheritdoc */
			[Symbol.asyncIterator]() {
				if (this.taken) throw new Error(`${this.options.name} already has a consumer`);
				this.taken = true;
				const iterator = this.read();
				this.iterator = iterator;
				return iterator;
			}
			async *read() {
				let attempt = 0;
				let generation = 0;
				let observedRevision = this.revision;
				try {
					while (!isAborted(this.lifetime.signal)) {
						if (observedRevision !== this.revision) {
							observedRevision = this.revision;
							attempt = 0;
						}
						const revision = this.revision;
						const generationAbort = new AbortController();
						this.generationAbort = generationAbort;
						const signal = AbortSignal.any([this.lifetime.signal, generationAbort.signal]);
						const generationId = ++generation;
						let accepted = false;
						try {
							for await (const value of this.options.open(signal)) {
								if (isAborted(this.lifetime.signal)) return;
								if (revision !== this.revision) break;
								yield {
									generation: generationId,
									value,
									signal,
									accept: () => {
										if (this.generationAbort !== generationAbort || revision !== this.revision) return;
										accepted = true;
										attempt = 0;
									}
								};
							}
							if (isAborted(this.lifetime.signal)) return;
							if (revision !== this.revision) continue;
							throw this.options.ended(accepted);
						} catch (error) {
							if (isAborted(this.lifetime.signal)) return;
							if (revision !== this.revision) continue;
							if (!(error instanceof RemoteStreamCarrierError)) throw terminalStreamFailure(error);
							this.options.carrierFailed?.(error);
							if (revision !== this.revision) continue;
							attempt++;
							try {
								await waitForRemoteStreamRetry(this.connection, error, attempt, signal);
							} catch (retryError) {
								if (isAborted(this.lifetime.signal)) return;
								if (revision !== this.revision) continue;
								throw terminalStreamFailure(retryError);
							}
						} finally {
							this.generationAbort = void 0;
							if (!generationAbort.signal.aborted) generationAbort.abort(/* @__PURE__ */ new Error(`${this.options.name} generation ended`));
						}
					}
				} finally {
					if (!this.lifetime.signal.aborted) this.lifetime.abort(/* @__PURE__ */ new Error(`${this.options.name} consumer closed`));
					this.generationAbort?.abort(this.lifetime.signal.reason);
					this.generationAbort = void 0;
				}
			}
		};
		async function waitForRemoteStreamRetry(connection, error, attempt, signal) {
			signal.throwIfAborted();
			if (connection.generation.getSnapshot() !== void 0) {
				if (attempt === 1) return;
				throw error;
			}
			await new Promise((resolve, reject) => {
				const subscription = { finished: false };
				const finish = (failure) => {
					if (subscription.finished) return;
					subscription.finished = true;
					subscription.dispose?.();
					signal.removeEventListener("abort", aborted);
					if (failure === void 0) resolve();
					else reject(failure);
				};
				const inspect = () => {
					if (connection.generation.getSnapshot() !== void 0) finish();
				};
				const aborted = () => {
					finish(new Error("Remote stream retry aborted", { cause: signal.reason }));
				};
				const dispose = connection.generation.subscribe(inspect);
				subscription.dispose = dispose;
				if (subscription.finished) dispose();
				signal.addEventListener("abort", aborted, { once: true });
				if (signal.aborted) aborted();
				else inspect();
			});
		}
		/**
		* Mark a terminal escape before it crosses the stream boundary: consumers
		* discriminate failures by code, so an unmarked throw reads as a local bug.
		* Marked failures pass through verbatim. The carrier class never escapes as a
		* terminal outcome — it stays the retry-internal signal fed to `carrierFailed`
		* and the `ended(true)` retry trigger.
		*/
		function terminalStreamFailure(error) {
			return remoteErrorOf(error) ?? new RemoteError("gateway/internal", error instanceof Error ? error.message : String(error), {}, { cause: error });
		}
		function isAborted(signal) {
			return signal.aborted;
		}
		async function closeRemoteStreamIterator(iterator) {
			try {
				await iterator.return?.();
			} catch {}
		}
		//#endregion
		//#region lib/types/client/journal-stream.js
		/** Cursor, page, and live-tail coordination over a reconnecting Remote stream. */
		/** Host-side stream protocol violation, marked so consumers surface it as an error state. */
		function protocolViolation$1(message) {
			return new RemoteError("gateway/internal", message, {});
		}
		/**
		* Owns snapshot-first opening, ordered live delivery, pagination, and repair.
		*
		* The domain retains its published window during reconnection. A replacement is
		* published only after the opening page reaches the generation's cursor.
		* Notifications never change a cursor and wait behind an in-flight gap repair.
		*/
		var RemoteJournalStream = class {
			options;
			stream;
			initialRequest;
			resumeCursor;
			hasResumeCursor = false;
			generation = 0;
			firstCursor;
			lastCursor;
			started = false;
			opened = false;
			disposed = false;
			done;
			closing;
			pendingNext;
			/**
			* @param remote - Gateway factory for the reconnecting physical-generation stream.
			* @param options - cursor algebra and domain publication sinks.
			*/
			constructor(remote, options) {
				this.options = options;
				this.stream = remote.$stream({
					name: options.name,
					open: (signal) => this.follow(this.initialRequest, signal),
					ended: (accepted) => accepted ? new RemoteStreamCarrierError(`${options.name} ended without a terminal result`) : protocolViolation$1(`${this.hasResumeCursor ? "resumed " : ""}${options.name} ended before its opening cursor`),
					...options.carrierFailed === void 0 ? {} : { carrierFailed: options.carrierFailed }
				});
			}
			/** Cancellation lifetime shared by follow and page calls. */
			get signal() {
				return this.stream.signal;
			}
			/**
			* Establish follow and publish the opening snapshot carried by its first frame.
			* @param request - initial tail-page request.
			* @returns after the first complete window is published.
			*/
			async open(request) {
				if (this.started) throw new Error(`${this.options.name} already opened`);
				this.started = true;
				this.initialRequest = request;
				const iterator = this.stream[Symbol.asyncIterator]();
				try {
					const first = await this.takeNext(iterator);
					if (first.done) throw protocolViolation$1(`${this.options.name} ended before its opening cursor`);
					this.replaceGeneration(first.value, false);
					this.opened = true;
					this.done = this.consume(iterator);
				} catch (error) {
					await this.stream.dispose();
					throw error;
				}
			}
			/**
			* Read and prepend one older page after a successful open.
			* @param request - domain page request bound to this stream's address.
			* @returns after the page is applied or rejected as discontinuous.
			*/
			async prepend(request) {
				if (!this.opened || this.disposed) throw new Error(`${this.options.name} is not open`);
				const page = await this.readPage(request, this.currentCursor(), this.stream.signal);
				this.stream.signal.throwIfAborted();
				const entries = this.options.entries(page);
				this.assertPage(entries);
				const before = this.firstCursor;
				const accepted = before === void 0 ? [...entries] : entries.filter((entry) => this.options.compare(this.options.first(entry), before) < 0);
				const tail = accepted.at(-1);
				if (tail !== void 0 && before !== void 0 && !this.options.follows(this.options.last(tail), before)) {
					this.options.publish({
						type: "prepend",
						page,
						entries: [],
						hasMore: false
					});
					throw protocolViolation$1(`${this.options.name} history page is discontinuous`);
				}
				const first = accepted[0];
				if (first !== void 0) this.firstCursor = this.options.first(first);
				this.options.publish({
					type: "prepend",
					page,
					entries: accepted,
					hasMore: this.options.hasMore(page)
				});
			}
			/** Replace the active physical generation while retaining the published window. */
			restart() {
				this.stream.restart();
			}
			/**
			* Permanently stop follow, page requests, and the background consumer.
			* @returns when no stream work or publication callback can still run.
			*/
			dispose() {
				if (this.closing !== void 0) return this.closing;
				this.disposed = true;
				const done = this.done;
				const closing = (async () => {
					await this.stream.dispose();
					await done;
				})();
				this.closing = closing;
				return closing;
			}
			async consume(iterator) {
				try {
					while (true) {
						const next = await this.takeNext(iterator);
						if (next.done) return;
						const item = next.value;
						if (item.generation !== this.generation) {
							this.replaceGeneration(item, true);
							continue;
						}
						if (item.value.type === "opened") throw protocolViolation$1(`${this.options.name} emitted more than one opening cursor`);
						if (item.value.type === "notification") {
							this.publishNotification(item.value.notification);
							continue;
						}
						await this.acceptEntry(item.value.entry, item, iterator);
					}
				} catch (error) {
					if (!this.disposed) this.options.failed(error);
				}
			}
			replaceGeneration(initial, resumed) {
				const opening = this.opening(initial, resumed);
				this.replaceFromOpening(opening.page, opening.cursor);
			}
			opening(item, resumed) {
				if (item.value.type !== "opened") throw protocolViolation$1(`${resumed ? "resumed " : ""}${this.options.name} emitted an entry before its opening cursor`);
				const cursor = item.value.cursor;
				if (resumed && this.lastCursor !== void 0 && this.options.compare(cursor, this.lastCursor) < 0) throw protocolViolation$1(`${this.options.name} resumed at a cursor behind the last applied entry`);
				this.generation = item.generation;
				item.accept();
				return {
					cursor,
					page: item.value.page
				};
			}
			/** Publish a generation's opening page without issuing a second Remote call. */
			replaceFromOpening(page, cursor) {
				this.assertPageThrough(page, cursor);
				const entries = [...this.options.entries(page)];
				this.assertPage(entries);
				const first = entries[0];
				this.firstCursor = first === void 0 ? void 0 : this.options.first(first);
				this.lastCursor = cursor;
				this.setResumeCursor(cursor);
				this.options.publish({
					type: "replace",
					page,
					entries,
					hasMore: this.options.hasMore(page)
				});
			}
			async acceptEntry(entry, item, iterator) {
				const { first, last: cursor } = this.entryRange(entry);
				const last = this.lastCursor;
				if (this.options.compare(cursor, last) <= 0) return;
				if (this.options.compare(first, last) <= 0) throw protocolViolation$1(`${this.options.name} emitted a partially overlapping entry`);
				if (!this.options.follows(last, first)) {
					const request = this.repairPageRequest();
					const superseded = await this.replaceThrough(request, cursor, item.generation, item.signal, iterator, [entry], []);
					if (superseded !== void 0) this.replaceGeneration(superseded, true);
					return;
				}
				if (this.firstCursor === void 0) this.firstCursor = first;
				this.lastCursor = cursor;
				this.setResumeCursor(cursor);
				this.options.publish({
					type: "append",
					entry
				});
			}
			async replaceThrough(request, requiredCursor, generation, signal, iterator, queued, notifications) {
				let read = await this.readPageWhileFollowing(request, requiredCursor, generation, signal, iterator, queued, notifications);
				if (read.type === "superseded") return read.item;
				let page = read.page;
				this.assertPageThrough(page, requiredCursor);
				let entries = this.mergeReplacement(page, queued);
				let target = this.maxCursor(requiredCursor, queued);
				if (entries === void 0 || this.options.compare(this.tailCursor(entries), target) < 0) {
					read = await this.readPageWhileFollowing(this.repairPageRequest(), target, generation, signal, iterator, queued, notifications);
					if (read.type === "superseded") return read.item;
					page = read.page;
					this.assertPageThrough(page, target);
					entries = this.mergeReplacement(page, queued);
					target = this.maxCursor(requiredCursor, queued);
				}
				if (entries === void 0 || this.options.compare(this.tailCursor(entries), target) < 0) throw protocolViolation$1(`${this.options.name} page did not reach its opening cursor`);
				const first = entries[0];
				/* v8 ignore next -- a successful positive-cursor replacement page cannot be empty. */
				this.firstCursor = first === void 0 ? void 0 : this.options.first(first);
				this.lastCursor = this.tailCursor(entries);
				this.setResumeCursor(this.lastCursor);
				this.options.publish({
					type: "replace",
					page,
					entries,
					hasMore: this.options.hasMore(page)
				});
				for (const notification of notifications) this.publishNotification(notification);
			}
			async readPageWhileFollowing(request, through, generation, signal, iterator, queued, notifications) {
				const page = this.readPage(request, through, signal).then((value) => ({
					type: "page",
					value
				}), (error) => ({
					type: "page-error",
					error
				}));
				while (true) {
					const pending = this.nextResult(iterator);
					const next = pending.then((value) => ({
						type: "next",
						value
					}), (error) => ({
						type: "next-error",
						error
					}));
					const result = await Promise.race([page, next]);
					if (result.type === "page") {
						signal.throwIfAborted();
						return {
							type: "page",
							page: result.value
						};
					}
					if (result.type === "page-error") {
						if (!signal.aborted || this.stream.signal.aborted) throw result.error;
						return this.awaitReplacementGeneration(generation, iterator, pending);
					}
					this.releaseNext();
					if (result.type === "next-error") throw result.error;
					if (result.value.done) {
						signal.throwIfAborted();
						throw protocolViolation$1(`${this.options.name} ended while reading its replacement page`);
					}
					const item = result.value.value;
					if (item.generation !== generation) return {
						type: "superseded",
						item
					};
					if (item.value.type === "opened") throw protocolViolation$1(`${this.options.name} emitted more than one opening cursor`);
					if (item.value.type === "notification") {
						notifications.push(item.value.notification);
						continue;
					}
					queued.push(item.value.entry);
				}
			}
			async awaitReplacementGeneration(generation, iterator, initial) {
				let pending = initial;
				while (true) {
					let next;
					try {
						next = await pending;
					} finally {
						this.releaseNext();
					}
					if (next.done) {
						this.stream.signal.throwIfAborted();
						throw protocolViolation$1(`${this.options.name} ended while replacing an aborted page generation`);
					}
					const item = next.value;
					if (item.generation !== generation) return {
						type: "superseded",
						item
					};
					if (item.value.type === "opened") throw protocolViolation$1(`${this.options.name} emitted more than one opening cursor`);
					pending = this.nextResult(iterator);
				}
			}
			mergeReplacement(page, queued) {
				const entries = [...this.options.entries(page)];
				this.assertPage(entries);
				for (const entry of queued) this.entryRange(entry);
				const sorted = [...queued].sort((left, right) => this.options.compare(this.options.first(left), this.options.first(right)));
				let tail = this.tailCursor(entries);
				for (const entry of sorted) {
					const first = this.options.first(entry);
					const last = this.options.last(entry);
					if (this.options.compare(last, tail) <= 0) continue;
					if (this.options.compare(first, tail) <= 0) throw protocolViolation$1(`${this.options.name} replacement contains a partially overlapping entry`);
					if (!this.options.follows(tail, first)) return void 0;
					entries.push(entry);
					tail = last;
				}
				return entries;
			}
			maxCursor(cursor, entries) {
				let result = cursor;
				for (const entry of entries) {
					const candidate = this.options.last(entry);
					if (this.options.compare(candidate, result) > 0) result = candidate;
				}
				return result;
			}
			nextResult(iterator) {
				this.pendingNext ??= iterator.next();
				return this.pendingNext;
			}
			async takeNext(iterator) {
				const pending = this.nextResult(iterator);
				try {
					return await pending;
				} finally {
					this.releaseNext();
				}
			}
			releaseNext() {
				this.pendingNext = void 0;
			}
			publishNotification(notification) {
				this.options.publish({
					type: "notification",
					notification
				});
			}
			repairPageRequest() {
				return this.repairRequest(this.initialRequest);
			}
			setResumeCursor(cursor) {
				this.resumeCursor = cursor;
				this.hasResumeCursor = true;
			}
			currentCursor() {
				return this.resumeCursor;
			}
			tailCursor(entries) {
				const tail = entries.at(-1);
				return tail === void 0 ? this.options.emptyCursor : this.options.last(tail);
			}
			assertPage(entries) {
				const iterator = entries[Symbol.iterator]();
				const first = iterator.next();
				if (first.done) return;
				let previousRange = this.entryRange(first.value);
				for (const entry of iterator) {
					const range = this.entryRange(entry);
					if (!this.options.follows(previousRange.last, range.first)) throw protocolViolation$1(`${this.options.name} page contains discontinuous entries`);
					previousRange = range;
				}
			}
			entryRange(entry) {
				const first = this.options.first(entry);
				const last = this.options.last(entry);
				if (this.options.compare(first, last) > 0) throw protocolViolation$1(`${this.options.name} entry has an inverted cursor range`);
				return {
					first,
					last
				};
			}
			assertPageThrough(page, through) {
				const tail = this.tailCursor(this.options.entries(page));
				if (this.options.compare(tail, through) !== 0) throw protocolViolation$1(`${this.options.name} page did not end at its requested cursor`);
			}
		};
		//#endregion
		//#region lib/types/client/snapshot-stream.js
		/** Baseline-and-delta protocol layered over a reconnecting Remote stream. */
		/** Host-side stream protocol violation, marked so consumers surface it as an error state. */
		function protocolViolation(message) {
			return new RemoteError("gateway/internal", message, {});
		}
		/**
		* Consumes generations that each contain exactly one opening snapshot followed by deltas.
		*
		* The previous domain snapshot remains published while the underlying stream retries. A
		* replacement becomes accepted only after the domain owner applies it successfully.
		*/
		var RemoteSnapshotStream = class {
			stream;
			options;
			started = false;
			disposed = false;
			done;
			/**
			* @param stream - reconnecting physical-generation stream.
			* @param options - frame discriminator and domain state destinations.
			*/
			constructor(stream, options) {
				this.stream = stream;
				this.options = options;
			}
			/** Start the single consumer; repeated calls are inert. */
			start() {
				if (this.started) return;
				this.started = true;
				this.done = this.consume();
			}
			/** Replace the active physical generation without discarding the published snapshot. */
			restart() {
				this.stream.restart();
			}
			/**
			* Permanently stop the stream and wait for its consumer to become quiescent.
			* @returns when no generation or callback can still run.
			*/
			async dispose() {
				this.disposed = true;
				await this.stream.dispose();
				await this.done;
			}
			async consume() {
				let generation = 0;
				let snapshotSeen = false;
				try {
					for await (const item of this.stream) {
						if (item.generation !== generation) {
							generation = item.generation;
							snapshotSeen = false;
						}
						if (this.options.isSnapshot(item.value)) {
							if (snapshotSeen) throw protocolViolation(`${this.options.name} emitted more than one opening snapshot`);
							this.options.replace(item.value);
							snapshotSeen = true;
							item.accept();
							continue;
						}
						if (!snapshotSeen) throw protocolViolation(`${this.options.name} emitted an update before its opening snapshot`);
						this.options.update(item.value);
					}
				} catch (error) {
					if (!this.disposed) this.options.failed(error);
				}
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Client projection of generated Typert Remote descriptors. Contributions
		* install traced `remote.<namespace>` services; no JavaScript Proxy
		* participates in method lookup, invocation, or type exposure.
		*/
		/** Required Client services: the Typert registry and the existing Connection carrier. */
		const inject = ["typert", "connection"];
		/**
		* Install the typed Client Remote service.
		* @param ctx - Client Cordis root.
		*/
		function apply(ctx) {
			new ClientRemoteService(ctx);
		}
		var ClientRemoteService = class extends _deepseek_ai_cordis.Service {
			ownerCtx;
			connection;
			namespaces = /* @__PURE__ */ new Map();
			hostFacts;
			streams;
			events;
			mutations = Promise.resolve();
			constructor(ctx) {
				super(ctx, "remote");
				this.ownerCtx = ctx;
				const connection = ctx.get("connection");
				this.connection = connection;
				this.streams = new RemoteStreamMuxClient((path) => connection.openWebSocket(path), connection.interactions === "answer");
				if (connection.interactions === "answer") this.events = new ClientRemoteEvents(ctx, connection, (endpoint, payload, signal) => this.openRemoteStream(endpoint, payload, signal));
				if (connection.rpc.open === void 0) this.streams.start();
				let disposed = false;
				let loop;
				const start = () => {
					if (disposed || connection.interactions === "none") return;
					if (connection.rpc.open === void 0) this.streams.start();
					loop = connection.start({
						onConnected: () => {
							this.ownerCtx.emit("connection/reset");
						},
						onReconnectRequested: () => {
							if (connection.rpc.open === void 0) this.streams.reconnect();
						}
					});
				};
				const loader = ctx.get("loader");
				if (loader === void 0) start();
				else loader.await().then(start, () => {});
				ctx.effect(() => async () => {
					disposed = true;
					loop?.stop();
					await this.events?.dispose();
					await this.streams.close();
				}, "api-gateway.client.transport");
			}
			$stream(options) {
				if (this.connection.interactions === "none") throw new Error("client api: $stream requires interactions=answer; use a generated stream method");
				return new RemoteStream(this.connection, options);
			}
			get $host() {
				const home = this.connection.generation.getSnapshot()?.host.home;
				if (this.hostFacts === void 0 || this.hostFacts.home !== home) this.hostFacts = {
					home,
					isLoopback: this.connection.isLoopback
				};
				return this.hostFacts;
			}
			async $mount(contribution) {
				const callerCtx = this.ctx;
				const owned = callerCtx.effect(async () => {
					const dispose = await this.enqueue(() => this.mountContribution(callerCtx, contribution));
					return () => this.enqueue(dispose);
				}, `api-gateway.client.$mount(${JSON.stringify(contribution.package)})`);
				await owned;
				return async () => {
					await owned();
				};
			}
			$on(event, listener) {
				if (this.events === void 0) throw new Error("client api: forwarded events require interactions=answer");
				return this.events.subscribe(this.ctx, event, listener);
			}
			/** Open one Remote stream and normalize a worker-local carrier's structural failures. */
			openRemoteStream(endpoint, payload, signal, uplink, noConnection = `client api: ${endpoint} has no active Connection`) {
				const connection = this.ownerCtx.get("connection");
				if (connection === void 0) throw new Error(noConnection);
				const local = connection.rpc.open?.("/api", endpoint, payload, signal, uplink);
				return local === void 0 ? this.streams.open(endpoint, payload, signal, uplink) : normalizeConnectionStream(local);
			}
			enqueue(operation) {
				const result = this.mutations.then(operation, operation);
				this.mutations = result.then(() => void 0, () => void 0);
				return result;
			}
			async mountContribution(callerCtx, contribution) {
				this.validateContribution(contribution);
				const disposeRemote = callerCtx.typert.remotes.register(contribution);
				const groups = /* @__PURE__ */ new Map();
				for (const descriptor of contribution.descriptors) {
					const group = groups.get(descriptor.namespace);
					if (group === void 0) groups.set(descriptor.namespace, [descriptor]);
					else group.push(descriptor);
				}
				const installed = [];
				try {
					for (const [namespace, descriptors] of groups) installed.push(await this.installNamespace(namespace, descriptors));
				} catch (error) {
					for (const dispose of installed.reverse()) await dispose();
					await disposeRemote();
					throw error;
				}
				return async () => {
					for (const dispose of installed.reverse()) await dispose();
					await disposeRemote();
				};
			}
			validateContribution(contribution) {
				const direct = /* @__PURE__ */ new Map();
				const scoped = /* @__PURE__ */ new Map();
				const add = (table, descriptor, kind) => {
					const methods = table.get(descriptor.namespace) ?? /* @__PURE__ */ new Set();
					if (methods.has(descriptor.method)) throw new Error(`client api: contribution repeats ${kind} method ${endpointOf(descriptor)}`);
					methods.add(descriptor.method);
					table.set(descriptor.namespace, methods);
					if ((this.namespaces.get(descriptor.namespace)?.service)?.has(kind, descriptor.method) === true) throw new Error(`client api: ${kind} method ${endpointOf(descriptor)} is already mounted`);
				};
				for (const descriptor of contribution.descriptors) {
					requireStrictInputs(descriptor);
					if (descriptor.invocation.kind === "direct") add(direct, descriptor, "direct");
					if (scopedProjection(descriptor) !== void 0) add(scoped, descriptor, "scoped");
				}
				const namespaces = new Set([...direct.keys(), ...scoped.keys()]);
				for (const namespace of namespaces) {
					const service = this.namespaces.get(namespace)?.service;
					if (service === void 0) {
						if (namespace in this) throw new Error(`client api: namespace ${JSON.stringify(namespace)} conflicts with the Remote service`);
						const serviceKey = remoteServiceKey(namespace);
						if (this.ownerCtx.reflect.props[serviceKey]?.type === "accessor" || this.ownerCtx.get(serviceKey) !== void 0) throw new Error(`client api: namespace ${JSON.stringify(namespace)} conflicts with an existing Remote namespace`);
					}
					for (const method of new Set([...direct.get(namespace) ?? [], ...scoped.get(namespace) ?? []])) if (service === void 0) RemoteNamespaceService.assertMethodAvailable(namespace, method);
					else service.assertMethodAvailable(method);
				}
			}
			/**
			* Mount one namespace's descriptor group with no visibility gap: a fresh
			* namespace installs its whole group synchronously inside its fiber's
			* apply, so a plugin parked on the namespace service never observes it
			* without the methods the same contribution carries; an existing namespace
			* takes the group in one synchronous step.
			* @param name - Remote namespace.
			* @param descriptors - Every contribution descriptor naming that namespace.
			* @returns disposer unmounting the group and the namespace once empty.
			*/
			async installNamespace(name, descriptors) {
				let namespace = this.namespaces.get(name);
				let installed;
				if (namespace === void 0) ({namespace, installed} = await this.createNamespace(name, descriptors));
				else installed = installMethods(namespace.service, descriptors);
				const handle = namespace;
				return async () => {
					for (const method of [...installed].reverse()) {
						/* v8 ignore next -- Cordis effect disposers are idempotent and invoke this cleanup at most once. */
						if (!method.token.active) continue;
						method.token.active = false;
						method.token.abort.abort();
						if (method.scoped) handle.service.remove("scoped", method.descriptor.method, method.token);
						if (method.direct) handle.service.remove("direct", method.descriptor.method, method.token);
					}
					await this.disposeNamespace(name, handle);
				};
			}
			async createNamespace(name, descriptors) {
				let service;
				let installed;
				const fiber = this.ownerCtx.plugin({
					name: remoteServiceKey(name),
					apply: (ctx) => {
						service = new RemoteNamespaceService(ctx, name, (direct, scoped, caller, args) => this.invokeMethod(direct, scoped, caller, args));
						installed = installMethods(service, descriptors);
					}
				});
				try {
					await fiber;
				} catch (error) {
					await fiber.dispose();
					throw error;
				}
				/* v8 ignore next 3 -- a settled namespace fiber synchronously constructs its Service and installs the group. */
				if (service === void 0 || installed === void 0) throw new Error(`client api: namespace ${JSON.stringify(name)} did not start`);
				const namespace = {
					service,
					dispose: fiber.dispose
				};
				this.namespaces.set(name, namespace);
				return {
					namespace,
					installed
				};
			}
			async disposeNamespace(name, namespace) {
				if (!namespace.service.empty || this.namespaces.get(name) !== namespace) return;
				this.namespaces.delete(name);
				await namespace.dispose();
			}
			invokeMethod(direct, scoped, callerCtx, values) {
				if (scoped !== void 0) {
					const identity = this.ownerCtx.typert.contexts.getClient(scoped.projection.context)?.identity(callerCtx);
					if (identity !== void 0) return this.invokeSelected(scoped.descriptor, scoped.projection, scoped.token, callerCtx, values, { value: identity });
				}
				if (direct !== void 0) return this.invokeSelected(direct.descriptor, void 0, direct.token, callerCtx, values);
				if (scoped !== void 0) return this.invokeSelected(scoped.descriptor, scoped.projection, scoped.token, callerCtx, values);
				throw new Error("client api: Remote method is no longer mounted");
			}
			invokeSelected(descriptor, projection, token, callerCtx, values, boundIdentity) {
				if (descriptor.mode !== void 0) return this.invokeStream(descriptor, projection, token, callerCtx, values, boundIdentity);
				return this.invoke(descriptor, projection, token, callerCtx, values, boundIdentity);
			}
			async invoke(descriptor, projection, token, callerCtx, values, boundIdentity) {
				const endpoint = endpointOf(descriptor);
				if (!token.active) return withdrawn(endpoint);
				const prepared = this.prepareInvocation(descriptor, projection, token, callerCtx, values, boundIdentity);
				const connection = this.ownerCtx.get("connection");
				if (connection === void 0) throw new Error(`client api: ${endpoint} has no active Connection`);
				try {
					const result = await connection.rpc.call("/api", endpoint, { args: prepared.args }, prepared.signal);
					if (!mountActive(token)) return withdrawn(endpoint);
					prepared.signal.throwIfAborted();
					if (!result.ok) return {
						ok: false,
						error: rebuiltFailure(result.error)
					};
					return {
						ok: true,
						value: descriptor.result.mode === "strict" && descriptor.result.decode !== void 0 ? descriptor.result.decode(result.value) : result.value
					};
				} catch (error) {
					if (prepared.signal.aborted) return cancelledFailure(endpoint, error);
					return carrierFailure(endpoint, error);
				}
			}
			/** Open the logical stream now and hand back its handle; `send()` before the first read queues behind the `open` frame. */
			invokeStream(descriptor, projection, token, callerCtx, values, boundIdentity) {
				const endpoint = endpointOf(descriptor);
				if (!token.active) throw new Error(withdrawn(endpoint).error.message);
				const prepared = this.prepareInvocation(descriptor, projection, token, callerCtx, values, boundIdentity);
				const generation = new AbortController();
				const uplink = new ClientUplinkQueue(endpoint);
				return new ClientStreamHandle(endpoint, this.openRemoteStream(endpoint, { args: prepared.args }, AbortSignal.any([prepared.signal, generation.signal]), uplink), uplink, generation, token);
			}
			prepareInvocation(descriptor, projection, token, callerCtx, values, boundIdentity) {
				const endpoint = endpointOf(descriptor);
				const expected = descriptor.parameters.length - (projection?.parameterIndex === void 0 ? 0 : 1);
				const hasCallerSignal = descriptor.cancellation !== void 0 && values.length === expected + 1;
				if (values.length !== expected && !hasCallerSignal) {
					const contract = descriptor.cancellation === void 0 ? `${String(expected)} argument(s)` : `${String(expected)} business argument(s) plus an optional AbortSignal`;
					throw new Error(`client api: ${endpoint} expected ${contract}, got ${String(values.length)}`);
				}
				const args = Object.create(null);
				if (projection !== void 0) {
					const adapter = boundIdentity === void 0 ? this.ownerCtx.typert.contexts.getClient(projection.context) : void 0;
					if (boundIdentity === void 0 && adapter === void 0) throw new Error(`client api: ${endpoint} has no Client Context adapter for ${JSON.stringify(projection.context)}`);
					const identity = boundIdentity === void 0 ? adapter?.identity(callerCtx) : boundIdentity.value;
					if (identity === void 0) throw new Error(`client api: ${endpoint} requires a ${JSON.stringify(projection.context)} Context`);
					args[projection.wire] = identity;
				}
				let valueIndex = 0;
				descriptor.parameters.forEach((parameter, parameterIndex) => {
					if (parameterIndex === projection?.parameterIndex) return;
					const value = values[valueIndex];
					if (value !== void 0) args[parameter.wire] = value;
					valueIndex += 1;
				});
				const callerSignal = hasCallerSignal ? values[expected] : void 0;
				return {
					endpoint,
					args,
					signal: callerSignal === void 0 ? token.abort.signal : AbortSignal.any([token.abort.signal, callerSignal])
				};
			}
		};
		/**
		* The handle a generated stream method returns: one generation of one logical
		* stream. The downlink is iterated once; `send`/`end` feed the uplink queue the
		* carrier pump drains; `dispose` aborts the generation and returns the carrier
		* iterator, which sends `cancel` unless a terminal frame arrived, drops what was
		* buffered, and ends the iteration quietly.
		*/
		var ClientStreamHandle = class {
			endpoint;
			uplink;
			generation;
			token;
			downlink;
			primed;
			consumed = false;
			disposed = false;
			constructor(endpoint, downlink, uplink, generation, token) {
				this.endpoint = endpoint;
				this.uplink = uplink;
				this.generation = generation;
				this.token = token;
				this.downlink = downlink[Symbol.asyncIterator]();
				this.primed = this.downlink.next();
				this.primed.catch(() => {
					this.uplink.close();
				});
			}
			send(item) {
				if (!isRemoteUplinkItem(item)) throw new Error(`client api: ${this.endpoint} uplink item is not a lossless JSON value`);
				this.uplink.push(item);
			}
			end() {
				this.uplink.end();
			}
			dispose() {
				if (this.disposed) return;
				this.disposed = true;
				this.uplink.close();
				this.generation.abort(/* @__PURE__ */ new Error(`client api: ${this.endpoint} stream disposed`));
				Promise.resolve(this.downlink.return?.()).catch(() => void 0);
			}
			[Symbol.asyncIterator]() {
				if (this.consumed) throw new Error(`client api: ${this.endpoint} stream has one consumer`);
				this.consumed = true;
				const iteration = this.iterate();
				return {
					next: () => iteration.next(),
					return: (value) => {
						this.dispose();
						return iteration.return(value);
					}
				};
			}
			async *iterate() {
				try {
					while (true) {
						const next = await (this.primed ?? this.downlink.next());
						this.primed = void 0;
						if (this.disposed || next.done === true) return;
						if (!mountActive(this.token)) throw new Error(withdrawn(this.endpoint).error.message);
						yield next.value;
					}
				} catch (error) {
					if (this.disposed) return;
					throw error;
				} finally {
					this.dispose();
					await this.downlink.return?.();
				}
			}
		};
		var RemoteNamespaceService = class RemoteNamespaceService extends _deepseek_ai_cordis.Service {
			invokeRemote;
			methods = /* @__PURE__ */ new Map();
			namespace;
			static assertMethodAvailable(namespace, method) {
				if (REMOTE_NAMESPACE_FIELDS.has(method) || method in RemoteNamespaceService.prototype) throw new Error(`client api: method ${JSON.stringify(`${namespace}/${method}`)} conflicts with its namespace service`);
			}
			constructor(ctx, name, invokeRemote) {
				super(ctx, remoteServiceKey(name));
				this.invokeRemote = invokeRemote;
				this.namespace = name;
			}
			assertMethodAvailable(method) {
				RemoteNamespaceService.assertMethodAvailable(this.namespace, method);
				if (method in this && !this.methods.has(method)) throw new Error(`client api: method ${JSON.stringify(`${this.namespace}/${method}`)} conflicts with its namespace service`);
			}
			get empty() {
				return this.methods.size === 0;
			}
			has(kind, method) {
				return this.methods.get(method)?.[kind] !== void 0;
			}
			installDirect(descriptor, token) {
				this.install(descriptor.method, "direct", {
					descriptor,
					token
				});
			}
			installScoped(descriptor, projection, token) {
				this.install(descriptor.method, "scoped", {
					descriptor,
					projection,
					token
				});
			}
			install(method, kind, value) {
				this.assertMethodAvailable(method);
				let record = this.methods.get(method);
				const fresh = record === void 0;
				record ??= {};
				if (fresh) {
					Object.defineProperty(this, method, {
						configurable: true,
						enumerable: true,
						get: function() {
							const callerCtx = this.ctx;
							const current = this.methods.get(method);
							const direct = current?.direct;
							const scoped = current?.scoped;
							return (...args) => {
								return this.invokeRemote(direct, scoped, callerCtx, args);
							};
						}
					});
					this.methods.set(method, record);
				}
				if (kind === "direct") record.direct = value;
				else record.scoped = value;
			}
			remove(kind, method, token) {
				const record = this.methods.get(method);
				const current = record?.[kind];
				/* v8 ignore next -- duplicate live variants are rejected before installation, so no newer token can replace this one. */
				if (record === void 0 || current?.token !== token) return;
				if (kind === "direct") delete record.direct;
				else delete record.scoped;
				if (record.direct !== void 0 || record.scoped !== void 0) return;
				this.methods.delete(method);
				Reflect.deleteProperty(this, method);
			}
		};
		/**
		* Install one descriptor group on a namespace service, unwinding the partial
		* group when a descriptor is refused.
		* @param service - Namespace service taking the methods.
		* @param descriptors - Descriptor group of one contribution.
		* @returns per-descriptor records for the group disposer.
		*/
		function installMethods(service, descriptors) {
			const installed = [];
			try {
				for (const descriptor of descriptors) {
					const method = {
						descriptor,
						token: {
							active: true,
							abort: new AbortController()
						},
						direct: false,
						scoped: false
					};
					installed.push(method);
					if (descriptor.invocation.kind === "direct") {
						service.installDirect(descriptor, method.token);
						method.direct = true;
					}
					const projection = scopedProjection(descriptor);
					if (projection !== void 0) {
						service.installScoped(descriptor, projection, method.token);
						method.scoped = true;
					}
				}
			} catch (error) {
				for (const method of [...installed].reverse()) {
					method.token.active = false;
					method.token.abort.abort();
					if (method.scoped) service.remove("scoped", method.descriptor.method, method.token);
					if (method.direct) service.remove("direct", method.descriptor.method, method.token);
				}
				throw error;
			}
			return installed;
		}
		const REMOTE_NAMESPACE_FIELDS = new Set([
			"ctx",
			"empty",
			"invokeRemote",
			"methods",
			"name",
			"namespace"
		]);
		function remoteServiceKey(namespace) {
			return `remote.${namespace}`;
		}
		function endpointOf(descriptor) {
			return `${descriptor.namespace}/${descriptor.method}`;
		}
		function mountActive(token) {
			return token.active;
		}
		function scopedProjection(descriptor) {
			if (descriptor.invocation.kind === "context") return {
				context: descriptor.invocation.context,
				wire: descriptor.invocation.wire
			};
			if (descriptor.scope === void 0) return void 0;
			const lookupParameters = descriptor.parameters.map((parameter, index) => ({
				parameter,
				index
			})).filter((candidate) => candidate.parameter.source === "lookup");
			const selected = lookupParameters.length === 1 ? lookupParameters[0] : void 0;
			if (selected === void 0 || selected.parameter.wire !== descriptor.scope.wire || selected.parameter.lookup !== descriptor.scope.context) throw new Error(`client api: generated Remote ${endpointOf(descriptor)} scope must select its only lookup parameter`);
			return {
				context: descriptor.scope.context,
				wire: descriptor.scope.wire,
				parameterIndex: selected.index
			};
		}
		function requireStrictInputs(descriptor) {
			const endpoint = endpointOf(descriptor);
			for (const parameter of descriptor.parameters) requireStrictCodec(parameter.codec, endpoint, parameter.wire);
			if (descriptor.uplink !== void 0) requireStrictCodec(descriptor.uplink.codec, endpoint, "uplink");
			if (descriptor.invocation.kind === "context") requireStrictCodec(descriptor.invocation.codec, endpoint, descriptor.invocation.wire);
		}
		function requireStrictCodec(codec, endpoint, field) {
			if (codec.mode !== "strict") throw new Error(`client api: generated Remote ${endpoint} field ${JSON.stringify(field)} has no strict codec`);
		}
		/** The namespace retired before or during the call, so no request outcome exists. */
		function withdrawn(endpoint) {
			return internalFailure(`client api: Remote method ${endpoint} is no longer mounted`);
		}
		/**
		* The error branch a carrier throw (offline, transport fault) folds into: `gateway/internal` naming the endpoint and
		* the thrown message. Exported so a stand-in for this face folds identically.
		* @param endpoint - `<namespace>/<method>` that was called.
		* @param error - what the carrier threw.
		* @returns the failed result.
		*/
		function carrierFailure(endpoint, error) {
			return internalFailure(`client api: ${endpoint} failed: ${error instanceof Error ? error.message : String(error)}`);
		}
		/**
		* The error branch a call aborted by its caller folds into: `gateway/cancelled` with the carrier's throw as `cause`.
		* @param endpoint - `<namespace>/<method>` that was called.
		* @param cause - what the carrier threw when the signal aborted.
		* @returns the failed result.
		*/
		function cancelledFailure(endpoint, cause) {
			return {
				ok: false,
				error: new RemoteError("gateway/cancelled", `client api: Remote invocation "${endpoint}" was aborted`, {}, { cause })
			};
		}
		function internalFailure(message) {
			return {
				ok: false,
				error: new RemoteError("gateway/internal", message, {})
			};
		}
		/**
		* Whether a caught value is a Remote failure this face delivered or threw.
		* The one consumer-facing discrimination point: marked instances carry their
		* Host code; anything else is a local fault the caller should let crash.
		* @param error - a caught value.
		* @returns true when the value narrows to RemoteFailure.
		*/
		function isRemoteFailure(error) {
			return remoteErrorOf(error) !== void 0;
		}
		/**
		* Rebuild the wire failure as a local RemoteError instance so the error branch
		* carries a real Error and `throw result.error` keeps throw semantics. The code
		* is passed through verbatim without runtime validation: a code outside this
		* Client's merged map still surfaces as-is, so a newer Host stays readable.
		*/
		function rebuiltFailure(error) {
			return new RemoteError(error.code, error.message, error.details);
		}
		/** Preserve Gateway error classes across a worker transport's separately bundled page half. */
		async function* normalizeConnectionStream(source) {
			try {
				yield* source;
			} catch (error) {
				if (!(error instanceof Error)) throw error;
				const marker = error.dshRemoteStreamFailure;
				if (marker?.kind === "remote") throw new RemoteError(marker.code, error.message, marker.details);
				if (marker?.kind === "carrier") throw new RemoteStreamCarrierError(error.message, { cause: error });
				throw error;
			}
		}
		//#endregion
		exports.RemoteJournalStream = RemoteJournalStream;
		exports.RemoteSnapshotStream = RemoteSnapshotStream;
		exports.RemoteStream = RemoteStream;
		exports.RemoteStreamCarrierError = RemoteStreamCarrierError;
		exports.apply = apply;
		exports.cancelledFailure = cancelledFailure;
		exports.carrierFailure = carrierFailure;
		exports.inject = inject;
		exports.isRemoteFailure = isRemoteFailure;
		return module.exports;
	}
});

//# sourceMappingURL=client.browser.js.map