window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-schedule",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react = require("react");
		let react_dom = require("react-dom");
		//#region lib/types/client/catalog-source.js
		/** Authoritative Schedule queries and deletion for Session and Host catalogs. */
		/**
		* Create a catalog whose Remote subscriptions follow its framework subscribers.
		* Mutations retain visible rows until an authoritative list read succeeds, and
		* each deletion resolves with its own outcome for the caller to report.
		* @param deps - Remote calls and invalidation subscriptions.
		* @returns observable catalog and component callbacks.
		*/
		function createCatalogSource(deps) {
			let snapshot = {
				records: [],
				status: "loading",
				deleting: [],
				settled: false,
				readRequest: 0,
				readSettled: 0
			};
			const listeners = /* @__PURE__ */ new Set();
			let disposers = [];
			let epoch = 0;
			let lifecycle = 0;
			const publish = (next) => {
				snapshot = next;
				for (const listener of listeners) listener();
			};
			const read = async (request, current) => {
				let result;
				try {
					result = await deps.list();
				} catch (_error) {
					if (current === epoch) publish({
						...snapshot,
						status: "error"
					});
					return;
				}
				if (current !== epoch) return;
				publish(result.ok ? {
					...snapshot,
					records: result.value,
					status: "ready",
					settled: true,
					readSettled: request
				} : {
					...snapshot,
					status: "error"
				});
			};
			let batching = false;
			let inFlight;
			let inFlightRequest = 0;
			const refresh = (supersede = false, since = 0) => {
				const request = snapshot.readRequest + 1;
				publish({
					...snapshot,
					status: "loading",
					readRequest: request
				});
				if (!supersede && batching && inFlight !== void 0 && inFlightRequest > since) return inFlight;
				if (!batching) {
					batching = true;
					Promise.resolve().then(() => {
						batching = false;
					});
				}
				const pending = read(request, ++epoch);
				inFlightRequest = request;
				inFlight = pending;
				pending.finally(() => {
					if (inFlight === pending) inFlight = void 0;
				});
				return pending;
			};
			const invalidate = () => {
				refresh(true);
			};
			const remove = async (id) => {
				if (snapshot.deleting.includes(id)) return "pending";
				const started = lifecycle;
				publish({
					...snapshot,
					deleting: [...snapshot.deleting, id]
				});
				let result;
				try {
					result = await deps.remove(id);
				} catch (_error) {
					if (started === lifecycle) publish({
						...snapshot,
						deleting: snapshot.deleting.filter((value) => value !== id)
					});
					return "failed";
				}
				if (started !== lifecycle) return result.ok ? "deleted" : "failed";
				publish({
					...snapshot,
					deleting: snapshot.deleting.filter((value) => value !== id)
				});
				if (result.ok) await refresh(true);
				return result.ok ? "deleted" : "failed";
			};
			return {
				hooks: { catalog: {
					getSnapshot: () => snapshot,
					subscribe(listener) {
						listeners.add(listener);
						if (listeners.size === 1) {
							lifecycle++;
							disposers = [deps.subscribeChanged(invalidate), deps.subscribeReset(invalidate)];
							invalidate();
						}
						return () => {
							listeners.delete(listener);
							if (listeners.size !== 0) return;
							for (const dispose of disposers) dispose();
							disposers = [];
							epoch++;
							lifecycle++;
							snapshot = {
								...snapshot,
								deleting: []
							};
						};
					}
				} },
				onDelete: remove,
				onRetry: (since = 0) => refresh(false, since)
			};
		}
		//#endregion
		//#region lib/types/client/clear-ended.js
		/**
		* Create the management page's bulk removal callback.
		*
		* The call names no task ids: the Host owns which rows are ended, and a
		* delivery can have moved the catalog between the confirmation and the
		* request. The readback follows the acknowledged removal and supersedes a read
		* issued before it, so the list follows the removal rather than a stale read.
		* @param deps - Remote removal and its catalog readback.
		* @returns a callback that resolves once the settled outcome is available.
		*/
		function createClearEnded(deps) {
			return async () => {
				let result;
				try {
					result = await deps.removeInactive();
				} catch (_error) {
					return { cleared: false };
				}
				if (!result.ok) return { cleared: false };
				await deps.refresh();
				return {
					cleared: true,
					count: result.value.deleted
				};
			};
		}
		//#endregion
		//#region ../../util/values/src/partial-json.ts
		/**
		* Lazily scanned view of one JSON object's top-level fields, built from text
		* that may still be streaming or from an already parsed object. Nothing is
		* scanned until a reader asks; the view remembers every question it answered
		* and reports changed answers when the owner refreshes for publication.
		* Used for model tool-call arguments: a row reads the fields it
		* cares about at whatever granularity it displays, at every stage of the call.
		* @module @deepseek-ai/dsh-util-values/src/partial-json
		*/
		const SIMPLE_ESCAPES = {
			"\"": "\"",
			"\\": "\\",
			"/": "/",
			b: "\b",
			f: "\f",
			n: "\n",
			r: "\r",
			t: "	"
		};
		const CONTENT_ESCAPE = /[\\\u0000-\u001f]/u;
		function isWhitespace(c) {
			return c === " " || c === "\n" || c === "\r" || c === "	";
		}
		function isHex(c) {
			return c >= "0" && c <= "9" || c >= "a" && c <= "f" || c >= "A" && c <= "F";
		}
		/**
		* The view. A streaming instance grows through {@link PartialArguments.append};
		* {@link PartialArguments.fromText} and {@link PartialArguments.fromObject} build
		* sealed instances over a finished call. Every reader is total: an absent or
		* differently typed field answers `undefined` (or `false`), never throws.
		*/
		var PartialArguments = class PartialArguments {
			/** The view of a call with no arguments available. */
			static EMPTY = PartialArguments.fromObject({});
			/**
			* View finished argument text without scanning it until a reader asks.
			* @param text - the complete argument JSON text.
			* @returns a sealed view.
			*/
			static fromText(text) {
				const view = new PartialArguments();
				view.append(text);
				view.sealed = true;
				return view;
			}
			/**
			* View an already parsed argument payload, such as a PTC dispatch object.
			* @param value - the parsed argument value.
			* @returns a sealed view; a non-object payload has no fields.
			*/
			static fromObject(value) {
				const view = new PartialArguments();
				view.object = typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
				view.sealed = true;
				return view;
			}
			/**
			* The source: text so far or a parsed object, plus whether it can still grow.
			* These are the only enumerable fields, so two views over the same source
			* compare equal structurally however far each has been read.
			*/
			chunks = [];
			object;
			sealed = false;
			#ends = [];
			#size = 0;
			#consumed = 0;
			#mode = "root";
			#escape = false;
			#keyStart = 0;
			#keyEscaped = false;
			#key = "";
			#current = null;
			#nestedEnds = [];
			#nestedInString = false;
			#invalidAt;
			#invalidValue = false;
			#entries = /* @__PURE__ */ new Map();
			#order = [];
			#reads = /* @__PURE__ */ new Map();
			/** Whether this view rejects further appends; does not scan text or register reads. */
			get isSealed() {
				return this.sealed;
			}
			/** Whether indexing or a content read found invalid JSON; unread value contents are not validated. */
			get invalid() {
				this.scan();
				return this.#mode === "invalid" || this.#invalidValue;
			}
			/**
			* Retain streamed argument text without scanning or comparing observed answers.
			* @param fragment - the text following every fragment appended before.
			*/
			append(fragment) {
				if (this.sealed) throw new Error("PartialArguments: cannot append to a sealed view");
				if (fragment.length === 0) return;
				this.chunks.push(fragment);
				this.#size += fragment.length;
				this.#ends.push(this.#size);
			}
			/**
			* Reconcile a streamed prefix with authoritative complete text without joining the fragments.
			* @param text - the final argument text, which replaces missing or conflicting deltas.
			* @returns this view sealed with its caches retained when every character matches; otherwise a new sealed view.
			*/
			settle(text) {
				if (this.object !== void 0 || text.length !== this.#size) return PartialArguments.fromText(text);
				let offset = 0;
				for (const chunk of this.chunks) {
					if (!text.startsWith(chunk, offset)) return PartialArguments.fromText(text);
					offset += chunk.length;
				}
				this.chunks = text.length === 0 ? [] : [text];
				this.#ends = text.length === 0 ? [] : [text.length];
				this.sealed = true;
				return this;
			}
			/**
			* Compare observed answers and advance their publication baseline. Unread views remain unscanned.
			* @returns whether any observed answer changed since its first read or the preceding refresh.
			*/
			refresh() {
				if (this.#reads.size === 0) return false;
				this.scan();
				let changed = false;
				let completions = false;
				for (const read of this.#reads.values()) {
					if (read.completion) {
						completions = true;
						continue;
					}
					changed = this.refreshRead(read) || changed;
				}
				if (completions) {
					for (const read of this.#reads.values()) if (read.completion) changed = this.refreshRead(read) || changed;
				}
				if (this.sealed) this.#reads.clear();
				return changed;
			}
			refreshRead(read) {
				const now = read.answer();
				if (Object.is(now, read.last)) return false;
				read.last = now;
				return true;
			}
			/**
			* Check whether no further fields can arrive.
			* @returns whether the outer object closed, indexing failed, or the view is sealed; unread values are not validated.
			*/
			closed() {
				return this.remember("closed", "", () => this.closedNow());
			}
			/**
			* List discovered fields in first-appearance order.
			* @returns top-level keys seen so far, in first-appearance order.
			*/
			keys() {
				return this.remember("keys", "", () => this.keysNow(), (keys) => keys.length);
			}
			/**
			* Check whether a top-level field has appeared.
			* @param key - argument name.
			* @returns whether the field has appeared (a string opened or another value began).
			*/
			has(key) {
				return this.remember("has", key, () => this.hasNow(key));
			}
			/**
			* Check whether a field's closing delimiter has arrived, without validating its contents.
			* @param key - argument name.
			* @returns whether its delimiter arrived and no content reader has reported an error for this value.
			*/
			complete(key) {
				return this.remember("complete", key, () => this.completeNow(key));
			}
			/**
			* Read string length without materializing its text.
			* @param key - argument name.
			* @param options - change granularity for a streaming string.
			* @returns decoded UTF-16 length of the string field so far; undefined when absent or not a string.
			*/
			stringLength(key, options) {
				const step = Math.max(1, Math.floor(options?.step ?? 1));
				const offset = options?.offset ?? 0;
				return this.remember(`length:${step}:${offset}`, key, () => this.lengthNow(key), (length) => length === void 0 ? void 0 : Math.ceil((length + offset) / step));
			}
			/**
			* Check a string against a decoded UTF-16 length limit without materializing it.
			* @param key - argument name.
			* @param maxLength - decoded UTF-16 limit, floored to at least zero.
			* @returns whether the string is longer than the limit; false when absent or not a string.
			*/
			stringExceeds(key, maxLength) {
				const limit = Math.max(0, Math.floor(maxLength));
				return this.remember(`exceeds:${limit}`, key, () => (this.lengthNow(key, limit + 1) ?? 0) > limit);
			}
			/**
			* Read a decoded string, including a streaming prefix.
			* @param key - argument name.
			* @returns the string field's decoded text so far; undefined when absent or not a string.
			*/
			text(key) {
				return this.remember("text", key, () => this.textNow(key));
			}
			/**
			* Read at most the first decoded UTF-16 units of a string.
			* @param key - argument name.
			* @param maxLength - maximum decoded UTF-16 length, floored to at least one.
			* @returns the bounded string prefix; undefined when absent or not a string.
			*/
			textPrefix(key, maxLength) {
				const limit = Math.max(1, Math.floor(maxLength));
				return this.remember(`prefix:${limit}`, key, () => this.textPrefixNow(key, limit));
			}
			/**
			* Read a completed non-string argument.
			* @param key - argument name.
			* @returns the parsed non-string value once it closed; undefined while open, absent, or a string.
			*/
			value(key) {
				return this.remember("value", key, () => this.valueNow(key));
			}
			/** Answer a question and, on a streaming view, remember it for change detection. */
			remember(kind, key, read, comparison) {
				this.scan();
				const result = read();
				if (!this.sealed) {
					const id = `${kind}/${key}`;
					if (!this.#reads.has(id)) this.#reads.set(id, {
						completion: kind === "complete",
						answer: comparison === void 0 ? read : () => comparison(read()),
						last: comparison === void 0 ? result : comparison(result)
					});
				}
				return result;
			}
			closedNow() {
				return this.sealed || this.#mode === "closed" || this.#mode === "invalid";
			}
			keysNow() {
				return this.object === void 0 ? this.#order : Object.keys(this.object);
			}
			hasNow(key) {
				return this.object === void 0 ? this.#entries.has(key) : Object.hasOwn(this.object, key);
			}
			completeNow(key) {
				if (this.object !== void 0) return Object.hasOwn(this.object, key);
				const entry = this.#entries.get(key);
				return entry !== void 0 && entry.end >= 0 && (entry.kind === "string" ? entry.invalidAt === void 0 : !entry.invalid);
			}
			lengthNow(key, limit = Number.POSITIVE_INFINITY) {
				if (this.object !== void 0) {
					const field = Object.hasOwn(this.object, key) ? this.object[key] : void 0;
					return typeof field === "string" ? field.length : void 0;
				}
				const entry = this.#entries.get(key);
				if (entry?.kind !== "string") return void 0;
				if (entry.text !== void 0 && entry.text.at === entry.end) return entry.text.length;
				const read = entry.length ??= {
					at: entry.start,
					length: 0,
					text: ""
				};
				this.readString(entry, read, limit, false);
				return read.length;
			}
			textNow(key) {
				if (this.object !== void 0) {
					const field = Object.hasOwn(this.object, key) ? this.object[key] : void 0;
					return typeof field === "string" ? field : void 0;
				}
				const entry = this.#entries.get(key);
				if (entry?.kind !== "string") return void 0;
				if (entry.text === void 0 && entry.end >= 0 && entry.needsDecoding && entry.invalidAt === void 0) {
					let text;
					try {
						text = JSON.parse(`"${this.slice(entry.start, entry.end)}"`);
					} catch (_error) {}
					if (text !== void 0) entry.text = {
						at: entry.end,
						length: text.length,
						text
					};
				}
				const read = entry.text ??= {
					at: entry.start,
					length: 0,
					text: ""
				};
				this.readString(entry, read, Number.POSITIVE_INFINITY, true);
				return read.text;
			}
			textPrefixNow(key, maxLength) {
				if (this.object !== void 0) {
					const field = Object.hasOwn(this.object, key) ? this.object[key] : void 0;
					return typeof field === "string" ? field.slice(0, maxLength) : void 0;
				}
				const entry = this.#entries.get(key);
				if (entry?.kind !== "string") return void 0;
				const prefixes = entry.prefixes ??= /* @__PURE__ */ new Map();
				let read = prefixes.get(maxLength);
				if (read === void 0) {
					read = {
						at: entry.start,
						length: 0,
						text: ""
					};
					prefixes.set(maxLength, read);
				}
				this.readString(entry, read, maxLength, true);
				return read.text;
			}
			valueNow(key) {
				if (this.object !== void 0) {
					if (!Object.hasOwn(this.object, key)) return void 0;
					const field = this.object[key];
					return typeof field === "string" ? void 0 : field;
				}
				const entry = this.#entries.get(key);
				if (entry?.kind !== "value" || entry.end < 0 || entry.invalid) return void 0;
				if (entry.parsed === void 0) try {
					entry.parsed = JSON.parse(this.slice(entry.start, entry.end));
				} catch (_error) {
					entry.invalid = true;
					this.#invalidValue = true;
				}
				return entry.parsed;
			}
			chunkAt(at) {
				let low = 0;
				let high = this.#ends.length;
				while (low < high) {
					const mid = low + high >>> 1;
					if (this.#ends[mid] <= at) low = mid + 1;
					else high = mid;
				}
				return low;
			}
			/** Materialize only a requested range, never the cumulative source. */
			slice(start, end) {
				if (start >= end) return "";
				const first = this.chunkAt(start);
				const last = this.chunkAt(end - 1);
				const base = first === 0 ? 0 : this.#ends[first - 1];
				if (first === last) return this.chunks[first].slice(start - base, end - base);
				const parts = [this.chunks[first].slice(start - base)];
				for (let i = first + 1; i < last; i++) parts.push(this.chunks[i]);
				parts.push(this.chunks[last].slice(0, end - this.#ends[last - 1]));
				return parts.join("");
			}
			readString(entry, read, limit, materialize) {
				const end = Math.min(entry.end < 0 ? this.#consumed : entry.end, entry.invalidAt ?? Number.POSITIVE_INFINITY, this.#invalidAt ?? Number.POSITIVE_INFINITY);
				if (!entry.needsDecoding) {
					const length = Math.min(end - read.at, limit - read.length);
					if (length <= 0) return;
					if (materialize) read.text += this.slice(read.at, read.at + length);
					read.at += length;
					read.length += length;
					return;
				}
				let chunkIndex = this.chunkAt(read.at);
				while (read.at < end && read.length < limit) {
					const base = chunkIndex === 0 ? 0 : this.#ends[chunkIndex - 1];
					const chunk = this.chunks[chunkIndex];
					const remaining = chunk.slice(read.at - base, Math.min(chunk.length, end - base));
					const boundary = remaining.search(CONTENT_ESCAPE);
					const length = Math.min(boundary < 0 ? remaining.length : boundary, limit - read.length);
					if (length > 0) {
						if (materialize) read.text += remaining.slice(0, length);
						read.at += length;
						read.length += length;
						if (read.at === base + chunk.length) chunkIndex++;
						continue;
					}
					const type = remaining.length > 1 ? remaining[1] : read.at + 1 < end ? this.chunks[chunkIndex + 1][0] : void 0;
					let decoded;
					let width = 2;
					if (remaining[0] === "\\" && type === void 0 && entry.end < 0) return;
					if (remaining[0] === "\\" && type === "u") {
						const hex = this.slice(read.at + 2, Math.min(end, read.at + 6));
						let valid = true;
						for (let i = 0; i < hex.length; i++) if (!isHex(hex[i])) valid = false;
						if (valid) {
							if (hex.length < 4 && entry.end < 0) return;
							if (hex.length === 4) decoded = String.fromCharCode(Number.parseInt(hex, 16));
						}
						width = 6;
					} else if (remaining[0] === "\\" && type !== void 0) decoded = SIMPLE_ESCAPES[type];
					if (decoded === void 0) {
						entry.invalidAt = read.at;
						this.#invalidValue = true;
						return;
					}
					if (materialize) read.text += decoded;
					read.length++;
					read.at += width;
					while (chunkIndex < this.chunks.length && read.at >= this.#ends[chunkIndex]) chunkIndex++;
				}
			}
			/** Locate new field ranges without decoding or parsing their contents. */
			scan() {
				if (this.object !== void 0 || this.#consumed === this.#size) return;
				for (let i = this.chunkAt(this.#consumed); i < this.chunks.length && this.#invalidAt === void 0; i++) {
					const pending = this.chunks[i];
					const base = i === 0 ? 0 : this.#ends[i - 1];
					for (let index = this.#consumed - base; index < pending.length && this.#mode !== "invalid"; index++) {
						if (this.#mode === "string" || this.#mode === "nested" && this.#nestedInString) {
							const end = this.stringBoundary(pending, index);
							this.#consumed += end - index;
							index = end;
							if (index === pending.length) break;
						}
						this.step(pending[index], this.#consumed);
						this.#consumed++;
					}
				}
			}
			/** Only raw quotes and their preceding backslash runs can terminate a string. */
			stringBoundary(fragment, start) {
				let at = start;
				while (true) {
					const quote = fragment.indexOf("\"", at);
					const end = quote < 0 ? fragment.length : quote;
					if (this.#mode === "string") {
						const entry = this.#current;
						if (!entry.needsDecoding && CONTENT_ESCAPE.test(fragment.slice(at, end))) entry.needsDecoding = true;
					}
					let slashStart = end;
					while (slashStart > at && fragment[slashStart - 1] === "\\") slashStart--;
					const escaped = (end - slashStart) % 2 === 1 !== (slashStart === at && this.#escape);
					this.#escape = quote < 0 && escaped;
					if (quote < 0 || !escaped) return end;
					at = quote + 1;
				}
			}
			step(c, at) {
				switch (this.#mode) {
					case "root":
						if (isWhitespace(c)) return;
						if (c === "{") {
							this.#mode = "key-or-end";
							return;
						}
						this.fail();
						return;
					case "key-or-end":
						if (isWhitespace(c)) return;
						if (c === "}") {
							this.#mode = "closed";
							return;
						}
						if (c === "\"") {
							this.beginKey(at);
							return;
						}
						this.fail();
						return;
					case "key-only":
						if (isWhitespace(c)) return;
						if (c === "\"") {
							this.beginKey(at);
							return;
						}
						this.fail();
						return;
					case "key":
						this.stepKey(c, at);
						return;
					case "colon":
						if (isWhitespace(c)) return;
						if (c === ":") {
							this.#mode = "value";
							return;
						}
						this.fail();
						return;
					case "value":
						this.beginValue(c, at);
						return;
					case "string": {
						const entry = this.#current;
						entry.end = at;
						this.#current = null;
						this.#mode = "comma-or-end";
						return;
					}
					case "scalar":
						this.stepScalar(c, at);
						return;
					case "nested":
						this.stepNested(c, at);
						return;
					case "comma-or-end":
						if (isWhitespace(c)) return;
						if (c === ",") {
							this.#mode = "key-only";
							return;
						}
						if (c === "}") {
							this.#mode = "closed";
							return;
						}
						this.fail();
						return;
					case "closed":
						if (isWhitespace(c)) return;
						this.fail();
						return;
					/* v8 ignore next 2 -- scan() stops stepping once the view is invalid. */
					case "invalid": return;
					/* v8 ignore next 2 -- Every scanner mode has a handler above. */
					default: assertNever(this.#mode);
				}
			}
			fail() {
				this.#invalidAt = this.#consumed;
				this.#mode = "invalid";
				this.#current = null;
			}
			beginKey(at) {
				this.#mode = "key";
				this.#keyStart = at + 1;
				this.#keyEscaped = false;
				this.#escape = false;
			}
			stepKey(c, at) {
				if (c < " ") {
					this.fail();
					return;
				}
				if (this.#escape) {
					this.#escape = false;
					return;
				}
				if (c === "\\") {
					this.#escape = true;
					this.#keyEscaped = true;
					return;
				}
				if (c !== "\"") return;
				const raw = this.slice(this.#keyStart, at);
				if (this.#keyEscaped) try {
					this.#key = JSON.parse(`"${raw}"`);
				} catch (_error) {
					this.fail();
					return;
				}
				else this.#key = raw;
				this.#mode = "colon";
			}
			open(entry) {
				if (!this.#entries.has(this.#key)) this.#order.push(this.#key);
				this.#entries.set(this.#key, entry);
				this.#current = entry;
			}
			beginValue(c, at) {
				if (isWhitespace(c)) return;
				if (c === "\"") {
					this.open({
						kind: "string",
						start: at + 1,
						end: -1,
						needsDecoding: false,
						invalidAt: void 0,
						length: void 0,
						text: void 0,
						prefixes: void 0
					});
					this.#escape = false;
					this.#mode = "string";
					return;
				}
				if (c === "}" || c === "," || c === ":" || c === "]") {
					this.fail();
					return;
				}
				this.open({
					kind: "value",
					start: at,
					end: -1,
					parsed: void 0,
					invalid: false
				});
				if (c === "{" || c === "[") {
					this.#mode = "nested";
					this.#nestedEnds = [c === "{" ? "}" : "]"];
					this.#nestedInString = false;
					this.#escape = false;
					return;
				}
				this.#mode = "scalar";
			}
			stepScalar(c, at) {
				if (c !== "," && c !== "}" && !isWhitespace(c)) return;
				this.closeValue(at);
				this.#mode = c === "," ? "key-only" : c === "}" ? "closed" : "comma-or-end";
			}
			stepNested(c, at) {
				if (this.#nestedInString) {
					this.#nestedInString = false;
					return;
				}
				if (c === "\"") {
					this.#nestedInString = true;
					return;
				}
				if (c === "{" || c === "[") {
					this.#nestedEnds.push(c === "{" ? "}" : "]");
					return;
				}
				if (c === "}" || c === "]") {
					if (this.#nestedEnds.pop() !== c) {
						this.fail();
						return;
					}
					if (this.#nestedEnds.length === 0) {
						this.closeValue(at + 1);
						this.#mode = "comma-or-end";
					}
				}
			}
			closeValue(end) {
				const entry = this.#current;
				entry.end = end;
				this.#current = null;
			}
		};
		//#endregion
		//#region ../../util/values/src/index.ts
		/**
		* Mark an unreachable closed-union branch.
		* @param value - impossible value; an unhandled typed variant fails at the call site.
		* @param context - optional switch-site label included in the failure message.
		* @returns never; a runtime value that escaped its type always throws.
		*/
		function assertNever(value, context) {
			const rendered = JSON.stringify(value) ?? String(value);
			throw new Error(`unreachable variant${context ? ` in ${context}` : ""}: ${rendered}`);
		}
		//#endregion
		//#region lib/types/client/DeleteToast.js
		/**
		* Create the one deletion-outcome store the overlay entry shows.
		* @returns the observable notice with its report and dismiss actions.
		*/
		function createDeleteToastSource() {
			let state = null;
			let seq = 0;
			const listeners = /* @__PURE__ */ new Set();
			const publish = (next) => {
				state = next;
				for (const listener of listeners) listener();
			};
			return {
				hooks: { toast: {
					getSnapshot: () => state,
					subscribe(listener) {
						listeners.add(listener);
						return () => {
							listeners.delete(listener);
						};
					}
				} },
				report: (outcome) => {
					if (outcome === "pending") return;
					publish({
						kind: outcome === "deleted" ? "deleted" : "deleteFailed",
						seq: ++seq
					});
				},
				reportClear: (outcome) => {
					publish(outcome.cleared ? {
						kind: "cleared",
						count: outcome.count,
						seq: ++seq
					} : {
						kind: "clearFailed",
						seq: ++seq
					});
				},
				dismiss: () => {
					publish(null);
				}
			};
		}
		/**
		* Render the current deletion notice: a success banner for a confirmed deletion
		* or settled bulk removal, a warning for one that could not be confirmed, or
		* nothing.
		* @param props - the notice hook, its dismissal, and the locale seat.
		* @returns the banner on display, or null.
		*/
		function ScheduleDeleteToast({ useToast, dismiss, t }) {
			const toast = useToast((current) => current);
			if (toast === null) return null;
			const key = `schedule-delete-${String(toast.seq)}`;
			switch (toast.kind) {
				case "deleted": return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: t("toast.deleted"),
					tone: "success",
					onDone: dismiss
				}, key);
				case "deleteFailed": return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: t("toast.deleteFailed"),
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
					onDone: dismiss
				}, key);
				case "cleared": return toast.count === 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: t("toast.clearedNone"),
					onDone: dismiss
				}, key) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: t(toast.count === 1 ? "toast.cleared.one" : "toast.cleared.other", { count: toast.count }),
					tone: "success",
					onDone: dismiss
				}, key);
				case "clearFailed": return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: t("toast.clearFailed"),
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
					onDone: dismiss
				}, key);
				/* v8 ignore next -- the store publishes only the union's members, so the default holds no reachable statement. */
				default: return assertNever(toast);
			}
		}
		//#endregion
		//#region lib/types/client/definition.js
		/** This implementation's identity in the tab system: the key its body and title register under. */
		const SCHEDULE_TASK_ID = "@deepseek-ai/dsh-client-ui-schedule/task";
		/** The tab kind this package owns. */
		const SCHEDULE_TASK_KIND = "scheduleTask";
		/**
		* The task type's registry definition.
		*
		* The chip text captured here is a constant because an open names only a kind;
		* `ScheduleTaskTabTitle` replaces it with the shown task's stored title.
		* @param t - namespace-bound translate, read fresh on every title call.
		* @returns the definition to register.
		*/
		function scheduleTaskDefinition(t) {
			return {
				id: SCHEDULE_TASK_ID,
				kind: SCHEDULE_TASK_KIND,
				priority: "builtin",
				title: () => t("detail.label")
			};
		}
		/**
		* Narrow one tab's navigation parameters to this type's task binding.
		* @param params - the tab record's navigation parameters.
		* @returns the Session and task the tab shows, or undefined for another type's parameters.
		*/
		function scheduleTaskParams(params) {
			if (params === void 0 || !("sessionId" in params) || !("id" in params)) return void 0;
			return {
				sessionId: params.sessionId,
				id: params.id
			};
		}
		//#endregion
		//#region lib/types/client/task-cron.js
		/**
		* Client-side parsing, description, and structured shapes of the five-field
		* cron expressions the Run time card edits.
		*
		* The Host owns canonicalization, occurrence selection, and dispatch. This
		* module parses the same dialect so the card can reject a malformed expression
		* locally, describe a valid one without a Host round trip, and recognize the
		* common shapes the card's cron builder edits as structured rows.
		*/
		/** Field bounds of the supported dialect, in `minute hour day-of-month month day-of-week` order. */
		const CRON_FIELDS = [
			{
				min: 0,
				max: 59,
				count: 60
			},
			{
				min: 0,
				max: 23,
				count: 24
			},
			{
				min: 1,
				max: 31,
				count: 31
			},
			{
				min: 1,
				max: 12,
				count: 12
			},
			{
				min: 0,
				max: 7,
				count: 7,
				foldMax: 7
			}
		];
		/** One stepped element over the whole field. */
		const CRON_STEP = /^\*\/(?<step>\d+)$/;
		/** One value, range, or range with step. */
		const CRON_ELEMENT = /^(?<start>\d+)(?:-(?<end>\d+))?(?:\/(?<step>\d+))?$/;
		/** ISO weekday dictionary keys indexed by ISO weekday minus one. */
		const CRON_WEEKDAY_KEYS = [
			"frequency.weekday.1",
			"frequency.weekday.2",
			"frequency.weekday.3",
			"frequency.weekday.4",
			"frequency.weekday.5",
			"frequency.weekday.6",
			"frequency.weekday.7"
		];
		/** Most clock times the description spells out before it names minutes and hours instead. */
		const CRON_TIME_LIST_LIMIT = 6;
		/**
		* List one inclusive arithmetic range.
		* @param from - first value.
		* @param to - last value.
		* @param step - positive increment.
		* @returns ascending values from `from` through `to`.
		*/
		function ascendingRange(from, to, step) {
			const values = [];
			for (let value = from; value <= to; value += step) values.push(value);
			return values;
		}
		/**
		* Read one in-range field element value.
		* @param text - digits of one element value.
		* @param spec - bounds of the field it belongs to.
		* @returns the value, or undefined when it is outside the field.
		*/
		function cronValue(text, spec) {
			const value = Number(text);
			return Number.isSafeInteger(value) && value >= spec.min && value <= spec.max ? value : void 0;
		}
		/**
		* Read one positive field step.
		* @param text - digits of one step.
		* @returns the step, or undefined when it is not a positive safe integer.
		*/
		function cronStep(text) {
			const value = Number(text);
			return Number.isSafeInteger(value) && value >= 1 ? value : void 0;
		}
		/**
		* Expand one comma-separated element into the values it matches.
		* @param element - one element of a field.
		* @param spec - bounds of the field it belongs to.
		* @returns matched values, or undefined when the Host would reject the element.
		*/
		function cronElementValues(element, spec) {
			if (element.length === 0) return void 0;
			if (element === "*") return ascendingRange(spec.min, spec.max, 1);
			if (element.startsWith("*")) {
				const groups = CRON_STEP.exec(element)?.groups;
				if (groups === void 0) return void 0;
				const stepText = groups["step"];
				/* v8 ignore next -- a successful fixed regex always provides the step group. */
				if (stepText === void 0) return void 0;
				const step = cronStep(stepText);
				return step === void 0 ? void 0 : ascendingRange(spec.min, spec.max, step);
			}
			const groups = CRON_ELEMENT.exec(element)?.groups;
			if (groups === void 0) return void 0;
			const startText = groups["start"];
			/* v8 ignore next -- a successful fixed regex always provides the start group. */
			if (startText === void 0) return void 0;
			const start = cronValue(startText, spec);
			if (start === void 0) return void 0;
			const end = groups["end"];
			if (end === void 0) return groups["step"] === void 0 ? [start] : void 0;
			const last = cronValue(end, spec);
			if (last === void 0 || start > last) return void 0;
			const stepText = groups["step"];
			const step = stepText === void 0 ? 1 : cronStep(stepText);
			return step === void 0 ? void 0 : ascendingRange(start, last, step);
		}
		/**
		* Expand one whitespace-free cron field into its matched value set.
		* @param raw - one field of the expression.
		* @param spec - bounds of that field.
		* @returns unique ascending values with Sunday folded, or undefined when malformed.
		*/
		function cronFieldValues(raw, spec) {
			const matched = /* @__PURE__ */ new Set();
			for (const element of raw.split(",")) {
				const values = cronElementValues(element, spec);
				if (values === void 0) return void 0;
				for (const value of values) matched.add(value === spec.foldMax ? spec.min : value);
			}
			return [...matched].sort((left, right) => left - right);
		}
		/**
		* Failure reading a value the cron parser's own matching already proved present.
		*/
		/* v8 ignore next -- constructed only by the unreachable bounds guard below. */
		var CronInvariantError = class extends Error {
			/**
			* Construct an invariant failure.
			* @param message - violated invariant.
			*/
			constructor(message) {
				super(message);
				this.name = "CronInvariantError";
			}
		};
		/**
		* Read one array element the caller's own length guard already bounds.
		* @param values - array whose length the caller checked.
		* @param index - index inside that length.
		* @returns the element at that index.
		*/
		function cronElementAt(values, index) {
			const value = values[index];
			/* v8 ignore next -- every caller reads an index inside an array length it already proved. */
			if (value === void 0) throw new CronInvariantError("cron description read an index outside its array");
			return value;
		}
		/**
		* Parse one five-field cron expression in the dialect the Host accepts.
		* @param expression - candidate `minute hour day-of-month month day-of-week` text.
		* @returns parsed fields, or undefined when the Host would reject the expression.
		*/
		function parseCronExpression(expression) {
			if (expression.length === 0 || expression.trim() !== expression) return void 0;
			const fields = expression.split(/\s+/);
			if (fields.length !== 5) return void 0;
			const [minutes, hours, daysOfMonth, months, daysOfWeek] = fields.map((field, index) => {
				const spec = cronElementAt(CRON_FIELDS, index);
				const values = cronFieldValues(field, spec);
				return values === void 0 ? void 0 : (() => {
					const starred = field.startsWith("*");
					const full = values.length === spec.count;
					return {
						values,
						starred,
						full,
						unrestricted: starred && full
					};
				})();
			});
			if (minutes === void 0 || hours === void 0 || daysOfMonth === void 0 || months === void 0 || daysOfWeek === void 0) return void 0;
			return {
				minutes,
				hours,
				daysOfMonth,
				months,
				daysOfWeek
			};
		}
		/**
		* Zero one field value to two digits.
		* @param value - number to spell.
		* @returns the value padded to at least two digits.
		*/
		function twoDigits(value) {
			return String(value).padStart(2, "0");
		}
		/**
		* Split ascending values into runs of consecutive numbers.
		* @param values - unique ascending values.
		* @returns the runs, each ascending, in value order.
		*/
		function consecutiveRuns(values) {
			const runs = [];
			for (const value of values) {
				const run = runs[runs.length - 1];
				if (run !== void 0 && cronElementAt(run, run.length - 1) + 1 === value) run.push(value);
				else runs.push([value]);
			}
			return runs;
		}
		/**
		* Join one list of numbers with the localized list separator.
		* @param values - numbers to spell.
		* @param t - cron translations supplying the separator.
		* @returns the localized list.
		*/
		function numberList(values, t) {
			return values.map(String).join(t("cron.list.join"));
		}
		/**
		* Render cron weekdays as localized names, collapsing a run of three or more
		* consecutive days into one range.
		* @param values - cron weekdays, Sunday 0 through Saturday 6, ascending.
		* @param t - cron and weekday translations.
		* @returns localized weekday text, for example `Mon–Fri` or `Mon, Wed`.
		*/
		function cronWeekdayText(values, t) {
			const join = t("cron.list.join");
			const name = (day) => t("cron.weekday.name", { weekday: t(cronElementAt(CRON_WEEKDAY_KEYS, day - 1)) });
			return consecutiveRuns(values.map((value) => value === 0 ? 7 : value).sort((left, right) => left - right)).map((run) => run.length >= 3 ? t("cron.weekday.range", {
				from: name(cronElementAt(run, 0)),
				to: name(cronElementAt(run, run.length - 1))
			}) : run.map(name).join(join)).join(join);
		}
		/**
		* Name the months a rule restricts, or nothing when it matches every month.
		* @param values - matched months, January 1 through December 12.
		* @param locale - active UI locale naming the months.
		* @param t - cron translations.
		* @returns localized month suffix, or an empty string for all twelve months.
		*/
		function cronMonthSuffix(values, locale, t) {
			if (values.length === 12) return "";
			const format = new Intl.DateTimeFormat(locale, {
				month: "long",
				timeZone: "UTC"
			});
			return t("cron.months", { months: values.map((month) => format.format(Date.UTC(2026, month - 1, 1))).join(t("cron.list.join")) });
		}
		/**
		* Describe the days one parsed rule matches.
		* @param parsed - parsed cron expression.
		* @param locale - active UI locale naming restricted months.
		* @param t - cron translations.
		* @returns whether the phrase states no day restriction at all, and the localized day phrase.
		*/
		function cronDayText(parsed, locale, t) {
			const months = cronMonthSuffix(parsed.months.values, locale, t);
			const weekdays = cronWeekdayText(parsed.daysOfWeek.values, t);
			const params = {
				days: numberList(parsed.daysOfMonth.values, t),
				weekdays,
				months
			};
			const dayOfMonth = parsed.daysOfMonth;
			const dayOfWeek = parsed.daysOfWeek;
			if (dayOfMonth.starred || dayOfWeek.starred) {
				if (dayOfMonth.full && dayOfWeek.full) return {
					everyDay: months === "",
					text: t("cron.day.every", { months })
				};
				if (dayOfMonth.full) return {
					everyDay: false,
					text: t("cron.day.weekdays", params)
				};
				if (dayOfWeek.full) return {
					everyDay: false,
					text: t("cron.day.monthDays", params)
				};
				return {
					everyDay: false,
					text: t("cron.day.bothStarred", params)
				};
			}
			if (dayOfMonth.full || dayOfWeek.full) return {
				everyDay: months === "",
				text: t("cron.day.every", { months })
			};
			return {
				everyDay: false,
				text: t("cron.day.both", params)
			};
		}
		/**
		* Name a restricted hour set as a contiguous range or an explicit list.
		* @param values - matched hours, ascending.
		* @param t - cron translations.
		* @returns localized hour scope, for example `09–17` or `09, 15`.
		*/
		function cronHourText(values, t) {
			const hours = values.map(twoDigits);
			return hours.length >= 2 && cronElementAt(values, values.length - 1) - cronElementAt(values, 0) === values.length - 1 ? t("cron.hours.range", {
				from: cronElementAt(hours, 0),
				to: cronElementAt(hours, hours.length - 1)
			}) : t("cron.hours.list", { hours: hours.join(t("cron.list.join")) });
		}
		/**
		* Read the uniform step of a field that covers its whole range.
		* @param values - unique ascending matched values.
		* @param min - lowest value of the field.
		* @param max - highest value of the field.
		* @returns the step when the values cover the whole field in equal increments, otherwise undefined.
		*/
		function cronFullRangeStep(values, min, max) {
			if (values.length < 2) return void 0;
			const first = cronElementAt(values, 0);
			if (first !== min) return void 0;
			const step = cronElementAt(values, 1) - first;
			for (let index = 1; index < values.length; index += 1) if (cronElementAt(values, index) - cronElementAt(values, index - 1) !== step) return void 0;
			return cronElementAt(values, values.length - 1) + step > max ? step : void 0;
		}
		/**
		* Describe the times of day one parsed rule matches.
		*
		* `interval` marks the phrases that state the repetition themselves; they read
		* as a whole sentence on their own and need the lower-case `joined` wording
		* when a day phrase precedes them.
		* @param parsed - parsed cron expression.
		* @param t - cron translations.
		* @returns whether the phrase states the repeating interval itself, its standalone
		* text, and its text after a day phrase.
		*/
		function cronTimeText(parsed, t) {
			const step = parsed.minutes.unrestricted ? void 0 : cronFullRangeStep(parsed.minutes.values, 0, 59);
			if (parsed.hours.unrestricted) {
				if (parsed.minutes.unrestricted) return {
					interval: true,
					text: t("cron.time.everyMinute"),
					joined: t("cron.time.joinedEveryMinute")
				};
				if (step !== void 0 && step >= 2) return {
					interval: true,
					text: t("cron.time.everyMinutes", { step }),
					joined: t("cron.time.joinedEveryMinutes", { step })
				};
				if (parsed.minutes.values.length === 1 && cronElementAt(parsed.minutes.values, 0) === 0) return {
					interval: true,
					text: t("cron.time.everyHour"),
					joined: t("cron.time.joinedEveryHour")
				};
				return {
					interval: false,
					text: t("cron.time.hourlyAt", { minutes: numberList(parsed.minutes.values, t) }),
					joined: t("cron.time.joinedHourlyAt", { minutes: numberList(parsed.minutes.values, t) })
				};
			}
			const hours = cronHourText(parsed.hours.values, t);
			if (parsed.minutes.unrestricted) {
				const text = t("cron.time.hoursEveryMinute", { hours });
				return {
					interval: false,
					text,
					joined: text
				};
			}
			if (step !== void 0 && step >= 2) {
				const text = t("cron.time.hoursEveryMinutes", {
					hours,
					step
				});
				return {
					interval: false,
					text,
					joined: text
				};
			}
			const hourStep = cronFullRangeStep(parsed.hours.values, 0, 23);
			if (parsed.minutes.values.length === 1 && cronElementAt(parsed.minutes.values, 0) === 0 && hourStep !== void 0 && hourStep >= 2) return {
				interval: true,
				text: t("cron.time.everyNHours", { count: hourStep }),
				joined: t("cron.time.joinedEveryNHours", { count: hourStep })
			};
			const times = parsed.hours.values.flatMap((hour) => parsed.minutes.values.map((minute) => `${twoDigits(hour)}:${twoDigits(minute)}`));
			const text = times.length <= CRON_TIME_LIST_LIMIT ? t("cron.time.at", { times: times.join(t("cron.list.join")) }) : t("cron.time.hoursAt", {
				hours,
				minutes: numberList(parsed.minutes.values, t)
			});
			return {
				interval: false,
				text,
				joined: text
			};
		}
		/**
		* Describe one parsed cron expression as one localized sentence.
		* @param parsed - parsed cron expression.
		* @param t - cron translations.
		* @param locale - active UI locale naming restricted months.
		* @returns localized sentence, for example `Mon–Fri at 09:00` or `Every 15 minutes`.
		*/
		function cronPreview(parsed, t, locale) {
			const day = cronDayText(parsed, locale, t);
			const time = cronTimeText(parsed, t);
			return day.everyDay && time.interval ? time.text : [day.text, time.joined].join(t("cron.part.join"));
		}
		/**
		* Recognize the structured shape one parsed expression states, when one does.
		*
		* Every shape requires an unrestricted month. Exactly one of the two day fields
		* may restrict: a restricted weekday beside a star day-of-month is a weekly
		* rule, a restricted day-of-month beside a star weekday is a monthly rule, and
		* both restricting is unrecognized because each restriction matches
		* independently under the Host's Vixie union rule. Only a literal star states a
		* day field with no restriction: a written-out full set such as `0-6` or `1-31`
		* stays a weekly or monthly rule with every value selected, so toggling the
		* last pill on never collapses its row. Stepped shapes accept any uniform
		* full-range step on the clock, spelled with a star or written out, since both
		* match the same minutes or hours.
		* @param parsed - parsed cron expression.
		* @returns the shape the builder can edit, or undefined for the raw-expression fallback.
		*/
		function recognizeCronShape(parsed) {
			if (!parsed.months.full) return void 0;
			const minuteStep = parsed.minutes.unrestricted ? 1 : cronFullRangeStep(parsed.minutes.values, 0, 59);
			const hourStep = parsed.hours.unrestricted ? 1 : cronFullRangeStep(parsed.hours.values, 0, 23);
			const minute = parsed.minutes.values.length === 1 ? cronElementAt(parsed.minutes.values, 0) : void 0;
			const hour = parsed.hours.values.length === 1 ? cronElementAt(parsed.hours.values, 0) : void 0;
			if (parsed.daysOfWeek.unrestricted) {
				if (parsed.daysOfMonth.unrestricted) {
					if (minuteStep !== void 0 && parsed.hours.full) return {
						kind: "minutely",
						step: minuteStep
					};
					if (minute !== void 0 && hourStep !== void 0) return {
						kind: "hourly",
						step: hourStep,
						minute
					};
					if (minute !== void 0 && hour !== void 0) return {
						kind: "daily",
						hour,
						minute
					};
					return;
				}
				if (minute === void 0 || hour === void 0) return void 0;
				return {
					kind: "monthly",
					days: parsed.daysOfMonth.values,
					hour,
					minute
				};
			}
			if (!parsed.daysOfMonth.unrestricted || minute === void 0 || hour === void 0) return void 0;
			return {
				kind: "weekly",
				weekdays: parsed.daysOfWeek.values.map((value) => value === 0 ? 7 : value).sort((left, right) => left - right),
				hour,
				minute
			};
		}
		/**
		* Spell ascending unique field values as cron list text, collapsing a run of
		* three or more consecutive values into one range.
		* @param values - ascending unique field values.
		* @returns cron list text, for example `1-3,10`.
		*/
		function cronRunField(values) {
			return consecutiveRuns(values).map((run) => run.length >= 3 ? `${cronElementAt(run, 0)}-${cronElementAt(run, run.length - 1)}` : run.join(",")).join(",");
		}
		/**
		* Spell one builder shape's weekday set as a cron day-of-week field.
		* @param weekdays - ISO weekdays, Monday 1 through Sunday 7.
		* @returns ascending cron weekday field text, Sunday spelled as 0.
		*/
		function cronWeekdayField(weekdays) {
			return cronRunField([...new Set(weekdays.map((day) => day % 7))].sort((left, right) => left - right));
		}
		/**
		* Spell one builder shape as the five-field expression a save submits.
		*
		* `recognizeCronShape` recognizes every expression this returns as the same
		* shape, so a builder edit never falls back to the raw-expression row.
		* @param state - builder shape to spell.
		* @returns the expression stating that shape.
		*/
		function cronShapeExpression(state) {
			switch (state.kind) {
				case "minutely": return state.step === 1 ? "* * * * *" : `*/${state.step} * * * *`;
				case "hourly": return state.step === 1 ? `${state.minute} * * * *` : `${state.minute} */${state.step} * * *`;
				case "daily": return `${state.minute} ${state.hour} * * *`;
				case "weekly": return `${state.minute} ${state.hour} * * ${cronWeekdayField(state.weekdays)}`;
				case "monthly": return `${state.minute} ${state.hour} ${cronRunField([...new Set(state.days)].sort((left, right) => left - right))} * *`;
				/* v8 ignore next -- every CronBuilderState kind has a case above. */
				default: return assertNever(state);
			}
		}
		//#endregion
		//#region lib/types/client/schedule-format.js
		/** Universal fallback when a runtime cannot enumerate its ICU time-zone data. */
		const FALLBACK_ZONES = ["UTC"];
		const SECOND_MS$1 = 1e3;
		const SECOND_UNIT = {
			unit: "second",
			seconds: 1
		};
		const UNIT_SECONDS = [
			{
				unit: "day",
				seconds: 86400
			},
			{
				unit: "hour",
				seconds: 3600
			},
			{
				unit: "minute",
				seconds: 60
			},
			SECOND_UNIT
		];
		const WEEKDAY_KEYS$1 = [
			"frequency.weekday.1",
			"frequency.weekday.2",
			"frequency.weekday.3",
			"frequency.weekday.4",
			"frequency.weekday.5",
			"frequency.weekday.6",
			"frequency.weekday.7"
		];
		/** Localized unit word for one integral magnitude. */
		function unitLabel(unit, value, t) {
			return t(`unit.${unit}.${value === 1 ? "one" : "other"}`, { count: value });
		}
		/**
		* Name one task from its stored title.
		*
		* Every decoded Host record and catalog entry carries a title that is non-empty
		* after trimming, so no name is derived from the instruction here. The
		* `schedule_create` card derives one only for a result read from a Session log
		* written before the stored field existed.
		* @param record - task being named.
		* @returns the stored title.
		*/
		function taskName(record) {
			return record.title;
		}
		/** Localized clock text that omits fractional seconds and zero seconds. */
		function clockLabel(time) {
			return time.replace(/\.\d+$/, "").replace(/:00$/, "");
		}
		/**
		* Render the stored ISO weekday set with localized names joined in locale order.
		* @param weekdays - Stored unique ascending ISO weekdays.
		* @param t - frequency, join, and unit translations.
		* @returns Localized weekday list, for example `Mon, Wed`.
		*/
		function formatWeekdays(weekdays, t) {
			return weekdays.map((weekday) => t(WEEKDAY_KEYS$1[weekday - 1] ?? "frequency.weekday.1")).join(t("frequency.weekday.join"));
		}
		/** UTC offset, in minutes, of one IANA zone at the current instant. */
		function zoneOffset(zone, at) {
			try {
				const value = new Intl.DateTimeFormat("en-US", {
					timeZone: zone,
					timeZoneName: "longOffset"
				}).formatToParts(at).find((part) => part.type === "timeZoneName")?.value;
				if (value === "GMT") return 0;
				const match = /^GMT([+-])(\d{2}):(\d{2})$/.exec(value ?? "");
				if (match === null) return void 0;
				const minutes = Number(match[2]) * 60 + Number(match[3]);
				return match[1] === "-" ? -minutes : minutes;
			} catch {
				return;
			}
		}
		/** Stable UTC-offset label for one valid IANA zone. */
		function zoneOffsetLabel(zone, at, prefix) {
			const minutes = zoneOffset(zone, at);
			if (minutes === void 0) return void 0;
			const absolute = Math.abs(minutes);
			const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
			const remainder = String(absolute % 60).padStart(2, "0");
			return `${prefix}${minutes < 0 ? "-" : "+"}${hours}:${remainder}`;
		}
		/**
		* Localize one IANA zone through the runtime's ICU/CLDR data, prefixed by its
		* current UTC offset. The raw IANA id remains internal unless ICU cannot name
		* a valid stored alias.
		* @param zone - IANA zone to label.
		* @param t - translate providing the active ICU locale.
		* @param at - instant used to resolve the current UTC offset and zone name.
		* @returns the UTC offset and localized zone name.
		*/
		function zoneLabel(zone, t, at = Date.now()) {
			const offset = zoneOffsetLabel(zone, at, t("time.utcPrefix"));
			try {
				const name = new Intl.DateTimeFormat(t("time.locale"), {
					timeZone: zone,
					timeZoneName: "longGeneric"
				}).formatToParts(at).find((part) => part.type === "timeZoneName")?.value;
				if (offset === void 0) return name ?? zone;
				return name === void 0 || /^GMT(?:[+-]|$)/.test(name) ? offset : `${offset} · ${name}`;
			} catch {
				return offset === void 0 ? zone : `${offset} · ${zone}`;
			}
		}
		/**
		* Name one zone and mark it when it is the host's own zone.
		* @param zone - IANA zone to name.
		* @param system - the host's current IANA zone.
		* @param t - translate providing the active ICU locale and system suffix.
		* @param at - instant used to resolve the current UTC offset and zone name.
		* @returns UTC offset and localized zone name, with the system suffix when applicable.
		*/
		function zoneName(zone, system, t, at = Date.now()) {
			const name = zoneLabel(zone, t, at);
			return zone === system ? `${name}${t("rule.zone.system")}` : name;
		}
		/**
		* IANA zones this runtime enumerates, or `undefined` when it cannot enumerate.
		*
		* `Intl.supportedValuesOf('timeZone')` (ES2022) returns the engine's own
		* inventory. An engine without the method, and one whose `Intl` refuses the
		* call, both throw here; `undefined` then keeps `zoneChoices` on its minimal
		* fallback rather than an empty menu.
		* @returns the enumerated IANA zones, or `undefined` when enumeration fails.
		*/
		function timeZoneInventory() {
			try {
				return Intl.supportedValuesOf("timeZone");
			} catch {
				return;
			}
		}
		/**
		* Zones the time-zone menu offers, in menu order: the host's current zone,
		* followed by the runtime's IANA inventory ordered by current UTC offset and
		* canonical id, including a stored alias the inventory omits.
		*
		* `Intl.supportedValuesOf('timeZone')` supplies the inventory, so an engine
		* that can enumerate zones offers all of them. When enumeration is unavailable,
		* the menu falls back to the host zone, UTC, and any stored zone, so it is never
		* empty. A stored zone outside the inventory is appended,
		* so an accepted alias never disappears from the menu.
		* @param stored - zone the shown rule stores.
		* @param system - the host's current IANA zone.
		* @param at - instant used to order zones by their current UTC offset.
		* @returns IANA zones in menu order, de-duplicated.
		*/
		function zoneChoices(stored, system, at = Date.now()) {
			const inventory = timeZoneInventory();
			const zones = inventory === void 0 ? FALLBACK_ZONES : [...FALLBACK_ZONES, ...inventory];
			return [system, ...[...new Set([...zones, stored])].filter((zone) => zone !== system).map((zone) => ({
				zone,
				offset: zoneOffset(zone, at) ?? Number.POSITIVE_INFINITY
			})).sort((left, right) => {
				if (left.offset !== right.offset) return left.offset - right.offset;
				return left.zone < right.zone ? -1 : 1;
			}).map((entry) => entry.zone)];
		}
		/**
		* IANA zone a record's stored wall-clock rule interprets its time in.
		*
		* Daily, weekly, and cron records store an explicit zone. One-shot `at` and
		* `after` records, and fixed-interval `every` records, store only the UTC
		* instant, so they have no rule zone and their displayed time uses the browser zone.
		* @param record - reminder whose kind determines whether a zone is stored.
		* @returns the stored IANA zone, or undefined when the record stores none.
		*/
		function recordTimeZone(record) {
			switch (record.kind) {
				case "after":
				case "at":
				case "every": return;
				case "daily":
				case "weekly":
				case "cron": return record.timeZone;
			}
		}
		/**
		* Format exact intervals or wall-clock rules without changing their precision or zone.
		*
		* A cron rule reads as the sentence `cronPreview` derives from its expression,
		* for example `Every day at 09:00, 15:00`. An expression this parser cannot
		* read keeps the raw `Cron {expression}` form, so the stored rule stays visible
		* when the Host's dialect and this parser diverge.
		* @param record - reminder whose kind and stored rule determine its frequency.
		* @param t - frequency, weekday, and unit translations, independent of the catalog namespace.
		* @param zone - host-zone context; when present, a stored zone equal to `zone.system` is omitted
		* and another zone is named by `zone.label`. Without it ICU localizes the stored zone.
		* @returns localized one-shot, fixed-interval, daily, weekly, or cron time-and-zone text.
		*/
		function formatScheduleFrequency(record, t, zone) {
			switch (record.kind) {
				case "after":
				case "at": return t("frequency.once");
				case "cron": {
					const parsed = parseCronExpression(record.expression);
					if (parsed !== void 0) {
						const rule = cronPreview(parsed, t, t("time.locale"));
						if (zone === void 0) return t("frequency.cronRule", {
							rule,
							timeZone: zoneLabel(record.timeZone, t)
						});
						return zone.system === record.timeZone ? rule : t("frequency.cronRule", {
							rule,
							timeZone: zone.label(record.timeZone)
						});
					}
					if (zone === void 0) return t("frequency.cron", {
						expression: record.expression,
						timeZone: zoneLabel(record.timeZone, t)
					});
					return zone.system === record.timeZone ? t("frequency.cronLocal", { expression: record.expression }) : t("frequency.cron", {
						expression: record.expression,
						timeZone: zone.label(record.timeZone)
					});
				}
				case "daily": {
					const time = clockLabel(record.time);
					if (zone === void 0) return t("frequency.daily", {
						time,
						timeZone: zoneLabel(record.timeZone, t)
					});
					return zone.system === record.timeZone ? t("frequency.dailyLocal", { time }) : t("frequency.daily", {
						time,
						timeZone: zone.label(record.timeZone)
					});
				}
				case "weekly": {
					const params = {
						weekdays: formatWeekdays(record.weekdays, t),
						time: clockLabel(record.time)
					};
					if (zone === void 0) return t("frequency.weekly", {
						...params,
						timeZone: zoneLabel(record.timeZone, t)
					});
					return zone.system === record.timeZone ? t("frequency.weeklyLocal", params) : t("frequency.weekly", {
						...params,
						timeZone: zone.label(record.timeZone)
					});
				}
				case "every": {
					let selected = SECOND_UNIT;
					for (const candidate of UNIT_SECONDS) {
						if (record.everySeconds % candidate.seconds !== 0) continue;
						selected = candidate;
						break;
					}
					const value = record.everySeconds / selected.seconds;
					return t("frequency.every", {
						value,
						unit: unitLabel(selected.unit, value, t)
					});
				}
			}
			/* v8 ignore next -- The Remote decoder validates this closed union. */
			return assertNever(record);
		}
		/**
		* Format one target instant as a localized month-and-day date with its time, the
		* form the mock's task list shows and the same `Intl` field pair the universal
		* cards use.
		*
		* The month is a locale-owned name, not a zero-padded number: `en` renders
		* `Dec 31, 9:00 AM` and `zh-CN` renders `12月31日 09:00`, so neither locale can
		* produce a `12-31` string. The year appears only when the instant falls outside
		* the current year in the displayed zone, so a same-year target or delivery
		* stays compact while an older record still dates itself.
		*
		* `timeZone` carries the rule's own zone for a daily, weekly, or cron record, so
		* its occurrence reads in the task's zone. A one-shot `at` or `after` record
		* stores only the UTC instant, so callers pass no zone and it formats in the
		* browser zone.
		* @param scheduledAt - durable UTC target.
		* @param locale - BCP-47 locale owning the month name, day order, and clock.
		* @param timeZone - IANA zone of the task's own rule, or undefined for the browser zone.
		* @returns the localized month, day, and time, with the year when it is not the
		* current one, or the raw instant when the value cannot be parsed.
		*/
		function formatScheduleNextRun(scheduledAt, locale, timeZone) {
			const at = Date.parse(scheduledAt);
			if (Number.isNaN(at)) return scheduledAt;
			const zone = timeZone === void 0 ? {} : { timeZone };
			const yearOf = new Intl.DateTimeFormat("en-US", {
				year: "numeric",
				...zone
			});
			return new Intl.DateTimeFormat(locale, {
				...yearOf.format(at) === yearOf.format(Date.now()) ? {} : { year: "numeric" },
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
				...zone
			}).format(at);
		}
		/**
		* Languages whose absolute date reads the year. The design pins English and
		* Chinese (`en` states it, `zh` reads month and day only), and every other
		* language joins English: silently dropping the year would hide the year of a
		* target that can sit months or a year away.
		*/
		const YEAR_LANGUAGES = ["en"];
		const NO_YEAR_LANGUAGES = ["zh"];
		/**
		* Whether one locale's absolute date states the year.
		* @param locale - BCP-47 locale tag.
		* @returns whether the year is stated; an unlisted language states it.
		*/
		function statesYear(locale) {
			const language = locale.toLowerCase().replace(/-.*$/, "");
			if (YEAR_LANGUAGES.includes(language)) return true;
			if (NO_YEAR_LANGUAGES.includes(language)) return false;
			return true;
		}
		/**
		* Format one target as an absolute time in this device's zone.
		*
		* A task whose stored rule names its own zone still shows its next run in the
		* reader's zone: the instant is the same one, and the reader compares it with
		* their own clock. The locale owns the month name, the field order, and the
		* separators, so the stamp reads `Sep 19, 2026, 15:51` in English and
		* `9月19日 15:51` in Chinese.
		*
		* Whether a bare date reads the year is a per-language typographic choice, and
		* the languages the design pins are stated in {@link YEAR_LANGUAGES} and
		* {@link NO_YEAR_LANGUAGES}. Every language not listed there states the year:
		* dropping it silently would hide the year of a target that can sit months or a
		* year away, which is worse than one field more than the reader needs.
		* @param scheduledAt - durable UTC target.
		* @param locale - BCP-47 locale owning the month name, field order, and clock.
		* @returns the localized absolute next run in the device zone, or the raw instant when it cannot be parsed.
		*/
		function formatScheduleAbsolute(scheduledAt, locale) {
			const at = Date.parse(scheduledAt);
			if (Number.isNaN(at)) return scheduledAt;
			return new Intl.DateTimeFormat(locale, {
				...statesYear(locale) ? { year: "numeric" } : {},
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hourCycle: "h23"
			}).format(at);
		}
		/**
		* One next-run line as its two texts: the device-zone stamp and the distance.
		*
		* The list rows, the detail, the Session-header catalog, and the Sidebar hover
		* card all state this pair, so they take it from here instead of each composing
		* it: the stamp follows the language through `formatScheduleAbsolute`, and the
		* distance stays the reader's countdown.
		* @param scheduledAt - durable UTC target.
		* @param locale - BCP-47 locale owning the month name, field order, and clock.
		* @param now - current epoch milliseconds.
		* @param t - relative-time and unit translations.
		* @returns the absolute stamp, and the same distance wrapped in parentheses.
		*/
		function nextRunParts(scheduledAt, locale, now, t) {
			return {
				absolute: formatScheduleAbsolute(scheduledAt, locale),
				relative: `(${formatScheduleRelative(scheduledAt, now, t)})`
			};
		}
		/**
		* Format a relative target using the largest natural clock unit.
		* @param scheduledAt - durable UTC target.
		* @param now - current epoch milliseconds.
		* @param t - relative-time and unit translations.
		* @returns localized future, overdue, or due-now label.
		*/
		function formatScheduleRelative(scheduledAt, now, t) {
			const difference = Date.parse(scheduledAt) - now;
			if (difference === 0) return t("relative.now");
			const absoluteSeconds = Math.abs(difference) / SECOND_MS$1;
			const selected = UNIT_SECONDS.find((candidate) => absoluteSeconds >= candidate.seconds) ?? SECOND_UNIT;
			const value = Math.max(1, difference > 0 ? Math.ceil(absoluteSeconds / selected.seconds) : Math.floor(absoluteSeconds / selected.seconds));
			const unit = unitLabel(selected.unit, value, t);
			return t(difference > 0 ? "relative.future" : "relative.overdue", {
				value,
				unit
			});
		}
		/**
		* Order overdue records first and future records by ascending target time.
		* @param records - reminders to order without mutating the input.
		* @param now - current epoch milliseconds used to identify overdue targets.
		* @returns sorted copy preserving input order for equal targets.
		*/
		function orderScheduleRecords(records, now) {
			return records.map((record, index) => ({
				record,
				index
			})).sort((left, right) => {
				const leftTime = Date.parse(left.record.scheduledAt);
				const rightTime = Date.parse(right.record.scheduledAt);
				const leftOverdue = leftTime <= now;
				const rightOverdue = rightTime <= now;
				if (leftOverdue !== rightOverdue) return Number(rightOverdue) - Number(leftOverdue);
				return leftTime - rightTime || left.index - right.index;
			}).map(({ record }) => record);
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-schedule/src/client/ScheduleCatalogAction.module.css.mjs
		const css$8 = ".yRM_Ia_root{margin-left:4px;position:relative}.yRM_Ia_trigger{width:28px;height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:28px;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}.yRM_Ia_trigger:focus-visible{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}@media (hover:hover){.yRM_Ia_trigger:hover{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}}.yRM_Ia_trigger svg{flex:none}.yRM_Ia_menu{z-index:100;box-sizing:border-box;background:var(--dsw-specific-menu);width:336px;max-width:min(336px,100vw - 32px);max-height:min(420px,100vh - 140px);backdrop-filter:var(--dsw-menu-backdrop-filter);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);border:0;border-radius:16px;flex-direction:column;gap:1px;margin:0;padding:3px;list-style:none;display:flex;position:fixed;overflow:auto}.yRM_Ia_row{box-sizing:border-box;width:100%;min-height:48px;color:var(--dsw-alias-label-primary);border-radius:10px;flex-shrink:0;align-items:start;gap:2px;padding:10px 12px;display:flex}.yRM_Ia_rowTask{position:relative}@media (hover:hover){.yRM_Ia_rowTask:hover{background:var(--dsw-alias-interactive-bg-hover)}}.yRM_Ia_rowOverdue{background:var(--dsw-alias-state-warn-tertiary)}@media (hover:hover){.yRM_Ia_rowOverdue:hover{background:var(--dsw-alias-state-warn-tertiary)}}.yRM_Ia_body{flex-direction:column;flex:1;gap:3px;min-width:0;display:flex}.yRM_Ia_title{overflow-wrap:anywhere;white-space:normal;font-size:13px;line-height:18px}.yRM_Ia_openButton{color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border:0;padding:0;display:block}.yRM_Ia_openButton:after{content:\"\";border-radius:10px;position:absolute;inset:0}.yRM_Ia_openButton:focus-visible{outline:none}.yRM_Ia_openButton:focus-visible:after{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}.yRM_Ia_metadata,.yRM_Ia_nextRun{min-width:0;color:var(--dsw-alias-label-tertiary);flex-wrap:wrap;align-items:center;gap:4px;font-size:10px;line-height:15px;display:flex}.yRM_Ia_metadataOverdue{color:var(--dsw-alias-state-warn-label)}.yRM_Ia_nextRunRelative{overflow-wrap:anywhere;min-width:0}.yRM_Ia_deleteButton{width:20px;height:20px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:6px;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex;position:relative}.yRM_Ia_deleteButton:focus-visible{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}@media (hover:hover){.yRM_Ia_deleteButton:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}}.yRM_Ia_deleteButton:disabled{cursor:wait}.yRM_Ia_trigger[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover)}";
		const tagId$8 = "@deepseek-ai/dsh-client-ui-schedule/ScheduleCatalogAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$8) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-schedule";
			tag.dataset.pluginCss = tagId$8;
			tag.textContent = css$8;
			document.head.appendChild(tag);
		}
		var ScheduleCatalogAction_module_css_default = {
			"body": "yRM_Ia_body",
			"deleteButton": "yRM_Ia_deleteButton",
			"menu": "yRM_Ia_menu",
			"metadata": "yRM_Ia_metadata",
			"metadataOverdue": "yRM_Ia_metadataOverdue",
			"nextRun": "yRM_Ia_nextRun",
			"nextRunRelative": "yRM_Ia_nextRunRelative",
			"openButton": "yRM_Ia_openButton",
			"root": "yRM_Ia_root",
			"row": "yRM_Ia_row",
			"rowOverdue": "yRM_Ia_rowOverdue",
			"rowTask": "yRM_Ia_rowTask",
			"title": "yRM_Ia_title",
			"trigger": "yRM_Ia_trigger"
		};
		//#endregion
		//#region lib/types/client/ScheduleCatalogAction.js
		const SECOND_MS = 1e3;
		const MEASURE_STYLE$2 = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		/**
		* Current-Session reminder catalog with durable deletion, rendered only while
		* the current Peer may list this Session's reminders.
		* @param props - the Session seats, the injected catalog and verbs, and localized copy.
		* @returns the reminder catalog action, or nothing without access.
		*/
		function ScheduleCatalogAction(props) {
			return props.useAccess("schedule/list") ? (0, react_jsx_runtime.jsx)(SessionScheduleCatalog, { ...props }) : null;
		}
		function SessionScheduleCatalog({ useSession, useCatalog, onDelete, onRetry, openTaskDetail, t }) {
			const openState = useSession((snapshot) => snapshot.openState);
			const { records, status, deleting } = useCatalog((value) => value);
			const visible = openState === "open";
			const [open, setOpen] = (0, react.useState)(false);
			const [now, setNow] = (0, react.useState)(() => Date.now());
			const rootRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const catalogRef = (0, react.useRef)(null);
			const catalogPosition = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open,
				anchorRef: triggerRef,
				panelRef: catalogRef,
				side: "bottom",
				gap: 5,
				margin: 16
			});
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(rootRef, open, setOpen, catalogRef);
			(0, react.useEffect)(() => {
				if (!open) return;
				setNow(Date.now());
				const timer = setInterval(() => {
					setNow(Date.now());
				}, SECOND_MS);
				return () => {
					clearInterval(timer);
				};
			}, [open]);
			(0, react.useEffect)(() => {
				if (visible || !open) return;
				setOpen(false);
			}, [visible, open]);
			const rows = (0, react.useMemo)(() => orderScheduleRecords(records, now), [records, now]);
			if (!visible) return null;
			if (records.length === 0 && status !== "error") return null;
			const known = records.length;
			const triggerLabel = known === 0 ? t("trigger.label") : t(known === 1 ? "trigger.one" : "trigger.other", { count: known });
			const soleTask = status === "ready" && records.length === 1 ? records[0] : void 0;
			const expandable = soleTask === void 0 || open;
			const toggleCatalog = () => {
				setNow(Date.now());
				setOpen((current) => !current);
			};
			const openTask = (id) => {
				setOpen(false);
				openTaskDetail(id);
			};
			const onKeyDown = (event) => {
				if (event.key !== "Escape" || !open) return;
				event.preventDefault();
				setOpen(false);
				triggerRef.current?.focus();
			};
			const trigger = (0, react_jsx_runtime.jsx)("button", {
				ref: triggerRef,
				type: "button",
				className: ScheduleCatalogAction_module_css_default.trigger,
				"data-schedule-reminder-entry": "",
				"aria-expanded": expandable ? open : void 0,
				"aria-label": triggerLabel,
				onClick: () => {
					if (expandable) {
						toggleCatalog();
						return;
					}
					setNow(Date.now());
					openTask(soleTask.id);
				},
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { size: 16 })
			});
			const catalog = open ? (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("ul", {
				ref: catalogRef,
				className: ScheduleCatalogAction_module_css_default.menu,
				style: catalogPosition ?? MEASURE_STYLE$2,
				"aria-label": t("list.aria"),
				onKeyDown,
				children: [
					status === "loading" && (0, react_jsx_runtime.jsx)("li", {
						className: ScheduleCatalogAction_module_css_default.row,
						role: "status",
						children: t("list.loading")
					}),
					status === "error" && (0, react_jsx_runtime.jsxs)("li", {
						className: ScheduleCatalogAction_module_css_default.row,
						children: [(0, react_jsx_runtime.jsx)("span", {
							role: "alert",
							children: t("list.error")
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								onRetry();
							},
							children: t("list.retry")
						})]
					}),
					rows.map((record) => {
						const overdue = Date.parse(record.scheduledAt) <= now;
						const nextRun = nextRunParts(record.scheduledAt, t("time.locale"), now, t);
						return (0, react_jsx_runtime.jsxs)("li", {
							className: overdue ? `${ScheduleCatalogAction_module_css_default.row} ${ScheduleCatalogAction_module_css_default.rowTask} ${ScheduleCatalogAction_module_css_default.rowOverdue}` : `${ScheduleCatalogAction_module_css_default.row} ${ScheduleCatalogAction_module_css_default.rowTask}`,
							children: [(0, react_jsx_runtime.jsxs)("span", {
								className: ScheduleCatalogAction_module_css_default.body,
								children: [
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ScheduleCatalogAction_module_css_default.openButton,
										"aria-label": t("list.open", { title: taskName(record) }),
										onClick: () => {
											openTask(record.id);
										},
										children: (0, react_jsx_runtime.jsx)("span", {
											className: ScheduleCatalogAction_module_css_default.title,
											children: taskName(record)
										})
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: overdue ? `${ScheduleCatalogAction_module_css_default.metadata} ${ScheduleCatalogAction_module_css_default.metadataOverdue}` : ScheduleCatalogAction_module_css_default.metadata,
										children: (0, react_jsx_runtime.jsx)("span", { children: formatScheduleFrequency(record, t) })
									}),
									(0, react_jsx_runtime.jsxs)("span", {
										className: overdue ? `${ScheduleCatalogAction_module_css_default.nextRun} ${ScheduleCatalogAction_module_css_default.metadataOverdue}` : ScheduleCatalogAction_module_css_default.nextRun,
										children: [
											(0, react_jsx_runtime.jsx)("span", { children: `${t("list.nextRun")} ` }),
											(0, react_jsx_runtime.jsx)("time", {
												dateTime: record.scheduledAt,
												children: nextRun.absolute
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: ScheduleCatalogAction_module_css_default.nextRunRelative,
												children: nextRun.relative
											})
										]
									})
								]
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ScheduleCatalogAction_module_css_default.deleteButton,
								"aria-label": t("delete.label", { title: taskName(record) }),
								title: t(deleting.includes(record.id) ? "delete.pending" : "delete.action"),
								disabled: deleting.includes(record.id),
								onClick: () => {
									onDelete(record.id);
								},
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 })
							})]
						}, record.id);
					})
				]
			}), document.body) : null;
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: ScheduleCatalogAction_module_css_default.root,
				onKeyDown,
				children: [trigger, catalog]
			});
		}
		//#endregion
		//#region lib/types/client/schedule-create-card.js
		/** JSON document of one raw wire text, or undefined when the text is not JSON. */
		function parseJson(text) {
			try {
				return JSON.parse(text);
			} catch {
				return;
			}
		}
		/** Whether one wire value is a plain JSON object rather than an array or scalar. */
		function isRecord$1(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/** First physical line of one task instruction, without surrounding whitespace. */
		function firstLine(text) {
			const newline = text.search(/\r?\n/);
			return (newline === -1 ? text : text.slice(0, newline)).trim();
		}
		/** Concatenated text of a settled result, or null when it is not exactly one text block. */
		function resultText(block) {
			const first = block.content[0];
			if (first === void 0 || first.type !== "text" || first.text === "") return null;
			if (block.content.length !== 1) return null;
			return first.text;
		}
		/** Whether one wire value is an array whose entries are all numbers. */
		function isNumberArray(value) {
			return Array.isArray(value) && value.every((entry) => typeof entry === "number");
		}
		/**
		* Narrow one opaque value to a complete Schedule rule.
		*
		* The value arrives from replayed wire JSON, so each rule kind is checked for
		* the fields `formatScheduleFrequency` reads. A missing identity or an
		* incomplete rule returns undefined and the card renders without a task.
		*
		* The result JSON normally carries the stored title. A result recorded before
		* that field existed carries none, so this narrowing derives the display title
		* from the instruction's first line; when the instruction has no such line it
		* returns undefined.
		* @param value - opaque value parsed from logged JSON.
		* @returns the narrowed rule, or undefined when it is not a complete task.
		*/
		function narrowScheduleRecord(value) {
			if (!isRecord$1(value)) return void 0;
			const { id, prompt, scheduledAt, kind } = value;
			if (typeof id !== "string" || id === "" || typeof prompt !== "string" || prompt === "" || typeof scheduledAt !== "string") return void 0;
			const title = typeof value.title === "string" && value.title.trim() !== "" ? value.title : firstLine(prompt);
			if (title === "") return void 0;
			switch (kind) {
				case "after": return typeof value.afterSeconds === "number" ? {
					id,
					kind: "after",
					title,
					prompt,
					afterSeconds: value.afterSeconds,
					scheduledAt
				} : void 0;
				case "at": return {
					id,
					kind: "at",
					title,
					prompt,
					scheduledAt
				};
				case "every": return typeof value.everySeconds === "number" ? {
					id,
					kind: "every",
					title,
					prompt,
					everySeconds: value.everySeconds,
					scheduledAt
				} : void 0;
				case "daily": return typeof value.time === "string" && typeof value.timeZone === "string" ? {
					id,
					kind: "daily",
					title,
					prompt,
					time: value.time,
					timeZone: value.timeZone,
					scheduledAt
				} : void 0;
				case "weekly": return typeof value.time === "string" && typeof value.timeZone === "string" && isNumberArray(value.weekdays) ? {
					id,
					kind: "weekly",
					title,
					prompt,
					time: value.time,
					timeZone: value.timeZone,
					weekdays: value.weekdays,
					scheduledAt
				} : void 0;
				case "cron": return typeof value.expression === "string" && typeof value.timeZone === "string" ? {
					id,
					kind: "cron",
					title,
					prompt,
					expression: value.expression,
					timeZone: value.timeZone,
					scheduledAt
				} : void 0;
				default: return;
			}
		}
		/** Task title a still-running call announces from its own arguments. */
		function pendingTitle(argsRaw) {
			const parsed = parseJson(argsRaw);
			if (!isRecord$1(parsed)) return void 0;
			if (typeof parsed.title === "string" && parsed.title.trim() !== "") return parsed.title.trim();
			if (typeof parsed.prompt !== "string") return void 0;
			const title = firstLine(parsed.prompt);
			return title === "" ? void 0 : title;
		}
		/**
		* Derive the transcript card of one `schedule_create` call.
		* @param block - raw call or result block carried by the Session journal.
		* @param toolName - wire Tool name, used when no task title is available.
		* @returns the created task, its title, and the settled result text.
		*/
		function scheduleCreateCardModel(block, toolName) {
			const settled = "kind" in block;
			const argsRaw = settled ? block.call?.argsRaw ?? "" : block.phase === "start" ? block.argsRaw : "";
			const output = settled ? resultText(block) : null;
			const task = settled ? narrowScheduleRecord(parseJson(output ?? "")) : void 0;
			return {
				task,
				title: task === void 0 ? pendingTitle(argsRaw) ?? toolName : taskName(task),
				output
			};
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-schedule/src/client/ScheduleCreateCard.module.css.mjs
		const css$7 = ".u-jDoq_card{--card-fill:var(--dsw-static-neutral-50);--card-hover:var(--dsw-static-neutral-100);box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--card-fill);width:100%;color:var(--dsw-alias-label-primary);flex-direction:column;gap:6px;padding:8px 10px;transition:background-color .12s;display:flex;position:relative;overflow:hidden}body[data-ds-dark-theme] .u-jDoq_card{--card-fill:var(--dsw-static-neutral-850);--card-hover:var(--dsw-static-neutral-800)}@media (hover:hover){.u-jDoq_card:has(.u-jDoq_cardOpen):hover{background:var(--card-hover)}}.u-jDoq_cardOpen{z-index:1;border-radius:inherit;cursor:pointer;background:0 0;border:0;width:100%;padding:0;position:absolute;inset:0}.u-jDoq_cardOpen:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline:none}.u-jDoq_row{z-index:2;pointer-events:none;align-items:center;gap:10px;min-width:0;min-height:44px;display:flex;position:relative}.u-jDoq_leading{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l1);background:color-mix(in srgb, var(--dsw-static-neutral-00) 50%, transparent);width:40px;height:40px;color:var(--dsw-alias-label-secondary);border-radius:10px;flex:none;place-items:center;display:grid}body[data-ds-dark-theme] .u-jDoq_leading{background:color-mix(in srgb, var(--dsw-static-neutral-00) 5%, transparent)}.u-jDoq_leading svg{flex:none}.u-jDoq_body{flex-direction:column;flex:auto;gap:2px;min-width:0;display:flex}.u-jDoq_title{text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:500;line-height:20px;overflow:hidden}.u-jDoq_frequency{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;line-height:16px;overflow:hidden}.u-jDoq_status{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:20px;overflow:hidden}.u-jDoq_openButton{pointer-events:auto;flex:none}.u-jDoq_fallback{z-index:2;color:var(--dsw-alias-label-tertiary);white-space:pre-wrap;overflow-wrap:anywhere;margin:0;font-size:11px;line-height:16px;position:relative;overflow:hidden}";
		const tagId$7 = "@deepseek-ai/dsh-client-ui-schedule/ScheduleCreateCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$7) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-schedule";
			tag.dataset.pluginCss = tagId$7;
			tag.textContent = css$7;
			document.head.appendChild(tag);
		}
		var ScheduleCreateCard_module_css_default = {
			"body": "u-jDoq_body",
			"card": "u-jDoq_card",
			"cardOpen": "u-jDoq_cardOpen",
			"fallback": "u-jDoq_fallback",
			"frequency": "u-jDoq_frequency",
			"leading": "u-jDoq_leading",
			"openButton": "u-jDoq_openButton",
			"row": "u-jDoq_row",
			"status": "u-jDoq_status",
			"title": "u-jDoq_title"
		};
		//#endregion
		//#region lib/types/client/ScheduleCreateCard.js
		/**
		* Render one `schedule_create` call as the created task's card.
		*
		* A settled result yields the task's title, its localized frequency, and the
		* button that opens that task's right-Sidebar detail. A running call, a failed
		* creation, or a replayed result with no complete task renders its title and
		* raw result text with no open action, so the card never presents an identity
		* it does not have.
		* @param props - the settled card payload, injected task navigation, and copy.
		* @returns the created task's transcript card.
		*/
		function ScheduleCreateCard({ block, toolName, openTaskDetail, t, currentTask }) {
			const model = scheduleCreateCardModel(block, toolName);
			const task = currentTask ?? model.task;
			const deleted = currentTask === null;
			const title = currentTask === void 0 || currentTask === null ? model.title : taskName(currentTask);
			const openable = task !== void 0 && !deleted;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ScheduleCreateCard_module_css_default.card,
				"data-tool": "schedule_create",
				children: [
					openable ? (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ScheduleCreateCard_module_css_default.cardOpen,
						"aria-label": t("card.openLabel", { title }),
						onClick: () => {
							openTaskDetail(task.id);
						}
					}) : null,
					(0, react_jsx_runtime.jsxs)("div", {
						className: ScheduleCreateCard_module_css_default.row,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: ScheduleCreateCard_module_css_default.leading,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { size: 18 })
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: ScheduleCreateCard_module_css_default.body,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ScheduleCreateCard_module_css_default.title,
									children: title
								}), task !== void 0 ? (0, react_jsx_runtime.jsx)("span", {
									className: ScheduleCreateCard_module_css_default.frequency,
									children: deleted ? t("card.deleted") : formatScheduleFrequency(task, t)
								}) : null]
							}),
							openable ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								size: "sm",
								className: ScheduleCreateCard_module_css_default.openButton,
								onClick: () => {
									openTaskDetail(task.id);
								},
								children: t("card.open")
							}) : null
						]
					}),
					task === void 0 && model.output !== null ? (0, react_jsx_runtime.jsx)("pre", {
						className: ScheduleCreateCard_module_css_default.fallback,
						children: model.output
					}) : null
				]
			});
		}
		//#endregion
		//#region ../../core/session/src/surface.ts
		/** Runtime counterpart of the message-producing event union. */
		const SURFACE_EVENT_TYPES = new Set([
			"system/message",
			"developer/message",
			"user/message",
			"assistant/message",
			"tool/result"
		]);
		/**
		* Narrow an event to a surface-eligible event carrying its required marker.
		* @param event - event to test.
		* @returns true when both the type and marker identify a surface event.
		*/
		function isSurfaceEvent(event) {
			if (!SURFACE_EVENT_TYPES.has(event.type)) return false;
			return event.surfaceOp !== void 0;
		}
		/**
		* Narrow an event to an append-origin surface event: one that entered the
		* surface at its own log position and was never itself a replacement copy.
		*
		* The model-visible surface deliberately shadows replaced ranges, so it is the
		* wrong source for a human transcript — a landed replacement would erase
		* conversation the user already saw. Append-origin events are that transcript's
		* durable source material; replacement copies stay model-only.
		* @param event - event to test.
		* @returns true when the event appended to the surface tail.
		*/
		function isAppendSurfaceEvent(event) {
			return isSurfaceEvent(event) && event.surfaceOp === "append";
		}
		//#endregion
		//#region lib/types/client/schedule-turn.js
		/**
		* Turn-scoped created-task projection for the `schedule_create` card.
		*
		* This Definition publishes the task a settled call created against its Turn,
		* so the card renders as a turn-level element through ui-chat's
		* `conversation.chat.turnTail` list seat. The task is narrowed from
		* the persisted result JSON, so Session-log replay reproduces the card with no
		* Host change and no presentation metadata. The call's own Tool-group cell
		* belongs to ui-tool's generic keyed tool view, so this package contributes
		* only the Turn-level card.
		*/
		/** Wire Tool name whose settled result carries one created task. */
		const SCHEDULE_CREATE_TOOL = "schedule_create";
		/**
		* Created tasks of one Turn up to a bound sequence.
		*
		* The Conversation Location index owns Turn membership before this runs, so
		* tasks cannot spill across Turns.
		* @param data - engine-published created-task data for one Turn.
		* @param seq - bound sequence; settlements after it are excluded.
		* @returns created result nodes in settlement order; empty when the Turn created none.
		*/
		function scheduleTasksForClosing(data, seq = Number.POSITIVE_INFINITY) {
			return data === void 0 ? [] : data.created.filter((created) => created.seq <= seq);
		}
		/**
		* Select the tasks one Turn created, for the Turn-tail list entry to render.
		*
		* The bounded sequence is the Turn's own end, not the closing Assistant text: a
		* Turn whose last text response precedes a `schedule_create` settlement still
		* owns that creation when it ends on a failed request or a user stop, and the
		* turn-tail seat exists only for a completed Turn. A Turn without a recorded end
		* falls back to the owner's own sequence.
		* @param owner - Turn-tail owner currency for the closing Assistant.
		* @returns created tasks, or null when the Turn created none.
		*/
		function selectScheduleTasks(owner) {
			const created = scheduleTasksForClosing(owner.turn.data.get("schedule-created"), owner.turn.end?.seq ?? owner.seq);
			return created.length === 0 ? null : { created };
		}
		/**
		* Build the card's result node for one settled root call, or undefined when
		* the result is not a complete created task. Malformed and failed results fall
		* through: with no task identity the Turn tail renders no card.
		* @param match - the settling `tool/result` update match.
		* @param call - paired in-window call head.
		* @returns the settled node, or undefined when it names no task.
		*/
		function createdTask(match, call) {
			/* v8 ignore next -- The only call site reaches this after narrowing the same event to `tool/result`. */
			if (match.event.type !== "tool/result") return void 0;
			const message = match.event.data.message;
			if (message.isError === true) return void 0;
			const settled = {
				kind: "tool-result",
				seq: match.event.seq,
				time: match.event.time,
				callId: String(match.event.data.message.source.callId),
				name: call.name,
				args: PartialArguments.fromText(call.argsRaw),
				call: {
					name: call.name,
					argsRaw: call.argsRaw
				},
				callTime: call.time,
				content: message.content,
				isError: false,
				subCalls: []
			};
			return scheduleCreateCardModel(settled, "schedule_create").task === void 0 ? void 0 : settled;
		}
		/** Turn-local `schedule_create` accumulator; it publishes no view Node. */
		const scheduleTurnDefinition = {
			kind: "schedule-created",
			match: (event) => {
				if (event.type === "turn/start") return {
					id: String(event.data.turn),
					role: "start"
				};
				if (event.type === "tool/call") return {
					id: String(event.data.turn),
					role: "update"
				};
				if (event.type === "tool/result" && isAppendSurfaceEvent(event)) return {
					id: String(event.data.turn),
					role: "update"
				};
				return null;
			},
			start: (_context, match) => {
				if (match.event.type !== "turn/start") throw new Error("schedule-created start requires turn/start");
				return {
					turn: match.event.data.turn,
					calls: /* @__PURE__ */ new Map(),
					created: []
				};
			},
			update: (context, match) => {
				if (match.event.type === "tool/call") {
					const calls = new Map(context.state.calls);
					calls.set(String(match.event.data.callId), {
						name: match.event.data.name,
						argsRaw: match.event.data.arguments,
						time: match.event.seq
					});
					return {
						...context.state,
						calls
					};
				}
				if (match.event.type !== "tool/result") return context.state;
				const call = context.state.calls.get(String(match.event.data.message.source.callId));
				if (call?.name !== "schedule_create") return context.state;
				const block = createdTask(match, call);
				return block === void 0 ? context.state : {
					...context.state,
					created: [...context.state.created, block]
				};
			},
			buildLocationData: (context, scope, previous) => {
				if (scope !== "turn" || context.state === void 0) return null;
				if (previous?.kind === "turn" && previous.turn === context.state.turn && previous.key === "schedule-created" && previous.value.created === context.state.created) return previous;
				return {
					kind: "turn",
					turn: context.state.turn,
					key: "schedule-created",
					value: { created: context.state.created }
				};
			}
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-schedule/src/client/ScheduleTurnCard.module.css.mjs
		const css$6 = ".DATEAG_list{flex-direction:column;gap:10px;margin:4px 0;display:flex}";
		const tagId$6 = "@deepseek-ai/dsh-client-ui-schedule/ScheduleTurnCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$6) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-schedule";
			tag.dataset.pluginCss = tagId$6;
			tag.textContent = css$6;
			document.head.appendChild(tag);
		}
		var ScheduleTurnCard_module_css_default = { "list": "DATEAG_list" };
		//#endregion
		//#region lib/types/client/ScheduleTurnCard.js
		/**
		* Props of one card rendered from the Turn tail.
		*
		* The keyed Tool seat also carries the owner's file opener, image loader, and
		* workspace facts; this card reads none of them, and the Turn tail supplies
		* only the fields it does.
		* @param block - settled result node recorded against the Turn.
		* @param openTaskDetail - right-Sidebar navigation for the created task.
		* @param t - the active locale's copy.
		* @returns the composed props of one `ScheduleCreateCard`.
		*/
		function cardProps(block, openTaskDetail, t, currentTask) {
			return {
				callId: block.callId,
				toolName: SCHEDULE_CREATE_TOOL,
				block,
				openTaskDetail,
				t,
				...currentTask === void 0 ? {} : { currentTask }
			};
		}
		/** Created-task cards reconciled against the authoritative Host catalog. */
		function CurrentScheduleCards({ created, openTaskDetail, t, useCatalog, onRetry }) {
			const catalog = useCatalog((snapshot) => snapshot);
			const requestAtMount = (0, react.useRef)(catalog.readRequest).current;
			(0, react.useEffect)(() => {
				onRetry(requestAtMount);
			}, [onRetry, requestAtMount]);
			const records = catalog.settled && catalog.readSettled > requestAtMount ? catalog.records : void 0;
			return created.map((block) => {
				const task = scheduleCreateCardModel(block, SCHEDULE_CREATE_TOOL).task;
				return (0, react_jsx_runtime.jsx)(ScheduleCreateCard, { ...cardProps(block, openTaskDetail, t, task === void 0 || records === void 0 ? void 0 : records.find((record) => record.id === task.id) ?? null) }, block.callId);
			});
		}
		/**
		* Render the tasks one Turn created as standalone cards beneath its closing
		* prose.
		*
		* The Turn tail is a list seat independent of the Turn's process disclosure,
		* so the cards stay visible while the Tool group is collapsed. Every list entry
		* renders for every Turn, so this one narrows its own Turn here.
		* @param props - closing Turn owner currency, turn-tail navigation, and copy.
		* @returns one created-task card per settled `schedule_create` result, or null when the Turn created none.
		*/
		function ScheduleTurnCard(props) {
			const matched = selectScheduleTasks(props);
			if (matched === null) return null;
			return (0, react_jsx_runtime.jsx)("div", {
				className: ScheduleTurnCard_module_css_default.list,
				children: (0, react_jsx_runtime.jsx)(CurrentScheduleCards, {
					created: matched.created,
					openTaskDetail: props.openTaskDetail,
					t: props.t,
					useCatalog: props.useCatalog,
					onRetry: props.onRetry
				})
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-schedule/src/client/TaskManagerPage.module.css.mjs
		const css$5 = ".CuekEG_page{width:100%;min-width:0;height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:14px;line-height:1.6;display:flex;overflow:hidden}.CuekEG_listPane{flex-direction:column;flex:1;min-width:0;min-height:0;display:flex}.CuekEG_pageScroll{scrollbar-gutter:stable;--dsh-scrollbar-width:9px;--dsh-scrollbar-thumb-border:2px;flex:1;min-height:0;overflow:auto}.CuekEG_pageContent{max-width:960px;margin:0 auto;padding:0 clamp(24px,4vw,48px) 48px}.CuekEG_pageHeading{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;margin-bottom:24px;padding-top:28px;display:flex}[data-platform=darwin] .CuekEG_pageHeading{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}.CuekEG_pageHeading h1{flex:0 auto;min-width:0;max-width:100%;margin:0;font-size:20px;font-weight:500;line-height:28px}.CuekEG_creationActions{white-space:nowrap;flex:none;align-items:center;gap:16px;display:flex}.CuekEG_headerAction{border-radius:16px;height:32px;padding:0 12px;font-size:13px;line-height:20px}.CuekEG_filters{flex-wrap:wrap;align-items:center;gap:8px 12px;margin-bottom:14px;display:flex}.CuekEG_filterTabs{flex-wrap:wrap;align-items:center;gap:8px 12px;display:flex}.CuekEG_filterTab{height:28px;color:var(--dsw-alias-label-tertiary);font:inherit;white-space:nowrap;cursor:pointer;background:0 0;border:0;border-radius:14px;flex:none;align-items:center;padding:0 10px;font-size:14px;line-height:22px;display:inline-flex}@media (hover:hover){.CuekEG_filterTab:hover{background:var(--dsw-alias-interactive-bg-hover)}}.CuekEG_filterTabActive{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.CuekEG_searchTools{--task-search-height:36px;align-items:center;gap:8px;margin-bottom:16px;display:flex}.CuekEG_catalogActions{flex:none}.CuekEG_catalogMore{width:var(--task-search-height);height:var(--task-search-height);padding:0}.CuekEG_catalogMore[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover)}.CuekEG_searchField{box-sizing:border-box;min-width:0;height:var(--task-search-height);border:.5px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-tertiary);border-radius:12px;flex:1;align-items:center;margin:0;padding:0 10px;transition:border-color .15s;display:flex}@media (hover:hover){.CuekEG_searchField:hover{border-color:var(--dsw-alias-border-l2)}}.CuekEG_searchField:focus-within{border-color:var(--dsw-alias-state-business-primary)}.CuekEG_searchField>:first-child{background:0 0;border:0;border-radius:0;flex:1;min-width:0;height:100%;padding:0}.CuekEG_searchField>:first-child:focus-within{border-color:#0000}.CuekEG_searchField>:first-child svg{width:14px;height:14px}.CuekEG_searchField input::placeholder{color:var(--dsw-alias-label-caption)}.CuekEG_searchField input:focus-visible{outline:none}.CuekEG_searchField input::-webkit-search-cancel-button{display:none}.CuekEG_searchClear{width:28px;height:28px;color:var(--dsw-alias-label-tertiary);flex:none;margin-right:-6px;padding:0}.CuekEG_searchClear svg{width:14px;height:14px}.CuekEG_list{display:block}.CuekEG_listRows{flex-direction:column;gap:2px;margin:0;padding:0;list-style:none;display:flex}.CuekEG_row{text-align:left;white-space:normal;border-radius:12px;justify-content:flex-start;align-items:flex-start;gap:12px;width:100%;height:auto;padding:8px;display:flex}@media (hover:hover){.CuekEG_row:hover{background:var(--dsw-alias-interactive-bg-hover)}}.CuekEG_rowGlyph{width:16px;height:20px;color:var(--dsw-alias-label-tertiary);flex:none;margin-top:2px}.CuekEG_rowContent{flex-direction:column;flex:1;min-width:0;display:flex}.CuekEG_rowTitle{text-overflow:ellipsis;white-space:nowrap;font-weight:500;line-height:23px;overflow:hidden}.CuekEG_rowSummary{color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere;margin-top:2px;font-size:13px;line-height:21px;display:block}.CuekEG_metadata{color:inherit;overflow-wrap:anywhere;font-size:13px;line-height:21px}.CuekEG_metadata+.CuekEG_metadata:before{content:\" · \";padding:0 2px}.CuekEG_selectedRow{background:var(--dsw-alias-interactive-bg-hover)}.CuekEG_endedRow .CuekEG_rowTitle{color:var(--dsw-alias-label-tertiary)}.CuekEG_endedRow .CuekEG_rowSummary{color:var(--dsw-alias-label-caption)}@media (hover:hover){.CuekEG_endedRow:hover .CuekEG_rowTitle{color:inherit}}.CuekEG_endedRow.CuekEG_selectedRow .CuekEG_rowTitle{color:inherit}@media (hover:hover){.CuekEG_endedRow:hover .CuekEG_rowSummary{color:var(--dsw-alias-label-tertiary)}}.CuekEG_endedRow.CuekEG_selectedRow .CuekEG_rowSummary{color:var(--dsw-alias-label-tertiary)}.CuekEG_notice{background:var(--dsw-specific-sidebar-fill);color:var(--dsw-alias-label-secondary);border-radius:10px;flex-wrap:wrap;align-items:flex-start;gap:9px;margin:0 0 20px;padding:12px 14px;font-size:12px;line-height:20px;display:flex}.CuekEG_notice p{flex:1;margin:0}.CuekEG_empty{text-align:center;color:var(--dsw-alias-label-tertiary);flex-direction:column;align-items:center;padding:48px 20px;font-size:14px;display:flex}.CuekEG_empty h2,.CuekEG_empty h3,.CuekEG_empty .CuekEG_emptyTitle,.CuekEG_empty p{margin:0}.CuekEG_empty h2,.CuekEG_empty h3,.CuekEG_empty .CuekEG_emptyTitle{color:var(--dsw-alias-label-tertiary);margin-bottom:8px;font-size:14px;font-weight:400;line-height:1.6}.CuekEG_emptyGlyph{color:var(--dsw-alias-label-caption);margin-bottom:12px}.CuekEG_emptyIllustration{flex:none;width:110px;max-width:100%;height:auto;margin-bottom:12px}.CuekEG_emptyAction{margin-top:16px}.CuekEG_detail{--detail-gutter:24px;border-left:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-base);flex-direction:column;flex:0 0 47%;min-width:0;min-height:0;display:flex;position:relative}.CuekEG_detail:focus-visible{outline:none}.CuekEG_tabBody{flex-direction:column;flex:auto;min-width:0;height:100%;min-height:0;display:flex}.CuekEG_tabBody>.CuekEG_detail{border-left:0;flex:auto}.CuekEG_tabBody>.CuekEG_empty{flex:auto;justify-content:center}.CuekEG_tabBody>.CuekEG_detail .CuekEG_detailTabsBar{height:37px;min-height:37px}.CuekEG_tabBody>.CuekEG_detail .CuekEG_detailTab{padding-bottom:9px}.CuekEG_tabBody>.CuekEG_detail .CuekEG_detailActions{margin-right:calc(6px - var(--detail-gutter))}.CuekEG_detailHeader{align-items:flex-start;gap:10px;margin-bottom:4px;display:flex}.CuekEG_editName{width:100%;min-width:0;min-height:32px;color:var(--dsw-alias-label-primary);background:0 0;border:0;outline:0;flex:1;padding:0;font-size:20px;font-weight:500;line-height:28px}@media (hover:hover){.CuekEG_editName:hover{box-shadow:0 1px var(--dsw-alias-border-l3)}}.CuekEG_editName:focus{box-shadow:0 1px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}.CuekEG_readonlyName{overflow-wrap:anywhere;flex:1;min-width:0;margin:0;padding:2px 0;font-size:20px;font-weight:500;line-height:28px}.CuekEG_nextRun{min-height:20px;color:var(--dsw-alias-label-tertiary);align-items:center;gap:6px;margin-bottom:20px;font-size:13px;line-height:20px;display:flex}.CuekEG_nextRun p{overflow-wrap:anywhere;min-width:0;margin:0}.CuekEG_nextRunRelative{color:inherit}.CuekEG_tabTitleIcon{color:var(--dsw-alias-label-secondary);flex:none}.CuekEG_detailTabsBar{height:44px;min-height:44px;padding:0 var(--detail-gutter);border-bottom:.5px solid var(--dsw-alias-border-l3);flex-shrink:0;justify-content:space-between;align-items:center;gap:20px;display:flex}.CuekEG_detailTabs{scrollbar-width:none;flex:auto;align-self:flex-end;gap:36px;min-width:0;margin-bottom:-1px;padding-bottom:1px;display:flex;overflow-x:auto}.CuekEG_detailTabs::-webkit-scrollbar{display:none}.CuekEG_detailActions{flex:none;align-items:center;margin-right:-8px}.CuekEG_detailIconButton{width:28px;height:28px;color:var(--dsw-alias-label-tertiary);flex:none;padding:0}.CuekEG_detailTab{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;flex:none;padding:0 0 13px;font-size:13px;font-weight:500;line-height:16px;position:relative}.CuekEG_detailTab:after{content:\"\";background:0 0;border-radius:2px;height:2px;position:absolute;bottom:-1px;left:0;right:0}.CuekEG_detailTab[aria-selected=true]{color:var(--dsw-alias-state-business-primary)}.CuekEG_detailTab[aria-selected=true]:after{background:var(--dsw-alias-state-business-primary)}.CuekEG_detailScroll{min-height:0;padding:24px var(--detail-gutter) 28px;scrollbar-gutter:stable;--dsh-scrollbar-width:9px;--dsh-scrollbar-thumb-border:2px;flex:1;overflow:auto}.CuekEG_detailRecords{scrollbar-gutter:auto;flex-direction:column;padding:0;display:flex;overflow:hidden}.CuekEG_detailRecords>.CuekEG_notice{margin:24px var(--detail-gutter) 0}.CuekEG_recordsPanel:not([hidden]),.CuekEG_deliveryHistory{flex-direction:column;flex:1;min-height:0;display:flex}.CuekEG_retentionEnd{padding:0 var(--detail-gutter) 16px;color:var(--dsw-alias-label-tertiary);flex:none;font-size:12px;line-height:20px}.CuekEG_retentionLine{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.CuekEG_retentionInfo{width:24px;height:24px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:4px;flex:none;justify-content:center;align-items:center;padding:5px;display:inline-flex}@media (hover:hover){.CuekEG_retentionInfo:hover{color:var(--dsw-alias-label-primary)}}.CuekEG_retentionInfo:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.CuekEG_retentionRule{background:var(--dsw-alias-bg-layer-1);border-radius:8px;margin-top:12px;padding:12px 14px}.CuekEG_retentionRule p{margin:0}.CuekEG_retentionRule p+p{margin-top:6px}.CuekEG_ruleCard{margin-top:28px}.CuekEG_ruleCard h3{color:var(--dsw-alias-label-tertiary);margin:0 0 8px 10px;font-size:13px;font-weight:400;line-height:20px}.CuekEG_ruleRows{border:.5px solid var(--dsw-alias-border-l3);border-radius:16px;flex-direction:column;padding:0 12px;display:flex}.CuekEG_menuGuard{display:contents}.CuekEG_zoneMenu.CuekEG_zoneMenu{height:min(420px,100dvh - 48px);max-height:min(420px,100dvh - 48px)}.CuekEG_zoneMenu [role=separator]{background:var(--dsw-alias-border-l3);height:.5px;margin:6px 4px}.CuekEG_ruleRow,.CuekEG_ruleRowMenu{border-bottom:.5px solid var(--dsw-alias-border-l3);width:100%;display:flex}.CuekEG_ruleRow{justify-content:space-between;align-items:center;gap:12px;min-height:48px}.CuekEG_ruleRows>:last-child,.CuekEG_ruleRows>:last-child>.CuekEG_ruleRowMenu{border-bottom:0}.CuekEG_ruleLabel{color:var(--dsw-alias-label-primary);flex:none;font-size:14px;line-height:1.6}.CuekEG_ruleControl{margin-right:0}.CuekEG_ruleRows .CuekEG_ruleControl:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}.CuekEG_ruleValue{width:100%;min-height:48px;color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;background:0 0;border:none;justify-content:space-between;align-items:center;gap:12px;margin:0;padding:0;font-size:14px;line-height:1.6;display:flex}.CuekEG_ruleValueFace{border-radius:18px;flex:0 auto;align-items:center;gap:6px;min-width:0;min-height:32px;padding:0 8px;transition:background .15s;display:flex}@media (hover:hover){.CuekEG_ruleValue:not(:disabled):hover .CuekEG_ruleValueFace{background:var(--dsw-alias-interactive-bg-hover)}}.CuekEG_ruleRows .CuekEG_ruleValue:focus-visible{outline:none}.CuekEG_ruleValue:focus-visible .CuekEG_ruleValueFace{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}.CuekEG_ruleValueFace>svg{color:var(--dsw-alias-label-tertiary);flex:none}.CuekEG_ruleValue:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}.CuekEG_ruleCurrent{text-align:right;text-overflow:ellipsis;white-space:nowrap;flex:0 auto;min-width:0;overflow:hidden}.CuekEG_zoneSearch{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);width:100%;color:var(--dsw-alias-label-primary);font:inherit;border-radius:7px;outline:none;padding:6px 8px;font-size:13px;line-height:20px}.CuekEG_zoneSearch:focus{border-color:var(--dsw-alias-state-business-primary)}.CuekEG_ruleWeekdays{flex-wrap:wrap;justify-content:flex-end;gap:4px;padding:6px 0;display:flex}.CuekEG_ruleMonthDays{grid-template-columns:repeat(7,minmax(36px,max-content));justify-content:flex-end;gap:4px;padding:6px 0;display:grid}.CuekEG_ruleMonthDays>*{justify-content:center;justify-self:stretch}.CuekEG_ruleInput{min-width:0;color:var(--dsw-alias-label-primary);font:inherit;text-align:right;background:0 0;border:none;border-radius:18px;flex:0 58%;margin-right:0;padding:5px 8px;font-size:14px;transition:background .15s}@media (hover:hover){.CuekEG_ruleInput:not(:disabled):hover{background:var(--dsw-alias-interactive-bg-hover)}}.CuekEG_ruleInput:disabled{color:var(--dsw-alias-label-tertiary)}.CuekEG_ruleInterval{flex:none;align-items:center;gap:8px;min-width:0;display:flex}.CuekEG_ruleIntervalStepper{background:var(--dsw-alias-bg-module-platform);border-radius:18px;justify-content:center;align-items:center;min-width:72px;height:36px;display:inline-flex;position:relative}.CuekEG_ruleIntervalInput{box-sizing:border-box;width:calc(var(--interval-digits,1) * 1ch + 52px);appearance:textfield;border-radius:inherit;font-variant-numeric:tabular-nums;text-align:center;flex:0 auto;min-width:72px;height:100%;padding:0 26px}.CuekEG_ruleIntervalInput::-webkit-outer-spin-button,.CuekEG_ruleIntervalInput::-webkit-inner-spin-button{appearance:none;margin:0}@media (hover:hover){.CuekEG_ruleIntervalInput:not(:disabled):hover{background:0 0}}.CuekEG_ruleRows .CuekEG_ruleIntervalInput:focus-visible{outline:none}.CuekEG_ruleIntervalArrows{opacity:0;flex-direction:column;gap:2px;display:flex;position:absolute;right:8px}@media (hover:hover){.CuekEG_ruleIntervalStepper:hover .CuekEG_ruleIntervalArrows{opacity:1}}.CuekEG_ruleIntervalStepper:focus-within .CuekEG_ruleIntervalArrows{opacity:1}@media (hover:none){.CuekEG_ruleIntervalArrows{opacity:1}}.CuekEG_ruleIntervalArrow{background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 75%, transparent);width:17px;height:12px;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:3px;justify-content:center;align-items:center;padding:0;display:inline-flex}@media (hover:hover){.CuekEG_ruleIntervalArrow:hover:not(:disabled){background:var(--dsw-alias-bg-layer-1)}}.CuekEG_ruleIntervalArrow:disabled{color:var(--dsw-alias-label-caption);cursor:default}.CuekEG_ruleIntervalUnit{color:var(--dsw-alias-label-primary);flex:none;font-size:14px}.CuekEG_pickerTrigger{cursor:pointer;flex:0 auto;justify-content:flex-end;align-items:center;gap:6px;display:inline-flex}.CuekEG_pickerTrigger:disabled{cursor:default}.CuekEG_pickerIcon{color:var(--dsw-alias-label-tertiary);flex:none}.CuekEG_ruleHint{color:var(--dsw-alias-label-tertiary);margin:8px 0 0 10px;font-size:13px;line-height:1.6}.CuekEG_ruleHintError{color:var(--dsw-alias-state-error-primary)}.CuekEG_instruction{box-sizing:border-box;field-sizing:content;border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);width:100%;max-width:100%;min-height:112px;max-height:160px;color:var(--dsw-alias-label-primary);font:inherit;resize:none;--dsh-scrollbar-width:9px;--dsh-scrollbar-thumb-border:2px;--dsh-scrollbar-track-margin:12px;border-radius:16px;outline:0;margin:0;padding:12px;font-size:14px;line-height:24px;transition:border-color .15s;display:block}@media (hover:hover){.CuekEG_instruction:hover{border-color:var(--dsw-alias-border-l2)}}.CuekEG_instruction:focus{border-color:var(--dsw-alias-state-business-primary)}.CuekEG_readonlyPrompt{white-space:pre-wrap;overflow-wrap:anywhere;margin:0;font-size:14px;line-height:24px}.CuekEG_delivery{border-radius:8px;align-items:flex-start;gap:12px;margin:0 -8px;padding:14px 8px;font-size:14px;line-height:22px;display:flex;position:relative}.CuekEG_delivery:first-of-type{padding-top:0}.CuekEG_delivery:before,.CuekEG_delivery:after{background:var(--dsw-alias-border-l3);width:.5px;position:absolute;left:15.75px}.CuekEG_delivery:not(:first-of-type):before{content:\"\";height:14px;top:0}.CuekEG_delivery:not(:last-of-type):after{content:\"\";top:42px;bottom:0}.CuekEG_delivery:first-of-type:not(:last-of-type):after{top:28px}.CuekEG_deliveryGlyph{color:var(--dsw-alias-label-tertiary);flex:none;margin-top:6px}.CuekEG_deliveryBody{flex:1;min-width:0;padding:2px 0}.CuekEG_deliveryHead{align-items:center;gap:10px;display:flex}.CuekEG_deliveryTime{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:22px;display:block}.CuekEG_confirmTitle{white-space:pre-wrap;overflow-wrap:anywhere;margin:0}.CuekEG_savedPrompt{-webkit-line-clamp:2;line-clamp:2;color:var(--dsw-alias-label-tertiary);white-space:pre-wrap;overflow-wrap:anywhere;-webkit-box-orient:vertical;margin:6px 0 0;font-size:13px;line-height:22px;display:-webkit-box;overflow:hidden}.CuekEG_savedPrompt[data-expanded]{-webkit-line-clamp:none;line-clamp:none;display:block}.CuekEG_savedPromptToggle{border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;align-items:center;gap:2px;margin:2px 0 0 -6px;padding:1px 6px;font-size:12px;line-height:20px;display:inline-flex}@media (hover:hover){.CuekEG_savedPromptToggle:hover{background:var(--dsw-alias-interactive-bg-hover)}}.CuekEG_savedPromptToggle:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.CuekEG_detailActions,.CuekEG_confirmActions{flex-wrap:wrap;justify-content:flex-end;gap:8px;display:flex}.CuekEG_detailHeader{flex-shrink:0}.CuekEG_detailContext{flex:none;align-items:center;min-width:0;max-width:200px;display:flex}.CuekEG_detailContext:has(>button:disabled){cursor:not-allowed}.CuekEG_detailContext>button:disabled{pointer-events:none}.CuekEG_saveFooter{padding:20px var(--detail-gutter);border-top:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-base);flex-shrink:0;justify-content:flex-end;align-items:center;gap:8px;display:flex}.CuekEG_saveFooter>button{height:32px;font-size:13px}.CuekEG_saveFooter>:last-child{margin-right:-8px}.CuekEG_saveNotice{color:var(--dsw-alias-label-tertiary);margin-right:auto;font-size:12px}.CuekEG_saveFailure{padding:12px var(--detail-gutter) 0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-state-error-primary);flex-shrink:0;margin:0;font-size:12px;line-height:1.6}.CuekEG_linkedSession{text-align:left;border:0;border-radius:14px;flex:0 auto;align-items:center;gap:6px;min-width:0;max-width:100%;height:28px;padding:0 8px;display:flex}.CuekEG_linkedSession:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}.CuekEG_detailNotice{padding:0 var(--detail-gutter) 6px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;background:var(--dsw-alias-bg-base);flex-shrink:0;margin:0;font-size:12px}.CuekEG_linkedSessionLabel{color:var(--dsw-alias-label-secondary);flex-shrink:0;font-size:13px}.CuekEG_linkedSessionTarget{justify-content:flex-end;align-items:center;gap:4px;min-width:0;display:flex;overflow:hidden}.CuekEG_linkedSessionName{clip:rect(0 0 0 0);white-space:nowrap;width:1px;height:1px;font-size:12px;position:absolute;overflow:hidden}.CuekEG_confirmDialog{box-sizing:border-box;max-height:calc(100dvh - 48px)}.CuekEG_confirmContent{overscroll-behavior:contain;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);min-height:0;overflow-y:auto}.CuekEG_confirmDialog>:last-child{flex-shrink:0}.CuekEG_deleteButton{color:var(--dsw-alias-state-error-primary);--dsh-button-outline-color:var(--dsw-alias-state-error-primary)}.CuekEG_page :focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}.CuekEG_page .CuekEG_editName:focus-visible,.CuekEG_page .CuekEG_instruction:focus-visible{outline:none}@media (width<=1100px){.CuekEG_detail{--detail-gutter:20px}}@media (width<=760px){.CuekEG_hasDetails .CuekEG_listPane{display:none}.CuekEG_detail{border-left:0;flex-basis:100%}.CuekEG_detailScroll{padding-top:20px}.CuekEG_saveNotice{display:none}}@media (width<=400px){.CuekEG_detail{--detail-gutter:16px}.CuekEG_detailTabsBar{gap:16px}.CuekEG_detailActions{gap:0}}@media (pointer:coarse){.CuekEG_searchField input,.CuekEG_instruction,.CuekEG_ruleInput,.CuekEG_zoneSearch{font-size:16px}}";
		const tagId$5 = "@deepseek-ai/dsh-client-ui-schedule/TaskManagerPage.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$5) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-schedule";
			tag.dataset.pluginCss = tagId$5;
			tag.textContent = css$5;
			document.head.appendChild(tag);
		}
		var TaskManagerPage_module_css_default = {
			"catalogActions": "CuekEG_catalogActions",
			"catalogMore": "CuekEG_catalogMore",
			"confirmActions": "CuekEG_confirmActions",
			"confirmContent": "CuekEG_confirmContent",
			"confirmDialog": "CuekEG_confirmDialog",
			"confirmTitle": "CuekEG_confirmTitle",
			"creationActions": "CuekEG_creationActions",
			"deleteButton": "CuekEG_deleteButton",
			"delivery": "CuekEG_delivery",
			"deliveryBody": "CuekEG_deliveryBody",
			"deliveryGlyph": "CuekEG_deliveryGlyph",
			"deliveryHead": "CuekEG_deliveryHead",
			"deliveryHistory": "CuekEG_deliveryHistory",
			"deliveryTime": "CuekEG_deliveryTime",
			"detail": "CuekEG_detail",
			"detailActions": "CuekEG_detailActions",
			"detailContext": "CuekEG_detailContext",
			"detailHeader": "CuekEG_detailHeader",
			"detailIconButton": "CuekEG_detailIconButton",
			"detailNotice": "CuekEG_detailNotice",
			"detailRecords": "CuekEG_detailRecords",
			"detailScroll": "CuekEG_detailScroll",
			"detailTab": "CuekEG_detailTab",
			"detailTabs": "CuekEG_detailTabs",
			"detailTabsBar": "CuekEG_detailTabsBar",
			"editName": "CuekEG_editName",
			"empty": "CuekEG_empty",
			"emptyAction": "CuekEG_emptyAction",
			"emptyGlyph": "CuekEG_emptyGlyph",
			"emptyIllustration": "CuekEG_emptyIllustration",
			"emptyTitle": "CuekEG_emptyTitle",
			"endedRow": "CuekEG_endedRow",
			"filterTab": "CuekEG_filterTab",
			"filterTabActive": "CuekEG_filterTabActive",
			"filterTabs": "CuekEG_filterTabs",
			"filters": "CuekEG_filters",
			"hasDetails": "CuekEG_hasDetails",
			"headerAction": "CuekEG_headerAction",
			"instruction": "CuekEG_instruction",
			"linkedSession": "CuekEG_linkedSession",
			"linkedSessionLabel": "CuekEG_linkedSessionLabel",
			"linkedSessionName": "CuekEG_linkedSessionName",
			"linkedSessionTarget": "CuekEG_linkedSessionTarget",
			"list": "CuekEG_list",
			"listPane": "CuekEG_listPane",
			"listRows": "CuekEG_listRows",
			"menuGuard": "CuekEG_menuGuard",
			"metadata": "CuekEG_metadata",
			"nextRun": "CuekEG_nextRun",
			"nextRunRelative": "CuekEG_nextRunRelative",
			"notice": "CuekEG_notice",
			"page": "CuekEG_page",
			"pageContent": "CuekEG_pageContent",
			"pageHeading": "CuekEG_pageHeading",
			"pageScroll": "CuekEG_pageScroll",
			"pickerIcon": "CuekEG_pickerIcon",
			"pickerTrigger": "CuekEG_pickerTrigger",
			"readonlyName": "CuekEG_readonlyName",
			"readonlyPrompt": "CuekEG_readonlyPrompt",
			"recordsPanel": "CuekEG_recordsPanel",
			"retentionEnd": "CuekEG_retentionEnd",
			"retentionInfo": "CuekEG_retentionInfo",
			"retentionLine": "CuekEG_retentionLine",
			"retentionRule": "CuekEG_retentionRule",
			"row": "CuekEG_row",
			"rowContent": "CuekEG_rowContent",
			"rowGlyph": "CuekEG_rowGlyph",
			"rowSummary": "CuekEG_rowSummary",
			"rowTitle": "CuekEG_rowTitle",
			"ruleCard": "CuekEG_ruleCard",
			"ruleControl": "CuekEG_ruleControl",
			"ruleCurrent": "CuekEG_ruleCurrent",
			"ruleHint": "CuekEG_ruleHint",
			"ruleHintError": "CuekEG_ruleHintError",
			"ruleInput": "CuekEG_ruleInput",
			"ruleInterval": "CuekEG_ruleInterval",
			"ruleIntervalArrow": "CuekEG_ruleIntervalArrow",
			"ruleIntervalArrows": "CuekEG_ruleIntervalArrows",
			"ruleIntervalInput": "CuekEG_ruleIntervalInput",
			"ruleIntervalStepper": "CuekEG_ruleIntervalStepper",
			"ruleIntervalUnit": "CuekEG_ruleIntervalUnit",
			"ruleLabel": "CuekEG_ruleLabel",
			"ruleMonthDays": "CuekEG_ruleMonthDays",
			"ruleRow": "CuekEG_ruleRow",
			"ruleRowMenu": "CuekEG_ruleRowMenu",
			"ruleRows": "CuekEG_ruleRows",
			"ruleValue": "CuekEG_ruleValue",
			"ruleValueFace": "CuekEG_ruleValueFace",
			"ruleWeekdays": "CuekEG_ruleWeekdays",
			"saveFailure": "CuekEG_saveFailure",
			"saveFooter": "CuekEG_saveFooter",
			"saveNotice": "CuekEG_saveNotice",
			"savedPrompt": "CuekEG_savedPrompt",
			"savedPromptToggle": "CuekEG_savedPromptToggle",
			"searchClear": "CuekEG_searchClear",
			"searchField": "CuekEG_searchField",
			"searchTools": "CuekEG_searchTools",
			"selectedRow": "CuekEG_selectedRow",
			"tabBody": "CuekEG_tabBody",
			"tabTitleIcon": "CuekEG_tabTitleIcon",
			"zoneMenu": "CuekEG_zoneMenu",
			"zoneSearch": "CuekEG_zoneSearch"
		};
		//#endregion
		//#region lib/types/client/CatalogFeedback.js
		/**
		* Render the catalog's loading and query-failure states.
		*
		* An empty panel centers a bare spinner while loading and the failure with its
		* retry; a panel that already shows content keeps a compact notice for a failed
		* refresh, and stays silent while a refresh loads, so the retained rows remain
		* readable. Deletion outcomes are not catalog states: the app-wide toast
		* announces them.
		* @param props - query state, whether content is shown, the retry action, and localized copy.
		* @returns the applicable states, or nothing while the catalog is ready.
		*/
		function CatalogFeedback({ status, populated, onRetry, t }) {
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [status === "loading" && !populated && (0, react_jsx_runtime.jsx)("div", {
				className: TaskManagerPage_module_css_default.empty,
				role: "status",
				"aria-label": t("list.loading"),
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" })
			}), status === "error" && (populated ? (0, react_jsx_runtime.jsxs)("div", {
				className: TaskManagerPage_module_css_default.notice,
				children: [(0, react_jsx_runtime.jsx)("p", {
					role: "alert",
					children: t("list.error")
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					size: "sm",
					onClick: () => {
						onRetry();
					},
					children: t("list.retry")
				})]
			}) : (0, react_jsx_runtime.jsxs)("div", {
				className: TaskManagerPage_module_css_default.empty,
				children: [
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {
						size: 24,
						className: TaskManagerPage_module_css_default.emptyGlyph
					}),
					(0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: TaskManagerPage_module_css_default.emptyTitle,
						children: t("list.error")
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						className: TaskManagerPage_module_css_default.emptyAction,
						onClick: () => {
							onRetry();
						},
						children: t("list.retry")
					})
				]
			}))] });
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region lib/types/client/CalendarIcon.js
		/**
		* Draw the 14px calendar outline the Date row's trigger carries.
		*
		* The shared product icon set has no calendar glyph, so this package draws the
		* one its own picker needs, at that set's regular 1px stroke.
		* @param props - extra class for layout placement.
		* @returns the decorative glyph.
		*/
		function IconCalendarOutlineRegular({ className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "14",
				height: "14",
				className,
				viewBox: "0 0 14 14",
				fill: "none",
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": "true",
				strokeWidth: "1",
				children: [
					(0, react_jsx_runtime.jsx)("rect", {
						x: "1.4",
						y: "2.6",
						width: "11.2",
						height: "10",
						rx: "1.6",
						stroke: "currentColor"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M1.4 5.6H12.6",
						stroke: "currentColor"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M4.4 1.4V3.6M9.6 1.4V3.6",
						stroke: "currentColor"
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/task-timing.js
		/**
		* Project only persisted rule fields, excluding catalog metadata and delivery receipts.
		* @param record - Rule from the current catalog.
		* @returns Independent complete expected rule for compare-and-update.
		*/
		function timingSnapshot(record) {
			const common = {
				id: record.id,
				title: record.title,
				prompt: record.prompt,
				scheduledAt: record.scheduledAt
			};
			switch (record.kind) {
				case "at": return {
					...common,
					kind: record.kind
				};
				case "after": return {
					...common,
					kind: record.kind,
					afterSeconds: record.afterSeconds
				};
				case "every": return {
					...common,
					kind: record.kind,
					everySeconds: record.everySeconds
				};
				case "daily": return {
					...common,
					kind: record.kind,
					time: record.time,
					timeZone: record.timeZone
				};
				case "weekly": return {
					...common,
					kind: record.kind,
					time: record.time,
					timeZone: record.timeZone,
					weekdays: [...record.weekdays]
				};
				case "cron": return {
					...common,
					kind: record.kind,
					expression: record.expression,
					timeZone: record.timeZone
				};
			}
			/* v8 ignore next -- Exhaustiveness guard for the closed ScheduleRecord union. */
			return assertNever(record);
		}
		/**
		* Zone a rule without a stored zone falls back to when the runtime cannot name
		* the device zone. A runtime that reports no zone stores `undefined`, which is
		* not an IANA id, so the draft needs one explicit fallback.
		*/
		const FALLBACK_ZONE = "UTC";
		/** IANA id the runtime reports for this device, or the explicit fallback. */
		function deviceZone() {
			return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_ZONE;
		}
		/** Zone one rule carries when it stores one, otherwise undefined. */
		function storedZone(record) {
			return "timeZone" in record ? record.timeZone : void 0;
		}
		/**
		* The zone a new or switched-to rule starts its clock rows in, and whether that
		* zone came from the stored rule rather than this device.
		*
		* A daily, weekly, or cron record stores the zone its wall clock means, so
		* editing it keeps that zone. A one-shot `at` target and an `after` interval
		* store only the committed instant and no creation zone, so they start in this
		* device's zone.
		* @param record - rule the draft is seeded from.
		* @returns the draft's IANA zone and whether it is the no-stored-zone fallback.
		*/
		function draftZone(record) {
			const stored = storedZone(record);
			return stored === void 0 ? {
				zone: deviceZone(),
				stored: false
			} : {
				zone: stored,
				stored: true
			};
		}
		/**
		* The date and clock one instant names in one zone, keeping millisecond precision.
		*
		* The locale is fixed, so the field order never follows the interface language,
		* and each field is read by name rather than from a formatted string.
		* @param instant - canonical ISO instant.
		* @param zone - IANA zone the returned wall clock is expressed in.
		* @returns `YYYY-MM-DDTHH:MM:SS.mmm` in that zone.
		*/
		function zonedWallClock(instant, zone) {
			const at = new Date(instant);
			if (Number.isNaN(at.getTime())) return "";
			try {
				const fields = new Map(new Intl.DateTimeFormat("en-US", {
					timeZone: zone,
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					fractionalSecondDigits: 3,
					hourCycle: "h23"
				}).formatToParts(at).map((part) => [part.type, part.value]));
				return `${`${fields.get("year")}-${fields.get("month")}-${fields.get("day")}`}T${`${fields.get("hour")}:${fields.get("minute")}:${fields.get("second")}.${fields.get("fractionalSecond")}`}`;
			} catch {
				return "";
			}
		}
		/**
		* Initialize one-shot inputs in the zone the rule states, or in this device's
		* zone for a rule that stores none.
		*
		* An `at` target stores an instant and no creation zone, so its rows show that
		* instant in the draft's zone: the shown pair names the instant the record
		* already commits rather than restating it in a zone the record does not have.
		* @param record - Expected rule captured when editing starts.
		* @returns Native input values without rounding seconds or milliseconds.
		*/
		function timingDraft(record) {
			const draft = {
				date: "",
				time: "",
				timeZone: "",
				seconds: "",
				expression: ""
			};
			switch (record.kind) {
				case "at":
				case "after": {
					const zone = draftZone(record).zone;
					const wallClock = zonedWallClock(record.scheduledAt, zone);
					return {
						...draft,
						date: wallClock.slice(0, 10),
						time: wallClock.slice(11, 23),
						timeZone: zone
					};
				}
				case "every": return {
					...draft,
					seconds: String(record.everySeconds)
				};
				case "daily":
				case "weekly": return {
					...draft,
					time: record.time,
					timeZone: record.timeZone
				};
				case "cron": return {
					...draft,
					expression: record.expression,
					timeZone: record.timeZone
				};
			}
			/* v8 ignore next -- Exhaustiveness guard for the closed ScheduleRecord union. */
			return assertNever(record);
		}
		/**
		* One date as the rows and pickers expose it.
		*
		* The draft, the calendar's own comparisons, and the text submitted to the Host
		* all stay `YYYY-MM-DD`; only the exposed text takes the slashed form the design
		* states, so no caller has to parse or re-format a date merely to show it.
		* @param date - stored or staged ISO date text.
		* @returns the same date with slashes between its fields.
		*/
		function slashDate(date) {
			return date.replaceAll("-", "/");
		}
		/**
		* One clock time at whole-second precision.
		*
		* The rows and the clock picker both show `HH:MM:SS`; an untouched stored value
		* keeps its milliseconds in the draft so a save can submit them back.
		* @param time - stored or staged clock text, with or without fractional seconds.
		* @returns the same clock time at whole-second precision, or the input when it is not a clock time.
		*/
		function secondPrecision(time) {
			const match = /^(\d{2}):(\d{2})(?::(\d{2}))?/.exec(time);
			if (match === null) return time;
			return `${match[1]}:${match[2]}:${match[3] ?? "00"}`;
		}
		/**
		* Localize controlled Host failures without exposing transport or storage diagnostics.
		* @param code - Error code returned by the timing update.
		* @returns Dictionary key describing the recovery action.
		*/
		function timingError(code) {
			switch (code) {
				case "schedule_conflict": return "timing.conflict";
				case "schedule_ended": return "timing.inactive";
				case "schedule_not_found": return "timing.notFound";
				case "subagent_session": return "timing.subagentSession";
				case "invalid_time_zone": return "timing.invalidZone";
				case "not_future": return "timing.notFuture";
				case "frequency_too_high": return "timing.invalidInterval";
				case "invalid_prompt":
				case "invalid_selector":
				case "invalid_rule":
				case "time_out_of_range": return "timing.invalid";
				case "internal_error": return "timing.error";
			}
			/* v8 ignore next -- Exhaustiveness guard for the closed ScheduleUpdateResult error-code union. */
			return assertNever(code);
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-schedule/src/client/PickerPopover.module.css.mjs
		const css$4 = "._3_OqMa_panel{box-sizing:border-box;z-index:1100;background:var(--dsw-specific-menu);backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border:0;border-radius:16px;display:flex;position:fixed;top:auto;left:auto}";
		const tagId$4 = "@deepseek-ai/dsh-client-ui-schedule/PickerPopover.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-schedule";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var PickerPopover_module_css_default = { "panel": "_3_OqMa_panel" };
		//#endregion
		//#region lib/types/client/PickerPopover.js
		/** Anchored, outside-dismissed popover shell the timing pickers share. */
		/** Unplaced portal frame: laid out at the viewport origin but unpainted until measured. */
		const MEASURE_STYLE$1 = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		/**
		* Render one picker panel into `document.body`, fixed below its trigger.
		*
		* The panel is a portal, so an ancestor's `overflow` cannot crop it, and a
		* pointerdown outside both the trigger and the panel dismisses it.
		* @param props - open state, the trigger, the panel name and layout class, the dismissal callback, and the contents.
		* @returns the panel while open, and nothing while closed.
		*/
		function PickerPopover({ open, anchorRef, label, className, onClose, children }) {
			const panelRef = (0, react.useRef)(null);
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(anchorRef, open, onClose, panelRef);
			const position = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open,
				anchorRef,
				panelRef,
				gap: 4,
				margin: 12
			});
			if (!open) return null;
			return (0, react_dom.createPortal)((0, react_jsx_runtime.jsx)("div", {
				ref: panelRef,
				className: clsx(PickerPopover_module_css_default.panel, className),
				style: position ?? MEASURE_STYLE$1,
				role: "dialog",
				"aria-label": label,
				onClick: (event) => {
					event.stopPropagation();
				},
				children
			}), document.body);
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-schedule/src/client/ClockPicker.module.css.mjs
		const css$3 = ".b6bcKa_clock{flex-direction:row;gap:2px;padding:3px}.b6bcKa_column{overscroll-behavior:contain;flex-direction:column;width:52px;max-height:216px;display:flex;overflow-y:auto}.b6bcKa_option{min-height:32px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;cursor:pointer;border-radius:10px;outline:none;flex:none;justify-content:center;align-items:center;font-size:13px;line-height:1.6;display:flex}@media (hover:hover){.b6bcKa_option:hover{background:var(--dsw-alias-interactive-bg-hover)}}.b6bcKa_option:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}.b6bcKa_selected{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-button-ghost-active-fill);box-shadow:inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)}";
		const tagId$3 = "@deepseek-ai/dsh-client-ui-schedule/ClockPicker.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-schedule";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var ClockPicker_module_css_default = {
			"clock": "b6bcKa_clock",
			"column": "b6bcKa_column",
			"option": "b6bcKa_option",
			"selected": "b6bcKa_selected"
		};
		//#endregion
		//#region lib/types/client/ClockPicker.js
		/**
		* Three-column clock picker for one staged Run time value.
		*
		* The picker owns only the panel: the row renders the read-only trigger that
		* shows the value, and its Escape guard closes the panel and hands focus back.
		*/
		/** Padded two-digit clock values from zero through `count - 1`. */
		function padded(count) {
			return Array.from({ length: count }, (_value, index) => String(index).padStart(2, "0"));
		}
		/** The picker's columns in display order, each with the label row copy names it by. */
		const COLUMNS = [
			{
				label: "timing.hour",
				options: padded(24)
			},
			{
				label: "timing.minute",
				options: padded(60)
			},
			{
				label: "timing.second",
				options: padded(60)
			}
		];
		/** A whole-second clock, the only text a pick composes onto. */
		const CLOCK_SECONDS = /^\d{2}:\d{2}:\d{2}$/;
		/**
		* The `HH:MM:SS` clock a pick composes onto.
		*
		* A value that states no clock at all starts from midnight, so the first pick
		* still submits one complete clock rather than leaving a row empty.
		* @param value - staged clock text.
		* @returns its whole-second clock, or midnight when it states none.
		*/
		function clockBase(value) {
			const seconds = secondPrecision(value);
			return CLOCK_SECONDS.test(seconds) ? seconds : "00:00:00";
		}
		/** The picker's columns in display order, by position. */
		const COLUMN_INDICES = [
			0,
			1,
			2
		];
		/**
		* Index of one column's option for one clock.
		* @param clock - whole-second clock text.
		* @param column - column index in display order.
		* @returns that column's option index, or the first option for a value the column does not list.
		*/
		function columnIndex(clock, column) {
			const options = COLUMNS[column].options;
			const start = column === 0 ? 0 : column * 3;
			return Math.max(0, options.indexOf(clock.slice(start, start + 2)));
		}
		/**
		* Render the clock panel: hours, minutes, and optionally seconds, one scrolling column each.
		* @param props - open state, the trigger, the staged clock, the pick and close callbacks, the seconds-column switch, and row copy.
		* @returns the anchored panel while open, and nothing while closed.
		*/
		function ClockPicker({ open, anchorRef, value, onPick, onClose, seconds = true, t }) {
			const columns = seconds ? COLUMNS : COLUMNS.slice(0, 2);
			const refs = (0, react.useRef)(/* @__PURE__ */ new Map());
			const valueRef = (0, react.useRef)(value);
			valueRef.current = value;
			const base = clockBase(value);
			const picked = [
				base.slice(0, 2),
				base.slice(3, 5),
				base.slice(6, 8)
			];
			const columnIndices = COLUMN_INDICES.map((column) => columnIndex(base, column));
			const [cursor, setCursor] = (0, react.useState)({
				column: 0,
				index: columnIndex(base, 0)
			});
			(0, react.useEffect)(() => {
				if (!open) return;
				setCursor({
					column: 0,
					index: columnIndex(clockBase(valueRef.current), 0)
				});
				for (const column of COLUMN_INDICES) refs.current.get(`${column}:${columnIndex(clockBase(valueRef.current), column)}`)?.scrollIntoView({ block: "nearest" });
			}, [open]);
			(0, react.useEffect)(() => {
				if (!open) return;
				refs.current.get(`${cursor.column}:${cursor.index}`)?.focus();
			}, [open, cursor]);
			/**
			* Stage one option and move the cursor onto it.
			* @param column - column index the option belongs to.
			* @param option - padded option text.
			* @param index - option index inside that column.
			*/
			const pick = (column, option, index) => {
				setCursor({
					column,
					index
				});
				const next = [...picked];
				next[column] = option;
				onPick(next.join(":"));
			};
			/**
			* Move inside one column, move between columns, or stage the option the
			* keyboard is on.
			* @param event - keydown from that option.
			* @param column - column index the option belongs to.
			* @param index - option index inside that column.
			* @param option - padded option text.
			* @param count - number of options in the column.
			*/
			const onOptionKeyDown = (event, column, index, option, count) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					pick(column, option, index);
					return;
				}
				if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
					event.preventDefault();
					const next = columns[column + (event.key === "ArrowRight" ? 1 : -1)];
					if (next === void 0) return;
					setCursor({
						column: columns.indexOf(next),
						index: Math.min(index, next.options.length - 1)
					});
					return;
				}
				if (event.key === "Home" || event.key === "End") {
					event.preventDefault();
					setCursor({
						column,
						index: event.key === "Home" ? 0 : count - 1
					});
					return;
				}
				if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
				event.preventDefault();
				const step = event.key === "ArrowDown" ? 1 : -1;
				setCursor({
					column,
					index: Math.min(Math.max(index + step, 0), count - 1)
				});
			};
			return (0, react_jsx_runtime.jsx)(PickerPopover, {
				open,
				anchorRef,
				label: t("timing.time"),
				className: ClockPicker_module_css_default.clock,
				onClose,
				children: columns.map((column, at) => (0, react_jsx_runtime.jsx)("div", {
					role: "listbox",
					"aria-label": t(column.label),
					className: ClockPicker_module_css_default.column,
					children: column.options.map((option, index) => (0, react_jsx_runtime.jsx)("div", {
						ref: (element) => {
							const key = `${at}:${index}`;
							if (element === null) refs.current.delete(key);
							else refs.current.set(key, element);
						},
						role: "option",
						"aria-selected": option === picked[at],
						tabIndex: (cursor.column === at ? cursor.index : columnIndices[at]) === index ? 0 : -1,
						className: clsx(ClockPicker_module_css_default.option, option === picked[at] && ClockPicker_module_css_default.selected),
						onClick: () => {
							pick(at, option, index);
						},
						onKeyDown: (event) => {
							onOptionKeyDown(event, at, index, option, column.options.length);
						},
						children: option
					}, option))
				}, column.label))
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-schedule/src/client/DatePicker.module.css.mjs
		const css$2 = ".xdnLGq_calendar{flex-direction:column;gap:4px;width:232px;padding:8px}.xdnLGq_head{justify-content:space-between;align-items:center;gap:4px;display:flex}.xdnLGq_title{color:var(--dsw-alias-label-primary);text-align:center;flex:auto;font-size:13px;line-height:1.6}.xdnLGq_nav{width:26px;height:26px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:8px;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}@media (hover:hover){.xdnLGq_nav:hover{background:var(--dsw-alias-interactive-bg-hover)}}.xdnLGq_nav:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}.xdnLGq_grid{flex-direction:column;gap:2px;display:flex}.xdnLGq_week{grid-template-columns:repeat(7,1fr);gap:2px;display:grid}.xdnLGq_weekday{height:22px;color:var(--dsw-alias-label-tertiary);justify-content:center;align-items:center;font-size:11px;line-height:1.6;display:flex}.xdnLGq_cell{height:28px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;cursor:pointer;border-radius:8px;outline:none;justify-content:center;align-items:center;font-size:13px;line-height:1.6;display:flex}@media (hover:hover){.xdnLGq_cell:hover{background:var(--dsw-alias-interactive-bg-hover)}}.xdnLGq_cell:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}.xdnLGq_cell[aria-current=date]{box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l3)}.xdnLGq_selected{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-button-ghost-active-fill);box-shadow:inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)}.xdnLGq_blank{height:28px}";
		const tagId$2 = "@deepseek-ai/dsh-client-ui-schedule/DatePicker.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-schedule";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var DatePicker_module_css_default = {
			"blank": "xdnLGq_blank",
			"calendar": "xdnLGq_calendar",
			"cell": "xdnLGq_cell",
			"grid": "xdnLGq_grid",
			"head": "xdnLGq_head",
			"nav": "xdnLGq_nav",
			"selected": "xdnLGq_selected",
			"title": "xdnLGq_title",
			"week": "xdnLGq_week",
			"weekday": "xdnLGq_weekday"
		};
		//#endregion
		//#region lib/types/client/DatePicker.js
		/**
		* Month calendar for one staged one-shot date.
		*
		* The picker owns only the panel: the row renders the read-only trigger, whose
		* text exposes the date as `YYYY/MM/DD` while the draft it stages keeps the ISO
		* text this panel writes back and the Host receives. The row's Escape guard
		* closes the panel and hands focus back.
		*/
		/** ISO calendar date, the only text this row stores. */
		const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
		/** Weekday column headings, Monday first as the weekly choice orders them. */
		const WEEKDAY_KEYS = [
			"frequency.weekday.1",
			"frequency.weekday.2",
			"frequency.weekday.3",
			"frequency.weekday.4",
			"frequency.weekday.5",
			"frequency.weekday.6",
			"frequency.weekday.7"
		];
		/** Arrow key to the number of days it moves the focused cell. */
		const STEP_BY_KEY = {
			ArrowLeft: -1,
			ArrowRight: 1,
			ArrowUp: -7,
			ArrowDown: 7
		};
		/**
		* The month and day one stored date opens on.
		* @param date - staged ISO date text.
		* @returns its own year, month, and day, or today when it is not an ISO calendar date.
		*/
		function viewOf(date) {
			const match = ISO_DATE.exec(date);
			if (match === null) {
				const today = /* @__PURE__ */ new Date();
				return {
					year: today.getFullYear(),
					month: today.getMonth(),
					day: today.getDate()
				};
			}
			return {
				year: Number(match[1]),
				month: Number(match[2]) - 1,
				day: Number(match[3])
			};
		}
		/** Zero-padded two-digit field. */
		function pad(value) {
			return String(value).padStart(2, "0");
		}
		/**
		* Last day of one month.
		* @param view - year and zero-based month.
		* @returns that month's length in days.
		*/
		function daysIn(view) {
			return new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
		}
		/**
		* The same day in another month, clamped to that month's length.
		* @param view - current month and day.
		* @param step - months to move, negative for earlier.
		* @returns the moved view.
		*/
		function shiftMonth(view, step) {
			const months = view.year * 12 + view.month + step;
			const moved = {
				year: Math.floor(months / 12),
				month: months % 12
			};
			return {
				...moved,
				day: Math.min(view.day, daysIn(moved))
			};
		}
		/**
		* ISO text of one day in a shown month.
		* @param view - shown year and month.
		* @param day - day of that month.
		* @returns `YYYY-MM-DD`.
		*/
		function isoOf(view, day) {
			return `${view.year}-${pad(view.month + 1)}-${pad(day)}`;
		}
		/**
		* Render the month panel: one localized heading row over weeks of day cells.
		* @param props - open state, the trigger, the staged date, the pick and close callbacks, and row copy.
		* @returns the anchored panel while open, and nothing while closed.
		*/
		function DatePicker({ open, anchorRef, value, onPick, onClose, t }) {
			const refs = (0, react.useRef)(/* @__PURE__ */ new Map());
			const valueRef = (0, react.useRef)(value);
			valueRef.current = value;
			const [view, setView] = (0, react.useState)(() => viewOf(value));
			const today = /* @__PURE__ */ new Date();
			const todayIso = isoOf({
				year: today.getFullYear(),
				month: today.getMonth()
			}, today.getDate());
			(0, react.useEffect)(() => {
				if (!open) return;
				setView(viewOf(valueRef.current));
			}, [open]);
			(0, react.useEffect)(() => {
				if (!open) return;
				refs.current.get(String(view.day))?.focus();
			}, [open, view]);
			/**
			* Stage one day of the shown month and leave the keyboard on it.
			* @param day - day of the shown month.
			*/
			const pick = (day) => {
				setView((current) => ({
					...current,
					day
				}));
				onPick(isoOf(view, day));
			};
			/**
			* Move the focused cell inside the month, or stage the day it is on.
			* @param event - keydown from that cell.
			* @param day - day of the shown month the cell holds.
			*/
			const onCellKeyDown = (event, day) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					pick(day);
					return;
				}
				const step = STEP_BY_KEY[event.key] ?? 0;
				if (step === 0) return;
				event.preventDefault();
				const last = daysIn(view);
				setView((current) => ({
					...current,
					day: Math.min(Math.max(day + step, 1), last)
				}));
			};
			const offset = (new Date(Date.UTC(view.year, view.month, 1)).getUTCDay() + 6) % 7;
			const total = daysIn(view);
			const cellCount = Math.ceil((offset + total) / 7) * 7;
			const weeks = Array.from({ length: cellCount / 7 }, (_value, week) => week);
			const monthTitle = new Intl.DateTimeFormat(t("time.locale"), {
				month: "long",
				year: "numeric",
				timeZone: "UTC"
			}).format(Date.UTC(view.year, view.month, 1));
			return (0, react_jsx_runtime.jsxs)(PickerPopover, {
				open,
				anchorRef,
				label: t("timing.date"),
				className: DatePicker_module_css_default.calendar,
				onClose,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: DatePicker_module_css_default.head,
					children: [
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: DatePicker_module_css_default.nav,
							"aria-label": t("timing.prevMonth"),
							onClick: () => {
								setView((current) => shiftMonth(current, -1));
							},
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineRegular, {})
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: DatePicker_module_css_default.title,
							"aria-live": "polite",
							children: monthTitle
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: DatePicker_module_css_default.nav,
							"aria-label": t("timing.nextMonth"),
							onClick: () => {
								setView((current) => shiftMonth(current, 1));
							},
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})
						})
					]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: DatePicker_module_css_default.grid,
					role: "grid",
					"aria-label": monthTitle,
					children: [(0, react_jsx_runtime.jsx)("div", {
						role: "row",
						className: DatePicker_module_css_default.week,
						children: WEEKDAY_KEYS.map((key) => (0, react_jsx_runtime.jsx)("div", {
							role: "columnheader",
							className: DatePicker_module_css_default.weekday,
							children: t(key)
						}, key))
					}), weeks.map((week) => (0, react_jsx_runtime.jsx)("div", {
						role: "row",
						className: DatePicker_module_css_default.week,
						children: Array.from({ length: 7 }, (_value, column) => week * 7 + column - offset + 1).map((day) => day < 1 || day > total ? (0, react_jsx_runtime.jsx)("div", {
							role: "gridcell",
							"aria-hidden": "true",
							className: DatePicker_module_css_default.blank
						}, day) : (0, react_jsx_runtime.jsx)("div", {
							ref: (element) => {
								if (element === null) refs.current.delete(String(day));
								else refs.current.set(String(day), element);
							},
							role: "gridcell",
							"aria-selected": isoOf(view, day) === value,
							"aria-current": isoOf(view, day) === todayIso ? "date" : void 0,
							tabIndex: day === view.day ? 0 : -1,
							className: clsx(DatePicker_module_css_default.cell, isoOf(view, day) === value && DatePicker_module_css_default.selected),
							onClick: () => {
								pick(day);
							},
							onKeyDown: (event) => {
								onCellKeyDown(event, day);
							},
							children: day
						}, day))
					}, week))]
				})]
			});
		}
		//#endregion
		//#region lib/types/client/DeliveryHistory.js
		/** Lazy saved delivery pages owned by the selected task's mounted records view. */
		/**
		* Render one saved prompt clamped to two lines; the toggle appears only while the clamp hides text.
		* Width changes re-measure a collapsed prompt; an expanded prompt keeps its toggle until collapsed.
		* @param props - Saved prompt text and locale.
		* @returns The prompt paragraph and, when its text exceeds two lines, the expand or collapse toggle.
		*/
		function SavedPrompt({ prompt, t }) {
			const ref = (0, react.useRef)(null);
			const id = (0, react.useId)();
			const [expanded, setExpanded] = (0, react.useState)(false);
			const [clamped, setClamped] = (0, react.useState)(false);
			(0, react.useLayoutEffect)(() => {
				if (expanded) return;
				const paragraph = ref.current;
				const measure = () => {
					setClamped(paragraph.scrollHeight > paragraph.clientHeight);
				};
				measure();
				const observer = new ResizeObserver(measure);
				observer.observe(paragraph);
				return () => {
					observer.disconnect();
				};
			}, [expanded, prompt]);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("p", {
				ref,
				id,
				className: TaskManagerPage_module_css_default.savedPrompt,
				"data-expanded": expanded || void 0,
				children: prompt
			}), clamped && (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: TaskManagerPage_module_css_default.savedPromptToggle,
				"aria-expanded": expanded,
				"aria-controls": id,
				onClick: () => {
					setExpanded((open) => !open);
				},
				children: [t(expanded ? "delivery.collapse" : "delivery.expand"), expanded ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, { size: 14 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 14 })]
			})] });
		}
		/**
		* Render immutable saved deliveries; the parent keys this view by task and Session.
		* Refreshes supersede pending older pages, and unmount ignores both late outcomes.
		* @param props - Exact task binding, latest receipt identity, Remote callback, task zone, and locale.
		* @returns Saved records and explicit loading, failure, and pagination actions.
		*/
		function DeliveryHistory({ id, sessionId, latestMessageId, timeZone, loadHistory, t }) {
			const [page, setPage] = (0, react.useState)();
			const [loading, setLoading] = (0, react.useState)(true);
			const [failure, setFailure] = (0, react.useState)();
			const [retentionOpen, setRetentionOpen] = (0, react.useState)(false);
			const retentionId = (0, react.useId)();
			const request = (0, react.useRef)({
				epoch: 0,
				pending: false
			});
			const load = (0, react.useCallback)(async (before) => {
				if (request.current.pending) return;
				request.current.pending = true;
				const epoch = ++request.current.epoch;
				setLoading(true);
				setFailure(void 0);
				let result;
				try {
					result = await loadHistory({
						id,
						sessionId,
						limit: 20,
						...before === void 0 ? {} : { before }
					});
				} catch (_error) {
					if (epoch !== request.current.epoch) return;
					request.current.pending = false;
					setLoading(false);
					setFailure({
						key: "delivery.error",
						before
					});
					return;
				}
				if (epoch !== request.current.epoch) return;
				request.current.pending = false;
				setLoading(false);
				if (!result.ok) setFailure({
					key: "delivery.error",
					before
				});
				else if ("code" in result.value) setFailure({
					key: result.value.code === "schedule_not_found" ? "delivery.notFound" : "delivery.cursorError",
					before: void 0
				});
				else {
					const next = result.value;
					setPage((previous) => {
						if (before === void 0 || previous === void 0) return next;
						const seen = new Set(previous.records.map((record) => record.messageId));
						const records = [...previous.records];
						for (const record of next.records) if (!seen.has(record.messageId)) {
							seen.add(record.messageId);
							records.push(record);
						}
						return {
							...next,
							records
						};
					});
				}
			}, [
				id,
				sessionId,
				loadHistory
			]);
			(0, react.useEffect)(() => {
				load();
				return () => {
					request.current.epoch++;
					request.current.pending = false;
				};
			}, [load, latestMessageId]);
			const formatOccurrence = (value) => formatScheduleNextRun(value, t("time.locale"), timeZone);
			const hasRecords = page !== void 0 && page.records.length > 0;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TaskManagerPage_module_css_default.deliveryHistory,
				"aria-busy": loading,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: TaskManagerPage_module_css_default.detailScroll,
					children: [
						loading && !hasRecords && (0, react_jsx_runtime.jsx)("div", {
							className: TaskManagerPage_module_css_default.empty,
							role: "status",
							"aria-label": t("delivery.loading"),
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" })
						}),
						failure !== void 0 && (hasRecords ? (0, react_jsx_runtime.jsxs)("div", {
							className: TaskManagerPage_module_css_default.notice,
							children: [(0, react_jsx_runtime.jsx)("p", {
								role: "alert",
								children: t(failure.key)
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								size: "sm",
								onClick: () => {
									load(failure.before);
								},
								children: t(failure.key === "delivery.cursorError" ? "delivery.refresh" : "delivery.retry")
							})]
						}) : (0, react_jsx_runtime.jsxs)("div", {
							className: TaskManagerPage_module_css_default.empty,
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {
									size: 24,
									className: TaskManagerPage_module_css_default.emptyGlyph
								}),
								(0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									className: TaskManagerPage_module_css_default.emptyTitle,
									children: t(failure.key)
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									className: TaskManagerPage_module_css_default.emptyAction,
									onClick: () => {
										load(failure.before);
									},
									children: t(failure.key === "delivery.cursorError" ? "delivery.refresh" : "delivery.retry")
								})
							]
						})),
						!loading && failure === void 0 && page?.records.length === 0 && (0, react_jsx_runtime.jsxs)("div", {
							className: TaskManagerPage_module_css_default.empty,
							role: "status",
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, {
								size: 24,
								className: TaskManagerPage_module_css_default.emptyGlyph
							}), (0, react_jsx_runtime.jsx)("h3", { children: t("delivery.empty") })]
						}),
						page?.records.map((record) => (0, react_jsx_runtime.jsxs)("section", {
							className: TaskManagerPage_module_css_default.delivery,
							"aria-label": t("delivery.label"),
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { className: TaskManagerPage_module_css_default.deliveryGlyph }), (0, react_jsx_runtime.jsxs)("div", {
								className: TaskManagerPage_module_css_default.deliveryBody,
								children: [(0, react_jsx_runtime.jsx)("div", {
									className: TaskManagerPage_module_css_default.deliveryHead,
									children: (0, react_jsx_runtime.jsx)("time", {
										className: TaskManagerPage_module_css_default.deliveryTime,
										dateTime: record.scheduledAt,
										children: formatOccurrence(record.scheduledAt)
									})
								}), record.prompt !== void 0 && (0, react_jsx_runtime.jsx)(SavedPrompt, {
									prompt: record.prompt,
									t
								})]
							})]
						}, record.messageId)),
						page?.nextBefore !== void 0 && failure === void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: loading,
							onClick: () => {
								load(page.nextBefore);
							},
							children: t("delivery.loadMore")
						})
					]
				}), hasRecords && page.earlierRecordsPruned && page.nextBefore === void 0 && !loading && failure === void 0 && (0, react_jsx_runtime.jsxs)("footer", {
					className: TaskManagerPage_module_css_default.retentionEnd,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: TaskManagerPage_module_css_default.retentionLine,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("delivery.pruned") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: t("delivery.retention"),
							side: "top",
							portal: true,
							children: (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: TaskManagerPage_module_css_default.retentionInfo,
								"aria-label": t("delivery.retention"),
								"aria-expanded": retentionOpen,
								"aria-controls": retentionId,
								onClick: () => {
									setRetentionOpen((open) => !open);
								},
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInfoOutlineRegular, { size: 14 })
							})
						})]
					}), retentionOpen && (0, react_jsx_runtime.jsxs)("div", {
						id: retentionId,
						className: TaskManagerPage_module_css_default.retentionRule,
						children: [(0, react_jsx_runtime.jsx)("p", { children: t("delivery.retentionBounds", {
							days: page.retention.days,
							records: page.retention.records
						}) }), (0, react_jsx_runtime.jsx)("p", { children: t("delivery.retentionExplanation") })]
					})]
				})]
			});
		}
		//#endregion
		//#region lib/types/client/relative-clock.js
		/** Reference clock for the relative "time remaining" text. */
		/**
		* Refresh period for relative-time text.
		*
		* The text names whole seconds, minutes, hours, or days, so a half-minute
		* period keeps it correct to its own granularity without re-rendering a mounted
		* page on every frame.
		*/
		const RELATIVE_CLOCK_PERIOD_MS = 3e4;
		/**
		* Current epoch milliseconds, re-sampled on a fixed period.
		*
		* A relative duration is read against the moment it renders, not against the
		* moment its component mounted: a page left open across a delivery would keep
		* showing the time until the previous target.
		*
		* This is the shared clock of the mounted task page and its detail, the two
		* surfaces that sit side by side and must not disagree about how long remains.
		* Two other surfaces keep their own beat: the Session-header catalog reads
		* `Date.now()` and then a one-second interval while its popover is open, and the
		* Sidebar Session-row hover card samples `Date.now()` once per mount, because
		* that preview must not drift while the pointer rests on it.
		* @param periodMs - refresh period; defaults to {@link RELATIVE_CLOCK_PERIOD_MS}.
		* @returns epoch milliseconds, updated once per period.
		*/
		function useRelativeClock(periodMs = RELATIVE_CLOCK_PERIOD_MS) {
			const [now, setNow] = (0, react.useState)(() => Date.now());
			(0, react.useEffect)(() => {
				const timer = setInterval(() => {
					setNow(Date.now());
				}, periodMs);
				return () => {
					clearInterval(timer);
				};
			}, [periodMs]);
			return now;
		}
		//#endregion
		//#region lib/types/client/session-link.js
		/**
		* Check Host-list membership and archive state without activating or restoring anything.
		*
		* `SessionListState.byId` also carries local fallback rows for live Client
		* generations, so membership comes from `ids`, the Host-list projection: a
		* Session the Host list dropped reports unavailable even while a local row for
		* it survives.
		* @param id - Original Session bound to the task.
		* @param sessions - Current Session list projection.
		* @param workspaces - Current Workspace and archive projection.
		* @returns availability or the reason navigation is disabled.
		*/
		function sessionLinkState(id, sessions, workspaces) {
			if (workspaces.state === "error") return "unavailable";
			if (sessions.phase === "pending" || workspaces.phase === "pending") return "loading";
			if (workspaces.archivedSessionIds.includes(id)) return "archived";
			if (!sessions.ids.includes(id)) return "unavailable";
			return "available";
		}
		/**
		* Resolve the label of one linked Session from the Session catalog the calling
		* component already projects.
		*
		* A catalog title renders as-is; the Session id renders while the catalog holds
		* no row for the Session (missing or not yet loaded) or its row carries a blank
		* title, so the label is never empty. Every surface that names a linked Session
		* resolves the label here, so the Automation tasks rows, the task detail, and the
		* task tab all name the same Session the same way.
		* @param id - Original Session bound to the task.
		* @param sessions - Current Session list projection.
		* @returns the resolved label and whether a catalog title produced it.
		*/
		function sessionLabel(id, sessions) {
			const title = sessions.byId[id]?.title;
			if (title === void 0 || title.trim() === "") return {
				text: id,
				titled: false
			};
			return {
				text: title,
				titled: true
			};
		}
		//#endregion
		//#region lib/types/client/recent-time-zones.js
		/** Browser-local recently selected IANA time zones. */
		const STORAGE_KEY = "dsh.schedule.recent-time-zones.v1";
		const LIMIT = 5;
		/** First-run choices follow the device rather than guessing location from UI language. */
		function defaults(system) {
			return [...new Set([system, "UTC"])];
		}
		/**
		* Load up to five recent zones, or the system-zone/UTC first-run seed.
		* @param system - the host's current IANA zone.
		* @returns recent IANA zones in most-recent-first order.
		*/
		function loadRecentTimeZones(system) {
			if (typeof localStorage === "undefined") return defaults(system);
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw === null) return defaults(system);
				const parsed = JSON.parse(raw);
				if (!Array.isArray(parsed)) return defaults(system);
				const zones = [...new Set(parsed.filter((value) => typeof value === "string" && value !== ""))];
				return zones.length === 0 ? defaults(system) : zones.slice(0, LIMIT);
			} catch {
				return defaults(system);
			}
		}
		/**
		* Promote one exact IANA id and persist the bounded list when storage is available.
		* @param recent - current most-recent-first IANA zones.
		* @param zone - exact IANA zone to promote.
		* @returns the updated bounded most-recent-first list.
		*/
		function rememberTimeZone(recent, zone) {
			const next = [zone, ...recent.filter((value) => value !== zone)].slice(0, LIMIT);
			if (typeof localStorage !== "undefined") try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			} catch {}
			return next;
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-schedule/src/client/TaskMenu.module.css.mjs
		const css$1 = ".KVMqpW_root{display:inline-flex;position:relative}.KVMqpW_list{box-sizing:border-box;border-radius:var(--dsw-radius-lg);background:var(--dsw-specific-menu);backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);z-index:100;border:0;flex-direction:column;gap:0;min-width:144px;max-width:360px;padding:4px;display:flex;position:absolute;top:calc(100% + 4px);left:0}.KVMqpW_portal{z-index:1100;position:fixed;top:auto;left:auto}.KVMqpW_alignEnd{left:auto;right:0}.KVMqpW_scrollable{max-height:calc(100vh - 12px - max(12px, var(--dsh-frame-overlay-top,12px)))}.KVMqpW_viewport{flex-direction:column;min-height:0;display:flex}.KVMqpW_scrollable .KVMqpW_viewport{overflow-y:auto}.KVMqpW_header{border-bottom:.5px solid var(--dsw-alias-border-l2);flex:none;padding:5px}.KVMqpW_itemWrap{position:relative}.KVMqpW_item{border-radius:var(--dsw-radius-md);cursor:pointer;width:100%;min-height:34px;color:var(--dsw-alias-label-primary);text-align:left;background:0 0;border:none;align-items:center;gap:6px;padding:6px 8px;font-size:13px;line-height:20px;display:flex}@media (hover:hover){.KVMqpW_item:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}.KVMqpW_item:focus-visible:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);outline:none}.KVMqpW_item:disabled{opacity:.4;cursor:not-allowed}.KVMqpW_itemIcon{width:14px;height:14px;color:var(--dsw-alias-label-tertiary);flex:none;justify-content:center;align-items:center;display:inline-flex}.KVMqpW_itemIcon svg,.KVMqpW_check{width:14px;height:14px}.KVMqpW_itemLabel{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.KVMqpW_check{color:var(--dsw-alias-label-primary);flex:none}.KVMqpW_selected{background:0 0}.KVMqpW_danger,.KVMqpW_danger .KVMqpW_itemIcon{color:var(--dsw-alias-state-error-primary)}@media (hover:hover){.KVMqpW_danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger)}}.KVMqpW_danger:focus-visible:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger);outline:none}.KVMqpW_label{color:var(--dsw-alias-label-tertiary);padding:6px 8px;font-size:11px;line-height:15px}.KVMqpW_separator{background:var(--dsw-alias-border-l2);height:.5px;margin:3px 2px}.KVMqpW_separator+.KVMqpW_separator{display:none}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-schedule/TaskMenu.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-schedule";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var TaskMenu_module_css_default = {
			"alignEnd": "KVMqpW_alignEnd",
			"check": "KVMqpW_check",
			"danger": "KVMqpW_danger",
			"header": "KVMqpW_header",
			"item": "KVMqpW_item",
			"itemIcon": "KVMqpW_itemIcon",
			"itemLabel": "KVMqpW_itemLabel",
			"itemWrap": "KVMqpW_itemWrap",
			"label": "KVMqpW_label",
			"list": "KVMqpW_list",
			"portal": "KVMqpW_portal",
			"root": "KVMqpW_root",
			"scrollable": "KVMqpW_scrollable",
			"selected": "KVMqpW_selected",
			"separator": "KVMqpW_separator",
			"viewport": "KVMqpW_viewport"
		};
		//#endregion
		//#region lib/types/client/TaskMenu.js
		/**
		* Anchored dropdown menu of the task manager's rule rows and task header.
		*
		* This is the schedule-local copy of the shared `Menu` implementation. The
		* pinned `header` slot and the `data-menu-field` keyboard handover exist for
		* the Time zone row's search box, so the four call sites here keep that
		* capability locally instead of extending the shared card.
		*/
		/** Unplaced portal list: hidden but laid out at a fixed origin so its offset size is real. */
		const MEASURE_STYLE = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		/** Distance the list keeps from the anchor edge. */
		const ANCHOR_GAP = 4;
		/** Distance the list keeps from each viewport edge. */
		const VIEWPORT_MARGIN = 12;
		/**
		* Whether an entry is a group hairline.
		* @param entry - one menu entry.
		* @returns true for a separator entry.
		*/
		function isSeparator(entry) {
			return "type" in entry && entry.type === "separator";
		}
		/**
		* Whether an entry is a non-interactive heading.
		* @param entry - one menu entry.
		* @returns true for a heading entry.
		*/
		function isLabel(entry) {
			return "type" in entry && entry.type === "label";
		}
		/**
		* Render an anchored dropdown menu. While the list is open, Tab settles the
		* focused row — from the trigger, Tab enters the list instead — Escape and
		* Shift+Tab close it and return focus to the anchor's first enabled button, and
		* selecting a row does the same.
		* @param props.open - whether the list is showing (owner-controlled).
		* @param props.anchor - the trigger element, rendered in place.
		* @param props.items - selectable rows and optional separators or heading labels.
		* @param props.selectedId - row shown as selected.
		* @param props.onSelect - row activation callback, not called for disabled rows.
		* @param props.onClose - invoked on an outside pointer press, Escape, or a
		* window blur that moved focus into a cross-origin iframe.
		* @param props.align - list alignment against the anchor (default 'start').
		* @param props.portal - render the list into document.body, fixed-positioned
		* from the anchor rect (follows scroll and resize while open).
		* @param props.header - owner content pinned above the scrolling rows; a control
		* it marks `data-menu-field` takes the keyboard on desktop once the list is placed,
		* which is the frame a portaled list becomes focusable in. Phones and tablets
		* require explicit field focus.
		* @param props.className - extra class on the anchor wrapper span.
		* @param props.listClassName - extra class on the dropdown card itself.
		* @returns the anchor wrapper with the conditional list.
		*/
		function TaskMenu({ open, anchor, items = [], selectedId, onSelect, onClose, align = "start", portal = false, header, className, listClassName }) {
			const rootRef = (0, react.useRef)(null);
			const listRef = (0, react.useRef)(null);
			/** Index the arrow walk last focused, the resume point when focus left the rows. */
			const walkIndex = (0, react.useRef)(null);
			/** Whether this open already moved the keyboard into the list. */
			const handedOver = (0, react.useRef)(false);
			const openRef = (0, react.useRef)(open);
			openRef.current = open;
			/** Latest close callback, so the document listeners bind once per open. */
			const closeRef = (0, react.useRef)(onClose);
			closeRef.current = onClose;
			const dismiss = (0, react.useCallback)(() => {
				closeRef.current();
			}, []);
			const position = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open: open && portal,
				anchorRef: rootRef,
				panelRef: listRef,
				align,
				gap: ANCHOR_GAP,
				margin: VIEWPORT_MARGIN
			});
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(rootRef, open, dismiss, listRef);
			/**
			* Hand the keyboard back to the anchor's first enabled button. Focus left on
			* a removed row otherwise falls to the page body, where the next Tab restarts
			* from the top of the page.
			*/
			const refocusAnchor = () => {
				rootRef.current?.querySelector("button:not(:disabled)")?.focus();
			};
			/**
			* Post-selection focus, for the paths where the rows unmount with the list.
			* A selection whose owner keeps the menu open is left alone, and so is an
			* owner that moved focus itself: only a keyboard left on the closing list
			* (or on the body its removal produced) comes back to the anchor.
			*/
			const refocusAfterSelection = () => {
				queueMicrotask(() => {
					if (openRef.current) return;
					const active = document.activeElement;
					if (active === null || active === document.body || listRef.current?.contains(active) === true) refocusAnchor();
				});
			};
			(0, react.useEffect)(() => {
				if (!open) {
					handedOver.current = false;
					return;
				}
				if (handedOver.current || (0, _deepseek_ai_dsh_client_ui_primitives.isMobileDevice)()) return;
				const list = listRef.current;
				/* v8 ignore next -- the list is rendered in the same commit that sets `open`, before this effect runs. */
				if (list === null) return;
				if (portal && position === null) return;
				const field = list.querySelector("[data-menu-field]");
				if (field === null) return;
				handedOver.current = true;
				field.focus();
			}, [
				open,
				portal,
				position
			]);
			(0, react.useEffect)(() => {
				if (!open) {
					walkIndex.current = null;
					return;
				}
				const onKeyDown = (e) => {
					const focused = document.activeElement;
					const insideList = listRef.current?.contains(focused) === true;
					const anchored = rootRef.current?.contains(focused) === true || insideList;
					if (e.key === "Escape") {
						dismiss();
						if (anchored) refocusAnchor();
					}
					if (e.key === "Tab") {
						const list = listRef.current;
						/* v8 ignore next -- the list is mounted whenever this effect's `open` is true. */
						if (list === null) return;
						if (!anchored) return;
						if (e.shiftKey) {
							e.preventDefault();
							dismiss();
							refocusAnchor();
							return;
						}
						if (insideList) {
							if (focused instanceof Element && focused.getAttribute("role") === "menuitem") {
								e.preventDefault();
								focused.click();
							}
							return;
						}
						const row = list.querySelector("button:not(:disabled)");
						if (row === null) return;
						e.preventDefault();
						row.focus();
						walkIndex.current = 0;
						return;
					}
					if (![
						"ArrowDown",
						"ArrowUp",
						"Home",
						"End"
					].includes(e.key)) return;
					if (e.target instanceof HTMLInputElement && (e.key === "Home" || e.key === "End")) return;
					const list = listRef.current;
					/* v8 ignore next -- the list is mounted whenever this effect's `open` is true. */
					if (list === null) return;
					if (!anchored) return;
					const buttons = Array.from(list.querySelectorAll("button:not(:disabled)"));
					if (buttons.length === 0) return;
					const index = buttons.indexOf(focused);
					const from = index >= 0 ? index : walkIndex.current;
					const next = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : from === null ? e.key === "ArrowDown" ? 0 : buttons.length - 1 : (from + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
					e.preventDefault();
					walkIndex.current = next;
					buttons[next]?.focus();
				};
				const onWindowBlur = () => {
					if (document.activeElement instanceof HTMLIFrameElement) dismiss();
				};
				document.addEventListener("keydown", onKeyDown);
				window.addEventListener("blur", onWindowBlur);
				return () => {
					document.removeEventListener("keydown", onKeyDown);
					window.removeEventListener("blur", onWindowBlur);
				};
			}, [open, dismiss]);
			const renderEntry = (entry) => {
				if (isSeparator(entry)) return (0, react_jsx_runtime.jsx)("div", {
					className: TaskMenu_module_css_default.separator,
					role: "separator"
				}, entry.id);
				if (isLabel(entry)) return (0, react_jsx_runtime.jsx)("div", {
					className: TaskMenu_module_css_default.label,
					role: "presentation",
					children: entry.text
				}, entry.id);
				const selected = entry.id === selectedId;
				return (0, react_jsx_runtime.jsx)("div", {
					className: TaskMenu_module_css_default.itemWrap,
					children: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "menuitem",
						className: clsx(TaskMenu_module_css_default.item, selected && TaskMenu_module_css_default.selected, entry.danger === true && TaskMenu_module_css_default.danger),
						disabled: entry.disabled,
						onClick: () => {
							onSelect(entry.id);
						},
						children: [
							entry.icon !== void 0 && (0, react_jsx_runtime.jsx)("span", {
								className: TaskMenu_module_css_default.itemIcon,
								children: entry.icon
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: TaskMenu_module_css_default.itemLabel,
								children: entry.label
							}),
							selected && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { className: TaskMenu_module_css_default.check })
						]
					})
				}, entry.id);
			};
			const list = open && (0, react_jsx_runtime.jsxs)("div", {
				ref: listRef,
				className: clsx(TaskMenu_module_css_default.list, listClassName, TaskMenu_module_css_default.scrollable, portal && TaskMenu_module_css_default.portal, align === "end" && !portal && TaskMenu_module_css_default.alignEnd),
				style: portal ? position ?? MEASURE_STYLE : void 0,
				role: "menu",
				onClick: (e) => {
					e.stopPropagation();
					if ((e.target instanceof Element ? e.target.closest("button[role=\"menuitem\"]") : null) !== null) refocusAfterSelection();
				},
				children: [header !== void 0 && (0, react_jsx_runtime.jsx)("div", {
					className: TaskMenu_module_css_default.header,
					role: "presentation",
					children: header
				}), (0, react_jsx_runtime.jsx)("div", {
					className: TaskMenu_module_css_default.viewport,
					role: "presentation",
					children: items.map(renderEntry)
				})]
			});
			return (0, react_jsx_runtime.jsxs)("span", {
				ref: rootRef,
				className: clsx(TaskMenu_module_css_default.root, className),
				children: [anchor, portal ? list !== false && (0, react_dom.createPortal)(list, document.body) : list]
			});
		}
		//#endregion
		//#region lib/types/client/TaskDetail.js
		/** One retained task's rule, saved deliveries, run-time edits, deletion, and original-Session link. */
		/** Recurrence choices the Run time card's Repeat row offers, in mock menu order. */
		const RULE_CHOICES = [
			"weekly",
			"weekdays",
			"daily",
			"every-hour",
			"every-minute",
			"every-second",
			"once",
			"cron"
		];
		/** Repeat menu label of each recurrence choice. */
		const RULE_KIND_LABELS = {
			daily: "rule.daily",
			weekdays: "rule.weekdays",
			weekly: "rule.weekly",
			every: "rule.everyMinutes",
			once: "rule.once",
			cron: "rule.cron"
		};
		/** Repeat-menu label of each visible choice. */
		const RULE_CHOICE_LABELS = {
			daily: "rule.daily",
			weekdays: "rule.weekdays",
			weekly: "rule.weekly",
			"every-minute": "rule.everyMinutes",
			"every-hour": "rule.everyHours",
			"every-second": "rule.everySeconds",
			once: "rule.once",
			cron: "rule.cron"
		};
		/** Unit word the elapsed-interval row shows beside its quantity input. */
		const INTERVAL_UNIT_LABELS = {
			hour: "timing.unit.hour",
			minute: "timing.unit.minute",
			second: "timing.unit.second"
		};
		/** Lower-bound hint of the elapsed-interval row, stated in the row's own unit. */
		const INTERVAL_HINT_KEYS = {
			hour: "timing.intervalHint.hour",
			minute: "timing.intervalHint.minute",
			second: "timing.intervalHint.second"
		};
		/** Below-floor save message, stated in the same unit as the row and its hint. */
		const INTERVAL_ERROR_KEYS = {
			hour: "timing.invalidInterval.hour",
			minute: "timing.invalidInterval.minute",
			second: "timing.invalidInterval.second"
		};
		/** Messages `draftError` can return; each clears as soon as edits fix the draft. */
		const LOCAL_FAILURES = new Set([
			"rule.invalidTitle",
			"rule.invalidPrompt",
			"timing.invalidInterval",
			"rule.cronInvalid",
			"timing.invalid"
		]);
		/** Elapsed interval a rule receives when it starts repeating without a stored interval. */
		const RULE_DEFAULT_EVERY_SECONDS = 3600;
		/** Seconds represented by each friendly interval unit. */
		const INTERVAL_UNIT_SECONDS = {
			second: 1,
			minute: 60,
			hour: 3600
		};
		/** Shortest elapsed interval the Host accepts, stated in seconds. */
		const MIN_INTERVAL_SECONDS = 60;
		/** Exhaustive recurrence-choice labels of the stored rule records. */
		const RULE_KIND_BY_RECORD = {
			at: "once",
			after: "once",
			every: "every",
			daily: "daily",
			weekly: "weekly",
			cron: "cron"
		};
		/** ISO weekdays of the weekly choice in display order, Monday through Sunday. */
		const WEEKDAYS = [
			1,
			2,
			3,
			4,
			5,
			6,
			7
		];
		/** ISO weekday set the `weekdays` choice stores: Monday through Friday. */
		const WEEKDAY_RULE = [
			1,
			2,
			3,
			4,
			5
		];
		/**
		* Recurrence choices that state their rule with the clock and zone rows.
		*
		* The cron choice carries its clock inside its expression and its timing draft
		* has no time row, so it neither carries nor receives that pair: an expression
		* seeded from the occurrence's UTC clock with another zone would name a
		* different instant, and carrying an expression's empty time would empty the
		* clock row a switch to another choice shows.
		*/
		const CLOCK_KINDS = [
			"daily",
			"weekdays",
			"weekly"
		];
		/** Localized name of each ISO weekday. */
		const WEEKDAY_LABELS = {
			1: "frequency.weekday.1",
			2: "frequency.weekday.2",
			3: "frequency.weekday.3",
			4: "frequency.weekday.4",
			5: "frequency.weekday.5",
			6: "frequency.weekday.6",
			7: "frequency.weekday.7"
		};
		/**
		* Whether a stored weekly record carries exactly the Monday-to-Friday set the
		* `weekdays` choice stores, so the Repeat row shows that choice for it.
		* @param weekdays - stored ISO weekday set.
		* @returns whether the set is Monday through Friday.
		*/
		function isWeekdayRule(weekdays) {
			return weekdays.length === WEEKDAY_RULE.length && WEEKDAY_RULE.every((day) => weekdays.includes(day));
		}
		const sessionLinkMessages = {
			loading: "detail.sessionLoading",
			archived: "detail.sessionArchived",
			unavailable: "detail.sessionUnavailable"
		};
		/**
		* Own the editing state one task detail shares across both of its owners.
		*
		* The shown task is the catalog row for `taskId`, or the draft a mutation
		* pending against that row retained after the row left the catalog. The view,
		* the confirmation, and the draft all reset when `taskId` changes, so one
		* task's draft never carries into another.
		* @param injected - detail actions, localized copy, and framework readers.
		* @param catalog - the owner's authoritative task catalog snapshot.
		* @param taskId - task the owner selected, or undefined when it selected none.
		* @returns the shown task and catalog row, its element id, its confirmation, and the detail props.
		*/
		function useTaskDetail(injected, catalog, taskId) {
			const [draft, setDraft] = (0, react.useState)(null);
			const [tab, setTab] = (0, react.useState)("rule");
			const [confirmId, setConfirmId] = (0, react.useState)(null);
			const id = (0, react.useId)();
			(0, react.useEffect)(() => {
				setDraft(null);
				setTab("rule");
				setConfirmId(null);
			}, [taskId]);
			const record = taskId === void 0 ? void 0 : catalog.records.find((item) => item.id === taskId);
			return {
				record,
				task: record ?? (draft !== null && draft.id === taskId ? draft : void 0),
				id,
				confirmId,
				setConfirmId,
				setTab,
				props: {
					...injected,
					status: catalog.status,
					deleting: catalog.deleting,
					id,
					onEditState: setDraft,
					tab,
					onTabChange: setTab,
					confirmId,
					onConfirm: setConfirmId
				}
			};
		}
		/**
		* Render one task's rule or saved deliveries with confirm-first deletion and its original Session.
		*
		* A deletion this detail confirmed settles with the refreshed catalog: once
		* that refresh reports the row gone, the detail calls `onDeleted` and its owner
		* leaves the task. The app-wide toast, not this detail, announces the outcome.
		* @param props - task, catalog state, detail view, confirmation, localized copy, and action callbacks.
		* @returns the detail region, its deletion confirmation dialog, and the linked Session entry.
		*/
		function TaskDetail({ task, authoritative, id, status, deleting, onDelete, onRetry, onUpdateTiming, loadHistory, onOpenSession, onEditState, tab, onTabChange, confirmId, onConfirm, onDeleted, onClose, withinSession, useSessions, useWorkspaces, t }) {
			const sessions = useSessions((snapshot) => snapshot);
			const workspaces = useWorkspaces((snapshot) => snapshot);
			const detailTabsRef = (0, react.useRef)(null);
			const moreRef = (0, react.useRef)(null);
			const nameRef = (0, react.useRef)(null);
			const panelRef = (0, react.useRef)(null);
			const footerRef = (0, react.useRef)(null);
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const now = useRelativeClock();
			const busy = deleting.includes(task.id) || status === "loading";
			const confirming = authoritative && confirmId === task.id;
			const sessionLink = sessionLinkState(task.sessionId, sessions, workspaces);
			const linkedSession = sessionLabel(task.sessionId, sessions);
			const sessionNotice = sessionLink === "available" ? void 0 : t(sessionLinkMessages[sessionLink]);
			const linkedShown = tab === "rule" && withinSession !== task.sessionId;
			const linkedText = t("detail.session");
			const [linkedCompact, setLinkedCompact] = (0, react.useState)(false);
			const linkedRef = (0, react.useRef)(null);
			const linkedExpanded = (0, react.useRef)(void 0);
			const linkedAction = linkedSession.titled ? t("detail.openSessionTitle", { title: linkedSession.text }) : t("detail.openSession");
			const linkedName = (0, react_jsx_runtime.jsx)("span", {
				id: `${id}-session`,
				className: TaskManagerPage_module_css_default.linkedSessionName,
				children: linkedSession.text
			});
			const linkedDescribedBy = `${id}-session${sessionNotice === void 0 ? "" : ` ${id}-session-state`}`;
			(0, react.useLayoutEffect)(() => {
				if (!linkedShown) return;
				const tabs = detailTabsRef.current;
				const linked = linkedRef.current;
				const measure = () => {
					const width = linked.getBoundingClientRect().width;
					if (!linkedCompact) linkedExpanded.current = {
						label: linkedText,
						width
					};
					const expanded = linkedExpanded.current;
					if (expanded.label !== linkedText) {
						setLinkedCompact(false);
						return;
					}
					setLinkedCompact(tabs.lastElementChild.getBoundingClientRect().right - tabs.firstElementChild.getBoundingClientRect().left > tabs.clientWidth - (expanded.width - width) - (linkedCompact ? 1 : 0));
				};
				measure();
				const observer = new ResizeObserver(measure);
				observer.observe(tabs);
				for (const tab of tabs.children) observer.observe(tab);
				return () => {
					observer.disconnect();
				};
			}, [
				linkedShown,
				linkedCompact,
				linkedText
			]);
			const taskIdentity = `${task.sessionId}\u0000${task.id}`;
			const [edit, setEdit] = (0, react.useState)(() => initialRuleEdit(task));
			const [intervalUnit, setIntervalUnit] = (0, react.useState)(() => preferredIntervalUnit(edit.shown.draft.seconds));
			const explicitUnit = (0, react.useRef)(false);
			const previousKind = (0, react.useRef)(edit.shown.kind);
			(0, react.useEffect)(() => {
				if (previousKind.current === edit.shown.kind) return;
				previousKind.current = edit.shown.kind;
				if (edit.shown.kind !== "every") {
					explicitUnit.current = false;
					return;
				}
				if (explicitUnit.current) return;
				setIntervalUnit(preferredIntervalUnit(edit.shown.draft.seconds));
			}, [edit.shown.kind, edit.shown.draft.seconds]);
			const [pending, setPending] = (0, react.useState)(false);
			const [failure, setFailure] = (0, react.useState)();
			const shownFailure = failure !== void 0 && LOCAL_FAILURES.has(failure) ? draftError(edit.shown) : failure;
			const [deletionConfirmed, setDeletionConfirmed] = (0, react.useState)(false);
			const deletionInFlight = (0, react.useRef)(null);
			const [trackedIdentity, setTrackedIdentity] = (0, react.useState)(taskIdentity);
			const identityRef = (0, react.useRef)(taskIdentity);
			identityRef.current = taskIdentity;
			const submissions = (0, react.useRef)(0);
			const chosenWeekdays = (0, react.useRef)(void 0);
			/** The day set this task's card remembers, or undefined when it has none. */
			const taskMemory = () => chosenWeekdays.current?.identity === taskIdentity ? chosenWeekdays.current.weekdays : void 0;
			const mounted = (0, react.useRef)(true);
			(0, react.useEffect)(() => {
				mounted.current = true;
				return () => {
					mounted.current = false;
				};
			}, []);
			(0, react.useEffect)(() => {
				panelRef.current?.focus({ preventScroll: true });
			}, [task.sessionId, task.id]);
			(0, react.useEffect)(() => {
				onEditState(pending || shownFailure !== void 0 || deletionConfirmed ? task : null);
			}, [
				pending,
				shownFailure,
				deletionConfirmed,
				task,
				onEditState
			]);
			(0, react.useEffect)(() => {
				if (deleting.includes(task.id)) {
					deletionInFlight.current = task.id;
					return;
				}
				if (!deletionConfirmed || deletionInFlight.current !== task.id) return;
				deletionInFlight.current = null;
				if (status === "ready" && authoritative) setDeletionConfirmed(false);
			}, [
				deletionConfirmed,
				deleting,
				task.id,
				status,
				authoritative
			]);
			(0, react.useEffect)(() => {
				if (confirming) footerRef.current?.querySelector("button")?.focus();
			}, [confirming]);
			const closeConfirmation = () => {
				onConfirm(null);
				moreRef.current?.focus();
			};
			const menuItems = [{
				id: "delete",
				label: t(deleting.includes(task.id) ? "delete.pending" : "delete.action"),
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, {}),
				danger: true,
				disabled: busy || !authoritative
			}];
			const storedValues = ruleValues(task);
			const propKey = shownValues(storedValues);
			if (trackedIdentity !== taskIdentity) {
				submissions.current += 1;
				chosenWeekdays.current = void 0;
				explicitUnit.current = false;
				previousKind.current = storedValues.kind;
				setTrackedIdentity(taskIdentity);
				setEdit(initialRuleEdit(task));
				setIntervalUnit(preferredIntervalUnit(storedValues.draft.seconds));
				setPending(false);
				setFailure(void 0);
				setDeletionConfirmed(false);
			} else if (edit.propKey !== propKey) {
				const memory = taskMemory();
				if (memory !== void 0 && sameWeekdays(memory, edit.stored.weekdays)) chosenWeekdays.current = void 0;
				setEdit(task.status === "inactive" ? {
					propKey,
					stored: storedValues,
					shown: storedValues
				} : {
					propKey,
					stored: storedValues,
					shown: mergeRuleDraft(storedValues, edit.shown, edit.stored)
				});
			}
			(0, react.useEffect)(() => {
				if (task.status !== "inactive") return;
				setEdit((current) => shownValues(current.shown) === shownValues(current.stored) ? current : {
					...current,
					shown: current.stored
				});
			}, [task.status]);
			const shown = edit.shown;
			const dirty = shownValues(shown) !== shownValues(edit.stored);
			const deleted = deletionConfirmed && !authoritative;
			(0, react.useEffect)(() => {
				if (deleted) onDeleted();
			}, [deleted, onDeleted]);
			const nextRun = nextRunParts(task.scheduledAt, t("time.locale"), now, t);
			const rememberWeekdays = (weekdays) => {
				chosenWeekdays.current = {
					identity: taskIdentity,
					weekdays
				};
			};
			/**
			* Day set one rule states, when its kind carries one.
			* @param kind - choice the rule is stated as.
			* @param weekdays - that rule's day set.
			* @returns the set for the kinds that carry one, otherwise undefined.
			*/
			const setOf = (kind, weekdays) => kind === "weekdays" || kind === "weekly" ? weekdays : void 0;
			const chooseKind = (kind, unit) => {
				if (unit !== void 0) {
					explicitUnit.current = true;
					setIntervalUnit(unit);
				}
				if (kind === shown.kind) return;
				const leavingSet = setOf(shown.kind, shown.weekdays) ?? (taskMemory() === void 0 ? setOf(storedValues.kind, storedValues.weekdays) : void 0);
				if (leavingSet !== void 0) rememberWeekdays(leavingSet);
				setEdit((current) => {
					const restore = kind === current.stored.kind;
					const carriesClock = !restore && CLOCK_KINDS.includes(kind) && CLOCK_KINDS.includes(current.shown.kind);
					const storedSet = setOf(current.stored.kind, current.stored.weekdays);
					const carried = kind === "weekly" ? setOf(current.shown.kind, current.shown.weekdays) ?? taskMemory() ?? storedSet : void 0;
					return {
						...current,
						shown: {
							...current.shown,
							kind,
							draft: restore ? current.stored.draft : carriesClock ? {
								...seedDraft(task, kind),
								time: current.shown.draft.time,
								timeZone: current.shown.draft.timeZone
							} : unit === void 0 ? seedDraft(task, kind) : {
								...seedDraft(task, kind),
								seconds: String(seedIntervalSeconds())
							},
							weekdays: kind === "weekdays" ? [...WEEKDAY_RULE] : kind === "weekly" && carried !== void 0 ? [...carried] : restore ? current.stored.weekdays : kind === "weekly" && carriesClock ? [zonedWeekday(task.scheduledAt, current.shown.draft.timeZone)] : seedWeekdays(task)
						}
					};
				});
			};
			const chooseZone = (zone) => {
				if (zone === shown.draft.timeZone) return;
				setEdit((current) => ({
					...current,
					shown: {
						...current.shown,
						draft: {
							...current.shown.draft,
							timeZone: zone
						}
					}
				}));
			};
			const toggleWeekday = (weekday) => {
				if (shown.weekdays.length === 1 && shown.weekdays.includes(weekday)) return;
				const weekdays = shown.weekdays.includes(weekday) ? shown.weekdays.filter((day) => day !== weekday) : WEEKDAYS.filter((day) => day === weekday || shown.weekdays.includes(day));
				rememberWeekdays(weekdays);
				setEdit((current) => ({
					...current,
					shown: {
						...current.shown,
						weekdays
					}
				}));
			};
			const editDraft = (patch) => {
				setEdit((current) => ({
					...current,
					shown: {
						...current.shown,
						draft: {
							...current.shown.draft,
							...patch
						}
					}
				}));
			};
			const editContent = (patch) => {
				setEdit((current) => ({
					...current,
					shown: {
						...current.shown,
						...patch
					}
				}));
			};
			const cancelDraft = () => {
				chosenWeekdays.current = void 0;
				setEdit((current) => ({
					...current,
					shown: current.stored
				}));
				setFailure(void 0);
			};
			const saveDraft = async () => {
				const invalid = draftError(shown);
				if (invalid !== void 0) {
					setFailure(invalid);
					return;
				}
				const submitted = taskIdentity;
				const generation = ++submissions.current;
				setPending(true);
				setFailure(void 0);
				const request = {
					sessionId: task.sessionId,
					id: task.id,
					expected: timingSnapshot(task),
					...contentChange(shown, storedValues)
				};
				let result;
				try {
					result = await onUpdateTiming(timingValues(shown) === timingValues(storedValues) ? request : {
						...request,
						change: ruleChange(shown.draft, shown.kind, shown.weekdays)
					});
				} catch (_error) {
					if (!mounted.current || identityRef.current !== submitted || generation !== submissions.current) return;
					setPending(false);
					setFailure("rule.error.unknown");
					return;
				}
				if (!mounted.current || identityRef.current !== submitted || generation !== submissions.current) return;
				setPending(false);
				if (!result.ok) {
					setFailure("rule.error.unknown");
					return;
				}
				if ("code" in result.value) {
					setFailure(ruleError(result.value.code));
					return;
				}
				const saved = ruleValues(result.value.record);
				setEdit((current) => current.propKey === propKey ? {
					...current,
					stored: saved,
					shown: saved
				} : {
					...current,
					shown: current.stored
				});
			};
			const confirmDelete = () => {
				setDeletionConfirmed(true);
				closeConfirmation();
				onDelete(task.id);
			};
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("aside", {
				ref: panelRef,
				className: TaskManagerPage_module_css_default.detail,
				id,
				tabIndex: -1,
				"aria-label": t("detail.label"),
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: TaskManagerPage_module_css_default.detailTabsBar,
						children: [(0, react_jsx_runtime.jsx)("div", {
							ref: detailTabsRef,
							className: TaskManagerPage_module_css_default.detailTabs,
							role: "tablist",
							"aria-label": t("detail.tabs"),
							children: ["rule", "records"].map((value) => (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"data-detail-tab": value,
								role: "tab",
								id: `${id}-${value}-tab`,
								"aria-controls": `${id}-${value}-panel`,
								"aria-selected": tab === value,
								tabIndex: tab === value ? 0 : -1,
								className: TaskManagerPage_module_css_default.detailTab,
								onClick: () => {
									onTabChange(value);
								},
								onKeyDown: (event) => {
									if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
									let next;
									switch (event.key) {
										case "ArrowLeft":
										case "ArrowRight":
											next = value === "rule" ? "records" : "rule";
											break;
										case "Home":
											next = "rule";
											break;
										case "End":
											next = "records";
											break;
										default: return;
									}
									event.preventDefault();
									onTabChange(next);
									detailTabsRef.current?.querySelector(`[data-detail-tab="${next}"]`)?.focus();
								},
								children: t(`detail.${value}`)
							}, value))
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: TaskManagerPage_module_css_default.detailActions,
							children: [
								linkedShown && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: linkedText,
									side: "bottom",
									portal: true,
									disabled: !linkedCompact,
									children: (0, react_jsx_runtime.jsx)("span", {
										ref: linkedRef,
										className: TaskManagerPage_module_css_default.detailContext,
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											size: linkedCompact ? "sm" : "md",
											className: linkedCompact ? TaskManagerPage_module_css_default.detailIconButton : TaskManagerPage_module_css_default.linkedSession,
											title: linkedCompact ? void 0 : linkedSession.titled ? linkedSession.text : task.sessionId,
											"aria-label": linkedAction,
											"aria-describedby": linkedDescribedBy,
											disabled: sessionLink !== "available",
											onClick: () => {
												onOpenSession(task.sessionId);
											},
											children: linkedCompact ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceIconRegular, { kind: "session" }), linkedName] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
												className: TaskManagerPage_module_css_default.linkedSessionLabel,
												children: linkedText
											}), (0, react_jsx_runtime.jsxs)("span", {
												className: TaskManagerPage_module_css_default.linkedSessionTarget,
												children: [linkedName, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})]
											})] })
										})
									})
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: TaskManagerPage_module_css_default.menuGuard,
									onKeyDown: (event) => {
										guardMenuEscape(event, menuOpen, () => {
											setMenuOpen(false);
											moreRef.current?.focus();
										});
									},
									children: (0, react_jsx_runtime.jsx)(TaskMenu, {
										open: menuOpen,
										onClose: () => {
											setMenuOpen(false);
										},
										items: menuItems,
										onSelect: () => {
											setMenuOpen(false);
											onConfirm(task.id);
										},
										align: "end",
										portal: true,
										anchor: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											size: "sm",
											className: TaskManagerPage_module_css_default.detailIconButton,
											"aria-label": t("detail.more"),
											title: t("detail.more"),
											"aria-haspopup": "menu",
											"aria-expanded": menuOpen,
											onClick: (event) => {
												moreRef.current = event.currentTarget;
												setMenuOpen((open) => !open);
											},
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutlineRegular, {})
										})
									})
								}),
								onClose !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									className: TaskManagerPage_module_css_default.detailIconButton,
									"aria-label": t("detail.close"),
									onClick: onClose,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, {})
								})
							]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: clsx(TaskManagerPage_module_css_default.detailScroll, tab === "records" && TaskManagerPage_module_css_default.detailRecords),
						children: [
							(0, react_jsx_runtime.jsx)(CatalogFeedback, {
								status,
								populated: true,
								onRetry,
								t
							}),
							tab === "rule" && !deleted && (0, react_jsx_runtime.jsx)("header", {
								className: TaskManagerPage_module_css_default.detailHeader,
								children: task.status === "inactive" ? (0, react_jsx_runtime.jsx)("h2", {
									className: TaskManagerPage_module_css_default.readonlyName,
									children: shown.title
								}) : (0, react_jsx_runtime.jsx)("input", {
									ref: nameRef,
									className: TaskManagerPage_module_css_default.editName,
									"aria-label": t("detail.name"),
									disabled: busy || pending,
									value: shown.title,
									onChange: (event) => {
										editContent({ title: event.target.value });
									}
								})
							}),
							tab === "rule" && !deleted && (0, react_jsx_runtime.jsx)("div", {
								className: TaskManagerPage_module_css_default.nextRun,
								children: task.status === "active" ? (0, react_jsx_runtime.jsxs)("p", { children: [
									t("detail.nextRun"),
									" ",
									(0, react_jsx_runtime.jsx)("time", {
										dateTime: task.scheduledAt,
										children: nextRun.absolute
									}),
									" ",
									(0, react_jsx_runtime.jsx)("span", {
										className: TaskManagerPage_module_css_default.nextRunRelative,
										children: nextRun.relative
									})
								] }) : (0, react_jsx_runtime.jsx)("p", { children: t("status.inactive") })
							}),
							(0, react_jsx_runtime.jsx)("div", {
								role: "tabpanel",
								id: `${id}-rule-panel`,
								"aria-labelledby": `${id}-rule-tab`,
								hidden: tab !== "rule" || deleted,
								tabIndex: 0,
								children: !deleted && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [task.status === "inactive" ? (0, react_jsx_runtime.jsx)("p", {
									className: TaskManagerPage_module_css_default.readonlyPrompt,
									children: shown.prompt
								}) : (0, react_jsx_runtime.jsx)("textarea", {
									className: TaskManagerPage_module_css_default.instruction,
									"aria-label": t("detail.instruction"),
									disabled: busy || pending,
									value: shown.prompt,
									onChange: (event) => {
										editContent({ prompt: event.target.value });
									}
								}), (0, react_jsx_runtime.jsx)(RuleCard, {
									task,
									disabled: busy || pending || task.status === "inactive",
									values: shown,
									intervalUnit,
									failure: shownFailure === "timing.invalidInterval" ? INTERVAL_ERROR_KEYS[intervalUnit] : shownFailure,
									onChooseKind: chooseKind,
									onChooseZone: chooseZone,
									onToggleWeekday: toggleWeekday,
									onEditDraft: editDraft,
									t
								}, JSON.stringify([task.sessionId, task.id]))] })
							}),
							(0, react_jsx_runtime.jsx)("div", {
								role: "tabpanel",
								id: `${id}-records-panel`,
								"aria-labelledby": `${id}-records-tab`,
								className: TaskManagerPage_module_css_default.recordsPanel,
								hidden: tab !== "records",
								tabIndex: 0,
								children: tab === "records" && !deleted && (0, react_jsx_runtime.jsx)(DeliveryHistory, {
									id: task.id,
									sessionId: task.sessionId,
									latestMessageId: task.lastDelivery?.messageId,
									timeZone: recordTimeZone(task),
									loadHistory,
									t
								}, JSON.stringify([task.sessionId, task.id]))
							})
						]
					}),
					tab === "rule" && sessionNotice !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						id: `${id}-session-state`,
						className: TaskManagerPage_module_css_default.detailNotice,
						role: "status",
						children: sessionNotice
					}),
					tab === "records" && shownFailure !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: TaskManagerPage_module_css_default.saveFailure,
						role: "alert",
						children: t(shownFailure === "timing.invalidInterval" ? INTERVAL_ERROR_KEYS[intervalUnit] : shownFailure)
					}),
					dirty && !deleted && task.status !== "inactive" && (0, react_jsx_runtime.jsxs)("footer", {
						className: TaskManagerPage_module_css_default.saveFooter,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: TaskManagerPage_module_css_default.saveNotice,
								children: t("rule.unsaved")
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								disabled: pending,
								onClick: cancelDraft,
								children: t("rule.cancel")
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								disabled: pending || !dirty,
								onClick: () => {
									saveDraft();
								},
								children: t(pending ? "rule.saving" : "rule.save")
							})
						]
					})
				]
			}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				className: TaskManagerPage_module_css_default.confirmDialog,
				contentClassName: TaskManagerPage_module_css_default.confirmContent,
				open: confirming,
				title: t("delete.title"),
				description: t("delete.description"),
				closeLabel: t("delete.close"),
				onClose: closeConfirmation,
				footer: confirming && (0, react_jsx_runtime.jsxs)("div", {
					ref: footerRef,
					className: TaskManagerPage_module_css_default.confirmActions,
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						onClick: closeConfirmation,
						children: t("delete.cancel")
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						className: TaskManagerPage_module_css_default.deleteButton,
						disabled: busy,
						onClick: confirmDelete,
						children: t("delete.confirm")
					})]
				}),
				children: confirming && (0, react_jsx_runtime.jsx)("p", {
					className: TaskManagerPage_module_css_default.confirmTitle,
					children: task.title
				})
			})] });
		}
		/**
		* Identify the Repeat row choice that represents a stored rule. A weekly rule
		* whose stored set is exactly Monday through Friday maps to the `weekdays`
		* choice, which is the same rule the menu's Monday-to-Friday option submits.
		* @param record - shown rule.
		* @returns the choice matching its stored recurrence kind.
		*/
		function ruleKind(record) {
			if (record.kind === "weekly" && isWeekdayRule(record.weekdays)) return "weekdays";
			return RULE_KIND_BY_RECORD[record.kind];
		}
		/**
		* Choice that states the same stored rule as another.
		*
		* The Monday-to-Friday choice and the weekly choice both submit one Host
		* `weekly` rule, so a comparison of choices must fold them together; the three
		* elapsed-interval choices already share the one `every` choice, and every other
		* choice names its own Host rule.
		* @param kind - Repeat row choice.
		* @returns the choice that states the same stored rule.
		*/
		function storedRuleChoice(kind) {
			return kind === "weekdays" ? "weekly" : kind;
		}
		/**
		* Preserve a native time's declared precision when only minutes were entered.
		* @param time - native time value.
		* @returns the same time with whole seconds.
		*/
		function withSeconds(time) {
			return time.length === 5 ? `${time}:00` : time;
		}
		/**
		* Native input values a rule gets when it is on, or switches to, one choice.
		*
		* A one-shot target, a daily clock time, a Monday-to-Friday clock time, and a
		* weekly clock time all start from the zone the stored rule states, or from
		* this device's zone when the rule stores none; the one-shot rows show the
		* committed occurrence in that zone, so the pair still names the same instant.
		* The weekly choice seeds its weekday set separately, and the cron choice seeds
		* a daily expression from that occurrence. A switch between two clock-time
		* choices replaces the seeded time and zone with the pair the card shows,
		* wherever `chooseKind` carries it, and a switch into the elapsed interval
		* replaces its seeded seconds with `seedIntervalSeconds` for the chosen unit.
		* @param record - shown rule.
		* @param kind - choice to seed.
		* @returns complete native input values for that choice.
		*/
		function seedDraft(record, kind) {
			const zone = draftZone(record).zone;
			switch (kind) {
				case "once": {
					const wallClock = zonedWallClock(record.scheduledAt, zone);
					return {
						date: wallClock.slice(0, 10),
						time: wallClock.slice(11, 23),
						timeZone: zone,
						seconds: "",
						expression: ""
					};
				}
				case "every": return {
					date: "",
					time: "",
					timeZone: "",
					seconds: String(RULE_DEFAULT_EVERY_SECONDS),
					expression: ""
				};
				case "daily":
				case "weekdays":
				case "weekly": return {
					date: "",
					time: zonedWallClock(record.scheduledAt, zone).slice(11, 23),
					timeZone: zone,
					seconds: "",
					expression: ""
				};
				case "cron": return {
					date: "",
					time: "",
					timeZone: zone,
					seconds: "",
					expression: seedCronExpression(record, zone)
				};
			}
		}
		/**
		* Cron expression the cron choice starts from: the committed occurrence's clock
		* in the choice's zone as a daily rule, the same instant and zone the other
		* wall-clock choices seed their time row with.
		* @param record - shown rule.
		* @param zone - IANA zone the seeded expression is stated in.
		* @returns five-field expression matching that occurrence.
		*/
		function seedCronExpression(record, zone) {
			const wallClock = zonedWallClock(record.scheduledAt, zone);
			return `${Number(wallClock.slice(14, 16))} ${Number(wallClock.slice(11, 13))} * * *`;
		}
		/**
		* ISO weekday set the weekly choice edits. A weekly rule keeps its stored set;
		* another kind seeds the committed occurrence's weekday in the zone `seedDraft`
		* gives that choice, so the set and the seeded clock describe the same local day.
		* A switch between two clock-time choices carries the shown clock and zone into
		* that time, and the weekly choice then takes the occurrence's weekday in that
		* zone from `zonedWeekday`, so the set and the carried clock name one local day.
		* @param record - shown rule.
		* @returns ascending ISO weekdays, never empty.
		*/
		function seedWeekdays(record) {
			if (record.kind === "weekly") return [...record.weekdays];
			const zone = draftZone(record).zone;
			return [zonedWeekday(record.scheduledAt, zone)];
		}
		/**
		* ISO weekday one instant falls on in one zone, for the weekly choice's set.
		*
		* The formatter locale is fixed, because the seeded weekday is part of the rule
		* a save submits: it must not change with the interface language.
		* @param instant - canonical instant the rule commits.
		* @param timeZone - IANA zone whose calendar day names the weekday.
		* @returns that weekday, ISO 1 through 7; an unparsable instant reads UTC.
		*/
		function zonedWeekday(instant, timeZone) {
			const at = new Date(instant);
			let calendarDay;
			try {
				const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
					timeZone,
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				}).formatToParts(at).map((part) => [part.type, part.value]));
				calendarDay = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
			} catch {
				calendarDay = at;
			}
			return (calendarDay.getUTCDay() + 6) % 7 + 1;
		}
		/**
		* Build the timing change one staged Run time draft saves.
		*
		* The draft already holds complete values for its choice: switching recurrence
		* seeds them at the switch, so every edit stays in the request.
		* @param draft - values the card shows.
		* @param kind - choice the values belong to.
		* @param weekdays - ISO weekday set the weekly choice saves.
		* @returns the complete timing change for the compare-and-update request.
		*/
		function ruleChange(draft, kind, weekdays) {
			switch (kind) {
				case "once": return {
					kind: "at",
					at: {
						date: draft.date,
						time: withSeconds(draft.time),
						time_zone: draft.timeZone.trim()
					}
				};
				case "every": return {
					kind: "every",
					every_seconds: Number(draft.seconds)
				};
				case "daily": return {
					kind: "daily",
					daily: {
						time: withSeconds(draft.time),
						time_zone: draft.timeZone.trim()
					}
				};
				case "cron": return {
					kind: "cron",
					cron: {
						expression: draft.expression.trim(),
						time_zone: draft.timeZone.trim()
					}
				};
				case "weekdays":
				case "weekly": return {
					kind: "weekly",
					weekly: {
						time: withSeconds(draft.time),
						time_zone: draft.timeZone.trim(),
						weekdays: kind === "weekdays" ? [...WEEKDAY_RULE] : [...weekdays]
					}
				};
			}
		}
		/**
		* Longest task name the Host accepts. The browser-safe Schedule entry exports
		* types only, so the client repeats the limit its local validation uses.
		*/
		const RULE_TITLE_MAX_LENGTH = 120;
		/**
		* Whether a staged one-shot date is a real ISO calendar date.
		*
		* The control is a text field, so the value can be anything the reader types;
		* only `YYYY-MM-DD` naming an existing day is accepted. A round trip through
		* `Date.UTC` rejects a shape-correct but impossible date such as `2026-02-31`.
		* @param value - staged date text.
		* @returns true when the text is an existing ISO calendar date.
		*/
		function validIsoDate(value) {
			if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
			const parsed = /* @__PURE__ */ new Date(`${value}T00:00:00.000Z`);
			return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
		}
		/**
		* Local validation of a staged draft before it is saved.
		* @param shown - values the detail shows.
		* @returns dictionary key of the invalid field, or undefined when the draft can be saved.
		*/
		function draftError(shown) {
			const title = shown.title.trim();
			if (title.length === 0 || title.length > RULE_TITLE_MAX_LENGTH) return "rule.invalidTitle";
			if (shown.prompt.trim().length === 0) return "rule.invalidPrompt";
			if (shown.kind === "every") return /^\d+$/.test(shown.draft.seconds) && Number(shown.draft.seconds) >= MIN_INTERVAL_SECONDS ? void 0 : "timing.invalidInterval";
			if (shown.kind === "cron") return parseCronExpression(shown.draft.expression) === void 0 ? "rule.cronInvalid" : void 0;
			if (shown.kind === "once" && !validIsoDate(shown.draft.date) || !/^\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(shown.draft.time)) return "timing.invalid";
		}
		/**
		* Name and instruction one staged save replaces, omitting each value the
		* authoritative record already stores.
		* @param shown - values the detail edits.
		* @param stored - authoritative values the request carries as its expected record.
		* @returns content fields to submit, empty when both already match that record.
		*/
		function contentChange(shown, stored) {
			const content = {};
			const title = shown.title.trim();
			const prompt = shown.prompt.trim();
			if (title !== stored.title) content.title = title;
			if (prompt !== stored.prompt) content.prompt = prompt;
			return content;
		}
		/**
		* Display the recurrence the Repeat row shows: the staged choice while it differs
		* from the stored kind, otherwise the stored rule's localized frequency. The
		* cron choice always reads as its menu label: the rule card's own rows and
		* sentence state the rule, and an unrecognized expression has no short summary.
		* @param record - stored rule.
		* @param kind - choice the draft stages.
		* @param t - namespace-bound task-manager translate.
		* @param zone - host-zone context the frequency line uses to omit or name the stored zone.
		* @returns localized recurrence text.
		*/
		function repeatValue(record, kind, t, zone) {
			if (kind === "cron" || ruleKind(record) !== kind) return t(RULE_KIND_LABELS[kind]);
			return formatScheduleFrequency(record, t, zone);
		}
		/** Prefer the largest friendly unit that represents a stored whole-second interval exactly. */
		function preferredIntervalUnit(seconds) {
			const value = Number(seconds);
			if (Number.isSafeInteger(value) && value > 0 && value % INTERVAL_UNIT_SECONDS.hour === 0) return "hour";
			if (Number.isSafeInteger(value) && value > 0 && value % INTERVAL_UNIT_SECONDS.minute === 0) return "minute";
			return "second";
		}
		/** Repeat-menu label for one elapsed interval unit. */
		function intervalRuleLabel(unit) {
			if (unit === "hour") return "rule.everyHours";
			if (unit === "minute") return "rule.everyMinutes";
			return "rule.everySeconds";
		}
		/** Whether one visible Repeat-menu option selects an elapsed interval. */
		function isIntervalChoice(choice) {
			return choice === "every-hour" || choice === "every-minute" || choice === "every-second";
		}
		/** Stored interval unit selected by one visible interval choice. */
		function intervalChoiceUnit(choice) {
			if (choice === "every-hour") return "hour";
			if (choice === "every-minute") return "minute";
			return "second";
		}
		/**
		* Elapsed seconds the elapsed-interval row starts from when the user selects one
		* unit explicitly, so the number the row shows and the unit it shows agree: 3600
		* seconds is one whole hour and sixty whole minutes. The unit itself always
		* follows the user's choice, so this seed never has to express minutes or
		* seconds as the base unit.
		* @returns whole seconds that display as a whole number of the chosen unit.
		*/
		function seedIntervalSeconds() {
			return INTERVAL_UNIT_SECONDS.hour;
		}
		/**
		* Three shared timing messages name Save, Cancel, and a retained draft, none of
		* which this card has; the other codes keep their shared wording.
		*/
		const RULE_ERROR_OVERRIDES = {
			"timing.conflict": "rule.error.conflict",
			"timing.notFound": "rule.error.notFound",
			"timing.error": "rule.error.unknown"
		};
		/**
		* Localize a rejected rule update without exposing transport or storage diagnostics.
		* @param code - error code returned by the compare-and-update.
		* @returns dictionary key describing the recovery action.
		*/
		function ruleError(code) {
			const key = timingError(code);
			return RULE_ERROR_OVERRIDES[key] ?? key;
		}
		/**
		* Close an open dropdown on Escape before the page's own Escape handler sees
		* the key, so dismissing a menu never closes the whole task detail. Stopping
		* the key's propagation withholds it from the menu's own document listener,
		* which the page's handler honors; this guard covers a dropdown whose listener
		* stands down before that.
		* @param event - keydown from the wrapper around that menu.
		* @param open - whether this wrapper's menu is showing.
		* @param close - dismiss that menu and return focus to its trigger.
		*/
		function guardMenuEscape(event, open, close) {
			if (event.key !== "Escape") return;
			if (!open) return;
			event.stopPropagation();
			close();
		}
		/**
		* Seed the detail's editable values from one stored record.
		* @param record - rule to seed from.
		* @returns complete shown values for that rule.
		*/
		function ruleValues(record) {
			return {
				title: record.title,
				prompt: record.prompt,
				kind: ruleKind(record),
				draft: timingDraft(record),
				weekdays: seedWeekdays(record)
			};
		}
		/**
		* Seed the detail's staged draft state from one stored record.
		* @param record - rule to seed from.
		* @returns a clean draft that equals its stored values.
		*/
		function initialRuleEdit(record) {
			const values = ruleValues(record);
			return {
				propKey: shownValues(values),
				stored: values,
				shown: values
			};
		}
		/**
		* Comparison key of the staged timing values alone, without the stored record's
		* identity or committed target.
		* @param shown - values the detail displays.
		* @returns key that changes exactly when one staged timing value changes.
		*/
		function timingValues(shown) {
			const { kind, draft, weekdays } = shown;
			return JSON.stringify([
				kind,
				draft.date,
				draft.time,
				draft.timeZone,
				draft.seconds,
				draft.expression,
				weekdays
			]);
		}
		/**
		* Comparison key of every staged value, without the stored record's identity or
		* committed target. The name and instruction compare trimmed, because the Host
		* stores both trimmed.
		* @param shown - values the detail displays.
		* @returns key that changes exactly when one shown value changes.
		*/
		function shownValues(shown) {
			return JSON.stringify([
				shown.title.trim(),
				shown.prompt.trim(),
				timingValues(shown)
			]);
		}
		/**
		* Choose one merged text field: text the user changed keeps the draft value,
		* and text the user left untouched takes the refreshed record. Both sides
		* compare trimmed, because the Host stores both trimmed.
		* @param draft - text the control shows.
		* @param stored - authoritative text the draft was compared against.
		* @param authoritative - text of the refreshed record.
		* @returns the text the merge keeps.
		*/
		function reseedText(draft, stored, authoritative) {
			return draft.trim() === stored.trim() ? authoritative : draft;
		}
		/** Whether two weekday sets hold the same days in the same order. */
		function sameWeekdays(left, right) {
			return left.length === right.length && left.every((day, index) => day === right[index]);
		}
		/**
		* Whether the user changed any timing field of a draft.
		* @param draft - values the detail currently shows.
		* @param stored - values the draft was compared against.
		* @returns whether any timing field differs from the stored one.
		*/
		function editedTiming(draft, stored) {
			return draft.draft.date !== stored.draft.date || draft.draft.time !== stored.draft.time || draft.draft.timeZone !== stored.draft.timeZone || draft.draft.seconds !== stored.draft.seconds || draft.draft.expression !== stored.draft.expression || !sameWeekdays(draft.weekdays, stored.weekdays);
		}
		/**
		* Choose one merged timing field of a draft whose rule kind did not change.
		* @param draft - value the detail shows.
		* @param stored - value the draft was compared against.
		* @param authoritative - value of the refreshed record.
		* @returns the value the merge keeps.
		*/
		function reseedValue(draft, stored, authoritative) {
			return draft === stored ? authoritative : draft;
		}
		/**
		* Merge one refreshed authoritative record into a staged draft.
		*
		* Three cases, because a rule kind and the fields that describe it are one
		* value. The Monday-to-Friday choice and the weekly choice state the same Host
		* weekly rule, so the comparisons below fold them together and only the day set
		* tells them apart.
		*
		* The draft stages another kind than the stored record. Its fields describe a
		* rule the refreshed record does not state, so the draft keeps them whole.
		*
		* The draft stages the stored kind, and the refreshed record changed that kind.
		* The two rules cannot be mixed, so the draft is kept whole when the user edited
		* it and the refreshed rule is adopted whole when the user did not.
		*
		* All three kinds agree. Only here can one field differ legitimately on each
		* side, so the fields merge on their own: a field the user changed keeps the
		* draft value and every other field takes the refreshed record, which is what
		* carries a concurrent remote timing edit into an unrelated local edit.
		*
		* The name and the instruction merge field by field in every case: another
		* client's rename reaches this detail even while a rule change is staged.
		* @param authoritative - values of the refreshed record.
		* @param draft - values the detail currently shows.
		* @param stored - authoritative values the draft was compared against.
		* @returns the merged values.
		*/
		function mergeRuleDraft(authoritative, draft, stored) {
			const text = {
				title: reseedText(draft.title, stored.title, authoritative.title),
				prompt: reseedText(draft.prompt, stored.prompt, authoritative.prompt)
			};
			if (storedRuleChoice(draft.kind) !== storedRuleChoice(stored.kind)) return {
				...draft,
				...text
			};
			if (storedRuleChoice(authoritative.kind) !== storedRuleChoice(stored.kind)) return editedTiming(draft, stored) ? {
				...draft,
				...text
			} : {
				...authoritative,
				...text
			};
			const weekdays = sameWeekdays(draft.weekdays, stored.weekdays) ? authoritative.weekdays : draft.weekdays;
			const stagedChoice = draft.kind !== stored.kind || !sameWeekdays(draft.weekdays, stored.weekdays);
			return {
				...text,
				kind: storedRuleChoice(draft.kind) === "weekly" ? stagedChoice ? draft.kind : isWeekdayRule(weekdays) ? "weekdays" : "weekly" : reseedValue(draft.kind, stored.kind, authoritative.kind),
				draft: {
					date: reseedValue(draft.draft.date, stored.draft.date, authoritative.draft.date),
					time: reseedValue(draft.draft.time, stored.draft.time, authoritative.draft.time),
					timeZone: reseedValue(draft.draft.timeZone, stored.draft.timeZone, authoritative.draft.timeZone),
					seconds: reseedValue(draft.draft.seconds, stored.draft.seconds, authoritative.draft.seconds),
					expression: reseedValue(draft.draft.expression, stored.draft.expression, authoritative.draft.expression)
				},
				weekdays
			};
		}
		/**
		* Render the weekly rule's Weekday row: one pill per weekday, named by the row's
		* label and toggled in the rule the caller is editing.
		* @param props.weekdays - weekdays the rule currently selects, as the builder's stored day numbers.
		* @param props.disabled - whether the rule's controls are read-only.
		* @param props.t - frequency translator owning the weekday labels.
		* @param props.rowId - id builder for the row's label, which names the pill group.
		* @param props.onToggle - toggle one weekday in the rule being edited.
		* @returns the labelled Weekday row.
		*/
		function WeekdayRow({ weekdays, disabled, t, rowId, onToggle }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TaskManagerPage_module_css_default.ruleRow,
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: TaskManagerPage_module_css_default.ruleLabel,
					id: rowId("weekday"),
					children: t("rule.weekday")
				}), (0, react_jsx_runtime.jsx)("div", {
					className: clsx(TaskManagerPage_module_css_default.ruleWeekdays, TaskManagerPage_module_css_default.ruleControl),
					role: "group",
					"aria-labelledby": rowId("weekday"),
					children: WEEKDAYS.map((weekday) => {
						const selected = weekdays.includes(weekday);
						return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
							className: TaskManagerPage_module_css_default.ruleControl,
							active: selected,
							disabled,
							"aria-pressed": selected,
							"aria-label": t("rule.weekdayOption", { weekday: t(WEEKDAY_LABELS[weekday]) }),
							onClick: () => {
								onToggle(weekday);
							},
							children: t(WEEKDAY_LABELS[weekday])
						}, weekday);
					})
				})]
			});
		}
		/**
		* Render the rule's recurrence, time, and zone as rows that edit a local draft.
		*
		* No row reaches the Host on its own: the detail's Save action submits the
		* complete expected record with the staged name, instruction, and timing change
		* through `schedule.update`.
		* @param props - task, staged values, blocking state, draft callbacks, and locale.
		* @returns the bordered Run time card with its staged rows.
		*/
		function RuleCard({ task, disabled, values, intervalUnit, failure, onChooseKind, onChooseZone, onToggleWeekday, onEditDraft, t }) {
			const shown = values;
			const [repeatOpen, setRepeatOpen] = (0, react.useState)(false);
			const [zoneOpen, setZoneOpen] = (0, react.useState)(false);
			const [zoneQuery, setZoneQuery] = (0, react.useState)("");
			const [dateOpen, setDateOpen] = (0, react.useState)(false);
			const [timeOpen, setTimeOpen] = (0, react.useState)(false);
			const systemZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			const [recentZones, setRecentZones] = (0, react.useState)(() => loadRecentTimeZones(systemZone));
			const frequencyZone = {
				system: systemZone,
				label: (zone) => zoneLabel(zone, t)
			};
			const repeatRef = (0, react.useRef)(null);
			const zoneRef = (0, react.useRef)(null);
			const dateRef = (0, react.useRef)(null);
			const timeRef = (0, react.useRef)(null);
			const cardId = (0, react.useId)();
			const rowId = (name) => `${cardId}-${name}`;
			(0, react.useEffect)(() => {
				if (!disabled) return;
				setDateOpen(false);
				setTimeOpen(false);
			}, [disabled]);
			const chooseChoice = (choice) => {
				setRepeatOpen(false);
				if (isIntervalChoice(choice)) {
					onChooseKind("every", intervalChoiceUnit(choice));
					return;
				}
				onChooseKind(choice);
			};
			const intervalMin = Math.ceil(MIN_INTERVAL_SECONDS / INTERVAL_UNIT_SECONDS[intervalUnit]);
			const intervalValue = shown.draft.seconds === "" ? void 0 : Number(shown.draft.seconds) / INTERVAL_UNIT_SECONDS[intervalUnit];
			const stepInterval = (delta) => {
				const next = intervalValue === void 0 ? intervalMin : Math.max(intervalMin, intervalValue + delta);
				onEditDraft({ seconds: String(Math.round(next * INTERVAL_UNIT_SECONDS[intervalUnit])) });
			};
			const chooseZone = (zone) => {
				setZoneOpen(false);
				setZoneQuery("");
				setRecentZones((recent) => rememberTimeZone(recent, zone));
				onChooseZone(zone);
			};
			const zoneCatalog = (0, react.useMemo)(() => {
				if (!zoneOpen) return [];
				const at = Date.now();
				const byLabel = /* @__PURE__ */ new Map();
				for (const zone of zoneChoices(shown.draft.timeZone, systemZone, at)) {
					const label = zoneName(zone, systemZone, t, at);
					const existing = byLabel.get(label);
					if (existing === void 0) {
						byLabel.set(label, {
							id: zone,
							label,
							disabled,
							zones: [zone]
						});
						continue;
					}
					existing.zones.push(zone);
					if (zone === shown.draft.timeZone) existing.id = zone;
				}
				return [...byLabel.values()];
			}, [
				disabled,
				shown.draft.timeZone,
				systemZone,
				t,
				zoneOpen
			]);
			const zoneLocale = t("time.locale");
			const normalizedZoneQuery = zoneQuery.trim().toLocaleLowerCase(zoneLocale);
			const namedZone = (zones, preferred) => {
				if (normalizedZoneQuery === "") return void 0;
				const exact = zones.find((zone) => zone.toLocaleLowerCase(zoneLocale) === normalizedZoneQuery);
				if (exact !== void 0) return exact;
				const partial = zones.filter((zone) => zone.toLocaleLowerCase(zoneLocale).includes(normalizedZoneQuery));
				if (partial.length === 0) return void 0;
				return partial.includes(preferred) ? preferred : partial[0];
			};
			const zoneItems = zoneCatalog.filter((item) => `${item.zones.join(" ")} ${item.label}`.toLocaleLowerCase(zoneLocale).includes(normalizedZoneQuery)).map((item) => ({
				...item,
				id: namedZone(item.zones, item.id) ?? item.id
			}));
			const recentItems = normalizedZoneQuery === "" ? recentZones.flatMap((zone) => {
				const item = zoneCatalog.find((choice) => choice.zones.includes(zone));
				return item === void 0 ? [] : [{
					...item,
					id: zone
				}];
			}).filter((item, index, items) => items.findIndex((candidate) => candidate.label === item.label) === index) : [];
			const recentLabels = new Set(recentItems.map((item) => item.label));
			const availableZoneItems = zoneItems.filter((item) => !recentLabels.has(item.label));
			const shownZoneItems = recentItems.length === 0 ? availableZoneItems : availableZoneItems.length === 0 ? recentItems : [
				...recentItems,
				{
					type: "separator",
					id: "__recent"
				},
				...availableZoneItems
			];
			const parsedCron = shown.kind === "cron" ? parseCronExpression(shown.draft.expression) : void 0;
			const clockHint = shown.kind === "once" && !draftZone(task).stored ? "timing.zoneNoStored" : void 0;
			const clockLine = failure ?? clockHint;
			return (0, react_jsx_runtime.jsxs)("section", {
				className: TaskManagerPage_module_css_default.ruleCard,
				"aria-label": t("rule.title"),
				children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("rule.title") }),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TaskManagerPage_module_css_default.ruleRows,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: TaskManagerPage_module_css_default.menuGuard,
								onKeyDown: (event) => {
									guardMenuEscape(event, repeatOpen, () => {
										setRepeatOpen(false);
										repeatRef.current?.focus();
									});
								},
								children: (0, react_jsx_runtime.jsx)(TaskMenu, {
									className: TaskManagerPage_module_css_default.ruleRowMenu,
									open: repeatOpen,
									onClose: () => {
										setRepeatOpen(false);
									},
									items: RULE_CHOICES.map((value) => ({
										id: value,
										label: t(RULE_CHOICE_LABELS[value]),
										disabled
									})),
									selectedId: shown.kind === "every" ? `every-${intervalUnit}` : shown.kind,
									onSelect: (id) => {
										chooseChoice(id);
									},
									align: "end",
									portal: true,
									anchor: (0, react_jsx_runtime.jsxs)("button", {
										ref: repeatRef,
										type: "button",
										className: TaskManagerPage_module_css_default.ruleValue,
										disabled,
										"aria-haspopup": "menu",
										"aria-expanded": repeatOpen,
										onClick: () => {
											setRepeatOpen((open) => !open);
										},
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: TaskManagerPage_module_css_default.ruleLabel,
											children: t("rule.repeat")
										}), (0, react_jsx_runtime.jsxs)("span", {
											className: clsx(TaskManagerPage_module_css_default.ruleValueFace, TaskManagerPage_module_css_default.ruleControl),
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: TaskManagerPage_module_css_default.ruleCurrent,
												children: shown.kind === "every" ? t(intervalRuleLabel(intervalUnit)) : repeatValue(task, shown.kind, t, frequencyZone)
											}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})]
										})]
									})
								})
							}),
							shown.kind === "weekly" && (0, react_jsx_runtime.jsx)(WeekdayRow, {
								weekdays: shown.weekdays,
								disabled,
								t,
								rowId,
								onToggle: onToggleWeekday
							}),
							shown.kind === "every" ? (0, react_jsx_runtime.jsxs)("div", {
								className: TaskManagerPage_module_css_default.ruleRow,
								children: [(0, react_jsx_runtime.jsx)("label", {
									className: TaskManagerPage_module_css_default.ruleLabel,
									htmlFor: rowId("interval"),
									children: t("timing.interval")
								}), (0, react_jsx_runtime.jsxs)("span", {
									className: TaskManagerPage_module_css_default.ruleInterval,
									children: [(0, react_jsx_runtime.jsxs)("span", {
										className: TaskManagerPage_module_css_default.ruleIntervalStepper,
										style: { "--interval-digits": String(intervalValue ?? "").length || 1 },
										children: [(0, react_jsx_runtime.jsx)("input", {
											id: rowId("interval"),
											className: clsx(TaskManagerPage_module_css_default.ruleInput, TaskManagerPage_module_css_default.ruleControl, TaskManagerPage_module_css_default.ruleIntervalInput),
											type: "number",
											min: intervalMin,
											step: "any",
											disabled,
											value: intervalValue ?? "",
											"aria-describedby": rowId("interval-hint"),
											onChange: (event) => {
												const value = event.target.value;
												onEditDraft({ seconds: value === "" ? "" : String(Math.round(Number(value) * INTERVAL_UNIT_SECONDS[intervalUnit])) });
											}
										}), (0, react_jsx_runtime.jsxs)("span", {
											className: TaskManagerPage_module_css_default.ruleIntervalArrows,
											children: [(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: TaskManagerPage_module_css_default.ruleIntervalArrow,
												"aria-label": t("timing.intervalIncrease"),
												disabled,
												onClick: () => {
													stepInterval(1);
												},
												children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, { size: 9 })
											}), (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: TaskManagerPage_module_css_default.ruleIntervalArrow,
												"aria-label": t("timing.intervalDecrease"),
												disabled: disabled || intervalValue !== void 0 && intervalValue <= intervalMin,
												onClick: () => {
													stepInterval(-1);
												},
												children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 9 })
											})]
										})]
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TaskManagerPage_module_css_default.ruleIntervalUnit,
										children: t(INTERVAL_UNIT_LABELS[intervalUnit])
									})]
								})]
							}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								shown.kind === "once" && (0, react_jsx_runtime.jsxs)("div", {
									className: TaskManagerPage_module_css_default.ruleRow,
									children: [(0, react_jsx_runtime.jsx)("label", {
										className: TaskManagerPage_module_css_default.ruleLabel,
										htmlFor: rowId("date"),
										children: t("timing.date")
									}), (0, react_jsx_runtime.jsxs)("span", {
										className: TaskManagerPage_module_css_default.menuGuard,
										onKeyDown: (event) => {
											guardMenuEscape(event, dateOpen, () => {
												setDateOpen(false);
												dateRef.current?.focus();
											});
										},
										children: [(0, react_jsx_runtime.jsxs)("button", {
											ref: dateRef,
											id: rowId("date"),
											type: "button",
											className: clsx(TaskManagerPage_module_css_default.ruleInput, TaskManagerPage_module_css_default.ruleControl, TaskManagerPage_module_css_default.pickerTrigger),
											disabled,
											"aria-label": t("timing.date"),
											"aria-haspopup": "dialog",
											"aria-expanded": dateOpen,
											"aria-describedby": clockHint === void 0 ? void 0 : rowId("time-hint"),
											onClick: () => {
												setDateOpen((open) => !open);
											},
											children: [(0, react_jsx_runtime.jsx)("span", { children: slashDate(shown.draft.date) }), (0, react_jsx_runtime.jsx)(IconCalendarOutlineRegular, { className: TaskManagerPage_module_css_default.pickerIcon })]
										}), (0, react_jsx_runtime.jsx)(DatePicker, {
											open: dateOpen,
											anchorRef: dateRef,
											value: shown.draft.date,
											onPick: (date) => {
												onEditDraft({ date });
											},
											onClose: () => {
												setDateOpen(false);
											},
											t
										})]
									})]
								}),
								shown.kind !== "cron" && (0, react_jsx_runtime.jsxs)("div", {
									className: TaskManagerPage_module_css_default.ruleRow,
									children: [(0, react_jsx_runtime.jsx)("label", {
										className: TaskManagerPage_module_css_default.ruleLabel,
										htmlFor: rowId("time"),
										children: t("timing.time")
									}), (0, react_jsx_runtime.jsxs)("span", {
										className: TaskManagerPage_module_css_default.menuGuard,
										onKeyDown: (event) => {
											guardMenuEscape(event, timeOpen, () => {
												setTimeOpen(false);
												timeRef.current?.focus();
											});
										},
										children: [(0, react_jsx_runtime.jsxs)("button", {
											ref: timeRef,
											id: rowId("time"),
											type: "button",
											className: clsx(TaskManagerPage_module_css_default.ruleInput, TaskManagerPage_module_css_default.ruleControl, TaskManagerPage_module_css_default.pickerTrigger),
											disabled,
											"aria-label": t("timing.time"),
											"aria-haspopup": "dialog",
											"aria-expanded": timeOpen,
											"aria-describedby": clockHint === void 0 ? void 0 : rowId("time-hint"),
											onClick: () => {
												setTimeOpen((open) => !open);
											},
											children: [(0, react_jsx_runtime.jsx)("span", { children: secondPrecision(shown.draft.time) }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { className: TaskManagerPage_module_css_default.pickerIcon })]
										}), (0, react_jsx_runtime.jsx)(ClockPicker, {
											open: timeOpen,
											anchorRef: timeRef,
											value: shown.draft.time,
											onPick: (time) => {
												onEditDraft({ time });
											},
											onClose: () => {
												setTimeOpen(false);
											},
											t
										})]
									})]
								}),
								shown.kind === "cron" && (0, react_jsx_runtime.jsx)(CronRows, {
									task,
									disabled,
									expression: shown.draft.expression,
									timeZone: shown.draft.timeZone,
									hintId: rowId("expression-hint"),
									onEditExpression: (expression) => {
										onEditDraft({ expression });
									},
									t
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: TaskManagerPage_module_css_default.menuGuard,
									onKeyDown: (event) => {
										guardMenuEscape(event, zoneOpen, () => {
											setZoneOpen(false);
											zoneRef.current?.focus();
										});
									},
									children: (0, react_jsx_runtime.jsx)(TaskMenu, {
										className: TaskManagerPage_module_css_default.ruleRowMenu,
										open: zoneOpen,
										onClose: () => {
											setZoneOpen(false);
											setZoneQuery("");
										},
										items: shownZoneItems.length > 0 ? shownZoneItems : [{
											id: "__empty",
											label: t("timing.zoneNoResults"),
											disabled: true
										}],
										listClassName: TaskManagerPage_module_css_default.zoneMenu,
										header: (0, react_jsx_runtime.jsx)("input", {
											className: TaskManagerPage_module_css_default.zoneSearch,
											type: "search",
											value: zoneQuery,
											placeholder: t("timing.zoneSearch"),
											"aria-label": t("timing.zoneSearch"),
											"data-menu-field": "",
											onChange: (event) => {
												setZoneQuery(event.target.value);
											}
										}),
										selectedId: shown.draft.timeZone,
										onSelect: (id) => {
											chooseZone(id);
										},
										align: "end",
										portal: true,
										anchor: (0, react_jsx_runtime.jsxs)("button", {
											ref: zoneRef,
											type: "button",
											className: TaskManagerPage_module_css_default.ruleValue,
											disabled,
											"aria-haspopup": "menu",
											"aria-expanded": zoneOpen,
											onClick: () => {
												setZoneOpen((open) => {
													if (open) setZoneQuery("");
													return !open;
												});
											},
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: TaskManagerPage_module_css_default.ruleLabel,
												children: t("timing.zone")
											}), (0, react_jsx_runtime.jsxs)("span", {
												className: clsx(TaskManagerPage_module_css_default.ruleValueFace, TaskManagerPage_module_css_default.ruleControl),
												children: [(0, react_jsx_runtime.jsx)("span", {
													className: TaskManagerPage_module_css_default.ruleCurrent,
													children: zoneName(shown.draft.timeZone, systemZone, t)
												}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})]
											})]
										})
									})
								})
							] })
						]
					}),
					shown.kind === "every" && (0, react_jsx_runtime.jsx)("p", {
						id: rowId("interval-hint"),
						role: failure === void 0 ? void 0 : "alert",
						className: clsx(TaskManagerPage_module_css_default.ruleHint, failure !== void 0 && TaskManagerPage_module_css_default.ruleHintError),
						children: t(failure ?? INTERVAL_HINT_KEYS[intervalUnit])
					}),
					shown.kind !== "every" && (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: shown.kind === "cron" ? (0, react_jsx_runtime.jsx)("p", {
						id: rowId("expression-hint"),
						role: failure === void 0 && parsedCron !== void 0 ? void 0 : "alert",
						className: clsx(TaskManagerPage_module_css_default.ruleHint, (failure !== void 0 || parsedCron === void 0) && TaskManagerPage_module_css_default.ruleHintError),
						children: failure !== void 0 ? t(failure) : parsedCron === void 0 ? t("rule.cronInvalid") : cronPreview(parsedCron, t, t("time.locale"))
					}) : clockLine !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						id: rowId("time-hint"),
						role: failure === void 0 ? void 0 : "alert",
						className: clsx(TaskManagerPage_module_css_default.ruleHint, failure !== void 0 && TaskManagerPage_module_css_default.ruleHintError),
						children: t(clockLine)
					}) })
				]
			});
		}
		/** Cron builder frequency choices in menu order; `raw` edits the expression text itself. */
		const CRON_SHAPE_CHOICES = [
			"monthly",
			"weekly",
			"daily",
			"hourly",
			"minutely",
			"raw"
		];
		/** Days a month can hold, in the date grid's order. */
		const MONTH_DAYS = Array.from({ length: 31 }, (_value, index) => index + 1);
		/** Frequency-menu label of each builder choice; the stepped shapes reuse the Repeat menu's wording. */
		const CRON_SHAPE_LABELS = {
			monthly: "cronForm.monthly",
			weekly: "cronForm.weekly",
			daily: "cronForm.daily",
			hourly: "rule.everyHours",
			minutely: "rule.everyMinutes",
			raw: "rule.cronLabel"
		};
		/** Whole minutes between runs a switch to the minutely shape starts from. */
		const CRON_DEFAULT_MINUTE_STEP = 5;
		/**
		* Render the cron choice as structured rows when the staged expression matches
		* one recognized shape, and as the raw expression input otherwise.
		*
		* The builder owns no rule state: every row edit regenerates the staged
		* expression, so storage stays a plain cron rule. Choosing the raw option keeps
		* the expression text editable even while it stays recognizable, until another
		* shape is chosen.
		* @param props - staged expression, blocking state, expression callback, and locale.
		* @returns the cron rows of the Run time card.
		*/
		function CronRows({ task, disabled, expression, timeZone, hintId, onEditExpression, t }) {
			const parsed = parseCronExpression(expression);
			const shape = parsed === void 0 ? void 0 : recognizeCronShape(parsed);
			const [rawChosen, setRawChosen] = (0, react.useState)(false);
			const [freqOpen, setFreqOpen] = (0, react.useState)(false);
			const [timeOpen, setTimeOpen] = (0, react.useState)(false);
			const freqRef = (0, react.useRef)(null);
			const timeRef = (0, react.useRef)(null);
			const baseId = (0, react.useId)();
			const rowId = (name) => `${baseId}-${name}`;
			(0, react.useEffect)(() => {
				if (disabled) setTimeOpen(false);
			}, [disabled]);
			const builder = rawChosen ? void 0 : shape;
			const chooseShape = (choice) => {
				setFreqOpen(false);
				if (choice === "raw") {
					setRawChosen(true);
					return;
				}
				setRawChosen(false);
				if (choice === shape?.kind) return;
				const wallClock = zonedWallClock(task.scheduledAt, timeZone);
				const minute = shape !== void 0 && shape.kind !== "minutely" ? shape.minute : Number(wallClock.slice(14, 16));
				const hour = shape?.kind === "daily" || shape?.kind === "weekly" || shape?.kind === "monthly" ? shape.hour : Number(wallClock.slice(11, 13));
				switch (choice) {
					case "minutely":
						onEditExpression(cronShapeExpression({
							kind: "minutely",
							step: CRON_DEFAULT_MINUTE_STEP
						}));
						return;
					case "hourly":
						onEditExpression(cronShapeExpression({
							kind: "hourly",
							step: 1,
							minute
						}));
						return;
					case "daily":
						onEditExpression(cronShapeExpression({
							kind: "daily",
							hour,
							minute
						}));
						return;
					case "weekly":
						onEditExpression(cronShapeExpression({
							kind: "weekly",
							weekdays: [zonedWeekday(task.scheduledAt, timeZone)],
							hour,
							minute
						}));
						return;
					case "monthly":
						onEditExpression(cronShapeExpression({
							kind: "monthly",
							days: [Number(wallClock.slice(8, 10))],
							hour,
							minute
						}));
						return;
					/* v8 ignore next -- the switch covers every CronShapeChoice, so the default holds no reachable statement. */
					default: assertNever(choice);
				}
			};
			const toggleDay = (current, weekday) => {
				if (current.weekdays.length === 1 && current.weekdays.includes(weekday)) return;
				const weekdays = current.weekdays.includes(weekday) ? current.weekdays.filter((day) => day !== weekday) : WEEKDAYS.filter((day) => day === weekday || current.weekdays.includes(day));
				onEditExpression(cronShapeExpression({
					...current,
					weekdays
				}));
			};
			const toggleDate = (current, day) => {
				if (current.days.length === 1 && current.days.includes(day)) return;
				const days = current.days.includes(day) ? current.days.filter((value) => value !== day) : MONTH_DAYS.filter((value) => value === day || current.days.includes(value));
				onEditExpression(cronShapeExpression({
					...current,
					days
				}));
			};
			const pad = (value) => String(value).padStart(2, "0");
			const clock = builder?.kind === "daily" || builder?.kind === "weekly" || builder?.kind === "monthly" ? `${pad(builder.hour)}:${pad(builder.minute)}` : "";
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)("span", {
					className: TaskManagerPage_module_css_default.menuGuard,
					onKeyDown: (event) => {
						guardMenuEscape(event, freqOpen, () => {
							setFreqOpen(false);
							freqRef.current?.focus();
						});
					},
					children: (0, react_jsx_runtime.jsx)(TaskMenu, {
						className: TaskManagerPage_module_css_default.ruleRowMenu,
						open: freqOpen,
						onClose: () => {
							setFreqOpen(false);
						},
						items: CRON_SHAPE_CHOICES.map((value) => ({
							id: value,
							label: t(CRON_SHAPE_LABELS[value]),
							disabled
						})),
						selectedId: builder?.kind ?? "raw",
						onSelect: (id) => {
							chooseShape(id);
						},
						align: "end",
						portal: true,
						anchor: (0, react_jsx_runtime.jsxs)("button", {
							ref: freqRef,
							type: "button",
							className: TaskManagerPage_module_css_default.ruleValue,
							disabled,
							"aria-haspopup": "menu",
							"aria-expanded": freqOpen,
							"aria-describedby": hintId,
							onClick: () => {
								setFreqOpen((open) => !open);
							},
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TaskManagerPage_module_css_default.ruleLabel,
								children: t("cronForm.frequency")
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: clsx(TaskManagerPage_module_css_default.ruleValueFace, TaskManagerPage_module_css_default.ruleControl),
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: TaskManagerPage_module_css_default.ruleCurrent,
									children: t(builder === void 0 ? "rule.cronLabel" : CRON_SHAPE_LABELS[builder.kind])
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})]
							})]
						})
					})
				}),
				builder?.kind === "monthly" && (0, react_jsx_runtime.jsxs)("div", {
					className: TaskManagerPage_module_css_default.ruleRow,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: TaskManagerPage_module_css_default.ruleLabel,
						id: rowId("dates"),
						children: t("cronForm.dates")
					}), (0, react_jsx_runtime.jsx)("div", {
						className: clsx(TaskManagerPage_module_css_default.ruleMonthDays, TaskManagerPage_module_css_default.ruleControl),
						role: "group",
						"aria-labelledby": rowId("dates"),
						children: MONTH_DAYS.map((day) => {
							const selected = builder.days.includes(day);
							return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
								className: TaskManagerPage_module_css_default.ruleControl,
								active: selected,
								disabled,
								"aria-pressed": selected,
								"aria-label": t("cronForm.dateOption", { day }),
								onClick: () => {
									toggleDate(builder, day);
								},
								children: day
							}, day);
						})
					})]
				}),
				builder?.kind === "weekly" && (0, react_jsx_runtime.jsx)(WeekdayRow, {
					weekdays: builder.weekdays,
					disabled,
					t,
					rowId,
					onToggle: (weekday) => {
						toggleDay(builder, weekday);
					}
				}),
				(builder?.kind === "minutely" || builder?.kind === "hourly") && (0, react_jsx_runtime.jsxs)("div", {
					className: TaskManagerPage_module_css_default.ruleRow,
					children: [(0, react_jsx_runtime.jsx)("label", {
						className: TaskManagerPage_module_css_default.ruleLabel,
						htmlFor: rowId("step"),
						children: t("timing.interval")
					}), (0, react_jsx_runtime.jsxs)("span", {
						className: TaskManagerPage_module_css_default.ruleInterval,
						children: [(0, react_jsx_runtime.jsx)(CronStepper, {
							id: rowId("step"),
							min: 1,
							max: builder.kind === "minutely" ? 59 : 23,
							value: builder.step,
							disabled,
							increaseLabel: t("timing.intervalIncrease"),
							decreaseLabel: t("timing.intervalDecrease"),
							onChange: (step) => {
								onEditExpression(cronShapeExpression({
									...builder,
									step
								}));
							}
						}), (0, react_jsx_runtime.jsx)("span", {
							className: TaskManagerPage_module_css_default.ruleIntervalUnit,
							children: t(builder.kind === "minutely" ? "timing.unit.minute" : "timing.unit.hour")
						})]
					})]
				}),
				builder?.kind === "hourly" && (0, react_jsx_runtime.jsxs)("div", {
					className: TaskManagerPage_module_css_default.ruleRow,
					children: [(0, react_jsx_runtime.jsx)("label", {
						className: TaskManagerPage_module_css_default.ruleLabel,
						htmlFor: rowId("minute"),
						children: t("cronForm.atMinute")
					}), (0, react_jsx_runtime.jsx)("span", {
						className: TaskManagerPage_module_css_default.ruleInterval,
						children: (0, react_jsx_runtime.jsx)(CronStepper, {
							id: rowId("minute"),
							min: 0,
							max: 59,
							value: builder.minute,
							disabled,
							increaseLabel: t("cronForm.minuteIncrease"),
							decreaseLabel: t("cronForm.minuteDecrease"),
							onChange: (minute) => {
								onEditExpression(cronShapeExpression({
									...builder,
									minute
								}));
							}
						})
					})]
				}),
				(builder?.kind === "daily" || builder?.kind === "weekly" || builder?.kind === "monthly") && (0, react_jsx_runtime.jsxs)("div", {
					className: TaskManagerPage_module_css_default.ruleRow,
					children: [(0, react_jsx_runtime.jsx)("label", {
						className: TaskManagerPage_module_css_default.ruleLabel,
						htmlFor: rowId("time"),
						children: t("timing.time")
					}), (0, react_jsx_runtime.jsxs)("span", {
						className: TaskManagerPage_module_css_default.menuGuard,
						onKeyDown: (event) => {
							guardMenuEscape(event, timeOpen, () => {
								setTimeOpen(false);
								timeRef.current?.focus();
							});
						},
						children: [(0, react_jsx_runtime.jsxs)("button", {
							ref: timeRef,
							id: rowId("time"),
							type: "button",
							className: clsx(TaskManagerPage_module_css_default.ruleInput, TaskManagerPage_module_css_default.ruleControl, TaskManagerPage_module_css_default.pickerTrigger),
							disabled,
							"aria-label": t("timing.time"),
							"aria-haspopup": "dialog",
							"aria-expanded": timeOpen,
							onClick: () => {
								setTimeOpen((open) => !open);
							},
							children: [(0, react_jsx_runtime.jsx)("span", { children: clock }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { className: TaskManagerPage_module_css_default.pickerIcon })]
						}), (0, react_jsx_runtime.jsx)(ClockPicker, {
							open: timeOpen,
							anchorRef: timeRef,
							value: clock,
							seconds: false,
							onPick: (time) => {
								onEditExpression(cronShapeExpression({
									...builder,
									hour: Number(time.slice(0, 2)),
									minute: Number(time.slice(3, 5))
								}));
							},
							onClose: () => {
								setTimeOpen(false);
							},
							t
						})]
					})]
				}),
				builder === void 0 && (0, react_jsx_runtime.jsxs)("div", {
					className: TaskManagerPage_module_css_default.ruleRow,
					children: [(0, react_jsx_runtime.jsx)("label", {
						className: TaskManagerPage_module_css_default.ruleLabel,
						htmlFor: rowId("expression"),
						children: t("rule.cronLabel")
					}), (0, react_jsx_runtime.jsx)("input", {
						id: rowId("expression"),
						className: clsx(TaskManagerPage_module_css_default.ruleInput, TaskManagerPage_module_css_default.ruleControl),
						type: "text",
						spellCheck: false,
						autoComplete: "off",
						disabled,
						"aria-invalid": parsed === void 0,
						"aria-describedby": hintId,
						value: expression,
						onChange: (event) => {
							onEditExpression(event.target.value);
						}
					})]
				})
			] });
		}
		/**
		* One whole-number stepper of the cron builder, styled like the elapsed-interval
		* stepper. Values clamp to the shape's own bounds, and an emptied or fractional
		* input stages nothing, so the regenerated expression stays valid on every edit.
		* @param props - bounds, staged value, blocking state, arrow labels, and callback.
		* @returns the stepper pill.
		*/
		function CronStepper({ id, min, max, value, disabled, increaseLabel, decreaseLabel, onChange }) {
			const clamp = (next) => Math.min(max, Math.max(min, next));
			return (0, react_jsx_runtime.jsxs)("span", {
				className: TaskManagerPage_module_css_default.ruleIntervalStepper,
				style: { "--interval-digits": String(value).length },
				children: [(0, react_jsx_runtime.jsx)("input", {
					id,
					className: clsx(TaskManagerPage_module_css_default.ruleInput, TaskManagerPage_module_css_default.ruleControl, TaskManagerPage_module_css_default.ruleIntervalInput),
					type: "number",
					min,
					max,
					step: 1,
					disabled,
					value,
					onChange: (event) => {
						const next = Number(event.target.value);
						if (event.target.value === "" || !Number.isSafeInteger(next)) return;
						onChange(clamp(next));
					}
				}), (0, react_jsx_runtime.jsxs)("span", {
					className: TaskManagerPage_module_css_default.ruleIntervalArrows,
					children: [(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: TaskManagerPage_module_css_default.ruleIntervalArrow,
						"aria-label": increaseLabel,
						disabled: disabled || value >= max,
						onClick: () => {
							onChange(clamp(value + 1));
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, { size: 9 })
					}), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: TaskManagerPage_module_css_default.ruleIntervalArrow,
						"aria-label": decreaseLabel,
						disabled: disabled || value <= min,
						onClick: () => {
							onChange(clamp(value - 1));
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 9 })
					})]
				})]
			});
		}
		//#endregion
		//#region lib/types/client/task-tab-target.js
		/**
		* Resolve the task one task tab shows.
		*
		* The Sidebar persists a tab's layout record but not the navigation parameters
		* its opener passed, so a restored tab falls back to the binding this page kind
		* last wrote for that layout id. The tab's body and its chip resolve the shown
		* task the same way; the body additionally needs to know whether the current
		* layout still carries parameters, because only a navigated tab reports a
		* missing task.
		* @module
		*/
		/**
		* Resolve the task one task tab shows from its navigation or its stored binding.
		* @param sessionId - the Session holding the tab.
		* @param tab - the tab's layout fields and its last navigation.
		* @param taskBindings - provider-owned binding store for restored task tabs.
		* @returns the navigation, the recovered binding, and the task to show.
		*/
		function useTaskTabTarget(sessionId, tab, taskBindings) {
			const navigation = scheduleTaskParams(tab.navigation.params);
			const navigated = tab.navigation.params !== void 0;
			const recovered = (0, react.useMemo)(() => navigated ? void 0 : taskBindings.read(sessionId, {
				id: tab.id,
				kind: tab.kind,
				contentId: tab.contentId
			}), [
				taskBindings,
				sessionId,
				tab.id,
				tab.kind,
				tab.contentId,
				navigated,
				tab.navigation.revision
			]);
			(0, react.useEffect)(() => {
				if (!navigated) taskBindings.dropMismatched(sessionId, {
					id: tab.id,
					kind: tab.kind,
					contentId: tab.contentId
				});
			}, [
				taskBindings,
				sessionId,
				tab.id,
				tab.kind,
				tab.contentId,
				navigated,
				tab.navigation.revision
			]);
			return {
				navigated,
				navigation,
				recovered,
				params: navigation ?? recovered
			};
		}
		//#endregion
		//#region lib/types/client/ScheduleTaskTab.js
		/**
		* The task tab's body: one retained task's detail in the right Sidebar.
		*
		* The tab's layout record stores nothing durable. It selects its task from the
		* shared Host catalog by the navigation parameters it was opened with and
		* renders the same `TaskDetail` component the Tasks page renders, so both views
		* offer identical fields, timing edits, saved deliveries, confirmed deletion,
		* and the original Session link. A record restored by a reload carries no
		* parameters, so the body falls back to the provider-owned binding that the
		* navigation wrote; a retained edit draft keeps the detail on screen after the
		* catalog row disappears, and a confirmed deletion closes this tab once the
		* refreshed catalog reports the row gone; without a draft, the body reports
		* that the task is gone.
		*
		* The parameters name the task's original Session, and every mutation carries
		* that binding, so reading or deleting from here never activates a Session.
		*/
		/**
		* Render the single task named by this tab's navigation parameters or by the
		* binding those parameters last wrote.
		*
		* When neither names a task, the body reports the catalog feedback until a read
		* requested after the baseline for the current navigation succeeds without the
		* task; the missing-task state then covers both an unbound restored tab and a
		* navigated tab whose task is gone.
		* @param props - tab information, the Host task catalog, localized copy, and action callbacks.
		* @returns the task's detail, or its centered loading, query-failure, or missing-task state.
		*/
		function ScheduleTaskTab(props) {
			const { sessionId, useTabInfo, useCatalog, onRetry, taskBindings, t } = props;
			const { tab } = useTabInfo();
			const { navigated, navigation, recovered, params } = useTaskTabTarget(sessionId, tab, taskBindings);
			const catalog = useCatalog((snapshot) => snapshot);
			const detail = useTaskDetail(props, catalog, params?.id);
			const { task, record: catalogRecord } = detail;
			const navigationRevision = navigated ? tab.navigation.revision : void 0;
			const [baseline, setBaseline] = (0, react.useState)(() => ({
				revision: navigationRevision,
				request: catalog.readRequest
			}));
			if (baseline.revision !== navigationRevision) setBaseline({
				revision: navigationRevision,
				request: catalog.readRequest
			});
			const answered = catalog.settled && catalog.readSettled > baseline.request;
			(0, react.useEffect)(() => {
				if (task === void 0 && !answered) onRetry(baseline.request);
			}, [
				onRetry,
				baseline.request,
				task,
				answered
			]);
			(0, react.useEffect)(() => {
				if (navigation === void 0) return;
				taskBindings.write(sessionId, {
					id: tab.id,
					kind: tab.kind,
					contentId: tab.contentId
				}, navigation);
			}, [
				taskBindings,
				sessionId,
				tab.id,
				tab.kind,
				tab.contentId,
				navigation?.sessionId,
				navigation?.id
			]);
			(0, react.useEffect)(() => {
				if (recovered === void 0 || navigated || !answered || catalogRecord !== void 0) return;
				taskBindings.forget(sessionId, {
					id: tab.id,
					kind: tab.kind,
					contentId: tab.contentId
				});
			}, [
				taskBindings,
				sessionId,
				tab.id,
				tab.kind,
				tab.contentId,
				recovered,
				navigated,
				answered,
				catalogRecord
			]);
			if (task === void 0) {
				const pending = catalog.status === "ready" && !answered;
				return (0, react_jsx_runtime.jsx)("div", {
					className: TaskManagerPage_module_css_default.tabBody,
					children: answered ? (0, react_jsx_runtime.jsxs)("div", {
						className: TaskManagerPage_module_css_default.empty,
						role: "status",
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, {
							size: 24,
							className: TaskManagerPage_module_css_default.emptyGlyph
						}), (0, react_jsx_runtime.jsx)("h3", { children: t("detail.missing") })]
					}) : (0, react_jsx_runtime.jsx)(CatalogFeedback, {
						status: pending ? "loading" : catalog.status,
						populated: false,
						onRetry,
						t
					})
				});
			}
			return (0, react_jsx_runtime.jsx)("div", {
				className: TaskManagerPage_module_css_default.tabBody,
				children: (0, react_jsx_runtime.jsx)(TaskDetail, {
					...detail.props,
					task,
					authoritative: catalogRecord !== void 0,
					onDeleted: () => {
						tab.actions.close();
					},
					withinSession: sessionId
				})
			});
		}
		//#endregion
		//#region lib/types/client/ScheduleTaskTabTitle.js
		/**
		* Render the clock glyph and the named task's stored title as the chip text.
		* @param props - tab information, the Host task catalog, the tab bindings, and localized copy.
		* @returns the clock glyph followed by the task's stored title, or the detail label without a catalog row.
		*/
		function ScheduleTaskTabTitle({ sessionId, useTabInfo, useCatalog, taskBindings, t }) {
			const { tab } = useTabInfo();
			const { params } = useTaskTabTarget(sessionId, tab, taskBindings);
			const records = useCatalog((snapshot) => snapshot.records);
			const record = params === void 0 ? void 0 : records.find((item) => item.id === params.id);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, {
				size: 16,
				className: TaskManagerPage_module_css_default.tabTitleIcon
			}), record === void 0 ? t("detail.label") : taskName(record)] });
		}
		//#endregion
		//#region lib/types/client/session-schedule-state.js
		/**
		* One Session's scheduled-task state for the ambient surfaces: the Sidebar
		* row mark and the row hover-card task section.
		*
		* Both project the ONE Host catalog the page already owns — `schedule/catalog()`
		* returns active and ended tasks with their originating `sessionId` — so N
		* visible rows share one Remote read and follow one `schedule/changed`
		* invalidation instead of issuing a query per row. The Session-header catalog
		* keeps its own per-Session `schedule/list` source because it also lists the
		* open Session's tasks.
		*/
		/**
		* Create the durable reminder source for one Session.
		*
		* The stored read is `schedule/list`, which admits only tasks whose durable
		* status is active; loading and error reads carry no authoritative answer.
		* @param ctx - client context carrying the Remote schedule face.
		* @param sessionId - Session whose tasks are read; reading never activates it.
		* @returns observable catalog plus its mutation callbacks.
		*/
		function createSessionScheduleSource(ctx, sessionId) {
			return createCatalogSource({
				list: () => ctx.remote.schedule.list({ sessionId }),
				remove: (id) => ctx.remote.schedule.delete({
					sessionId,
					id
				}),
				subscribeChanged: (listener) => ctx.remote.$on("schedule/changed", listener),
				subscribeReset: (listener) => ctx.on("connection/reset", listener)
			});
		}
		const NO_RECORDS = [];
		/**
		* Project the shared Host catalog onto one Session's active tasks.
		*
		* `schedule/catalog()` returns active and ended tasks for every Session, so
		* both facts come from this one snapshot filtered by `sessionId` and
		* `status === 'active'`. A read that never settled answers no active task; a
		* refresh republishes `loading` over the records of the last successful read, and
		* the Host emits `schedule/changed` after every delivery, so following `status`
		* here would blank a Session's mark for each roundtrip. An ended-only Session
		* lists nothing.
		* @param snapshot - shared Host catalog snapshot.
		* @param sessionId - Session whose facts are selected.
		* @returns this Session's active-task facts.
		*/
		function selectSessionScheduleFacts(snapshot, sessionId) {
			if (!snapshot.settled) return {
				hasActive: false,
				records: NO_RECORDS
			};
			const records = snapshot.records.filter((record) => record.sessionId === sessionId && record.status === "active");
			return {
				hasActive: records.length > 0,
				records
			};
		}
		/**
		* Compare two projections so a row keeps its previous render while its own
		* active tasks are unchanged, even when another Session's tasks move.
		* @param left - current projection.
		* @param right - previously selected projection.
		* @returns whether both projections describe the same active tasks.
		*/
		function sameSessionScheduleFacts(left, right) {
			return left.hasActive === right.hasActive && left.records.length === right.records.length && left.records.every((record, index) => record === right.records[index]);
		}
		/**
		* Select one Session's active-task facts from the shared Host catalog.
		* @param useCatalog - selector hook bound to the shared Host catalog observable.
		* @param sessionId - Session whose row is observed; reading activates nothing.
		* @returns this Session's facts, stable across other Sessions' updates.
		*/
		function useSessionScheduleFacts(useCatalog, sessionId) {
			return useCatalog((snapshot) => selectSessionScheduleFacts(snapshot, sessionId), sameSessionScheduleFacts);
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-schedule/src/client/SessionScheduleMark.module.css.mjs
		const css = ".PHu68G_mark{width:16px;height:20px;color:var(--dsw-alias-label-tertiary);flex:none;justify-content:center;align-items:center;display:inline-flex}.PHu68G_tasks{flex-direction:column;gap:8px;display:flex}.PHu68G_task{align-items:flex-start;gap:8px;min-width:0;display:flex}.PHu68G_taskIcon{color:#cfd3d6;flex:none;align-items:center;height:16px;display:inline-flex}.PHu68G_taskBody{flex-direction:column;gap:2px;min-width:0;display:flex}.PHu68G_taskName{color:#fff;overflow-wrap:break-word;font-size:12px;line-height:16px}.PHu68G_taskTiming{color:#cfd3d6;font-size:12px;line-height:16px}.PHu68G_taskRelative{color:#adb2b8;overflow-wrap:anywhere}.PHu68G_omitted{color:#adb2b8;font-size:12px;line-height:16px}.PHu68G_visuallyHidden{clip:rect(0 0 0 0);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}";
		const tagId = "@deepseek-ai/dsh-client-ui-schedule/SessionScheduleMark.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-schedule";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var SessionScheduleMark_module_css_default = {
			"mark": "PHu68G_mark",
			"omitted": "PHu68G_omitted",
			"task": "PHu68G_task",
			"taskBody": "PHu68G_taskBody",
			"taskIcon": "PHu68G_taskIcon",
			"taskName": "PHu68G_taskName",
			"taskRelative": "PHu68G_taskRelative",
			"taskTiming": "PHu68G_taskTiming",
			"tasks": "PHu68G_tasks",
			"visuallyHidden": "PHu68G_visuallyHidden"
		};
		/**
		* Render up to {@link SESSION_HOVER_TASK_LIMIT} overdue-first task rows.
		*
		* The reference clock is sampled once per mount: the card is a long-hover
		* preview, so its "next run" text must not drift while the pointer rests.
		* @param props.sessionId - Session this row shows.
		* @param props.useCatalog - selector hook over the shared Host task catalog.
		* @param props.t - Schedule catalog locale seat.
		* @returns the task rows plus an omission line, or nothing without an active task.
		*/
		function SessionScheduleHover({ sessionId, useCatalog, t }) {
			const facts = useSessionScheduleFacts(useCatalog, sessionId);
			const [now] = (0, react.useState)(() => Date.now());
			if (!facts.hasActive) return null;
			const ordered = orderScheduleRecords(facts.records, now);
			const shown = ordered.slice(0, 2);
			const omitted = ordered.length - shown.length;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SessionScheduleMark_module_css_default.tasks,
				"data-session-schedule-tasks": "",
				children: [shown.map((record) => {
					const nextRun = nextRunParts(record.scheduledAt, t("time.locale"), now, t);
					return (0, react_jsx_runtime.jsxs)("div", {
						className: SessionScheduleMark_module_css_default.task,
						"data-session-schedule-task": "",
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: SessionScheduleMark_module_css_default.taskIcon,
							"aria-hidden": "true",
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { size: 12 })
						}), (0, react_jsx_runtime.jsxs)("span", {
							className: SessionScheduleMark_module_css_default.taskBody,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: SessionScheduleMark_module_css_default.taskName,
								children: taskName(record)
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: SessionScheduleMark_module_css_default.taskTiming,
								children: [
									`${formatScheduleFrequency(record, t)} · `,
									(0, react_jsx_runtime.jsx)("time", {
										dateTime: record.scheduledAt,
										children: nextRun.absolute
									}),
									" ",
									(0, react_jsx_runtime.jsx)("span", {
										className: SessionScheduleMark_module_css_default.taskRelative,
										children: nextRun.relative
									})
								]
							})]
						})]
					}, record.id);
				}), omitted > 0 && (0, react_jsx_runtime.jsx)("div", {
					className: SessionScheduleMark_module_css_default.omitted,
					children: t("hover.more", { count: omitted })
				})]
			});
		}
		//#endregion
		//#region lib/types/client/SessionScheduleMark.js
		/**
		* Sidebar Session-row clock mark: one Session's active scheduled-task
		* indicator, seated in the row's leading 16px cell before the title.
		*
		* The row offers that cell to this seat only while its own primary state is
		* idle, so an approval request, a new message, or live activity keeps the
		* row's state dot in the same cell and never mounts the mark. The mark
		* projects the one shared Host task catalog onto this Session; it activates,
		* retains, and unarchives nothing, and it never reads a Session log.
		*/
		/**
		* Render the clock mark while this Session's active tasks are non-empty.
		* @param props.sessionId - Session this row shows.
		* @param props.useCatalog - selector hook over the shared Host task catalog.
		* @param props.t - Schedule catalog locale seat.
		* @returns the mark, or nothing while the read is unresolved, failed, ended, or empty.
		*/
		function SessionScheduleMark({ sessionId, useCatalog, t }) {
			const facts = useSessionScheduleFacts(useCatalog, sessionId);
			if (!facts.hasActive) return null;
			return (0, react_jsx_runtime.jsxs)("span", {
				className: SessionScheduleMark_module_css_default.mark,
				"data-session-schedule-mark": "",
				onClick: (event) => {
					event.stopPropagation();
				},
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { size: 14 }), (0, react_jsx_runtime.jsx)("span", {
					className: SessionScheduleMark_module_css_default.visuallyHidden,
					children: t("mark.aria", { count: facts.records.length })
				})]
			});
		}
		//#endregion
		//#region lib/types/client/task-tab-bindings.js
		/** Storage prefix; one key per Session holds that Session's entries. */
		const PREFIX = "dsh.schedule.task-tab.v1.";
		/**
		* Whether a parsed storage value is a record rather than an array or a scalar.
		* @param value - parsed storage value.
		* @returns `true` for a plain record.
		*/
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* Narrow one stored value to a task tab entry.
		* @param value - one member of a stored Session document.
		* @returns the entry, or undefined for a value this store did not write.
		*/
		function entryOf(value) {
			if (!isRecord(value)) return void 0;
			const { kind, contentId, sessionId, id } = value;
			if (typeof kind !== "string" || typeof contentId !== "string") return void 0;
			if (typeof sessionId !== "string" || typeof id !== "string") return void 0;
			return {
				kind,
				contentId,
				sessionId,
				id
			};
		}
		/**
		* Narrow one stored Session document to its well-formed entries.
		* @param raw - stored text.
		* @returns the entries it holds; unparseable text and malformed values are dropped.
		*/
		function entriesOf(raw) {
			let parsed;
			try {
				parsed = JSON.parse(raw);
			} catch (_invalidJson) {
				return /* @__PURE__ */ new Map();
			}
			if (!isRecord(parsed)) return /* @__PURE__ */ new Map();
			const entries = /* @__PURE__ */ new Map();
			for (const [tabId, value] of Object.entries(parsed)) {
				const entry = entryOf(value);
				if (entry !== void 0) entries.set(tabId, entry);
			}
			return entries;
		}
		/**
		* Last shown task per task tab page, kept in this window and in browser storage.
		*
		* The window copy is authoritative for this window's reads: it keeps the value
		* usable when storage is absent or rejects writes, and it avoids reparsing the
		* stored document on every render.
		*/
		var TaskTabBindings = class {
			liveTabIds;
			memory = /* @__PURE__ */ new Map();
			/**
			* @param liveTabIds - the committed layout's tab ids for one Session, read when an entry is stored.
			*/
			constructor(liveTabIds) {
				this.liveTabIds = liveTabIds;
			}
			/**
			* Read the task one page last showed.
			*
			* An entry whose kind or contentId differs from the page reading it belongs to
			* a layout id that has since been reused; the read reports no task and leaves
			* the document untouched, and `dropMismatched` removes it after the render.
			* @param sessionId - the Session holding the tab.
			* @param page - the restored layout record.
			* @returns the task to show, or undefined when the page has no applicable entry.
			*/
			read(sessionId, page) {
				const entry = this.document(sessionId).get(page.id);
				if (entry === void 0) return void 0;
				if (entry.kind !== page.kind || entry.contentId !== page.contentId) return void 0;
				return {
					sessionId: entry.sessionId,
					id: entry.id
				};
			}
			/**
			* Drop one page's entry when it recorded another kind or contentId.
			*
			* A read reports the mismatch without writing, so the page resolves its target
			* in a render and drops the entry from an effect; a render React discards must
			* not rewrite what it read.
			* @param sessionId - the Session holding the tab.
			* @param page - the layout record the stored entry has to match.
			*/
			dropMismatched(sessionId, page) {
				const entry = this.document(sessionId).get(page.id);
				if (entry === void 0 || entry.kind === page.kind && entry.contentId === page.contentId) return;
				this.forget(sessionId, page);
			}
			/**
			* Record the task one page now shows.
			* @param sessionId - the Session holding the tab.
			* @param page - the navigated layout record.
			* @param target - the task the navigation named.
			*/
			write(sessionId, page, target) {
				const entries = new Map(this.document(sessionId));
				entries.set(page.id, {
					kind: page.kind,
					contentId: page.contentId,
					...target
				});
				this.store(sessionId, entries);
			}
			/**
			* Drop one page's entry once a read that succeeded after the tab appeared shows
			* its task is gone.
			* @param sessionId - the Session holding the tab.
			* @param page - the layout record whose entry is removed.
			*/
			forget(sessionId, page) {
				const entries = new Map(this.document(sessionId));
				entries.delete(page.id);
				this.store(sessionId, entries);
			}
			/** Release this window's cached documents. */
			clear() {
				this.memory.clear();
			}
			/**
			* One Session's entries, from this window or from storage.
			* @param sessionId - the Session holding the tabs.
			* @returns its entries, empty when nothing is saved or storage is unreachable.
			*/
			document(sessionId) {
				const cached = this.memory.get(sessionId);
				if (cached !== void 0) return cached;
				if (typeof localStorage === "undefined") return /* @__PURE__ */ new Map();
				let raw;
				try {
					raw = localStorage.getItem(PREFIX + sessionId);
				} catch (_storageUnavailable) {
					return /* @__PURE__ */ new Map();
				}
				if (raw === null) return /* @__PURE__ */ new Map();
				const entries = entriesOf(raw);
				this.memory.set(sessionId, entries);
				return entries;
			}
			/**
			* Replace one Session's entries, dropping those of tabs a non-empty list of
			* committed ids does not hold, and publish them to this window and to storage.
			* An empty result removes the Session's key rather than storing an empty
			* document.
			* @param sessionId - the Session holding the tabs.
			* @param entries - the complete replacement set.
			*/
			store(sessionId, entries) {
				const live = this.liveTabIds?.(sessionId);
				const kept = live === void 0 || live.length === 0 ? entries : new Map([...entries].filter(([tabId]) => live.includes(tabId)));
				this.memory.set(sessionId, kept);
				if (typeof localStorage === "undefined") return;
				try {
					const key = PREFIX + sessionId;
					if (kept.size === 0) localStorage.removeItem(key);
					else localStorage.setItem(key, JSON.stringify(Object.fromEntries(kept)));
				} catch (error) {
					console.error("Task tab binding persistence failed:", error);
				}
			}
		};
		//#endregion
		//#region lib/types/client/ScheduleEmptyIllustration.js
		/**
		* Render the empty-state illustration without adding an accessible announcement.
		* @param props - optional CSS class applied to the root SVG.
		* @returns the decorative inline SVG element.
		*/
		function ScheduleEmptyIllustration({ className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				className,
				width: "170",
				height: "170",
				viewBox: "0 0 170 170",
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [
					(0, react_jsx_runtime.jsx)("path", {
						d: "M163.819 97.9382C163.819 126.572 144.48 135.329 115.847 135.329C87.2129 135.329 60.1276 126.572 60.1276 97.9382C60.1276 69.3047 101.003 46.0927 129.637 46.0927C158.27 46.0927 163.819 69.3047 163.819 97.9382Z",
						fill: "var(--dsw-alias-illustration-background)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M9.49521 88.6735C20.8278 111.218 39.5801 110.429 62.2137 99.0519C84.8474 87.6748 102.791 70.018 91.4589 47.4731C80.1263 24.9282 38.6291 22.8935 15.9955 34.2706C-6.63818 45.6478 -1.83735 66.1286 9.49521 88.6735Z",
						fill: "var(--dsw-alias-illustration-background)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M25.2636 34.442C24.727 29.8132 28.0445 25.6258 32.6733 25.0893L101.373 17.126C106.002 16.5895 110.189 19.9069 110.726 24.5358L120.107 105.466C120.643 110.095 117.326 114.282 112.697 114.818L43.9972 122.782C39.3684 123.318 35.181 120.001 34.6445 115.372L25.2636 34.442Z",
						fill: "var(--dsw-alias-illustration-backing)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M40.169 25.1368C40.169 20.477 43.9466 16.6995 48.6064 16.6995H117.766C122.426 16.6995 126.204 20.477 126.204 25.1368V106.609C126.204 111.268 122.426 115.046 117.766 115.046H48.6064C43.9466 115.046 40.169 111.268 40.169 106.609V25.1368Z",
						fill: "var(--dsw-alias-illustration-surface)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M110.258 44.9883V50.3516H72.0831V44.9883H110.258Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M110.258 63.2803V68.6436H72.0831V63.2803H110.258Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M91.171 81.5713V86.9346H72.0831V81.5713H91.171Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M56.1124 43.4998H64.0964V51.4838H56.1124V43.4998Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M56.1124 61.97H64.0964V69.954H56.1124V61.97Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M56.1124 80.2607H64.0964V88.2448H56.1124V80.2607Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M126.205 148.002C126.205 149.615 105.321 150.923 79.5592 150.923C53.7973 150.923 32.9132 149.615 32.9132 148.002C32.9132 146.388 53.7973 145.08 79.5592 145.08C105.321 145.08 126.205 146.388 126.205 148.002Z",
						fill: "var(--dsw-alias-illustration-shadow)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M13.1544 119.318C14.7101 119.318 16.2657 119.43 17.8214 119.656C17.9942 119.682 18.1671 119.709 18.3399 119.737V120.238C18.1671 120.266 17.9942 120.293 17.8214 120.319C16.2657 120.545 14.7101 120.657 13.1544 120.657C11.5986 120.657 10.0423 120.545 8.48643 120.319C8.31357 120.293 8.14073 120.266 7.96787 120.238V119.737C8.14073 119.709 8.31357 119.682 8.48643 119.656C10.0423 119.43 11.5986 119.318 13.1544 119.318Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M125.197 2.96338C126.287 2.96338 127.378 3.076 128.468 3.30225C128.589 3.32738 128.71 3.3544 128.831 3.38232V3.88428C128.71 3.9122 128.589 3.93922 128.468 3.96436C127.378 4.1906 126.287 4.30322 125.197 4.30322C124.108 4.30319 123.018 4.19057 121.928 3.96436C121.807 3.93922 121.686 3.91221 121.565 3.88428V3.38232C121.686 3.3544 121.807 3.32738 121.928 3.30225C123.018 3.07603 124.108 2.96341 125.197 2.96338Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M145.187 32.6399C146.742 32.6399 148.298 32.7525 149.854 32.9788C150.026 33.0039 150.199 33.0309 150.372 33.0588V33.5608C150.199 33.5887 150.026 33.6157 149.854 33.6409C148.298 33.8671 146.742 33.9797 145.187 33.9797C143.631 33.9797 142.074 33.8671 140.519 33.6409C140.346 33.6157 140.173 33.5887 140 33.5608V33.0588C140.173 33.0309 140.346 33.0039 140.519 32.9788C142.074 32.7525 143.631 32.6399 145.187 32.6399Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M12.4776 119.987C12.4777 118.431 12.5903 116.875 12.8165 115.32C12.8416 115.147 12.8687 114.974 12.8966 114.801H13.3985C13.4265 114.974 13.4535 115.147 13.4786 115.32C13.7048 116.875 13.8175 118.431 13.8175 119.987C13.8175 121.542 13.7049 123.099 13.4786 124.654C13.4535 124.827 13.4265 125 13.3985 125.173H12.8966C12.8687 125 12.8416 124.827 12.8165 124.654C12.5903 123.099 12.4776 121.542 12.4776 119.987Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M124.522 3.63379C124.522 2.54381 124.634 1.45326 124.86 0.363281C124.886 0.242199 124.913 0.121083 124.941 2.19411e-08L125.442 0C125.47 0.121082 125.497 0.242199 125.523 0.363281C125.749 1.45326 125.861 2.54381 125.861 3.63379C125.861 4.72362 125.749 5.81349 125.523 6.90332C125.497 7.02442 125.47 7.1455 125.442 7.2666H124.941C124.913 7.1455 124.886 7.02442 124.86 6.90332C124.634 5.81349 124.522 4.72362 124.522 3.63379Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M144.509 33.3101C144.509 31.7544 144.622 30.1987 144.848 28.6431C144.873 28.4702 144.9 28.2974 144.928 28.1245H145.43C145.458 28.2974 145.485 28.4702 145.51 28.6431C145.736 30.1987 145.849 31.7544 145.849 33.3101C145.849 34.8659 145.736 36.4222 145.51 37.978C145.485 38.1509 145.458 38.3237 145.43 38.4966H144.928C144.9 38.3237 144.873 38.1509 144.848 37.978C144.622 36.4222 144.509 34.8659 144.509 33.3101Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M149.05 98.8527C149.05 112.66 137.857 123.853 124.05 123.853C110.242 123.853 99.0496 112.66 99.0496 98.8527C99.0496 85.0455 110.242 73.8527 124.05 73.8527C137.857 73.8527 149.05 85.0455 149.05 98.8527Z",
						fill: "var(--dsw-alias-illustration-detail)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M144.192 98.8529C144.192 109.978 135.174 118.997 124.049 118.997C112.923 118.997 103.905 109.978 103.905 98.8529C103.905 87.7278 112.923 78.709 124.049 78.709C135.174 78.709 144.192 87.7278 144.192 98.8529Z",
						fill: "var(--dsw-alias-illustration-inset)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M125.124 86.7281L125.123 99.2824L134.923 104.132L132.824 108.375L122.76 103.395C121.309 102.677 120.39 101.197 120.39 99.5782L120.389 86.7275L125.124 86.7281Z",
						fill: "var(--dsw-alias-illustration-detail)"
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/TaskManagerPage.js
		/** Cross-session retained reminders with local search and selection. */
		/**
		* Render retained tasks with authoritative deletion and timing-only edits.
		* @param props - framework catalog snapshot, localized copy, and action callbacks.
		* @returns the searchable task list beside the selected task's detail.
		*/
		function TaskManagerPage(props) {
			const { useCatalog, onNewTask, onClearEnded, onRetry, t } = props;
			const catalog = useCatalog((snapshot) => snapshot);
			const { records, status } = catalog;
			const [search, setSearch] = (0, react.useState)("");
			const [statusFilter, setStatusFilter] = (0, react.useState)("active");
			const [selectedId, setSelectedId] = (0, react.useState)(null);
			const [clearConfirm, setClearConfirm] = (0, react.useState)(false);
			const [clearMenu, setClearMenu] = (0, react.useState)(false);
			const [clearing, setClearing] = (0, react.useState)(false);
			const now = useRelativeClock();
			const detail = useTaskDetail(props, catalog, selectedId ?? void 0);
			const { record: catalogRecord, task: selected, id: detailId, confirmId, setConfirmId, setTab } = detail;
			const rowRef = (0, react.useRef)(null);
			const headingRef = (0, react.useRef)(null);
			const clearTriggerRef = (0, react.useRef)(null);
			const clearFocusPending = (0, react.useRef)(false);
			const clearSettled = (0, react.useRef)(false);
			const confirming = records.find((record) => record.id === confirmId);
			const endedCount = (0, react.useMemo)(() => records.filter((record) => record.status === "inactive").length, [records]);
			const rows = (0, react.useMemo)(() => {
				const query = search.trim().toLowerCase();
				return records.filter((record) => (statusFilter === "all" || record.status === statusFilter) && (record.prompt.toLowerCase().includes(query) || record.sessionId.toLowerCase().includes(query) || taskName(record).toLowerCase().includes(query))).toSorted((left, right) => Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt));
			}, [
				records,
				search,
				statusFilter
			]);
			const emptyTitle = statusFilter === "inactive" && search.trim() === "" ? "list.emptyInactive" : records.length === 0 ? "list.empty" : "list.noMatches";
			const frequencyZone = {
				system: Intl.DateTimeFormat().resolvedOptions().timeZone,
				label: (zone) => zoneLabel(zone, t)
			};
			const frequency = (record) => formatScheduleFrequency(record, t, frequencyZone);
			(0, react.useEffect)(() => {
				if (selectedId !== null || clearConfirm) return;
				if (rowRef.current !== null) {
					(rowRef.current.isConnected ? rowRef.current : headingRef.current)?.focus();
					rowRef.current = null;
				}
			}, [selectedId, clearConfirm]);
			(0, react.useEffect)(() => {
				if (status !== "ready") return;
				if (selectedId !== null && selected === void 0) setSelectedId(null);
				if (confirmId !== null && confirming === void 0) setConfirmId(null);
			}, [
				status,
				selectedId,
				selected,
				confirmId,
				confirming
			]);
			const closeDetails = () => {
				setSelectedId(null);
			};
			(0, react.useEffect)(() => {
				if (clearConfirm) return;
				if (clearFocusPending.current) {
					clearFocusPending.current = false;
					const trigger = clearTriggerRef.current;
					if (trigger?.isConnected === true) {
						trigger.focus();
						return;
					}
					clearSettled.current = false;
					headingRef.current?.focus();
					return;
				}
				if (!clearSettled.current || endedCount > 0 || document.activeElement !== document.body) return;
				clearSettled.current = false;
				headingRef.current?.focus();
			}, [clearConfirm, endedCount]);
			const confirmClearEnded = () => {
				if (clearing) return;
				setClearing(true);
				onClearEnded().finally(() => {
					clearSettled.current = true;
					setClearing(false);
					setClearConfirm(false);
				});
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: clsx(TaskManagerPage_module_css_default.page, selected !== void 0 && TaskManagerPage_module_css_default.hasDetails),
				"aria-label": t("title"),
				"data-testid": "task-manager-page",
				onKeyDown: (event) => {
					if (event.key !== "Escape" || event.defaultPrevented || confirmId !== null || clearConfirm || selectedId === null) return;
					event.preventDefault();
					event.stopPropagation();
					closeDetails();
				},
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: TaskManagerPage_module_css_default.listPane,
						children: (0, react_jsx_runtime.jsx)("div", {
							className: TaskManagerPage_module_css_default.pageScroll,
							children: (0, react_jsx_runtime.jsxs)("div", {
								className: TaskManagerPage_module_css_default.pageContent,
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: TaskManagerPage_module_css_default.pageHeading,
										children: [(0, react_jsx_runtime.jsx)("h1", {
											ref: headingRef,
											tabIndex: -1,
											children: t("title")
										}), (0, react_jsx_runtime.jsx)("div", {
											className: TaskManagerPage_module_css_default.creationActions,
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
												variant: "primary",
												size: "sm",
												className: TaskManagerPage_module_css_default.headerAction,
												icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 13 }),
												onClick: onNewTask,
												children: t("new.action")
											})
										})]
									}),
									(0, react_jsx_runtime.jsx)("div", {
										className: TaskManagerPage_module_css_default.filters,
										children: (0, react_jsx_runtime.jsx)("div", {
											className: TaskManagerPage_module_css_default.filterTabs,
											role: "group",
											"aria-label": t("statusFilter.label"),
											children: [
												"active",
												"inactive",
												"all"
											].map((value) => (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: clsx(TaskManagerPage_module_css_default.filterTab, statusFilter === value && TaskManagerPage_module_css_default.filterTabActive),
												"aria-pressed": statusFilter === value,
												onClick: () => {
													setStatusFilter(value);
												},
												children: t(value === "all" ? "statusFilter.all" : `status.${value}`)
											}, value))
										})
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: TaskManagerPage_module_css_default.searchTools,
										children: [(0, react_jsx_runtime.jsxs)("div", {
											className: TaskManagerPage_module_css_default.searchField,
											children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
												type: "search",
												icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, {}),
												"aria-label": t("search.label"),
												placeholder: t("search.placeholder"),
												value: search,
												onChange: (event) => {
													setSearch(event.target.value);
												}
											}), search !== "" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
												size: "sm",
												className: TaskManagerPage_module_css_default.searchClear,
												"aria-label": t("search.clear"),
												onClick: () => {
													setSearch("");
												},
												children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, {})
											})]
										}), statusFilter !== "active" && endedCount > 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
											open: clearMenu,
											onClose: () => {
												setClearMenu(false);
											},
											align: "end",
											portal: true,
											items: [{
												id: "clear-inactive",
												label: t(clearing ? "clear.pending" : "clear.action"),
												icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, {}),
												danger: true,
												disabled: clearing || status !== "ready"
											}],
											onSelect: () => {
												setClearMenu(false);
												clearFocusPending.current = true;
												setClearConfirm(true);
											},
											anchor: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("list.more"),
												side: "bottom",
												portal: true,
												disabled: clearMenu,
												children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													ref: clearTriggerRef,
													variant: "outline",
													className: TaskManagerPage_module_css_default.catalogMore,
													"aria-label": t("list.more"),
													"aria-haspopup": "menu",
													"aria-expanded": clearMenu,
													"aria-busy": clearing,
													onClick: () => {
														setClearMenu((value) => !value);
													},
													children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutlineRegular, {})
												})
											})
										})]
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: TaskManagerPage_module_css_default.list,
										children: [
											selected === void 0 && (0, react_jsx_runtime.jsx)(CatalogFeedback, {
												status,
												populated: rows.length > 0,
												onRetry,
												t
											}),
											status === "ready" && rows.length === 0 && (0, react_jsx_runtime.jsxs)("div", {
												className: TaskManagerPage_module_css_default.empty,
												role: "status",
												children: [
													(0, react_jsx_runtime.jsx)(ScheduleEmptyIllustration, { className: TaskManagerPage_module_css_default.emptyIllustration }),
													(0, react_jsx_runtime.jsx)("h2", { children: t(emptyTitle) }),
													(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "outline",
														className: TaskManagerPage_module_css_default.emptyAction,
														onClick: onNewTask,
														children: t("empty.action")
													})
												]
											}),
											(0, react_jsx_runtime.jsx)("ul", {
												className: TaskManagerPage_module_css_default.listRows,
												"aria-label": t("list.label"),
												"aria-busy": status === "loading",
												children: rows.map((record) => {
													const nextRun = nextRunParts(record.scheduledAt, t("time.locale"), now, t);
													return (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														className: clsx(TaskManagerPage_module_css_default.row, selectedId === record.id && TaskManagerPage_module_css_default.selectedRow, record.status === "inactive" && TaskManagerPage_module_css_default.endedRow),
														"aria-label": taskName(record),
														"aria-describedby": `${detailId}-metadata-${record.id}`,
														"aria-expanded": selectedId === record.id,
														"aria-controls": selectedId === record.id ? detailId : void 0,
														onClick: (event) => {
															rowRef.current = event.currentTarget;
															setSelectedId(record.id);
															setTab("rule");
														},
														children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { className: TaskManagerPage_module_css_default.rowGlyph }), (0, react_jsx_runtime.jsxs)("span", {
															className: TaskManagerPage_module_css_default.rowContent,
															children: [(0, react_jsx_runtime.jsx)("span", {
																className: TaskManagerPage_module_css_default.rowTitle,
																children: taskName(record)
															}), (0, react_jsx_runtime.jsxs)("span", {
																className: TaskManagerPage_module_css_default.rowSummary,
																id: `${detailId}-metadata-${record.id}`,
																children: [
																	record.status === "inactive" && (0, react_jsx_runtime.jsx)("span", {
																		className: TaskManagerPage_module_css_default.metadata,
																		children: t("status.inactive")
																	}),
																	(0, react_jsx_runtime.jsx)("span", {
																		className: TaskManagerPage_module_css_default.metadata,
																		children: frequency(record)
																	}),
																	record.status === "active" && (0, react_jsx_runtime.jsxs)("span", {
																		className: TaskManagerPage_module_css_default.metadata,
																		children: [
																			t("list.nextPrefix"),
																			(0, react_jsx_runtime.jsx)("time", {
																				dateTime: record.scheduledAt,
																				children: nextRun.absolute
																			}),
																			" ",
																			(0, react_jsx_runtime.jsx)("span", {
																				className: TaskManagerPage_module_css_default.nextRunRelative,
																				children: nextRun.relative
																			})
																		]
																	})
																]
															})]
														})]
													}) }, record.id);
												})
											})
										]
									})
								]
							})
						})
					}),
					selected !== void 0 && (0, react_jsx_runtime.jsx)(TaskDetail, {
						...detail.props,
						task: selected,
						authoritative: catalogRecord !== void 0,
						onDeleted: closeDetails,
						onClose: closeDetails
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						className: TaskManagerPage_module_css_default.confirmDialog,
						contentClassName: TaskManagerPage_module_css_default.confirmContent,
						open: clearConfirm,
						title: t("clear.title", { count: endedCount }),
						description: t("clear.description"),
						closeLabel: t("clear.close"),
						onClose: () => {
							if (!clearing) setClearConfirm(false);
						},
						footer: (0, react_jsx_runtime.jsxs)("div", {
							className: TaskManagerPage_module_css_default.confirmActions,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								disabled: clearing,
								onClick: () => {
									setClearConfirm(false);
								},
								children: t("delete.cancel")
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								className: TaskManagerPage_module_css_default.deleteButton,
								"aria-disabled": clearing,
								onClick: confirmClearEnded,
								children: t(clearing ? "clear.pending" : "clear.confirm")
							})]
						})
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/TaskManagerIcon.js
		/** Decorative occupant for the task-manager sidebar entry. */
		/**
		* Render the clock glyph at the size the sidebar asks for; the sidebar owns
		* its accessible navigation label. The glyph is the row's direct icon child,
		* as on every other panel row: an inline wrapper makes it the baseline of a
		* line box inside the row's glyph slot, which lifts it above the label.
		* @param props - the sidebar's icon share: the requested edge and whether the panel is selected.
		* @returns decorative clock icon.
		*/
		function TaskManagerIcon({ size }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { size });
		}
		//#endregion
		//#region lib/types/client/frequency-locales.js
		/**
		* Stored-rule and elapsed-duration copy shared by the `schedule.catalog` and
		* `schedule.manager` namespaces.
		*
		* Both namespaces label the same stored rule kinds, describe cron rules with
		* the same `cronPreview` sentence, and word the same relative durations, so
		* their wording for those keys is one source here. The keys either namespace
		* words differently — its one-shot label, its list states, and its own delete
		* and timing copy — stay in that namespace's dictionary.
		* @module
		*/
		/** Simplified Chinese rule and duration copy, key-set source of truth. */
		const frequencyZh = {
			"time.locale": "zh-CN",
			"time.utcPrefix": "UTC",
			"frequency.daily": "每天 {time}（{timeZone}）",
			"frequency.dailyLocal": "每天 {time}",
			"frequency.weekly": "每周{weekdays} {time}（{timeZone}）",
			"frequency.weeklyLocal": "每周{weekdays} {time}",
			"frequency.cron": "Cron {expression}（{timeZone}）",
			"frequency.cronLocal": "Cron {expression}",
			"frequency.cronRule": "{rule}（{timeZone}）",
			"cron.list.join": "、",
			"cron.part.join": " ",
			"cron.weekday.name": "周{weekday}",
			"cron.weekday.range": "{from}至{to}",
			"cron.months": "（{months}）",
			"cron.day.every": "每天{months}",
			"cron.day.weekdays": "{weekdays}{months}",
			"cron.day.monthDays": "每月 {days} 日{months}",
			"cron.day.both": "每月 {days} 日或{weekdays}{months}",
			"cron.day.bothStarred": "每月 {days} 日且{weekdays}{months}",
			"cron.hours.range": "{from} 至 {to}",
			"cron.hours.list": "{hours}",
			"cron.time.everyMinute": "每分钟",
			"cron.time.everyMinutes": "每 {step} 分钟",
			"cron.time.joinedEveryMinute": "每分钟",
			"cron.time.joinedEveryMinutes": "每 {step} 分钟",
			"cron.time.everyHour": "每小时",
			"cron.time.joinedEveryHour": "每小时",
			"cron.time.everyNHours": "每 {count} 小时",
			"cron.time.joinedEveryNHours": "每 {count} 小时",
			"cron.time.hourlyAt": "每小时的第 {minutes} 分钟",
			"cron.time.joinedHourlyAt": "每小时的第 {minutes} 分钟",
			"cron.time.hoursEveryMinute": "{hours} 点的每分钟",
			"cron.time.hoursEveryMinutes": "{hours} 点内每 {step} 分钟",
			"cron.time.at": "{times}",
			"cron.time.hoursAt": "{hours} 点的第 {minutes} 分钟",
			"frequency.weekday.join": "、",
			"frequency.weekday.1": "一",
			"frequency.weekday.2": "二",
			"frequency.weekday.3": "三",
			"frequency.weekday.4": "四",
			"frequency.weekday.5": "五",
			"frequency.weekday.6": "六",
			"frequency.weekday.7": "日",
			"unit.day.one": "天",
			"unit.day.other": "天",
			"unit.hour.one": "小时",
			"unit.hour.other": "小时",
			"unit.minute.one": "分钟",
			"unit.minute.other": "分钟",
			"unit.second.one": "秒",
			"unit.second.other": "秒",
			"relative.now": "现在到期",
			"relative.future": "{value}{unit}后",
			"relative.overdue": "已逾期 {value}{unit}"
		};
		/** English rule and duration copy, key-identical to the Chinese source. */
		const frequencyEn = {
			"time.locale": "en",
			"time.utcPrefix": "UTC",
			"frequency.daily": "Daily at {time} ({timeZone})",
			"frequency.dailyLocal": "Daily at {time}",
			"frequency.weekly": "Weekly on {weekdays} at {time} ({timeZone})",
			"frequency.weeklyLocal": "Weekly on {weekdays} at {time}",
			"frequency.cron": "Cron {expression} ({timeZone})",
			"frequency.cronLocal": "Cron {expression}",
			"frequency.cronRule": "{rule} ({timeZone})",
			"cron.list.join": ", ",
			"cron.part.join": " ",
			"cron.weekday.name": "{weekday}",
			"cron.weekday.range": "{from}–{to}",
			"cron.months": " in {months}",
			"cron.day.every": "Every day{months}",
			"cron.day.weekdays": "{weekdays}{months}",
			"cron.day.monthDays": "Day {days} of every month{months}",
			"cron.day.both": "Day {days} of every month or {weekdays}{months}",
			"cron.day.bothStarred": "Day {days} of every month and {weekdays}{months}",
			"cron.hours.range": "{from}–{to}",
			"cron.hours.list": "{hours}",
			"cron.time.everyMinute": "Every minute",
			"cron.time.everyMinutes": "Every {step} minutes",
			"cron.time.joinedEveryMinute": "every minute",
			"cron.time.joinedEveryMinutes": "every {step} minutes",
			"cron.time.everyHour": "Every hour",
			"cron.time.joinedEveryHour": "every hour",
			"cron.time.everyNHours": "Every {count} hours",
			"cron.time.joinedEveryNHours": "every {count} hours",
			"cron.time.hourlyAt": "Every hour at minute {minutes}",
			"cron.time.joinedHourlyAt": "every hour at minute {minutes}",
			"cron.time.hoursEveryMinute": "every minute during hours {hours}",
			"cron.time.hoursEveryMinutes": "every {step} minutes during hours {hours}",
			"cron.time.at": "at {times}",
			"cron.time.hoursAt": "at minute {minutes} of hours {hours}",
			"frequency.weekday.join": ", ",
			"frequency.weekday.1": "Mon",
			"frequency.weekday.2": "Tue",
			"frequency.weekday.3": "Wed",
			"frequency.weekday.4": "Thu",
			"frequency.weekday.5": "Fri",
			"frequency.weekday.6": "Sat",
			"frequency.weekday.7": "Sun",
			"unit.day.one": "day",
			"unit.day.other": "days",
			"unit.hour.one": "hour",
			"unit.hour.other": "hours",
			"unit.minute.one": "minute",
			"unit.minute.other": "minutes",
			"unit.second.one": "second",
			"unit.second.other": "seconds",
			"relative.now": "Due now",
			"relative.future": "in {value} {unit}",
			"relative.overdue": "{value} {unit} overdue"
		};
		/** Japanese copy, checked against the English keys. */
		const frequencyJa = {
			"time.locale": "ja-JP",
			"time.utcPrefix": "UTC",
			"frequency.daily": "毎日 {time} ({timeZone})",
			"frequency.dailyLocal": "毎日 {time}",
			"frequency.weekly": "毎週 {weekdays} の {time} ({timeZone})",
			"frequency.weeklyLocal": "毎週 {weekdays} の {time}",
			"frequency.cron": "Cron {expression} ({timeZone})",
			"frequency.cronLocal": "Cron {expression}",
			"frequency.cronRule": "{rule} ({timeZone})",
			"cron.list.join": "、",
			"cron.part.join": " ",
			"cron.weekday.name": "{weekday}",
			"cron.weekday.range": "{from}〜{to}",
			"cron.months": " {months}",
			"cron.day.every": "毎日{months}",
			"cron.day.weekdays": "{weekdays}{months}",
			"cron.day.monthDays": "毎月{days}日{months}",
			"cron.day.both": "毎月{days}日または{weekdays}{months}",
			"cron.day.bothStarred": "毎月{days}日と{weekdays}{months}",
			"cron.hours.range": "{from}〜{to}",
			"cron.hours.list": "{hours}",
			"cron.time.everyMinute": "毎分",
			"cron.time.everyMinutes": "{step}分ごと",
			"cron.time.joinedEveryMinute": "毎分",
			"cron.time.joinedEveryMinutes": "{step}分ごと",
			"cron.time.everyHour": "毎時",
			"cron.time.joinedEveryHour": "毎時",
			"cron.time.everyNHours": "{count}時間ごと",
			"cron.time.joinedEveryNHours": "{count}時間ごと",
			"cron.time.hourlyAt": "毎時{minutes}分",
			"cron.time.joinedHourlyAt": "毎時{minutes}分",
			"cron.time.hoursEveryMinute": "{hours}時の毎分",
			"cron.time.hoursEveryMinutes": "{hours}時の{step}分ごと",
			"cron.time.at": "{times}に",
			"cron.time.hoursAt": "{hours}時の{minutes}分に",
			"frequency.weekday.join": "、",
			"frequency.weekday.1": "月",
			"frequency.weekday.2": "火",
			"frequency.weekday.3": "水",
			"frequency.weekday.4": "木",
			"frequency.weekday.5": "金",
			"frequency.weekday.6": "土",
			"frequency.weekday.7": "日",
			"unit.day.one": "日",
			"unit.day.other": "日",
			"unit.hour.one": "時間",
			"unit.hour.other": "時間",
			"unit.minute.one": "分",
			"unit.minute.other": "分",
			"unit.second.one": "秒",
			"unit.second.other": "秒",
			"relative.now": "まもなく期限",
			"relative.future": "{value}{unit}後",
			"relative.overdue": "{value}{unit}超過"
		};
		/** Spanish dictionary, checked against the English keys. */
		const frequencyEs = {
			"time.locale": "en",
			"time.utcPrefix": "UTC",
			"frequency.daily": "Diariamente en {time} ({timeZone})",
			"frequency.dailyLocal": "Diariamente en {time}",
			"frequency.weekly": "Semanalmente en {weekdays} en {time} ({timeZone})",
			"frequency.weeklyLocal": "Semanalmente en {weekdays} en {time}",
			"frequency.cron": "Cron {expression} ({timeZone})",
			"frequency.cronLocal": "Cron {expression}",
			"frequency.cronRule": "{rule} ({timeZone})",
			"cron.list.join": ", ",
			"cron.part.join": "  ",
			"cron.weekday.name": "{weekday}",
			"cron.weekday.range": "{from}–{to}",
			"cron.months": " en {months}",
			"cron.day.every": "Todos los días{months}",
			"cron.day.weekdays": "{weekdays}{months}",
			"cron.day.monthDays": "Día {days} de cada mes{months}",
			"cron.day.both": "Día {days} de cada mes o {weekdays}{months}",
			"cron.day.bothStarred": "Día {days} de cada mes y {weekdays}{months}",
			"cron.hours.range": "{from}–{to}",
			"cron.hours.list": "{hours}",
			"cron.time.everyMinute": "cada minuto",
			"cron.time.everyMinutes": "Cada minutos {step}",
			"cron.time.joinedEveryMinute": "cada minuto",
			"cron.time.joinedEveryMinutes": "cada {step} minutos",
			"cron.time.everyHour": "cada hora",
			"cron.time.joinedEveryHour": "cada hora",
			"cron.time.everyNHours": "Cada horas {count}",
			"cron.time.joinedEveryNHours": "cada horas {count}",
			"cron.time.hourlyAt": "Cada hora al minuto {minutes}",
			"cron.time.joinedHourlyAt": "cada hora al minuto {minutes}",
			"cron.time.hoursEveryMinute": "cada minuto durante las horas {hours}",
			"cron.time.hoursEveryMinutes": "cada {step} minutos durante las horas {hours}",
			"cron.time.at": "en {times}",
			"cron.time.hoursAt": "al minuto {minutes} de horas {hours}",
			"frequency.weekday.join": ", ",
			"frequency.weekday.1": "lun",
			"frequency.weekday.2": "mar",
			"frequency.weekday.3": "mié",
			"frequency.weekday.4": "jueves",
			"frequency.weekday.5": "viernes",
			"frequency.weekday.6": "sábado",
			"frequency.weekday.7": "sol",
			"unit.day.one": "dia",
			"unit.day.other": "dias",
			"unit.hour.one": "hora",
			"unit.hour.other": "horas",
			"unit.minute.one": "minuto",
			"unit.minute.other": "minutos",
			"unit.second.one": "segundo",
			"unit.second.other": "segundos",
			"relative.now": "Vencimiento ahora",
			"relative.future": "en {value} {unit}",
			"relative.overdue": "{value} {unit} vencido"
		};
		/** French dictionary, checked against the English keys. */
		const frequencyFr = {
			"time.locale": "en",
			"time.utcPrefix": "UTC",
			"frequency.daily": "Tous les jours à {time} ({timeZone})",
			"frequency.dailyLocal": "Tous les jours à {time}",
			"frequency.weekly": "Hebdomadaire sur {weekdays} à {time} ({timeZone})",
			"frequency.weeklyLocal": "Hebdomadaire sur {weekdays} à {time}",
			"frequency.cron": "Cron {expression} ({timeZone})",
			"frequency.cronLocal": "Cron {expression}",
			"frequency.cronRule": "{rule} ({timeZone})",
			"cron.list.join": ", ",
			"cron.part.join": "  ",
			"cron.weekday.name": "{weekday}",
			"cron.weekday.range": "{from}–{to}",
			"cron.months": " dans {months}",
			"cron.day.every": "Chaque jour{months}",
			"cron.day.weekdays": "{weekdays}{months}",
			"cron.day.monthDays": "Jour {days} de chaque mois{months}",
			"cron.day.both": "Jour {days} de chaque mois ou {weekdays}{months}",
			"cron.day.bothStarred": "Jour {days} de chaque mois et {weekdays}{months}",
			"cron.hours.range": "{from}–{to}",
			"cron.hours.list": "{hours}",
			"cron.time.everyMinute": "Chaque minute",
			"cron.time.everyMinutes": "Toutes les minutes {step}",
			"cron.time.joinedEveryMinute": "chaque minute",
			"cron.time.joinedEveryMinutes": "toutes les minutes {step}",
			"cron.time.everyHour": "Toutes les heures",
			"cron.time.joinedEveryHour": "toutes les heures",
			"cron.time.everyNHours": "Toutes les heures {count}",
			"cron.time.joinedEveryNHours": "toutes les heures {count}",
			"cron.time.hourlyAt": "Toutes les heures à la minute {minutes}",
			"cron.time.joinedHourlyAt": "toutes les heures à la minute {minutes}",
			"cron.time.hoursEveryMinute": "toutes les minutes pendant les heures {hours}",
			"cron.time.hoursEveryMinutes": "toutes les minutes {step} pendant les heures {hours}",
			"cron.time.at": "chez {times}",
			"cron.time.hoursAt": "à la minute {minutes} des heures {hours}",
			"frequency.weekday.join": ", ",
			"frequency.weekday.1": "lundi",
			"frequency.weekday.2": "mar.",
			"frequency.weekday.3": "mer",
			"frequency.weekday.4": "jeu.",
			"frequency.weekday.5": "vendredi",
			"frequency.weekday.6": "Samedi",
			"frequency.weekday.7": "Soleil",
			"unit.day.one": "jour",
			"unit.day.other": "jours",
			"unit.hour.one": "heure",
			"unit.hour.other": "heures",
			"unit.minute.one": "minute",
			"unit.minute.other": "minutes",
			"unit.second.one": "seconde",
			"unit.second.other": "secondes",
			"relative.now": "À rendre maintenant",
			"relative.future": "dans {value} {unit}",
			"relative.overdue": "{value} {unit} en retard"
		};
		/** German dictionary, checked against the English keys. */
		const frequencyDe = {
			"time.locale": "en",
			"time.utcPrefix": "UTC",
			"frequency.daily": "Täglich um {time} ({timeZone})",
			"frequency.dailyLocal": "Täglich um {time}",
			"frequency.weekly": "Wöchentlich auf {weekdays} um {time} ({timeZone})",
			"frequency.weeklyLocal": "Wöchentlich auf {weekdays} und {time}",
			"frequency.cron": "Cron {expression} ({timeZone})",
			"frequency.cronLocal": "Cron {expression}",
			"frequency.cronRule": "{rule} ({timeZone})",
			"cron.list.join": ", ",
			"cron.part.join": "  ",
			"cron.weekday.name": "{weekday}",
			"cron.weekday.range": "{from}–{to}",
			"cron.months": " in {months}",
			"cron.day.every": "Jeden Tag{months}",
			"cron.day.weekdays": "{weekdays}{months}",
			"cron.day.monthDays": "Tag {days} jedes Monats{months}",
			"cron.day.both": "Tag {days} eines jeden Monats oder {weekdays}{months}",
			"cron.day.bothStarred": "Tag {days} jedes Monats und {weekdays}{months}",
			"cron.hours.range": "{from}–{to}",
			"cron.hours.list": "{hours}",
			"cron.time.everyMinute": "Jede Minute",
			"cron.time.everyMinutes": "Alle {step} Minuten",
			"cron.time.joinedEveryMinute": "jede Minute",
			"cron.time.joinedEveryMinutes": "alle {step} Minuten",
			"cron.time.everyHour": "Jede Stunde",
			"cron.time.joinedEveryHour": "jede Stunde",
			"cron.time.everyNHours": "Alle {count} Stunden",
			"cron.time.joinedEveryNHours": "alle {count} Stunden",
			"cron.time.hourlyAt": "Jede Stunde im Minutentakt {minutes}",
			"cron.time.joinedHourlyAt": "jede Stunde im Minutentakt {minutes}",
			"cron.time.hoursEveryMinute": "jede Minute während der Stunden {hours}",
			"cron.time.hoursEveryMinutes": "alle {step} Minuten während der Stunden {hours}",
			"cron.time.at": "bei {times}",
			"cron.time.hoursAt": "zur Minute {minutes} der Stunden {hours}",
			"frequency.weekday.join": ", ",
			"frequency.weekday.1": "Mo",
			"frequency.weekday.2": "Di",
			"frequency.weekday.3": "Mi",
			"frequency.weekday.4": "Do",
			"frequency.weekday.5": "Fr",
			"frequency.weekday.6": "Sa",
			"frequency.weekday.7": "Sonne",
			"unit.day.one": "Tag",
			"unit.day.other": "Tage",
			"unit.hour.one": "Stunde",
			"unit.hour.other": "Stunden",
			"unit.minute.one": "Minute",
			"unit.minute.other": "Minuten",
			"unit.second.one": "zweitens",
			"unit.second.other": "Sekunden",
			"relative.now": "Jetzt fällig",
			"relative.future": "in {value} {unit}",
			"relative.overdue": "{value} {unit} überfällig"
		};
		/** Russian dictionary, checked against the English keys. */
		const frequencyRu = {
			"time.locale": "en",
			"time.utcPrefix": "UTC",
			"frequency.daily": "Ежедневно по адресу {time} ({timeZone})",
			"frequency.dailyLocal": "Ежедневно в {time}",
			"frequency.weekly": "Еженедельно на {weekdays} по адресу {time} ({timeZone})",
			"frequency.weeklyLocal": "Еженедельно на {weekdays} по адресу {time}",
			"frequency.cron": "Крон {expression} ({timeZone})",
			"frequency.cronLocal": "Крон {expression}",
			"frequency.cronRule": "{rule} ({timeZone})",
			"cron.list.join": ", ",
			"cron.part.join": "  ",
			"cron.weekday.name": "{weekday}",
			"cron.weekday.range": "{from} – {to}",
			"cron.months": " в {months}",
			"cron.day.every": "Каждый день{months}",
			"cron.day.weekdays": "{weekdays}{months}",
			"cron.day.monthDays": "День {days} каждого месяца{months}",
			"cron.day.both": "День {days} каждого месяца или {weekdays}{months}.",
			"cron.day.bothStarred": "День {days} каждого месяца и {weekdays}{months}.",
			"cron.hours.range": "{from} – {to}",
			"cron.hours.list": "{hours}",
			"cron.time.everyMinute": "Каждую минуту",
			"cron.time.everyMinutes": "Каждые {step} минут",
			"cron.time.joinedEveryMinute": "каждую минуту",
			"cron.time.joinedEveryMinutes": "каждые {step} минут",
			"cron.time.everyHour": "Каждый час",
			"cron.time.joinedEveryHour": "каждый час",
			"cron.time.everyNHours": "Каждые {count} часов",
			"cron.time.joinedEveryNHours": "каждые {count} часов",
			"cron.time.hourlyAt": "Каждый час в минуту {minutes}",
			"cron.time.joinedHourlyAt": "каждый час в минуту {minutes}",
			"cron.time.hoursEveryMinute": "каждую минуту в течение часов {hours}",
			"cron.time.hoursEveryMinutes": "каждые {step} минуты в течение часов {hours}",
			"cron.time.at": "в {times}",
			"cron.time.hoursAt": "в минуту {minutes} часов {hours}",
			"frequency.weekday.join": ", ",
			"frequency.weekday.1": "Пн.",
			"frequency.weekday.2": "Вт",
			"frequency.weekday.3": "ср.",
			"frequency.weekday.4": "Чт",
			"frequency.weekday.5": "Пт",
			"frequency.weekday.6": "Суббота",
			"frequency.weekday.7": "Солнце",
			"unit.day.one": "день",
			"unit.day.other": "дни",
			"unit.hour.one": "час",
			"unit.hour.other": "часы",
			"unit.minute.one": "минута",
			"unit.minute.other": "минуты",
			"unit.second.one": "второй",
			"unit.second.other": "секунды",
			"relative.now": "Срок оплаты сейчас",
			"relative.future": "в {value} {unit}",
			"relative.overdue": "{value} {unit} просрочен"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const frequencyPt = {
			"time.locale": "en",
			"time.utcPrefix": "UTC",
			"frequency.daily": "Diariamente às {time} ({timeZone})",
			"frequency.dailyLocal": "Diariamente às {time}",
			"frequency.weekly": "Semanalmente em {weekdays} às {time} ({timeZone})",
			"frequency.weeklyLocal": "Semanalmente em {weekdays} às {time}",
			"frequency.cron": "Cron {expression} ({timeZone})",
			"frequency.cronLocal": "Cron {expression}",
			"frequency.cronRule": "{rule} ({timeZone})",
			"cron.list.join": ", ",
			"cron.part.join": "  ",
			"cron.weekday.name": "{weekday}",
			"cron.weekday.range": "{from}–{to}",
			"cron.months": " em {months}",
			"cron.day.every": "Todos os dias{months}",
			"cron.day.weekdays": "{weekdays}{months}",
			"cron.day.monthDays": "Dia {days} de cada mês{months}",
			"cron.day.both": "Dia {days} de cada mês ou {weekdays}{months}",
			"cron.day.bothStarred": "Dia {days} de cada mês e {weekdays}{months}",
			"cron.hours.range": "{from}–{to}",
			"cron.hours.list": "{hours}",
			"cron.time.everyMinute": "Cada minuto",
			"cron.time.everyMinutes": "A cada {step} minutos",
			"cron.time.joinedEveryMinute": "cada minuto",
			"cron.time.joinedEveryMinutes": "a cada {step} minutos",
			"cron.time.everyHour": "A cada hora",
			"cron.time.joinedEveryHour": "a cada hora",
			"cron.time.everyNHours": "A cada {count} horas",
			"cron.time.joinedEveryNHours": "a cada {count} horas",
			"cron.time.hourlyAt": "A cada hora, minuto {minutes}",
			"cron.time.joinedHourlyAt": "a cada hora por minuto {minutes}",
			"cron.time.hoursEveryMinute": "a cada minuto durante horas {hours}",
			"cron.time.hoursEveryMinutes": "a cada {step} minutos durante horas {hours}",
			"cron.time.at": "em {times}",
			"cron.time.hoursAt": "no minuto {minutes} das horas {hours}",
			"frequency.weekday.join": ", ",
			"frequency.weekday.1": "segunda-feira",
			"frequency.weekday.2": "Terça",
			"frequency.weekday.3": "Quarta",
			"frequency.weekday.4": "Qui",
			"frequency.weekday.5": "Sexta-feira",
			"frequency.weekday.6": "Sábado",
			"frequency.weekday.7": "Sol",
			"unit.day.one": "dia",
			"unit.day.other": "dias",
			"unit.hour.one": "hora",
			"unit.hour.other": "horas",
			"unit.minute.one": "minuto",
			"unit.minute.other": "minutos",
			"unit.second.one": "segundo",
			"unit.second.other": "segundos",
			"relative.now": "Vencimento agora",
			"relative.future": "em {value} {unit}",
			"relative.overdue": "{value} {unit} atrasado"
		};
		//#endregion
		//#region lib/types/client/locales.js
		/**
		* `schedule.catalog` namespace dictionaries: the Session header catalog and the
		* Sidebar row mark with its hover-card task section.
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "schedule.catalog";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh$1 = {
			"trigger.label": "提醒",
			"list.loading": "正在加载提醒…",
			"list.error": "无法加载提醒。",
			"list.retry": "重试",
			"delete.action": "删除",
			"delete.pending": "正在删除…",
			"delete.label": "删除提醒：{title}",
			"list.open": "打开提醒详情：{title}",
			"trigger.one": "{count} 个提醒",
			"trigger.other": "{count} 个提醒",
			"list.aria": "活动提醒",
			"list.nextRun": "下次运行",
			"frequency.once": "单次",
			"frequency.every": "{value}{unit}一次",
			...frequencyZh,
			"mark.aria": "{count} 个自动化任务",
			"hover.more": "另有 {count} 个任务"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en$1 = {
			"trigger.label": "Reminders",
			"list.loading": "Loading reminders…",
			"list.error": "Could not load reminders.",
			"list.retry": "Retry",
			"delete.action": "Delete",
			"delete.pending": "Deleting…",
			"delete.label": "Delete reminder: {title}",
			"list.open": "Open reminder details: {title}",
			"trigger.one": "{count} reminder",
			"trigger.other": "{count} reminders",
			"list.aria": "Active reminders",
			"list.nextRun": "Next run",
			"frequency.once": "Once",
			"frequency.every": "Every {value} {unit}",
			...frequencyEn,
			"mark.aria": "{count} scheduled tasks",
			"hover.more": "{count} more"
		};
		/** Japanese copy, checked against the English keys. */
		const ja$1 = {
			...frequencyJa,
			"trigger.label": "リマインダー",
			"list.loading": "リマインダーを読み込み中…",
			"list.error": "リマインダーを読み込めませんでした。",
			"list.retry": "再試行",
			"delete.action": "削除",
			"delete.pending": "削除中…",
			"delete.label": "リマインダーを削除: {title}",
			"list.open": "リマインダーの詳細を開く: {title}",
			"trigger.one": "{count}件のリマインダー",
			"trigger.other": "{count}件のリマインダー",
			"list.aria": "有効なリマインダー",
			"list.nextRun": "次回実行",
			"frequency.once": "1回のみ",
			"frequency.every": "{value}{unit}ごと",
			"mark.aria": "スケジュールされたタスク {count}件",
			"hover.more": "他 {count}件"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es$1 = {
			"trigger.label": "Recordatorios",
			"list.loading": "Cargando recordatorios…",
			"list.error": "No se pudieron cargar los recordatorios.",
			"list.retry": "Reintentar",
			"delete.action": "Eliminar",
			"delete.pending": "Eliminando…",
			"delete.label": "Eliminar recordatorio: {title}",
			"list.open": "Abrir detalles del recordatorio: {title}",
			"trigger.one": "Recordatorio de {count}",
			"trigger.other": "Recordatorios de {count}",
			"list.aria": "Recordatorios activos",
			"list.nextRun": "Próxima ejecución",
			"frequency.once": "una vez",
			"frequency.every": "Cada {value} {unit}",
			...frequencyEs,
			"mark.aria": "Tareas programadas {count}",
			"hover.more": "{count} más"
		};
		/** French dictionary, checked against the English keys. */
		const fr$1 = {
			"trigger.label": "Rappels",
			"list.loading": "Chargement des rappels…",
			"list.error": "Impossible de charger les rappels.",
			"list.retry": "Réessayer",
			"delete.action": "Supprimer",
			"delete.pending": "Suppression…",
			"delete.label": "Supprimer le rappel\xA0: {title}",
			"list.open": "Détails du rappel ouvert\xA0: {title}",
			"trigger.one": "Rappel {count}",
			"trigger.other": "Rappels {count}",
			"list.aria": "Rappels actifs",
			"list.nextRun": "Prochaine exécution",
			"frequency.once": "Une fois",
			"frequency.every": "Chaque {value} {unit}",
			...frequencyFr,
			"mark.aria": "Tâches planifiées {count}",
			"hover.more": "{count} plus"
		};
		/** German dictionary, checked against the English keys. */
		const de$1 = {
			"trigger.label": "Erinnerungen",
			"list.loading": "Erinnerungen werden geladen…",
			"list.error": "Erinnerungen konnten nicht geladen werden.",
			"list.retry": "Erneut versuchen",
			"delete.action": "Löschen",
			"delete.pending": "Löschen…",
			"delete.label": "Erinnerung löschen: {title}",
			"list.open": "Offene Erinnerungsdetails: {title}",
			"trigger.one": "{count} Erinnerung",
			"trigger.other": "{count} Erinnerungen",
			"list.aria": "Aktive Erinnerungen",
			"list.nextRun": "Nächster Lauf",
			"frequency.once": "Einmal",
			"frequency.every": "Jeder {value} {unit}",
			...frequencyDe,
			"mark.aria": "{count} geplante Aufgaben",
			"hover.more": "{count} mehr"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru$1 = {
			"trigger.label": "Напоминания",
			"list.loading": "Загрузка напоминаний…",
			"list.error": "Не удалось загрузить напоминания.",
			"list.retry": "Повторить",
			"delete.action": "Удалить",
			"delete.pending": "Удаление…",
			"delete.label": "Удалить напоминание: {title}",
			"list.open": "Открыть детали напоминания: {title}.",
			"trigger.one": "{count} напоминание",
			"trigger.other": "{count} напоминания",
			"list.aria": "Активные напоминания",
			"list.nextRun": "Следующий запуск",
			"frequency.once": "Однажды",
			"frequency.every": "Каждый {value} {unit}",
			...frequencyRu,
			"mark.aria": "{count} запланированные задачи",
			"hover.more": "{count} подробнее"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt$1 = {
			"trigger.label": "Lembretes",
			"list.loading": "Carregando lembretes…",
			"list.error": "Não foi possível carregar os lembretes.",
			"list.retry": "Tentar novamente",
			"delete.action": "Excluir",
			"delete.pending": "Excluindo…",
			"delete.label": "Excluir lembrete: {title}",
			"list.open": "Detalhes do lembrete aberto: {title}",
			"trigger.one": "{count} lembrete",
			"trigger.other": "{count} lembretes",
			"list.aria": "Lembretes ativos",
			"list.nextRun": "Próxima execução",
			"frequency.once": "Uma vez",
			"frequency.every": "A cada {value} {unit}",
			...frequencyPt,
			"mark.aria": "{count} tarefas agendadas",
			"hover.more": "{count} mais"
		};
		//#endregion
		//#region lib/types/client/task-manager-locales.js
		/** Copy for the retained-reminder task manager's `schedule.manager` namespace. */
		/** English task-manager dictionary and key domain. */
		const en = {
			"panel": "Automation tasks",
			"title": "Automation tasks",
			"new.action": "New",
			"list.label": "Task catalog",
			"list.nextPrefix": "Next scheduled time: ",
			"list.loading": "Loading tasks…",
			"list.error": "Could not load tasks.",
			"list.retry": "Retry",
			"list.empty": "No tasks yet. Tasks created in your sessions appear here.",
			"list.emptyInactive": "No inactive automation tasks",
			"list.noMatches": "No matching tasks",
			"search.label": "Search tasks",
			"search.placeholder": "Search automation tasks",
			"search.clear": "Clear search",
			"empty.action": "New automation task",
			"statusFilter.label": "Task status",
			"statusFilter.all": "All",
			"status.active": "Enabled",
			"status.inactive": "Inactive",
			"detail.label": "Task details",
			"detail.close": "Close details",
			"detail.more": "Automation task actions",
			"detail.nextRun": "Next run",
			"detail.tabs": "Task detail views",
			"detail.rule": "Rules",
			"detail.records": "Records",
			"delivery.empty": "No delivery record available",
			"delivery.loading": "Loading delivery records…",
			"delivery.error": "Could not load delivery records.",
			"delivery.notFound": "This task is no longer available.",
			"delivery.cursorError": "Records were updated.",
			"delivery.retry": "Retry",
			"delivery.refresh": "Refresh",
			"delivery.loadMore": "Load more",
			"delivery.expand": "Expand",
			"delivery.collapse": "Collapse",
			"delivery.pruned": "Earlier delivery records have been cleared",
			"delivery.retention": "Retention rules",
			"delivery.retentionBounds": "Each task keeps up to {records} delivery records from the last {days} days.",
			"delivery.retentionExplanation": "When a new record is saved, older records outside these limits are cleared automatically. Clearing records does not stop the task.",
			"detail.name": "Automation task name",
			"detail.instruction": "Automation task instruction",
			"detail.status": "Status",
			"detail.next": "Next scheduled time",
			"detail.frequency": "Frequency",
			"detail.id": "Task ID",
			"detail.session": "Linked session",
			"detail.openSession": "Linked session: open original session",
			"detail.openSessionTitle": "Linked session {title}: open original session",
			"detail.sessionLoading": "Loading original session information.",
			"detail.sessionArchived": "The original session is archived.",
			"detail.sessionUnavailable": "The original session is unavailable.",
			"detail.missing": "Task unavailable. It may have been deleted.",
			"delivery.label": "Saved delivery record",
			"frequency.once": "Once",
			"frequency.every": "Every {value} {unit}",
			...frequencyEn,
			"timing.date": "Date",
			"timing.time": "Time",
			"timing.hour": "Hour",
			"timing.minute": "Minute",
			"timing.second": "Second",
			"timing.prevMonth": "Previous month",
			"timing.nextMonth": "Next month",
			"timing.zone": "Time zone",
			"timing.zoneSearch": "Search by UTC offset, IANA ID, or city",
			"timing.zoneNoResults": "No matching time zones",
			"timing.interval": "Repeat every",
			"timing.intervalIncrease": "Increase interval",
			"timing.intervalDecrease": "Decrease interval",
			"timing.unit.hour": "hours",
			"timing.unit.minute": "minutes",
			"timing.unit.second": "seconds",
			"timing.intervalHint.hour": "At least 1 hour. The interval counts from task creation or the last rule change and is independent of time zones.",
			"timing.intervalHint.minute": "At least 1 minute. The interval counts from task creation or the last rule change and is independent of time zones.",
			"timing.intervalHint.second": "At least 60 seconds. The interval counts from task creation or the last rule change and is independent of time zones.",
			"timing.zoneNoStored": "A one-time task stores only its target moment, not a time zone. The date and time are interpreted in the selected time zone.",
			"timing.inactive": "Inactive tasks are read-only. Their timing cannot be edited.",
			"timing.conflict": "This task changed while you were editing. Your draft is retained. Cancel and reopen after refresh to edit the latest rule.",
			"timing.notFound": "This task is no longer available. Your draft is retained; cancel to close the editor.",
			"timing.subagentSession": "This session belongs to a sub-agent, which never receives delivered reminders.",
			"timing.invalid": "Enter a valid date and time, or check the timing fields.",
			"timing.invalidZone": "Enter a valid IANA time zone, for example Asia/Shanghai.",
			"timing.notFuture": "Choose a date and time in the future.",
			"timing.invalidInterval": "Enter an interval of at least 1 minute.",
			"timing.invalidInterval.hour": "Enter an interval of at least 1 hour.",
			"timing.invalidInterval.minute": "Enter an interval of at least 1 minute.",
			"timing.invalidInterval.second": "Enter an interval of at least 60 seconds.",
			"timing.error": "Could not confirm the timing update. Your draft is retained. Check the task before retrying.",
			"rule.title": "Run time",
			"rule.repeat": "Repeat",
			"rule.weekday": "Weekday",
			"rule.weekdayOption": "Weekday {weekday}",
			"rule.unsaved": "Unsaved changes",
			"rule.save": "Save changes",
			"rule.saving": "Saving…",
			"rule.cancel": "Cancel",
			"rule.invalidTitle": "Enter a task name of at most 120 characters.",
			"rule.invalidPrompt": "Enter a task instruction.",
			"rule.once": "Once",
			"rule.everyMinutes": "Every N minutes",
			"rule.everyHours": "Every N hours",
			"rule.everySeconds": "Every N seconds",
			"rule.daily": "Every day",
			"rule.weekdays": "Monday to Friday",
			"rule.weekly": "Weekly",
			"rule.cron": "Custom",
			"rule.cronLabel": "Cron expression",
			"rule.cronInvalid": "Enter a five-field cron expression, for example 0 9 * * 1-5.",
			"cronForm.frequency": "Frequency",
			"cronForm.monthly": "Monthly",
			"cronForm.weekly": "Weekly",
			"cronForm.daily": "Every day",
			"cronForm.dates": "On dates",
			"cronForm.dateOption": "Day {day}",
			"cronForm.atMinute": "At minute",
			"cronForm.minuteIncrease": "Increase minute",
			"cronForm.minuteDecrease": "Decrease minute",
			"rule.zone.system": " (system)",
			"rule.error.conflict": "This task changed before the update was saved. The row shows the saved rule; try again.",
			"rule.error.notFound": "This task is no longer available.",
			"rule.error.unknown": "Could not confirm the rule update. The row shows the saved rule.",
			"delete.action": "Delete task",
			"delete.title": "Delete this task?",
			"delete.description": "This stops the task from triggering and deletes it together with its saved delivery records. The original session and its messages remain; queued messages are not withdrawn.",
			"delete.confirm": "Confirm deletion",
			"delete.cancel": "Cancel",
			"delete.close": "Close deletion confirmation",
			"delete.pending": "Deleting…",
			"list.more": "More task actions",
			"clear.action": "Clear all inactive tasks",
			"clear.title": "Clear inactive tasks ({count})?",
			"clear.description": "These tasks and their saved delivery records will be permanently deleted. Enabled tasks, original sessions, and queued messages are not affected.",
			"clear.confirm": "Clear tasks",
			"clear.pending": "Clearing…",
			"clear.close": "Close clear confirmation",
			"toast.deleted": "Task deleted.",
			"toast.deleteFailed": "Could not delete the task.",
			"toast.cleared.one": "Cleared {count} inactive task.",
			"toast.cleared.other": "Cleared {count} inactive tasks.",
			"toast.clearedNone": "No inactive tasks to clear.",
			"toast.clearFailed": "Could not clear tasks.",
			"card.open": "Open",
			"card.openLabel": "Open task details: {title}",
			"card.deleted": "Deleted",
			"tool.invoked": "Invoked {name}"
		};
		/** Simplified Chinese dictionary with the same keys as English. */
		const zh = {
			"panel": "自动化任务",
			"title": "自动化任务",
			"new.action": "新建",
			"list.label": "任务列表",
			"list.nextPrefix": "下次计划时间：",
			"list.loading": "正在加载任务…",
			"list.error": "无法加载任务",
			"list.retry": "重试",
			"list.empty": "还没有自动化任务，在会话中创建的任务会显示在这里",
			"list.emptyInactive": "没有已结束的自动化任务",
			"list.noMatches": "没有匹配的自动化任务",
			"search.label": "搜索任务",
			"search.placeholder": "搜索自动化任务",
			"search.clear": "清空搜索",
			"empty.action": "新建自动化任务",
			"statusFilter.label": "任务状态",
			"statusFilter.all": "全部",
			"status.active": "已开启",
			"status.inactive": "已结束",
			"detail.label": "任务详情",
			"detail.close": "关闭详情",
			"detail.more": "自动化任务操作",
			"detail.nextRun": "下次运行",
			"detail.tabs": "任务详情视图",
			"detail.rule": "规则",
			"detail.records": "任务运行记录",
			"delivery.empty": "暂无任务运行记录",
			"delivery.loading": "正在加载任务运行记录…",
			"delivery.error": "无法加载任务运行记录",
			"delivery.notFound": "任务已不可用",
			"delivery.cursorError": "记录已更新",
			"delivery.retry": "重试",
			"delivery.refresh": "刷新",
			"delivery.loadMore": "加载更多",
			"delivery.expand": "展开",
			"delivery.collapse": "收起",
			"delivery.pruned": "更早的运行记录已清理",
			"delivery.retention": "保留规则",
			"delivery.retentionBounds": "每个任务最多保留近 {days} 天内的 {records} 条运行记录。",
			"delivery.retentionExplanation": "产生新记录时，超出范围的旧记录会自动清理。清理记录不影响任务继续运行。",
			"detail.name": "自动化任务名称",
			"detail.instruction": "自动化任务内容",
			"detail.status": "状态",
			"detail.next": "下次计划时间",
			"detail.frequency": "提醒频率",
			"detail.id": "任务 ID",
			"detail.session": "关联会话",
			"detail.openSession": "关联会话：打开原会话",
			"detail.openSessionTitle": "关联会话 {title}：打开原会话",
			"detail.sessionLoading": "正在加载原会话信息",
			"detail.sessionArchived": "原会话已归档",
			"detail.sessionUnavailable": "原会话当前不可用",
			"detail.missing": "任务已不可用，可能已被删除",
			"delivery.label": "已保存的任务运行记录",
			"frequency.once": "仅一次",
			"frequency.every": "每 {value} {unit}",
			...frequencyZh,
			"timing.date": "日期",
			"timing.time": "时间",
			"timing.hour": "时",
			"timing.minute": "分",
			"timing.second": "秒",
			"timing.prevMonth": "上个月",
			"timing.nextMonth": "下个月",
			"timing.zone": "时区",
			"timing.zoneSearch": "搜索 UTC 偏移、IANA 标识或城市",
			"timing.zoneNoResults": "没有匹配的时区",
			"timing.interval": "重复间隔",
			"timing.intervalIncrease": "增大间隔",
			"timing.intervalDecrease": "减小间隔",
			"timing.unit.hour": "小时",
			"timing.unit.minute": "分钟",
			"timing.unit.second": "秒",
			"timing.intervalHint.hour": "至少 1 小时。间隔自任务创建或上次修改规则时起计，不受时区影响",
			"timing.intervalHint.minute": "至少 1 分钟。间隔自任务创建或上次修改规则时起计，不受时区影响",
			"timing.intervalHint.second": "至少 60 秒。间隔自任务创建或上次修改规则时起计，不受时区影响",
			"timing.zoneNoStored": "单次任务只保存触发时刻，不保存时区；日期和时间按所选时区换算",
			"timing.inactive": "已结束的任务为只读，无法修改时间",
			"timing.conflict": "编辑期间任务已变化，草稿已保留。请在刷新后取消并重新打开编辑器，以修改最新规则",
			"timing.notFound": "此任务当前不可用，草稿已保留。请取消以关闭编辑器",
			"timing.subagentSession": "此会话属于子 agent，永远不会收到投递的提醒",
			"timing.invalid": "请输入有效的日期和时间，或检查时间字段",
			"timing.invalidZone": "请输入有效的 IANA 时区，例如 Asia/Shanghai",
			"timing.notFuture": "请选择未来的日期和时间",
			"timing.invalidInterval": "请输入至少 1 分钟的间隔",
			"timing.invalidInterval.hour": "请输入至少 1 小时的间隔",
			"timing.invalidInterval.minute": "请输入至少 1 分钟的间隔",
			"timing.invalidInterval.second": "请输入至少 60 秒的间隔",
			"timing.error": "无法确认时间修改是否已保存。草稿已保留，请在重试前检查任务",
			"rule.title": "运行时间",
			"rule.repeat": "重复",
			"rule.weekday": "星期",
			"rule.weekdayOption": "星期{weekday}",
			"rule.unsaved": "有未保存的修改",
			"rule.save": "保存修改",
			"rule.saving": "保存中…",
			"rule.cancel": "取消",
			"rule.invalidTitle": "请输入不超过 120 个字符的任务名称",
			"rule.invalidPrompt": "请输入任务内容",
			"rule.once": "仅一次",
			"rule.everyMinutes": "每 N 分钟",
			"rule.everyHours": "每 N 小时",
			"rule.everySeconds": "每 N 秒",
			"rule.daily": "每天",
			"rule.weekdays": "周一至周五",
			"rule.weekly": "每周",
			"rule.cron": "自定义",
			"rule.cronLabel": "Cron 表达式",
			"rule.cronInvalid": "请输入 5 字段的 cron 表达式，例如 0 9 * * 1-5",
			"cronForm.frequency": "频率",
			"cronForm.monthly": "每月",
			"cronForm.weekly": "每周",
			"cronForm.daily": "每天",
			"cronForm.dates": "在以下日期",
			"cronForm.dateOption": "{day} 日",
			"cronForm.atMinute": "在第几分钟",
			"cronForm.minuteIncrease": "增大分钟",
			"cronForm.minuteDecrease": "减小分钟",
			"rule.zone.system": "（系统）",
			"rule.error.conflict": "任务在保存前已发生变化。当前显示已保存的规则，请重试",
			"rule.error.notFound": "此任务当前不可用",
			"rule.error.unknown": "无法确认规则是否已更新。当前显示已保存的规则",
			"delete.action": "删除任务",
			"delete.title": "删除此任务？",
			"delete.description": "任务将停止触发，并连同其已保存的任务运行记录一并删除。原会话及其消息仍然保留；已排队的消息不会被撤回。",
			"delete.confirm": "确认删除",
			"delete.cancel": "取消",
			"delete.close": "关闭删除确认",
			"delete.pending": "正在删除…",
			"list.more": "更多任务操作",
			"clear.action": "清除全部已结束任务",
			"clear.title": "清除 {count} 个已结束任务？",
			"clear.description": "这些任务及其运行记录将被永久删除，已开启任务、原会话和已排队消息等不受影响。",
			"clear.confirm": "确认清除",
			"clear.pending": "正在清理…",
			"clear.close": "关闭清理确认",
			"toast.deleted": "任务已删除",
			"toast.deleteFailed": "无法删除任务",
			"toast.cleared.one": "已清除 {count} 个已结束任务",
			"toast.cleared.other": "已清除 {count} 个已结束任务",
			"toast.clearedNone": "没有可清理的已结束任务",
			"toast.clearFailed": "清除任务失败",
			"card.open": "打开",
			"card.openLabel": "打开任务详情：{title}",
			"card.deleted": "已删除",
			"tool.invoked": "已调用 {name}"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			...frequencyJa,
			"panel": "自動化タスク",
			"title": "自動化タスク",
			"new.action": "新規",
			"list.label": "タスク一覧",
			"list.nextPrefix": "次回予定日時: ",
			"list.loading": "タスクを読み込み中…",
			"list.error": "タスクを読み込めませんでした。",
			"list.retry": "再試行",
			"list.empty": "タスクはまだありません。セッションで作成したタスクがここに表示されます。",
			"list.emptyInactive": "無効な自動化タスクはありません",
			"list.noMatches": "一致するタスクはありません",
			"search.label": "タスクを検索",
			"search.placeholder": "自動化タスクを検索",
			"search.clear": "検索をクリア",
			"empty.action": "新規自動化タスク",
			"statusFilter.label": "タスクの状態",
			"statusFilter.all": "すべて",
			"status.active": "有効",
			"status.inactive": "無効",
			"detail.label": "タスクの詳細",
			"detail.close": "詳細を閉じる",
			"detail.more": "自動化タスクの操作",
			"detail.nextRun": "次回実行",
			"detail.tabs": "タスク詳細ビュー",
			"detail.rule": "ルール",
			"detail.records": "記録",
			"delivery.empty": "配信記録はありません",
			"delivery.loading": "配信記録を読み込み中…",
			"delivery.error": "配信記録を読み込めませんでした。",
			"delivery.notFound": "このタスクは利用できなくなりました。",
			"delivery.cursorError": "記録が更新されました。",
			"delivery.retry": "再試行",
			"delivery.refresh": "更新",
			"delivery.loadMore": "さらに読み込む",
			"delivery.expand": "展開",
			"delivery.collapse": "折りたたむ",
			"delivery.pruned": "以前の配信記録は削除されました",
			"delivery.retention": "保持ルール",
			"delivery.retentionBounds": "各タスクは過去 {days} 日間の配信記録を最大 {records} 件保持します。",
			"delivery.retentionExplanation": "新しい記録を保存すると、これらの上限を超えた古い記録は自動的に削除されます。記録を削除してもタスクは停止しません。",
			"detail.name": "自動化タスク名",
			"detail.instruction": "自動化タスクの指示",
			"detail.status": "状態",
			"detail.next": "次回予定日時",
			"detail.frequency": "頻度",
			"detail.id": "タスク ID",
			"detail.session": "リンクされたセッション",
			"detail.openSession": "リンクされたセッション: 元のセッションを開く",
			"detail.openSessionTitle": "リンクされたセッション {title}: 元のセッションを開く",
			"detail.sessionLoading": "元のセッション情報を読み込み中。",
			"detail.sessionArchived": "元のセッションはアーカイブされています。",
			"detail.sessionUnavailable": "元のセッションは利用できません。",
			"detail.missing": "タスクを利用できません。削除された可能性があります。",
			"delivery.label": "保存済みの配信記録",
			"frequency.once": "1回のみ",
			"frequency.every": "{value}{unit}ごと",
			"timing.date": "日付",
			"timing.time": "時刻",
			"timing.hour": "時",
			"timing.minute": "分",
			"timing.second": "秒",
			"timing.prevMonth": "前月",
			"timing.nextMonth": "翌月",
			"timing.zone": "タイムゾーン",
			"timing.zoneSearch": "UTCオフセット、IANA ID、都市名で検索",
			"timing.zoneNoResults": "一致するタイムゾーンがありません",
			"timing.interval": "繰り返し間隔",
			"timing.intervalIncrease": "間隔を増やす",
			"timing.intervalDecrease": "間隔を減らす",
			"timing.unit.hour": "時間",
			"timing.unit.minute": "分",
			"timing.unit.second": "秒",
			"timing.intervalHint.hour": "1時間以上を指定してください。間隔はタスクの作成時または最後のルール変更時から数え、タイムゾーンには依存しません。",
			"timing.intervalHint.minute": "1分以上を指定してください。間隔はタスクの作成時または最後のルール変更時から数え、タイムゾーンには依存しません。",
			"timing.intervalHint.second": "60秒以上を指定してください。間隔はタスクの作成時または最後のルール変更時から数え、タイムゾーンには依存しません。",
			"timing.zoneNoStored": "1回のみのタスクは実行時刻のみを保存し、タイムゾーンは保存しません。日付と時刻は選択したタイムゾーンで解釈されます。",
			"timing.inactive": "無効なタスクは読み取り専用です。タイミングは編集できません。",
			"timing.conflict": "編集中にこのタスクが変更されました。下書きは保持されています。最新のルールを編集するには、キャンセルして再読み込み後に開き直してください。",
			"timing.notFound": "このタスクは利用できなくなりました。下書きは保持されています。キャンセルするとエディターを閉じます。",
			"timing.subagentSession": "このセッションはサブエージェントのものであり、配信リマインダーを受け取りません。",
			"timing.invalid": "有効な日付と時刻を入力するか、タイミングの各項目を確認してください。",
			"timing.invalidZone": "有効なIANAタイムゾーンを入力してください（例: Asia/Shanghai）。",
			"timing.notFuture": "未来の日付と時刻を選択してください。",
			"timing.invalidInterval": "1分以上の間隔を入力してください。",
			"timing.invalidInterval.hour": "1時間以上の間隔を入力してください。",
			"timing.invalidInterval.minute": "1分以上の間隔を入力してください。",
			"timing.invalidInterval.second": "60秒以上の間隔を入力してください。",
			"timing.error": "タイミングの更新を確認できませんでした。下書きは保持されています。タスクを確認してから再試行してください。",
			"rule.title": "実行時刻",
			"rule.repeat": "繰り返し",
			"rule.weekday": "曜日",
			"rule.weekdayOption": "{weekday}曜日",
			"rule.unsaved": "未保存の変更",
			"rule.save": "変更を保存",
			"rule.saving": "保存中…",
			"rule.cancel": "キャンセル",
			"rule.invalidTitle": "タスク名は120文字以内で入力してください。",
			"rule.invalidPrompt": "タスクの指示を入力してください。",
			"rule.once": "1回のみ",
			"rule.everyMinutes": "N分ごと",
			"rule.everyHours": "N時間ごと",
			"rule.everySeconds": "N秒ごと",
			"rule.daily": "毎日",
			"rule.weekdays": "月曜日から金曜日",
			"rule.weekly": "毎週",
			"rule.cron": "カスタム",
			"rule.cronLabel": "Cron式",
			"rule.cronInvalid": "5フィールドのCron式を入力してください（例: 0 9 * * 1-5）。",
			"cronForm.frequency": "頻度",
			"cronForm.monthly": "毎月",
			"cronForm.weekly": "毎週",
			"cronForm.daily": "毎日",
			"cronForm.dates": "日付指定",
			"cronForm.dateOption": "{day}日",
			"cronForm.atMinute": "分",
			"cronForm.minuteIncrease": "分を増やす",
			"cronForm.minuteDecrease": "分を減らす",
			"rule.zone.system": "（システム）",
			"rule.error.conflict": "更新の保存前にこのタスクが変更されました。行には保存済みのルールが表示されています。もう一度お試しください。",
			"rule.error.notFound": "このタスクは利用できなくなりました。",
			"rule.error.unknown": "ルールの更新を確認できませんでした。行には保存済みのルールが表示されています。",
			"delete.action": "タスクを削除",
			"delete.title": "このタスクを削除しますか？",
			"delete.description": "タスクの実行が停止し、保存済みの配信記録とともに削除されます。元のセッションとそのメッセージは残り、キューに入ったメッセージは取り消されません。",
			"delete.confirm": "削除を確定",
			"delete.cancel": "キャンセル",
			"delete.close": "削除確認を閉じる",
			"delete.pending": "削除中…",
			"list.more": "その他のタスク操作",
			"clear.action": "終了済みタスクをすべてクリア",
			"clear.title": "終了済みタスク {count} 件をクリアしますか？",
			"clear.description": "これらのタスクと実行履歴は完全に削除されます。実行中のタスク、元のセッション、キューに入ったメッセージなどは影響を受けません。",
			"clear.confirm": "クリアする",
			"clear.pending": "クリア中…",
			"clear.close": "クリア確認を閉じる",
			"toast.deleted": "タスクを削除しました。",
			"toast.deleteFailed": "タスクを削除できませんでした。",
			"toast.cleared.one": "終了したタスクを {count} 件クリアしました。",
			"toast.cleared.other": "終了したタスクを {count} 件クリアしました。",
			"toast.clearedNone": "クリアする終了済みタスクはありません。",
			"toast.clearFailed": "タスクをクリアできませんでした。",
			"card.open": "開く",
			"card.openLabel": "タスクの詳細を開く: {title}",
			"card.deleted": "削除済み",
			"tool.invoked": "{name} を実行しました"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"panel": "Tareas de automatización",
			"title": "Tareas de automatización",
			"new.action": "Nuevo",
			"list.label": "Catálogo de tareas",
			"list.nextPrefix": "Próxima hora prevista: ",
			"list.loading": "Cargando tareas…",
			"list.error": "No se pudieron cargar las tareas.",
			"list.retry": "Reintentar",
			"list.empty": "Aún no hay tareas. Las tareas creadas en tus sesiones aparecen aquí.",
			"list.emptyInactive": "Sin tareas de automatización inactivas",
			"list.noMatches": "No hay tareas coincidentes",
			"search.label": "Tareas de búsqueda",
			"search.placeholder": "Tareas de automatización de búsqueda",
			"search.clear": "Borrar búsqueda",
			"empty.action": "Nueva tarea de automatización",
			"statusFilter.label": "Estado de la tarea",
			"statusFilter.all": "Todos",
			"status.active": "Habilitado",
			"status.inactive": "Inactivo",
			"detail.label": "Detalles de la tarea",
			"detail.close": "Cerrar detalles",
			"detail.more": "Acciones de tareas de automatización",
			"detail.nextRun": "Próxima ejecución",
			"detail.tabs": "Vistas de detalles de tareas",
			"detail.rule": "Reglas",
			"detail.records": "Registros",
			"delivery.empty": "No hay registro de entrega disponible",
			"delivery.loading": "Cargando registros de entrega…",
			"delivery.error": "No se pudieron cargar los registros de entrega.",
			"delivery.notFound": "Esta tarea ya no está disponible.",
			"delivery.cursorError": "Se actualizaron los registros.",
			"delivery.retry": "Reintentar",
			"delivery.refresh": "Actualizar",
			"delivery.loadMore": "Cargar más",
			"delivery.expand": "Expandir",
			"delivery.collapse": "Contraer",
			"delivery.pruned": "Se han borrado los registros de entrega anteriores.",
			"delivery.retention": "Reglas de retención",
			"delivery.retentionBounds": "Cada tarea mantiene registros de entrega hasta {records} de los últimos días {days}.",
			"delivery.retentionExplanation": "Cuando se guarda un nuevo registro, los registros más antiguos que estén fuera de estos límites se borran automáticamente. Borrar registros no detiene la tarea.",
			"detail.name": "Nombre de la tarea de automatización",
			"detail.instruction": "Instrucción de tarea de automatización",
			"detail.status": "Estado",
			"detail.next": "Próxima hora programada",
			"detail.frequency": "Frecuencia",
			"detail.id": "ID de tarea",
			"detail.session": "Sesión vinculada",
			"detail.openSession": "Sesión vinculada: abrir sesión original",
			"detail.openSessionTitle": "Sesión vinculada {title}: abrir sesión original",
			"detail.sessionLoading": "Cargando información de la sesión original.",
			"detail.sessionArchived": "La sesión original está archivada.",
			"detail.sessionUnavailable": "La sesión original no está disponible.",
			"detail.missing": "Tarea no disponible. Es posible que haya sido eliminado.",
			"delivery.label": "Registro de entrega guardado",
			"frequency.once": "una vez",
			"frequency.every": "Cada {value} {unit}",
			...frequencyEs,
			"timing.date": "Fecha",
			"timing.time": "tiempo",
			"timing.hour": "Hora",
			"timing.minute": "Minuto",
			"timing.second": "segundo",
			"timing.prevMonth": "Mes anterior",
			"timing.nextMonth": "El próximo mes",
			"timing.zone": "Zona horaria",
			"timing.zoneSearch": "Buscar por desplazamiento UTC, ID de IANA o ciudad",
			"timing.zoneNoResults": "No hay zonas horarias coincidentes",
			"timing.interval": "Repetir cada",
			"timing.intervalIncrease": "aumentar el intervalo",
			"timing.intervalDecrease": "Intervalo de disminución",
			"timing.unit.hour": "horas",
			"timing.unit.minute": "minutos",
			"timing.unit.second": "segundos",
			"timing.intervalHint.hour": "Al menos 1 hora. El intervalo cuenta desde la creación de la tarea o el último cambio de regla y es independiente de las zonas horarias.",
			"timing.intervalHint.minute": "Al menos 1 minuto. El intervalo cuenta desde la creación de la tarea o el último cambio de regla y es independiente de las zonas horarias.",
			"timing.intervalHint.second": "Al menos 60 segundos. El intervalo cuenta desde la creación de la tarea o el último cambio de regla y es independiente de las zonas horarias.",
			"timing.zoneNoStored": "Una tarea única almacena sólo su momento objetivo, no una zona horaria. La fecha y la hora se interpretan en la zona horaria seleccionada.",
			"timing.inactive": "Las tareas inactivas son de solo lectura. Su sincronización no se puede editar.",
			"timing.conflict": "Esta tarea cambió mientras estabas editando. Su borrador se conserva. Cancele y vuelva a abrir después de actualizar para editar la regla más reciente.",
			"timing.notFound": "Esta tarea ya no está disponible. Su borrador se conserva; cancelar para cerrar el editor.",
			"timing.subagentSession": "Esta sesión pertenece a un subagente, que nunca recibe recordatorios entregados.",
			"timing.invalid": "Ingrese una fecha y hora válidas, o verifique los campos de tiempo.",
			"timing.invalidZone": "Ingrese una zona horaria IANA válida, por ejemplo Asia/Shanghai.",
			"timing.notFuture": "Elija una fecha y hora en el futuro.",
			"timing.invalidInterval": "Introduzca un intervalo de al menos 1 minuto.",
			"timing.invalidInterval.hour": "Introduzca un intervalo de al menos 1 hora.",
			"timing.invalidInterval.minute": "Introduzca un intervalo de al menos 1 minuto.",
			"timing.invalidInterval.second": "Introduzca un intervalo de al menos 60 segundos.",
			"timing.error": "No se pudo confirmar la actualización del tiempo. Su borrador se conserva. Verifique la tarea antes de volver a intentarlo.",
			"rule.title": "tiempo de ejecución",
			"rule.repeat": "repetir",
			"rule.weekday": "Día laborable",
			"rule.weekdayOption": "Día laborable {weekday}",
			"rule.unsaved": "Cambios no guardados",
			"rule.save": "Guardar cambios",
			"rule.saving": "Guardando…",
			"rule.cancel": "Cancelar",
			"rule.invalidTitle": "Introduzca un nombre de tarea de como máximo 120 caracteres.",
			"rule.invalidPrompt": "Introduzca una instrucción de tarea.",
			"rule.once": "una vez",
			"rule.everyMinutes": "Cada N minutos",
			"rule.everyHours": "Cada N horas",
			"rule.everySeconds": "Cada N segundos",
			"rule.daily": "todos los dias",
			"rule.weekdays": "lunes a viernes",
			"rule.weekly": "Semanal",
			"rule.cron": "personalizado",
			"rule.cronLabel": "expresión cron",
			"rule.cronInvalid": "Ingrese una expresión cron de cinco campos, por ejemplo 0 9 * * 1-5.",
			"cronForm.frequency": "Frecuencia",
			"cronForm.monthly": "Mensual",
			"cronForm.weekly": "Semanal",
			"cronForm.daily": "todos los dias",
			"cronForm.dates": "en fechas",
			"cronForm.dateOption": "Día {day}",
			"cronForm.atMinute": "al minuto",
			"cronForm.minuteIncrease": "aumentar minuto",
			"cronForm.minuteDecrease": "Disminuir minuto",
			"rule.zone.system": " (sistema)",
			"rule.error.conflict": "Esta tarea cambió antes de que se guardara la actualización. La fila muestra la regla guardada; intentar otra vez.",
			"rule.error.notFound": "Esta tarea ya no está disponible.",
			"rule.error.unknown": "No se pudo confirmar la actualización de la regla. La fila muestra la regla guardada.",
			"delete.action": "Eliminar tarea",
			"delete.title": "¿Eliminar esta tarea?",
			"delete.description": "Esto evita que la tarea se active y la elimina junto con sus registros de entrega guardados. La sesión original y sus mensajes permanecen; los mensajes en cola no se retiran.",
			"delete.confirm": "Confirmar eliminación",
			"delete.cancel": "Cancelar",
			"delete.close": "Cerrar confirmación de eliminación",
			"delete.pending": "Eliminando…",
			"list.more": "Más acciones de tareas",
			"clear.action": "Borrar todas las tareas inactivas",
			"clear.title": "¿Borrar las tareas inactivas ({count})?",
			"clear.description": "Estas tareas y sus registros de entrega guardados se eliminarán permanentemente. Las tareas habilitadas, las sesiones originales y los mensajes en cola no se verán afectados.",
			"clear.confirm": "Borrar tareas",
			"clear.pending": "Borrando…",
			"clear.close": "Cerrar confirmación de borrado",
			"toast.cleared.one": "Se ha borrado {count} tarea inactiva.",
			"toast.cleared.other": "Se han borrado {count} tareas inactivas.",
			"toast.clearedNone": "No hay tareas inactivas que borrar.",
			"toast.clearFailed": "No se pudieron borrar las tareas.",
			"toast.deleted": "Tarea eliminada.",
			"toast.deleteFailed": "No se pudo eliminar la tarea.",
			"card.open": "Abrir",
			"card.openLabel": "Abrir detalles de la tarea: {title}",
			"card.deleted": "Eliminado",
			"tool.invoked": "Invocado {name}"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"panel": "Tâches d'automatisation",
			"title": "Tâches d'automatisation",
			"new.action": "Nouveau",
			"list.label": "Catalogue de tâches",
			"list.nextPrefix": "Prochaine heure programmée\xA0: ",
			"list.loading": "Chargement des tâches…",
			"list.error": "Impossible de charger les tâches.",
			"list.retry": "Réessayer",
			"list.empty": "Aucune tâche pour l'instant. Les tâches créées dans vos sessions apparaissent ici.",
			"list.emptyInactive": "Aucune tâche d'automatisation inactive",
			"list.noMatches": "Aucune tâche correspondante",
			"search.label": "Tâches de recherche",
			"search.placeholder": "Tâches d'automatisation de la recherche",
			"search.clear": "Effacer la recherche",
			"empty.action": "Nouvelle tâche d'automatisation",
			"statusFilter.label": "Statut de la tâche",
			"statusFilter.all": "Tout",
			"status.active": "Activé",
			"status.inactive": "Inactif",
			"detail.label": "Détails de la tâche",
			"detail.close": "Fermer les détails",
			"detail.more": "Actions des tâches d'automatisation",
			"detail.nextRun": "Prochaine exécution",
			"detail.tabs": "Vues détaillées des tâches",
			"detail.rule": "Règles",
			"detail.records": "Enregistrements",
			"delivery.empty": "Aucun historique de livraison disponible",
			"delivery.loading": "Chargement des enregistrements de livraison…",
			"delivery.error": "Impossible de charger les enregistrements de livraison.",
			"delivery.notFound": "Cette tâche n'est plus disponible.",
			"delivery.cursorError": "Les dossiers ont été mis à jour.",
			"delivery.retry": "Réessayer",
			"delivery.refresh": "Actualiser",
			"delivery.loadMore": "Charger plus",
			"delivery.expand": "Développer",
			"delivery.collapse": "Réduire",
			"delivery.pruned": "Les enregistrements de livraison antérieurs ont été effacés",
			"delivery.retention": "Règles de conservation",
			"delivery.retentionBounds": "Chaque tâche conserve jusqu'à {records} enregistrements de livraison des derniers jours {days}.",
			"delivery.retentionExplanation": "Lorsqu'un nouvel enregistrement est enregistré, les enregistrements plus anciens en dehors de ces limites sont automatiquement effacés. La suppression des enregistrements n'arrête pas la tâche.",
			"detail.name": "Nom de la tâche d'automatisation",
			"detail.instruction": "Instruction de tâche d'automatisation",
			"detail.status": "Statut",
			"detail.next": "Prochaine heure programmée",
			"detail.frequency": "Fréquence",
			"detail.id": "ID de tâche",
			"detail.session": "Séance liée",
			"detail.openSession": "Session liée\xA0: ouvrir la session originale",
			"detail.openSessionTitle": "Session liée {title}\xA0: ouvrir la session originale",
			"detail.sessionLoading": "Chargement des informations de session originales.",
			"detail.sessionArchived": "La session originale est archivée.",
			"detail.sessionUnavailable": "La session originale n'est pas disponible.",
			"detail.missing": "Tâche indisponible. Il a peut-être été supprimé.",
			"delivery.label": "Dossier de livraison enregistré",
			"frequency.once": "Une fois",
			"frequency.every": "Chaque {value} {unit}",
			...frequencyFr,
			"timing.date": "Date",
			"timing.time": "Temps",
			"timing.hour": "Heure",
			"timing.minute": "Minutes",
			"timing.second": "Seconde",
			"timing.prevMonth": "Mois précédent",
			"timing.nextMonth": "Le mois prochain",
			"timing.zone": "Fuseau horaire",
			"timing.zoneSearch": "Recherche par décalage UTC, ID IANA ou ville",
			"timing.zoneNoResults": "Aucun fuseau horaire correspondant",
			"timing.interval": "Répétez tous les",
			"timing.intervalIncrease": "Augmenter l'intervalle",
			"timing.intervalDecrease": "Diminuer l'intervalle",
			"timing.unit.hour": "heures",
			"timing.unit.minute": "minutes",
			"timing.unit.second": "secondes",
			"timing.intervalHint.hour": "Au moins 1 heure. L'intervalle compte à partir de la création de la tâche ou du dernier changement de règle et est indépendant des fuseaux horaires.",
			"timing.intervalHint.minute": "Au moins 1 minute. L'intervalle compte à partir de la création de la tâche ou du dernier changement de règle et est indépendant des fuseaux horaires.",
			"timing.intervalHint.second": "Au moins 60 secondes. L'intervalle compte à partir de la création de la tâche ou du dernier changement de règle et est indépendant des fuseaux horaires.",
			"timing.zoneNoStored": "Une tâche ponctuelle stocke uniquement son moment cible, pas un fuseau horaire. La date et l'heure sont interprétées dans le fuseau horaire sélectionné.",
			"timing.inactive": "Les tâches inactives sont en lecture seule. Leur timing ne peut pas être modifié.",
			"timing.conflict": "Cette tâche a changé pendant que vous effectuiez la modification. Votre brouillon est conservé. Annulez et rouvrez après l'actualisation pour modifier la dernière règle.",
			"timing.notFound": "Cette tâche n'est plus disponible. Votre brouillon est conservé\xA0; annuler pour fermer l'éditeur.",
			"timing.subagentSession": "Cette session appartient à un sous-agent, qui ne reçoit jamais de rappels délivrés.",
			"timing.invalid": "Entrez une date et une heure valides ou vérifiez les champs de synchronisation.",
			"timing.invalidZone": "Saisissez un fuseau horaire IANA valide, par exemple Asie/Shanghai.",
			"timing.notFuture": "Choisissez une date et une heure dans le futur.",
			"timing.invalidInterval": "Entrez un intervalle d'au moins 1 minute.",
			"timing.invalidInterval.hour": "Entrez un intervalle d'au moins 1 heure.",
			"timing.invalidInterval.minute": "Entrez un intervalle d'au moins 1 minute.",
			"timing.invalidInterval.second": "Entrez un intervalle d'au moins 60 secondes.",
			"timing.error": "Impossible de confirmer la mise à jour du timing. Votre brouillon est conservé. Vérifiez la tâche avant de réessayer.",
			"rule.title": "Temps d'exécution",
			"rule.repeat": "Répéter",
			"rule.weekday": "Jour de la semaine",
			"rule.weekdayOption": "Jour de la semaine {weekday}",
			"rule.unsaved": "Modifications non enregistrées",
			"rule.save": "Enregistrer les modifications",
			"rule.saving": "Sauvegarde…",
			"rule.cancel": "Annuler",
			"rule.invalidTitle": "Saisissez un nom de tâche comportant au maximum 120\xA0caractères.",
			"rule.invalidPrompt": "Entrez une instruction de tâche.",
			"rule.once": "Une fois",
			"rule.everyMinutes": "Toutes les N minutes",
			"rule.everyHours": "Toutes les N heures",
			"rule.everySeconds": "Toutes les N secondes",
			"rule.daily": "Chaque jour",
			"rule.weekdays": "Du lundi au vendredi",
			"rule.weekly": "Hebdomadaire",
			"rule.cron": "Personnalisé",
			"rule.cronLabel": "Expression Cron",
			"rule.cronInvalid": "Entrez une expression cron à cinq champs, par exemple 0 9 * * 1-5.",
			"cronForm.frequency": "Fréquence",
			"cronForm.monthly": "Mensuel",
			"cronForm.weekly": "Hebdomadaire",
			"cronForm.daily": "Chaque jour",
			"cronForm.dates": "Aux dates",
			"cronForm.dateOption": "Jour {day}",
			"cronForm.atMinute": "À la minute",
			"cronForm.minuteIncrease": "Augmenter les minutes",
			"cronForm.minuteDecrease": "Diminuer les minutes",
			"rule.zone.system": " (système)",
			"rule.error.conflict": "Cette tâche a changé avant l'enregistrement de la mise à jour. La ligne affiche la règle enregistrée\xA0; essayer à nouveau.",
			"rule.error.notFound": "Cette tâche n'est plus disponible.",
			"rule.error.unknown": "Impossible de confirmer la mise à jour de la règle. La ligne affiche la règle enregistrée.",
			"delete.action": "Supprimer la tâche",
			"delete.title": "Supprimer cette tâche\xA0?",
			"delete.description": "Cela empêche le déclenchement de la tâche et la supprime ainsi que ses enregistrements de livraison enregistrés. La session d'origine et ses messages restent conservés\xA0; les messages en file d'attente ne sont pas retirés.",
			"delete.confirm": "Confirmer la suppression",
			"delete.cancel": "Annuler",
			"delete.close": "Fermer la confirmation de suppression",
			"delete.pending": "Suppression…",
			"list.more": "Autres actions sur les tâches",
			"clear.action": "Effacer toutes les tâches inactives",
			"clear.title": "Effacer les tâches inactives ({count}) ?",
			"clear.description": "Ces tâches et leurs enregistrements de livraison seront définitivement supprimés. Les tâches activées, les sessions originales et les messages en file d'attente ne sont pas affectés.",
			"clear.confirm": "Effacer les tâches",
			"clear.pending": "Effacement…",
			"clear.close": "Fermer la confirmation d'effacement",
			"toast.cleared.one": "{count} tâche inactive effacée.",
			"toast.cleared.other": "{count} tâches inactives effacées.",
			"toast.clearedNone": "Aucune tâche inactive à effacer.",
			"toast.clearFailed": "Impossible d'effacer les tâches.",
			"toast.deleted": "Tâche supprimée.",
			"toast.deleteFailed": "Impossible de supprimer la tâche.",
			"card.open": "Ouvrir",
			"card.openLabel": "Détails de la tâche ouverte\xA0: {title}",
			"card.deleted": "Supprimé",
			"tool.invoked": "{name} invoqué"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"panel": "Automatisierungsaufgaben",
			"title": "Automatisierungsaufgaben",
			"new.action": "Neu",
			"list.label": "Aufgabenkatalog",
			"list.nextPrefix": "Nächste geplante Zeit: ",
			"list.loading": "Aufgaben werden geladen…",
			"list.error": "Aufgaben konnten nicht geladen werden.",
			"list.retry": "Erneut versuchen",
			"list.empty": "Noch keine Aufgaben. Hier werden die in Ihren Sitzungen erstellten Aufgaben angezeigt.",
			"list.emptyInactive": "Keine inaktiven Automatisierungsaufgaben",
			"list.noMatches": "Keine passenden Aufgaben",
			"search.label": "Suchaufgaben",
			"search.placeholder": "Suchautomatisierungsaufgaben",
			"search.clear": "Suche löschen",
			"empty.action": "Neue Automatisierungsaufgabe",
			"statusFilter.label": "Aufgabenstatus",
			"statusFilter.all": "Alle",
			"status.active": "Aktiviert",
			"status.inactive": "Inaktiv",
			"detail.label": "Aufgabendetails",
			"detail.close": "Details schließen",
			"detail.more": "Aktionen der Automatisierungsaufgabe",
			"detail.nextRun": "Nächster Lauf",
			"detail.tabs": "Aufgabendetailansichten",
			"detail.rule": "Regeln",
			"detail.records": "Aufzeichnungen",
			"delivery.empty": "Kein Lieferprotokoll verfügbar",
			"delivery.loading": "Lieferdatensätze werden geladen…",
			"delivery.error": "Lieferdatensätze konnten nicht geladen werden.",
			"delivery.notFound": "Diese Aufgabe ist nicht mehr verfügbar.",
			"delivery.cursorError": "Die Datensätze wurden aktualisiert.",
			"delivery.retry": "Erneut versuchen",
			"delivery.refresh": "Aktualisieren",
			"delivery.loadMore": "Mehr laden",
			"delivery.expand": "Ausklappen",
			"delivery.collapse": "Einklappen",
			"delivery.pruned": "Frühere Lieferaufzeichnungen wurden gelöscht",
			"delivery.retention": "Aufbewahrungsregeln",
			"delivery.retentionBounds": "Jede Aufgabe verwaltet bis zu {records}-Lieferaufzeichnungen der letzten {days}-Tage.",
			"delivery.retentionExplanation": "Wenn ein neuer Datensatz gespeichert wird, werden ältere Datensätze außerhalb dieser Grenzen automatisch gelöscht. Durch das Löschen von Datensätzen wird die Aufgabe nicht gestoppt.",
			"detail.name": "Name der Automatisierungsaufgabe",
			"detail.instruction": "Anleitung zur Automatisierungsaufgabe",
			"detail.status": "Status",
			"detail.next": "Nächste geplante Zeit",
			"detail.frequency": "Häufigkeit",
			"detail.id": "Aufgaben-ID",
			"detail.session": "Verknüpfte Sitzung",
			"detail.openSession": "Verknüpfte Sitzung: Originalsitzung öffnen",
			"detail.openSessionTitle": "Verknüpfte Sitzung {title}: Originalsitzung öffnen",
			"detail.sessionLoading": "Laden der ursprünglichen Sitzungsinformationen.",
			"detail.sessionArchived": "Die ursprüngliche Sitzung wird archiviert.",
			"detail.sessionUnavailable": "Die ursprüngliche Sitzung ist nicht verfügbar.",
			"detail.missing": "Aufgabe nicht verfügbar. Möglicherweise wurde es gelöscht.",
			"delivery.label": "Lieferdatensatz gespeichert",
			"frequency.once": "Einmal",
			"frequency.every": "Jeder {value} {unit}",
			...frequencyDe,
			"timing.date": "Datum",
			"timing.time": "Zeit",
			"timing.hour": "Stunde",
			"timing.minute": "Minute",
			"timing.second": "Sekunde",
			"timing.prevMonth": "Vorheriger Monat",
			"timing.nextMonth": "Nächsten Monat",
			"timing.zone": "Zeitzone",
			"timing.zoneSearch": "Suche nach UTC-Offset, IANA-ID oder Stadt",
			"timing.zoneNoResults": "Keine passenden Zeitzonen",
			"timing.interval": "Wiederholen Sie alle",
			"timing.intervalIncrease": "Intervall erhöhen",
			"timing.intervalDecrease": "Intervall verringern",
			"timing.unit.hour": "Stunden",
			"timing.unit.minute": "Minuten",
			"timing.unit.second": "Sekunden",
			"timing.intervalHint.hour": "Mindestens 1 Stunde. Das Intervall zählt ab der Aufgabenerstellung oder der letzten Regeländerung und ist unabhängig von Zeitzonen.",
			"timing.intervalHint.minute": "Mindestens 1 Minute. Das Intervall zählt ab der Aufgabenerstellung oder der letzten Regeländerung und ist unabhängig von Zeitzonen.",
			"timing.intervalHint.second": "Mindestens 60 Sekunden. Das Intervall zählt ab der Aufgabenerstellung oder der letzten Regeländerung und ist unabhängig von Zeitzonen.",
			"timing.zoneNoStored": "Eine einmalige Aufgabe speichert nur ihren Zielzeitpunkt, keine Zeitzone. Datum und Uhrzeit werden in der gewählten Zeitzone interpretiert.",
			"timing.inactive": "Inaktive Aufgaben sind schreibgeschützt. Ihr Timing kann nicht bearbeitet werden.",
			"timing.conflict": "Diese Aufgabe hat sich während der Bearbeitung geändert. Ihr Entwurf bleibt erhalten. Abbrechen und nach der Aktualisierung erneut öffnen, um die neueste Regel zu bearbeiten.",
			"timing.notFound": "Diese Aufgabe ist nicht mehr verfügbar. Ihr Entwurf bleibt erhalten; Abbrechen, um den Editor zu schließen.",
			"timing.subagentSession": "Diese Sitzung gehört einem Subagenten, der niemals zugestellte Erinnerungen erhält.",
			"timing.invalid": "Geben Sie ein gültiges Datum und eine gültige Uhrzeit ein oder überprüfen Sie die Zeitfelder.",
			"timing.invalidZone": "Geben Sie eine gültige IANA-Zeitzone ein, zum Beispiel Asien/Shanghai.",
			"timing.notFuture": "Wählen Sie ein Datum und eine Uhrzeit in der Zukunft.",
			"timing.invalidInterval": "Geben Sie ein Intervall von mindestens 1 Minute ein.",
			"timing.invalidInterval.hour": "Geben Sie ein Intervall von mindestens 1 Stunde ein.",
			"timing.invalidInterval.minute": "Geben Sie ein Intervall von mindestens 1 Minute ein.",
			"timing.invalidInterval.second": "Geben Sie ein Intervall von mindestens 60 Sekunden ein.",
			"timing.error": "Das Timing-Update konnte nicht bestätigt werden. Ihr Entwurf bleibt erhalten. Überprüfen Sie die Aufgabe, bevor Sie es erneut versuchen.",
			"rule.title": "Laufzeit",
			"rule.repeat": "Wiederholen",
			"rule.weekday": "Wochentag",
			"rule.weekdayOption": "Wochentag {weekday}",
			"rule.unsaved": "Nicht gespeicherte Änderungen",
			"rule.save": "Änderungen speichern",
			"rule.saving": "Speichern…",
			"rule.cancel": "Abbrechen",
			"rule.invalidTitle": "Geben Sie einen Aufgabennamen mit maximal 120 Zeichen ein.",
			"rule.invalidPrompt": "Geben Sie eine Aufgabenanweisung ein.",
			"rule.once": "Einmal",
			"rule.everyMinutes": "Alle N Minuten",
			"rule.everyHours": "Alle N Stunden",
			"rule.everySeconds": "Alle N Sekunden",
			"rule.daily": "Jeden Tag",
			"rule.weekdays": "Montag bis Freitag",
			"rule.weekly": "Wöchentlich",
			"rule.cron": "Benutzerdefiniert",
			"rule.cronLabel": "Cron-Ausdruck",
			"rule.cronInvalid": "Geben Sie einen Cron-Ausdruck mit fünf Feldern ein, zum Beispiel 0 9 * * 1-5.",
			"cronForm.frequency": "Häufigkeit",
			"cronForm.monthly": "Monatlich",
			"cronForm.weekly": "Wöchentlich",
			"cronForm.daily": "Jeden Tag",
			"cronForm.dates": "An Terminen",
			"cronForm.dateOption": "Tag {day}",
			"cronForm.atMinute": "Im Moment",
			"cronForm.minuteIncrease": "Minute erhöhen",
			"cronForm.minuteDecrease": "Minute verringern",
			"rule.zone.system": " (System)",
			"rule.error.conflict": "Diese Aufgabe wurde vor dem Speichern des Updates geändert. Die Zeile zeigt die gespeicherte Regel; versuchen Sie es erneut.",
			"rule.error.notFound": "Diese Aufgabe ist nicht mehr verfügbar.",
			"rule.error.unknown": "Die Regelaktualisierung konnte nicht bestätigt werden. Die Zeile zeigt die gespeicherte Regel.",
			"delete.action": "Aufgabe löschen",
			"delete.title": "Diese Aufgabe löschen?",
			"delete.description": "Dadurch wird verhindert, dass die Aufgabe ausgelöst wird, und sie wird zusammen mit den gespeicherten Lieferdatensätzen gelöscht. Die ursprüngliche Sitzung und ihre Nachrichten bleiben erhalten; Nachrichten in der Warteschlange werden nicht zurückgezogen.",
			"delete.confirm": "Bestätigen Sie den Löschvorgang",
			"delete.cancel": "Abbrechen",
			"delete.close": "Löschbestätigung schließen",
			"delete.pending": "Löschen…",
			"list.more": "Weitere Aufgabenaktionen",
			"clear.action": "Alle inaktiven Aufgaben löschen",
			"clear.title": "Inaktive Aufgaben löschen ({count})?",
			"clear.description": "Diese Aufgaben und ihre gespeicherten Lieferdatensätze werden dauerhaft gelöscht. Aktivierte Aufgaben, ursprüngliche Sitzungen und Nachrichten in der Warteschlange sind nicht betroffen.",
			"clear.confirm": "Aufgaben löschen",
			"clear.pending": "Wird gelöscht…",
			"clear.close": "Löschbestätigung schließen",
			"toast.cleared.one": "{count} inaktive Aufgabe gelöscht.",
			"toast.cleared.other": "{count} inaktive Aufgaben gelöscht.",
			"toast.clearedNone": "Keine inaktiven Aufgaben zum Löschen.",
			"toast.clearFailed": "Aufgaben konnten nicht gelöscht werden.",
			"toast.deleted": "Aufgabe gelöscht.",
			"toast.deleteFailed": "Die Aufgabe konnte nicht gelöscht werden.",
			"card.open": "Öffnen",
			"card.openLabel": "Aufgabendetails öffnen: {title}",
			"card.deleted": "Gelöscht",
			"tool.invoked": "{name} aufgerufen"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"panel": "Задачи автоматизации",
			"title": "Задачи автоматизации",
			"new.action": "Новый",
			"list.label": "Каталог задач",
			"list.nextPrefix": "Следующее запланированное время: ",
			"list.loading": "Загрузка задач…",
			"list.error": "Не удалось загрузить задачи.",
			"list.retry": "Повторить",
			"list.empty": "Заданий пока нет. Здесь отображаются задачи, созданные в ваших сеансах.",
			"list.emptyInactive": "Нет неактивных задач автоматизации",
			"list.noMatches": "Нет подходящих задач",
			"search.label": "Поиск задач",
			"search.placeholder": "Задачи автоматизации поиска",
			"search.clear": "Очистить поиск",
			"empty.action": "Новая задача автоматизации",
			"statusFilter.label": "Статус задачи",
			"statusFilter.all": "Все",
			"status.active": "Включено",
			"status.inactive": "Неактивный",
			"detail.label": "Подробности задачи",
			"detail.close": "Закрыть детали",
			"detail.more": "Действия задачи автоматизации",
			"detail.nextRun": "Следующий запуск",
			"detail.tabs": "Просмотр сведений о задаче",
			"detail.rule": "Правила",
			"detail.records": "Рекорды",
			"delivery.empty": "Нет записи о доставке",
			"delivery.loading": "Загрузка записей о доставке…",
			"delivery.error": "Не удалось загрузить записи о доставке.",
			"delivery.notFound": "Эта задача больше не доступна.",
			"delivery.cursorError": "Записи обновлены.",
			"delivery.retry": "Повторить",
			"delivery.refresh": "Обновить",
			"delivery.loadMore": "Загрузить больше",
			"delivery.expand": "Развернуть",
			"delivery.collapse": "Свернуть",
			"delivery.pruned": "Записи о предыдущих поставках удалены.",
			"delivery.retention": "Правила хранения",
			"delivery.retentionBounds": "Каждая задача сохраняет записи о доставке до {records} за последние дни {days}.",
			"delivery.retentionExplanation": "При сохранении новой записи более старые записи, выходящие за эти пределы, автоматически удаляются. Очистка записей не останавливает выполнение задачи.",
			"detail.name": "Название задачи автоматизации",
			"detail.instruction": "Инструкция по задаче автоматизации",
			"detail.status": "Статус",
			"detail.next": "Следующее запланированное время",
			"detail.frequency": "Частота",
			"detail.id": "Идентификатор задачи",
			"detail.session": "Связанный сеанс",
			"detail.openSession": "Связанный сеанс: открыть исходный сеанс.",
			"detail.openSessionTitle": "Связанный сеанс {title}: открыть исходный сеанс.",
			"detail.sessionLoading": "Загрузка исходной информации о сеансе.",
			"detail.sessionArchived": "Исходный сеанс архивируется.",
			"detail.sessionUnavailable": "Исходный сеанс недоступен.",
			"detail.missing": "Задача недоступна. Возможно, оно было удалено.",
			"delivery.label": "Сохраненная запись о доставке",
			"frequency.once": "Однажды",
			"frequency.every": "Каждый {value} {unit}",
			...frequencyRu,
			"timing.date": "Дата",
			"timing.time": "Время",
			"timing.hour": "Час",
			"timing.minute": "минута",
			"timing.second": "Секунда",
			"timing.prevMonth": "Предыдущий месяц",
			"timing.nextMonth": "В следующем месяце",
			"timing.zone": "Часовой пояс",
			"timing.zoneSearch": "Поиск по смещению UTC, идентификатору IANA или городу.",
			"timing.zoneNoResults": "Нет подходящих часовых поясов",
			"timing.interval": "Повторяйте каждые",
			"timing.intervalIncrease": "Увеличить интервал",
			"timing.intervalDecrease": "Уменьшить интервал",
			"timing.unit.hour": "часы",
			"timing.unit.minute": "минуты",
			"timing.unit.second": "секунды",
			"timing.intervalHint.hour": "Минимум 1 час. Интервал отсчитывается с момента создания задачи или последнего изменения правила и не зависит от часовых поясов.",
			"timing.intervalHint.minute": "Минимум 1 минута. Интервал отсчитывается с момента создания задачи или последнего изменения правила и не зависит от часовых поясов.",
			"timing.intervalHint.second": "Минимум 60 секунд. Интервал отсчитывается с момента создания задачи или последнего изменения правила и не зависит от часовых поясов.",
			"timing.zoneNoStored": "Одноразовая задача сохраняет только целевой момент, а не часовой пояс. Дата и время интерпретируются в выбранном часовом поясе.",
			"timing.inactive": "Неактивные задачи доступны только для чтения. Их время не может быть отредактировано.",
			"timing.conflict": "Эта задача изменилась во время редактирования. Ваш черновик сохранен. Отмените и снова откройте после обновления, чтобы изменить последнее правило.",
			"timing.notFound": "Эта задача больше не доступна. Ваш черновик сохраняется; отмените, чтобы закрыть редактор.",
			"timing.subagentSession": "Этот сеанс принадлежит субагенту, который никогда не получает напоминания.",
			"timing.invalid": "Введите действительные дату и время или проверьте поля времени.",
			"timing.invalidZone": "Введите действительный часовой пояс IANA, например Азия/Шанхай.",
			"timing.notFuture": "Выберите дату и время в будущем.",
			"timing.invalidInterval": "Введите интервал не менее 1 минуты.",
			"timing.invalidInterval.hour": "Введите интервал не менее 1 часа.",
			"timing.invalidInterval.minute": "Введите интервал не менее 1 минуты.",
			"timing.invalidInterval.second": "Введите интервал не менее 60 секунд.",
			"timing.error": "Не удалось подтвердить обновление времени. Ваш черновик сохранен. Проверьте задачу, прежде чем повторить попытку.",
			"rule.title": "Время выполнения",
			"rule.repeat": "Повторить",
			"rule.weekday": "Будний день",
			"rule.weekdayOption": "День недели {weekday}",
			"rule.unsaved": "Несохраненные изменения",
			"rule.save": "Сохранить изменения",
			"rule.saving": "Сохранение…",
			"rule.cancel": "Отмена",
			"rule.invalidTitle": "Введите имя задачи длиной не более 120 символов.",
			"rule.invalidPrompt": "Введите инструкцию задачи.",
			"rule.once": "Однажды",
			"rule.everyMinutes": "Каждые N минут",
			"rule.everyHours": "Каждые N часов",
			"rule.everySeconds": "Каждые N секунд",
			"rule.daily": "Каждый день",
			"rule.weekdays": "С понедельника по пятницу",
			"rule.weekly": "Еженедельно",
			"rule.cron": "Пользовательский",
			"rule.cronLabel": "Выражение Cron",
			"rule.cronInvalid": "Введите выражение cron из пяти полей, например 0 9 * * 1-5.",
			"cronForm.frequency": "Частота",
			"cronForm.monthly": "Ежемесячно",
			"cronForm.weekly": "Еженедельно",
			"cronForm.daily": "Каждый день",
			"cronForm.dates": "По датам",
			"cronForm.dateOption": "День {day}",
			"cronForm.atMinute": "В минуту",
			"cronForm.minuteIncrease": "Увеличить минуту",
			"cronForm.minuteDecrease": "Уменьшить минуту",
			"rule.zone.system": " (система)",
			"rule.error.conflict": "Эта задача изменилась до сохранения обновления. В строке отображается сохраненное правило; Попробуйте еще раз.",
			"rule.error.notFound": "Эта задача больше не доступна.",
			"rule.error.unknown": "Не удалось подтвердить обновление правила. В строке отображается сохраненное правило.",
			"delete.action": "Удалить задачу",
			"delete.title": "Удалить эту задачу?",
			"delete.description": "Это останавливает запуск задачи и удаляет ее вместе с сохраненными записями о доставке. Исходный сеанс и его сообщения остаются; сообщения в очереди не изымаются.",
			"delete.confirm": "Подтвердить удаление",
			"delete.cancel": "Отмена",
			"delete.close": "Закрыть подтверждение удаления",
			"delete.pending": "Удаление…",
			"list.more": "Другие действия с задачами",
			"clear.action": "Удалить все неактивные задачи",
			"clear.title": "Удалить неактивные задачи ({count})?",
			"clear.description": "Эти задачи и сохранённые записи доставки будут удалены безвозвратно. Включённые задачи, исходные сеансы и сообщения в очереди не затрагиваются.",
			"clear.confirm": "Удалить задачи",
			"clear.pending": "Удаление…",
			"clear.close": "Закрыть подтверждение удаления",
			"toast.cleared.one": "Удалено неактивных задач: {count}.",
			"toast.cleared.other": "Удалено неактивных задач: {count}.",
			"toast.clearedNone": "Нет неактивных задач для удаления.",
			"toast.clearFailed": "Не удалось удалить задачи.",
			"toast.deleted": "Задача удалена.",
			"toast.deleteFailed": "Не удалось удалить задачу.",
			"card.open": "Открыть",
			"card.openLabel": "Открыть сведения о задаче: {title}.",
			"card.deleted": "Удалено",
			"tool.invoked": "Вызван {name}"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"panel": "Tarefas de automação",
			"title": "Tarefas de automação",
			"new.action": "Novo",
			"list.label": "Catálogo de tarefas",
			"list.nextPrefix": "Próximo horário agendado: ",
			"list.loading": "Carregando tarefas…",
			"list.error": "Não foi possível carregar tarefas.",
			"list.retry": "Tentar novamente",
			"list.empty": "Nenhuma tarefa ainda. As tarefas criadas nas suas sessões aparecem aqui.",
			"list.emptyInactive": "Nenhuma tarefa de automação inativa",
			"list.noMatches": "Nenhuma tarefa correspondente",
			"search.label": "Tarefas de pesquisa",
			"search.placeholder": "Tarefas de automação de pesquisa",
			"search.clear": "Limpar pesquisa",
			"empty.action": "Nova tarefa de automação",
			"statusFilter.label": "Status da tarefa",
			"statusFilter.all": "Todos",
			"status.active": "Habilitado",
			"status.inactive": "Inativo",
			"detail.label": "Detalhes da tarefa",
			"detail.close": "Fechar detalhes",
			"detail.more": "Ações de tarefas de automação",
			"detail.nextRun": "Próxima execução",
			"detail.tabs": "Visualizações de detalhes da tarefa",
			"detail.rule": "Regras",
			"detail.records": "Registros",
			"delivery.empty": "Nenhum registro de entrega disponível",
			"delivery.loading": "Carregando registros de entrega…",
			"delivery.error": "Não foi possível carregar os registros de entrega.",
			"delivery.notFound": "Esta tarefa não está mais disponível.",
			"delivery.cursorError": "Os registros foram atualizados.",
			"delivery.retry": "Tentar novamente",
			"delivery.refresh": "Atualizar",
			"delivery.loadMore": "Carregar mais",
			"delivery.expand": "Expandir",
			"delivery.collapse": "Recolher",
			"delivery.pruned": "Registros de entrega anteriores foram apagados",
			"delivery.retention": "Regras de retenção",
			"delivery.retentionBounds": "Cada tarefa mantém até {records} registros de entrega dos últimos {days} dias.",
			"delivery.retentionExplanation": "Quando um novo registro é salvo, os registros mais antigos fora desses limites são apagados automaticamente. A limpeza de registros não interrompe a tarefa.",
			"detail.name": "Nome da tarefa de automação",
			"detail.instruction": "Instrução de tarefa de automação",
			"detail.status": "Estado",
			"detail.next": "Próximo horário agendado",
			"detail.frequency": "Frequência",
			"detail.id": "ID da tarefa",
			"detail.session": "Sessão vinculada",
			"detail.openSession": "Sessão vinculada: sessão original aberta",
			"detail.openSessionTitle": "Sessão vinculada {title}: sessão original aberta",
			"detail.sessionLoading": "Carregando informações originais da sessão.",
			"detail.sessionArchived": "A sessão original é arquivada.",
			"detail.sessionUnavailable": "A sessão original não está disponível.",
			"detail.missing": "Tarefa indisponível. Pode ter sido excluído.",
			"delivery.label": "Registro de entrega salvo",
			"frequency.once": "Uma vez",
			"frequency.every": "A cada {value} {unit}",
			...frequencyPt,
			"timing.date": "Data",
			"timing.time": "Hora",
			"timing.hour": "Hora",
			"timing.minute": "Minuto",
			"timing.second": "Segundo",
			"timing.prevMonth": "Mês anterior",
			"timing.nextMonth": "No próximo mês",
			"timing.zone": "Fuso horário",
			"timing.zoneSearch": "Pesquise por deslocamento UTC, ID IANA ou cidade",
			"timing.zoneNoResults": "Nenhum fuso horário correspondente",
			"timing.interval": "Repita cada",
			"timing.intervalIncrease": "Aumentar intervalo",
			"timing.intervalDecrease": "Diminuir intervalo",
			"timing.unit.hour": "horas",
			"timing.unit.minute": "minutos",
			"timing.unit.second": "segundos",
			"timing.intervalHint.hour": "Pelo menos 1 hora. O intervalo conta a partir da criação da tarefa ou da última alteração de regra e é independente dos fusos horários.",
			"timing.intervalHint.minute": "Pelo menos 1 minuto. O intervalo conta a partir da criação da tarefa ou da última alteração de regra e é independente dos fusos horários.",
			"timing.intervalHint.second": "Pelo menos 60 segundos. O intervalo conta a partir da criação da tarefa ou da última alteração de regra e é independente dos fusos horários.",
			"timing.zoneNoStored": "Uma tarefa única armazena apenas o momento alvo, não um fuso horário. A data e a hora são interpretadas no fuso horário selecionado.",
			"timing.inactive": "As tarefas inativas são somente leitura. O tempo deles não pode ser editado.",
			"timing.conflict": "Esta tarefa mudou enquanto você estava editando. Seu rascunho foi mantido. Cancele e reabra após a atualização para editar a regra mais recente.",
			"timing.notFound": "Esta tarefa não está mais disponível. Seu rascunho foi retido; cancelar para fechar o editor.",
			"timing.subagentSession": "Esta sessão pertence a um subagente, que nunca recebe lembretes entregues.",
			"timing.invalid": "Insira uma data e hora válidas ou verifique os campos de horário.",
			"timing.invalidZone": "Insira um fuso horário IANA válido, por exemplo Ásia/Xangai.",
			"timing.notFuture": "Escolha uma data e hora no futuro.",
			"timing.invalidInterval": "Insira um intervalo de pelo menos 1 minuto.",
			"timing.invalidInterval.hour": "Insira um intervalo de pelo menos 1 hora.",
			"timing.invalidInterval.minute": "Insira um intervalo de pelo menos 1 minuto.",
			"timing.invalidInterval.second": "Insira um intervalo de pelo menos 60 segundos.",
			"timing.error": "Não foi possível confirmar a atualização de tempo. Seu rascunho foi mantido. Verifique a tarefa antes de tentar novamente.",
			"rule.title": "Tempo de execução",
			"rule.repeat": "Repetir",
			"rule.weekday": "Dia da semana",
			"rule.weekdayOption": "Dia da semana {weekday}",
			"rule.unsaved": "Alterações não salvas",
			"rule.save": "Salvar alterações",
			"rule.saving": "Salvando…",
			"rule.cancel": "Cancelar",
			"rule.invalidTitle": "Insira um nome de tarefa com no máximo 120 caracteres.",
			"rule.invalidPrompt": "Insira uma instrução de tarefa.",
			"rule.once": "Uma vez",
			"rule.everyMinutes": "A cada N minutos",
			"rule.everyHours": "A cada N horas",
			"rule.everySeconds": "A cada N segundos",
			"rule.daily": "Todos os dias",
			"rule.weekdays": "Segunda a sexta",
			"rule.weekly": "Semanalmente",
			"rule.cron": "Personalizado",
			"rule.cronLabel": "Expressão Cron",
			"rule.cronInvalid": "Insira uma expressão cron de cinco campos, por exemplo 0 9 * * 1-5.",
			"cronForm.frequency": "Frequência",
			"cronForm.monthly": "Mensalmente",
			"cronForm.weekly": "Semanalmente",
			"cronForm.daily": "Todos os dias",
			"cronForm.dates": "Em datas",
			"cronForm.dateOption": "Dia {day}",
			"cronForm.atMinute": "No minuto",
			"cronForm.minuteIncrease": "Aumentar minuto",
			"cronForm.minuteDecrease": "Diminuir minuto",
			"rule.zone.system": " (sistema)",
			"rule.error.conflict": "Esta tarefa foi alterada antes da atualização ser salva. A linha mostra a regra salva; tente novamente.",
			"rule.error.notFound": "Esta tarefa não está mais disponível.",
			"rule.error.unknown": "Não foi possível confirmar a atualização da regra. A linha mostra a regra salva.",
			"delete.action": "Excluir tarefa",
			"delete.title": "Excluir esta tarefa?",
			"delete.description": "Isso interrompe o acionamento da tarefa e a exclui junto com seus registros de entrega salvos. A sessão original e suas mensagens permanecem; mensagens enfileiradas não são retiradas.",
			"delete.confirm": "Confirmar exclusão",
			"delete.cancel": "Cancelar",
			"delete.close": "Fechar confirmação de exclusão",
			"delete.pending": "Excluindo…",
			"list.more": "Mais ações de tarefas",
			"clear.action": "Limpar todas as tarefas inativas",
			"clear.title": "Limpar as tarefas inativas ({count})?",
			"clear.description": "Estas tarefas e seus registros de entrega salvos serão excluídos permanentemente. As tarefas habilitadas, as sessões originais e as mensagens na fila não serão afetadas.",
			"clear.confirm": "Limpar tarefas",
			"clear.pending": "Limpando…",
			"clear.close": "Fechar confirmação de limpeza",
			"toast.cleared.one": "{count} tarefa inativa limpa.",
			"toast.cleared.other": "{count} tarefas inativas limpas.",
			"toast.clearedNone": "Não há tarefas inativas para limpar.",
			"toast.clearFailed": "Não foi possível limpar as tarefas.",
			"toast.deleted": "Tarefa excluída.",
			"toast.deleteFailed": "Não foi possível excluir a tarefa.",
			"card.open": "Abrir",
			"card.openLabel": "Detalhes da tarefa aberta: {title}",
			"card.deleted": "Excluído",
			"tool.invoked": "Invocado {name}"
		};
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Browser catalogs for retained Host tasks and the selected Session's active
		* reminders, plus the right-Sidebar page that shows one task's detail.
		*
		* The page type reaches the Sidebar through its public path only: the
		* definition into `ctx.sidebarRightTabs`, the body into the keyed
		* `sidebar.right.pane.tab` seat, and the chip title into
		* `sidebar.right.pane.tab.title`, both under the definition's `id`. Because the
		* Sidebar persists a tab's layout record and not the parameters its opener
		* passed, the page also owns a binding from each tab page to the task it last
		* showed, which its body and chip read back after a reload. The Session
		* header entry and the task tab share one Host catalog source, so opening or
		* deleting from either view reads and refreshes the same records.
		*
		* The created task of a `schedule_create` call renders at Turn level: a Turn
		* Definition publishes the settled result against its Turn, and ui-chat's
		* `conversation.chat.turnTail` list seat renders the card beneath
		* the closing prose, outside the collapsible Tool group, opening the same
		* right-Sidebar detail the header entry opens. The call's Tool-group cell
		* stays with ui-tool's generic keyed tool view, so this package registers no
		* `tool.call.toolview` entry for the wire name.
		*
		* Two ambient surfaces read the ONE Host catalog the page owns: ui-workspace's
		* `sidebar.session.row.leading` seat marks an idle row whose Session has an
		* active task, and its `sidebar.session.row.hover` seat lists those tasks
		* inside the row's hover card. Both project the same source, so N visible rows
		* issue one query rather than one per row. The header entry keeps its own
		* per-Session source.
		*/
		const MANAGER_NS = "schedule.manager";
		const PANEL_ID = "schedules";
		/** Required services for catalogs, ambient Session marks, the right Sidebar, Remote queries, original-Session navigation, and access. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.schedule",
			"conversation",
			"uiConversation",
			"uiWorkspace",
			"sessions",
			"workspaces",
			"sidebarRightTabs",
			"sidebarRight",
			"remoteAccess"
		];
		/**
		* Register the Host task page, the Session-header reminder catalog, the
		* right-Sidebar page that shows one task's detail, and the transcript card of
		* one created task while the current Peer may read the task catalog.
		* @param ctx - browser services used by these contributions.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh: zh$1,
				en: en$1,
				ja: ja$1,
				es: es$1,
				fr: fr$1,
				de: de$1,
				ru: ru$1,
				pt: pt$1
			}), "ui-schedule: dictionaries");
			const managerDictionaries = {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			};
			ctx.effect(() => ctx.locale.register(MANAGER_NS, managerDictionaries), "ui-schedule: manager dictionaries");
			const t = ctx.locale.bind(MANAGER_NS);
			ctx.effect(() => ctx.sidebarRightTabs.register(scheduleTaskDefinition(t)), "ui-schedule: task tab type");
			ctx.uiConversation.events.register(scheduleTurnDefinition);
			ctx.remoteAccess.whenAccess("schedule/catalog", function* () {
				const manager = createCatalogSource({
					list: () => ctx.remote.schedule.catalog(),
					remove: async (id) => {
						const record = manager.hooks.catalog.getSnapshot().records.find((item) => item.id === id);
						if (record === void 0) return {
							ok: true,
							value: {
								id,
								deleted: false,
								code: "schedule_not_found"
							}
						};
						return ctx.remote.schedule.delete({
							sessionId: record.sessionId,
							id
						});
					},
					subscribeChanged: (listener) => ctx.remote.$on("schedule/changed", listener),
					subscribeReset: (listener) => ctx.on("connection/reset", listener)
				});
				const deleteToast = createDeleteToastSource();
				const reportedDelete = (onDelete) => async (id) => {
					const outcome = await onDelete(id);
					deleteToast.report(outcome);
					return outcome;
				};
				yield ctx.slots.inject("shell.overlay", () => ctx.slots.register({
					name: "shell.overlay",
					id: "schedule.delete-toast",
					locale: MANAGER_NS,
					inject: () => ({
						hooks: deleteToast.hooks,
						dismiss: deleteToast.dismiss
					})
				}, ScheduleDeleteToast));
				/**
				* Forward one compare-and-update request, which may replace the task name,
				* the instruction, and/or the timing, and refresh the authoritative catalog
				* after an accepted or stale outcome.
				* @param request - complete expected record with the optional content and timing change.
				* @returns the original Remote mutation result.
				*/
				const updateTask = async (request) => {
					const result = await ctx.remote.schedule.update(request);
					if (result.ok && ("record" in result.value || result.value.code === "schedule_conflict" || result.value.code === "schedule_ended" || result.value.code === "schedule_not_found")) await manager.onRetry(manager.hooks.catalog.getSnapshot().readRequest);
					return result;
				};
				const loadHistory = (request) => ctx.remote.schedule.history(request);
				const openSession = (id) => {
					if (sessionLinkState(id, ctx.sessions.list.getSnapshot(), ctx.workspaces.list.getSnapshot()) === "available") ctx.uiWorkspace.openSession(id);
				};
				/**
				* Remove every ended Host task and read the catalog back.
				*
				* The readback names every request seen so far, so it supersedes a read sent
				* before the removal instead of joining it.
				* @returns the settled bulk-removal outcome.
				*/
				const clearEnded = createClearEnded({
					removeInactive: () => ctx.remote.schedule.deleteInactive(),
					refresh: () => manager.onRetry(manager.hooks.catalog.getSnapshot().readRequest)
				});
				const detail = {
					hooks: manager.hooks,
					onDelete: reportedDelete(manager.onDelete),
					onRetry: manager.onRetry,
					onUpdateTiming: updateTask,
					loadHistory,
					onOpenSession: openSession
				};
				const taskBindings = new TaskTabBindings((sessionId) => ctx.sidebarRight.tabsIn(sessionId).map((tab) => tab.id));
				yield ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
					name: "sidebar.right.pane.tab",
					key: SCHEDULE_TASK_ID,
					locale: MANAGER_NS,
					inject: () => ({
						...detail,
						taskBindings
					})
				}, ScheduleTaskTab));
				yield ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({
					name: "sidebar.right.pane.tab.title",
					key: SCHEDULE_TASK_ID,
					locale: MANAGER_NS,
					inject: () => ({
						hooks: detail.hooks,
						taskBindings
					})
				}, ScheduleTaskTabTitle));
				yield ctx.slots.inject("main", () => ctx.slots.register({
					name: "main",
					key: PANEL_ID,
					locale: MANAGER_NS,
					inject: () => ({
						...detail,
						onNewTask: () => {
							ctx.uiWorkspace.startSession();
						},
						onClearEnded: async () => {
							const outcome = await clearEnded();
							deleteToast.reportClear(outcome);
						}
					})
				}, TaskManagerPage));
				yield ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
					name: "sidebar.panellist",
					id: PANEL_ID,
					order: 10,
					locale: MANAGER_NS,
					label: () => t("panel")
				}, TaskManagerIcon));
				yield ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
					name: "conversation.chat.turnTail",
					id: "schedule-created",
					order: 20,
					locale: MANAGER_NS,
					inject: (sessionId) => ({
						hooks: { catalog: manager.hooks.catalog },
						onRetry: manager.onRetry,
						openTaskDetail: (id) => {
							ctx.sidebarRight.openTab(SCHEDULE_TASK_KIND, { params: {
								sessionId,
								id
							} });
						}
					})
				}, ScheduleTurnCard));
				const createSource = (sessionId) => createSessionScheduleSource(ctx, sessionId);
				yield ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
					name: "conversation.session.header.utilities",
					id: "schedule-catalog",
					order: -5,
					locale: NS,
					inject: (sessionId) => {
						const source = createSource(sessionId);
						return {
							...source,
							onDelete: reportedDelete(source.onDelete),
							openTaskDetail: (id) => {
								ctx.sidebarRight.openTab(SCHEDULE_TASK_KIND, { params: {
									sessionId,
									id
								} });
							}
						};
					}
				}, ScheduleCatalogAction));
				yield ctx.slots.inject("sidebar.session.row.leading", () => ctx.slots.register({
					name: "sidebar.session.row.leading",
					id: "schedule-mark",
					order: 10,
					locale: NS,
					inject: () => ({ hooks: { catalog: manager.hooks.catalog } })
				}, SessionScheduleMark));
				yield ctx.slots.inject("sidebar.session.row.hover", () => ctx.slots.register({
					name: "sidebar.session.row.hover",
					id: "schedule-tasks",
					order: 10,
					locale: NS,
					inject: () => ({ hooks: { catalog: manager.hooks.catalog } })
				}, SessionScheduleHover));
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map