window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-agent-preset",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
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
		//#region lib/types/client/guide-locales.js
		/** Curated help for shipped presets, kept separate from their short picker copy. */
		const guideEn = {
			modeExplanation: "Mode details",
			howToUse: "How to use",
			guideSections: "Guide sections",
			guideExampleTask: "Example task",
			guideCopy: "Copy",
			guideCopied: "Copied",
			guideFootnotes: "Footnotes",
			guideStandardIntro: "Choose Standard mode when starting a new task. Describe what you want to accomplish, point to the relevant files, and explain how to check the result.",
			guideStandardExplanation: [
				"### How it works",
				"The agent calls tools directly to read and edit files, search, and run terminal commands. It includes Skills, planning, goals, subagents, workflows, plugin management, and context compaction.",
				"### When to choose it",
				"Start here for everyday coding, file work, and research. Standard mode can also write scripts and process files in batches. PTC changes how tool calls are organized; it is not required for batch tasks."
			].join("\n\n"),
			guideStandardUsage: [
				"### Fix a bug",
				"> Find out why submitting the search form twice makes the results disappear. Fix it and run the relevant tests. Explain the cause and what changed.",
				"Expected output: a code change, the relevant test results, and an explanation of the cause.",
				"### Organize project notes",
				"> Read the Markdown notes in this project. Summarize the agreed decisions and open questions, with links to the source files.",
				"Expected output: a summary with references that you can check against the original notes."
			].join("\n\n"),
			guidePtcIntro: "Choose PTC mode when starting a new task. Specify the input files, processing rules, and output format. The agent writes the code.",
			guidePtcExplanation: [
				"### How tools are called",
				"PTC means Programmatic Tool Calling. In this built-in preset, the agent uses run_code to write a TypeScript program that calls tools through a generated SDK. The program can use loops, conditions, error handling, and concurrent calls where appropriate.",
				"### What reaches the model",
				"Tool results first reach the program, which can filter and combine them. The model receives what the program prints or returns; image results are attached separately. Nested tool calls are still recorded and remain subject to tool permissions.",
				"### Compared with Standard mode",
				"Both modes can handle coding and batch tasks. Standard mode exposes individual tools directly; PTC organizes tool calls in code. The current PTC preset leaves the workflow and plugin management tools disabled. Speed and token use depend on the task and how the program handles its results."
			].join("\n\n"),
			guidePtcUsage: [
				"### Check a set of configuration files",
				"> Check all JSON files in configs/. List missing required fields and invalid values against schema.json. Save a CSV with one row per issue. Include unreadable files in the report and keep checking the rest. Leave the original files unchanged.",
				"Expected output: an issue summary and a CSV report. The program can repeat the same checks, handle individual failures, and collect the results.",
				"### Summarize error logs",
				"> Analyze the log files in logs/. Group errors by service and error type. Show the ten most frequent groups and one example from each. Save the full counts to a CSV.",
				"Expected output: the top error groups and a complete count table. Intermediate data can be aggregated in the program before the summary reaches the model."
			].join("\n\n"),
			guideMinimalIntro: "Choose Minimal mode for a new task. For a comparison, hold the model, permissions, input, and starting workspace state constant across runs.",
			guideMinimalExplanation: [
				"### What is included",
				"One persistent shell tool, read_image, and a fixed system prompt. Image reading requires an image-capable model. Older history is compacted automatically under context pressure; use /compact while the agent is idle to compact it manually. The built-in preset does not load Skills, planning, or the standard runtime context.",
				"### When to choose it",
				"Use it as a baseline for experiments and comparisons. It can still read files and execute scripts through shell commands, but offers fewer built-in ways to manage a long task. Fewer tools does not necessarily make it easier for a beginner."
			].join("\n\n"),
			guideMinimalUsage: [
				"### Compare performance on a small bug fix",
				"> Run the tests for this project, find the cause of the failure, and make the smallest fix. Run the relevant tests again and report the result.",
				"Run the same task separately in Standard and Minimal modes from the same starting state. Compare task completion, tool calls, and the resulting changes. Minimal mode performs the work through terminal commands."
			].join("\n\n"),
			guideCordisIntro: "Choose Creator mode for a new task. Describe the capability you want, where it should appear, and how you will verify it.",
			guideCordisExplanation: [
				"### What you can create",
				"Creator mode includes the standard task tools plus runtime inspection and guidance for authoring Cordis plugins and agent presets. It can create a plugin that adds a capability or UI, or a preset that combines tools and prompts for a particular job.",
				"### Plugins and modes",
				"A plugin adds capabilities to DSH, such as a tool, a service connection, or a UI entry. A mode is an agent preset that selects tools and defines how the agent works in a task. A plugin can be included in a custom preset.",
				"### How the result takes effect",
				"Ask the agent to install and verify the result, not just generate source code. A plugin may load immediately or require a restart, depending on what it changes. A newly created preset is selected when starting a new task."
			].join("\n\n"),
			guideCordisUsage: [
				"### Add a UI",
				"> Create a DSH plugin that adds a project notes entry to the sidebar. Let me browse the Markdown files in this workspace and preview a selected note. Install it and verify that the page opens.",
				"Expected output: an installed plugin with a working entry and preview page, plus any remaining activation steps.",
				"### Add a tool",
				"> Create a plugin with a tool that reads this project’s test report and summarizes the failed tests. Register it and verify it with a sample report.",
				"Expected output: a plugin with a callable tool and a verified sample call.",
				"### Create my own mode",
				"> Create a “Code review” mode based on Standard mode. Have it prioritize potential bugs and test gaps, cite file paths and lines, and ask before modifying files. Save it as a selectable preset.",
				"Expected output: a custom preset for new tasks. These review instructions guide the agent; permission settings determine which actions it can execute."
			].join("\n\n")
		};
		/** Simplified Chinese help. Examples describe suggested tasks, not recorded runs. */
		const guideZh = {
			modeExplanation: "模式说明",
			howToUse: "如何使用",
			guideSections: "帮助内容",
			guideExampleTask: "示例任务",
			guideCopy: "复制",
			guideCopied: "已复制",
			guideFootnotes: "脚注",
			guideStandardIntro: "新建任务时选择「标准模式」，说明要完成什么、相关文件在哪里，以及怎样判断任务完成。",
			guideStandardExplanation: [
				"### 工作方式",
				"Agent 直接调用工具来读写文件、检索资料和执行终端命令。包含 Skills、计划、目标、子 Agent、工作流、插件管理和上下文压缩等能力。",
				"### 什么时候选",
				"日常编程、文件处理和资料整理可以从这里开始。标准模式也能编写脚本、批量处理文件；PTC 改变的是工具调用方式，批量任务并不必须使用 PTC。"
			].join("\n\n"),
			guideStandardUsage: [
				"### 修复一个问题",
				"> 搜索表单连续提交两次后，结果会消失。请定位原因、修复问题并运行相关测试，最后说明原因和修改内容。",
				"预期产出：代码修改、相关测试结果，以及问题原因说明。",
				"### 整理项目资料",
				"> 阅读项目中的 Markdown 记录，整理已经达成的结论和仍待确认的问题，并附上对应文件链接。",
				"预期产出：一份带来源引用的总结，方便回到原文核对。"
			].join("\n\n"),
			guidePtcIntro: "新建任务时选择「PTC 模式」，说明输入文件、处理规则和输出格式。代码由 Agent 编写。",
			guidePtcExplanation: [
				"### 怎样调用工具",
				"PTC 是 Programmatic Tool Calling，即通过程序调用工具。当前内置预设让 Agent 通过 run_code 编写 TypeScript 程序，使用生成的工具 SDK 发起调用。程序可以组织循环、条件判断、错误处理，以及适合并发执行的调用。",
				"### 哪些结果交给模型",
				"工具返回的数据先交给程序，经过筛选、计算或合并，再通过输出或返回值交给模型；图片结果会另行附加。程序中的工具调用仍会被记录，也仍受工具权限约束。",
				"### 与标准模式的区别",
				"两种模式都能编程、批量处理文件。标准模式直接向模型提供各个工具；PTC 让模型用代码组织工具调用。当前 PTC 预设未启用 workflow 和插件管理工具。速度和 token 用量取决于具体任务与结果处理方式。"
			].join("\n\n"),
			guidePtcUsage: [
				"### 批量检查配置文件",
				"> 检查 configs/ 下所有 JSON 文件，按照 schema.json 找出缺失字段和不合法的值。每个问题写成 CSV 中的一行；读取失败的文件也记入报告，继续检查其余文件。保留原文件。",
				"预期产出：问题汇总和一份 CSV 报告。程序可以对多份文件执行相同检查，处理单个文件的失败，再汇总结果。",
				"### 汇总错误日志",
				"> 分析 logs/ 下的日志，按服务和错误类型统计次数，列出出现最多的十类错误，每类保留一条示例。完整统计另存为 CSV。",
				"预期产出：高频错误摘要和完整统计表。中间数据可以先在程序中聚合，再把汇总交给模型。"
			].join("\n\n"),
			guideMinimalIntro: "新建任务时选择「极简模式」。做对照测试时，保持模型、权限、任务输入和工作区起始状态一致。",
			guideMinimalExplanation: [
				"### 保留哪些能力",
				"提供持久 Shell 和 read_image 工具，并使用固定系统提示词。读取图片需要支持图片输入的模型。上下文压力达到阈值时自动压缩较早历史；Agent 空闲时可输入 /compact 手动压缩。内置预设不加载 Skills、计划，也不注入标准运行时上下文。",
				"### 什么时候选",
				"适合作为实验和对照测试的基线。Agent 仍能通过终端命令读写文件、运行脚本，但缺少管理长任务的内置辅助能力。工具少，不代表对新手更容易。"
			].join("\n\n"),
			guideMinimalUsage: [
				"### 对比基础修复表现",
				"> 运行这个项目的测试，找出失败原因，做最小修复，再运行相关测试并报告结果。",
				"分别用标准模式和极简模式，从相同的工作区状态执行这条任务，对比完成情况、工具调用和最终修改。极简模式会通过终端命令完成这些操作。"
			].join("\n\n"),
			guideCordisIntro: "新建任务时选择「创造模式」，说明希望增加什么能力、从哪里使用，以及怎样验证效果。",
			guideCordisExplanation: [
				"### 可以创造什么",
				"创造模式具备标准任务工具，并增加运行时检查，以及 Cordis 插件和 Agent 预设的开发指引。可以编写插件来添加功能或界面，也可以组合工具和提示词，创建适合特定任务的模式。",
				"### 插件与模式的关系",
				"插件为 DSH 增加能力，例如工具、服务连接或界面入口。模式是一份 Agent 预设，用来选择任务可用的工具，并约定 Agent 的工作方式。自定义模式中也可以使用自己开发的插件。",
				"### 怎样让成果生效",
				"可以要求 Agent 完成安装并验证实际效果。插件可能即时加载，也可能需要重启，取决于修改内容；新建的模式在创建新任务时选择。"
			].join("\n\n"),
			guideCordisUsage: [
				"### 添加一个界面",
				"> 帮我写一个 DSH 插件，在侧栏增加「项目笔记」入口，列出当前工作区的 Markdown 文件，点击后能预览内容。完成安装并验证页面能打开。",
				"预期产出：带侧栏入口和预览页的插件，以及仍需完成的生效步骤。",
				"### 添加一个工具",
				"> 写一个插件，提供读取项目测试报告、汇总失败用例的工具。注册工具，并用一份示例报告验证调用结果。",
				"预期产出：可调用的新工具，以及一次示例调用的验证结果。",
				"### 创建自己的模式",
				"> 基于标准模式创建「代码审查」模式，优先检查潜在错误和测试缺口，指出文件与行号，修改文件前先询问我。保存成可选择的预设。",
				"预期产出：可在新任务中选择的自定义模式。审查要求用于指导 Agent，实际可执行的操作仍由权限设置决定。"
			].join("\n\n")
		};
		/** Japanese copy, checked against the English keys. */
		const guideJa = {
			"modeExplanation": "モードの詳細",
			"howToUse": "使い方",
			"guideSections": "ガイドのセクション",
			"guideExampleTask": "タスク例",
			"guideCopy": "コピー",
			"guideCopied": "コピーしました",
			"guideFootnotes": "脚注",
			"guideStandardIntro": "新しいタスクを始めるときは標準モードを選びます。達成したいことを説明し、関連するファイルを示し、結果の確認方法を伝えてください。",
			"guideStandardExplanation": "### 仕組み\n\nエージェントはツールを直接呼び出してファイルの読み取りや編集、検索、ターミナルコマンドの実行を行います。スキル、計画、目標、サブエージェント、ワークフロー、プラグイン管理、コンテキストの圧縮に対応しています。\n\n### 選ぶべき場面\n\n日々のコーディング、ファイル作業、調査はまずここから始めてください。標準モードではスクリプトの作成やファイルの一括処理も行えます。PTC はツール呼び出しの構成を変えるものであり、一括処理に必須ではありません。",
			"guideStandardUsage": "### バグを修正する\n\n> 検索フォームを二度送信すると結果が消える原因を調べてください。修正して関連するテストを実行し、原因と変更内容を説明してください。\n\n期待される出力: コードの変更、関連するテスト結果、原因の説明。\n\n### プロジェクトのメモを整理する\n\n> このプロジェクト内の Markdown メモを読み、合意された決定と未解決の課題を、元ファイルへのリンク付きで要約してください。\n\n期待される出力: 元のメモと照合できる参照付きの要約。",
			"guidePtcIntro": "新しいタスクを始めるときは PTC モードを選びます。入力ファイル、処理ルール、出力形式を指定してください。コードはエージェントが書きます。",
			"guidePtcExplanation": "### ツールの呼び出され方\n\nPTC は Programmatic Tool Calling の略です。この組み込みプリセットでは、エージェントは run_code を使い、生成された SDK 経由でツールを呼び出す TypeScript プログラムを書きます。プログラムではループ、条件分岐、エラー処理、必要に応じて並行呼び出しを利用できます。\n\n### モデルに届くもの\n\nツールの結果はまずプログラムに届き、そこでフィルタリングや結合ができます。モデルが受け取るのはプログラムが出力または返した内容です。画像の結果は別途添付されます。ネストされたツール呼び出しも記録され、ツール権限の対象のままです。\n\n### 標準モードとの比較\n\nどちらのモードもコーディングや一括処理のタスクを扱えます。標準モードは個々のツールを直接公開し、PTC はツール呼び出しをコードで整理します。現在の PTC プリセットではワークフローとプラグイン管理ツールが無効になっています。速度とトークン消費はタスクやプログラムの結果の扱い方によって変わります。",
			"guidePtcUsage": "### 設定ファイルのセットを検証する\n\n> configs/ 内のすべての JSON ファイルを検査してください。schema.json に基づき、必須フィールドの欠落と無効な値を一覧にしてください。問題ごとに 1 行の CSV を保存してください。読み取れないファイルもレポートに含め、残りの検査は続けてください。元のファイルは変更しないでください。\n\n期待される出力: 問題の要約と CSV レポート。プログラムは同じ検査を繰り返し、個々の失敗に対処し、結果を集約できます。\n\n### エラーログを要約する\n\n> logs/ 内のログファイルを分析してください。エラーをサービスとエラー種別でグループ化し、頻度上位 10 グループと各 1 件の例を示してください。完全な件数を CSV に保存してください。\n\n期待される出力: 上位のエラーグループと完全な件数表。中間データは要約がモデルに届く前にプログラム内で集約できます。",
			"guideMinimalIntro": "新しいタスクには最小モードを選びます。比較を行う場合は、モデル、権限、入力、開始時のワークスペース状態を実行間で一定に保ってください。",
			"guideMinimalExplanation": "### 含まれるもの\n\n永続的なシェルツール 1 つ、read_image、固定のシステムプロンプト。画像の読み取りには画像対応モデルが必要です。古い履歴はコンテキストの負荷に応じて自動的に圧縮されます。エージェントがアイドル状態のときに /compact を使えば手動で圧縮できます。この組み込みプリセットはスキル、計画、標準のランタイムコンテキストを読み込みません。\n\n### 選ぶべき場面\n\n実験や比較のベースラインとして使用します。シェルコマンド経由でファイルの読み取りやスクリプトの実行はできますが、長いタスクを管理するための組み込み手段は少なくなります。ツールが少ないからといって、初心者にとって必ずしも簡単になるわけではありません。",
			"guideMinimalUsage": "### 小さなバグ修正で性能を比較する\n\n> このプロジェクトのテストを実行し、失敗の原因を見つけて最小限の修正をしてください。関連するテストを再度実行し、結果を報告してください。\n\n同じ開始状態から、標準モードと最小モードで同じタスクを別々に実行します。タスクの完了状況、ツール呼び出し、生じた変更を比較してください。最小モードはターミナルコマンドを通じて作業を行います。",
			"guideCordisIntro": "新しいタスクにはクリエイターモードを選びます。実現したい機能、表示される場所、確認方法を説明してください。",
			"guideCordisExplanation": "### 作成できるもの\n\nクリエイターモードには標準的なタスクツールに加え、ランタイムの検査、Cordis プラグインやエージェントプリセットの作成ガイドが含まれます。機能や UI を追加するプラグインを作成することも、特定の作業向けにツールとプロンプトを組み合わせたプリセットを作成することもできます。\n\n### プラグインとモード\n\nプラグインはツール、サービス接続、UI エントリなど、DSH に機能を追加します。モードはエージェントプリセットであり、ツールを選択し、タスク内でのエージェントの動作を定義します。プラグインはカスタムプリセットに含めることができます。\n\n### 結果を反映させる方法\n\nソースコードを生成するだけでなく、エージェントにインストールと確認を依頼してください。プラグインは変更内容によっては即座に読み込まれるか、再起動が必要になる場合があります。新しく作成したプリセットは、新しいタスクを始めるときに選択されます。",
			"guideCordisUsage": "### UI を追加する\n\n> サイドバーにプロジェクトメモのエントリを追加する DSH プラグインを作成してください。このワークスペース内の Markdown ファイルを閲覧でき、選択したメモをプレビューできるようにしてください。インストールしてページが開くことを確認してください。\n\n期待される出力: 動作するエントリとプレビューページを備えた、インストール済みのプラグイン。残っている有効化手順があればそれも含みます。\n\n### ツールを追加する\n\n> このプロジェクトのテストレポートを読み、失敗したテストを要約するツールを備えたプラグインを作成してください。登録し、サンプルのレポートで確認してください。\n\n期待される出力: 呼び出し可能なツールを備えたプラグインと、確認済みのサンプル呼び出し。\n\n### 独自のモードを作成する\n\n> 標準モードをベースに「コードレビュー」モードを作成してください。潜在的なバグとテストの不足を優先し、ファイルパスと行番号を示し、ファイルを変更する前に確認を求めるようにしてください。選択可能なプリセットとして保存してください。\n\n期待される出力: 新しいタスク用のカスタムプリセット。これらのレビュー指示はエージェントを導くものであり、実行できる操作は権限設定によって決まります。"
		};
		/** Spanish dictionary, checked against the English keys. */
		const guideEs = {
			modeExplanation: "Detalles del modo",
			howToUse: "como usar",
			guideSections: "Secciones de guía",
			guideExampleTask: "Tarea de ejemplo",
			guideCopy: "Copiar",
			guideCopied: "Copiado",
			guideFootnotes: "Notas a pie de página",
			guideStandardIntro: "Elija el modo Estándar al iniciar una nueva tarea. Describe lo que quieres lograr, señala los archivos relevantes y explica cómo verificar el resultado.",
			guideStandardExplanation: [
				"### Cómo funciona",
				"El agente llama a herramientas directamente para leer y editar archivos, buscar y ejecutar comandos de terminal. Incluye habilidades, planificación, objetivos, subagentes, flujos de trabajo, gestión de complementos y compactación de contexto.",
				"### Cuándo elegirlo",
				"Comience aquí para la codificación, el trabajo con archivos y la investigación diaria. El modo estándar también puede escribir scripts y procesar archivos en lotes. PTC cambia la forma en que se organizan las llamadas a herramientas; no es necesario para tareas por lotes."
			].join("\n\n\n\n"),
			guideStandardUsage: [
				"### Corregir un error",
				"> Descubra por qué enviar el formulario de búsqueda dos veces hace que los resultados desaparezcan. Arréglalo y ejecuta las pruebas pertinentes. Explique la causa y qué cambió.",
				"Resultado esperado: un cambio de código, los resultados de las pruebas relevantes y una explicación de la causa.",
				"### Organizar notas del proyecto",
				"> Lea las Markdown notas de este proyecto. Resuma las decisiones acordadas y las preguntas abiertas, con enlaces a los archivos fuente.",
				"Resultado esperado: un resumen con referencias que puede comparar con las notas originales."
			].join("\n\n\n\n"),
			guidePtcIntro: "Elija el modo PTC al iniciar una nueva tarea. Especifique los archivos de entrada, las reglas de procesamiento y el formato de salida. El agente escribe el código.",
			guidePtcExplanation: [
				"### Cómo se llaman las herramientas",
				"PTC significa llamada a herramientas programáticas. En este ajuste preestablecido integrado, el agente usa run_code para escribir un programa TypeScript que llama a herramientas a través de un SDK generado. El programa puede utilizar bucles, condiciones, manejo de errores y llamadas simultáneas cuando corresponda.",
				"### Lo que llega al modelo",
				"Los resultados de la herramienta llegan primero al programa, que puede filtrarlos y combinarlos. El modelo recibe lo que el programa imprime o devuelve; Los resultados de la imagen se adjuntan por separado. Las llamadas a herramientas anidadas aún se registran y permanecen sujetas a los permisos de la herramienta.",
				"### Comparado con el modo Estándar",
				"Ambos modos pueden manejar tareas de codificación y por lotes. El modo estándar expone herramientas individuales directamente; PTC organiza llamadas a herramientas en código. El ajuste preestablecido actual PTC deja las herramientas de administración de complementos y flujo de trabajo deshabilitadas. La velocidad y el uso de tokens dependen de la tarea y de cómo el programa maneja sus resultados."
			].join("\n\n\n\n"),
			guidePtcUsage: [
				"### Verifique un conjunto de archivos de configuración",
				"> Verifique todos los JSON archivos en configs/. Enumere los campos obligatorios faltantes y los valores no válidos en el archivo Schema.json. Guarde un CSV con una fila por número. Incluya archivos ilegibles en el informe y siga revisando el resto. Deje los archivos originales sin cambios.",
				"Resultado esperado: un resumen del problema y un informe CSV. El programa puede repetir las mismas comprobaciones, gestionar fallos individuales y recopilar los resultados.",
				"### Resumir registros de errores",
				"> Analizar los archivos de registro en logs/. Agrupe errores por servicio y tipo de error. Muestra los diez grupos más frecuentes y un ejemplo de cada uno. Guarde los recuentos completos en un CSV.",
				"Resultado esperado: los principales grupos de errores y una tabla de recuento completa. Los datos intermedios se pueden agregar en el programa antes de que el resumen llegue al modelo."
			].join("\n\n\n\n"),
			guideMinimalIntro: "Elija el modo mínimo para una nueva tarea. Para realizar una comparación, mantenga constantes el modelo, los permisos, la entrada y el estado inicial del espacio de trabajo en todas las ejecuciones.",
			guideMinimalExplanation: [
				"### ¿Qué está incluido?",
				"Una herramienta de shell persistente, read_image, y un indicador de sistema fijo. La lectura de imágenes requiere un modelo compatible con imágenes. La historia más antigua se compacta automáticamente bajo la presión del contexto; use /compact mientras el agente esté inactivo para compactarlo manualmente. El ajuste preestablecido integrado no carga las habilidades, la planificación ni el contexto de tiempo de ejecución estándar.",
				"### Cuándo elegirlo",
				"Úselo como base para experimentos y comparaciones. Todavía puede leer archivos y ejecutar scripts mediante comandos de shell, pero ofrece menos formas integradas de gestionar una tarea larga. Menos herramientas no necesariamente lo hace más fácil para un principiante."
			].join("\n\n\n\n"),
			guideMinimalUsage: [
				"### Comparar el rendimiento en una pequeña corrección de errores",
				"> Ejecute las pruebas para este proyecto, encuentre la causa del error y realice la solución más pequeña. Ejecute las pruebas pertinentes nuevamente e informe el resultado.",
				"Ejecute la misma tarea por separado en los modos Estándar y Mínimo desde el mismo estado inicial. Compare la finalización de tareas, las llamadas a herramientas y los cambios resultantes. El modo mínimo realiza el trabajo a través de comandos de terminal."
			].join("\n\n\n\n"),
			guideCordisIntro: "Elija el modo Creador para una nueva tarea. Describe la capacidad que deseas, dónde debería aparecer y cómo la verificarás.",
			guideCordisExplanation: [
				"### Lo que puedes crear",
				"El modo Creador incluye las herramientas de tareas estándar además de inspección del tiempo de ejecución y orientación para crear Cordis complementos y ajustes preestablecidos de agentes. Puede crear un complemento que agregue una capacidad o interfaz de usuario, o un ajuste preestablecido que combine herramientas e indicaciones para un trabajo en particular.",
				"### Complementos y modos",
				"Un complemento agrega capacidades a DSH, como una herramienta, una conexión de servicio o una entrada de UI. Un modo es un ajuste preestablecido del agente que selecciona herramientas y define cómo trabaja el agente en una tarea. Se puede incluir un complemento en un ajuste preestablecido personalizado.",
				"### Cómo surte efecto el resultado",
				"Pídale al agente que instale y verifique el resultado, no solo que genere el código fuente. Un complemento puede cargarse inmediatamente o requerir un reinicio, dependiendo de lo que cambie. Se selecciona un ajuste preestablecido recién creado al iniciar una nueva tarea."
			].join("\n\n\n\n"),
			guideCordisUsage: [
				"### Agregar una interfaz de usuario",
				"> Cree un complemento DSH que agregue una entrada de notas del proyecto a la barra lateral. Permítanme explorar los Markdown archivos en este espacio de trabajo y obtener una vista previa de una nota seleccionada. Instálalo y verifica que se abre la página.",
				"Resultado esperado: un complemento instalado con una entrada funcional y una página de vista previa, además de los pasos de activación restantes.",
				"### Agregar una herramienta",
				"> Cree un complemento con una herramienta que lea el informe de prueba de este proyecto y resuma las pruebas fallidas. Regístrelo y verifíquelo con un informe de muestra.",
				"Resultado esperado: un complemento con una herramienta invocable y una llamada de muestra verificada.",
				"### Crear mi propio modo",
				"> Cree un modo de “Revisión de código” basado en el modo Estándar. Haga que priorice posibles errores y pruebe las lagunas, cite rutas y líneas de archivos y pregunte antes de modificar archivos. Guárdelo como un ajuste preestablecido seleccionable.",
				"Resultado esperado: un ajuste preestablecido personalizado para nuevas tareas. Estas instrucciones de revisión guían al agente; La configuración de permisos determina qué acciones puede ejecutar."
			].join("\n\n\n\n")
		};
		/** French dictionary, checked against the English keys. */
		const guideFr = {
			modeExplanation: "Détails du mode",
			howToUse: "Comment utiliser",
			guideSections: "Sections du guide",
			guideExampleTask: "Exemple de tâche",
			guideCopy: "Copier",
			guideCopied: "Copié",
			guideFootnotes: "Notes de bas de page",
			guideStandardIntro: "Choisissez le mode Standard lorsque vous démarrez une nouvelle tâche. Décrivez ce que vous souhaitez accomplir, pointez vers les fichiers pertinents et expliquez comment vérifier le résultat.",
			guideStandardExplanation: [
				"### Comment ça marche",
				"L'agent appelle directement des outils pour lire et modifier des fichiers, rechercher et exécuter des commandes de terminal. Il comprend les compétences, la planification, les objectifs, les sous-agents, les flux de travail, la gestion des plugins et le compactage du contexte.",
				"### Quand le choisir",
				"Commencez ici pour le codage quotidien, le travail sur les fichiers et la recherche. Le mode standard peut également écrire des scripts et traiter des fichiers par lots. PTC modifie la façon dont les appels d'outils sont organisés\xA0; il n'est pas requis pour les tâches par lots."
			].join("\n\n\n\n"),
			guideStandardUsage: [
				"### Correction d'un bug",
				"> Découvrez pourquoi le fait de soumettre deux fois le formulaire de recherche fait disparaître les résultats. Corrigez-le et exécutez les tests appropriés. Expliquez la cause et ce qui a changé.",
				"Résultat attendu\xA0: un changement de code, les résultats des tests pertinents et une explication de la cause.",
				"### Organiser les notes de projet",
				"> Lisez les Markdown notes de ce projet. Résumez les décisions convenues et les questions ouvertes, avec des liens vers les fichiers sources.",
				"Résultat attendu\xA0: un résumé avec des références que vous pouvez vérifier par rapport aux notes originales."
			].join("\n\n\n\n"),
			guidePtcIntro: "Choisissez le mode PTC lorsque vous démarrez une nouvelle tâche. Spécifiez les fichiers d'entrée, les règles de traitement et le format de sortie. L'agent écrit le code.",
			guidePtcExplanation: [
				"### Comment sont appelés les outils",
				"PTC signifie appel d'outil de programmation. Dans ce préréglage intégré, l'agent utilise run_code pour écrire un programme TypeScript qui appelle des outils via un SDK généré. Le programme peut utiliser des boucles, des conditions, une gestion des erreurs et des appels simultanés, le cas échéant.",
				"### Ce qui arrive au modèle",
				"Les résultats des outils parviennent d’abord au programme, qui peut les filtrer et les combiner. Le modèle reçoit ce que le programme imprime ou renvoie\xA0; les résultats des images sont joints séparément. Les appels d'outils imbriqués sont toujours enregistrés et restent soumis aux autorisations de l'outil.",
				"### Par rapport au mode Standard",
				"Les deux modes peuvent gérer les tâches de codage et par lots. Le mode standard expose directement les outils individuels\xA0; PTC organise les appels d'outils dans le code. Le préréglage PTC actuel laisse les outils de gestion de flux de travail et de plugins désactivés. La vitesse et l'utilisation des jetons dépendent de la tâche et de la manière dont le programme gère ses résultats."
			].join("\n\n\n\n"),
			guidePtcUsage: [
				"### Vérifier un ensemble de fichiers de configuration",
				"> Vérifiez tous les JSON fichiers dans configs/. Répertoriez les champs obligatoires manquants et les valeurs non valides par rapport à schema.json. Enregistrez un CSV avec une ligne par numéro. Incluez les fichiers illisibles dans le rapport et continuez à vérifier le reste. Laissez les fichiers originaux inchangés.",
				"Résultat attendu\xA0: un résumé du problème et un rapport CSV. Le programme peut répéter les mêmes vérifications, gérer les échecs individuels et collecter les résultats.",
				"### Résumer les journaux d'erreurs",
				"> Analysez les fichiers journaux dans logs/. Regroupez les erreurs par service et type d’erreur. Montrez les dix groupes les plus fréquents et un exemple de chacun. Enregistrez les décomptes complets dans un CSV.",
				"Résultat attendu\xA0: les principaux groupes d’erreurs et un tableau de décompte complet. Les données intermédiaires peuvent être agrégées dans le programme avant que le résumé n'atteigne le modèle."
			].join("\n\n\n\n"),
			guideMinimalIntro: "Choisissez le mode Minimal pour une nouvelle tâche. À des fins de comparaison, maintenez le modèle, les autorisations, l’entrée et l’état de départ de l’espace de travail constants d’une exécution à l’autre.",
			guideMinimalExplanation: [
				"### Ce qui est inclus",
				"Un outil shell persistant, read_image et une invite système fixe. La lecture d'images nécessite un modèle compatible avec les images. L’historique plus ancien est automatiquement compacté sous la pression du contexte\xA0; utilisez /compact pendant que l'agent est inactif pour le compacter manuellement. Le préréglage intégré ne charge pas les compétences, la planification ou le contexte d'exécution standard.",
				"### Quand le choisir",
				"Utilisez-le comme base de référence pour des expériences et des comparaisons. Il peut toujours lire des fichiers et exécuter des scripts via des commandes shell, mais offre moins de moyens intégrés pour gérer une tâche longue. Moins d’outils ne facilite pas nécessairement la tâche d’un débutant."
			].join("\n\n\n\n"),
			guideMinimalUsage: [
				"### Comparez les performances sur une petite correction de bug",
				"> Exécutez les tests pour ce projet, trouvez la cause de l'échec et effectuez le moindre correctif. Exécutez à nouveau les tests pertinents et rapportez le résultat.",
				"Exécutez la même tâche séparément en modes Standard et Minimal à partir du même état de départ. Comparez l'achèvement des tâches, les appels d'outils et les modifications qui en résultent. Le mode minimal effectue le travail via les commandes du terminal."
			].join("\n\n\n\n"),
			guideCordisIntro: "Choisissez le mode Créateur pour une nouvelle tâche. Décrivez la fonctionnalité souhaitée, où elle doit apparaître et comment vous la vérifierez.",
			guideCordisExplanation: [
				"### Ce que vous pouvez créer",
				"Le mode Créateur inclut les outils de tâches standard, ainsi qu'une inspection d'exécution et des conseils pour la création de Cordis plug-ins et préréglages d'agent. Il peut créer un plugin qui ajoute une fonctionnalité ou une interface utilisateur, ou un préréglage combinant des outils et des invites pour une tâche particulière.",
				"### Plugins et modes",
				"Un plug-in ajoute des fonctionnalités à DSH, telles qu'un outil, une connexion à un service ou une entrée d'interface utilisateur. Un mode est un préréglage d'agent qui sélectionne les outils et définit la manière dont l'agent fonctionne dans une tâche. Un plugin peut être inclus dans un préréglage personnalisé.",
				"### Comment le résultat prend effet",
				"Demandez à l'agent d'installer et de vérifier le résultat, pas seulement de générer le code source. Un plugin peut se charger immédiatement ou nécessiter un redémarrage, en fonction de ce qu'il modifie. Un préréglage nouvellement créé est sélectionné lors du démarrage d'une nouvelle tâche."
			].join("\n\n\n\n"),
			guideCordisUsage: [
				"### Ajouter une interface utilisateur",
				"> Créez un plugin DSH qui ajoute une entrée de notes de projet à la barre latérale. Permettez-moi de parcourir les Markdown fichiers de cet espace de travail et de prévisualiser une note sélectionnée. Installez-le et vérifiez que la page s'ouvre.",
				"Résultat attendu\xA0: un plugin installé avec une page d'entrée et d'aperçu fonctionnelle, ainsi que toutes les étapes d'activation restantes.",
				"### Ajouter un outil",
				"> Créez un plugin avec un outil qui lit le rapport de test de ce projet et résume les tests échoués. Enregistrez-le et vérifiez-le avec un exemple de rapport.",
				"Résultat attendu\xA0: un plugin avec un outil appelable et un exemple d'appel vérifié.",
				"### Créer mon propre mode",
				"> Créer un mode « Revue de code » basé sur le mode Standard. Demandez-lui de prioriser les bogues potentiels et de tester les lacunes, de citer les chemins et les lignes des fichiers et de demander avant de modifier les fichiers. Enregistrez-le en tant que préréglage sélectionnable.",
				"Résultat attendu\xA0: un préréglage personnalisé pour les nouvelles tâches. Ces instructions de révision guident l'agent\xA0; les paramètres d'autorisation déterminent les actions qu'il peut exécuter."
			].join("\n\n\n\n")
		};
		/** German dictionary, checked against the English keys. */
		const guideDe = {
			modeExplanation: "Modusdetails",
			howToUse: "Wie zu verwenden",
			guideSections: "Leitfadenabschnitte",
			guideExampleTask: "Beispielaufgabe",
			guideCopy: "Kopieren",
			guideCopied: "Kopiert",
			guideFootnotes: "Fußnoten",
			guideStandardIntro: "Wählen Sie den Standardmodus, wenn Sie eine neue Aufgabe starten. Beschreiben Sie, was Sie erreichen möchten, zeigen Sie auf die relevanten Dateien und erklären Sie, wie Sie das Ergebnis überprüfen können.",
			guideStandardExplanation: [
				"### Wie es funktioniert",
				"Der Agent ruft Tools direkt auf, um Dateien zu lesen und zu bearbeiten, zu suchen und Terminalbefehle auszuführen. Es umfasst Fähigkeiten, Planung, Ziele, Subagenten, Arbeitsabläufe, Plugin-Verwaltung und Kontextkomprimierung.",
				"### Wann man es wählt",
				"Beginnen Sie hier mit alltäglicher Codierung, Dateiarbeit und Recherche. Im Standardmodus können auch Skripts geschrieben und Dateien stapelweise verarbeitet werden. PTC ändert die Organisation von Toolaufrufen; Für Batch-Aufgaben ist es nicht erforderlich."
			].join("\n\n\n\n"),
			guideStandardUsage: [
				"### Einen Fehler beheben",
				"> Finden Sie heraus, warum das zweimalige Absenden des Suchformulars dazu führt, dass die Ergebnisse verschwinden. Beheben Sie das Problem und führen Sie die entsprechenden Tests durch. Erklären Sie die Ursache und was sich geändert hat.",
				"Erwartete Ausgabe: eine Codeänderung, die relevanten Testergebnisse und eine Erklärung der Ursache.",
				"### Projektnotizen organisieren",
				"> Lesen Sie die Markdown-Hinweise in diesem Projekt. Fassen Sie die vereinbarten Entscheidungen und offenen Fragen zusammen, mit Links zu den Quelldateien.",
				"Erwartete Ausgabe: eine Zusammenfassung mit Referenzen, die Sie mit den Originalnotizen vergleichen können."
			].join("\n\n\n\n"),
			guidePtcIntro: "Wählen Sie den Modus PTC, wenn Sie eine neue Aufgabe starten. Geben Sie die Eingabedateien, Verarbeitungsregeln und das Ausgabeformat an. Der Agent schreibt den Code.",
			guidePtcExplanation: [
				"### Wie Werkzeuge heißen",
				"PTC bedeutet Programmatic Tool Calling. In dieser integrierten Voreinstellung verwendet der Agent run_code, um ein TypeScript-Programm zu schreiben, das Tools über ein generiertes SDK aufruft. Das Programm kann gegebenenfalls Schleifen, Bedingungen, Fehlerbehandlung und gleichzeitige Aufrufe verwenden.",
				"### Was das Modell erreicht",
				"Werkzeugergebnisse gelangen zunächst in das Programm, das diese filtern und kombinieren kann. Das Modell empfängt, was das Programm ausgibt oder zurückgibt; Bildergebnisse sind separat beigefügt. Verschachtelte Werkzeugaufrufe werden weiterhin aufgezeichnet und unterliegen weiterhin den Werkzeugberechtigungen.",
				"### Im Vergleich zum Standardmodus",
				"Beide Modi können Codierungs- und Batch-Aufgaben bewältigen. Im Standardmodus werden einzelne Tools direkt verfügbar gemacht. PTC organisiert Toolaufrufe im Code. Die aktuelle Voreinstellung PTC lässt die Workflow- und Plugin-Verwaltungstools deaktiviert. Geschwindigkeit und Token-Nutzung hängen von der Aufgabe ab und davon, wie das Programm mit seinen Ergebnissen umgeht."
			].join("\n\n\n\n"),
			guidePtcUsage: [
				"### Überprüfen Sie eine Reihe von Konfigurationsdateien",
				"> Überprüfen Sie alle JSON Dateien in configs/. Fehlende Pflichtfelder und ungültige Werte für schema.json auflisten. Speichern Sie eine CSV-Datei mit einer Zeile pro Ausgabe. Fügen Sie unleserliche Dateien in den Bericht ein und überprüfen Sie den Rest weiter. Lassen Sie die Originaldateien unverändert.",
				"Erwartete Ausgabe: eine Problemzusammenfassung und ein CSV-Bericht. Das Programm kann dieselben Prüfungen wiederholen, einzelne Fehler behandeln und die Ergebnisse sammeln.",
				"### Fehlerprotokolle zusammenfassen",
				"> Analysieren Sie die Protokolldateien in logs/. Gruppieren Sie Fehler nach Dienst und Fehlertyp. Zeigen Sie die zehn häufigsten Gruppen und jeweils ein Beispiel. Speichern Sie die vollständigen Zählungen in einer CSV-Datei.",
				"Erwartete Ausgabe: die Top-Fehlergruppen und eine vollständige Zähltabelle. Zwischendaten können im Programm aggregiert werden, bevor die Zusammenfassung das Modell erreicht."
			].join("\n\n\n\n"),
			guideMinimalIntro: "Wählen Sie den Minimalmodus für eine neue Aufgabe. Halten Sie für einen Vergleich das Modell, die Berechtigungen, die Eingabe und den Status des Startarbeitsbereichs über alle Ausführungen hinweg konstant.",
			guideMinimalExplanation: [
				"### Was ist enthalten",
				"Ein persistentes Shell-Tool, read_image, und eine feste Systemeingabeaufforderung. Das Lesen von Bildern erfordert ein bildfähiges Modell. Der ältere Verlauf wird unter Kontextdruck automatisch komprimiert; Verwenden Sie /compact, während der Agent inaktiv ist, um ihn manuell zu komprimieren. Die integrierte Voreinstellung lädt weder Skills, Planung noch den Standardlaufzeitkontext.",
				"### Wann man es wählt",
				"Verwenden Sie es als Grundlage für Experimente und Vergleiche. Es kann weiterhin Dateien lesen und Skripte über Shell-Befehle ausführen, bietet jedoch weniger integrierte Möglichkeiten zur Verwaltung einer langen Aufgabe. Weniger Werkzeuge machen es einem Anfänger nicht unbedingt einfacher."
			].join("\n\n\n\n"),
			guideMinimalUsage: [
				"### Vergleichen Sie die Leistung mit einer kleinen Fehlerbehebung",
				"> Führen Sie die Tests für dieses Projekt durch, finden Sie die Fehlerursache und nehmen Sie die kleinste Lösung vor. Führen Sie die entsprechenden Tests erneut durch und melden Sie das Ergebnis.",
				"Führen Sie dieselbe Aufgabe separat im Standard- und Minimalmodus aus, und zwar im selben Startzustand. Vergleichen Sie die Aufgabenerledigung, Werkzeugaufrufe und die daraus resultierenden Änderungen. Der Minimalmodus führt die Arbeit über Terminalbefehle aus."
			].join("\n\n\n\n"),
			guideCordisIntro: "Wählen Sie den Erstellermodus für eine neue Aufgabe. Beschreiben Sie die gewünschte Funktion, wo sie angezeigt werden soll und wie Sie sie überprüfen.",
			guideCordisExplanation: [
				"### Was Sie erstellen können",
				"Der Erstellermodus umfasst die Standardaufgabentools sowie eine Laufzeitprüfung und Anleitungen zum Erstellen von Cordis-Plugins und Agent-Voreinstellungen. Es kann ein Plugin erstellt werden, das eine Funktion oder Benutzeroberfläche hinzufügt, oder eine Voreinstellung, die Tools und Eingabeaufforderungen für einen bestimmten Job kombiniert.",
				"### Plugins und Modi",
				"Ein Plugin fügt DSH Funktionen hinzu, beispielsweise ein Tool, eine Dienstverbindung oder einen UI-Eintrag. Ein Modus ist eine Agentenvoreinstellung, die Tools auswählt und definiert, wie der Agent in einer Aufgabe arbeitet. Ein Plugin kann in eine benutzerdefinierte Voreinstellung eingebunden werden.",
				"### Wie das Ergebnis wirksam wird",
				"Bitten Sie den Agenten, das Ergebnis zu installieren und zu überprüfen und nicht nur Quellcode zu generieren. Abhängig von den Änderungen kann ein Plugin sofort geladen werden oder einen Neustart erfordern. Beim Starten einer neuen Aufgabe wird eine neu erstellte Voreinstellung ausgewählt."
			].join("\n\n\n\n"),
			guideCordisUsage: [
				"### Fügen Sie eine Benutzeroberfläche hinzu",
				"> Erstellen Sie ein DSH-Plugin, das der Seitenleiste einen Eintrag für Projektnotizen hinzufügt. Lassen Sie mich die Markdown Dateien in diesem Arbeitsbereich durchsuchen und eine Vorschau einer ausgewählten Notiz anzeigen. Installieren Sie es und stellen Sie sicher, dass die Seite geöffnet wird.",
				"Erwartete Ausgabe: ein installiertes Plugin mit einer funktionierenden Einstiegs- und Vorschauseite sowie allen verbleibenden Aktivierungsschritten.",
				"### Ein Werkzeug hinzufügen",
				"> Erstellen Sie ein Plugin mit einem Tool, das den Testbericht dieses Projekts liest und die fehlgeschlagenen Tests zusammenfasst. Registrieren Sie es und überprüfen Sie es anhand eines Beispielberichts.",
				"Erwartete Ausgabe: ein Plugin mit einem aufrufbaren Tool und einem verifizierten Beispielaufruf.",
				"### Erstelle meinen eigenen Modus",
				"> Erstellen Sie einen „Code Review“-Modus basierend auf dem Standardmodus. Lassen Sie potenzielle Fehler priorisieren und Lücken testen, geben Sie Dateipfade und -zeilen an und fragen Sie nach, bevor Sie Dateien ändern. Speichern Sie es als auswählbare Voreinstellung.",
				"Erwartete Ausgabe: eine benutzerdefinierte Voreinstellung für neue Aufgaben. Diese Überprüfungsanweisungen leiten den Agenten; Berechtigungseinstellungen bestimmen, welche Aktionen ausgeführt werden können."
			].join("\n\n\n\n")
		};
		/** Russian dictionary, checked against the English keys. */
		const guideRu = {
			modeExplanation: "Подробности режима",
			howToUse: "Как использовать",
			guideSections: "Разделы руководства",
			guideExampleTask: "Пример задачи",
			guideCopy: "Копировать",
			guideCopied: "Скопировано",
			guideFootnotes: "Сноски",
			guideStandardIntro: "Выбирайте стандартный режим при запуске новой задачи. Опишите, чего вы хотите добиться, укажите соответствующие файлы и объясните, как проверить результат.",
			guideStandardExplanation: [
				"### Как это работает",
				"Агент напрямую вызывает инструменты для чтения и редактирования файлов, поиска и выполнения команд терминала. Он включает в себя навыки, планирование, цели, субагенты, рабочие процессы, управление плагинами и сжатие контекста.",
				"### Когда это выбирать",
				"Начните здесь ежедневное программирование, работу с файлами и исследования. Стандартный режим также позволяет писать сценарии и обрабатывать файлы в пакетном режиме. PTC изменяет организацию вызовов инструментов; для пакетных задач это не требуется."
			].join("\n\n\n\n"),
			guideStandardUsage: [
				"### Исправить ошибку",
				"> Узнайте, почему при двойной отправке формы поиска результаты исчезают. Исправьте это и запустите соответствующие тесты. Объясните причину и что изменилось.",
				"Ожидаемый результат: изменение кода, соответствующие результаты испытаний и объяснение причины.",
				"### Организация заметок по проекту",
				"> Прочтите примечания Markdown в этом проекте. Кратко изложите согласованные решения и открытые вопросы со ссылками на исходные файлы.",
				"Ожидаемый результат: резюме со ссылками, которые вы можете сверить с исходными заметками."
			].join("\n\n\n\n"),
			guidePtcIntro: "Выберите режим PTC при запуске новой задачи. Укажите входные файлы, правила обработки и выходной формат. Агент пишет код.",
			guidePtcExplanation: [
				"### Как называются инструменты",
				"PTC означает программный вызов инструмента. В этой встроенной настройке агент использует run_code для написания программы TypeScript, которая вызывает инструменты через сгенерированный SDK. Программа может использовать циклы, условия, обработку ошибок и параллельные вызовы, где это необходимо.",
				"### Что достигает модели",
				"Результаты инструмента сначала поступают в программу, которая может их фильтровать и комбинировать. Модель получает то, что программа печатает или возвращает; Результаты изображения прилагаются отдельно. Вызовы вложенных инструментов по-прежнему записываются, и для них действуют разрешения инструмента.",
				"### По сравнению со стандартным режимом",
				"Оба режима могут выполнять кодирование и пакетные задачи. Стандартный режим напрямую предоставляет доступ к отдельным инструментам; PTC организует вызовы инструментов в коде. Текущая предустановка PTC оставляет инструменты управления рабочим процессом и плагинами отключенными. Скорость и использование токенов зависят от задачи и того, как программа обрабатывает ее результаты."
			].join("\n\n\n\n"),
			guidePtcUsage: [
				"### Проверка набора файлов конфигурации",
				"> Проверьте все файлы JSON в configs/. Перечислите отсутствующие обязательные поля и недопустимые значения в файле Schema.json. Сохраните CSV-файл с одной строкой на каждую проблему. Включите в отчет нечитаемые файлы и продолжайте проверять остальные. Оставьте исходные файлы без изменений.",
				"Ожидаемый результат: краткое описание проблемы и отчет в формате CSV. Программа может повторять одни и те же проверки, обрабатывать отдельные сбои и собирать результаты.",
				"### Обобщение журналов ошибок",
				"> Проанализируйте файлы журналов в logs/. Группируйте ошибки по сервису и типу ошибки. Покажите десять наиболее часто встречающихся групп и по одному примеру из каждой. Сохраните полные данные в формате CSV.",
				"Ожидаемый результат: основные группы ошибок и полная таблица подсчета. Промежуточные данные могут быть агрегированы в программе до того, как сводка достигнет модели."
			].join("\n\n\n\n"),
			guideMinimalIntro: "Выберите минимальный режим для новой задачи. Для сравнения сохраняйте постоянство модели, разрешений, входных данных и состояния начальной рабочей области во всех запусках.",
			guideMinimalExplanation: [
				"### Что включено",
				"Один постоянный инструмент оболочки read_image и фиксированное системное приглашение. Для чтения изображений требуется модель с поддержкой изображений. Старая история автоматически сжимается под давлением контекста; используйте /compact, пока агент простаивает, чтобы сжать его вручную. Встроенная предустановка не загружает навыки, планирование или стандартный контекст времени выполнения.",
				"### Когда это выбирать",
				"Используйте его как основу для экспериментов и сравнений. Он по-прежнему может читать файлы и выполнять сценарии с помощью команд оболочки, но предлагает меньше встроенных способов управления длительными задачами. Меньшее количество инструментов не обязательно облегчает работу новичку."
			].join("\n\n\n\n"),
			guideMinimalUsage: [
				"### Сравните производительность с исправлением небольшой ошибки",
				"> Запустите тесты для этого проекта, найдите причину сбоя и внесите минимальные исправления. Запустите соответствующие тесты еще раз и сообщите о результате.",
				"Запустите одну и ту же задачу отдельно в стандартном и минимальном режимах из одного и того же начального состояния. Сравните выполнение задач, вызовы инструментов и результирующие изменения. Минимальный режим выполняет работу посредством команд терминала."
			].join("\n\n\n\n"),
			guideCordisIntro: "Выберите режим «Создатель» для новой задачи. Опишите желаемую возможность, где она должна появиться и как вы ее проверите.",
			guideCordisExplanation: [
				"### Что вы можете создать",
				"Режим Creator включает в себя стандартные инструменты задач, а также проверку во время выполнения и рекомендации по созданию подключаемых модулей Cordis и предустановок агента. Он может создать плагин, добавляющий возможности или пользовательский интерфейс, или предустановку, объединяющую инструменты и подсказки для конкретной работы.",
				"### Плагины и режимы",
				"Плагин добавляет к DSH возможности, такие как инструмент, подключение к службе или запись пользовательского интерфейса. Режим — это предустановка агента, которая выбирает инструменты и определяет, как агент работает над задачей. Плагин может быть включен в пользовательский пресет.",
				"### Как результат вступает в силу",
				"Попросите агента установить и проверить результат, а не просто генерировать исходный код. Плагин может загрузиться немедленно или потребовать перезагрузки, в зависимости от того, что он меняет. Вновь созданный пресет выбирается при запуске новой задачи."
			].join("\n\n\n\n"),
			guideCordisUsage: [
				"### Добавьте пользовательский интерфейс",
				"> Создайте плагин DSH, который добавляет запись примечаний к проекту на боковую панель. Позвольте мне просмотреть файлы Markdown в этом рабочем пространстве и просмотреть выбранную заметку. Установите его и убедитесь, что страница открывается.",
				"Ожидаемый результат: установленный плагин с работающей страницей входа и предварительного просмотра, а также все оставшиеся шаги активации.",
				"### Добавить инструмент",
				"> Создайте плагин с инструментом, который читает отчет об испытаниях этого проекта и суммирует неудачные тесты. Зарегистрируйте его и проверьте с помощью образца отчета.",
				"Ожидаемый результат: плагин с вызываемым инструментом и проверенным примером вызова.",
				"### Создать свой режим",
				"> Создайте режим «Проверка кода» на основе стандартного режима. Попросите его определить приоритетность потенциальных ошибок и проверить пробелы, указать пути и строки к файлам и спросить, прежде чем изменять файлы. Сохраните его как выбираемую предустановку.",
				"Ожидаемый результат: индивидуальная настройка для новых задач. Эти инструкции по проверке помогут агенту; настройки разрешений определяют, какие действия он может выполнять."
			].join("\n\n\n\n")
		};
		/** Portuguese dictionary, checked against the English keys. */
		const guidePt = {
			modeExplanation: "Detalhes do modo",
			howToUse: "Como usar",
			guideSections: "Seções do guia",
			guideExampleTask: "Tarefa de exemplo",
			guideCopy: "Copiar",
			guideCopied: "Copiado",
			guideFootnotes: "Notas de rodapé",
			guideStandardIntro: "Escolha o modo Padrão ao iniciar uma nova tarefa. Descreva o que você deseja realizar, indique os arquivos relevantes e explique como verificar o resultado.",
			guideStandardExplanation: [
				"### Como funciona",
				"O agente chama ferramentas diretamente para ler e editar arquivos, pesquisar e executar comandos de terminal. Inclui habilidades, planejamento, metas, subagentes, fluxos de trabalho, gerenciamento de plugins e compactação de contexto.",
				"### Quando escolher",
				"Comece aqui para codificação diária, trabalho de arquivo e pesquisa. O modo padrão também pode escrever scripts e processar arquivos em lotes. PTC altera a forma como as chamadas de ferramenta são organizadas; não é necessário para tarefas em lote."
			].join("\n\n\n\n"),
			guideStandardUsage: [
				"### Corrigir um bug",
				"> Descubra por que enviar o formulário de pesquisa duas vezes faz com que os resultados desapareçam. Corrija-o e execute os testes relevantes. Explique a causa e o que mudou.",
				"Resultado esperado: uma alteração de código, os resultados de teste relevantes e uma explicação da causa.",
				"### Organize notas do projeto",
				"> Leia as Markdown notas deste projeto. Resuma as decisões acordadas e as questões abertas, com links para os arquivos originais.",
				"Resultado esperado: um resumo com referências que você pode comparar com as notas originais."
			].join("\n\n\n\n"),
			guidePtcIntro: "Escolha o modo PTC ao iniciar uma nova tarefa. Especifique os arquivos de entrada, regras de processamento e formato de saída. O agente escreve o código.",
			guidePtcExplanation: [
				"### Como as ferramentas são chamadas",
				"PTC significa chamada de ferramenta programática. Nesta predefinição integrada, o agente usa run_code para escrever um programa TypeScript que chama ferramentas por meio de um SDK gerado. O programa pode usar loops, condições, tratamento de erros e chamadas simultâneas quando apropriado.",
				"### O que chega ao modelo",
				"Os resultados da ferramenta chegam primeiro ao programa, que pode filtrá-los e combiná-los. O modelo recebe o que o programa imprime ou retorna; os resultados da imagem são anexados separadamente. As chamadas de ferramentas aninhadas ainda são gravadas e permanecem sujeitas às permissões da ferramenta.",
				"### Comparado com o modo Padrão",
				"Ambos os modos podem lidar com tarefas de codificação e em lote. O modo padrão expõe ferramentas individuais diretamente; PTC organiza chamadas de ferramentas em código. A predefinição PTC atual deixa o fluxo de trabalho e as ferramentas de gerenciamento de plug-ins desativados. A velocidade e o uso do token dependem da tarefa e de como o programa lida com seus resultados."
			].join("\n\n\n\n"),
			guidePtcUsage: [
				"### Verifique um conjunto de arquivos de configuração",
				"> Verifique todos os arquivos JSON em configs/. Liste os campos obrigatórios ausentes e os valores inválidos em relação ao schema.json. Salve um CSV com uma linha por problema. Inclua arquivos ilegíveis no relatório e continue verificando o restante. Deixe os arquivos originais inalterados.",
				"Resultado esperado: um resumo do problema e um relatório CSV. O programa pode repetir as mesmas verificações, tratar falhas individuais e coletar os resultados.",
				"### Resumir logs de erros",
				"> Analise os arquivos de log em logs/. Agrupe erros por serviço e tipo de erro. Mostre os dez grupos mais frequentes e um exemplo de cada. Salve as contagens completas em um CSV.",
				"Resultado esperado: os principais grupos de erros e uma tabela de contagem completa. Os dados intermediários podem ser agregados no programa antes que o resumo chegue ao modelo."
			].join("\n\n\n\n"),
			guideMinimalIntro: "Escolha o modo Mínimo para uma nova tarefa. Para uma comparação, mantenha o modelo, as permissões, a entrada e o estado inicial do espaço de trabalho constantes em todas as execuções.",
			guideMinimalExplanation: [
				"### O que está incluído",
				"Uma ferramenta de shell persistente, read_image, e um prompt de sistema fixo. A leitura de imagens requer um modelo com capacidade de imagem. O histórico mais antigo é compactado automaticamente sob pressão do contexto; use /compact enquanto o agente estiver ocioso para compactá-lo manualmente. A predefinição integrada não carrega habilidades, planejamento ou contexto de tempo de execução padrão.",
				"### Quando escolher",
				"Use-o como base para experimentos e comparações. Ele ainda pode ler arquivos e executar scripts por meio de comandos shell, mas oferece menos maneiras integradas de gerenciar uma tarefa longa. Menos ferramentas não torna necessariamente mais fácil para um iniciante."
			].join("\n\n\n\n"),
			guideMinimalUsage: [
				"### Compare o desempenho em uma pequena correção de bug",
				"> Execute os testes para este projeto, encontre a causa da falha e faça a menor correção. Execute os testes relevantes novamente e relate o resultado.",
				"Execute a mesma tarefa separadamente nos modos Padrão e Mínimo a partir do mesmo estado inicial. Compare a conclusão da tarefa, as chamadas de ferramentas e as alterações resultantes. O modo mínimo executa o trabalho por meio de comandos de terminal."
			].join("\n\n\n\n"),
			guideCordisIntro: "Escolha o modo Criador para uma nova tarefa. Descreva o recurso desejado, onde ele deve aparecer e como você o verificará.",
			guideCordisExplanation: [
				"### O que você pode criar",
				"O modo Criador inclui ferramentas de tarefas padrão, além de inspeção de tempo de execução e orientação para criação de Cordis plug-ins e predefinições de agente. Ele pode criar um plug-in que adicione um recurso ou UI, ou uma predefinição que combine ferramentas e prompts para um trabalho específico.",
				"### Plug-ins e modos",
				"Um plug-in adiciona recursos a DSH, como uma ferramenta, uma conexão de serviço ou uma entrada de IU. Um modo é uma predefinição de agente que seleciona ferramentas e define como o agente trabalha em uma tarefa. Um plugin pode ser incluído em uma predefinição personalizada.",
				"### Como o resultado entra em vigor",
				"Peça ao agente para instalar e verificar o resultado, não apenas gerar o código-fonte. Um plug-in pode carregar imediatamente ou exigir uma reinicialização, dependendo do que for alterado. Uma predefinição recém-criada é selecionada ao iniciar uma nova tarefa."
			].join("\n\n\n\n"),
			guideCordisUsage: [
				"### Adicionar uma IU",
				"> Crie um plug-in DSH que adicione uma entrada de notas do projeto à barra lateral. Deixe-me navegar pelos arquivos Markdown nesta área de trabalho e visualizar uma nota selecionada. Instale-o e verifique se a página abre.",
				"Resultado esperado: um plug-in instalado com uma entrada funcional e uma página de visualização, além de quaisquer etapas de ativação restantes.",
				"### Adicionar uma ferramenta",
				"> Crie um plugin com uma ferramenta que leia o relatório de teste deste projeto e resuma os testes que falharam. Registre-o e verifique-o com um relatório de amostra.",
				"Resultado esperado: um plugin com uma ferramenta que pode ser chamada e uma chamada de amostra verificada.",
				"### Crie meu próprio modo",
				"> Crie um modo “Revisão de código” baseado no modo Padrão. Faça com que ele priorize possíveis bugs e teste lacunas, cite caminhos e linhas de arquivos e pergunte antes de modificar arquivos. Salve-o como uma predefinição selecionável.",
				"Resultado esperado: uma predefinição personalizada para novas tarefas. Estas instruções de revisão orientam o agente; as configurações de permissão determinam quais ações ele pode executar."
			].join("\n\n\n\n")
		};
		//#endregion
		//#region ../../preset/agent-preset-registry/src/display.ts
		const BUILT_IN_PRESET_KEYS = {
			standard: {
				name: "presetStandardName",
				description: "presetStandardDescription"
			},
			ptc: {
				name: "presetPtcName",
				description: "presetPtcDescription"
			},
			minimal: {
				name: "presetMinimalName",
				description: "presetMinimalDescription"
			},
			cordis: {
				name: "presetCordisName",
				description: "presetCordisDescription"
			}
		};
		/**
		* Whether a roster row is one of the shipped presets whose copy the dictionaries carry.
		* A shipped preset publishes no `name`; a declaration that names itself owns its copy.
		* @param preset - roster row.
		* @returns true for a shipped preset id without a published name.
		*/
		function isBuiltInPreset(preset) {
			return preset.name === void 0 && BUILT_IN_PRESET_KEYS[preset.id] !== void 0;
		}
		/**
		* Resolve preset display copy without making user-authored metadata translatable.
		* @param preset - roster row whose copy is being rendered.
		* @param t - active locale lookup covering {@link BuiltInPresetCopyKey}.
		* @returns localized copy for a known shipped preset, otherwise declaration metadata.
		*/
		function presetDisplayText(preset, t) {
			const keys = isBuiltInPreset(preset) ? BUILT_IN_PRESET_KEYS[preset.id] : void 0;
			if (keys !== void 0) return {
				name: t(keys.name),
				description: t(keys.description)
			};
			return {
				name: preset.name ?? preset.id,
				...preset.description === void 0 ? {} : { description: preset.description }
			};
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Locale bundles for the agent-preset hero chip, header label, and management section. */
		/** English copy. */
		const en = {
			...guideEn,
			builtInGroup: "Built-in",
			customGroup: "Custom",
			sectionIntro: "Choose the agent’s tools and how it works. Use Standard mode for everyday tasks, or Creator mode to add capabilities to DSH.",
			seatHint: "Choose the agent preset for your new task",
			headerHint: "The agent preset chosen when this task started",
			nav: "Agent presets",
			setDefault: "Set as new task default",
			view: "View configuration",
			presetStandardName: "Standard mode",
			presetStandardDescription: "Work with code, files, and information. Suitable for most tasks, with search, editing, terminal commands, and other tools available as needed.",
			presetPtcName: "PTC mode",
			presetPtcDescription: "Includes all Standard mode capabilities. Better suited to tasks that call tools in batches and then filter, organize, deduplicate, count, or summarize the results.",
			presetMinimalName: "Minimal mode",
			presetMinimalDescription: "The agent uses a terminal and image reading, with context compaction. Useful for testing and comparing its basic performance.",
			presetCordisName: "Creator mode",
			presetCordisDescription: "Customize DSH through conversation. Let the agent write plugins that add features or UI, or combine tools and prompts to create your own mode.",
			inUse: "New task default",
			noDescription: "No description.",
			brokenBadge: "Failed to load",
			switchRefused: "Could not switch to {name}: {reason}",
			standardUnavailable: "Standard mode is unavailable. Restore it or choose another available mode.",
			close: "Close",
			creatorDraft: "Let the agent help me create a preset",
			createPlugin: "Let the agent create a plugin",
			createPluginDescription: "Enter Creator mode and make your own DSH plugin",
			createPluginChecking: "Checking whether Creator mode is available",
			createPluginUnavailable: "Temporarily unavailable. Reopen this menu to retry",
			createPluginMissing: "Creator mode is not included in this configuration"
		};
		/** Simplified Chinese copy. */
		const zh = {
			...guideZh,
			builtInGroup: "内置",
			customGroup: "自定义",
			sectionIntro: "选择 Agent 的工具和工作方式。日常任务用「标准模式」，扩展 DSH 的能力用「创造模式」。",
			seatHint: "选择新任务使用的 Agent 预设",
			headerHint: "本任务的 Agent 预设，在任务开始时确定",
			nav: "Agent 预设",
			setDefault: "设为新任务默认",
			view: "查看配置",
			presetStandardName: "标准模式",
			presetStandardDescription: "处理代码、文件和资料，适合大多数任务。Agent 会按需使用检索、编辑和终端等工具。",
			presetPtcName: "PTC 模式",
			presetPtcDescription: "包含标准模式的所有能力，更适合批量调用工具，并对结果进行筛选、整理、去重、统计或汇总的任务。",
			presetMinimalName: "极简模式",
			presetMinimalDescription: "Agent 使用终端和图片读取工具，并支持上下文压缩，适合测试和对比其基础表现。",
			presetCordisName: "创造模式",
			presetCordisDescription: "用对话定制 DSH：让 Agent 编写插件，添加新功能或界面；也能组合工具和提示词，创建自己的模式。",
			inUse: "新任务默认",
			noDescription: "暂无描述。",
			brokenBadge: "加载失败",
			switchRefused: "无法切换到「{name}」：{reason}",
			standardUnavailable: "标准模式不可用，请恢复该模式或选择其他可用模式。",
			close: "关闭",
			creatorDraft: "让 Agent 帮我创建预设模式",
			createPlugin: "让 Agent 创建插件",
			createPluginDescription: "进入创造模式，制作属于你的 DSH 插件",
			createPluginChecking: "正在确认创造模式是否可用",
			createPluginUnavailable: "暂时不可用，请重新打开菜单重试",
			createPluginMissing: "当前配置未提供创造模式"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			...guideJa,
			"builtInGroup": "組み込み",
			"customGroup": "カスタム",
			"sectionIntro": "エージェントのツールと動作を選択します。日々のタスクには標準モードを、DSH に機能を追加するにはクリエイターモードを使用してください。",
			"seatHint": "新しいタスクで使用するエージェントプリセットを選択",
			"headerHint": "このタスクの開始時に選択されたエージェントプリセット",
			"nav": "エージェントプリセット",
			"setDefault": "新しいタスクの既定に設定",
			"view": "設定を表示",
			"presetStandardName": "標準モード",
			"presetStandardDescription": "コード、ファイル、情報を扱います。検索、編集、ターミナルコマンドなどのツールを必要に応じて利用でき、ほとんどのタスクに適しています。",
			"presetPtcName": "PTC モード",
			"presetPtcDescription": "標準モードのすべての機能を含みます。ツールを一括で呼び出し、その結果を絞り込み、整理、重複排除、集計、要約するタスクに適しています。",
			"presetMinimalName": "最小モード",
			"presetMinimalDescription": "エージェントはターミナルと画像読み取りを使用し、コンテキスト圧縮にも対応します。基本的な性能のテストや比較に役立ちます。",
			"presetCordisName": "クリエイターモード",
			"presetCordisDescription": "会話を通じて DSH をカスタマイズします。機能や UI を追加するプラグインをエージェントに書かせたり、ツールとプロンプトを組み合わせて独自のモードを作成したりできます。",
			"inUse": "新しいタスクの既定",
			"noDescription": "説明はありません。",
			"brokenBadge": "読み込みに失敗",
			"switchRefused": "{name} に切り替えられませんでした: {reason}",
			"standardUnavailable": "標準モードは利用できません。復元するか、利用可能な別のモードを選択してください。",
			"close": "閉じる",
			"creatorDraft": "エージェントにプリセット作成を手伝ってもらう",
			"createPlugin": "エージェントにプラグインを作成してもらう",
			"createPluginDescription": "クリエイターモードに入り、独自の DSH プラグインを作成",
			"createPluginChecking": "クリエイターモードが利用可能か確認中",
			"createPluginUnavailable": "一時的に利用できません。このメニューを開き直して再試行してください",
			"createPluginMissing": "この構成にはクリエイターモードが含まれていません"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			...guideEs,
			builtInGroup: "Incorporado",
			customGroup: "personalizado",
			sectionIntro: "Elija las herramientas del agente y cómo funciona. Utilice el modo Estándar para las tareas diarias o el modo Creador para agregar capacidades a DSH.",
			seatHint: "Elija el agente preestablecido para su nueva tarea",
			headerHint: "El agente preestablecido elegido cuando comenzó esta tarea",
			nav: "Ajustes preestablecidos del agente",
			setDefault: "Establecer como nueva tarea predeterminada",
			view: "Ver configuración",
			presetStandardName: "Modo estándar",
			presetStandardDescription: "Trabaje con código, archivos e información. Adecuado para la mayoría de las tareas, con búsqueda, edición, comandos de terminal y otras herramientas disponibles según sea necesario.",
			presetPtcName: "Modo PTC",
			presetPtcDescription: "Incluye todas las capacidades del modo Estándar. Más adecuado para tareas que llaman a herramientas en lotes y luego filtran, organizan, deduplican, cuentan o resumen los resultados.",
			presetMinimalName: "modo mínimo",
			presetMinimalDescription: "El agente utiliza un terminal y lectura de imágenes, con compactación de contexto. Útil para probar y comparar su rendimiento básico.",
			presetCordisName: "Modo creador",
			presetCordisDescription: "Personaliza DSH a través de la conversación. Deje que el agente escriba complementos que agreguen funciones o interfaz de usuario, o combine herramientas e indicaciones para crear su propio modo.",
			inUse: "Nueva tarea predeterminada",
			noDescription: "Sin descripción.",
			brokenBadge: "No se pudo cargar",
			switchRefused: "No se pudo cambiar a {name}: {reason}",
			standardUnavailable: "El modo estándar no está disponible. Restáuralo o elige otro modo disponible.",
			close: "Cerrar",
			creatorDraft: "Deja que el agente me ayude a crear un preset",
			createPlugin: "Deje que el agente cree un complemento",
			createPluginDescription: "Ingrese al modo Creador y cree su propio complemento DSH",
			createPluginChecking: "Comprobando si el modo Creador está disponible",
			createPluginUnavailable: "Temporalmente no disponible. Vuelve a abrir este menú para volver a intentarlo.",
			createPluginMissing: "El modo creador no está incluido en esta configuración."
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			...guideFr,
			builtInGroup: "Intégré",
			customGroup: "Personnalisé",
			sectionIntro: "Choisissez les outils de l’agent et son fonctionnement. Utilisez le mode Standard pour les tâches quotidiennes ou le mode Créateur pour ajouter des fonctionnalités à DSH.",
			seatHint: "Choisissez le préréglage d'agent pour votre nouvelle tâche",
			headerHint: "Le préréglage d'agent choisi au démarrage de cette tâche",
			nav: "Préréglages d'agent",
			setDefault: "Définir comme nouvelle tâche par défaut",
			view: "Afficher la configuration",
			presetStandardName: "Mode standard",
			presetStandardDescription: "Travaillez avec du code, des fichiers et des informations. Convient à la plupart des tâches, avec recherche, édition, commandes de terminal et autres outils disponibles selon les besoins.",
			presetPtcName: "Mode PTC",
			presetPtcDescription: "Inclut toutes les fonctionnalités du mode Standard. Mieux adapté aux tâches qui appellent des outils par lots, puis filtrent, organisent, dédupliquent, comptent ou résument les résultats.",
			presetMinimalName: "Mode minimal",
			presetMinimalDescription: "L'agent utilise un terminal et une lecture d'image, avec compactage du contexte. Utile pour tester et comparer ses performances de base.",
			presetCordisName: "Mode Créateur",
			presetCordisDescription: "Personnalisez DSH via la conversation. Laissez l'agent écrire des plugins qui ajoutent des fonctionnalités ou une interface utilisateur, ou combinez des outils et des invites pour créer votre propre mode.",
			inUse: "Nouvelle tâche par défaut",
			noDescription: "Aucune description.",
			brokenBadge: "Échec du chargement",
			switchRefused: "Impossible de passer à {name}\xA0: {reason}",
			standardUnavailable: "Le mode standard n'est pas disponible. Restaurez-le ou choisissez un autre mode disponible.",
			close: "Fermer",
			creatorDraft: "Laissez l'agent m'aider à créer un préréglage",
			createPlugin: "Laissez l'agent créer un plugin",
			createPluginDescription: "Entrez en mode Créateur et créez votre propre plugin DSH",
			createPluginChecking: "Vérifier si le mode Créateur est disponible",
			createPluginUnavailable: "Temporairement indisponible. Rouvrez ce menu pour réessayer",
			createPluginMissing: "Le mode Créateur n'est pas inclus dans cette configuration"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			...guideDe,
			builtInGroup: "Eingebaut",
			customGroup: "Benutzerdefiniert",
			sectionIntro: "Wählen Sie die Tools des Agenten und deren Funktionsweise aus. Verwenden Sie den Standardmodus für alltägliche Aufgaben oder den Creator-Modus, um DSH Funktionen hinzuzufügen.",
			seatHint: "Wählen Sie die Agentenvoreinstellung für Ihre neue Aufgabe",
			headerHint: "Die Agentenvoreinstellung, die beim Start dieser Aufgabe ausgewählt wurde",
			nav: "Agentenvoreinstellungen",
			setDefault: "Als Standard für neue Aufgabe festlegen",
			view: "Konfiguration anzeigen",
			presetStandardName: "Standardmodus",
			presetStandardDescription: "Arbeiten Sie mit Code, Dateien und Informationen. Geeignet für die meisten Aufgaben, da bei Bedarf Suche, Bearbeitung, Terminalbefehle und andere Tools verfügbar sind.",
			presetPtcName: "PTC-Modus",
			presetPtcDescription: "Beinhaltet alle Funktionen des Standardmodus. Besser geeignet für Aufgaben, bei denen Tools stapelweise aufgerufen und die Ergebnisse dann gefiltert, organisiert, dedupliziert, gezählt oder zusammengefasst werden.",
			presetMinimalName: "Minimalmodus",
			presetMinimalDescription: "Der Agent verwendet ein Terminal und das Lesen von Bildern mit Kontextkomprimierung. Nützlich zum Testen und Vergleichen der Grundleistung.",
			presetCordisName: "Erstellermodus",
			presetCordisDescription: "Passen Sie DSH durch Gespräche an. Lassen Sie den Agenten Plugins schreiben, die Funktionen oder Benutzeroberflächen hinzufügen, oder kombinieren Sie Tools und Eingabeaufforderungen, um Ihren eigenen Modus zu erstellen.",
			inUse: "Neuer Aufgabenstandard",
			noDescription: "Keine Beschreibung.",
			brokenBadge: "Laden fehlgeschlagen",
			switchRefused: "Konnte nicht zu {name} wechseln: {reason}",
			standardUnavailable: "Der Standardmodus ist nicht verfügbar. Stellen Sie es wieder her oder wählen Sie einen anderen verfügbaren Modus.",
			close: "Schließen",
			creatorDraft: "Lassen Sie sich vom Agenten beim Erstellen einer Voreinstellung helfen",
			createPlugin: "Lassen Sie den Agenten ein Plugin erstellen",
			createPluginDescription: "Wechseln Sie in den Erstellermodus und erstellen Sie Ihr eigenes DSH-Plugin",
			createPluginChecking: "Prüfen, ob der Creator-Modus verfügbar ist",
			createPluginUnavailable: "Vorübergehend nicht verfügbar. Öffnen Sie dieses Menü erneut, um es erneut zu versuchen",
			createPluginMissing: "Der Creator-Modus ist in dieser Konfiguration nicht enthalten"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			...guideRu,
			builtInGroup: "Встроенный",
			customGroup: "Пользовательский",
			sectionIntro: "Выбирайте инструменты агента и то, как они работают. Используйте стандартный режим для повседневных задач или режим Creator, чтобы расширить возможности DSH.",
			seatHint: "Выберите предустановку агента для вашей новой задачи",
			headerHint: "Предварительная настройка агента, выбранная при запуске этой задачи",
			nav: "Настройки агента",
			setDefault: "Установить в качестве новой задачи по умолчанию",
			view: "Посмотреть конфигурацию",
			presetStandardName: "Стандартный режим",
			presetStandardDescription: "Работайте с кодом, файлами и информацией. Подходит для большинства задач, с поиском, редактированием, командами терминала и другими инструментами, доступными по мере необходимости.",
			presetPtcName: "Режим PTC",
			presetPtcDescription: "Включает все возможности стандартного режима. Лучше подходит для задач, которые вызывают инструменты в пакетном режиме, а затем фильтруют, организуют, дедуплицируют, подсчитывают или суммируют результаты.",
			presetMinimalName: "Минимальный режим",
			presetMinimalDescription: "Агент использует терминал и чтение изображений со сжатием контекста. Полезно для тестирования и сравнения его базовой производительности.",
			presetCordisName: "Режим автора",
			presetCordisDescription: "Настройте DSH через разговор. Позвольте агенту писать плагины, которые добавляют функции или пользовательский интерфейс, или комбинируйте инструменты и подсказки для создания собственного режима.",
			inUse: "Новая задача по умолчанию",
			noDescription: "Нет описания.",
			brokenBadge: "Не удалось загрузить",
			switchRefused: "Не удалось переключиться на {name}: {reason}",
			standardUnavailable: "Стандартный режим недоступен. Восстановите его или выберите другой доступный режим.",
			close: "Закрыть",
			creatorDraft: "Позвольте агенту помочь мне создать пресет",
			createPlugin: "Позвольте агенту создать плагин",
			createPluginDescription: "Войдите в режим Creator и создайте свой собственный плагин DSH.",
			createPluginChecking: "Проверка доступности режима Creator",
			createPluginUnavailable: "Временно недоступен. Откройте это меню еще раз, чтобы повторить попытку.",
			createPluginMissing: "Режим Creator не включен в эту конфигурацию."
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			...guidePt,
			builtInGroup: "Integrado",
			customGroup: "Personalizado",
			sectionIntro: "Escolha as ferramentas do agente e como funciona. Use o modo Padrão para tarefas diárias ou o modo Criador para adicionar recursos ao DSH.",
			seatHint: "Escolha a predefinição de agente para sua nova tarefa",
			headerHint: "A predefinição do agente escolhida quando esta tarefa foi iniciada",
			nav: "Predefinições de agente",
			setDefault: "Definir como nova tarefa padrão",
			view: "Ver configuração",
			presetStandardName: "Modo padrão",
			presetStandardDescription: "Trabalhe com código, arquivos e informações. Adequado para a maioria das tarefas, com pesquisa, edição, comandos de terminal e outras ferramentas disponíveis conforme necessário.",
			presetPtcName: "modo PTC",
			presetPtcDescription: "Inclui todos os recursos do modo Padrão. Mais adequado para tarefas que chamam ferramentas em lotes e depois filtram, organizam, desduplicam, contam ou resumem os resultados.",
			presetMinimalName: "Modo mínimo",
			presetMinimalDescription: "O agente utiliza terminal e leitura de imagens, com compactação de contexto. Útil para testar e comparar seu desempenho básico.",
			presetCordisName: "Modo criador",
			presetCordisDescription: "Personalize DSH por meio de conversa. Deixe o agente escrever plug-ins que adicionem recursos ou UI, ou combine ferramentas e prompts para criar seu próprio modo.",
			inUse: "Novo padrão de tarefa",
			noDescription: "Nenhuma descrição.",
			brokenBadge: "Falha ao carregar",
			switchRefused: "Não foi possível mudar para {name}: {reason}",
			standardUnavailable: "O modo padrão não está disponível. Restaure-o ou escolha outro modo disponível.",
			close: "Fechar",
			creatorDraft: "Deixe o agente me ajudar a criar uma predefinição",
			createPlugin: "Deixe o agente criar um plugin",
			createPluginDescription: "Entre no modo Criador e crie seu próprio plug-in DSH",
			createPluginChecking: "Verificando se o modo Criador está disponível",
			createPluginUnavailable: "Temporariamente indisponível. Reabra este menu para tentar novamente",
			createPluginMissing: "O modo criador não está incluído nesta configuração"
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-agent-preset/src/client/AgentPresetLabel.module.css.mjs
		const css$4 = ".WTkchq_label{border-radius:var(--dsw-radius-xs);background:var(--dsw-alias-fill-tsp-secondary);max-width:180px;height:22px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;align-items:center;gap:4px;padding:0 2px 0 0;font-size:12px;line-height:22px;display:inline-flex;overflow:hidden}.WTkchq_icon{opacity:.7;flex:none}@container (width<=540px){.WTkchq_label{display:none}}";
		const tagId$4 = "@deepseek-ai/dsh-client-ui-agent-preset/AgentPresetLabel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-agent-preset";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var AgentPresetLabel_module_css_default = {
			"icon": "WTkchq_icon",
			"label": "WTkchq_label"
		};
		//#endregion
		//#region lib/types/client/AgentPresetLabel.js
		/**
		* The session header's agent-preset label.
		*
		* Read-only by construction: a session's composition is fixed once its
		* conversation starts, and a header is only worth reading after that. Offering
		* a control here would promise a switch the host refuses; naming what the
		* session runs is the honest affordance, and the choice itself lives on the
		* new-session screen ({@link AgentPresetSeat}).
		*/
		/**
		* Render this session's agent-preset name beside its title.
		* @param props - composed slot props.
		* @returns the label, or null when the session records no preset.
		*/
		function AgentPresetLabel({ sessionId, useSessions, useAgentPresets, load, t }) {
			const preset = useSessions((state) => {
				const value = state.byId[sessionId]?.projectionValues?.agentPreset;
				return typeof value === "string" ? value : void 0;
			});
			const options = useAgentPresets((state) => state.options);
			(0, react.useEffect)(() => {
				if (preset !== void 0) load();
			}, [preset, load]);
			if (preset === void 0) return null;
			const option = options.find((entry) => entry.id === preset);
			const text = option === void 0 ? void 0 : presetDisplayText(option, t);
			return (0, react_jsx_runtime.jsxs)("span", {
				className: AgentPresetLabel_module_css_default.label,
				title: text?.description ?? t("headerHint"),
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineRegular, {
					size: 14,
					className: AgentPresetLabel_module_css_default.icon
				}), text?.name ?? preset]
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-agent-preset/src/client/CreatePluginMenuItem.module.css.mjs
		const css$3 = ".GIm5fW_copy{white-space:normal;flex-direction:column;gap:2px;min-width:0;display:flex}.GIm5fW_description{overflow-wrap:anywhere;max-height:36px;color:var(--dsw-alias-label-secondary);-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:12px;line-height:18px;display:-webkit-box;overflow:hidden}";
		const tagId$3 = "@deepseek-ai/dsh-client-ui-agent-preset/CreatePluginMenuItem.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-agent-preset";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var CreatePluginMenuItem_module_css_default = {
			"copy": "GIm5fW_copy",
			"description": "GIm5fW_description"
		};
		//#endregion
		//#region lib/types/client/CreatePluginMenuItem.js
		/** Create a plugin through the existing Creator flow from the Add plugin menu. */
		/**
		* Close the Add plugin menu before opening Creator without sending a message.
		* @param props - locale, roster, dismissal and navigation callbacks.
		* @returns a stable menu item that explains why Creator is unavailable.
		*/
		function CreatePluginMenuItem({ t, useAgentPresets, load, onDismiss, startCreatorDraft }) {
			const roster = useAgentPresets((state) => state);
			const enabled = roster.status === "ready" && roster.options.some((option) => option.id === "cordis");
			(0, react.useEffect)(() => {
				load();
			}, [load]);
			let description = t("createPluginDescription");
			if (roster.status === "idle" || roster.status === "loading") description = t("createPluginChecking");
			else if (roster.status === "error" || roster.status === "unavailable") description = t("createPluginUnavailable");
			else if (!enabled) description = t("createPluginMissing");
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineRegular, { size: 14 }),
				disabled: !enabled,
				onSelect: () => {
					onDismiss();
					startCreatorDraft();
				},
				children: (0, react_jsx_runtime.jsxs)("span", {
					className: CreatePluginMenuItem_module_css_default.copy,
					children: [(0, react_jsx_runtime.jsx)("span", { children: t("createPlugin") }), (0, react_jsx_runtime.jsx)("span", {
						className: CreatePluginMenuItem_module_css_default.description,
						title: description,
						children: description
					})]
				})
			});
		}
		//#endregion
		//#region lib/types/client/settings-store.js
		/**
		* Agent-preset roster store shared by the display surfaces.
		*
		* Options come from one `agentPresets.list` call. Writes target the settings
		* namespace fields the host resolves at creation; the management section is
		* the surface that writes them.
		*/
		/** The agent-preset settings namespace on the host wire. */
		const AGENT_PRESET_SETTINGS_NS = "agent-preset-registry";
		/**
		* Persist one preset as the default for sessions created later.
		*
		* The default is a settings field rather than a preset property; the
		* management section writes it here — one home for which namespace and field
		* the host resolves at session creation.
		* @param ctx - the browser plugin context carrying the Remote namespaces.
		* @param id - the preset to make default.
		* @param expectedRevision - optional fence for an automatic correction based on a previous settings read.
		* @returns the failure message, or undefined once the write landed.
		*/
		async function writeDefaultPreset(ctx, id, expectedRevision) {
			const response = await ctx.remote.settings.update(AGENT_PRESET_SETTINGS_NS, { selectedDefault: id }, expectedRevision);
			return response.ok ? void 0 : response.error.message;
		}
		/** Whether a shipped preset requires the Coding Tools preference.
		* @param preset Roster entry; named custom overrides keep their own behavior.
		* @returns True only for the built-in PTC and Minimal presets.
		*/
		function requiresCodingTools(preset) {
			return preset !== void 0 && isBuiltInPreset(preset) && (preset.id === "ptc" || preset.id === "minimal");
		}
		const EMPTY_ROSTER = { presets: [] };
		/**
		* Read the roster, turning a refusal into the message every surface shows.
		* @param ctx - the browser plugin context carrying the Remote namespaces.
		* @returns the roster, or the message to show in its place.
		*/
		async function readRoster(ctx) {
			const result = await ctx.remote.agentPresets.list();
			if (result.ok) return {
				ok: true,
				value: result.value
			};
			if (result.error.code === "gateway/invocation-unavailable") return {
				ok: true,
				value: EMPTY_ROSTER
			};
			return {
				ok: false,
				error: result.error.message
			};
		}
		/**
		* The opening move every roster-backed surface makes: refuse a read that is
		* already in flight, mark the store loading, then read.
		*
		* A surface that gets `undefined` returns without touching its snapshot
		* further — either another read owns it, or this one already wrote the
		* failure. What differs between surfaces starts after this.
		* @param ctx - the browser plugin context carrying the Remote namespaces.
		* @param store - the surface's own snapshot store.
		* @returns the roster, or undefined when the caller should return.
		*/
		async function beginRosterRead(ctx, store) {
			const before = store.getSnapshot();
			if (before.status === "loading") return void 0;
			store.set({
				...before,
				status: "loading",
				error: null
			});
			const roster = await readRoster(ctx);
			if (roster.ok) return roster.value;
			store.set({
				...store.getSnapshot(),
				status: "error",
				error: roster.error
			});
		}
		/**
		* The roster entries as the pickers render them: healthy presets only.
		*
		* The chip exists to choose the NEXT session's composition, and a broken
		* preset cannot compose one — offering it would defer the discovery of that
		* fact to a failed session start. The management section renders the full
		* roster (broken rows included) from its own store instead.
		*
		* The chip, the header label, and the management section all show the same
		* facts, and `exactOptionalPropertyTypes` makes "absent" and "present as
		* undefined" different shapes — so the spread dance belongs in one place rather than
		* once per store.
		* @param presets - the roster the host answered with.
		* @returns one option per selectable preset, in roster order.
		*/
		function presetOptions(presets) {
			return presets.filter((preset) => preset.broken === void 0).map((preset) => ({
				id: preset.id,
				...preset.name === void 0 ? {} : { name: preset.name },
				...preset.description === void 0 ? {} : { description: preset.description }
			}));
		}
		const INITIAL$2 = {
			status: "idle",
			error: null,
			options: []
		};
		/** Reads the roster for the surfaces that only display it. */
		var AgentPresetSettingsController = class {
			ctx;
			/** Roster snapshot the renderer subscribes to. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(INITIAL$2);
			/**
			* @param ctx - the browser plugin context (the roster read).
			*/
			constructor(ctx) {
				this.ctx = ctx;
			}
			set(patch) {
				this.store.set({
					...this.store.getSnapshot(),
					...patch
				});
			}
			/**
			* Load the roster. An empty roster means the deployment composes no
			* presets, which is a valid deployment rather than a failure — the
			* surfaces report `unavailable` and render nothing.
			* @returns once the snapshot reflects the host.
			*/
			async load() {
				const roster = await beginRosterRead(this.ctx, this.store);
				if (roster === void 0) return;
				const { presets } = roster;
				if (presets.length === 0) {
					this.set({
						status: "unavailable",
						options: []
					});
					return;
				}
				this.set({
					status: "ready",
					error: null,
					options: presetOptions(presets)
				});
			}
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-agent-preset/src/client/AgentPresetSeat.module.css.mjs
		const css$2 = ".ntJ6IW_menuAnchor{min-width:54px;max-width:100%}.ntJ6IW_seat{border-radius:var(--dsw-radius-sm);min-width:0;max-width:min(100%,240px);min-height:28px;color:var(--dsw-alias-label-primary);white-space:nowrap;cursor:pointer;background:0 0;border:none;align-items:center;gap:4px;padding:0 8px;font-size:13px;font-weight:500;line-height:20px;display:inline-flex}.ntJ6IW_seat[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover)}@media (hover:hover){.ntJ6IW_seat:not(:disabled):hover{background:var(--dsw-alias-interactive-bg-hover)}}.ntJ6IW_seat:disabled{cursor:default;color:var(--dsw-alias-label-quaternary)}.ntJ6IW_seatIcon{color:var(--dsw-alias-label-primary);flex:none}.ntJ6IW_seatLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.ntJ6IW_introIcon{animation:.15s cubic-bezier(.16,1,.3,1) both ntJ6IW_seat-icon-in}@keyframes ntJ6IW_seat-icon-in{0%{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}.ntJ6IW_introText{white-space:pre;display:inline-block}.ntJ6IW_introChar{white-space:pre;opacity:0;animation:.4s ease-out forwards ntJ6IW_seat-char-in;display:inline-block}@keyframes ntJ6IW_seat-char-in{0%{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.ntJ6IW_introIcon,.ntJ6IW_introChar{opacity:1;animation:none}}.ntJ6IW_chevron{color:var(--dsw-alias-label-caption);flex:none}.ntJ6IW_item{flex-direction:column;gap:2px;max-width:280px;display:flex}.ntJ6IW_itemName{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}.ntJ6IW_itemDesc{color:var(--dsw-alias-label-caption);white-space:normal;font-size:12px;line-height:16px}";
		const tagId$2 = "@deepseek-ai/dsh-client-ui-agent-preset/AgentPresetSeat.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-agent-preset";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var AgentPresetSeat_module_css_default = {
			"chevron": "ntJ6IW_chevron",
			"introChar": "ntJ6IW_introChar",
			"introIcon": "ntJ6IW_introIcon",
			"introText": "ntJ6IW_introText",
			"item": "ntJ6IW_item",
			"itemDesc": "ntJ6IW_itemDesc",
			"itemName": "ntJ6IW_itemName",
			"menuAnchor": "ntJ6IW_menuAnchor",
			"seat": "ntJ6IW_seat",
			"seat-char-in": "ntJ6IW_seat-char-in",
			"seat-icon-in": "ntJ6IW_seat-icon-in",
			"seatIcon": "ntJ6IW_seatIcon",
			"seatLabel": "ntJ6IW_seatLabel"
		};
		//#endregion
		//#region lib/types/client/AgentPresetSeat.js
		/**
		* The agent-preset chip on the new-session screen, beside the workspace
		* picker.
		*
		* It lives here rather than in the composer because the choice is only
		* available before a conversation starts: once a turn has run, the session's
		* history was produced under that preset's tools and the host refuses to swap
		* them. A control that spends most of its life disabled belongs on the screen
		* where it still works.
		*
		* The menu opens on the staged choice, which starts as the deployment default.
		* Picking stages; the choice reaches a session when one becomes current.
		*/
		const INTRO_TEXT_DELAY_MS = 150;
		const INTRO_CHAR_STAGGER_MS = 40;
		const INTRO_TEXT_REVEAL_MS = 200;
		const INTRO_CHAR_FADE_MS = 400;
		/** Duration of a selection-refusal banner, including a revision becoming unavailable during a pick. */
		const REFUSAL_HOLD_MS = 8e3;
		/**
		* Per-character start offset for the introduce reveal.
		* @param count - character count of the shown preset name.
		* @returns milliseconds between successive character starts.
		*/
		function introStaggerMs(count) {
			if (count <= 1) return 0;
			return Math.min(INTRO_CHAR_STAGGER_MS, INTRO_TEXT_REVEAL_MS / (count - 1));
		}
		/**
		* Render the new-session agent-preset chip.
		* @param props - composed slot props.
		* @returns The chip and any pending selection refusal, or null outside the main view.
		*/
		function AgentPresetSeat({ sessionId, useSessionRetainInfo, load, select, dismissRefusal, introduced, useAgentPresetSeat, useDeveloperTools, t }) {
			const developerTools = useDeveloperTools((value) => value);
			const state = useAgentPresetSeat((snapshot) => snapshot);
			const main = useSessionRetainInfo((info) => sessionId === void 0 || (info?.retainedBy.mainView ?? 0) > 0);
			const [open, setOpen] = (0, react.useState)(false);
			const toastSeq = (0, react.useRef)(0);
			const [toast, setToast] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				if (state.error !== null && typeof state.error === "object") {
					toastSeq.current += 1;
					setToast({
						seq: toastSeq.current,
						error: state.error
					});
				} else setToast(null);
			}, [state.error]);
			(0, react.useEffect)(() => {
				load();
			}, [load]);
			const options = (0, react.useMemo)(() => state.options.filter((option) => developerTools || !requiresCodingTools(option)), [state.options, developerTools]);
			(0, react.useEffect)(() => {
				setOpen(false);
			}, [developerTools, options.length]);
			const chosen = state.options.find((option) => option.id === state.current);
			const label = (chosen === void 0 ? void 0 : presetDisplayText(chosen, t))?.name ?? state.current;
			const ready = state.options.length > 0 && state.current !== "";
			const [introducing, setIntroducing] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (!state.introduce || !ready) return;
				const characters = Array.from(label);
				if (characters.length === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
					introduced();
					return;
				}
				setIntroducing(true);
				const done = window.setTimeout(() => {
					setIntroducing(false);
					introduced();
				}, INTRO_TEXT_DELAY_MS + (characters.length - 1) * introStaggerMs(characters.length) + INTRO_CHAR_FADE_MS);
				return () => {
					window.clearTimeout(done);
				};
			}, [
				state.introduce,
				ready,
				label,
				introduced
			]);
			if (!main) return null;
			const characters = Array.from(label);
			const stagger = introStaggerMs(characters.length);
			const shownLabel = introducing ? (0, react_jsx_runtime.jsx)("span", {
				className: AgentPresetSeat_module_css_default.introText,
				children: characters.map((character, index) => (0, react_jsx_runtime.jsx)("span", {
					className: AgentPresetSeat_module_css_default.introChar,
					style: { animationDelay: `${INTRO_TEXT_DELAY_MS + index * stagger}ms` },
					children: character
				}, index))
			}) : label;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [ready && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open: open && options.length > 0,
				onClose: () => {
					setOpen(false);
				},
				items: options.map((option) => {
					const text = presetDisplayText(option, t);
					return {
						id: option.id,
						label: (0, react_jsx_runtime.jsxs)("span", {
							className: AgentPresetSeat_module_css_default.item,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: AgentPresetSeat_module_css_default.itemName,
								children: text.name
							}), (0, react_jsx_runtime.jsx)("span", {
								className: AgentPresetSeat_module_css_default.itemDesc,
								children: text.description ?? t("noDescription")
							})]
						})
					};
				}),
				selectedId: state.current,
				onSelect: (id) => {
					setOpen(false);
					select(id);
				},
				align: "start",
				portal: true,
				className: AgentPresetSeat_module_css_default.menuAnchor,
				anchor: (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: AgentPresetSeat_module_css_default.seat,
					"aria-haspopup": "menu",
					"aria-expanded": open && options.length > 0,
					title: (typeof state.error === "object" ? state.error?.reason : state.error) ?? t("seatHint"),
					disabled: state.busy || options.length === 0,
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineRegular, { className: introducing ? `${AgentPresetSeat_module_css_default.seatIcon} ${AgentPresetSeat_module_css_default.introIcon}` : AgentPresetSeat_module_css_default.seatIcon }),
						(0, react_jsx_runtime.jsx)("span", {
							className: AgentPresetSeat_module_css_default.seatLabel,
							children: shownLabel
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: AgentPresetSeat_module_css_default.chevron })
					]
				})
			}), toast !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
				text: t("switchRefused", {
					name: presetDisplayText(toast.error.preset, t).name,
					reason: toast.error.reason
				}),
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
				holdMs: REFUSAL_HOLD_MS,
				anchor: document.querySelector("[data-composer-card]"),
				onDone: () => {
					dismissRefusal(toast.error);
				}
			}, toast.seq)] });
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-agent-preset/src/client/PresetGuideDialog.module.css.mjs
		const css$1 = ".D6I4Ha_guideDialog{box-sizing:border-box;gap:0;width:min(640px,100%);height:min(600px,100%);max-height:100%;padding:0}.D6I4Ha_guideLayout{flex-direction:column;height:100%;min-height:0;display:flex}.D6I4Ha_guideHeader{flex:none;padding:24px 24px 20px 28px}.D6I4Ha_guideTitleRow{justify-content:space-between;align-items:center;gap:16px;display:flex}.D6I4Ha_guideTitle{margin:0;font-size:20px;font-weight:600;line-height:28px}.D6I4Ha_guideIntro{color:var(--dsw-alias-label-secondary);margin:8px 0 0;font-size:14px;line-height:22px}.D6I4Ha_guideClose{border-radius:var(--dsw-radius-md);width:32px;height:32px;min-height:32px;color:var(--dsw-alias-label-tertiary);padding:0}.D6I4Ha_guideTabs{flex:none;margin:0 28px 22px}.D6I4Ha_guidePanel{--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);overscroll-behavior:contain;scrollbar-gutter:stable;min-height:0;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;flex:1;padding:0 24px 24px 28px;font-size:16px;overflow-y:auto}.D6I4Ha_guidePanel:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}.D6I4Ha_guidePanel h3{margin:28px 0 10px;font-size:16px;font-weight:600;line-height:24px}.D6I4Ha_guidePanel h3:first-child{margin-top:0}.D6I4Ha_guidePanel p{color:var(--dsw-alias-label-primary);margin:0 0 16px;font-size:16px;line-height:1.625}.D6I4Ha_guidePanel blockquote{border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-module-platform);border:0;margin:10px 0 14px;padding:14px 16px}.D6I4Ha_guidePanel blockquote p{color:var(--dsw-alias-label-primary);margin:0}.D6I4Ha_guidePanel[data-guide-page=usage] p{color:var(--dsw-alias-label-secondary);margin-bottom:12px;font-size:14px;line-height:22px}.D6I4Ha_guidePanel[data-guide-page=usage] h3{margin:0}.D6I4Ha_guideExample+.D6I4Ha_guideExample{margin-top:28px}.D6I4Ha_guideExampleHeader{flex-wrap:wrap;align-items:center;gap:8px 10px;margin-bottom:8px;display:flex}.D6I4Ha_guideExampleTag{flex-shrink:0;gap:4px}.D6I4Ha_guidePanel[data-guide-page=usage] blockquote{margin:8px 0;padding:12px 16px}.D6I4Ha_guidePanel[data-guide-page=usage] blockquote p{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;line-height:26px}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-agent-preset/PresetGuideDialog.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-agent-preset";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var PresetGuideDialog_module_css_default = {
			"guideClose": "D6I4Ha_guideClose",
			"guideDialog": "D6I4Ha_guideDialog",
			"guideExample": "D6I4Ha_guideExample",
			"guideExampleHeader": "D6I4Ha_guideExampleHeader",
			"guideExampleTag": "D6I4Ha_guideExampleTag",
			"guideHeader": "D6I4Ha_guideHeader",
			"guideIntro": "D6I4Ha_guideIntro",
			"guideLayout": "D6I4Ha_guideLayout",
			"guidePanel": "D6I4Ha_guidePanel",
			"guideTabs": "D6I4Ha_guideTabs",
			"guideTitle": "D6I4Ha_guideTitle",
			"guideTitleRow": "D6I4Ha_guideTitleRow"
		};
		//#endregion
		//#region lib/types/client/PresetGuideDialog.js
		/** Read-only help stays local to Settings and never changes the selected preset. */
		const guides = new Map([
			["standard", {
				name: "presetStandardName",
				intro: "guideStandardIntro",
				explanation: "guideStandardExplanation",
				usage: "guideStandardUsage"
			}],
			["ptc", {
				name: "presetPtcName",
				intro: "guidePtcIntro",
				explanation: "guidePtcExplanation",
				usage: "guidePtcUsage"
			}],
			["minimal", {
				name: "presetMinimalName",
				intro: "guideMinimalIntro",
				explanation: "guideMinimalExplanation",
				usage: "guideMinimalUsage"
			}],
			["cordis", {
				name: "presetCordisName",
				intro: "guideCordisIntro",
				explanation: "guideCordisExplanation",
				usage: "guideCordisUsage"
			}]
		]);
		/**
		* Look up help only for known, shipped presets.
		* @param id - preset identifier from the roster.
		* @param trust - roster source; custom presets own their capability claims.
		* @returns the shipped guide, or undefined for unknown and custom presets.
		*/
		function presetGuide(id, trust) {
			return trust === "system" ? guides.get(id) : void 0;
		}
		/** Keep keyboard focus inside a preset reader while Tab moves through its controls.
		* @param event Keyboard event from the active reader.
		*/
		function trapPresetReaderTab(event) {
			if (event.key !== "Tab") return;
			const targets = Array.from(event.currentTarget.querySelectorAll("button:not([disabled]):not([tabindex=\"-1\"]), [tabindex=\"0\"]")).filter((element) => !element.closest("[hidden]"));
			const first = targets[0];
			const last = targets[targets.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last?.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first?.focus();
			}
		}
		/** Curated usage dictionaries contain only level-three example sections. */
		function GuideUsage({ text, t }) {
			const labels = {
				code: {
					copyLabel: t("guideCopy"),
					copiedLabel: t("guideCopied"),
					toolbarLabels: {
						codeLabel: t("codeBlock.title"),
						wrapLabel: t("codeBlock.wrap"),
						unwrapLabel: t("codeBlock.unwrap")
					}
				},
				footnotes: t("guideFootnotes")
			};
			return text.split(/(?=^### )/m).map((section) => {
				const headingEnd = section.indexOf("\n");
				const title = section.slice(4, headingEnd);
				return (0, react_jsx_runtime.jsxs)("section", {
					className: PresetGuideDialog_module_css_default.guideExample,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: PresetGuideDialog_module_css_default.guideExampleHeader,
						children: [(0, react_jsx_runtime.jsx)("h3", { children: title }), (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
							tone: "neutral",
							className: PresetGuideDialog_module_css_default.guideExampleTag,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconListPenOutlineRegular, { size: 12 }), t("guideExampleTask")]
						})]
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
						text: section.slice(headingEnd + 1),
						labels
					})]
				}, title);
			});
		}
		/**
		* Open read-only help without changing the selected preset.
		* @param props - localized guide, initial page, and close callback.
		* @returns the modal reader with independent scroll positions for each page.
		*/
		function PresetGuideDialog({ guide, initialPage, t, onClose }) {
			const [page, setPage] = (0, react.useState)(initialPage);
			const guideId = (0, react.useId)();
			const content = (0, react.useRef)(null);
			(0, react.useLayoutEffect)(() => {
				content.current?.querySelector("[role=\"tab\"][aria-selected=\"true\"]")?.focus();
			}, []);
			const onKeyDown = (event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					event.stopPropagation();
					onClose();
				} else trapPresetReaderTab(event);
			};
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				headless: true,
				onClose,
				title: t(guide.name),
				className: PresetGuideDialog_module_css_default.guideDialog,
				children: (0, react_jsx_runtime.jsxs)("div", {
					ref: content,
					className: PresetGuideDialog_module_css_default.guideLayout,
					role: "presentation",
					onKeyDownCapture: onKeyDown,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: PresetGuideDialog_module_css_default.guideHeader,
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: PresetGuideDialog_module_css_default.guideTitleRow,
								children: [(0, react_jsx_runtime.jsx)("h2", {
									className: PresetGuideDialog_module_css_default.guideTitle,
									children: t(guide.name)
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "ghost",
									className: PresetGuideDialog_module_css_default.guideClose,
									"aria-label": t("close"),
									onClick: onClose,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 18 })
								})]
							}), (0, react_jsx_runtime.jsx)("p", {
								className: PresetGuideDialog_module_css_default.guideIntro,
								children: t(guide.intro)
							})]
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SegmentedTabs, {
							className: PresetGuideDialog_module_css_default.guideTabs,
							label: t("guideSections"),
							value: page,
							onChange: setPage,
							items: [{
								value: "explanation",
								label: t("modeExplanation"),
								id: `${guideId}-explanation-tab`,
								panelId: `${guideId}-explanation-panel`
							}, {
								value: "usage",
								label: t("howToUse"),
								id: `${guideId}-usage-tab`,
								panelId: `${guideId}-usage-panel`
							}]
						}),
						["explanation", "usage"].map((section) => (0, react_jsx_runtime.jsx)("div", {
							id: `${guideId}-${section}-panel`,
							role: "tabpanel",
							"aria-labelledby": `${guideId}-${section}-tab`,
							className: PresetGuideDialog_module_css_default.guidePanel,
							"data-guide-page": section,
							hidden: page !== section,
							tabIndex: 0,
							children: section === "usage" ? (0, react_jsx_runtime.jsx)(GuideUsage, {
								text: t(guide.usage),
								t
							}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
								text: t(guide.explanation),
								labels: {
									code: {
										copyLabel: t("guideCopy"),
										copiedLabel: t("guideCopied"),
										toolbarLabels: {
											codeLabel: t("codeBlock.title"),
											wrapLabel: t("codeBlock.wrap"),
											unwrapLabel: t("codeBlock.unwrap")
										}
									},
									footnotes: t("guideFootnotes")
								}
							})
						}, section))
					]
				})
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-agent-preset/src/client/AgentPresetSection.module.css.mjs
		const css = ".qdqIMW_section{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:12px;display:flex}.qdqIMW_title{margin:0;font-size:18px;font-weight:600}.qdqIMW_intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px}.qdqIMW_group{flex-direction:column;gap:10px;display:flex}.qdqIMW_group+.qdqIMW_group{margin-top:20px}.qdqIMW_groupHead{letter-spacing:.06em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;font-weight:600}.qdqIMW_cards{grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:12px;margin:0;padding:0;list-style:none;display:grid}.qdqIMW_card{border:.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-settings-card-fill);flex-direction:column;transition:border-color .16s,background .16s;display:flex}@media (hover:hover){.qdqIMW_card:hover:not(.qdqIMW_cardActive){background:var(--dsw-alias-interactive-bg-hover)}}.qdqIMW_cardActive{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-static-neutral-bluish-400)}.qdqIMW_cardBroken{border-color:var(--dsw-alias-state-error-primary)}@media (hover:hover){.qdqIMW_cardBroken:hover{border-color:var(--dsw-alias-state-error-primary)}}.qdqIMW_brokenBadge{corner-shape:round;white-space:nowrap;background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-bg-layer-3);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.qdqIMW_brokenTip{z-index:1;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-label-primary);width:max-content;max-width:100%;color:var(--dsw-alias-bg-layer-3);text-align:left;white-space:pre-line;overflow-wrap:anywhere;opacity:0;pointer-events:none;padding:6px 8px;font-size:11px;font-weight:400;line-height:1.5;transition:opacity .12s;position:absolute;top:calc(100% + 6px);left:0}.qdqIMW_cardMain:focus-visible .qdqIMW_brokenTip{opacity:1}@media (hover:hover){.qdqIMW_brokenBadge:hover .qdqIMW_brokenTip{opacity:1}}.qdqIMW_cardMain[aria-disabled=true]{cursor:default}.qdqIMW_cardBrokenReason{clip:rect(0 0 0 0);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}@media (hover:none){.qdqIMW_cardBrokenReason{clip:auto;white-space:normal;width:auto;height:auto;display:block;position:static;overflow:visible}}.qdqIMW_cardMain{appearance:none;font:inherit;color:inherit;text-align:left;cursor:pointer;border-radius:var(--dsw-radius-xl) var(--dsw-radius-xl) 0 0;background:0 0;border:0;flex-direction:column;flex:1;gap:12px;padding:14px 16px 12px;display:flex}.qdqIMW_cardMain:disabled{cursor:default}.qdqIMW_cardMain:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}.qdqIMW_cardHead{align-items:flex-start;gap:12px;display:flex;position:relative}.qdqIMW_cardIdentity{flex:1;align-items:center;gap:6px;min-width:0;display:flex}.qdqIMW_cardName{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:15px;font-weight:600;line-height:1.4;overflow:hidden}.qdqIMW_cardDesc{color:var(--dsw-alias-label-secondary);-webkit-line-clamp:4;overflow-wrap:anywhere;-webkit-box-orient:vertical;margin-block:auto;font-size:13px;line-height:1.55;display:-webkit-box;overflow:hidden}@media (pointer:coarse){.qdqIMW_cardDesc{-webkit-line-clamp:unset}}.qdqIMW_cardId{max-width:35%;font-family:var(--dsw-font-mono,ui-monospace, SFMono-Regular, Menlo, monospace);color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;flex-shrink:0;font-size:11px;line-height:21px;overflow:hidden}.qdqIMW_cardFoot{border-top:.5px solid var(--dsw-alias-border-l2);flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:2px;padding:6px 10px;display:flex}.qdqIMW_cardHelp{align-items:center;gap:4px;margin-right:auto;display:flex}.qdqIMW_helpButton{min-height:28px;color:var(--dsw-alias-label-tertiary);padding:5px 6px;font-size:12px;font-weight:400}.qdqIMW_helpButton:focus-visible{color:var(--dsw-alias-label-primary)}@media (hover:hover){.qdqIMW_helpButton:hover{color:var(--dsw-alias-label-primary)}}.qdqIMW_iconButton{appearance:none;border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;align-items:center;padding:6px;display:inline-flex;position:relative}@media (hover:hover){.qdqIMW_iconButton:hover{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}}.qdqIMW_iconButton:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-1px}.qdqIMW_iconButton:after{content:attr(data-tip);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3);white-space:nowrap;opacity:0;pointer-events:none;padding:3px 8px;font-size:11px;line-height:17px;transition:opacity .12s;position:absolute;bottom:calc(100% + 6px);left:50%;transform:translate(-50%)}.qdqIMW_iconButton:focus-visible:after{opacity:1}@media (hover:hover){.qdqIMW_iconButton:hover:after{opacity:1}}.qdqIMW_dialog{width:min(720px,100%)}.qdqIMW_viewerCode{border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-2);max-height:min(60vh,560px);color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-mono,ui-monospace, SFMono-Regular, Menlo, monospace);white-space:pre;tab-size:2;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);margin:0;padding:12px;font-size:12.5px;line-height:1.5;overflow:auto}.qdqIMW_error{color:var(--dsw-alias-state-error-primary);margin:0;font-size:12px}.qdqIMW_creatorButton{box-sizing:border-box;border:1px dashed var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-lg);height:44px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;justify-content:center;align-self:stretch;align-items:center;gap:6px;font-size:14px;line-height:22px;display:flex}@media (hover:hover){.qdqIMW_creatorButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}.qdqIMW_creatorButton:disabled{opacity:.4;cursor:default}";
		const tagId = "@deepseek-ai/dsh-client-ui-agent-preset/AgentPresetSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-agent-preset";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var AgentPresetSection_module_css_default = {
			"brokenBadge": "qdqIMW_brokenBadge",
			"brokenTip": "qdqIMW_brokenTip",
			"card": "qdqIMW_card",
			"cardActive": "qdqIMW_cardActive",
			"cardBroken": "qdqIMW_cardBroken",
			"cardBrokenReason": "qdqIMW_cardBrokenReason",
			"cardDesc": "qdqIMW_cardDesc",
			"cardFoot": "qdqIMW_cardFoot",
			"cardHead": "qdqIMW_cardHead",
			"cardHelp": "qdqIMW_cardHelp",
			"cardId": "qdqIMW_cardId",
			"cardIdentity": "qdqIMW_cardIdentity",
			"cardMain": "qdqIMW_cardMain",
			"cardName": "qdqIMW_cardName",
			"cards": "qdqIMW_cards",
			"creatorButton": "qdqIMW_creatorButton",
			"dialog": "qdqIMW_dialog",
			"error": "qdqIMW_error",
			"group": "qdqIMW_group",
			"groupHead": "qdqIMW_groupHead",
			"helpButton": "qdqIMW_helpButton",
			"iconButton": "qdqIMW_iconButton",
			"intro": "qdqIMW_intro",
			"section": "qdqIMW_section",
			"title": "qdqIMW_title",
			"viewerCode": "qdqIMW_viewerCode"
		};
		//#endregion
		//#region lib/types/client/AgentPresetSection.js
		function CardDescription({ text }) {
			const ref = (0, react.useRef)(null);
			const [truncated, setTruncated] = (0, react.useState)(false);
			(0, react.useLayoutEffect)(() => {
				const el = ref.current;
				/* v8 ignore next -- the ref is attached before layout effects run. */
				if (el === null) return;
				const measure = () => {
					setTruncated(el.scrollHeight > el.clientHeight);
				};
				measure();
				if (typeof ResizeObserver === "undefined") return;
				const observer = new ResizeObserver(measure);
				observer.observe(el);
				return () => {
					observer.disconnect();
				};
			}, [text]);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: text,
				side: "bottom",
				delayMs: 400,
				disabled: !truncated,
				maxWidth: 360,
				children: (0, react_jsx_runtime.jsx)("span", {
					ref,
					className: AgentPresetSection_module_css_default.cardDesc,
					title: "",
					children: text
				})
			});
		}
		/** Render the roster with its default, mode help, composition viewer, and the guidance to Creator mode.
		* @param props Settings actions, snapshot hooks and localized text.
		* @returns The preset settings section.
		*/
		function AgentPresetSection({ useAgentPresetSection, load, view, closeView, makeDefault, startCreatorDraft, close: closeSettings, useDeveloperTools, t }) {
			const state = useAgentPresetSection((value) => value);
			const developerTools = useDeveloperTools((enabled) => enabled);
			const [guide, setGuide] = (0, react.useState)(null);
			const viewTrigger = (0, react.useRef)(null);
			const closeViewOnUnmount = (0, react.useRef)(closeView);
			(0, react.useEffect)(() => {
				load();
			}, [load]);
			(0, react.useLayoutEffect)(() => {
				closeViewOnUnmount.current = closeView;
			}, [closeView]);
			(0, react.useEffect)(() => () => {
				closeViewOnUnmount.current();
			}, []);
			const closeViewer = () => {
				closeView();
				viewTrigger.current?.focus();
			};
			const viewed = state.view;
			const viewedRow = viewed === null ? void 0 : state.rows.find((row) => row.id === viewed.id);
			const viewedTitle = viewed === null ? "" : viewedRow === void 0 ? viewed.title : presetDisplayText(viewedRow, t).name;
			const creator = startCreatorDraft !== void 0 && state.rows.some((row) => row.id === "cordis") ? startCreatorDraft : void 0;
			const creatorButton = creator === void 0 ? null : (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: AgentPresetSection_module_css_default.creatorButton,
				disabled: state.saving,
				onClick: () => {
					creator();
					closeSettings();
				},
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 14 }), t("creatorDraft")]
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				className: AgentPresetSection_module_css_default.section,
				children: [
					(0, react_jsx_runtime.jsx)("h2", {
						className: AgentPresetSection_module_css_default.title,
						children: t("nav")
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: AgentPresetSection_module_css_default.intro,
						children: t("sectionIntro")
					}),
					state.error === null ? null : (0, react_jsx_runtime.jsx)("p", {
						className: AgentPresetSection_module_css_default.error,
						role: "alert",
						children: state.error
					}),
					[true, false].map((builtIn) => {
						const rows = state.rows.filter((row) => isBuiltInPreset(row) === builtIn && (developerTools || !requiresCodingTools(row)));
						const entry = builtIn ? null : creatorButton;
						if (rows.length === 0 && entry === null) return null;
						return (0, react_jsx_runtime.jsxs)("section", {
							className: AgentPresetSection_module_css_default.group,
							children: [
								(0, react_jsx_runtime.jsx)("h3", {
									className: AgentPresetSection_module_css_default.groupHead,
									children: t(builtIn ? "builtInGroup" : "customGroup")
								}),
								rows.length === 0 ? null : (0, react_jsx_runtime.jsx)("ul", {
									className: AgentPresetSection_module_css_default.cards,
									children: rows.map((row) => {
										const display = presetDisplayText(row, t);
										const help = presetGuide(row.id, builtIn ? "system" : "user");
										const selectionAction = row.broken !== void 0 ? t("brokenBadge") : t(row.isDefault ? "inUse" : "setDefault");
										return (0, react_jsx_runtime.jsxs)("li", {
											"data-agent-preset-id": row.id,
											className: [
												AgentPresetSection_module_css_default.card,
												row.broken === void 0 ? void 0 : AgentPresetSection_module_css_default.cardBroken,
												row.isDefault ? AgentPresetSection_module_css_default.cardActive : void 0
											].filter(Boolean).join(" "),
											children: [(0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: AgentPresetSection_module_css_default.cardMain,
												"aria-pressed": row.isDefault,
												disabled: row.isDefault || row.broken === void 0 && state.saving,
												"aria-disabled": row.broken !== void 0,
												"aria-label": `${selectionAction}: ${display.name}`,
												title: selectionAction,
												onClick: () => {
													if (row.broken === void 0) makeDefault(row.id);
												},
												children: [
													(0, react_jsx_runtime.jsxs)("span", {
														className: AgentPresetSection_module_css_default.cardHead,
														children: [(0, react_jsx_runtime.jsxs)("span", {
															className: AgentPresetSection_module_css_default.cardIdentity,
															children: [
																(0, react_jsx_runtime.jsx)("span", {
																	className: AgentPresetSection_module_css_default.cardName,
																	title: display.name,
																	children: display.name
																}),
																row.broken === void 0 ? null : (0, react_jsx_runtime.jsxs)("span", {
																	className: AgentPresetSection_module_css_default.brokenBadge,
																	children: [t("brokenBadge"), (0, react_jsx_runtime.jsx)("span", {
																		className: AgentPresetSection_module_css_default.brokenTip,
																		"aria-hidden": "true",
																		children: row.broken
																	})]
																}),
																(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
																	tone: row.isDefault ? "solid" : "outline",
																	children: row.isDefault ? t("inUse") : t(builtIn ? "builtInGroup" : "customGroup")
																})
															]
														}), (0, react_jsx_runtime.jsx)("code", {
															className: AgentPresetSection_module_css_default.cardId,
															title: row.id,
															children: row.id
														})]
													}),
													(0, react_jsx_runtime.jsx)(CardDescription, { text: display.description ?? t("noDescription") }),
													row.broken === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
														className: AgentPresetSection_module_css_default.cardBrokenReason,
														role: "alert",
														children: row.broken
													})
												]
											}), (0, react_jsx_runtime.jsxs)("div", {
												className: AgentPresetSection_module_css_default.cardFoot,
												children: [help === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", {
													className: AgentPresetSection_module_css_default.cardHelp,
													children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "ghost",
														className: AgentPresetSection_module_css_default.helpButton,
														"aria-label": `${t("modeExplanation")}: ${display.name}`,
														onClick: () => {
															setGuide({
																content: help,
																page: "explanation"
															});
														},
														children: t("modeExplanation")
													}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "ghost",
														className: AgentPresetSection_module_css_default.helpButton,
														"aria-label": `${t("howToUse")}: ${display.name}`,
														onClick: () => {
															setGuide({
																content: help,
																page: "usage"
															});
														},
														children: t("howToUse")
													})]
												}), (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: AgentPresetSection_module_css_default.iconButton,
													"data-tip": t("view"),
													"aria-label": `${t("view")}: ${display.name}`,
													onClick: (event) => {
														viewTrigger.current = event.currentTarget;
														view(row.id);
													},
													children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, {})
												})]
											})]
										}, row.id);
									})
								}),
								entry
							]
						}, String(builtIn));
					}),
					guide === null ? null : (0, react_jsx_runtime.jsx)(PresetGuideDialog, {
						guide: guide.content,
						initialPage: guide.page,
						t,
						onClose: () => {
							setGuide(null);
						}
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: viewed !== null,
						onClose: closeViewer,
						closeLabel: t("close"),
						onKeyDownCapture: (event) => {
							if (event.key === "Escape") {
								event.preventDefault();
								event.stopPropagation();
								closeViewer();
							} else trapPresetReaderTab(event);
						},
						title: viewed === null ? "" : `${t("view")} · ${viewedTitle}`,
						className: AgentPresetSection_module_css_default.dialog,
						footer: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							autoFocus: true,
							onClick: closeViewer,
							children: t("close")
						}),
						children: viewed === null ? null : (0, react_jsx_runtime.jsx)("pre", {
							className: AgentPresetSection_module_css_default.viewerCode,
							children: viewed.content
						})
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/seat-store.js
		/**
		* Hero-chip controller: which preset the NEXT session gets.
		*
		* The new-session screen has no session, so a pick is staged rather than
		* applied. It reaches a session when one becomes current and is still blank —
		* whether the workspace connect created it or reused an existing blank one. A
		* flow that knows its preset before it starts (the settings section's creator
		* entry) passes it to session creation instead, and its stage only drives the
		* chip's display.
		*
		* The stage is forgotten once applied. The next new session starts from the
		* Host-effective default again.
		*/
		const INITIAL$1 = {
			options: [],
			current: "",
			error: null,
			busy: false,
			introduce: false
		};
		const UNCHANGED = { kind: "unchanged" };
		/** Stages the next session's preset and applies it when one appears. */
		var AgentPresetSeatController = class {
			ctx;
			currentSession;
			staged;
			/** Chip snapshot the renderer subscribes to. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(INITIAL$1);
			/**
			* The Host-effective default, so a consumed stage can fall back to it without
			* re-reading the roster.
			*/
			fallback = "";
			/** Only the newest roster read may publish after overlapping refreshes. */
			loadGeneration = 0;
			/** Completion of the active Host selection; Settings choices wait before staging. */
			pendingSelection;
			constructor(ctx, currentSession, staged = {
				id: void 0,
				introduce: false
			}) {
				this.ctx = ctx;
				this.currentSession = currentSession;
				this.staged = staged;
			}
			set(patch) {
				this.store.set({
					...this.store.getSnapshot(),
					...patch
				});
			}
			clearStage() {
				this.staged.id = void 0;
				this.staged.introduce = false;
			}
			/**
			* Read the roster and open the chip on the Host-effective default.
			* @returns once the snapshot reflects the host.
			*/
			async load() {
				const generation = ++this.loadGeneration;
				const roster = await readRoster(this.ctx);
				if (generation !== this.loadGeneration) return;
				const error = this.store.getSnapshot().error;
				if (!roster.ok) {
					if (typeof error !== "object" || error === null) this.set({ error: roster.error });
					return;
				}
				const { presets } = roster.value;
				this.fallback = presets.find((preset) => preset.isDefault)?.id ?? presets[0]?.id ?? "";
				const session = this.currentSession();
				this.set({
					options: presetOptions(presets),
					current: this.staged.id ?? (session === void 0 ? this.fallback : presetOf(session) ?? ""),
					error: typeof error === "object" ? error : null,
					introduce: this.staged.introduce
				});
				await this.apply();
			}
			/**
			* Stage one preset for the next session, applying it immediately when a
			* blank session is already current.
			*
			* The refusal is stored for the chip's announcement and returned to callers
			* such as Settings that also report the result of their own write.
			* @param id - the preset to stage.
			* @returns how the pick settled; a refusal carries its text.
			*/
			async select(id) {
				if (this.store.getSnapshot().busy) return UNCHANGED;
				this.stage(id);
				return await this.apply();
			}
			/**
			* Stage a pick WITHOUT the immediate apply, for a flow that starts the
			* receiving session after the pick (the settings section's creator entry).
			* `select()`'s immediate apply would meet the still-current running session
			* and drop the stage as unservable; staging alone leaves it for the
			* list-change applier, which fires when the started session becomes
			* current.
			* @param id - the preset to stage.
			* @param introduce - true when the stage came from another screen and the
			* chip should announce itself on the session it lands on.
			*/
			stage(id, introduce = false) {
				this.staged.id = id;
				this.staged.introduce = introduce;
				this.set({
					current: id,
					error: null,
					introduce
				});
			}
			/** Acknowledge a displayed refusal without dismissing a newer attempt.
			* @param refusal - the selection error whose Toast finished.
			*/
			dismissRefusal(refusal) {
				if (refusal !== null && typeof refusal === "object" && this.store.getSnapshot().error === refusal) this.set({ error: refusal.reason });
			}
			/**
			* Capture the exact blank Session a Settings action may bring along.
			* @returns its id, or undefined outside a blank Session.
			*/
			blankSessionId() {
				const session = this.currentSession();
				return session?.blank === true ? session.id : void 0;
			}
			/**
			* Apply a Settings choice only if its captured Session is still current and
			* blank after any pending selection settles. The selection uses the existing stage/apply path.
			* @param expectedSessionId - blank Session captured before the Settings write.
			* @param id - the effective default that the write persisted.
			* @returns the Host refusal text, or undefined when applied or no longer relevant.
			*/
			async syncBlankSession(expectedSessionId, id) {
				while (this.pendingSelection !== void 0) await this.pendingSelection;
				const session = this.currentSession();
				if (session === void 0 || !session.blank || session.id !== expectedSessionId) return void 0;
				this.stage(id);
				const outcome = await this.apply();
				return outcome.kind === "refused" ? outcome.reason : void 0;
			}
			/** Acknowledge the introduction cue once the chip has played it. */
			introduced() {
				if (!this.store.getSnapshot().introduce) return;
				this.staged.introduce = false;
				this.set({ introduce: false });
			}
			/**
			* Hand the staged choice to the current session, if there is one to take it.
			*
			* Called both by `select()` and by whoever observes the current session
			* changing, because the session may appear either before or after the pick.
			* List updates do not repeat a selection while its response is pending.
			* @returns how this attempt settled; only a Host commit of the staged preset is applied.
			*/
			async apply() {
				if (this.store.getSnapshot().busy) return UNCHANGED;
				const staged = this.staged.id;
				const session = this.currentSession();
				if (staged === void 0) {
					const current = session === void 0 ? this.fallback : presetOf(session) ?? "";
					if (current !== this.store.getSnapshot().current) this.set({ current });
					return UNCHANGED;
				}
				if (session === void 0) return { kind: "staged" };
				if (!session.blank || presetOf(session) === staged) {
					this.clearStage();
					return UNCHANGED;
				}
				const completion = Promise.withResolvers();
				this.pendingSelection = completion.promise;
				this.clearStage();
				const refuse = (reason) => {
					this.set({
						error: {
							reason,
							preset: this.store.getSnapshot().options.find((option) => option.id === staged) ?? { id: staged }
						},
						current: this.staged.id ?? presetOf(session) ?? ""
					});
					return {
						kind: "refused",
						reason
					};
				};
				try {
					this.set({
						busy: true,
						error: null
					});
					const result = await this.ctx.remote.agentPresets.select(session.id, staged);
					if (!result.ok) {
						const { error } = result;
						return refuse("reason" in error.details && typeof error.details.reason === "string" ? error.details.reason : error.message);
					}
					this.set({ current: this.staged.id ?? result.value });
					return result.value === staged ? { kind: "applied" } : UNCHANGED;
				} catch (error) {
					return refuse(error instanceof Error ? error.message : String(error));
				} finally {
					this.pendingSelection = void 0;
					this.set({ busy: false });
					completion.resolve(void 0);
				}
			}
		};
		function presetOf(session) {
			const value = session?.projectionValues?.agentPreset;
			return typeof value === "string" ? value : void 0;
		}
		//#endregion
		//#region lib/types/client/section-store.js
		const INITIAL = {
			status: "idle",
			error: null,
			saving: false,
			rows: [],
			view: null
		};
		const message = (error) => error instanceof Error ? error.message : String(error);
		/** Loads the roster, writes the default, and reads one composition at a time. */
		var AgentPresetSectionController = class {
			ctx;
			/** Observable roster, selection and viewer state. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(INITIAL);
			loading;
			pendingSave;
			viewRequest = 0;
			constructor(ctx) {
				this.ctx = ctx;
			}
			set(patch) {
				this.store.set({
					...this.store.getSnapshot(),
					...patch
				});
			}
			/** Refresh the roster; concurrent calls share one read.
			* @returns Once the roster read settles.
			*/
			load() {
				return this.loading ??= this.readRoster().finally(() => {
					this.loading = void 0;
				});
			}
			async readRoster() {
				try {
					const result = await this.ctx.remote.agentPresets.list();
					if (!result.ok) throw new Error(result.error.message);
					this.set({
						status: "ready",
						error: null,
						rows: result.value.presets
					});
				} catch (error) {
					this.set({
						status: "error",
						error: message(error)
					});
				}
			}
			/** Open one preset's declared composition in the viewer.
			* @param id Preset to read.
			* @returns Once the read settles; a current failure lands in `error`, while a read superseded by close or another read is ignored.
			*/
			async view(id) {
				const request = ++this.viewRequest;
				this.set({
					error: null,
					view: null
				});
				try {
					const result = await this.ctx.remote.agentPresets.read(id);
					if (request !== this.viewRequest) return;
					if (!result.ok) throw new Error(result.error.message);
					const { name, content } = result.value;
					this.set({ view: {
						id,
						title: name ?? id,
						content
					} });
				} catch (error) {
					if (request === this.viewRequest) this.set({ error: message(error) });
				}
			}
			/** Close the viewer. */
			closeView() {
				this.viewRequest++;
				this.set({ view: null });
			}
			/** Set the default and synchronize the current blank task when supplied.
			* @param id Selected default.
			* @param sync Blank-session synchronization callback.
			* @returns Once saved and refreshed.
			*/
			async makeDefault(id, sync) {
				await this.save(() => writeDefaultPreset(this.ctx, id), sync);
			}
			/** Replace a hidden built-in default after accepted Coding Tools changes.
			* @param shouldReset Rechecked after waiting; false when tools are enabled or this owner is disposed.
			* @returns Once the conditional save settles; errors remain visible in the section.
			*/
			async reconcileCodingTools(shouldReset) {
				while (this.pendingSave !== void 0) await this.pendingSave;
				if (!shouldReset()) return;
				const settings = this.ctx.configForms.get(AGENT_PRESET_SETTINGS_NS).getSnapshot();
				if (settings.status !== "ready" || !settings.writable || settings.revision === void 0) return;
				await this.load();
				if (!shouldReset() || this.store.getSnapshot().status !== "ready") return;
				const rows = this.store.getSnapshot().rows;
				if (!requiresCodingTools(rows.find((row) => row.isDefault))) return;
				if (!rows.some((row) => row.id === "standard" && row.broken === void 0)) {
					this.set({ error: this.ctx.locale.bind("settings.agentPreset")("standardUnavailable") });
					return;
				}
				await this.save(() => writeDefaultPreset(this.ctx, "standard", settings.revision));
			}
			async save(write, sync) {
				if (this.store.getSnapshot().saving) return;
				const completion = Promise.withResolvers();
				this.pendingSave = completion.promise;
				this.set({
					saving: true,
					error: null
				});
				try {
					const error = await write();
					await this.load();
					if (error !== void 0) throw new Error(error);
					const selected = this.store.getSnapshot().rows.find((row) => row.isDefault);
					if (selected !== void 0) {
						const error = await sync?.(selected.id);
						if (error !== void 0) throw new Error(error);
					}
				} catch (error) {
					this.set({ error: message(error) });
				} finally {
					this.pendingSave = void 0;
					this.set({ saving: false });
					completion.resolve();
				}
			}
		};
		//#endregion
		//#region lib/types/client/analytics.js
		/** Resolve a known selection by preset id without treating an unloaded state as a default.
		* @param id - selected preset id; an empty id means unknown.
		* @returns the built-in category for a shipped id, other for any other id, or undefined until known.
		*/
		function analyticsMode(id) {
			if (id === "") return void 0;
			switch (id) {
				case "cordis": return "creator";
				case "ptc": return "ptc";
				case "minimal": return "minimal";
				case "standard": return "standard";
				default: return "other";
			}
		}
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Agent-preset surface plugin, browser half — three surfaces over one roster:
		* a chip on the new-session screen for the session about to start, a
		* read-only label in the session header, and a settings section that lists
		* the roster (selection, the new-task default, a read-only view of each
		* declared composition, and the way into Creator mode).
		*
		* A running session keeps the composition it began with (the host switches a
		* session's preset only before its first turn). That is what splits
		* the choice from the display: the hero chip is before-the-fact, while the
		* header only reports what a session already runs. The default preset is
		* edited where the roster is visible — the settings section's "make default"
		* — so General settings carries no duplicate control for the same field.
		*
		* Coding Tools (General settings) hide PTC and Minimal from the hero menu
		* and Settings roster when off. Hidden saved defaults fall back to Standard;
		* the existing gate clears staged choices while existing sessions keep their composition.
		*/
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"sessions",
			"locale",
			"remote",
			"remote.agentPresets",
			"remote.settings",
			"configForms"
		];
		/**
		* Mount the roster surfaces: hero chip, session-header label, settings section.
		* @param ctx - the browser plugin context.
		*/
		function apply(ctx) {
			const toolsSettings = ctx.configForms.get("ui-settings");
			const presetSettings = ctx.configForms.get(AGENT_PRESET_SETTINGS_NS);
			let active = true;
			const codingToolsDisabled = () => active && toolsSettings.getSnapshot().value?.enabled === false;
			const controller = new AgentPresetSettingsController(ctx);
			const staged = {
				id: void 0,
				introduce: false
			};
			const seats = new WeakMapWithValues();
			const boundSeatDisposers = /* @__PURE__ */ new Set();
			ctx.effect(() => async () => {
				await Promise.all([...boundSeatDisposers].map((dispose) => dispose()));
			}, "ui-agent-preset: bound selections");
			const unboundSeat = new AgentPresetSeatController(ctx, () => void 0, staged);
			const seatFor = (binding) => {
				const existing = seats.get(binding);
				if (existing !== void 0) return existing;
				const seat = new AgentPresetSeatController(ctx, () => {
					if (ctx.sessions.binding(binding.sessionId) !== binding) return void 0;
					const summary = ctx.sessions.list.getSnapshot().byId[binding.sessionId];
					return summary !== void 0 && (ctx.sessions.retainInfo(binding.sessionId).getSnapshot().retainedBy.mainView ?? 0) > 0 ? summary : void 0;
				}, staged);
				seats.set(binding, seat);
				const dispose = binding.ctx.effect(() => {
					const stop = ctx.sessions.list.subscribe(() => {
						seat.apply();
					});
					return () => {
						stop();
						seats.delete(binding);
						boundSeatDisposers.delete(dispose);
					};
				}, "ui-agent-preset: Provider binding");
				boundSeatDisposers.add(dispose);
				return seat;
			};
			const section = new AgentPresetSectionController(ctx);
			const developerTools = ctx.configForms.developerTools.enabled;
			ctx.effect(() => developerTools.subscribe(() => {
				if (developerTools.getSnapshot()) return;
				staged.id = void 0;
				staged.introduce = false;
				unboundSeat.apply();
				for (const seat of seats.values) seat.apply();
			}), "ui-agent-preset: Developer tools gate");
			const mainBlank = () => Object.values(ctx.sessions.list.getSnapshot().byId).find((session) => {
				/* v8 ignore next -- retained source counts omit zero-valued entries. */
				return session.blank && (session.retainedBy.mainView ?? 0) > 0;
			});
			const mainBlankSeat = () => {
				const summary = mainBlank();
				const binding = summary === void 0 ? void 0 : ctx.sessions.binding(summary.id);
				return binding === void 0 ? void 0 : seatFor(binding);
			};
			ctx.effect(() => ctx.locale.register("settings.agentPreset", {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-agent-preset: settings row dictionaries");
			ctx.effect(() => {
				let requested = 0;
				let pending;
				const reconcile = () => {
					requested++;
					pending ??= Promise.resolve().then(async () => {
						try {
							for (;;) {
								const revision = requested;
								await section.reconcileCodingTools(codingToolsDisabled);
								if (!active || requested === revision) return;
							}
						} finally {
							pending = void 0;
						}
					});
				};
				const refresh = () => {
					controller.load();
					if (section.store.getSnapshot().status !== "idle") section.load();
					unboundSeat.load();
					for (const seat of seats.values) seat.load();
					reconcile();
				};
				const disposers = [
					toolsSettings.subscribe(reconcile),
					presetSettings.subscribe(reconcile),
					ctx.remote.$on("settings/document-updated", (ns) => {
						if (ns !== "agent-preset-registry") return;
						refresh();
					}),
					ctx.on("connection/reset", refresh)
				];
				reconcile();
				return async () => {
					active = false;
					for (const dispose of disposers) dispose();
					await pending;
				};
			}, "ui-agent-preset: settings refresh");
			let creatorDraft;
			ctx.inject([
				"slots",
				"conversation",
				"sessions",
				"uiWorkspace"
			], (scope) => {
				const seatInjected = (sessionId) => {
					const binding = sessionId === void 0 ? void 0 : ctx.sessions.binding(sessionId);
					const seat = binding === void 0 ? unboundSeat : seatFor(binding);
					return {
						hooks: {
							agentPresetSeat: seat.store,
							developerTools: ctx.configForms.developerTools.enabled
						},
						load: () => seat.load(),
						select: async (id) => {
							const from = analyticsMode(seat.store.getSnapshot().current);
							const to = analyticsMode(id);
							const enabled = toolsSettings.getSnapshot().value?.enabled;
							const outcome = await seat.select(id);
							if ((outcome.kind === "applied" || outcome.kind === "staged" && sessionId === void 0) && from !== void 0 && to !== void 0 && to !== "other" && from !== to && enabled !== void 0) ctx.get("productAnalytics")?.track("agent_preset_switch", {
								switch_from: from,
								switch_to: to,
								code_work_view_enabled: enabled
							});
							return outcome.kind === "refused" ? outcome.reason : void 0;
						},
						dismissRefusal: (error) => {
							seat.dismissRefusal(error);
						},
						introduced: () => {
							seat.introduced();
						}
					};
				};
				const labelInjected = () => ({
					hooks: { agentPresets: controller.store },
					load: () => controller.load()
				});
				const startCreatorDraft = () => {
					const listed = mainBlank()?.projectionValues?.agentPreset;
					if (typeof listed !== "string" || listed === "cordis") (mainBlankSeat() ?? unboundSeat).stage("cordis", true);
					scope.uiWorkspace.startSession(void 0, {
						clearPreviousDraft: false,
						agentPreset: "cordis"
					});
				};
				scope.effect(() => {
					creatorDraft = startCreatorDraft;
					const chip = scope.slots.register({
						name: "conversation.hero.agentPreset",
						locale: "settings.agentPreset",
						inject: seatInjected
					}, AgentPresetSeat);
					const label = scope.slots.register({
						name: "conversation.session.header.actions",
						id: "agent-preset",
						order: -10,
						locale: "settings.agentPreset",
						inject: labelInjected
					}, AgentPresetLabel);
					return () => {
						creatorDraft = void 0;
						chip();
						label();
					};
				}, "ui-agent-preset: new-session chip and header label");
				scope.slots.inject("plugins.add.actions", () => scope.slots.register({
					name: "plugins.add.actions",
					id: "create-plugin",
					locale: "settings.agentPreset",
					inject: () => ({
						hooks: { agentPresets: controller.store },
						load: () => controller.load(),
						startCreatorDraft
					})
				}, CreatePluginMenuItem));
			});
			/** Capture the exact blank Session one Settings action may update. */
			const captureBlankSessionSync = () => {
				const summary = Object.values(ctx.sessions.list.getSnapshot().byId).find((session) => session.blank && (session.retainedBy.mainView ?? 0) > 0);
				const binding = summary === void 0 ? void 0 : ctx.sessions.binding(summary.id);
				const seat = binding === void 0 ? void 0 : seatFor(binding);
				const sessionId = seat?.blankSessionId();
				return async (id) => {
					if (seat === void 0 || sessionId === void 0 || binding === void 0 || seats.get(binding) !== seat) return void 0;
					return await seat.syncBlankSession(sessionId, id);
				};
			};
			const sectionInjected = () => ({
				hooks: {
					agentPresetSection: section.store,
					developerTools: ctx.configForms.developerTools.enabled
				},
				load: () => section.load(),
				view: (id) => section.view(id),
				closeView: () => {
					section.closeView();
				},
				...creatorDraft === void 0 ? {} : { startCreatorDraft: creatorDraft },
				makeDefault: (id) => section.makeDefault(id, captureBlankSessionSync())
			});
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "agent-presets",
				order: 20,
				label: () => ctx.locale.bind("settings.agentPreset")("nav"),
				locale: "settings.agentPreset",
				inject: sectionInjected
			}, AgentPresetSection));
		}
		//#endregion
		exports.AGENT_PRESET_SETTINGS_NS = AGENT_PRESET_SETTINGS_NS;
		exports.apply = apply;
		exports.inject = inject;
		exports.writeDefaultPreset = writeDefaultPreset;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map