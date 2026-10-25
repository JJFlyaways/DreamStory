window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-shortcuts",
	factory: (require) => {
		var module = { exports: {} };
		module.exports;
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/types/binding.js
		const keyNames = {
			Slash: "/",
			Comma: ",",
			Period: ".",
			Backslash: "\\",
			Backquote: "`",
			Minus: "-",
			Equal: "=",
			BracketLeft: "[",
			BracketRight: "]",
			Semicolon: ";",
			Quote: "'",
			Enter: "Enter",
			Escape: "Esc",
			Space: "Space",
			Tab: "Tab",
			Backspace: "Backspace",
			Delete: "Delete",
			ArrowUp: "↑",
			ArrowDown: "↓",
			ArrowLeft: "←",
			ArrowRight: "→"
		};
		const modifierOrder = [
			"control",
			"alt",
			"shift",
			"meta"
		];
		/**
		* Expand logical modifiers, deduplicate, and validate the physical code.
		* @param binding - declared binding.
		* @param platform - receiving device platform.
		* @returns canonical binding; unsupported codes throw during registration.
		*/
		function normalizeBinding(binding, platform) {
			const codes = [binding.code, ...binding.secondCode === void 0 ? [] : [binding.secondCode]];
			codes.sort();
			for (const code of codes) if (!/^(Key[A-Z]|Digit[0-9]|F([1-9]|1[0-9]|2[0-4]))$/u.test(code) && !Object.hasOwn(keyNames, code)) throw new Error(`Unsupported shortcut code: ${code}`);
			if (codes.length === 2 && codes[0] === codes[1]) throw new Error("Shortcut keys must be distinct");
			const modifiers = new Set(binding.modifiers.map((value) => value === "primary" ? platform === "macos" ? "meta" : "control" : value));
			return {
				code: codes[0],
				...codes[1] === void 0 ? {} : { secondCode: codes[1] },
				modifiers: modifierOrder.filter((value) => modifiers.has(value))
			};
		}
		/**
		* Produce an exact-match index from a normalized binding.
		* @param binding - normalized physical key and modifiers.
		* @returns stable index used for both matching and conflict checks.
		*/
		function bindingKey(binding) {
			const codes = binding.secondCode === void 0 ? [binding.code] : [binding.code, binding.secondCode].sort();
			return [...binding.modifiers, ...codes].join("+");
		}
		/**
		* Format keycaps and ARIA; Windows separates modifiers with plus signs, while chord keys remain adjacent.
		* @param binding - normalized binding, or null for an unbound command.
		* @param platform - receiving device platform.
		* @returns visible keycaps; two-key chords omit ARIA shortcuts, which only support one non-modifier key.
		*/
		function presentBinding(binding, platform) {
			if (binding === null) return {
				keys: [],
				aria: void 0
			};
			const key = keyNames[binding.code] ?? binding.code.replace(/^(Key|Digit)/u, "");
			const symbols = platform === "macos" ? {
				control: "⌃",
				alt: "⌥",
				shift: "⇧",
				meta: "⌘"
			} : {
				control: "Ctrl",
				alt: "Alt",
				shift: "Shift",
				meta: "Meta"
			};
			const ariaNames = {
				control: "Control",
				alt: "Alt",
				shift: "Shift",
				meta: "Meta"
			};
			const ariaKey = binding.code === "Space" ? "Space" : binding.code === "Escape" ? "Escape" : binding.code.startsWith("Arrow") ? binding.code : key;
			const second = binding.secondCode === void 0 ? [] : [keyNames[binding.secondCode] ?? binding.secondCode.replace(/^(Key|Digit)/u, "")];
			const keys = [...binding.modifiers.map((value) => symbols[value]), key];
			return {
				keys: [...platform === "windows" ? keys.flatMap((label, index) => index === 0 ? [label] : ["+", label]) : keys, ...second],
				aria: binding.secondCode === void 0 ? [...binding.modifiers.map((value) => ariaNames[value]), ariaKey].join("+") : void 0
			};
		}
		/**
		* Check Web combinations: Windows and macOS also admit any three or four modifiers; Linux retains the limited set.
		* @param binding - normalized candidate.
		* @param platform - receiving device platform.
		* @returns whether this combination is admitted; admission does not guarantee browser or system delivery.
		*/
		function isWebBindingAllowed(binding, platform) {
			if (binding.secondCode !== void 0) return false;
			if (platform === "windows" || platform === "macos") {
				if (binding.modifiers.length >= 3) return true;
				const primary = platform === "macos" ? "meta" : "control";
				if (binding.modifiers.length === 1 && (["Comma", "Backslash"].includes(binding.code) && binding.modifiers[0] === primary || binding.code === "Backquote" && binding.modifiers[0] === "control")) return true;
				if (binding.modifiers.length === 2 && binding.modifiers.includes(primary) && (binding.modifiers.includes("alt") || binding.modifiers.includes("shift"))) return true;
			}
			return [
				{
					code: "Slash",
					modifiers: ["primary"]
				},
				{
					code: "Comma",
					modifiers: ["primary", "shift"]
				},
				{
					code: "Period",
					modifiers: ["primary", "shift"]
				}
			].some((candidate) => bindingKey(binding) === bindingKey(normalizeBinding(candidate, platform)));
		}
		//#endregion
		//#region ../../util/values/lib/index.js
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
		/** Duplicate-install-safe JSON and immutable-value helpers. @module @deepseek-ai/dsh-util-values */
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
		//#region lib/types/configuration.js
		/** Validated preference documents and deterministic conflict resolution, without browser dependencies. */
		const record = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
		const commandPattern = /^[a-z][a-zA-Z0-9-]*(?:\.[a-zA-Z][a-zA-Z0-9-]*)+$/u;
		/**
		* Validate JSON binding fields before normalization; unknown fields are rejected to prevent lossy rewrites.
		* @param value - file or IPC input.
		* @returns a binding with a supported physical code, or null for explicit removal.
		*/
		function parseBinding(value) {
			if (value === null) return null;
			if (!record(value) || Object.keys(value).some((key) => key !== "code" && key !== "secondCode" && key !== "modifiers") || typeof value.code !== "string" || !Array.isArray(value.modifiers) || Object.hasOwn(value, "secondCode") && typeof value.secondCode !== "string" || !value.modifiers.every((modifier) => typeof modifier === "string" && [
				"primary",
				"control",
				"alt",
				"shift",
				"meta"
			].includes(modifier))) throw new Error("Invalid shortcut binding");
			const binding = {
				code: value.code,
				modifiers: value.modifiers,
				...typeof value.secondCode === "string" ? { secondCode: value.secondCode } : {}
			};
			normalizeBinding(binding, "windows");
			return binding;
		}
		/**
		* Decode the complete document while preserving dormant command overrides.
		* @param raw - stored JSON, or null for a missing document.
		* @returns the accepted document or a classified read failure.
		*/
		function parseShortcutDocument(raw) {
			if (raw === null) return {
				schemaVersion: 1,
				profiles: {}
			};
			try {
				const value = JSON.parse(raw);
				if (!record(value)) return "invalid";
				if (typeof value.schemaVersion === "number" && value.schemaVersion > 2) return "future";
				if (value.schemaVersion !== 1 && value.schemaVersion !== 2 || !record(value.profiles) || Object.keys(value).some((key) => key !== "schemaVersion" && key !== "profiles")) return "invalid";
				const profiles = {};
				for (const [profile, overrides] of Object.entries(value.profiles)) {
					if (!/^(desktop|web):(macos|windows|linux)$/u.test(profile) || !record(overrides)) return "invalid";
					const bindings = {};
					for (const [id, binding] of Object.entries(overrides)) {
						if (!commandPattern.test(id)) return "invalid";
						const parsed = parseBinding(binding);
						if (value.schemaVersion === 1 && parsed?.secondCode !== void 0) return "invalid";
						bindings[id] = parsed;
					}
					profiles[profile] = bindings;
				}
				return {
					schemaVersion: value.schemaVersion,
					profiles
				};
			} catch (_error) {
				return "invalid";
			}
		}
		/**
		* Check system, editor, and browser reservations using expanded physical modifiers.
		* @param binding - normalized candidate.
		* @param runtime - receiving application shell.
		* @param platform - receiving device.
		* @returns the rejection reason, or null when this combination is allowed.
		*/
		function bindingIssue(binding, runtime, platform) {
			const { code, modifiers } = binding;
			if (runtime === "desktop" && (platform === "windows" || platform === "macos")) return null;
			if (binding.secondCode !== void 0) return "unsupported-key";
			if (modifiers.length === 0 || modifiers.every((modifier) => modifier === "shift")) return "modifier-required";
			if ((platform === "windows" || platform === "macos") && modifiers.length >= 3) return null;
			if (runtime === "web" && (platform === "windows" || platform === "macos") && isWebBindingAllowed(binding, platform)) return null;
			const primary = modifiers.includes(platform === "macos" ? "meta" : "control");
			if ([
				"Escape",
				"Tab",
				"Space",
				"Backspace",
				"Delete",
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight"
			].includes(code) || code === "Enter" && !modifiers.includes("alt") || primary && [
				"KeyC",
				"KeyV",
				"KeyX",
				"KeyZ",
				"KeyY",
				"KeyQ",
				"KeyH"
			].includes(code) || primary && code === "KeyA" && !modifiers.includes("shift") || platform !== "macos" && (modifiers.includes("meta") || modifiers.includes("alt") && ["F4", "F2"].includes(code)) || platform === "macos" && modifiers.includes("control") && modifiers.includes("meta") || platform === "macos" && modifiers.includes("alt") && !primary) return "reserved";
			if (runtime === "web" && !isWebBindingAllowed(binding, platform)) return "unsupported-browser";
			return null;
		}
		/**
		* Select the command owner's explicit default for one device profile.
		* @param definition - command identity and per-profile defaults.
		* @param runtime - receiving shell.
		* @param platform - receiving device.
		* @returns the declared physical binding, or undefined for an unbound action.
		*/
		function resolveShortcutDefault(definition, runtime, platform) {
			return definition.defaults[`${runtime}:${platform}`];
		}
		/**
		* Resolve overrides and conflicts independently of registration order. Explicit overrides displace defaults.
		* @param definitions - active commands.
		* @param document - accepted preferences.
		* @param runtime - receiving shell.
		* @param platform - receiving device.
		* @returns every active command, including unavailable conflicting bindings.
		*/
		function effectiveShortcuts(definitions, document, runtime, platform) {
			const overrides = document.profiles[`${runtime}:${platform}`] ?? {};
			const fixed = definitions.flatMap((row) => row.fixed?.map((binding) => ({
				id: row.id,
				binding: normalizeBinding(binding, platform)
			})) ?? []);
			const rows = definitions.filter((row) => row.fixed === void 0).map(({ id, defaults }) => {
				const modified = Object.hasOwn(overrides, id);
				const candidate = modified ? overrides[id] : resolveShortcutDefault({
					id,
					defaults
				}, runtime, platform);
				const binding = candidate == null ? null : normalizeBinding(candidate, platform);
				return {
					id,
					binding,
					modified,
					issue: binding === null ? null : bindingIssue(binding, runtime, platform)
				};
			});
			return rows.map((row) => {
				const binding = row.binding;
				return {
					...row,
					conflicts: binding === null ? [] : [...new Set([...rows.filter((other) => other.id !== row.id && other.binding !== null && other.issue === null && overlappingBindings(other.binding, binding) && (!row.modified || other.modified)).map((other) => other.id), ...fixed.filter((other) => overlappingBindings(other.binding, binding)).map((other) => other.id)])]
				};
			});
		}
		/**
		* Detect identical combinations or a single key contained in a two-key chord.
		* @param left - normalized candidate.
		* @param right - normalized occupied binding.
		* @returns whether both bindings require the same modifiers and overlap.
		*/
		function overlappingBindings(left, right) {
			if (left.modifiers.join("+") !== right.modifiers.join("+")) return false;
			if (left.secondCode !== void 0 && right.secondCode !== void 0) return bindingKey(left) === bindingKey(right);
			return [left.code, left.secondCode].some((code) => code !== void 0 && (code === right.code || code === right.secondCode));
		}
		/**
		* Apply an edit without modifying other profiles or dormant overrides.
		* @param document - accepted document.
		* @param edit - validated operation.
		* @param runtime - current shell.
		* @param platform - current device.
		* @returns the candidate document, pending conflict checks and durable storage.
		*/
		function editShortcutDocument(document, edit, runtime, platform) {
			const schemaVersion = runtime === "desktop" && (platform === "macos" || platform === "windows") ? 2 : document.schemaVersion;
			const profile = `${runtime}:${platform}`;
			let overrides = { ...document.profiles[profile] };
			switch (edit.type) {
				case "set":
					overrides[edit.id] = edit.binding;
					break;
				case "reset": {
					const { [edit.id]: _removed, ...remaining } = overrides;
					overrides = remaining;
					break;
				}
				case "reset-all":
					overrides = {};
					break;
				/* v8 ignore next -- parseShortcutEdit validates this closed union before persistence. */
				default: return assertNever(edit, "shortcut edit");
			}
			return {
				schemaVersion,
				profiles: {
					...document.profiles,
					[profile]: overrides
				}
			};
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
		//#region lib/types/persistence.js
		/** Serialized preference transactions; storage owners publish only accepted writes or read diagnostics. */
		/**
		* Create a disabled initial snapshot for asynchronous adapter startup.
		* @returns a fresh configuration with no accepted persisted state.
		*/
		function initialShortcutConfig() {
			return {
				revision: randomUUID(),
				sequence: 0,
				document: {
					schemaVersion: 1,
					profiles: {}
				},
				status: "loading",
				error: null,
				usingDefaults: true
			};
		}
		/** Single-writer coordinator shared by localStorage and Electron's atomic file adapter. */
		var ShortcutPersistence = class {
			storage;
			runtime;
			platform;
			rereadBeforeWrite;
			publish;
			snapshot = initialShortcutConfig();
			raw;
			queue = Promise.resolve();
			definitions = null;
			active = true;
			constructor(storage, runtime, platform, rereadBeforeWrite, publish) {
				this.storage = storage;
				this.runtime = runtime;
				this.platform = platform;
				this.rereadBeforeWrite = rereadBeforeWrite;
				this.publish = publish;
			}
			/**
			* Install or revoke a product catalog and invalidate drafts from its previous lifetime.
			* @param definitions - current trusted definitions, or null while the product is not ready.
			*/
			setDefinitions(definitions) {
				this.definitions = definitions;
				this.accept({ ...this.snapshot });
			}
			/** Stop accepting edits or publishing late completions. */
			dispose() {
				this.active = false;
			}
			/**
			* Read the current file; failures retain the last accepted document and disable ordinary writes.
			* @returns the accepted snapshot or diagnostic snapshot.
			*/
			readCurrent() {
				return this.serialize(() => this.read());
			}
			/**
			* Compare the draft revision, validate the complete candidate, then persist before publishing.
			* @param edit - constrained preference operation.
			* @param revision - state against which the user reviewed the edit.
			* @returns a classified outcome and the currently accepted snapshot.
			*/
			edit(edit, revision) {
				return this.serialize(async () => {
					if (this.rereadBeforeWrite) await this.read();
					const result = (status) => ({
						status,
						snapshot: this.snapshot
					});
					if (!this.active || this.definitions === null || this.snapshot.status === "loading") return result("not-ready");
					if (revision !== this.snapshot.revision) return result("stale");
					if (this.snapshot.status === "unreadable") return result("unreadable");
					if ((edit.type === "set" || edit.type === "reset") && !this.definitions.some((row) => row.id === edit.id && row.fixed === void 0)) return result("not-ready");
					const document = editShortcutDocument(this.snapshot.document, edit, this.runtime, this.platform);
					const rows = effectiveShortcuts(this.definitions, document, this.runtime, this.platform);
					const invalid = rows.find((row) => (edit.type === "reset-all" || row.id === edit.id) && (row.issue !== null || row.conflicts.length > 0));
					const displaced = edit.type === "set" ? rows.find((row) => row.conflicts.includes(edit.id)) : void 0;
					if (invalid !== void 0 || displaced !== void 0) return {
						...result("conflict"),
						...invalid?.issue ? { issue: invalid.issue } : {},
						conflicts: invalid?.conflicts.length ? invalid.conflicts : displaced === void 0 ? [] : [displaced.id]
					};
					try {
						const raw = `${JSON.stringify(document, null, 2)}\n`;
						await this.storage.write(raw);
						this.raw = raw;
						this.accept({
							...this.snapshot,
							document,
							status: "ready",
							error: null,
							usingDefaults: false
						});
						return result("saved");
					} catch (_error) {
						return result("write-failed");
					}
				});
			}
			serialize(operation) {
				const next = this.queue.then(operation);
				this.queue = next.catch(() => void 0);
				return next;
			}
			accept(snapshot) {
				this.snapshot = {
					...snapshot,
					sequence: this.snapshot.sequence + 1,
					revision: randomUUID()
				};
				if (!this.active) return;
				try {
					this.publish(this.snapshot);
				} catch (error) {
					console.error("Shortcut configuration subscriber failed:", error);
				}
			}
			async read() {
				let raw;
				try {
					raw = await this.storage.read();
				} catch (_error) {
					if (this.snapshot.error !== "read") this.accept({
						...this.snapshot,
						status: "unreadable",
						error: "read"
					});
					return this.snapshot;
				}
				if (raw === this.raw && this.snapshot.error !== "read") return this.snapshot;
				this.raw = raw;
				const document = parseShortcutDocument(raw);
				if (typeof document === "string") this.accept({
					...this.snapshot,
					status: "unreadable",
					error: document
				});
				else this.accept({
					...this.snapshot,
					document,
					status: "ready",
					error: null,
					usingDefaults: raw === null
				});
				return this.snapshot;
			}
		};
		//#endregion
		//#region lib/types/client/registry.js
		/** Command registration, normalized default bindings, and synchronous dispatch. */
		/** Application command registry; adapters own event listeners, feature plugins own actions. */
		var ShortcutRegistry = class {
			runtime;
			platform;
			commands = /* @__PURE__ */ new Map();
			fixedCommands = /* @__PURE__ */ new Map();
			conflicts = /* @__PURE__ */ new Map();
			bindings = /* @__PURE__ */ new Map();
			state;
			/** Effective localized rows derived from the accepted configuration. */
			catalog;
			/** Accepted preferences and visible read diagnostics. */
			config;
			/** Fixed local operations whose owning plugins are mounted. */
			fixedCatalog = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)([]);
			constructor(runtime, platform, config = {
				...initialShortcutConfig(),
				status: "ready"
			}) {
				this.runtime = runtime;
				this.platform = platform;
				this.state = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
					catalog: [],
					config
				});
				this.catalog = {
					getSnapshot: () => this.state.getSnapshot().catalog,
					subscribe: (listener) => this.state.subscribe(listener)
				};
				this.config = {
					getSnapshot: () => this.state.getSnapshot().config,
					subscribe: (listener) => this.state.subscribe(listener)
				};
			}
			/**
			* Return the serializable active catalog for storage validation.
			* @returns definitions without callbacks or localized labels.
			*/
			definitions() {
				return [...[...this.commands.values()].map(({ id, defaults }) => ({
					id,
					defaults
				})), ...[...this.fixedCommands.values()].map(({ id, bindings }) => ({
					id,
					defaults: {},
					fixed: bindings
				}))];
			}
			/**
			* Register a read-only input action whose keys cannot be assigned to editable commands.
			* @param command - owner-localized action and readable sequence.
			* @returns idempotent disposer removing its reference row.
			*/
			registerFixed(command) {
				if (this.fixedCommands.has(command.id) || this.commands.has(command.id)) throw new Error(`Duplicate shortcut command: ${command.id}`);
				for (const binding of command.bindings) normalizeBinding(binding, this.platform);
				this.fixedCommands.set(command.id, command);
				this.refreshLabels();
				return () => {
					if (this.fixedCommands.get(command.id) !== command) return;
					this.fixedCommands.delete(command.id);
					this.refreshLabels();
				};
			}
			refreshFixedLabels() {
				this.fixedCatalog.set([...this.fixedCommands.values()].map((command) => ({
					id: command.id,
					label: command.label(),
					keys: command.keys,
					group: command.group,
					bindings: command.bindings.map((binding) => normalizeBinding(binding, this.platform))
				})));
			}
			/**
			* Publish accepted preferences and all derived labels atomically.
			* @param config - storage owner's latest accepted snapshot.
			*/
			configure(config) {
				const current = this.config.getSnapshot();
				if (config.revision === current.revision && config.status === current.status && config.error === current.error) return;
				this.refreshLabels(config);
			}
			/**
			* Register atomically after checking defaults for all supported platforms and shells.
			* @param command - feature-owned command definition.
			* @returns idempotent disposer removing both matching and catalog entries.
			*/
			register(command) {
				if (this.commands.has(command.id) || this.fixedCommands.has(command.id)) throw new Error(`Duplicate shortcut command: ${command.id}`);
				for (const runtime of ["desktop", "web"]) for (const platform of [
					"macos",
					"windows",
					"linux"
				]) {
					const candidate = resolveShortcutDefault(command, runtime, platform);
					if (candidate === void 0) continue;
					const binding = normalizeBinding(candidate, platform);
					if (runtime === "web" && !isWebBindingAllowed(binding, platform)) throw new Error(`Unsupported Web shortcut: ${command.id}`);
					if (bindingIssue(binding, runtime, platform) !== null) throw new Error(`Reserved shortcut default: ${command.id}`);
					for (const existing of this.commands.values()) {
						const other = resolveShortcutDefault(existing, runtime, platform);
						if (other !== void 0 && overlappingBindings(binding, normalizeBinding(other, platform))) throw new Error(`Conflicting shortcut defaults: ${command.id} and ${existing.id} (${runtime}:${platform})`);
					}
				}
				this.commands.set(command.id, command);
				this.refreshLabels();
				return () => {
					if (this.commands.get(command.id) !== command) return;
					this.commands.delete(command.id);
					this.refreshLabels();
				};
			}
			/**
			* Recompute effective bindings when preferences, commands, or locale change.
			* @param config - accepted configuration, defaulting to the current snapshot.
			*/
			refreshLabels(config = this.config.getSnapshot()) {
				this.bindings.clear();
				this.conflicts.clear();
				const catalog = effectiveShortcuts(this.definitions(), config.document, this.runtime, this.platform).map((row) => {
					const command = this.commands.get(row.id);
					const enabled = config.status !== "loading" && row.issue === null && row.conflicts.length === 0;
					if (enabled && row.binding !== null) this.bindings.set(bindingKey(row.binding), command);
					if (config.status !== "loading" && row.issue === null && row.conflicts.length > 0 && row.binding !== null) this.conflicts.set(bindingKey(row.binding), command);
					return {
						...row,
						label: command.label(),
						aliases: command.aliases,
						...presentBinding(row.binding, this.platform),
						aria: enabled ? presentBinding(row.binding, this.platform).aria : void 0
					};
				});
				this.state.set({
					config,
					catalog
				});
				this.refreshFixedLabels();
			}
			/**
			* Invoke a native menu selection independently of its optional key binding.
			* @param id - registered product command.
			* @param context - live input owner and modal state.
			*/
			invoke(id, context) {
				const command = this.commands.get(id);
				if (command === void 0 || context.modal !== null && !command.modals.includes(context.modal)) return;
				const result = command.resolve({
					...context,
					source: "menu"
				});
				if (result.status === "handled") result.run();
			}
			/**
			* Windows/macOS Desktop bindings override local regions and modal controls independently of their configuration source.
			* @param gesture - normalized DOM/native input facts.
			* @param context - synchronous input and modal owner.
			* @param consume - adapter's preventDefault, called before business execution.
			* @returns handled, blocked with a reason, or pass for local/system input.
			*/
			dispatch(gesture, context, consume) {
				if (gesture.defaultPrevented || gesture.composing) return { status: "pass" };
				const modifiers = [
					"control",
					"alt",
					"shift",
					"meta"
				].filter((value) => gesture[value]);
				const pairKey = bindingKey({
					code: gesture.code,
					modifiers,
					...gesture.secondCode === void 0 ? {} : { secondCode: gesture.secondCode }
				});
				const key = this.bindings.has(pairKey) || this.conflicts.has(pairKey) ? pairKey : bindingKey({
					code: gesture.code,
					modifiers
				});
				const command = this.bindings.get(key) ?? this.conflicts.get(key);
				const priority = this.runtime === "desktop" && (this.platform === "windows" || this.platform === "macos");
				if (command === void 0 || !priority && !command.regions.includes(context.region)) return { status: "pass" };
				if (!priority && context.region === "terminal" && gesture.control && !gesture.meta && !gesture.alt && !gesture.shift && (gesture.code === "KeyW" || gesture.code === "KeyR")) return { status: "pass" };
				if (!this.bindings.has(key)) {
					consume();
					return {
						status: "blocked",
						commandId: command.id,
						reason: "conflict"
					};
				}
				if (!priority && context.modal !== null && !command.modals.includes(context.modal)) {
					consume();
					return {
						status: "blocked",
						commandId: command.id,
						reason: "modal"
					};
				}
				const resolution = command.resolve(context);
				if (resolution.status === "pass") return resolution;
				consume();
				if (resolution.status === "blocked") return {
					...resolution,
					commandId: command.id
				};
				if (!gesture.repeat) resolution.run();
				return {
					status: "handled",
					commandId: command.id
				};
			}
		};
		//#endregion
		//#region lib/types/client/dom.js
		/** Main-document keyboard adapter; local controls arbitrate before window bubbling. */
		/**
		* Detect the visiting device, never the server operating system.
		* @param document - product document, marked by Electron preload when present.
		* @param navigator - browser device identification.
		* @returns explicit runtime and platform for default resolution.
		*/
		function detectEnvironment(document, navigator) {
			const desktop = document.documentElement.dataset.platform;
			const device = desktop ?? navigator.platform;
			return {
				runtime: desktop === void 0 ? "web" : "desktop",
				platform: /darwin|mac|iphone|ipad/iu.test(device) ? "macos" : /win/iu.test(device) ? "windows" : "linux"
			};
		}
		/**
		* Install document composition tracking, modal-cache invalidation, and dispatch after local handlers.
		* @param window - input window owned by the client plugin.
		* @param shortcuts - command registry for this window.
		* @param fixed - optional fixed-sequence consumer after local controls.
		* @param native - native input owns configurable bindings; DOM delivery only feeds fixed actions.
		* @returns disposer releasing every listener, the modal observer, and cached nodes.
		*/
		function installKeyboard(window, shortcuts, fixed, native = false) {
			const document = window.document;
			const composition = (0, _deepseek_ai_dsh_client_ui_primitives.observeComposition)(document);
			let pending = false;
			let pendingTimer;
			const reset = () => {
				fixed?.({ type: "reset" });
			};
			let deadKey = false;
			let dialogs;
			const blur = () => {
				deadKey = false;
				reset();
			};
			const containsModal = (node) => node instanceof Element && (node.matches(_deepseek_ai_dsh_client_ui_primitives.modalSelector) || node.querySelector(_deepseek_ai_dsh_client_ui_primitives.modalSelector) !== null);
			const changedModals = (records) => {
				if (records.length > 0) dialogs = void 0;
				if (records.some((record) => record.type === "attributes" ? record.oldValue === "dialog" || record.oldValue === "true" || containsModal(record.target) : [...record.addedNodes, ...record.removedNodes].some(containsModal))) reset();
			};
			const observer = new MutationObserver(changedModals);
			observer.observe(document.documentElement, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ["role", "aria-modal"],
				attributeOldValue: true
			});
			const capture = () => {
				if (pending) reset();
				window.clearTimeout(pendingTimer);
				changedModals(observer.takeRecords());
				pending = true;
				pendingTimer = window.setTimeout(() => {
					pending = false;
					pendingTimer = void 0;
					reset();
				}, 0);
			};
			const keydown = (event) => {
				window.clearTimeout(pendingTimer);
				pendingTimer = void 0;
				pending = false;
				const target = event.composedPath().find((value) => value instanceof Element);
				const element = target instanceof Element ? target : document.activeElement;
				const region = element?.closest(".xterm") ? "terminal" : element?.closest("input, textarea, select, [contenteditable=\"true\"], [contenteditable=\"\"]") ? "editable" : "page";
				changedModals(observer.takeRecords());
				dialogs ??= document.querySelectorAll(_deepseek_ai_dsh_client_ui_primitives.modalSelector);
				const top = dialogs[dialogs.length - 1];
				const context = {
					region,
					modal: top === void 0 ? null : top.dataset.shortcutModal ?? "other",
					target: element
				};
				const guarded = composition.guards(event) || deadKey || event.getModifierState("AltGraph");
				const isDead = event.key === "Dead";
				const commandDeadKey = isDead && shortcuts.runtime === "web" && shortcuts.platform === "macos" && event.code === "KeyN" && event.metaKey && event.altKey && !event.ctrlKey && !event.shiftKey;
				deadKey = isDead;
				const gesture = {
					code: event.code,
					control: event.ctrlKey,
					alt: event.altKey,
					shift: event.shiftKey,
					meta: event.metaKey,
					repeat: event.repeat,
					composing: guarded || isDead,
					defaultPrevented: event.defaultPrevented
				};
				const consume = () => {
					event.preventDefault();
					if (commandDeadKey) deadKey = false;
				};
				fixed?.({
					type: "keydown",
					gesture,
					context,
					consume
				});
				if (native) return;
				shortcuts.dispatch({
					...gesture,
					composing: guarded || isDead && !commandDeadKey,
					defaultPrevented: event.defaultPrevented
				}, context, consume);
			};
			document.addEventListener("compositionstart", reset, true);
			document.addEventListener("compositionend", reset, true);
			document.addEventListener("focusin", reset, true);
			document.addEventListener("pointerdown", reset, true);
			window.addEventListener("keydown", capture, true);
			window.addEventListener("keydown", keydown);
			window.addEventListener("blur", blur);
			return () => {
				pending = false;
				window.clearTimeout(pendingTimer);
				observer.disconnect();
				dialogs = void 0;
				composition.dispose();
				document.removeEventListener("compositionstart", reset, true);
				document.removeEventListener("compositionend", reset, true);
				document.removeEventListener("focusin", reset, true);
				document.removeEventListener("pointerdown", reset, true);
				window.removeEventListener("keydown", capture, true);
				window.removeEventListener("keydown", keydown);
				window.removeEventListener("blur", blur);
			};
		}
		//#endregion
		//#region lib/types/client/storage.js
		/** Explicit browser and Desktop preference adapters; Desktop never falls back to browser storage. */
		/** Browser-profile and origin-local preference key. */
		const SHORTCUT_STORAGE_KEY = "dsh.keybindings.v1";
		/**
		* Connect localStorage and same-origin external updates to the shared transaction coordinator.
		* @param window - owning browser window.
		* @param platform - visiting device platform.
		* @param publish - accepts complete configuration snapshots.
		* @returns adapter and lifecycle disposal.
		*/
		function webShortcutStorage(window, platform, publish) {
			const persistence = new ShortcutPersistence({
				read: () => window.localStorage.getItem(SHORTCUT_STORAGE_KEY),
				write: (raw) => {
					window.localStorage.setItem(SHORTCUT_STORAGE_KEY, raw);
				}
			}, "web", platform, true, publish);
			const changed = (event) => {
				if (event.key === null || event.key === "dsh.keybindings.v1") persistence.readCurrent();
			};
			window.addEventListener("storage", changed);
			return {
				get: (definitions) => {
					persistence.setDefinitions(definitions);
					return persistence.readCurrent();
				},
				edit: (edit, revision) => persistence.edit(edit, revision),
				subscribe: () => () => {},
				recording: async () => {},
				dispose: () => {
					window.removeEventListener("storage", changed);
					persistence.dispose();
				}
			};
		}
		/**
		* Read the origin-scoped preload capability; a missing bridge is an explicit configuration failure.
		* @param window - product window.
		* @returns the restricted Desktop API, or undefined while the preload is unavailable.
		*/
		function desktopShortcutStorage(window) {
			return window.dshDesktop?.shortcuts;
		}
		//#endregion
		//#region lib/types/client/native.js
		/** Desktop gestures use live focus, modal state, and verified embedding ownership. */
		/**
		* Route native menu, main-frame, and embedded-frame input through the shared command registry.
		* @param window - trusted product document.
		* @param keyboard - top-frame preload capability.
		* @param registry - window-local command owner.
		* @param snapshot - latest accepted configuration.
		* @param reset - clears pending fixed sequences when native input bypasses DOM delivery.
		* @returns disposer releasing native input.
		*/
		function installNativeKeyboard(window, keyboard, registry, snapshot, reset) {
			return keyboard.subscribe((input) => {
				if (input.revision !== snapshot().revision) return;
				reset?.();
				let target = window.document.activeElement;
				while (target?.shadowRoot?.activeElement != null && !target.matches("webview[data-sidebar-browser-frame]")) target = target.shadowRoot.activeElement;
				const top = [...window.document.querySelectorAll(_deepseek_ai_dsh_client_ui_primitives.modalSelector)].at(-1);
				const region = target?.closest(".xterm") ? "terminal" : target?.matches("input, textarea, select, [contenteditable=\"true\"], [contenteditable=\"\"]") ? "editable" : "page";
				const context = {
					target,
					region,
					modal: top?.dataset.shortcutModal ?? (top === void 0 ? null : "other")
				};
				if (input.kind === "menu") {
					registry.invoke(input.commandId, context);
					return;
				}
				if (input.kind === "keyboard") {
					registry.dispatch({
						...input,
						composing: false,
						defaultPrevented: false
					}, context, () => {});
					return;
				}
				if (input.kind === "webview") {
					if (target?.matches("webview[data-sidebar-browser-frame]") !== true || !target.isConnected || input.frameName === "" || target.getAttribute("name") !== input.frameName) return;
					registry.dispatch({
						...input,
						composing: false,
						defaultPrevented: false
					}, {
						...context,
						source: "webview"
					}, () => {});
					return;
				}
				if (!(target instanceof HTMLIFrameElement) || !target.isConnected || !target.matches("iframe[data-sidebar-browser-frame], iframe[data-html-preview]") || input.frameName === "" || target.name !== input.frameName) return;
				registry.dispatch({
					...input,
					composing: false,
					defaultPrevented: false
				}, {
					...context,
					source: "iframe"
				}, () => {});
			});
		}
		//#endregion
		//#region ../../../vendor/cosmokit/lib/index.js
		/** Return true when a value is `null` or `undefined`. */
		function isNullable(value) {
			return value === null || value === void 0;
		}
		/** Return true for non-array object values. */
		function isPlainObject(data) {
			return data && typeof data === "object" && !Array.isArray(data);
		}
		/** Filter object entries and return a new object. */
		function filterKeys(object, filter) {
			return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
		}
		/** Map object values while preserving the original key set. */
		function mapValues(object, transform) {
			return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
		}
		/** Pick selected keys from an object, optionally including `undefined` values. */
		function pick(source, keys, forced) {
			if (!keys) return { ...source };
			const result = {};
			for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
			return result;
		}
		/** Shared config references used by schema validators and plugin runtimes. */
		const write = Symbol.for("cosmokit.volatile.write");
		function snapshot(value, ancestors = /* @__PURE__ */ new Set()) {
			if (typeof value === "function") throw new TypeError("volatile config cannot contain functions");
			if (value === null || typeof value !== "object") return value;
			if (ancestors.has(value)) throw new TypeError("volatile config cannot contain cycles");
			ancestors.add(value);
			try {
				if (Array.isArray(value)) return Object.freeze(value.map((item) => snapshot(item, ancestors)));
				if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new TypeError("volatile config objects must be plain objects or arrays");
				return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, snapshot(item, ancestors)])));
			} finally {
				ancestors.delete(value);
			}
		}
		/**
		* Create a detached reference containing an immutable copy of the supplied data.
		* @param value - validated config data; class instances and functions are unsupported.
		* @returns a reference whose value is updated only by its owning runtime.
		*/
		function createVolatile(value) {
			let current = snapshot(value);
			return Object.freeze({
				get: () => current,
				[write]: (value) => {
					current = value;
				}
			});
		}
		/**
		* Identify references across ESM/CJS copies of the shared library.
		* @param value - a parsed config value.
		* @returns whether the value implements the shared reference protocol.
		*/
		function isVolatile(value) {
			return typeof value === "object" && value !== null && write in value;
		}
		/** Test values using `instanceof` with a `toStringTag` fallback. */
		function is(type, value) {
			if (arguments.length === 1) return (value) => is(type, value);
			return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
		}
		function isArrayBufferLike(value) {
			return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
		}
		function isArrayBufferSource(value) {
			return isArrayBufferLike(value) || ArrayBuffer.isView(value);
		}
		/** Binary source detection and base64/hex conversion helpers. */
		var Binary;
		(function(Binary) {
			Binary.is = isArrayBufferLike;
			Binary.isSource = isArrayBufferSource;
			function fromSource(source) {
				if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
				else return source;
			}
			Binary.fromSource = fromSource;
			function toBase64(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
				let binary = "";
				const bytes = new Uint8Array(source);
				for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
				return btoa(binary);
			}
			Binary.toBase64 = toBase64;
			function fromBase64(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
				return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
			}
			Binary.fromBase64 = fromBase64;
			function toHex(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
				return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
			}
			Binary.toHex = toHex;
			function fromHex(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
				const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
				const buffer = [];
				for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
				return Uint8Array.from(buffer).buffer;
			}
			Binary.fromHex = fromHex;
		})(Binary || (Binary = {}));
		Binary.fromBase64;
		Binary.toBase64;
		Binary.fromHex;
		Binary.toHex;
		/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
		function clone(source, refs = /* @__PURE__ */ new Map()) {
			if (!source || typeof source !== "object") return source;
			if (is("Date", source)) return new Date(source.valueOf());
			if (is("RegExp", source)) return new RegExp(source.source, source.flags);
			if (isArrayBufferLike(source)) return source.slice(0);
			if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
			const cached = refs.get(source);
			if (cached) return cached;
			if (Array.isArray(source)) {
				const result = [];
				refs.set(source, result);
				source.forEach((value, index) => {
					result[index] = Reflect.apply(clone, null, [value, refs]);
				});
				return result;
			}
			const result = Object.create(Object.getPrototypeOf(source));
			refs.set(source, result);
			for (const key of Reflect.ownKeys(source)) {
				const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
				if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
				Reflect.defineProperty(result, key, descriptor);
			}
			return result;
		}
		/**
		* Compare values recursively, treating two volatile references as equal regardless of value.
		* Strict comparison distinguishes null/undefined, treats opaque objects by identity,
		* compares URLs by normalized href, treats array holes as undefined, and considers distinct cyclic structures unequal.
		* @param a - first value.
		* @param b - second value.
		* @param strict - whether to require strict data equality outside volatile references.
		* @returns whether the values compare equal.
		*/
		function deepEqual(a, b, strict) {
			const ancestors = /* @__PURE__ */ new Set();
			function compare(a, b) {
				if (a === b) return true;
				if (isVolatile(a) || isVolatile(b)) return isVolatile(a) && isVolatile(b);
				if (!strict && isNullable(a) && isNullable(b)) return true;
				if (typeof a !== typeof b || typeof a !== "object" || !a || !b) return false;
				if (ancestors.has(a)) return false;
				function check(test, then) {
					return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
				}
				ancestors.add(a);
				try {
					return check(Array.isArray, (a, b) => {
						if (a.length !== b.length) return false;
						for (let index = 0; index < a.length; index++) if (!compare(a[index], b[index])) return false;
						return true;
					}) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("URL"), (a, b) => a.href === b.href) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
						if (a.byteLength !== b.byteLength) return false;
						const viewA = new Uint8Array(a);
						const viewB = new Uint8Array(b);
						for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
						return true;
					}) ?? ((!strict || [a, b].every((value) => Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)) && Object.keys({
						...a,
						...b
					}).every((key) => compare(a[key], b[key])));
				} finally {
					ancestors.delete(a);
				}
			}
			return compare(a, b);
		}
		/** Time constants plus parsing and formatting helpers. */
		var Time;
		(function(Time) {
			Time.millisecond = 1;
			Time.second = 1e3;
			Time.minute = Time.second * 60;
			Time.hour = Time.minute * 60;
			Time.day = Time.hour * 24;
			Time.week = Time.day * 7;
			let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
			function setTimezoneOffset(offset) {
				timezoneOffset = offset;
			}
			Time.setTimezoneOffset = setTimezoneOffset;
			function getTimezoneOffset() {
				return timezoneOffset;
			}
			Time.getTimezoneOffset = getTimezoneOffset;
			function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
				if (typeof date === "number") date = new Date(date);
				if (offset === void 0) offset = timezoneOffset;
				return Math.floor((date.valueOf() / Time.minute - offset) / 1440);
			}
			Time.getDateNumber = getDateNumber;
			function fromDateNumber(value, offset) {
				const date = new Date(value * Time.day);
				if (offset === void 0) offset = timezoneOffset;
				return new Date(+date + offset * Time.minute);
			}
			Time.fromDateNumber = fromDateNumber;
			const numeric = /\d+(?:\.\d+)?/.source;
			const timeRegExp = new RegExp(`^${[
				"w(?:eek(?:s)?)?",
				"d(?:ay(?:s)?)?",
				"h(?:our(?:s)?)?",
				"m(?:in(?:ute)?(?:s)?)?",
				"s(?:ec(?:ond)?(?:s)?)?"
			].map((unit) => `(${numeric}${unit})?`).join("")}$`);
			function parseTime(source) {
				const capture = timeRegExp.exec(source);
				if (!capture) return 0;
				return (parseFloat(capture[1]) * Time.week || 0) + (parseFloat(capture[2]) * Time.day || 0) + (parseFloat(capture[3]) * Time.hour || 0) + (parseFloat(capture[4]) * Time.minute || 0) + (parseFloat(capture[5]) * Time.second || 0);
			}
			Time.parseTime = parseTime;
			function parseDate(date) {
				const parsed = parseTime(date);
				if (parsed) date = Date.now() + parsed;
				else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
				else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
				return date ? new Date(date) : /* @__PURE__ */ new Date();
			}
			Time.parseDate = parseDate;
			function format(ms) {
				const abs = Math.abs(ms);
				if (abs >= Time.day - Time.hour / 2) return Math.round(ms / Time.day) + "d";
				else if (abs >= Time.hour - Time.minute / 2) return Math.round(ms / Time.hour) + "h";
				else if (abs >= Time.minute - Time.second / 2) return Math.round(ms / Time.minute) + "m";
				else if (abs >= Time.second) return Math.round(ms / Time.second) + "s";
				return ms + "ms";
			}
			Time.format = format;
			function toDigits(source, length = 2) {
				return source.toString().padStart(length, "0");
			}
			Time.toDigits = toDigits;
			function template(template, time = /* @__PURE__ */ new Date()) {
				return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
			}
			Time.template = template;
		})(Time || (Time = {}));
		//#endregion
		//#region ../../../vendor/schemastery/lib/index.mjs
		const kSchema = Symbol.for("schemastery");
		const kValidationError = Symbol.for("ValidationError");
		globalThis.__schemastery_index__ ??= 0;
		globalThis.__schemastery_refs__ = void 0;
		var ValidationError = class extends TypeError {
			options;
			name = "ValidationError";
			constructor(message, options) {
				let prefix = "$";
				for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
				else if (typeof segment === "number") prefix += "[" + segment + "]";
				else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
				if (prefix.startsWith(".")) prefix = prefix.slice(1);
				super((prefix === "$" ? "" : `${prefix} `) + message);
				this.options = options;
			}
			static is(error) {
				return !!error?.[kValidationError];
			}
		};
		Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
		const Schema = function(options) {
			const schema = function(data, options = {}) {
				return Schema.resolve(data, schema, options)[0];
			};
			if (options.refs) {
				const refs = mapValues(options.refs, (options) => new Schema(options));
				const getRef = (uid) => refs[uid];
				for (const key in refs) {
					const options = refs[key];
					options.sKey = getRef(options.sKey);
					options.inner = getRef(options.inner);
					options.list = options.list && options.list.map(getRef);
					options.dict = options.dict && mapValues(options.dict, getRef);
				}
				return refs[options.uid];
			}
			Object.assign(schema, options);
			if (typeof schema.callback === "string") try {
				schema.callback = new Function("return " + schema.callback)();
			} catch {}
			Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
			Object.setPrototypeOf(schema, Schema.prototype);
			schema.meta ||= {};
			schema.toString = schema.toString.bind(schema);
			return schema;
		};
		Schema.prototype = Object.create(Function.prototype);
		Schema.prototype[kSchema] = true;
		Object.defineProperty(Schema.prototype, "~standard", { get() {
			return {
				version: 1,
				vendor: "schemastery",
				validate: (value) => {
					try {
						return { value: Schema.resolve(value, this, {})[0] };
					} catch (error) {
						if (ValidationError.is(error)) return { issues: [{
							message: error.message,
							path: error.options.path
						}] };
						throw error;
					}
				}
			};
		} });
		Schema.ValidationError = ValidationError;
		Schema.prototype.toJSON = function toJSON() {
			if (globalThis.__schemastery_refs__) {
				globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
				return this.uid;
			}
			globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
			globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
			const result = {
				uid: this.uid,
				refs: globalThis.__schemastery_refs__
			};
			globalThis.__schemastery_refs__ = void 0;
			return result;
		};
		Schema.prototype.set = function set(key, value) {
			this.dict[key] = value;
			return this;
		};
		Schema.prototype.push = function push(value) {
			this.list.push(value);
			return this;
		};
		function mergeDesc(original, messages) {
			const result = typeof original === "string" ? { "": original } : { ...original };
			for (const locale in messages) {
				const value = messages[locale];
				if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
				else if (typeof value === "string") result[locale] = value;
			}
			return result;
		}
		function getInner(value) {
			return value?.$value ?? value?.$inner;
		}
		function extractKeys(data) {
			return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
		}
		Schema.prototype.i18n = function i18n(messages) {
			const schema = Schema(this);
			const desc = mergeDesc(schema.meta.description, messages);
			if (Object.keys(desc).length) schema.meta.description = desc;
			if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
				return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
			});
			if (schema.list) schema.list = schema.list.map((inner, index) => {
				return inner.i18n(mapValues(messages, (data = {}) => {
					if (Array.isArray(getInner(data))) return getInner(data)[index];
					if (Array.isArray(data)) return data[index];
					return extractKeys(data);
				}));
			});
			if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
				if (getInner(data)) return getInner(data);
				return extractKeys(data);
			}));
			if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
			return schema;
		};
		Schema.prototype.extra = function extra(key, value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		};
		for (const key of [
			"required",
			"disabled",
			"collapse",
			"hidden",
			"loose"
		]) Object.assign(Schema.prototype, { [key](value = true) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		Schema.prototype.deprecated = function deprecated() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "deprecated",
				type: "danger"
			});
			return schema;
		};
		Schema.prototype.experimental = function experimental() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "experimental",
				type: "warning"
			});
			return schema;
		};
		Schema.prototype.pattern = function pattern(regexp) {
			const schema = Schema(this);
			const pattern = pick(regexp, ["source", "flags"]);
			schema.meta = {
				...schema.meta,
				pattern
			};
			return schema;
		};
		Schema.prototype.simplify = function simplify(value) {
			if (isVolatile(value)) value = value.get();
			if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
			if (isNullable(value)) return value;
			if (this.type === "object" || this.type === "dict") {
				const result = {};
				for (const key in value) {
					const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
					if (this.type === "dict" || !isNullable(item)) result[key] = item;
				}
				if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
				return result;
			} else if (this.type === "array" || this.type === "tuple") {
				const result = [];
				value.forEach((value, index) => {
					const schema = this.type === "array" ? this.inner : this.list[index];
					const item = schema ? schema.simplify(value) : value;
					result.push(item);
				});
				return result;
			} else if (this.type === "intersect") {
				const result = {};
				for (const item of this.list) Object.assign(result, item.simplify(value));
				return result;
			} else if (this.type === "union") for (const schema of this.list) try {
				Schema.resolve(value, schema, {});
				return schema.simplify(value);
			} catch {}
			return value;
		};
		Schema.prototype.toString = function toString(inline) {
			return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
		};
		Schema.prototype.role = function role(role, extra) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				role,
				extra
			};
			return schema;
		};
		for (const key of [
			"default",
			"link",
			"comment",
			"description",
			"max",
			"min",
			"step"
		]) Object.assign(Schema.prototype, { [key](value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		Schema.prototype.volatile = function volatile() {
			if (this.meta.volatile) throw new TypeError("volatile schema is already wrapped");
			return this.extra("volatile", true);
		};
		const resolvers = {};
		const checkedVolatile = Symbol("checked-volatile-schema");
		function validateVolatileSchema(schema, path = [], blocked = false, seen = /* @__PURE__ */ new Map()) {
			const states = seen.get(schema) ?? /* @__PURE__ */ new Set();
			if (states.has(blocked)) return;
			states.add(blocked);
			seen.set(schema, states);
			if (schema.meta?.volatile && blocked) throw new ValidationError("volatile fields require a fixed object path without an enclosing volatile field", { path });
			const nested = blocked || !!schema.meta?.volatile;
			if (schema.dict) for (const [key, child] of Object.entries(schema.dict)) validateVolatileSchema(child, [...path, key], nested, seen);
			if (schema.sKey) validateVolatileSchema(schema.sKey, [...path, "<key>"], true, seen);
			if (schema.inner && (schema.type !== "lazy" || schema.inner[kSchema])) validateVolatileSchema(schema.inner, [...path, "*"], true, seen);
			if (schema.list) for (let index = 0; index < schema.list.length; index++) validateVolatileSchema(schema.list[index], [...path, String(index)], true, seen);
		}
		Schema.extend = function extend(type, resolve) {
			resolvers[type] = resolve;
		};
		Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
			if (!schema) return [data];
			if (!options[checkedVolatile]) {
				validateVolatileSchema(schema, options.path);
				options = {
					...options,
					[checkedVolatile]: true
				};
			}
			if (schema.meta?.volatile) {
				const inner = Schema(schema);
				inner.meta = {
					...schema.meta,
					volatile: false
				};
				const [value, adapted] = Schema.resolve(data, inner, options, strict);
				try {
					return [createVolatile(value), adapted];
				} catch (error) {
					throw new ValidationError(error instanceof Error ? error.message : String(error), options);
				}
			}
			if (options.ignore?.(data, schema)) return [data];
			if (isNullable(data) && schema.type !== "lazy") {
				if (schema.meta.required) throw new ValidationError(`missing required value`, options);
				let current = schema;
				let fallback = schema.meta.default;
				while (current?.type === "intersect" && isNullable(fallback)) {
					current = current.list[0];
					fallback = current?.meta.default;
				}
				if (isNullable(fallback)) return [data];
				data = clone(fallback);
			}
			const callback = resolvers[schema.type];
			if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
			try {
				return callback(data, schema, options, strict);
			} catch (error) {
				if (!schema.meta.loose) throw error;
				return [schema.meta.default];
			}
		};
		Schema.from = function from(source) {
			if (isNullable(source)) return Schema.any();
			else if ([
				"string",
				"number",
				"boolean"
			].includes(typeof source)) return Schema.const(source).required();
			else if (source[kSchema]) return source;
			else if (typeof source === "function") switch (source) {
				case String: return Schema.string().required();
				case Number: return Schema.number().required();
				case Boolean: return Schema.boolean().required();
				case Function: return Schema.function().required();
				default: return Schema.is(source).required();
			}
			else throw new TypeError(`cannot infer schema from ${source}`);
		};
		Schema.lazy = function lazy(builder) {
			const toJSON = () => {
				if (!schema.inner[kSchema]) {
					schema.inner = schema.builder();
					schema.inner.meta = {
						...schema.meta,
						...schema.inner.meta
					};
				}
				return schema.inner.toJSON();
			};
			const schema = new Schema({
				type: "lazy",
				builder,
				inner: { toJSON }
			});
			return schema;
		};
		Schema.natural = function natural() {
			return Schema.number().step(1).min(0);
		};
		Schema.percent = function percent() {
			return Schema.number().step(.01).min(0).max(1).role("slider");
		};
		Schema.date = function date() {
			return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
				const date = new Date(value);
				if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
				return date;
			}, true)]);
		};
		Schema.regExp = function regExp(flag = "") {
			return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
				try {
					return new RegExp(value, flag);
				} catch (e) {
					throw new ValidationError(e.message, options);
				}
			}, true)]);
		};
		Schema.arrayBuffer = function arrayBuffer(encoding) {
			return Schema.union([
				Schema.is(ArrayBuffer),
				Schema.is(SharedArrayBuffer),
				Schema.transform(Schema.any(), (value, options) => {
					if (Binary.isSource(value)) return Binary.fromSource(value);
					throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
				}, true),
				...encoding ? [Schema.transform(Schema.string(), (value, options) => {
					try {
						return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
					} catch (e) {
						throw new ValidationError(e.message, options);
					}
				}, true)] : []
			]);
		};
		Schema.extend("lazy", (data, schema, options, strict) => {
			if (!schema.inner[kSchema]) {
				schema.inner = schema.builder();
				schema.inner.meta = {
					...schema.meta,
					...schema.inner.meta
				};
				validateVolatileSchema(schema.inner, options.path, true);
			}
			return Schema.resolve(data, schema.inner, options, strict);
		});
		Schema.extend("any", (data) => {
			return [data];
		});
		Schema.extend("never", (data, _, options) => {
			throw new ValidationError(`expected nullable but got ${data}`, options);
		});
		Schema.extend("const", (data, { value }, options) => {
			if (deepEqual(data, value)) return [value];
			throw new ValidationError(`expected ${value} but got ${data}`, options);
		});
		function checkWithinRange(data, meta, description, options, skipMin = false) {
			const { max = Infinity, min = -Infinity } = meta;
			if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
			if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
		}
		Schema.extend("string", (data, { meta }, options) => {
			if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
			if (meta.pattern) {
				const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
				if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
			}
			checkWithinRange(data.length, meta, "string length", options);
			return [data];
		});
		function decimalShift(data, digits) {
			const str = data.toString();
			if (str.includes("e")) return data * Math.pow(10, digits);
			const index = str.indexOf(".");
			if (index === -1) return data * Math.pow(10, digits);
			const frac = str.slice(index + 1);
			const integer = str.slice(0, index);
			if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
			return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
		}
		function isMultipleOf(data, min, step) {
			step = Math.abs(step);
			if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
			const index = step.toString().indexOf(".");
			const digits = step.toString().slice(index + 1).length;
			return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
		}
		Schema.extend("number", (data, { meta }, options) => {
			if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
			checkWithinRange(data, meta, "number", options);
			const { step } = meta;
			if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
			return [data];
		});
		Schema.extend("boolean", (data, _, options) => {
			if (typeof data === "boolean") return [data];
			throw new ValidationError(`expected boolean but got ${data}`, options);
		});
		Schema.extend("bitset", (data, { bits, meta }, options) => {
			let value = 0, keys = [];
			if (typeof data === "number") {
				value = data;
				for (const key in bits) if (data & bits[key]) keys.push(key);
			} else if (Array.isArray(data)) {
				keys = data;
				for (const key of keys) {
					if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
					if (key in bits) value |= bits[key];
				}
			} else throw new ValidationError(`expected number or array but got ${data}`, options);
			if (value === meta.default) return [value];
			return [value, keys];
		});
		Schema.extend("function", (data, _, options) => {
			if (typeof data === "function") return [data];
			throw new ValidationError(`expected function but got ${data}`, options);
		});
		Schema.extend("is", (data, { constructor }, options) => {
			if (typeof constructor === "function") {
				if (data instanceof constructor) return [data];
				throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
			} else {
				if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
				let prototype = Object.getPrototypeOf(data);
				while (prototype) {
					if (prototype.constructor?.name === constructor) return [data];
					prototype = Object.getPrototypeOf(prototype);
				}
				throw new ValidationError(`expected ${constructor} but got ${data}`, options);
			}
		});
		function property(data, key, schema, options) {
			try {
				const [value, adapted] = Schema.resolve(data[key], schema, {
					...options,
					path: [...options.path || [], key]
				});
				if (adapted !== void 0) data[key] = adapted;
				return value;
			} catch (e) {
				if (!options?.autofix) throw e;
				delete data[key];
				return schema.meta.volatile ? createVolatile(schema.meta.default) : schema.meta.default;
			}
		}
		Schema.extend("array", (data, { inner, meta }, options) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
			return [data.map((_, index) => property(data, index, inner, options))];
		});
		Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in data) {
				let rKey;
				try {
					rKey = Schema.resolve(key, sKey, options)[0];
				} catch (error) {
					if (strict) continue;
					throw error;
				}
				result[rKey] = property(data, key, inner, options);
				data[rKey] = data[key];
				if (key !== rKey) delete data[key];
			}
			return [result];
		});
		Schema.extend("tuple", (data, { list }, options, strict) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			const result = list.map((inner, index) => property(data, index, inner, options));
			if (strict) return [result];
			result.push(...data.slice(list.length));
			return [result];
		});
		function merge(result, data) {
			for (const key in data) {
				if (key in result) continue;
				result[key] = data[key];
			}
		}
		Schema.extend("object", (data, { dict }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in dict) {
				const value = property(data, key, dict[key], options);
				if (!isNullable(value) || key in data) result[key] = value;
			}
			if (!strict) merge(result, data);
			return [result];
		});
		Schema.extend("union", (data, { list, toString }, options, strict) => {
			const messages = [];
			for (const inner of list) try {
				return Schema.resolve(data, inner, options, strict);
			} catch (error) {
				messages.push(error);
			}
			throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		});
		Schema.extend("intersect", (data, { list, toString }, options, strict) => {
			if (!list.length) return [data];
			let result;
			for (const inner of list) {
				const value = Schema.resolve(data, inner, options, true)[0];
				if (isNullable(value)) continue;
				if (isNullable(result)) result = value;
				else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
				else if (typeof value === "object") merge(result ??= {}, value);
				else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
			}
			if (!strict && isPlainObject(data)) merge(result, data);
			return [result];
		});
		Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
			const [result, adapted = data] = Schema.resolve(data, inner, options, true);
			if (preserve) return [callback(result)];
			else return [callback(result), callback(adapted)];
		});
		const formatters = {};
		function defineMethod(name, keys, format) {
			formatters[name] = format;
			Object.assign(Schema, { [name](...args) {
				const schema = new Schema({ type: name });
				keys.forEach((key, index) => {
					switch (key) {
						case "sKey":
							schema.sKey = args[index] ?? Schema.string();
							break;
						case "inner":
							schema.inner = Schema.from(args[index]);
							break;
						case "list":
							schema.list = args[index].map(Schema.from);
							break;
						case "dict":
							schema.dict = mapValues(args[index], Schema.from);
							break;
						case "bits":
							schema.bits = {};
							for (const key in args[index]) {
								if (typeof args[index][key] !== "number") continue;
								schema.bits[key] = args[index][key];
							}
							break;
						case "callback": {
							const callback = schema.callback = args[index];
							callback["toJSON"] ||= () => callback.toString();
							break;
						}
						case "constructor": {
							const constructor = schema.constructor = args[index];
							if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
							break;
						}
						default: schema[key] = args[index];
					}
				});
				if (name === "object" || name === "dict") schema.meta.default = {};
				else if (name === "array" || name === "tuple") schema.meta.default = [];
				else if (name === "bitset") schema.meta.default = 0;
				return schema;
			} });
		}
		defineMethod("is", ["constructor"], ({ constructor }) => {
			if (typeof constructor === "function") return constructor.name;
			else return constructor;
		});
		defineMethod("any", [], () => "any");
		defineMethod("never", [], () => "never");
		defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
		defineMethod("string", [], () => "string");
		defineMethod("number", [], () => "number");
		defineMethod("boolean", [], () => "boolean");
		defineMethod("bitset", ["bits"], () => "bitset");
		defineMethod("function", [], () => "function");
		defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
		defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
		defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
		defineMethod("object", ["dict"], ({ dict }) => {
			if (Object.keys(dict).length === 0) return "{}";
			return `{ ${Object.entries(dict).map(([key, inner]) => {
				return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
			}).join(", ")} }`;
		});
		defineMethod("union", ["list"], ({ list }, inline) => {
			const result = list.map(({ toString: format }) => format()).join(" | ");
			return inline ? `(${result})` : result;
		});
		defineMethod("intersect", ["list"], ({ list }) => {
			return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
		});
		defineMethod("transform", [
			"inner",
			"callback",
			"preserve"
		], ({ inner }, isInner) => inner.toString(isInner));
		//#endregion
		//#region lib/types/config.js
		/** Window-local timing accepted by the Host and browser keyboard service. */
		/** Validated deployment settings for fixed keyboard sequences. */
		const Config = Schema.object({ stopSequenceMs: Schema.natural().min(1).max(2147483646).default(500) });
		//#endregion
		//#region lib/types/client/index.js
		/** Browser command service, with one keyboard adapter per plugin lifetime. */
		/** Cordis keyboard provider; Desktop startup requires its native keyboard bridge. */
		var ShortcutsService = class extends _deepseek_ai_cordis.Service {
			static inject = ["locale"];
			runtime;
			platform;
			catalog;
			config;
			fixedCatalog;
			stopSequenceMs;
			fixedListeners = /* @__PURE__ */ new Set();
			adapter;
			keyboard;
			active = true;
			connected = false;
			registry;
			constructor(ctx) {
				const environment = detectEnvironment(document, navigator);
				const keyboard = environment.runtime === "desktop" ? window.dshDesktop?.keyboard : void 0;
				if (environment.runtime === "desktop" && keyboard === void 0) throw new Error("Desktop keyboard bridge unavailable");
				super(ctx, "shortcuts");
				this.keyboard = keyboard;
				this.runtime = environment.runtime;
				this.platform = environment.platform;
				const config = Config(globalThis.__DSH_SHORTCUTS_CONFIG__ ?? {});
				this.stopSequenceMs = config.stopSequenceMs;
				this.registry = new ShortcutRegistry(this.runtime, this.platform, initialShortcutConfig());
				this.catalog = this.registry.catalog;
				this.config = this.registry.config;
				this.fixedCatalog = this.registry.fixedCatalog;
				const publish = (snapshot) => {
					if (this.active && this.connected && snapshot.sequence >= this.config.getSnapshot().sequence) this.registry.configure(snapshot);
				};
				const web = this.runtime === "web" ? webShortcutStorage(window, this.platform, publish) : void 0;
				this.adapter = web ?? desktopShortcutStorage(window);
				if (keyboard !== void 0) ctx.effect(() => installNativeKeyboard(window, keyboard, this.registry, () => this.config.getSnapshot(), () => {
					this.fixedInput({ type: "reset" });
				}), "shortcuts: native keyboard");
				ctx.effect(() => {
					const off = this.adapter?.subscribe(publish);
					return () => {
						this.active = false;
						off?.();
						web?.dispose();
					};
				}, "shortcuts: preferences");
				this.syncDefinitions();
				ctx.effect(() => {
					const off = installKeyboard(window, this.registry, (input) => {
						this.fixedInput(input);
					}, keyboard !== void 0 && (this.platform === "macos" || this.platform === "windows"));
					return () => {
						off();
						this.fixedListeners.clear();
					};
				}, "shortcuts: keyboard");
				ctx.effect(() => ctx.locale.subscribe(() => {
					this.registry.refreshLabels();
				}), "shortcuts: locale");
			}
			register(command) {
				const off = this.registry.register(command);
				this.syncDefinitions();
				return () => {
					off();
					this.syncDefinitions();
				};
			}
			registerFixed(command) {
				const off = this.registry.registerFixed(command);
				this.syncDefinitions();
				return () => {
					off();
					this.syncDefinitions();
				};
			}
			observeFixedInput(listener) {
				this.fixedListeners.add(listener);
				return () => {
					this.fixedListeners.delete(listener);
				};
			}
			fixedInput(input) {
				let consumed = false;
				for (const listener of [...this.fixedListeners]) {
					if (!this.fixedListeners.has(listener)) continue;
					try {
						listener(input.type === "reset" ? input : {
							...input,
							gesture: {
								...input.gesture,
								defaultPrevented: input.gesture.defaultPrevented || consumed
							},
							consume: () => {
								consumed = true;
								input.consume();
							}
						});
					} catch (error) {
						console.error("Fixed shortcut handler failed", error);
					}
				}
			}
			describeBinding(binding) {
				const normalized = binding === null ? null : normalizeBinding(binding, this.platform);
				return {
					binding: normalized,
					keys: presentBinding(normalized, this.platform).keys,
					issue: normalized === null ? null : bindingIssue(normalized, this.runtime, this.platform),
					conflicts: normalized === null ? [] : [...this.catalog.getSnapshot().filter((row) => row.binding !== null && overlappingBindings(row.binding, normalized)).map((row) => row.id), ...this.fixedCatalog.getSnapshot().filter((row) => row.bindings.some((binding) => overlappingBindings(binding, normalized))).map((row) => row.id)]
				};
			}
			syncDefinitions() {
				if (!this.active) return;
				if (this.adapter === void 0) {
					this.failRead();
					return;
				}
				this.adapter.get(this.registry.definitions()).then((snapshot) => {
					this.connected = true;
					if (this.active && snapshot.sequence >= this.config.getSnapshot().sequence) this.registry.configure(snapshot);
				}, () => {
					this.failRead();
				});
			}
			failRead() {
				if (this.active) this.registry.configure({
					...this.config.getSnapshot(),
					status: "unreadable",
					error: "read"
				});
			}
			/**
			* Persist one reviewed operation while retaining accepted bindings on failure.
			* @param args - edit and expected revision supplied by the editor.
			* @returns classified save outcome and accepted snapshot.
			*/
			async edit(...args) {
				if (this.adapter === void 0) return {
					status: "unreadable",
					snapshot: this.config.getSnapshot()
				};
				let result;
				try {
					result = await this.adapter.edit(...args);
				} catch (error) {
					if (this.active) console.error("Shortcut preference save failed", error);
					return {
						status: "write-failed",
						snapshot: this.config.getSnapshot()
					};
				}
				if (this.active && result.snapshot.sequence >= this.config.getSnapshot().sequence) this.registry.configure(result.snapshot);
				return result;
			}
			async recording(active) {
				if (this.adapter === void 0) throw new Error("Desktop shortcuts bridge unavailable");
				await this.adapter.recording(active);
			}
			async closeWindow() {
				if (this.keyboard === void 0) throw new Error("Desktop keyboard bridge unavailable");
				await this.keyboard.closeWindow(this.config.getSnapshot().revision);
			}
		};
		//#endregion
		module.exports = ShortcutsService;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map