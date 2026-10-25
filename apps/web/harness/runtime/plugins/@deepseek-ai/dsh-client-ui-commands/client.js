window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-commands",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react_jsx_runtime = require("react/jsx-runtime");
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
		//#region lib/types/client/locales.js
		/**
		* `command` namespace dictionaries: the composer menu's section headings,
		* the client face (title, description, claim token) of the built-in Host
		* commands whose catalog descriptors carry English text only, and the
		* popupSelect shell's copy.
		*/
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"section.add": "添加",
			"section.commands": "指令",
			"label.goal": "目标",
			"label.plan": "计划",
			"label.feedback": "反馈",
			"label.compact": "压缩",
			"label.permission": "权限",
			"label.export": "下载日志",
			"description.goal": "设置或查看长期任务目标",
			"description.plan": "进入或退出计划模式",
			"description.feedback": "发送关于当前会话的反馈",
			"description.compact": "压缩以上对话内容",
			"description.permission": "切换权限预设（沙箱模式与审批策略）",
			"description.export": "将当前会话内容导出为 ZIP",
			"token.goal": "目标",
			"token.plan": "计划",
			"token.feedback": "反馈",
			"token.compact": "压缩",
			"token.permission": "权限",
			"token.export": "导出",
			"search.placeholder": "搜索…",
			"search.aria": "筛选选项",
			"status.loading": "正在加载选项…",
			"status.applying": "正在应用…",
			"status.empty": "无选项",
			"overlay.aria": "/{command} 选项",
			"listbox.aria": "/{command} 匹配项",
			"notice.attachmentsUnsupported": "/{command} 不接受附件，请先移除附件"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"section.add": "Add",
			"section.commands": "Commands",
			"label.goal": "Goal",
			"label.plan": "Plan",
			"label.feedback": "Feedback",
			"label.compact": "Compact",
			"label.permission": "Permission",
			"label.export": "Export",
			"description.goal": "Set or view the goal for a long-running task",
			"description.plan": "Enter or leave plan mode",
			"description.feedback": "Record feedback about this session",
			"description.compact": "Compact older conversation history",
			"description.permission": "Switch the permission preset (sandbox mode + approval policy)",
			"description.export": "Download this Session log as a ZIP archive",
			"token.goal": "goal",
			"token.plan": "plan",
			"token.feedback": "feedback",
			"token.compact": "compact",
			"token.permission": "permission",
			"token.export": "export",
			"search.placeholder": "Search…",
			"search.aria": "Filter options",
			"status.loading": "Loading options…",
			"status.applying": "Applying…",
			"status.empty": "No options",
			"overlay.aria": "/{command} options",
			"listbox.aria": "/{command} matches",
			"notice.attachmentsUnsupported": "/{command} does not accept attachments; remove them first"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"section.add": "追加",
			"section.commands": "コマンド",
			"label.goal": "目標",
			"label.plan": "計画",
			"label.feedback": "フィードバック",
			"label.compact": "圧縮",
			"label.permission": "権限",
			"label.export": "エクスポート",
			"description.goal": "長時間実行するタスクの目標を設定または表示",
			"description.plan": "計画モードに入るまたは終了する",
			"description.feedback": "このセッションに関するフィードバックを記録",
			"description.compact": "古い会話履歴を圧縮",
			"description.permission": "権限プリセットを切り替える (サンドボックスモード + 承認ポリシー)",
			"description.export": "このセッションログを ZIP アーカイブとしてダウンロード",
			"token.goal": "goal",
			"token.plan": "plan",
			"token.feedback": "feedback",
			"token.compact": "compact",
			"token.permission": "permission",
			"token.export": "export",
			"search.placeholder": "検索…",
			"search.aria": "オプションを絞り込む",
			"status.loading": "オプションを読み込み中…",
			"status.applying": "適用中…",
			"status.empty": "オプションなし",
			"overlay.aria": "/{command} のオプション",
			"listbox.aria": "/{command} の一致項目",
			"notice.attachmentsUnsupported": "/{command} は添付ファイルを受け付けません。先に削除してください"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"section.add": "Añadir",
			"section.commands": "Comandos",
			"label.goal": "Objetivo",
			"label.plan": "Planificar",
			"label.feedback": "Comentarios",
			"label.compact": "Compacto",
			"label.permission": "Permiso",
			"label.export": "Exportar",
			"description.goal": "Establecer o ver el objetivo de una tarea de larga duración",
			"description.plan": "Entrar o salir del modo plan",
			"description.feedback": "Registrar comentarios sobre esta sesión",
			"description.compact": "Historial de conversaciones antiguo compacto",
			"description.permission": "Cambiar el ajuste preestablecido de permisos (modo sandbox + política de aprobación)",
			"description.export": "Descargue este registro de sesión como un archivo ZIP",
			"token.goal": "objetivo",
			"token.plan": "planear",
			"token.feedback": "retroalimentación",
			"token.compact": "compacto",
			"token.permission": "permiso",
			"token.export": "exportar",
			"search.placeholder": "Buscar…",
			"search.aria": "Opciones de filtro",
			"status.loading": "Cargando opciones…",
			"status.applying": "Aplicando…",
			"status.empty": "Sin opciones",
			"overlay.aria": "Opciones de /{command}",
			"listbox.aria": "/{command} coincidencias",
			"notice.attachmentsUnsupported": "/{command} no acepta archivos adjuntos; eliminarlos primero"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"section.add": "Ajouter",
			"section.commands": "Commandes",
			"label.goal": "Objectif",
			"label.plan": "Planifier",
			"label.feedback": "Commentaires",
			"label.compact": "Compacte",
			"label.permission": "Autorisation",
			"label.export": "Exporter",
			"description.goal": "Définir ou afficher l'objectif d'une tâche de longue durée",
			"description.plan": "Entrer ou quitter le mode Plan",
			"description.feedback": "Enregistrer les commentaires sur cette session",
			"description.compact": "Compacter l’historique des conversations anciennes",
			"description.permission": "Changer le préréglage d'autorisation (mode sandbox + politique d'approbation)",
			"description.export": "Téléchargez ce journal de session sous forme d'archive ZIP",
			"token.goal": "objectif",
			"token.plan": "planifier",
			"token.feedback": "commentaires",
			"token.compact": "compacte",
			"token.permission": "autorisation",
			"token.export": "exporter",
			"search.placeholder": "Rechercher…",
			"search.aria": "Options de filtrage",
			"status.loading": "Options de chargement…",
			"status.applying": "Application…",
			"status.empty": "Aucune option",
			"overlay.aria": "Options /{command}",
			"listbox.aria": "/{command} correspondances",
			"notice.attachmentsUnsupported": "/{command} n'accepte pas les pièces jointes\xA0; retirez-les d'abord"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"section.add": "Hinzufügen",
			"section.commands": "Befehle",
			"label.goal": "Ziel",
			"label.plan": "Planen",
			"label.feedback": "Rückmeldung",
			"label.compact": "Kompakt",
			"label.permission": "Erlaubnis",
			"label.export": "Exportieren",
			"description.goal": "Legen Sie das Ziel für eine Aufgabe mit langer Laufzeit fest oder zeigen Sie es an",
			"description.plan": "Aktivieren oder verlassen Sie den Planmodus",
			"description.feedback": "Zeichnen Sie Feedback zu dieser Sitzung auf",
			"description.compact": "Kompakter älterer Gesprächsverlauf",
			"description.permission": "Ändern Sie die Berechtigungsvoreinstellung (Sandbox-Modus + Genehmigungsrichtlinie).",
			"description.export": "Laden Sie dieses Sitzungsprotokoll als ZIP-Archiv herunter",
			"token.goal": "Ziel",
			"token.plan": "planen",
			"token.feedback": "Rückmeldung",
			"token.compact": "kompakt",
			"token.permission": "Erlaubnis",
			"token.export": "exportieren",
			"search.placeholder": "Suchen…",
			"search.aria": "Filteroptionen",
			"status.loading": "Ladeoptionen…",
			"status.applying": "Wird angewendet…",
			"status.empty": "Keine Optionen",
			"overlay.aria": "/{command}-Optionen",
			"listbox.aria": "/{command} stimmt überein",
			"notice.attachmentsUnsupported": "/{command} akzeptiert keine Anhänge; Entfernen Sie sie zuerst"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"section.add": "Добавить",
			"section.commands": "Команды",
			"label.goal": "Цель",
			"label.plan": "План",
			"label.feedback": "Обратная связь",
			"label.compact": "Компактный",
			"label.permission": "Разрешение",
			"label.export": "Экспорт",
			"description.goal": "Установите или просмотрите цель для долгосрочной задачи",
			"description.plan": "Войти в режим плана или выйти из него",
			"description.feedback": "Запишите отзыв об этом сеансе",
			"description.compact": "Сжать старую историю разговоров",
			"description.permission": "Переключение настроек разрешений (режим песочницы + политика утверждения)",
			"description.export": "Загрузите этот журнал сеанса в виде ZIP-архива.",
			"token.goal": "цель",
			"token.plan": "план",
			"token.feedback": "обратная связь",
			"token.compact": "компактный",
			"token.permission": "разрешение",
			"token.export": "экспорт",
			"search.placeholder": "Искать…",
			"search.aria": "Параметры фильтра",
			"status.loading": "Загрузка параметров…",
			"status.applying": "Применение…",
			"status.empty": "Нет вариантов",
			"overlay.aria": "Опции /{command}",
			"listbox.aria": "/{command} совпадений",
			"notice.attachmentsUnsupported": "/{command} не принимает вложения; сначала удали их"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"section.add": "Adicionar",
			"section.commands": "Comandos",
			"label.goal": "Objetivo",
			"label.plan": "Plano",
			"label.feedback": "Comentários",
			"label.compact": "Compacto",
			"label.permission": "Permissão",
			"label.export": "Exportar",
			"description.goal": "Defina ou visualize a meta para uma tarefa de longa duração",
			"description.plan": "Entrar ou sair do modo de plano",
			"description.feedback": "Registre feedback sobre esta sessão",
			"description.compact": "Histórico compacto de conversas antigas",
			"description.permission": "Alterar a predefinição de permissão (modo sandbox + política de aprovação)",
			"description.export": "Baixe este log de sessão como um arquivo ZIP",
			"token.goal": "objetivo",
			"token.plan": "planejar",
			"token.feedback": "comentários",
			"token.compact": "compacto",
			"token.permission": "permissão",
			"token.export": "exportar",
			"search.placeholder": "Pesquisar…",
			"search.aria": "Opções de filtro",
			"status.loading": "Carregando opções…",
			"status.applying": "Aplicando…",
			"status.empty": "Sem opções",
			"overlay.aria": "/{command} opções",
			"listbox.aria": "/{command} correspondências",
			"notice.attachmentsUnsupported": "/{command} não aceita anexos; remova-os primeiro"
		};
		//#endregion
		//#region lib/types/client/resolution.js
		const BUILTINS = {
			goal: "@deepseek-ai/dsh-command-goal",
			plan: "@deepseek-ai/dsh-plan-mode",
			feedback: "@deepseek-ai/dsh-command-feedback",
			compact: "@deepseek-ai/dsh-command-compact",
			permission: "@deepseek-ai/dsh-permission-presets",
			export: "@deepseek-ai/dsh-session-log-export"
		};
		/**
		* Identify a first-party definition without interpreting its display copy.
		* @param descriptor - effective Host descriptor after scoped shadowing.
		* @returns its first-party name, or undefined for another definition.
		*/
		function builtinCommandName(descriptor) {
			return Object.keys(BUILTINS).find((name) => descriptor.definitionId === BUILTINS[name]);
		}
		/**
		* Select the input spelling for a menu-picked command.
		* @param descriptor - effective Host descriptor.
		* @param t - command-namespace translator.
		* @returns localized spelling for a known definition, otherwise its registered name.
		*/
		function claimToken(descriptor, t) {
			const name = builtinCommandName(descriptor);
			return name === void 0 ? descriptor.name : t(`token.${name}`);
		}
		const TOKEN_ALIASES = new Map(Object.keys(BUILTINS).flatMap((name) => [zh[`token.${name}`], en[`token.${name}`]].map((token) => [token, name])));
		/**
		* Resolve typed spelling against the current Session's effective definitions.
		* @param token - typed name without its leading slash.
		* @param descriptors - effective descriptors in the Session's ready catalog.
		* @returns the matching descriptor; aliases never select an unrelated scoped override.
		*/
		function resolveCommand(token, descriptors) {
			const exact = descriptors.find((descriptor) => descriptor.name === token);
			if (exact !== void 0) return exact;
			const name = TOKEN_ALIASES.get(token);
			if (name === void 0) return void 0;
			return descriptors.find((descriptor) => descriptor.definitionId === BUILTINS[name]);
		}
		//#endregion
		//#region lib/types/client/directory.js
		/** One session key's cache cell. */
		var Entry = class {
			state = "cold";
			commands = [];
			/** Bumped at each pull start; only the latest pull may publish its outcome. */
			epoch = 0;
			lastError;
			waiters = [];
		};
		/** The session-keyed directory cache. Plain class — the owning service wires events and RPC. */
		var CommandDirectory = class {
			fetchCommands;
			entries = /* @__PURE__ */ new Map();
			constructor(fetchCommands) {
				this.fetchCommands = fetchCommands;
			}
			/**
			* Current cache status for one session.
			* @param sessionId - session key.
			* @returns the entry status (cold when never touched).
			*/
			status(sessionId) {
				return this.entries.get(sessionId)?.state ?? "cold";
			}
			/**
			* Synchronous command lookup over one Session's ready catalog; exact names precede localized aliases.
			* @param sessionId - session key.
			* @param name - typed command spelling without the leading slash.
			* @returns the descriptor, or undefined when absent or the entry is not ready.
			*/
			resolve(sessionId, name) {
				const entry = this.entries.get(sessionId);
				if (entry === void 0 || entry.state !== "ready") return void 0;
				return resolveCommand(name, entry.commands);
			}
			/** Soft invalidation (commands-changed): background repull on every touched key; ready snapshots keep serving. */
			invalidateAll() {
				for (const key of this.entries.keys()) this.refresh(key);
			}
			/**
			* Drop one Session's obsolete composition-specific snapshot and prewarm its replacement.
			* @param sessionId - Session whose effective command composition changed.
			*/
			resetSession(sessionId) {
				const entry = this.entry(sessionId);
				entry.state = "cold";
				entry.commands = [];
				entry.lastError = void 0;
				this.refresh(sessionId);
			}
			/**
			* Hard reset on reconnect: every entry drops its snapshot (the agent world
			* may have changed shape across the generation) and prewarms.
			*/
			resetConnected() {
				for (const [key, entry] of this.entries) {
					entry.state = "cold";
					entry.commands = [];
					this.refresh(key);
				}
			}
			/**
			* Fire-and-forget prewarm of one session (the command source's scope-birth
			* warm hook lands here).
			* @param sessionId - session key.
			*/
			warm(sessionId) {
				const entry = this.entry(sessionId);
				if (entry.state === "cold" || entry.state === "failed") this.refresh(sessionId);
			}
			/**
			* Start one pull for one session. Publishes ready/failed only while it is
			* still the key's latest pull (epoch guard); a ready snapshot is not
			* demoted while the pull flies.
			* @param sessionId - session key.
			* @returns settled when this pull's outcome is published or discarded.
			*/
			async refresh(sessionId) {
				const entry = this.entry(sessionId);
				const epoch = ++entry.epoch;
				if (entry.state !== "ready") entry.state = "pending";
				try {
					const commands = await this.fetchCommands(sessionId);
					if (epoch !== entry.epoch) return;
					entry.commands = commands;
					entry.state = "ready";
					entry.lastError = void 0;
				} catch (error) {
					if (epoch !== entry.epoch) return;
					entry.commands = [];
					entry.state = "failed";
					entry.lastError = error;
				} finally {
					if (epoch === entry.epoch) notifyWaiters(entry);
				}
			}
			/**
			* Strong-wait until one session's catalog is servable (the enter-
			* adjudication "directory must be reached" rule): ready returns at once;
			* cold/failed launch a fresh pull; pending joins the flying one. Rejects
			* when the awaited pull fails or the signal aborts.
			* @param sessionId - session key.
			* @param signal - attempt-scoped abort (the SubmitAttempt signal).
			* @returns the hot command snapshot.
			*/
			async ensureReady(sessionId, signal) {
				const entry = this.entry(sessionId);
				while (true) {
					if (entry.state === "ready") return entry.commands;
					if (entry.state !== "pending") this.refresh(sessionId);
					await settled(entry, signal);
					if (entry.state === "failed") throw new Error(`command directory warmup failed: ${entry.lastError instanceof Error ? entry.lastError.message : String(entry.lastError)}`);
				}
			}
			entry(sessionId) {
				let entry = this.entries.get(sessionId);
				if (entry === void 0) {
					entry = new Entry();
					this.entries.set(sessionId, entry);
				}
				return entry;
			}
		};
		/** One settlement tick for one entry: resolves at the next winning publish, rejects on abort. */
		function settled(entry, signal) {
			if (signal.aborted) return Promise.reject(abortReason(signal));
			return new Promise((resolve, reject) => {
				const waiter = () => {
					signal.removeEventListener("abort", onAbort);
					resolve();
				};
				const onAbort = () => {
					entry.waiters = entry.waiters.filter((w) => w !== waiter);
					reject(abortReason(signal));
				};
				signal.addEventListener("abort", onAbort, { once: true });
				entry.waiters.push(waiter);
			});
		}
		function notifyWaiters(entry) {
			const woken = entry.waiters;
			entry.waiters = [];
			for (const wake of woken) wake();
		}
		/** Normalize an abort into an Error rejection. */
		function abortReason(signal) {
			return signal.reason instanceof Error ? signal.reason : /* @__PURE__ */ new Error("command directory wait aborted");
		}
		//#endregion
		//#region lib/types/client/option-groups.js
		/**
		* Group rows by their caller-owned group name, without sorting groups or rows.
		* Ungrouped rows occupy one block at their first occurrence.
		* @param options - Options in display order.
		* @returns groups in first-occurrence order, with original option objects.
		*/
		function groupOptions(options) {
			const groups = /* @__PURE__ */ new Map();
			for (const option of options) {
				const name = option.group?.name;
				const existing = groups.get(name);
				if (existing !== void 0) existing.rows.push(option);
				else groups.set(name, {
					group: option.group,
					rows: [option]
				});
			}
			return [...groups.values()];
		}
		//#endregion
		//#region lib/types/client/popup.js
		/**
		* Headless popupSelect shell state: one controller per client
		* session, owned by CommandUiRuntime's per-session map and torn down by the
		* session scope disposer. The shell is a transient layer (never in the input
		* state machine): it loads options once, filters them locally against the
		* shell's own search text, and settles a selection through the context
		* captured at open time. Draft consumption and composer focus are injected
		* callbacks — the session wiring dispatches the consume-token event (the
		* Input side owns the span/bare-token CAS guard) and focuses the composer;
		* the controller never touches the input machine.
		*/
		const CLOSED = {
			open: false,
			command: null,
			status: "pending",
			options: [],
			search: "",
			searchLabels: null,
			searchMode: "substring",
			active: 0,
			submitting: false,
			confirming: null,
			acknowledged: false,
			error: null
		};
		/**
		* Filter rows using substring matching, or rank labels fuzzily within each group.
		* Blank search keeps every row; fuzzy matching preserves group order.
		* @param options - the loaded rows.
		* @param search - the shell's search text.
		* @param mode - the command's policy; defaults to substring over label and detail.
		* @returns the original option objects in the order shown and used for selection.
		*/
		function filterOptions(options, search, mode = "substring") {
			const query = search.trim().toLowerCase();
			const groups = groupOptions(options);
			const ordered = groups.some((group) => group.group !== void 0) ? groups.flatMap((group) => group.rows) : options;
			if (query === "") return ordered;
			if (mode === "fuzzy-label") return groups.flatMap((group) => (0, _deepseek_ai_dsh_client_ui_primitives.rankByName)(group.rows.map((option) => ({
				name: option.label,
				option
			})), query).map((row) => row.option));
			return ordered.filter((o) => o.label.toLowerCase().includes(query) || (o.detail?.toLowerCase().includes(query) ?? false));
		}
		/**
		* Highlight index for a freshly loaded row list: the row marked as the current
		* value when the live search still shows it, else the top row. Opening parks
		* the highlight on the value the session already uses, so an accept gesture
		* made without looking confirms that value instead of the topmost row.
		* @param options - the loaded rows.
		* @param search - the shell's live filter text (non-empty after a retry).
		* @param mode - the command's search policy.
		* @returns index into the filtered rows.
		*/
		function currentIndex(options, search, mode) {
			const at = filterOptions(options, search, mode).findIndex((option) => option.active === true);
			return at === -1 ? 0 : at;
		}
		/** The shell's error-strip line for a settlement failure. */
		function errorText(error) {
			return error instanceof Error ? error.message : String(error);
		}
		/**
		* Headless controller of one session's popupSelect shell. Late settlements
		* lose their write rights through binding identity: dismiss/dispose/reopen
		* swap the binding, so a settling options fetch or onSelect that no longer
		* matches writes nothing and consumes nothing.
		*/
		var PopupSelectController = class {
			deps;
			/** Shell state store (the overlay component subscribes here). */
			state = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(CLOSED);
			binding = null;
			/**
			* @param deps - session-wiring callbacks (token consumption + composer focus).
			*/
			constructor(deps) {
				this.deps = deps;
			}
			/**
			* Open the shell for one command: publish pending state and fetch options
			* once through the business spec. A reopen supersedes the previous shell
			* (its options fetch is aborted, its late settlements are dropped).
			* @param command - command name the shell serves.
			* @param spec - the registered popupSelect spec.
			* @param context - open-time context snapshot, handed verbatim to options/onSelect.
			* @param segment - open-time token segment snapshot for post-select consumption.
			*/
			open(command, spec, context, segment) {
				const searchLabels = spec.searchLabels?.() ?? null;
				this.binding?.abort.abort();
				const binding = {
					command,
					spec,
					context,
					segment,
					abort: new AbortController()
				};
				this.binding = binding;
				this.state.set({
					...CLOSED,
					open: true,
					command,
					searchLabels,
					searchMode: spec.searchMode ?? "substring"
				});
				this.load(binding);
			}
			/** Run the one options fetch of a binding; settlement rights die with the binding. */
			load(binding) {
				binding.spec.options(binding.context, binding.abort.signal).then((options) => {
					if (this.binding !== binding) return;
					const current = this.state.getSnapshot();
					this.state.set({
						...current,
						status: "ready",
						options,
						active: currentIndex(options, current.search, current.searchMode),
						error: null
					});
				}, (error) => {
					if (this.binding !== binding) return;
					console.error(`[ui-commands] popupSelect options failed for /${binding.command}:`, error);
					this.state.set({
						...this.state.getSnapshot(),
						status: "failed",
						options: [],
						active: 0,
						error: errorText(error)
					});
				});
			}
			/** Re-run a failed options fetch (search survives; no-op unless status is 'failed'). */
			retry() {
				const binding = this.binding;
				const s = this.state.getSnapshot();
				if (binding === null || !s.open || s.status !== "failed") return;
				this.state.set({
					...s,
					status: "pending",
					error: null
				});
				this.load(binding);
			}
			/**
			* Replace the local search text (pure local filter — the provider is never
			* re-queried) and rebase the highlight to the top of the new filtered list:
			* typing searches for something other than the current value.
			* @param search - the shell search input's text.
			*/
			setSearch(search) {
				const s = this.state.getSnapshot();
				if (!s.open || s.submitting || s.confirming !== null || search === s.search) return;
				this.state.set({
					...s,
					search,
					active: 0
				});
			}
			/**
			* Move the highlight across the filtered rows (wraps around; no-op unless
			* options are ready and no selection is in flight).
			* @param dir - +1 down, -1 up.
			*/
			move(dir) {
				const s = this.state.getSnapshot();
				if (!s.open || s.status !== "ready" || s.submitting || s.confirming !== null) return;
				const rows = filterOptions(s.options, s.search, s.searchMode);
				if (rows.length === 0) return;
				const active = (s.active + dir + rows.length) % rows.length;
				this.state.set({
					...s,
					active
				});
			}
			/**
			* Set the highlight directly (pointer hover; no-op unless ready, idle, and
			* in filtered range).
			* @param index - filtered-row index.
			*/
			highlight(index) {
				const s = this.state.getSnapshot();
				if (!s.open || s.status !== "ready" || s.submitting || s.confirming !== null) return;
				if (index < 0 || index >= filterOptions(s.options, s.search, s.searchMode).length || index === s.active) return;
				this.state.set({
					...s,
					active: index
				});
			}
			/**
			* Select one filtered row: single-flight — the first call enters
			* `submitting` and later calls no-op until it settles. Success consumes the
			* open-time token segment (a false CAS answer is benign), closes, and
			* returns focus to the composer. Failure keeps the shell open with search,
			* highlight, and token intact, surfaces the error, and re-arms select as
			* the retry.
			* @param index - filtered-row index (callers pass the highlight or the clicked row).
			* @returns settled when the attempt has closed the shell or surfaced its failure.
			*/
			async select(index) {
				const binding = this.binding;
				const s = this.state.getSnapshot();
				if (binding === null || !s.open || s.status !== "ready" || s.submitting || s.confirming !== null) return;
				const option = filterOptions(s.options, s.search, s.searchMode)[index];
				if (option === void 0) return;
				if (option.confirmation !== void 0) {
					this.state.set({
						...s,
						confirming: option,
						acknowledged: false,
						error: null
					});
					return;
				}
				await this.settle(binding, option);
			}
			/**
			* Update the explicit checkbox for the currently pending risk gate.
			* @param acknowledged - whether the user has acknowledged the displayed risk.
			*/
			acknowledge(acknowledged) {
				const s = this.state.getSnapshot();
				if (!s.open || s.submitting || s.confirming === null || s.acknowledged === acknowledged) return;
				this.state.set({
					...s,
					acknowledged
				});
			}
			/** Cancel only the risk gate and return to the still-open option picker. */
			cancelConfirmation() {
				const s = this.state.getSnapshot();
				if (!s.open || s.submitting || s.confirming === null) return;
				this.state.set({
					...s,
					confirming: null,
					acknowledged: false
				});
			}
			/** Settle the gated option only after the checkbox is acknowledged. */
			async confirm() {
				const binding = this.binding;
				const s = this.state.getSnapshot();
				if (binding === null || !s.open || s.submitting || s.confirming === null || !s.acknowledged) return;
				await this.settle(binding, s.confirming);
			}
			/** Run the business settlement for an already admitted option. */
			async settle(binding, option) {
				const s = this.state.getSnapshot();
				if (this.binding !== binding || !s.open || s.submitting) return;
				this.state.set({
					...s,
					submitting: true,
					confirming: null,
					acknowledged: false,
					error: null
				});
				try {
					await binding.spec.onSelect(option, binding.context);
				} catch (error) {
					console.error(`[ui-commands] popupSelect onSelect failed for /${binding.command}:`, error);
					if (this.binding !== binding) return;
					this.state.set({
						...this.state.getSnapshot(),
						submitting: false,
						error: errorText(error)
					});
					return;
				}
				if (this.binding !== binding) return;
				this.deps.consume(binding.segment);
				this.binding = null;
				this.state.set(CLOSED);
				this.deps.focusComposer();
			}
			/**
			* Close the shell; aborts a flying options fetch and revokes settlement
			* rights. An outside pointer interaction dismisses plainly (the click's own
			* target takes focus); Escape passes focusComposer to return focus explicitly.
			* @param opts - focusComposer: also restore composer focus (Escape path).
			*/
			dismiss(opts) {
				if (this.binding === null) return;
				this.binding.abort.abort();
				this.binding = null;
				this.state.set(CLOSED);
				if (opts?.focusComposer === true) this.deps.focusComposer();
			}
			/** Scope-teardown disposer: abort in-flight work and clear state (no focus side effect). */
			dispose() {
				this.binding?.abort.abort();
				this.binding = null;
				this.state.set(CLOSED);
			}
		};
		//#endregion
		//#region lib/types/client/presentation.js
		/** Row names per section, highest usage first; rows outside both lists close the Commands section in catalog order. */
		const SECTION_ROWS = {
			add: [
				"file",
				"goal",
				"plan",
				"feedback"
			],
			commands: [
				"compact",
				"permission",
				"model",
				"export"
			]
		};
		/** One built-in Host command's face, keyed by its dictionary entries. */
		function hostFace(name, icon) {
			return [name, {
				label: `label.${name}`,
				description: `description.${name}`,
				icon
			}];
		}
		/** Built-in Host commands whose client face this package owns. */
		const HOST_FACES = new Map([
			hostFace("goal", _deepseek_ai_dsh_client_ui_primitives.IconGoalOutlineRegular),
			hostFace("plan", _deepseek_ai_dsh_client_ui_primitives.IconPlanOutlineRegular),
			hostFace("feedback", _deepseek_ai_dsh_client_ui_primitives.IconPaperPlaneOutlineRegular),
			hostFace("compact", _deepseek_ai_dsh_client_ui_primitives.IconCompactOutlineRegular),
			hostFace("permission", _deepseek_ai_dsh_client_ui_primitives.PermissionIconFullAccessRegular),
			hostFace("export", _deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular)
		]);
		/**
		* The localized menu face of a catalog row.
		* @param descriptor - effective Host command descriptor.
		* @param t - the `command` namespace translator.
		* @returns title, description, and glyph for a built-in command; undefined
		* for any other row, which keeps its catalog description.
		*/
		function builtinRowFace(descriptor, t) {
			const name = builtinCommandName(descriptor);
			const face = name === void 0 ? void 0 : HOST_FACES.get(name);
			return face === void 0 ? void 0 : {
				label: t(face.label),
				description: t(face.description),
				icon: face.icon
			};
		}
		/**
		* Arrange the empty-query menu: the Add section, then the Commands section,
		* each in usage order, with unlisted rows closing Commands in their input
		* order; each row carries its section heading.
		* @param rows - the visible candidates in catalog-then-contribution order.
		* @param t - the `command` namespace translator.
		* @returns the sectioned rows.
		*/
		function sectionRows(rows, t) {
			const listed = new Set([...SECTION_ROWS.add, ...SECTION_ROWS.commands]);
			const byName = new Map(rows.map((row) => [row.name, row]));
			const pick = (names) => names.flatMap((name) => {
				const row = byName.get(name);
				return row === void 0 ? [] : [row];
			});
			const add = pick(SECTION_ROWS.add).map((row) => ({
				...row,
				section: t("section.add")
			}));
			const commands = [...pick(SECTION_ROWS.commands), ...rows.filter((row) => !listed.has(row.name))].map((row) => ({
				...row,
				section: t("section.commands")
			}));
			return [...add, ...commands];
		}
		//#endregion
		//#region lib/types/client/service.js
		/**
		* CommandUiRuntime (`ctx.commandUi`): the '/' command source over the
		* session-keyed directory, the client-contribution registry, and the
		* per-session popupSelect controllers. Candidate synthesis merges the host
		* catalog with contributions by availability, gives built-in Host rows their
		* localized face (presentation.ts), then position-filters; an empty query
		* lists the Add and Commands sections in usage order, a typed query ranks
		* every row by the `/` menu's shared name-and-label ranking (ui-primitives
		* `rankByName`). A host/contribution name collision fails loud. Every
		* execute addresses the session's agent by sessionId — sessions are always
		* agent-backed.
		* Catalog RPCs retain an existing Client Session through completion and
		* wait for its initial history open to succeed before contacting the Host.
		*/
		/** Recover the command name from a line the Host confirmed as executed. */
		function submittedCommandName(line) {
			const trimmed = line.trim();
			const separator = trimmed.search(/\s/u);
			return (separator === -1 ? trimmed : trimmed.slice(0, separator)).slice(1);
		}
		/** Command surface: session-keyed directory + '/' source + contribution registry + per-session popups. */
		var CommandUiRuntime = class extends _deepseek_ai_cordis.Service {
			static inject = [
				"inputTriggers",
				"sessions",
				"remote",
				"remote.commands"
			];
			directory;
			live = {
				contributions: /* @__PURE__ */ new Map(),
				decorations: /* @__PURE__ */ new Map(),
				popups: new WeakMapWithValues()
			};
			/** `command`-namespace translator (composer refusal notices). */
			t;
			/**
			* @param ctx - owning root context (plugin fiber; the service registers
			* itself as `command` and follows that fiber's lifetime).
			*/
			constructor(ctx) {
				super(ctx, "commandUi");
				const locale = ctx.get("locale");
				if (locale === void 0) throw new Error("ui-commands: locale service unavailable");
				this.t = locale.bind("command");
				this.directory = new CommandDirectory(async (sessionId) => {
					const sessions = this.sessions();
					if (sessions.subagentAddress(sessionId) !== void 0) return [];
					if (sessions.binding(sessionId) === void 0) throw new Error(`command catalog requires a retained session "${sessionId}"`);
					return sessions.using(sessionId, { source: "commandCatalog" }, async (reference) => {
						const state = reference.binding.session.getSnapshot();
						if (state.openState !== "open") throw state.openError ?? /* @__PURE__ */ new Error(`session "${sessionId}" is not open`);
						const result = await ctx.remote.commands.list(sessionId);
						if (!result.ok) throw new Error(`command.list failed: ${result.error.code}: ${result.error.message}`);
						return result.value;
					});
				});
				const inputTriggers = ctx.get("inputTriggers");
				if (inputTriggers === void 0) throw new Error("ui-commands: slash service unavailable");
				ctx.effect(() => inputTriggers.registerSource({
					trigger: "/",
					name: "command",
					candidates: (session, req) => this.candidates(session, req),
					onPick: (pick) => this.dispatch(pick),
					matchSpace: (session, token) => this.matchSpace(session, token),
					matchClaim: (session, token, signal) => this.matchClaim(session, token, signal),
					matchEnter: (session, line, signal, envelope) => this.matchEnter(session, line, signal, envelope),
					warm: (session) => {
						this.directory.warm(session.sessionId);
					}
				}), "command: slash source");
				ctx.remote.$on("commands/change", () => {
					this.directory.invalidateAll();
				});
				ctx.remote.$on("agent-preset/selected", (sessionId) => {
					this.directory.resetSession(sessionId);
				});
				ctx.on("connection/reset", () => {
					this.directory.resetConnected();
				});
			}
			/**
			* Register one client command contribution; effect disposer (rides the
			* caller's fiber). Duplicate names throw.
			* @param contribution - the contribution (descriptor + availability + popup spec).
			* @returns the disposer removing the registration.
			*/
			register(contribution) {
				const dispose = this.ctx.effect(() => {
					const { contributions } = this.live;
					if (contributions.has(contribution.name)) throw new Error(`ui-commands: duplicate contribution for /${contribution.name}`);
					contributions.set(contribution.name, contribution);
					return () => {
						contributions.delete(contribution.name);
					};
				}, "command.register()");
				return () => {
					dispose();
				};
			}
			/**
			* Hang a bare-invocation decoration on one host command; effect disposer
			* (rides the caller's fiber). Duplicate names throw.
			* @param decoration - host command name + availability + popup spec.
			* @returns the disposer removing the registration.
			*/
			decorate(decoration) {
				const dispose = this.ctx.effect(() => {
					const { decorations } = this.live;
					if (decorations.has(decoration.name)) throw new Error(`ui-commands: duplicate decoration for /${decoration.name}`);
					decorations.set(decoration.name, decoration);
					return () => {
						decorations.delete(decoration.name);
					};
				}, "command.decorate()");
				return () => {
					dispose();
				};
			}
			/**
			* Close every open popup for a command whose options have become stale.
			* Pending loads and confirmations lose their binding; drafts stay intact.
			* @param name - command name without the leading slash.
			*/
			dismiss(name) {
				for (const popup of this.live.popups.values) if (popup.state.getSnapshot().command === name) popup.dismiss({ focusComposer: true });
			}
			/**
			* Resolve the per-session popup controller (lazy; dies with the session
			* scope). The controller's consume callback dispatches the scoped
			* consume-token event back to this session; focusComposer reaches the
			* session's composer through the conversation input face.
			* @param actx - session-scope ctx.
			* @returns the resident controller.
			* @throws when the Context no longer belongs to a retained Session generation.
			*/
			popupFor(actx) {
				const sessions = this.sessions();
				const session = sessions.sessionOf(actx);
				const binding = session === void 0 ? void 0 : sessions.binding(session.sessionId);
				if (binding === void 0 || binding.session !== session) throw new Error("command.popupFor requires a retained Session scope");
				const { popups } = this.live;
				const existing = popups.get(binding);
				if (existing !== void 0) return existing;
				const controller = new PopupSelectController({
					consume: (segment) => binding.ctx.bail(binding.ctx, "slash/input-consume-token", { guard: segment.via === "menu" ? {
						kind: "span",
						span: segment.span
					} : {
						kind: "bare-token",
						token: segment.token
					} }) === true,
					focusComposer: () => {
						binding.ctx.get("conversation")?.input.for(binding.ctx).focus();
					}
				});
				popups.set(binding, controller);
				binding.ctx.effect(() => () => {
					controller.dispose();
					popups.delete(binding);
				}, "command: session popup");
				return controller;
			}
			/**
			* Menu candidates: host catalog + contribution availability, built-in rows
			* localized, then position filtering; sections for an empty query, the
			* shared name-and-label ranking for a typed one.
			*/
			async candidates(session, req) {
				const list = await this.directory.ensureReady(session.sessionId, req.signal);
				const rows = [];
				const seen = /* @__PURE__ */ new Set();
				for (const c of list) {
					seen.add(c.name);
					rows.push({
						name: c.name,
						...builtinRowFace(c, this.t) ?? { description: c.description },
						...c.input !== void 0 ? { hint: c.input.hint } : {}
					});
				}
				for (const contribution of this.live.contributions.values()) {
					if (!contribution.available(session)) continue;
					if (seen.has(contribution.name)) throw new Error(`ui-commands: contribution /${contribution.name} collides with a host command`);
					rows.push({
						name: contribution.name,
						...contribution.label === void 0 ? {} : { label: contribution.label() },
						...contribution.description === void 0 ? {} : { description: contribution.description() },
						...contribution.icon === void 0 ? {} : { icon: contribution.icon }
					});
				}
				const visible = rows.filter((c) => req.position === "leading" || c.hint === void 0);
				return req.query === "" ? sectionRows(visible, this.t) : (0, _deepseek_ai_dsh_client_ui_primitives.rankByName)(visible, req.query);
			}
			/** Decision table, menu column: contribution/decorated-host → popup or action; host input → claim; host bare → detached execute. */
			dispatch(pick) {
				const name = pick.candidate.name;
				const contribution = this.live.contributions.get(name);
				if (contribution !== void 0 && contribution.available(pick.session)) {
					this.invoke(name, contribution.ui, pick.session, {
						via: "menu",
						span: pick.span
					});
					return "handled";
				}
				const desc = this.directory.resolve(pick.session.sessionId, name);
				if (desc === void 0) return void 0;
				const decoration = this.live.decorations.get(name);
				if (decoration !== void 0 && decoration.available(pick.session)) {
					this.invoke(name, decoration.ui, pick.session, {
						via: "menu",
						span: pick.span
					});
					return "handled";
				}
				if (desc.input !== void 0) return { claim: this.leadingClaim(desc, pick.session, claimToken(desc, this.t)) };
				this.consumeVia(pick.session.sessionId, {
					via: "menu",
					span: pick.span
				});
				this.runDetached(desc, pick.session, `/${name}`);
				return "handled";
			}
			/** Decision table, space column: hot-key sync check; only host leadingInput claims. */
			matchSpace(session, token) {
				const claim = this.claimOf(session, token);
				return claim === void 0 ? void 0 : { claim };
			}
			/**
			* Restore column: the space column's answer once the session's catalog is
			* ready (a warmup failure rejects). It only resolves; nothing is invoked or
			* executed.
			*/
			async matchClaim(session, token, signal) {
				await this.directory.ensureReady(session.sessionId, signal);
				return this.claimOf(session, token);
			}
			/** The host leadingInput claim a token names in the hot catalog; popup and action kinds never claim. */
			claimOf(session, token) {
				if (!token.startsWith("/")) return void 0;
				if (this.live.contributions.has(token.slice(1))) return void 0;
				const desc = this.directory.resolve(session.sessionId, token.slice(1));
				if (desc === void 0 || desc.input === void 0) return void 0;
				return this.leadingClaim(desc, session, token.slice(1));
			}
			/**
			* Decision table, enter column. Strong-waits the session's catalog (a
			* warmup failure rejects — never a silent downgrade). Contributions and
			* bare host commands act on the bare token only; leadingInput claims
			* args-tolerant.
			*
			* Envelope policy: an enter submission carrying attachments resolves only
			* through a command declaring attachment acceptance. Every other submitting
			* route — popup, non-accepting claim, bare detached execute — throws the
			* refusal so the machine surfaces one composer notice and the draft and
			* attachments stay in place; nothing executes and nothing is dropped. An
			* action submits nothing and runs regardless.
			*
			* A typed token is resolved through the localized claim tokens, so a line
			* written as `/计划` reaches the `plan` descriptor and executes as `/plan`.
			*/
			async matchEnter(session, line, signal, envelope) {
				const trimmed = line.trim();
				if (!trimmed.startsWith("/")) return void 0;
				const ws = trimmed.search(/\s/);
				const token = ws === -1 ? trimmed : trimmed.slice(0, ws);
				const bare = ws === -1;
				const typedName = token.slice(1);
				if (typedName === "") return void 0;
				const refuseAttachments = () => {
					throw new Error(this.t("notice.attachmentsUnsupported", { command: typedName }));
				};
				const contribution = this.live.contributions.get(typedName);
				if (contribution !== void 0 && contribution.available(session)) {
					if (!bare) return void 0;
					if (envelope.attachments > 0 && contribution.ui.kind !== "action") refuseAttachments();
					this.invoke(typedName, contribution.ui, session, {
						via: "enter",
						token
					});
					return "handled";
				}
				await this.directory.ensureReady(session.sessionId, signal);
				const desc = this.directory.resolve(session.sessionId, typedName);
				if (desc === void 0) return void 0;
				const name = desc.name;
				const canonical = `/${name}${trimmed.slice(token.length)}`;
				if (bare) {
					const decoration = this.live.decorations.get(name);
					if (decoration !== void 0 && decoration.available(session)) {
						if (envelope.attachments > 0 && decoration.ui.kind !== "action") refuseAttachments();
						this.invoke(name, decoration.ui, session, {
							via: "enter",
							token
						});
						return "handled";
					}
				}
				if (desc.input !== void 0) {
					if (envelope.attachments > 0 && desc.input.attachments !== true) refuseAttachments();
					return { claim: this.leadingClaim(desc, session, token.slice(1)) };
				}
				if (!bare) return void 0;
				if (envelope.attachments > 0) refuseAttachments();
				this.consumeVia(session.sessionId, {
					via: "enter",
					token
				});
				this.runDetached(desc, session, canonical);
				return "handled";
			}
			/**
			* Invoke one contribution or decoration (menu pick / bare enter): open the
			* session's popup, or consume the token and run the action.
			*/
			invoke(name, ui, session, segment) {
				if (ui.kind === "action") {
					this.consumeVia(session.sessionId, segment);
					ui.run(session);
					return;
				}
				const actx = this.scopeFor(session.sessionId);
				if (actx === void 0) return;
				this.popupFor(actx).open(name, ui, session, segment);
			}
			/**
			* Build the leadingInput claim. The composer keeps the claimed token in
			* the draft and reads the arguments after it, so the token is the spelling
			* the draft will carry: the locale's token for a menu pick, the typed
			* spelling for Space and Enter. The command.execute submit transaction
			* always sends the catalog name.
			*/
			leadingClaim(desc, session, shown) {
				const token = `/${shown} `;
				const line = `/${desc.name} `;
				return {
					name: desc.name,
					token,
					...desc.input !== void 0 ? { hint: desc.input.hint } : {},
					...desc.input?.attachments === true ? { attachments: true } : {},
					submit: (args, _actx, attachments) => this.execute(session, line + args, attachments)
				};
			}
			/**
			* The command.execute transaction, addressed to the session's agent — pure
			* admission semantics. An unmatched line reports an error outcome (the
			* composer's immediate admission feedback); an admitted command reports
			* plain success regardless of its handler outcome, because the host
			* executor durably logged the lifecycle (`command/run`/`command/done`) and
			* the outcome renders as a persistent flow node — the composer never
			* echoes it. A handler error result reports an error outcome so the
			* composer keeps the draft and attachments for correction.
			* A refused call throws.
			*/
			async execute(session, line, attachments = []) {
				const result = await this.ctx.remote.commands.execute(session.sessionId, line, attachments);
				if (!result.ok) throw new Error(`command.execute failed: ${result.error.code}: ${result.error.message}`);
				if (result.value === void 0) return {
					kind: "error",
					text: `unknown or malformed command: ${line}`
				};
				this.notifyExecuted(session.sessionId, submittedCommandName(line), result.value.result);
				if (attachments.length > 0 && result.value.result.kind === "error") return {
					kind: "error",
					text: result.value.result.text
				};
				return { kind: "success" };
			}
			/** Publish the local acknowledgment without letting an observer change command admission. */
			notifyExecuted(sessionId, name, result) {
				const args = [
					"command/executed",
					sessionId,
					name,
					result
				];
				for (const listener of this.ctx.events.dispatch("emit", args)) try {
					const returned = listener(sessionId, name, result);
					if (returned != null && typeof returned.then === "function") Promise.resolve(returned).then(void 0, (error) => {
						this.warnExecutedListenerFailure(name, error);
					});
				} catch (error) {
					this.warnExecutedListenerFailure(name, error);
				}
			}
			/** Log one contained `command/executed` observer failure. */
			warnExecutedListenerFailure(name, error) {
				this.ctx.logger.warn("client command: a command/executed listener for \"%s\" failed", name);
				this.ctx.logger.warn(error);
			}
			/**
			* Fire-and-forget execute for the internal ('handled') paths. Outcomes are
			* NOT surfaced here: the host executor durably logs the command lifecycle
			* (`command/run`/`command/done`), and the mux-broadcast events render as a
			* persistent flow node on every tab. Only an admission failure — which never
			* entered a handler and therefore never logged — falls back to the composer
			* notice as immediate feedback.
			*/
			runDetached(desc, session, line) {
				this.execute(session, line).then((outcome) => {
					if (outcome.kind === "error") this.noticeFor(session.sessionId, "error", outcome.text ?? `/${desc.name} failed`);
				}, (error) => {
					this.noticeFor(session.sessionId, "error", error instanceof Error ? error.message : String(error));
				});
			}
			/** Dispatch a consume-token event to one session (menu-pick / bare-enter execute paths). */
			consumeVia(id, segment) {
				const actx = this.scopeFor(id);
				if (actx === void 0) return;
				actx.bail(actx, "slash/input-consume-token", { guard: segment.via === "menu" ? {
					kind: "span",
					span: segment.span
				} : {
					kind: "bare-token",
					token: segment.token
				} });
			}
			/** Route an admission failure to the session's composer notice channel (scope gone = attempt died with it). */
			noticeFor(id, level, text) {
				const actx = this.scopeFor(id);
				if (actx === void 0) return;
				const conversation = actx.get("conversation");
				if (conversation === void 0) return;
				conversation.input.for(actx).notify(level, text);
			}
			/** id → actx interchange (registered exchange point: this service coordinates for projection-only sources). */
			scopeFor(id) {
				return this.sessions().scope(id);
			}
			sessions() {
				const sessions = this.ctx.get("sessions");
				if (sessions === void 0) throw new Error("ui-commands: sessions service unavailable");
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
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-commands/src/client/PopupSelectView.module.css.mjs
		const css = ".CLGBXq_card{box-sizing:border-box;z-index:100;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);min-width:min(220px,100%);max-width:100%;max-height:320px;box-shadow:var(--dsw-elevation-prominent);border:0;outline:none;flex-direction:column;padding:4px;display:flex;position:absolute;bottom:calc(100% + 4px);left:0;right:0;overflow:hidden}.CLGBXq_viewport{flex-direction:column;min-height:0;display:flex;overflow-y:auto}.CLGBXq_row{border-radius:var(--dsw-radius-md);cursor:pointer;color:var(--dsw-alias-label-primary);align-items:center;gap:6px;padding:5px 7px;font-size:12px;display:flex}.CLGBXq_rowActive{background:var(--dsw-alias-interactive-bg-hover)}.CLGBXq_label{flex:0 auto;align-items:baseline;gap:4px;min-width:0;display:flex}.CLGBXq_labelText{white-space:nowrap;text-overflow:ellipsis;min-width:0;overflow:hidden}.CLGBXq_badge{color:var(--dsw-alias-label-tertiary);letter-spacing:.2px;flex:none;align-self:flex-start;margin-top:-1px;font-size:8px;font-weight:600;line-height:10px}.CLGBXq_detail{min-width:0;color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;flex:1;font-size:11px;overflow:hidden}.CLGBXq_check{color:var(--dsw-alias-label-primary);flex:none;margin-left:auto;display:inline-flex}.CLGBXq_check svg{width:14px;height:14px}.CLGBXq_status{color:var(--dsw-alias-label-tertiary);padding:7px 8px;font-size:12px}.CLGBXq_search{border-radius:var(--dsw-radius-md);color:var(--dsw-alias-label-primary);background:0 0;border:.5px solid #0000;outline:none;margin:2px 2px 3px;padding:5px 7px;font-size:12px}.CLGBXq_error{color:var(--dsw-alias-state-error-primary);align-items:center;gap:6px;padding:5px 7px;font-size:11px;display:flex}.CLGBXq_errorText{text-overflow:ellipsis;flex:1;overflow:hidden}.CLGBXq_retry{border:.5px solid var(--dsw-alias-border-inverted);border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;padding:2px 7px;font-size:11px}";
		const tagId = "@deepseek-ai/dsh-client-ui-commands/PopupSelectView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-commands";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var PopupSelectView_module_css_default = {
			"badge": "CLGBXq_badge",
			"card": "CLGBXq_card",
			"check": "CLGBXq_check",
			"detail": "CLGBXq_detail",
			"error": "CLGBXq_error",
			"errorText": "CLGBXq_errorText",
			"label": "CLGBXq_label",
			"labelText": "CLGBXq_labelText",
			"retry": "CLGBXq_retry",
			"row": "CLGBXq_row",
			"rowActive": "CLGBXq_rowActive",
			"search": "CLGBXq_search",
			"status": "CLGBXq_status",
			"viewport": "CLGBXq_viewport"
		};
		//#endregion
		//#region lib/types/client/PopupSelectView.js
		/**
		* Official popupSelect shell: renders one session's PopupSelectController
		* store into the conversation.input.overlay anchor. Unlike the slash menu
		* (combobox — textarea keeps focus), this shell focuses its search input on
		* desktop; phones and tablets require explicit search focus. Typing filters
		* the loaded options locally, Enter and Tab accept the filtered highlight,
		* ↑↓ walk it (wrapping,
		* scrolled into view), and Escape and Shift+Tab dismiss back to the composer.
		* ←→ keep the search input's native caret. Any pointer interaction outside the
		* box dismisses (the click's own target takes focus). Closed state renders
		* null; the overlay slot stays mounted. The card height clamps to the space
		* above the composer.
		*/
		/** Design cap on the card height (same MenuDropdown family as the slash menu). */
		const MAX_HEIGHT = 320;
		/**
		* Render the popupSelect shell overlay entry.
		* @param props - injected face: the session's shell controller; `t` rides the standard locale seat.
		* @returns the select card while open; null while closed.
		*/
		function PopupSelectView({ popup, t }) {
			const state = (0, react.useSyncExternalStore)((fn) => popup.state.subscribe(fn), () => popup.state.getSnapshot());
			const cardRef = (0, react.useRef)(null);
			const searchRef = (0, react.useRef)(null);
			const viewportRef = (0, react.useRef)(null);
			const rows = (0, react.useMemo)(() => filterOptions(state.options, state.search, state.searchMode), [
				state.options,
				state.search,
				state.searchMode
			]);
			const groups = (0, react.useMemo)(() => groupOptions(rows), [rows]);
			(0, react.useEffect)(() => {
				const viewport = viewportRef.current;
				if (viewport === null) return;
				return (0, _deepseek_ai_dsh_client_ui_primitives.observeStickyMenuGroups)(viewport);
			}, [
				state.open,
				state.status,
				state.confirming,
				groups
			]);
			const maxHeight = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredMaxHeight)(cardRef, MAX_HEIGHT, state);
			const active = state.open ? state.active : null;
			(0, react.useEffect)(() => {
				if (active === null) return;
				cardRef.current?.querySelector("[aria-selected=\"true\"]")?.scrollIntoView({ block: "nearest" });
			}, [
				active,
				rows,
				state.confirming
			]);
			(0, react.useEffect)(() => {
				if (!state.open || state.confirming !== null) return;
				const onPointerDown = (ev) => {
					if (cardRef.current !== null && ev.target instanceof Node && cardRef.current.contains(ev.target)) return;
					popup.dismiss();
				};
				document.addEventListener("pointerdown", onPointerDown, true);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown, true);
				};
			}, [
				state.open,
				state.confirming,
				popup
			]);
			(0, react.useEffect)(() => {
				if (!state.open || state.confirming !== null) return;
				if ((0, _deepseek_ai_dsh_client_ui_primitives.isMobileDevice)()) return;
				searchRef.current?.focus();
			}, [state.open, state.confirming]);
			if (!state.open) return null;
			const confirmation = state.confirming?.confirmation;
			const emptyLabel = state.searchLabels === null ? t("status.empty") : state.options.length === 0 ? state.searchLabels.empty : state.searchLabels.noResults;
			const onKeyDown = (ev) => {
				switch (ev.key) {
					case "ArrowDown":
						ev.preventDefault();
						popup.move(1);
						return;
					case "ArrowUp":
						ev.preventDefault();
						popup.move(-1);
						return;
					case "Enter":
						ev.preventDefault();
						popup.select(state.active);
						return;
					case "Tab":
						if (!ev.shiftKey && (state.status !== "ready" || rows.length === 0)) return;
						ev.preventDefault();
						if (ev.shiftKey) popup.dismiss({ focusComposer: true });
						else popup.select(state.active);
						return;
					case "Escape":
						ev.preventDefault();
						popup.dismiss({ focusComposer: true });
						return;
					default:
				}
			};
			const renderOption = (option, index) => (0, react_jsx_runtime.jsxs)("div", {
				role: "option",
				"aria-selected": index === state.active,
				"aria-label": option.badge === void 0 ? void 0 : `${option.label} ${option.badge}`,
				className: clsx(PopupSelectView_module_css_default.row, index === state.active && PopupSelectView_module_css_default.rowActive),
				onClick: () => {
					popup.select(index);
				},
				onMouseEnter: () => {
					popup.highlight(index);
				},
				children: [
					(0, react_jsx_runtime.jsxs)("span", {
						className: PopupSelectView_module_css_default.label,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: PopupSelectView_module_css_default.labelText,
							children: option.label
						}), option.badge !== void 0 && (0, react_jsx_runtime.jsx)("sup", {
							className: PopupSelectView_module_css_default.badge,
							children: option.badge
						})]
					}),
					option.detail !== void 0 && (0, react_jsx_runtime.jsx)("span", {
						className: PopupSelectView_module_css_default.detail,
						children: option.detail
					}),
					option.active === true && (0, react_jsx_runtime.jsx)("span", {
						className: PopupSelectView_module_css_default.check,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {})
					})
				]
			}, option.id);
			let optionIndex = 0;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [state.confirming === null && (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.MenuSurface, {
				ref: cardRef,
				className: PopupSelectView_module_css_default.card,
				style: { maxHeight },
				"aria-label": t("overlay.aria", { command: String(state.command) }),
				onKeyDown,
				children: [
					(0, react_jsx_runtime.jsx)("input", {
						ref: searchRef,
						className: PopupSelectView_module_css_default.search,
						type: "text",
						placeholder: state.searchLabels?.placeholder ?? t("search.placeholder"),
						"aria-label": t("search.aria"),
						value: state.search,
						readOnly: state.submitting,
						onChange: (ev) => {
							popup.setSearch(ev.currentTarget.value);
						}
					}),
					state.error !== null && (0, react_jsx_runtime.jsxs)("div", {
						className: PopupSelectView_module_css_default.error,
						role: "alert",
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: PopupSelectView_module_css_default.errorText,
							children: state.error
						}), state.status === "failed" && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: PopupSelectView_module_css_default.retry,
							onClick: () => {
								popup.retry();
							},
							children: t("retry")
						})]
					}),
					state.status === "pending" && (0, react_jsx_runtime.jsx)("div", {
						className: PopupSelectView_module_css_default.status,
						children: t("status.loading")
					}),
					state.submitting && (0, react_jsx_runtime.jsx)("div", {
						className: PopupSelectView_module_css_default.status,
						children: t("status.applying")
					}),
					state.status === "ready" && rows.length === 0 && (0, react_jsx_runtime.jsx)("div", {
						className: PopupSelectView_module_css_default.status,
						children: emptyLabel
					}),
					state.status === "ready" && (0, react_jsx_runtime.jsx)("div", {
						ref: viewportRef,
						role: "listbox",
						"aria-label": t("listbox.aria", { command: String(state.command) }),
						className: PopupSelectView_module_css_default.viewport,
						children: groups.map(({ group, rows: groupRows }) => group === void 0 ? (0, react_jsx_runtime.jsx)(react.Fragment, { children: groupRows.map((option) => renderOption(option, optionIndex++)) }, "ungrouped") : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuGroup, {
							label: group.label,
							children: groupRows.map((option) => renderOption(option, optionIndex++))
						}, `group:${group.name}`))
					})
				]
			}), confirmation !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.RiskConfirmation, {
				open: true,
				title: confirmation.title,
				description: confirmation.description,
				acknowledgeLabel: confirmation.acknowledgeLabel,
				cancelLabel: confirmation.cancelLabel,
				closeLabel: t("close"),
				confirmLabel: confirmation.confirmLabel,
				acknowledged: state.acknowledged,
				onAcknowledgedChange: (value) => {
					popup.acknowledge(value);
				},
				onCancel: () => {
					popup.cancelConfirmation();
				},
				onConfirm: () => {
					popup.confirm();
				}
			})] });
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Dictionary namespace owned by this plugin. */
		const NS = "command";
		/** Required services: the '/' source registry, session scopes, commands Remote, and locale registry. */
		const inject = [
			"inputTriggers",
			"sessions",
			"remote",
			"remote.commands",
			"locale"
		];
		/**
		* Mount the command service and its per-session popupSelect overlay.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-commands: dictionaries");
			ctx.plugin(CommandUiRuntime);
			ctx.inject([
				"slots",
				"commandUi",
				"sessions"
			], (scope) => {
				const command = scope.commandUi;
				const sessions = scope.get("sessions");
				scope.slots.inject("conversation.input.overlay", () => scope.slots.register({
					name: "conversation.input.overlay",
					id: "command-popup",
					order: 1,
					locale: NS,
					inject: (sessionId) => {
						const actx = sessions.scope(sessionId);
						if (actx === void 0) throw new Error(`ui-commands: session "${String(sessionId)}" resolved no scope`);
						return { popup: command.popupFor(actx) };
					}
				}, PopupSelectView));
			});
		}
		//#endregion
		exports.CommandDirectory = CommandDirectory;
		exports.CommandUiRuntime = CommandUiRuntime;
		exports.PopupSelectController = PopupSelectController;
		exports.apply = apply;
		exports.filterOptions = filterOptions;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map