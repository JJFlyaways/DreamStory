window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-input-trigger",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react = require("react");
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
		//#region ../../context/file-reference/src/grammar.ts
		/**
		* Extract an `@path` or `@"path with spaces` token at the cursor. An `@`
		* inside another token, such as an email address, is not a completion trigger.
		* @param line - current editor line.
		* @param cursorCol - cursor column within that line.
		* @returns the active token, or `undefined` outside an `@` token.
		*/
		function activeAtToken(line, cursorCol) {
			const beforeCursor = line.slice(0, cursorCol);
			const quoted = /(?:^|\s)(@"([^"]*))$/u.exec(beforeCursor);
			if (quoted?.[1] !== void 0 && quoted[2] !== void 0) return {
				prefix: quoted[1],
				query: quoted[2],
				quoted: true
			};
			const plain = /(?:^|\s)(@([^\s]*))$/u.exec(beforeCursor);
			if (plain?.[1] === void 0 || plain[2] === void 0) return void 0;
			return {
				prefix: plain[1],
				query: plain[2],
				quoted: false
			};
		}
		//#endregion
		//#region lib/types/core/detect.js
		/**
		* Trigger detection pure core. Scans backward from
		* the caret for a live trigger char under the guard tier and applies the
		* word-boundary rules. Zero React / DOM / cordis.
		*/
		const WORD_CHAR = /[\p{L}\p{N}_]/u;
		const WHITESPACE = /\s/u;
		/**
		* Word-boundary rule: a trigger char opens only at start-of-draft, after
		* whitespace (newlines included), or after punctuation. Two URL carve-outs
		* keep '/' dead inside URLs (both pinned by tests): '/' after a ':' that
		* itself follows a non-whitespace char (scheme separator, `https:/…`), and
		* '/' directly after another '/' (second slash of `//`).
		*/
		function boundaryOk(draft, index, char) {
			if (index === 0) return true;
			const prev = draft.charAt(index - 1);
			if (WHITESPACE.test(prev)) return true;
			if (WORD_CHAR.test(prev)) return false;
			if (char === "/") {
				if (prev === "/") return false;
				if (prev === ":" && index >= 2 && !WHITESPACE.test(draft.charAt(index - 2))) return false;
			}
			return true;
		}
		/**
		* Detect a trigger token at the caret. `@` first uses the shared grammar,
		* including an open quoted token that may span whitespace. Slash detection
		* scans left to the first whitespace; slashes failing the word boundary are
		* treated as ordinary token chars and the scan continues (URL slashes).
		* Guard tiers: plain = both chars live; claimed = '/' fully suppressed,
		* '@' live; frozen = none.
		*
		* @param draft - Full draft text.
		* @param caret - Caret offset into `draft`.
		* @param guard - Availability tier derived from the input phase.
		* @returns The hit with `query` = trigger-to-caret slice and `span` =
		* `{start: triggerIndex, end: caret}`; `span.draftRev` is a placeholder `0`
		* — the calling shell stamps the real revision. Null when no trigger is
		* live at the caret.
		*/
		const detectTrigger = (draft, caret, guard) => {
			if (guard.tier === "frozen") return null;
			const at = activeAtToken(draft, caret);
			if (at !== void 0) {
				const start = caret - at.prefix.length;
				return {
					trigger: "@",
					query: at.query,
					quoted: at.quoted,
					position: draft.search(/\S/) === start ? "leading" : "inline",
					span: {
						start,
						end: caret,
						draftRev: 0
					}
				};
			}
			for (let i = caret - 1; i >= 0; i--) {
				const ch = draft.charAt(i);
				if (WHITESPACE.test(ch)) return null;
				if (ch !== "/") continue;
				if (guard.tier === "claimed") continue;
				if (!boundaryOk(draft, i, ch)) continue;
				return {
					trigger: ch,
					query: draft.slice(i + 1, caret),
					quoted: false,
					position: draft.search(/\S/) === i ? "leading" : "inline",
					span: {
						start: i,
						end: caret,
						draftRev: 0
					}
				};
			}
			return null;
		};
		//#endregion
		//#region lib/types/core/menu.js
		/** Closed rest state with generation 0; store initializer and test seed. */
		const MENU_CLOSED = {
			open: false,
			hit: null,
			generation: 0,
			groups: [],
			highlight: null
		};
		/**
		* Replace the group roster with pending groups for `sources`, in order.
		* Shell-side step before dispatching `hit` on a fresh menu open.
		*
		* @param state - Current menu state.
		* @param sources - Sources registered for the hit trigger, in menu order.
		* @returns State carrying the new pending roster; highlight cleared.
		*/
		function seedGroups(state, sources) {
			return {
				...state,
				groups: sources.map((source) => ({
					source: source.name,
					...source.showGroupTitle === false ? { showGroupTitle: false } : {},
					status: "pending",
					items: []
				})),
				highlight: null
			};
		}
		/** Close, preserving the generation so in-flight settlements stay droppable. */
		const closed = (state) => state.open || state.hit !== null || state.groups.length > 0 || state.highlight !== null ? {
			open: false,
			hit: null,
			generation: state.generation,
			groups: [],
			highlight: null
		} : state;
		/** First item of the first non-empty ready group, or null. */
		function firstHighlight(groups) {
			for (const g of groups) if (g.status === "ready" && g.items.length > 0) return {
				source: g.source,
				index: 0
			};
			return null;
		}
		/** The highlight itself when it still points at a ready item, else null. */
		function validHighlight(highlight, groups) {
			if (!highlight) return null;
			const g = groups.find((x) => x.source === highlight.source);
			return g && g.status === "ready" && highlight.index < g.items.length ? highlight : null;
		}
		/** Flatten ready items into (source, index) positions in group order. */
		function positions(groups) {
			const out = [];
			for (const g of groups) {
				if (g.status !== "ready") continue;
				for (let i = 0; i < g.items.length; i++) out.push({
					source: g.source,
					index: i
				});
			}
			return out;
		}
		/** True when every group is ready with zero items (the auto-close condition). */
		const allReadyEmpty = (groups) => groups.every((g) => g.status === "ready" && g.items.length === 0);
		/**
		* Pure menu reducer. `hit` opens a new generation over the seeded roster
		* (null hit closes); `source-settled` outside the current generation, the
		* open menu, or the roster is dropped; a settlement or failure leaving every
		* group ready-and-empty (or no groups) auto-closes; `source-failed` silently
		* removes the group (the shell logs); `move` cycles the highlight across
		* ready items; `hover` parks it on one ready item (pointer and keyboard
		* share the single highlight — last input wins).
		*
		* @param state - Current menu state.
		* @param ev - Menu event.
		* @returns Next state; the same reference when stale or a no-op.
		*/
		const menuReduce = (state, ev) => {
			switch (ev.type) {
				case "hit":
					if (ev.hit === null) return closed(state);
					return {
						open: true,
						hit: ev.hit,
						generation: state.generation + 1,
						groups: state.groups.map((g) => ({
							...g,
							status: "pending"
						})),
						highlight: state.highlight
					};
				case "source-settled": {
					if (!state.open || ev.generation !== state.generation) return state;
					const idx = state.groups.findIndex((g) => g.source === ev.source);
					if (idx < 0) return state;
					const items = ev.items ?? [];
					const groups = state.groups.map((g, i) => i === idx ? {
						...g,
						status: "ready",
						items
					} : g);
					if (allReadyEmpty(groups)) return closed(state);
					const highlight = validHighlight(state.highlight, groups) ?? firstHighlight(groups);
					return {
						...state,
						groups,
						highlight
					};
				}
				case "source-failed": {
					if (!state.open || ev.generation !== state.generation) return state;
					if (!state.groups.some((g) => g.source === ev.source)) return state;
					const groups = state.groups.filter((g) => g.source !== ev.source);
					if (groups.length === 0 || allReadyEmpty(groups)) return closed(state);
					const highlight = validHighlight(state.highlight, groups) ?? firstHighlight(groups);
					return {
						...state,
						groups,
						highlight
					};
				}
				case "move": {
					if (!state.open) return state;
					const pos = positions(state.groups);
					if (pos.length === 0) return state;
					const hl = state.highlight;
					const at = hl ? pos.findIndex((p) => p.source === hl.source && p.index === hl.index) : -1;
					const next = pos[at < 0 ? ev.dir === 1 ? 0 : pos.length - 1 : (at + ev.dir + pos.length) % pos.length];
					if (next === void 0) return state;
					if (hl && next.source === hl.source && next.index === hl.index) return state;
					return {
						...state,
						highlight: next
					};
				}
				case "hover": {
					if (!state.open) return state;
					const target = validHighlight({
						source: ev.source,
						index: ev.index
					}, state.groups);
					if (target === null) return state;
					const hl = state.highlight;
					if (hl && hl.source === target.source && hl.index === target.index) return state;
					return {
						...state,
						highlight: target
					};
				}
				case "close": return closed(state);
			}
		};
		//#endregion
		//#region lib/types/client/controller.js
		/** Whether a tracked hit is the one the user just dismissed (same token, same query). */
		function dismissedHit(dismissed, hit) {
			return dismissed.trigger === hit.trigger && dismissed.query === hit.query && dismissed.quoted === hit.quoted && dismissed.start === hit.span.start && dismissed.end === hit.span.end;
		}
		/**
		* Per-session trigger pipeline state and orchestration. All mutation stays
		* inside; MenuView renders from {@link InputTriggerController.menu} and routes
		* pointer picks back through {@link InputTriggerController.pick}.
		*/
		var InputTriggerController = class {
			deps;
			/** Menu state store (per-session; survives session switches, dies with the scope). */
			menu = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(MENU_CLOSED);
			/**
			* Name of the source opened through the programmatic launcher, or null for
			* trigger-detected/closed menus. Composer chrome subscribes to this store
			* for the launcher's expanded state without owning a second menu model.
			*/
			launcher = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(null);
			/**
			* Crumbs published by each header-bearing source for the open menu, keyed
			* by source name. A snapshot store like {@link InputTriggerController.launcher}:
			* the answer changes with every hit, and render-side consumers subscribe
			* instead of re-polling sources during a render.
			*/
			headers = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(/* @__PURE__ */ new Map());
			/**
			* Aggregated hot reference lexicon, grouped by trigger (plain-text-reference decision;
			* see .agents/notes/archived/architecture/2026-07-25-web-input-machine-and-slash-pipeline.md):
			* sources implementing the lexicon hook are polled with the session
			* projection; undefined answers (roll not hot yet) are skipped; multiple
			* sources on one trigger concatenate in registration order. A snapshot
			* store because rolls change asynchronously (catalog settles, children
			* spawn/exit) — render-side consumers subscribe instead of re-reading a
			* mutable answer.
			*/
			lexicon = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(/* @__PURE__ */ new Map());
			/** The authoritative hit: single truth for span CAS material (menu snapshot never carries it alone). */
			hit = null;
			/**
			* Identity of the hit whose menu the user dismissed. A dismissal means "not
			* this one, not now": the same token with the same query keeps its menu
			* closed, so restoring the caret after a dismissal cannot reopen it. Typing
			* (a new query) or moving to another token clears it.
			*/
			dismissed = null;
			/** Whether the open menu was reached by a drill pick; cleared with the menu. */
			drilled = false;
			fetch = null;
			disposed = false;
			/** Per-source lexicon unsubscribers (sources without the hook never enter). */
			lexiconOffs = /* @__PURE__ */ new Map();
			constructor(deps) {
				this.deps = deps;
				const projection = this.project();
				for (const src of deps.roster.all()) {
					src.warm?.(projection);
					this.watchLexicon(src, projection);
				}
				this.refreshLexicon();
			}
			/**
			* Feed a draft/caret change through trigger detection and drive the menu.
			* @param draft - full draft text.
			* @param caret - caret offset into `draft`.
			* @param guard - availability tier derived from the input phase.
			* @param draftRev - the input machine's current draft revision, stamped
			* into the hit span for pick-time CAS.
			*/
			track(draft, caret, guard, draftRev) {
				if (this.disposed) return;
				const launched = this.launcher.getSnapshot() !== null;
				this.clearLauncher();
				const raw = detectTrigger(draft, caret, guard);
				if (raw === null) {
					if (launched) return;
					this.hit = null;
					if (guard.tier !== "frozen") this.dismissed = null;
					this.stopFetch();
					this.reduce({ type: "close" });
					return;
				}
				const hit = {
					...raw,
					span: {
						...raw.span,
						draftRev
					}
				};
				if (launched) this.dismissed = null;
				if (this.dismissed !== null) if (!dismissedHit(this.dismissed, hit)) this.dismissed = null;
				else {
					this.hit = hit;
					return;
				}
				const prev = this.menu.getSnapshot();
				const same = !launched && prev.open && prev.hit !== null && prev.hit.trigger === hit.trigger && prev.hit.query === hit.query && prev.hit.quoted === hit.quoted && prev.hit.span.start === hit.span.start && prev.hit.span.end === hit.span.end;
				this.hit = hit;
				if (same) return;
				const roster = this.deps.roster.sources(hit.trigger);
				if (roster.length === 0) {
					this.stopFetch();
					this.reduce({ type: "close" });
					return;
				}
				if (launched || !prev.open || prev.hit === null || prev.hit.trigger !== hit.trigger) this.menu.set(seedGroups(this.menu.getSnapshot(), roster));
				this.reduce({
					type: "hit",
					hit
				});
				this.refreshHeaders(hit, roster);
				this.fetchCandidates(hit, roster);
			}
			/**
			* Toggle a menu containing exactly one registered source. The supplied hit
			* is a synthetic selection span rather than a typed trigger token, but
			* picks deliberately reuse the ordinary source callback and scoped input
			* mutation pipeline.
			* @param source - registered source name under `hit.trigger`.
			* @param hit - synthetic hit carrying position and pick-time draft CAS.
			*/
			toggleSource(source, hit) {
				if (this.disposed) return;
				if (this.launcher.getSnapshot() === source && this.menu.getSnapshot().open) {
					this.dismiss();
					return;
				}
				const match = this.deps.roster.sources(hit.trigger).find((item) => item.name === source);
				if (match === void 0) {
					this.dismiss();
					return;
				}
				this.stopFetch();
				this.hit = hit;
				this.launcher.set(source);
				this.menu.set(seedGroups(this.menu.getSnapshot(), [match]));
				this.reduce({
					type: "hit",
					hit
				});
				this.refreshHeaders(hit, [match]);
				this.fetchCandidates(hit, [match]);
			}
			/**
			* Pointer pick from MenuView: route the clicked candidate through onPick
			* and execute claim/insert outcomes via the scoped input events.
			* @param source - source (group) name.
			* @param index - candidate index within the group.
			* @param action - settling pick (default) or the candidate's drill action.
			*/
			pick(source, index, action = "pick") {
				const state = this.menu.getSnapshot();
				const hit = this.hit;
				if (this.disposed || !state.open || hit === null) return;
				const group = state.groups.find((g) => g.source === source);
				const candidate = group !== void 0 && group.status === "ready" ? group.items[index] : void 0;
				if (candidate === void 0) return;
				const src = this.deps.roster.sources(hit.trigger).find((s) => s.name === source);
				if (src === void 0) return;
				this.settle(src, candidate, hit, action);
			}
			/**
			* Pointer pick on one crumb of a source's menu header: route it through the
			* same drill path a folder row takes, so returning to a step and descending
			* into one share one outcome.
			* @param source - source (group) name.
			* @param index - crumb index within that source's published header.
			*/
			pickCrumb(source, index) {
				const hit = this.hit;
				if (this.disposed || !this.menu.getSnapshot().open || hit === null) return;
				const crumb = this.headers.getSnapshot().get(source)?.[index];
				if (crumb === void 0 || crumb.current === true) return;
				const src = this.deps.roster.sources(hit.trigger).find((s) => s.name === source);
				if (src === void 0) return;
				this.settle(src, {
					name: crumb.label,
					value: crumb.value
				}, hit, "drill");
			}
			/**
			* Pointer hover from MenuView: park the shared highlight on the hovered
			* candidate (keyboard `move` and pointer hover drive one highlight —
			* last input wins).
			* @param source - source (group) name.
			* @param index - candidate index within the group.
			*/
			hover(source, index) {
				if (this.disposed) return;
				this.reduce({
					type: "hover",
					source,
					index
				});
			}
			/**
			* Keyboard arbitration while the menu is open.
			* @param key - intercepted key.
			* @param composing - inside IME composition: everything passes.
			* @returns `pass` when the browser keeps the key (closed menu, no
			* highlight, or a vanished candidate), `consumed` when the menu handled
			* the key without a settling pick (move, close, drill descent, or a
			* pending-refinement no-op), or `pick-highlighted` when the highlighted
			* candidate settled and the menu closed.
			*/
			arbitrate(key, composing) {
				if (composing || this.disposed) return "pass";
				const state = this.menu.getSnapshot();
				if (!state.open) return "pass";
				switch (key) {
					case "up":
						this.reduce({
							type: "move",
							dir: -1
						});
						return "consumed";
					case "down":
						this.reduce({
							type: "move",
							dir: 1
						});
						return "consumed";
					case "escape":
					case "tabBack":
						this.rememberDismissed();
						this.stopFetch();
						this.reduce({ type: "close" });
						return "consumed";
					case "enter": {
						if (state.highlight === null) return "pass";
						const group = state.groups.find((g) => g.source === state.highlight?.source);
						if (group === void 0 || group.status !== "ready") return "consumed";
						this.pick(state.highlight.source, state.highlight.index);
						return "pick-highlighted";
					}
					case "tab": {
						if (state.highlight === null) return "pass";
						const group = state.groups.find((g) => g.source === state.highlight?.source);
						if (group === void 0 || group.status !== "ready") return "consumed";
						const item = group.items[state.highlight.index];
						if (item === void 0) return "pass";
						if (item.drill === true) {
							this.pick(state.highlight.source, state.highlight.index, "drill");
							return "consumed";
						}
						this.pick(state.highlight.source, state.highlight.index);
						return "pick-highlighted";
					}
				}
			}
			/**
			* Space adjudication over the just-completed leading token: polls sources'
			* matchSpace (hot state, synchronous) and dispatches the outcome itself.
			* @returns true when a claim/insert was actually applied by the input —
			* the caller preventDefaults exactly then.
			*/
			onSpace() {
				const hit = this.hit;
				if (this.disposed || hit === null || hit.position !== "leading") return false;
				const token = hit.trigger + hit.query;
				const projection = this.project();
				for (const src of this.deps.roster.sources(hit.trigger)) {
					if (src.matchSpace === void 0) continue;
					const outcome = src.matchSpace(projection, token);
					if (outcome === void 0) continue;
					if (outcome === "handled") return true;
					return this.execute(outcome, hit.span);
				}
				return false;
			}
			/**
			* Serialize one reference occurrence to its model form via the owning
			* source's codec (prompt serialization: registry → explicit
			* call → await). Owner missing or codec-less rejects — the submit attempt
			* blocks instead of silently downgrading to the clipboard text.
			* @param source - owning source name.
			* @param ref - owner-scoped reference id.
			* @param signal - the submit attempt's abort signal.
			* @returns the model representation (e.g. `<skill>name</skill>`).
			*/
			serializeReference(source, ref, signal) {
				const owner = this.deps.roster.all().find((s) => s.name === source);
				if (owner?.codec === void 0) return Promise.reject(/* @__PURE__ */ new Error(`slash: no serializer for reference source "${source}"`));
				return owner.codec.serialize(ref, signal);
			}
			/**
			* Route a chip to its owner or an editable token to its current lexicon owner.
			* @param source - chip source name; undefined for editable text.
			* @param reference - source-owned id and optional chip glyph.
			* @returns whether an owner accepted the preview, possibly awaiting its catalog.
			*/
			openReference(source, reference) {
				if (this.disposed) return false;
				const session = this.project();
				for (const owner of this.deps.roster.all()) if ((source === void 0 ? reference.ref.startsWith(owner.trigger) && owner.lexicon?.(session)?.includes(reference.ref.slice(1)) : owner.name === source) && owner.openReference?.(session, reference)) {
					this.dismiss();
					return true;
				}
				return false;
			}
			/**
			* Enter last adjudication: polls sources' matchEnter in registration
			* order, first non-undefined wins. The outcome returns to the caller (the
			* input machine applies it inside the same submit attempt — no event).
			* @param line - trimmed draft; the leading char selects the trigger roster.
			* @param signal - attempt-scoped abort from the input machine.
			* @param envelope - non-text submission state accompanying the draft.
			* @returns the winning outcome or undefined (default sink). Rejects when a
			* polled source's warmup fails or the winning source refuses the envelope —
			* the caller must not silently downgrade.
			*/
			async adjudicate(line, signal, envelope) {
				const projection = this.project();
				for (const src of this.deps.roster.all()) {
					if (signal.aborted) throw signal.reason instanceof Error ? signal.reason : /* @__PURE__ */ new Error("slash adjudication aborted");
					if (src.matchEnter === void 0 || !line.startsWith(src.trigger)) continue;
					const outcome = await src.matchEnter(projection, line, signal, envelope);
					if (outcome !== void 0) return outcome;
				}
			}
			/**
			* Resolve the claim a persisted command chip names, polling sources'
			* matchClaim in registration order; the first claim wins. Never acts on the
			* token (see {@link InputTriggerSource.matchClaim}).
			* @param token - command spelling without its argument separator, e.g. '/goal'.
			* @param signal - abort for the caller's restore attempt.
			* @returns the claim, or undefined when no source claims the token. Rejects
			* when a polled source's warmup fails or `signal` aborts.
			*/
			async resolveClaim(token, signal) {
				const projection = this.project();
				for (const src of this.deps.roster.all()) {
					if (signal.aborted) throw signal.reason instanceof Error ? signal.reason : /* @__PURE__ */ new Error("command restore aborted");
					if (src.matchClaim === void 0 || !token.startsWith(src.trigger)) continue;
					const claim = await src.matchClaim(projection, token, signal);
					if (claim !== void 0) return claim;
				}
			}
			/**
			* Drop the menu group of a disposed source (root registry change notification).
			* @param source - the source whose registration was disposed.
			*/
			sourceRemoved(source) {
				const state = this.menu.getSnapshot();
				if (state.open && state.hit !== null && state.hit.trigger === source.trigger) this.reduce({
					type: "source-failed",
					generation: state.generation,
					source: source.name
				});
				this.lexiconOffs.get(source)?.();
				this.lexiconOffs.delete(source);
				this.refreshLexicon();
			}
			/**
			* Admit a source registered after this controller's birth (root registry
			* change notification): warm it and fold its roll into the live lexicon —
			* the constructor-time prewarm covers only the roster present at scope
			* birth.
			* @param source - the newly registered source.
			*/
			sourceAdded(source) {
				const projection = this.project();
				source.warm?.(projection);
				this.watchLexicon(source, projection);
				this.refreshLexicon();
			}
			/** External dismiss (e.g. pointer outside the composer area). */
			dismiss() {
				if (this.disposed) return;
				this.rememberDismissed();
				this.stopFetch();
				this.reduce({ type: "close" });
			}
			/** Re-fetch the currently open menu without changing its hit or visible rows. */
			refreshOpenMenu() {
				if (this.disposed || !this.menu.getSnapshot().open || this.hit === null) return;
				const launched = this.launcher.getSnapshot();
				const roster = this.deps.roster.sources(this.hit.trigger).filter((source) => launched === null || source.name === launched);
				if (roster.length === 0) return;
				this.fetchCandidates(this.hit, roster);
			}
			/** Scope teardown: close and abort (the service deletes the map entry). */
			dispose() {
				this.disposed = true;
				this.stopFetch();
				this.reduce({ type: "close" });
				this.hit = null;
				for (const off of this.lexiconOffs.values()) off();
				this.lexiconOffs.clear();
			}
			/** The session projection handed to sources (agent-backed identity; constant per scope). */
			project() {
				return { sessionId: this.deps.sessionId };
			}
			/** Execute a claim/insert/text outcome via the scoped input events (actx as dispatch subject); true = the input applied it. */
			execute(outcome, span) {
				const { actx } = this.deps;
				if (outcome === void 0 || outcome === "handled") return false;
				if ("claim" in outcome) return actx.bail(actx, "slash/input-begin-command", {
					claim: outcome.claim,
					span
				}) === true;
				if ("text" in outcome) return actx.bail(actx, "slash/input-insert-text", {
					text: outcome.text,
					span,
					...outcome.continue === true ? { continue: true } : {}
				}) === true;
				return actx.bail(actx, "slash/input-insert-reference", {
					reference: outcome.insert,
					span
				}) === true;
			}
			/** Re-poll every lexicon-bearing source and publish the aggregated rolls (see the store doc). */
			refreshLexicon() {
				const projection = this.project();
				const rolls = /* @__PURE__ */ new Map();
				for (const src of this.deps.roster.all()) {
					if (src.lexicon === void 0) continue;
					let names;
					try {
						names = src.lexicon(projection);
					} catch (error) {
						console.error(`[ui-input-trigger] source "${src.name}" lexicon failed:`, error);
						continue;
					}
					if (names === void 0) continue;
					const prev = rolls.get(src.trigger);
					rolls.set(src.trigger, prev === void 0 ? names : [...prev, ...names]);
				}
				this.lexicon.set(rolls);
			}
			/** Wire one source's lexicon invalidation channel into refresh (hookless or roll-less sources never notify). */
			watchLexicon(source, projection) {
				if (source.lexicon === void 0 || source.subscribeLexicon === void 0) return;
				this.lexiconOffs.set(source, source.subscribeLexicon(projection, () => {
					this.refreshLexicon();
					const hit = this.hit;
					if (hit === null || !this.menu.getSnapshot().open || hit.trigger !== source.trigger) return;
					Promise.resolve().then(() => {
						if (this.disposed || this.hit !== hit || !this.menu.getSnapshot().open) return;
						this.fetchCandidates(hit, this.deps.roster.sources(hit.trigger));
					});
				}));
			}
			/** Launch the candidate fetch for one hit generation, superseding the previous one. */
			fetchCandidates(hit, roster) {
				this.stopFetch();
				const controller = new AbortController();
				this.fetch = controller;
				const generation = this.menu.getSnapshot().generation;
				const projection = this.project();
				for (const source of roster) source.candidates(projection, {
					query: hit.query,
					quoted: hit.quoted,
					position: hit.position,
					drilled: this.drilled,
					signal: controller.signal
				}).then((items) => {
					if (controller.signal.aborted) return;
					this.reduce({
						type: "source-settled",
						generation,
						source: source.name,
						items
					});
				}, (error) => {
					if (controller.signal.aborted) return;
					console.error(`[ui-input-trigger] source "${source.name}" candidates failed:`, error);
					this.reduce({
						type: "source-failed",
						generation,
						source: source.name
					});
				});
			}
			stopFetch() {
				this.fetch?.abort();
				this.fetch = null;
			}
			/**
			* Run one candidate (or crumb) through its source and apply the outcome.
			*
			* A drill is the one pick that leaves the menu open, so it is also the one
			* that records how the next query was reached; every other pick closes the
			* menu, which clears that record.
			* @param src - the owning source.
			* @param candidate - the picked candidate, or a crumb projected as one.
			* @param hit - the authoritative hit supplying position and span CAS.
			* @param action - settling pick or drill.
			*/
			settle(src, candidate, hit, action) {
				const outcome = src.onPick({
					candidate,
					session: this.project(),
					position: hit.position,
					via: "menu",
					action,
					span: hit.span
				});
				this.stopFetch();
				if (action === "pick") this.rememberDismissed();
				this.reduce({ type: "close" });
				this.drilled = action === "drill";
				if (!this.execute(outcome, hit.span)) this.drilled = false;
			}
			/** Re-poll every header-bearing source in the hit roster and publish their crumbs. */
			refreshHeaders(hit, roster) {
				const projection = this.project();
				const crumbs = /* @__PURE__ */ new Map();
				for (const src of roster) {
					if (src.header === void 0) continue;
					let published;
					try {
						published = src.header(projection, {
							query: hit.query,
							quoted: hit.quoted,
							drilled: this.drilled
						});
					} catch (error) {
						console.error(`[ui-input-trigger] source "${src.name}" header failed:`, error);
						continue;
					}
					if (published === void 0 || published.length === 0) continue;
					crumbs.set(src.name, published);
				}
				this.setHeaders(crumbs);
			}
			setHeaders(next) {
				if (this.headers.getSnapshot().size === 0 && next.size === 0) return;
				this.headers.set(next);
			}
			/** Record the open menu's identity as dismissed, so a bare re-track cannot revive it. */
			rememberDismissed() {
				const hit = this.hit;
				this.dismissed = hit === null ? null : {
					trigger: hit.trigger,
					query: hit.query,
					quoted: hit.quoted,
					start: hit.span.start,
					end: hit.span.end
				};
			}
			clearLauncher() {
				if (this.launcher.getSnapshot() !== null) this.launcher.set(null);
			}
			reduce(ev) {
				const cur = this.menu.getSnapshot();
				const next = menuReduce(cur, ev);
				if (next !== cur) this.menu.set(next);
				if (next.open) return;
				this.clearLauncher();
				this.drilled = false;
				this.setHeaders(/* @__PURE__ */ new Map());
			}
		};
		//#endregion
		//#region lib/types/client/service.js
		/**
		* InputTriggerService (`ctx.inputTriggers`): the root half of the trigger pipeline — the
		* stateless source registry plus the per-session controller map. Every piece
		* of mutable interaction state (hit, menu, fetch) lives on the
		* {@link InputTriggerController}; the service only registers sources, resolves
		* controllers by session scope, and relays roster changes.
		*/
		/** The `ctx.inputTriggers` trigger pipeline service (root registry + controller resolution). */
		var InputTriggerService = class extends _deepseek_ai_cordis.Service {
			static inject = ["sessions"];
			live = {
				sources: [],
				controllers: new WeakMapWithValues()
			};
			/**
			* @param ctx - owning root context (the service registers itself as `slash`).
			*/
			constructor(ctx) {
				super(ctx, "inputTriggers");
				ctx.on("locale/change", () => {
					for (const controller of this.live.controllers.values) controller.refreshOpenMenu();
				});
			}
			/**
			* Register one trigger source. Live session controllers are notified so a
			* source arriving after scope birth still warms and joins the lexicon.
			* @param src - the source; (trigger, name) must be unique — duplicates throw.
			* @returns the disposer (callers wrap registration in ctx.effect). Disposal
			* while a controller shows the source's menu group drops that group.
			*/
			registerSource(src) {
				const { live } = this;
				if (live.sources.some((s) => s.trigger === src.trigger && s.name === src.name)) throw new Error(`slash source "${src.trigger}${src.name}" is already registered`);
				live.sources.push(src);
				for (const controller of live.controllers.values) try {
					controller.sourceAdded(src);
				} catch (error) {
					console.error(`[ui-input-trigger] source "${src.trigger}${src.name}" late-registration setup failed:`, error);
				}
				return () => {
					const at = live.sources.indexOf(src);
					if (at < 0) return;
					live.sources.splice(at, 1);
					for (const controller of live.controllers.values) controller.sourceRemoved(src);
				};
			}
			/**
			* Resolve the per-session controller for one session scope (lazy; the
			* scope disposer removes and disposes it). Construction warms the source
			* roster once — sessions are always agent-backed, so scope birth is the
			* single prewarm moment.
			* @param actx - session-scope ctx.
			* @returns the resident controller.
			* @throws when the Context no longer belongs to a retained Session generation.
			*/
			sessionOf(actx) {
				const sessions = this.sessions();
				const session = sessions.sessionOf(actx);
				const binding = session === void 0 ? void 0 : sessions.binding(session.sessionId);
				if (binding === void 0 || binding.session !== session) throw new Error("slash.sessionOf requires a retained Session scope");
				const id = binding.sessionId;
				const { live } = this;
				const existing = live.controllers.get(binding);
				if (existing !== void 0) return existing;
				const controller = new InputTriggerController({
					actx: binding.ctx,
					sessionId: id,
					roster: {
						sources: (trigger) => live.sources.filter((s) => s.trigger === trigger).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
						all: () => live.sources
					}
				});
				live.controllers.set(binding, controller);
				binding.ctx.effect(() => () => {
					controller.dispose();
					live.controllers.delete(binding);
				}, "slash: session controller");
				return controller;
			}
			sessions() {
				const sessions = this.ctx.get("sessions");
				if (sessions === void 0) throw new Error("ui-input-trigger: sessions service unavailable");
				return sessions;
			}
		};
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
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-input-trigger/src/client/MenuView.module.css.mjs
		const css = "._53gXea_menu{z-index:100;box-sizing:border-box;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);--dsh-scrollbar-width:6px;--dsh-scrollbar-thumb-border:2px;--dsh-scrollbar-track-margin:12px;--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);max-height:400px;box-shadow:var(--dsw-elevation-prominent);border:0;flex-direction:column;padding:4px;display:flex;position:absolute;bottom:calc(100% + 4px);left:0;right:0;overflow:hidden}._53gXea_menu[data-overflow-below]:after{content:\"\";background:linear-gradient(to bottom, transparent, var(--dsw-specific-menu));pointer-events:none;height:16px;position:absolute;bottom:4px;left:4px;right:14px}._53gXea_viewport{flex-direction:column;min-height:0;display:flex;overflow-y:auto}._53gXea_item{border-radius:var(--dsw-radius-md);cursor:pointer;width:100%;min-height:34px;color:var(--dsw-alias-label-primary);text-align:left;background:0 0;border:none;align-items:center;gap:6px;padding:6px 8px;font-size:13px;line-height:20px;display:flex}._53gXea_item._53gXea_active{background:var(--dsw-alias-interactive-bg-hover)}._53gXea_sectionTitle{min-height:23px;color:var(--dsw-alias-label-tertiary);flex:none;padding:5px 8px 2px;font-size:11px;font-weight:500;line-height:16px}._53gXea_sectionTitle:not(:first-child){margin-top:3px}._53gXea_itemIcon{width:14px;height:14px;color:var(--dsw-alias-menu-icon);flex:none;justify-content:center;align-items:center;display:inline-flex}._53gXea_itemIcon svg{width:14px;height:14px}._53gXea_itemName{text-overflow:ellipsis;white-space:nowrap;flex:none;max-width:40%;overflow:hidden}._53gXea_itemAlias{text-overflow:ellipsis;white-space:nowrap;max-width:20%;color:var(--dsw-alias-label-tertiary);flex:none;font-size:12px;line-height:18px;overflow:hidden}._53gXea_itemDescription{text-overflow:ellipsis;white-space:nowrap;text-align:right;min-width:0;color:var(--dsw-alias-label-tertiary);flex:1;font-size:12px;line-height:18px;overflow:hidden}._53gXea_trailing{flex:none;align-items:center;gap:3px;margin-left:auto;display:inline-flex}._53gXea_drillHintText{color:var(--dsw-alias-label-caption);white-space:nowrap;font-size:10px;line-height:16px;display:none}._53gXea_drillHint{border-radius:var(--dsw-radius-xs);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-caption);padding:0 4px;font-family:inherit;font-size:10px;line-height:16px;display:none}._53gXea_item._53gXea_active ._53gXea_drillHintText,._53gXea_item._53gXea_active ._53gXea_drillHint{display:inline-flex}._53gXea_drill{border-radius:var(--dsw-radius-xs);width:18px;height:18px;color:var(--dsw-alias-menu-icon);flex:none;place-items:center;display:inline-grid}@media (hover:hover){._53gXea_drill:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}._53gXea_groupTitle{color:var(--dsw-alias-label-tertiary);padding:6px 8px;font-size:11px;line-height:15px}._53gXea_skeletonRow{box-sizing:border-box;align-items:center;min-height:34px;padding:6px 8px;display:flex}._53gXea_skeletonBar{border-radius:var(--dsw-radius-xs);background:var(--dsw-alias-bg-skeleton);height:18px;animation:2s cubic-bezier(.36,0,.64,1) infinite _53gXea_dsh-menu-skeleton}@keyframes _53gXea_dsh-menu-skeleton{0%{opacity:1}40%{opacity:.6}80%,to{opacity:1}}._53gXea_crumbs{border-bottom:.5px solid var(--dsw-alias-border-l1);flex-wrap:wrap;flex:none;align-items:center;gap:2px;margin-bottom:2px;padding:3px 3px 5px;display:flex}._53gXea_crumb{border-radius:var(--dsw-radius-sm);max-width:40%;color:var(--dsw-alias-label-tertiary);cursor:pointer;text-overflow:ellipsis;white-space:nowrap;background:0 0;border:none;flex:0 auto;padding:2px 5px;font-family:inherit;font-size:11px;line-height:16px;overflow:hidden}@media (hover:hover){._53gXea_crumb:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}._53gXea_crumbCurrent{color:var(--dsw-alias-label-primary);cursor:default;background:0 0}@media (hover:hover){._53gXea_crumbCurrent:hover{color:var(--dsw-alias-label-primary);cursor:default;background:0 0}}._53gXea_crumbSeparator{color:var(--dsw-alias-menu-icon);flex:none;display:inline-flex}";
		const tagId = "@deepseek-ai/dsh-client-ui-input-trigger/MenuView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-input-trigger";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var MenuView_module_css_default = {
			"active": "_53gXea_active",
			"crumb": "_53gXea_crumb",
			"crumbCurrent": "_53gXea_crumbCurrent",
			"crumbSeparator": "_53gXea_crumbSeparator",
			"crumbs": "_53gXea_crumbs",
			"drill": "_53gXea_drill",
			"drillHint": "_53gXea_drillHint",
			"drillHintText": "_53gXea_drillHintText",
			"dsh-menu-skeleton": "_53gXea_dsh-menu-skeleton",
			"groupTitle": "_53gXea_groupTitle",
			"item": "_53gXea_item",
			"itemAlias": "_53gXea_itemAlias",
			"itemDescription": "_53gXea_itemDescription",
			"itemIcon": "_53gXea_itemIcon",
			"itemName": "_53gXea_itemName",
			"menu": "_53gXea_menu",
			"sectionTitle": "_53gXea_sectionTitle",
			"skeletonBar": "_53gXea_skeletonBar",
			"skeletonRow": "_53gXea_skeletonRow",
			"trailing": "_53gXea_trailing",
			"viewport": "_53gXea_viewport"
		};
		//#endregion
		//#region lib/types/client/MenuView.js
		/**
		* Trigger candidate menu: renders the InputTriggerService menu store into the
		* conversation.input.overlay anchor. Closed state renders null (the overlay
		* slot stays mounted); groups render in roster order under localized title
		* rows. A pending group keeps showing the items it already had (the reducer
		* retains them across a query refinement) and falls back to two skeleton
		* rows only while it has none; pointer picks route back through
		* the service (combobox pattern — focus never leaves the textarea, so rows
		* are mousedown-handled and the highlight is exposed via
		* aria-activedescendant on the listbox). A row reads title, then the
		* command-name alias when the title is not the name in another letter case
		* (a localized title), then the description right-aligned. A source publishing crumbs gets a breadcrumb
		* header pinned above the scrolling list.
		*/
		/** Height cap that fits the two headings and eight built-in command rows. */
		const MAX_HEIGHT = 400;
		/**
		* Viewport top margin: the conversation header's 76px block (title row plus
		* view tabs, ui-conversation) plus 8px of air, so a tall list stops below the
		* header instead of sliding under it.
		*/
		const TOP_MARGIN = 84;
		/** DOM id of one option row (the aria-activedescendant target). */
		function optionId(source, index) {
			return `dsh-slash-option-${source}-${index}`;
		}
		/**
		* Render the candidate menu overlay entry.
		* @param props - injected face (the menu store and the pick route); `t` rides the standard locale seat.
		* @returns the dropdown while open; null while closed.
		*/
		function MenuView({ menu, headers, onPick, onCrumb, onHover, onDismiss, t }) {
			const state = (0, react.useSyncExternalStore)((fn) => menu.subscribe(fn), () => menu.getSnapshot());
			const crumbs = (0, react.useSyncExternalStore)((fn) => headers.subscribe(fn), () => headers.getSnapshot());
			const listRef = (0, react.useRef)(null);
			const viewportRef = (0, react.useRef)(null);
			const [hasOverflowBelow, setHasOverflowBelow] = (0, react.useState)(false);
			const maxHeight = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredMaxHeight)(listRef, MAX_HEIGHT, state, TOP_MARGIN);
			const updateOverflowHint = (0, react.useCallback)(() => {
				const viewport = viewportRef.current;
				setHasOverflowBelow(viewport !== null && viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1);
			}, []);
			(0, react.useLayoutEffect)(() => {
				updateOverflowHint();
			}, [
				state,
				maxHeight,
				updateOverflowHint
			]);
			const highlight = state.open ? state.highlight : null;
			(0, react.useEffect)(() => {
				if (highlight === null) return;
				document.getElementById(optionId(highlight.source, highlight.index))?.scrollIntoView({ block: "nearest" });
			}, [highlight]);
			(0, react.useEffect)(() => {
				if (!state.open) return;
				const onPointerDown = (ev) => {
					if (!(ev.target instanceof Node)) return;
					if (listRef.current?.contains(ev.target)) return;
					if ((listRef.current?.closest("[data-composer-card]"))?.contains(ev.target)) return;
					onDismiss();
				};
				document.addEventListener("pointerdown", onPointerDown, true);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown, true);
				};
			}, [state.open, onDismiss]);
			if (!state.open) return null;
			return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.MenuSurface, {
				ref: listRef,
				className: MenuView_module_css_default.menu,
				style: { maxHeight },
				"data-trigger-menu": "",
				"data-overflow-below": hasOverflowBelow || void 0,
				children: [state.groups.map((group) => {
					const trail = crumbs.get(group.source);
					return trail === void 0 ? null : (0, react_jsx_runtime.jsx)("nav", {
						className: MenuView_module_css_default.crumbs,
						"aria-label": t("crumbs.aria"),
						children: trail.map((crumb, index) => (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [index > 0 && (0, react_jsx_runtime.jsx)("span", {
							className: MenuView_module_css_default.crumbSeparator,
							"aria-hidden": true,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: clsx(MenuView_module_css_default.crumb, crumb.current === true && MenuView_module_css_default.crumbCurrent),
							"aria-current": crumb.current === true ? "location" : void 0,
							disabled: crumb.current === true,
							onMouseDown: (ev) => {
								ev.preventDefault();
								onCrumb(group.source, index);
							},
							children: crumb.label
						})] }, `${String(index)}-${crumb.value}`))
					}, group.source);
				}), (0, react_jsx_runtime.jsx)("div", {
					ref: viewportRef,
					className: MenuView_module_css_default.viewport,
					role: "listbox",
					"aria-label": t("suggestions.aria"),
					"aria-activedescendant": highlight !== null ? optionId(highlight.source, highlight.index) : void 0,
					onScroll: updateOverflowHint,
					children: state.groups.map((group) => group.status === "ready" && group.items.length === 0 ? null : (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [group.showGroupTitle === false || group.items.some((item) => item.section !== void 0) ? null : (0, react_jsx_runtime.jsx)("div", {
						className: MenuView_module_css_default.groupTitle,
						role: "presentation",
						"data-source": group.source,
						children: t(group.source)
					}), group.status === "pending" && group.items.length === 0 ? (0, react_jsx_runtime.jsxs)("div", {
						role: "status",
						"aria-label": t("loading"),
						"data-source": group.source,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: MenuView_module_css_default.skeletonRow,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: MenuView_module_css_default.skeletonBar,
								style: { width: "32%" }
							})
						}), (0, react_jsx_runtime.jsx)("div", {
							className: MenuView_module_css_default.skeletonRow,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: MenuView_module_css_default.skeletonBar,
								style: { width: "48%" }
							})
						})]
					}) : group.items.map((item, index) => {
						const active = highlight !== null && highlight.source === group.source && highlight.index === index;
						return (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [item.section !== void 0 && item.section !== group.items[index - 1]?.section ? (0, react_jsx_runtime.jsx)("div", {
							className: MenuView_module_css_default.sectionTitle,
							role: "presentation",
							children: item.section
						}) : null, (0, react_jsx_runtime.jsxs)("button", {
							id: optionId(group.source, index),
							type: "button",
							role: "option",
							"aria-selected": active,
							className: clsx(MenuView_module_css_default.item, active && MenuView_module_css_default.active),
							onMouseDown: (ev) => {
								ev.preventDefault();
								onPick(group.source, index);
							},
							onMouseMove: active ? void 0 : () => {
								onHover(group.source, index);
							},
							children: [
								item.icon !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: MenuView_module_css_default.itemIcon,
									"aria-hidden": true,
									children: typeof item.icon === "string" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceIconRegular, {
										kind: item.icon,
										size: 14
									}) : (0, react_jsx_runtime.jsx)(item.icon, { size: 14 })
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: MenuView_module_css_default.itemName,
									children: item.label ?? item.name
								}),
								item.label !== void 0 && item.label.toLowerCase() !== item.name.toLowerCase() && (0, react_jsx_runtime.jsx)("span", {
									className: MenuView_module_css_default.itemAlias,
									children: item.name
								}),
								item.description !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: MenuView_module_css_default.itemDescription,
									children: item.description
								}),
								item.drill === true && (0, react_jsx_runtime.jsxs)("span", {
									className: MenuView_module_css_default.trailing,
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: MenuView_module_css_default.drillHintText,
											"aria-hidden": true,
											children: t("drill.hint")
										}),
										(0, react_jsx_runtime.jsx)("kbd", {
											className: MenuView_module_css_default.drillHint,
											"aria-hidden": true,
											children: t("drill.key")
										}),
										(0, react_jsx_runtime.jsx)("span", {
											role: "button",
											"aria-label": t("drill.aria"),
											className: MenuView_module_css_default.drill,
											onMouseDown: (ev) => {
												ev.preventDefault();
												ev.stopPropagation();
												onPick(group.source, index, "drill");
											},
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { size: 12 })
										})
									]
								})
							]
						})] }, optionId(group.source, index));
					})] }, group.source))
				})]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/**
		* `slash.menu` namespace dictionaries: group titles keyed by source name
		* (the lookup chain returns the key itself, so an unknown source shows its
		* raw name), the pending row, and the listbox and header aria labels.
		*/
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"command": "指令",
			"skill": "技能",
			"subagent": "子智能体",
			"loading": "正在加载…",
			"drill.aria": "进入目录",
			"drill.hint": "进入目录",
			"drill.key": "Tab",
			"crumbs.aria": "目录导航",
			"suggestions.aria": "触发候选建议"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"command": "Commands",
			"skill": "Skills",
			"subagent": "Subagents",
			"loading": "Loading…",
			"drill.aria": "Browse folder",
			"drill.hint": "Browse folder",
			"drill.key": "Tab",
			"crumbs.aria": "Folder navigation",
			"suggestions.aria": "Trigger suggestions"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"command": "コマンド",
			"skill": "スキル",
			"subagent": "サブエージェント",
			"loading": "読み込み中…",
			"drill.aria": "フォルダを参照",
			"drill.hint": "フォルダを参照",
			"drill.key": "Tab",
			"crumbs.aria": "フォルダナビゲーション",
			"suggestions.aria": "候補を表示"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"command": "Comandos",
			"skill": "Habilidades",
			"subagent": "Subagentes",
			"loading": "Cargando…",
			"drill.aria": "Explorar carpeta",
			"drill.hint": "Explorar carpeta",
			"drill.key": "Pestaña",
			"crumbs.aria": "Navegación de carpetas",
			"suggestions.aria": "Sugerencias de activación"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"command": "Commandes",
			"skill": "Compétences",
			"subagent": "Sous-agents",
			"loading": "Chargement…",
			"drill.aria": "Parcourir le dossier",
			"drill.hint": "Parcourir le dossier",
			"drill.key": "Onglet",
			"crumbs.aria": "Navigation dans les dossiers",
			"suggestions.aria": "Suggestions de déclenchement"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"command": "Befehle",
			"skill": "Fähigkeiten",
			"subagent": "Subagenten",
			"loading": "Laden…",
			"drill.aria": "Ordner durchsuchen",
			"drill.hint": "Ordner durchsuchen",
			"drill.key": "Tab",
			"crumbs.aria": "Ordnernavigation",
			"suggestions.aria": "Trigger-Vorschläge"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"command": "Команды",
			"skill": "Навыки",
			"subagent": "Субагенты",
			"loading": "Загрузка…",
			"drill.aria": "Просмотреть папку",
			"drill.hint": "Просмотреть папку",
			"drill.key": "Вкладка",
			"crumbs.aria": "Навигация по папкам",
			"suggestions.aria": "Триггерные предложения"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"command": "Comandos",
			"skill": "Habilidades",
			"subagent": "Subagentes",
			"loading": "Carregando…",
			"drill.aria": "Navegar na pasta",
			"drill.hint": "Navegar na pasta",
			"drill.key": "Guia",
			"crumbs.aria": "Navegação de pastas",
			"suggestions.aria": "Sugestões de gatilho"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Namespace owning the candidate-menu copy. */
		const MENU_NS = "slash.menu";
		/** Required services: controller resolution reads the session scope tree; the menu copy is localized. */
		const inject = ["sessions", "locale"];
		/**
		* Client plugin body: mount the service, then register MenuView into the
		* input overlay once its declarer is up.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.plugin(InputTriggerService);
			ctx.effect(() => ctx.locale.register(MENU_NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-input-trigger: menu dictionaries");
			ctx.inject([
				"slots",
				"inputTriggers",
				"sessions"
			], (scope) => {
				const inputTriggers = scope.inputTriggers;
				const sessions = scope.sessions;
				scope.slots.inject("conversation.input.overlay", () => scope.slots.register({
					name: "conversation.input.overlay",
					id: "slash-menu",
					order: 0,
					locale: MENU_NS,
					inject: (sessionId) => {
						const actx = sessions.scope(sessionId);
						if (actx === void 0) throw new Error(`ui-input-trigger: session "${String(sessionId)}" resolved no scope`);
						const controller = inputTriggers.sessionOf(actx);
						return {
							menu: controller.menu,
							headers: controller.headers,
							onPick: (source, index, action) => {
								controller.pick(source, index, action);
							},
							onCrumb: (source, index) => {
								controller.pickCrumb(source, index);
							},
							onHover: (source, index) => {
								controller.hover(source, index);
							},
							onDismiss: () => {
								controller.dismiss();
							}
						};
					}
				}, MenuView));
			});
		}
		//#endregion
		exports.InputTriggerController = InputTriggerController;
		exports.InputTriggerService = InputTriggerService;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map