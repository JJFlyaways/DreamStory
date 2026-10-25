window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-session",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let _deepseek_ai_dsh_client_ui_slots = require("@deepseek-ai/dsh-client-ui-slots");
		let react_jsx_runtime = require("react/jsx-runtime");
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
		(class PartialArguments {
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
		});
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
		/**
		* Weak-key lookup with a strongly retained iterable set of associated values.
		*
		* Each value must belong to only one key. The container performs no automatic
		* cleanup; owners delete associations or clear the container at lifecycle end.
		*/
		var WeakMapWithValues = class {
			keys = /* @__PURE__ */ new WeakMap();
			valueSet = /* @__PURE__ */ new Set();
			/** Live strongly retained values in insertion order. */
			values = this.valueSet;
			/**
			* Read the value associated with a key.
			* @param key - weakly held lookup key.
			* @returns the associated value, or absence.
			*/
			get(key) {
				return this.keys.get(key);
			}
			/**
			* Test whether a key has an association.
			* @param key - weakly held lookup key.
			* @returns whether the key is present.
			*/
			has(key) {
				return this.keys.has(key);
			}
			/**
			* Associate one key with one caller-unique value.
			* @param key - weakly held lookup key.
			* @param value - strongly retained value that belongs to no other key.
			* @returns this container.
			*/
			set(key, value) {
				if (this.keys.has(key)) {
					const previous = this.keys.get(key);
					if (previous === value) return this;
					this.valueSet.delete(previous);
				}
				this.keys.set(key, value);
				this.valueSet.add(value);
				return this;
			}
			/**
			* Remove one association and its strongly retained value.
			* @param key - weakly held lookup key.
			* @returns whether an association was removed.
			*/
			delete(key) {
				if (!this.keys.has(key)) return false;
				const value = this.keys.get(key);
				const deleted = this.keys.delete(key);
				this.valueSet.delete(value);
				return deleted;
			}
			/** Remove every association and strongly retained value. */
			clear() {
				this.keys = /* @__PURE__ */ new WeakMap();
				this.valueSet.clear();
			}
		};
		//#endregion
		//#region lib/types/client/session-provider.js
		/**
		* Render the selected Session body or its empty branch.
		* @param binding - current Session scope binding.
		* @param props - standard Session area render props.
		* @returns the selected Session subtree.
		*/
		function renderSessionArea(binding, { empty, children }) {
			if (binding.key === void 0) return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: empty?.() ?? null });
			return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children });
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Session Controller adapter for React selector hooks and Slot scope data. */
		var PendingInteractionDomain = class {
			precedence;
			changed;
			values = /* @__PURE__ */ new Map();
			constructor(precedence, changed) {
				this.precedence = precedence;
				this.changed = changed;
			}
			valuesSnapshot() {
				return [...this.values.values()].map((entry) => entry.interaction);
			}
			publish(interaction, delegate) {
				if (this.values.has(interaction.key)) throw new Error(`ui-session: duplicate pending interaction key '${interaction.key}'`);
				this.values.set(interaction.key, {
					interaction,
					delegate
				});
				this.changed();
				let active = true;
				return () => {
					if (!active) return;
					active = false;
					if (!this.values.delete(interaction.key)) return;
					this.changed();
				};
			}
			/** Remove every pending value and return the operations that settle their owners. */
			release() {
				const delegates = [...this.values.values()].map((entry) => entry.delegate);
				this.values.clear();
				return delegates;
			}
		};
		const BUILTIN_SOURCE = {
			hooks: ["session"],
			keyedHooks: ["projection"],
			props: ["sessionId"],
			resolve: (binding) => ({
				hooks: { session: binding.session },
				keyedHooks: { projection: (key) => binding.session.projections.faceOf(key) },
				props: { sessionId: binding.sessionId }
			})
		};
		/** Session-scoped source roster and renderer adapter. */
		var UiSession = class extends _deepseek_ai_cordis.Service {
			sessions;
			descriptors = [BUILTIN_SOURCE];
			bindings = new WeakMapWithValues();
			absent;
			current;
			pendingDomains = [];
			pendingSnapshot = /* @__PURE__ */ new Map();
			running = /* @__PURE__ */ new Map();
			completionUnread = /* @__PURE__ */ new Set();
			statusSnapshot = /* @__PURE__ */ new Map();
			statusListeners = /* @__PURE__ */ new Set();
			mainRetainId;
			disposeMainRetain = () => {};
			active = true;
			/** Root source combining running, pending-interaction, and completion-reminder facts. */
			sessionStatus = {
				getSnapshot: () => this.statusSnapshot,
				subscribe: (listener) => {
					this.statusListeners.add(listener);
					return () => {
						this.statusListeners.delete(listener);
					};
				}
			};
			/** Renderer-facing adapter for `session` and `session-maybe` scopes. */
			adapter;
			/**
			* @param ctx - Client root context.
			* @param sessions - Controller-owned Session object layer.
			*/
			constructor(ctx, sessions) {
				super(ctx, "uiSession");
				this.sessions = sessions;
				this.absent = createBindingSource(this.materializeAbsent());
				this.current = createBindingSource(this.absent.value);
				this.adapter = {
					current: this.current,
					bindingSource: (target) => this.bindingSource(target),
					renderArea: renderSessionArea
				};
				ctx.effect(() => {
					const disposeList = sessions.list.subscribe(() => {
						this.publishMain();
					});
					const disposeStatus = sessions.list.subscribe(() => {
						this.reconcileStatus();
					});
					const disposeRemoteStatus = ctx.remote.$on("api-session/status", (sessionId, running) => {
						this.observeRunning(sessionId, running);
					});
					this.publishMain();
					this.reconcileStatus();
					return () => {
						this.active = false;
						disposeList();
						disposeStatus();
						disposeRemoteStatus();
						this.disposeMainRetain();
						const records = [...this.bindings.values];
						this.bindings.clear();
						for (const record of records) record.release();
					};
				}, "ui-session: Session binding projection");
			}
			/**
			* Resolve a stable renderer source for an owned Session reference or explicit absence.
			* @param reference - active reference supplied by the Provider owner, or absence.
			* @returns the binding source, which falls back to the absent projection when its generation ends.
			* @throws when the reference does not belong to the active Controller generation.
			*/
			bindingSource(reference) {
				if (!this.active) return this.absent;
				if (reference === void 0) return this.absent;
				const owner = reference.binding;
				if (this.sessions.binding(reference.sessionId) !== owner) throw new Error("ui-session: Session reference is not active in this Controller");
				return this.sourceFor(owner);
			}
			/**
			* Keep `callback`'s effects installed while the current Peer may call
			* `action` on one Session resource, with the semantics of
			* `ctx.remoteAccess.whenAccess`: `useSessionAccess` answers the same
			* question during render.
			* @param sessionId - the Session resource the guarded effects depend on.
			* @param action - endpoint action the guarded effects depend on.
			* @param callback - creates one disposer or an iterable of disposers.
			* @returns idempotent disposer owned by the caller's Cordis fiber.
			*/
			whenAccess(sessionId, action, callback) {
				const access = this.ctx.get("remoteAccess");
				/* v8 ignore next -- this plugin injects remoteAccess, so the service is active while uiSession is reachable. */
				if (access === void 0) throw new Error("ui-session: whenAccess requires the remoteAccess service");
				return access.whenResourceAccess("session", sessionId, action, callback);
			}
			/**
			* Register one Session-scoped standard-source contribution.
			* @param descriptor - static member roster and per-binding resolver.
			* @returns disposer owned by the caller's Cordis fiber.
			*/
			provide(descriptor) {
				const runtimeDescriptor = descriptor;
				const dispose = this.ctx.effect(() => {
					this.descriptors.push(runtimeDescriptor);
					try {
						this.rebuildBindings();
					} catch (error) {
						this.descriptors.pop();
						throw error;
					}
					return () => {
						const index = this.descriptors.indexOf(runtimeDescriptor);
						this.descriptors.splice(index, 1);
						this.rebuildBindings();
					};
				}, "uiSession.provide()");
				return () => {
					dispose();
				};
			}
			/**
			* Register one pending-interaction domain and return its publication function.
			* Domain teardown first removes its visible values, then delegates and awaits
			* every still-active owner request.
			* @param precedence - deterministic cross-domain precedence; larger values win.
			* @returns a function that publishes one interaction and its teardown delegation.
			*/
			registerPendingInteraction(precedence) {
				const domain = new PendingInteractionDomain(precedence, () => {
					this.publishPendingInteractions();
				});
				const runtimeDomain = domain;
				this.ctx.effect(() => {
					this.pendingDomains.push(runtimeDomain);
					this.publishPendingInteractions();
					return async () => {
						const delegates = domain.release();
						const index = this.pendingDomains.indexOf(runtimeDomain);
						this.pendingDomains.splice(index, 1);
						this.publishPendingInteractions();
						await Promise.allSettled(delegates.map((delegate) => Promise.resolve().then(delegate)));
					};
				}, "uiSession.registerPendingInteraction()");
				return (interaction, delegate) => domain.publish(interaction, delegate);
			}
			rebuildBindings() {
				const absent = this.materializeAbsent();
				const updates = [...this.bindings.values].map((record) => ({
					source: record.source,
					value: this.materialize(record.owner)
				}));
				this.absent.value = absent;
				for (const { source, value } of updates) source.value = value;
				(0, _deepseek_ai_dsh_client_store.notifySubscribers)(this.absent.listeners, "[ui-session] absent binding");
				for (const { source } of updates) (0, _deepseek_ai_dsh_client_store.notifySubscribers)(source.listeners, "[ui-session] Session binding");
				this.publishMain();
			}
			sourceFor(owner) {
				const cached = this.bindings.get(owner);
				if (cached !== void 0) return cached.source;
				const record = this.createMaterializedBinding(owner);
				this.bindings.set(owner, record);
				return record.source;
			}
			publishMain() {
				if (!this.active) return;
				const byId = this.sessions.list.getSnapshot().byId;
				const currentId = this.current.value.key;
				const nextId = currentId !== void 0 && (this.sessions.retainInfo(currentId).getSnapshot().retainedBy.mainView ?? 0) > 0 ? currentId : Object.values(byId).find((candidate) => (candidate.retainedBy.mainView ?? 0) > 0)?.id;
				this.watchMainRetention(nextId);
				const owner = nextId === void 0 ? void 0 : this.sessions.binding(nextId);
				const value = owner === void 0 ? this.absent.value : this.sourceFor(owner).value;
				if (this.current.value === value) return;
				this.current.value = value;
				(0, _deepseek_ai_dsh_client_store.notifySubscribers)(this.current.listeners, "[ui-session] main binding");
			}
			watchMainRetention(sessionId) {
				if (sessionId === this.mainRetainId) return;
				this.disposeMainRetain();
				this.mainRetainId = sessionId;
				this.disposeMainRetain = sessionId === void 0 ? () => {} : this.sessions.retainInfo(sessionId).subscribe(() => {
					this.publishMain();
				});
			}
			publishPendingInteractions() {
				const next = /* @__PURE__ */ new Map();
				for (const domain of this.pendingDomains) for (const interaction of domain.valuesSnapshot()) {
					const precedence = domain.precedence(interaction);
					const previous = next.get(interaction.sessionId);
					if (previous === void 0 || precedence >= previous.precedence) next.set(interaction.sessionId, {
						interaction,
						precedence
					});
				}
				const projected = new Map([...next].map(([sessionId, value]) => [sessionId, value.interaction]));
				if (samePendingInteractions(this.pendingSnapshot, projected)) return;
				this.pendingSnapshot = projected;
				this.publishStatus();
			}
			observeRunning(sessionId, running) {
				const previous = this.running.get(sessionId);
				const beforeBaseline = this.sessions.list.getSnapshot().phase === "pending";
				this.running.set(sessionId, running);
				if (running) this.completionUnread.delete(sessionId);
				else if ((previous === true || previous === void 0 && beforeBaseline) && !this.isMain(sessionId)) this.completionUnread.add(sessionId);
				this.publishStatus();
			}
			reconcileStatus() {
				const list = this.sessions.list.getSnapshot();
				const present = new Set(Object.keys(list.byId));
				for (const id of list.ids) {
					const row = list.byId[id];
					const previous = this.running.get(id);
					if (previous === void 0) this.running.set(id, row.running);
					else if (previous !== row.running) this.observeRunning(id, row.running);
				}
				for (const id of present) if (this.isMain(id)) this.completionUnread.delete(id);
				if (list.phase === "ready") for (const id of this.running.keys()) {
					if (present.has(id)) continue;
					this.running.delete(id);
					this.completionUnread.delete(id);
				}
				this.publishStatus();
			}
			isMain(sessionId) {
				return (this.sessions.list.getSnapshot().byId[sessionId]?.retainedBy.mainView ?? 0) > 0;
			}
			publishStatus() {
				const ids = new Set([
					...Object.keys(this.sessions.list.getSnapshot().byId),
					...this.running.keys(),
					...this.pendingSnapshot.keys(),
					...this.completionUnread
				]);
				const next = /* @__PURE__ */ new Map();
				for (const id of ids) next.set(id, {
					running: this.running.get(id),
					pendingInteraction: this.pendingSnapshot.get(id),
					completionUnread: this.completionUnread.has(id)
				});
				if (sameSessionStatus(this.statusSnapshot, next)) return;
				this.statusSnapshot = next;
				(0, _deepseek_ai_dsh_client_store.notifySubscribers)(this.statusListeners, "[ui-session] Session status");
			}
			createMaterializedBinding(owner) {
				const value = this.materialize(owner);
				this.ctx.slots.bindStoreScope(value);
				const source = createBindingSource(value);
				const releaseEffect = owner.ctx.effect(() => () => {
					if (this.bindings.get(owner) === record) this.bindings.delete(owner);
					source.value = this.absent.value;
					(0, _deepseek_ai_dsh_client_store.notifySubscribers)(source.listeners, "[ui-session] Session binding");
					this.publishMain();
				}, `ui-session: binding ${owner.sessionId}`);
				const record = {
					owner,
					source,
					release: () => {
						releaseEffect();
					}
				};
				return record;
			}
			materialize(binding) {
				const hooks = {};
				const keyedHooks = {};
				const props = {};
				const finalProps = /* @__PURE__ */ new Set();
				for (const descriptor of this.descriptors) {
					const contribution = descriptor.resolve(binding);
					validateContribution(descriptor, contribution);
					copyDeclared("hook", hooks, descriptor.hooks, contribution.hooks, finalProps);
					copyDeclared("keyed hook", keyedHooks, descriptor.keyedHooks, contribution.keyedHooks, finalProps);
					copyDeclared("prop", props, descriptor.props, contribution.props, finalProps);
				}
				return {
					key: binding.sessionId,
					ctx: binding.ctx,
					hooks,
					keyedHooks,
					props
				};
			}
			materializeAbsent() {
				const hooks = {};
				const keyedHooks = {};
				const props = {};
				const finalProps = /* @__PURE__ */ new Set();
				for (const descriptor of this.descriptors) {
					declareAbsent("hook", hooks, descriptor.hooks, finalProps);
					declareAbsent("keyed hook", keyedHooks, descriptor.keyedHooks, finalProps);
					declareAbsent("prop", props, descriptor.props, finalProps);
				}
				return {
					key: void 0,
					hooks,
					keyedHooks,
					props
				};
			}
		};
		function createBindingSource(value) {
			const source = {
				value,
				listeners: /* @__PURE__ */ new Set(),
				getSnapshot: () => source.value,
				subscribe: (listener) => {
					source.listeners.add(listener);
					return () => {
						source.listeners.delete(listener);
					};
				}
			};
			return source;
		}
		function validateContribution(descriptor, contribution) {
			rejectUndeclared("hook", descriptor.hooks, contribution.hooks);
			rejectUndeclared("keyed hook", descriptor.keyedHooks, contribution.keyedHooks);
			rejectUndeclared("prop", descriptor.props, contribution.props);
		}
		function rejectUndeclared(kind, declared, values) {
			for (const name of Object.keys(values ?? {})) if (!(declared ?? []).includes(name)) throw new Error(`uiSession.provide: undeclared ${kind} '${name}'`);
		}
		function copyDeclared(kind, target, declared, values, finalProps) {
			for (const name of declared ?? []) {
				claimStandardProp(kind, name, finalProps);
				const value = values?.[name];
				if (value === void 0) throw new Error(`uiSession.provide: missing ${kind} '${name}'`);
				target[name] = value;
			}
		}
		function declareAbsent(kind, target, declared, finalProps) {
			for (const name of declared ?? []) {
				claimStandardProp(kind, name, finalProps);
				target[name] = void 0;
			}
		}
		function claimStandardProp(kind, name, finalProps) {
			const propName = kind === "prop" ? name : (0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name);
			if (finalProps.has(propName)) throw new Error(`uiSession.provide: duplicate ${kind} '${name}' at prop '${propName}'`);
			finalProps.add(propName);
		}
		/** Required Controller, renderer, Remote, and access services. */
		const inject = [
			"sessions",
			"slots",
			"remote",
			"remoteAccess"
		];
		/**
		* Install the Session root source and scoped adapter.
		* @param ctx - Client Cordis context.
		*/
		function apply(ctx) {
			const service = new UiSession(ctx, ctx.sessions);
			ctx.slots.provideRoot({
				hooks: {
					sessions: ctx.sessions.list,
					sessionStatus: service.sessionStatus
				},
				keyedHooks: {
					sessionRetainInfo: (key) => ctx.sessions.retainInfo(key),
					sessionAccess: (sessionId, action) => action === void 0 ? void 0 : ctx.remoteAccess.source("session", sessionId, action)
				}
			});
			ctx.slots.installScope("session", service.adapter);
			service.provide({
				keyedHooks: ["access"],
				resolve: (binding) => ({ keyedHooks: { access: (action) => ctx.remoteAccess.source("session", binding.sessionId, action) } })
			});
		}
		function sameSessionStatus(left, right) {
			if (left.size !== right.size) return false;
			for (const [id, status] of left) {
				const candidate = right.get(id);
				if (candidate === void 0 || candidate.running !== status.running || candidate.pendingInteraction !== status.pendingInteraction || candidate.completionUnread !== status.completionUnread) return false;
			}
			return true;
		}
		function samePendingInteractions(left, right) {
			if (left.size !== right.size) return false;
			for (const [sessionId, interaction] of left) if (right.get(sessionId) !== interaction) return false;
			return true;
		}
		//#endregion
		exports.UiSession = UiSession;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map