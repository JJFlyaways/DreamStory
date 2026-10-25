window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-settings",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
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
		//#region lib/types/client/schema.js
		/** Synchronous schema introspection and immutable settings-draft edits. */
		function cloneContainer(container, key) {
			if (Array.isArray(container)) return [...container];
			if (typeof container === "object" && container !== null) return { ...container };
			return /^\d+$/.test(key) ? [] : {};
		}
		function cloneSpine(root, path) {
			const result = { ...root };
			let target = result;
			for (let index = 0; index < path.length - 1; index++) {
				const key = path[index];
				const child = cloneContainer(Array.isArray(target) ? target[Number(key)] : target[key], path[index + 1]);
				if (Array.isArray(target)) target[Number(key)] = child;
				else target[key] = child;
				target = child;
			}
			return {
				result,
				parent: target,
				leaf: path[path.length - 1]
			};
		}
		/**
		* Settings-owned synchronous schema service. Dynamic client plugins receive
		* this Cordis entity instead of importing executable helpers from one another.
		*/
		var SettingsSchemaService = class extends _deepseek_ai_cordis.Service {
			/** @param ctx - providing ui-settings context. */
			constructor(ctx) {
				super(ctx, "settingsSchema");
			}
			/**
			* Rehydrate one serialized `schema.toJSON()` envelope.
			* @param serialized - serialized Schemastery node.
			* @returns live schema node.
			*/
			rehydrate(serialized) {
				return new Schema(serialized);
			}
			/**
			* Validate a settings draft.
			* @param schema - live schema node.
			* @param draft - candidate settings value.
			* @returns validation failure text, or `undefined` when valid.
			*/
			validate(schema, draft) {
				try {
					schema(draft);
					return;
				} catch (error) {
					return error instanceof Error ? error.message : String(error);
				}
			}
			/**
			* Resolve an object, dict, or array schema node at a settings path.
			* @param root - schema node to traverse.
			* @param path - object keys or array indexes.
			* @returns the resolved node, or `undefined` when the path is absent.
			*/
			nodeAtPath(root, path) {
				let node = root;
				for (const key of path) {
					if (node === void 0) return void 0;
					if (node.type === "object") node = node.dict?.[key];
					else if (node.type === "dict" || node.type === "array") node = node.inner;
					else return void 0;
				}
				return node;
			}
			/**
			* Read a nested value by a string-key or array-index path.
			* @param value - value to traverse.
			* @param path - object keys or array indexes.
			* @returns the resolved value, or `undefined` when the path is absent.
			*/
			getPath(value, path) {
				let current = value;
				for (const key of path) {
					if (Array.isArray(current)) {
						current = current[Number(key)];
						continue;
					}
					if (typeof current !== "object" || current === null) return void 0;
					current = current[key];
				}
				return current;
			}
			/**
			* Report whether the final path key exists independently of its value.
			* @param value - value to traverse.
			* @param path - object keys or array indexes.
			* @returns whether the path exists.
			*/
			hasPath(value, path) {
				if (path.length === 0) return value !== void 0;
				const parent = this.getPath(value, path.slice(0, -1));
				const key = path[path.length - 1];
				if (Array.isArray(parent)) return Number(key) < parent.length;
				if (typeof parent !== "object" || parent === null) return false;
				return key in parent;
			}
			/**
			* Immutably set a nested value, materializing missing containers.
			* @param root - settings object to copy.
			* @param path - non-empty object-key or array-index path.
			* @param value - replacement value.
			* @returns copied root containing the replacement.
			* @throws when `path` is empty.
			*/
			setPath(root, path, value) {
				if (path.length === 0) throw new Error("ui-settings: setPath needs a non-empty path");
				const { result, parent, leaf } = cloneSpine(root, path);
				if (Array.isArray(parent)) parent[Number(leaf)] = value;
				else parent[leaf] = value;
				return result;
			}
			/**
			* Immutably remove a nested key, preserving an unchanged missing root.
			* @param root - settings object to copy.
			* @param path - non-empty object-key or array-index path.
			* @returns copied root without the key, or `root` when the path is absent.
			* @throws when `path` is empty.
			*/
			deletePath(root, path) {
				if (path.length === 0) throw new Error("ui-settings: deletePath needs a non-empty path");
				if (!this.hasPath(root, path)) return root;
				const { result, parent, leaf } = cloneSpine(root, path);
				if (Array.isArray(parent)) parent.splice(Number(leaf), 1);
				else Reflect.deleteProperty(parent, leaf);
				return result;
			}
		};
		//#endregion
		//#region lib/types/client/developer-tools.js
		/** Shared preference; Host-backed features stay disabled until an accepted value arrives. */
		var DeveloperToolsPreference = class {
			scope;
			/** Accepted enablement, observable through renderer-bound hooks. */
			enabled;
			/**
			* @param scope - settings-owned namespace controller.
			*/
			constructor(scope) {
				this.scope = scope;
				this.enabled = {
					getSnapshot: () => scope.getSnapshot().value?.enabled ?? false,
					subscribe: (listener) => {
						let previous = this.enabled.getSnapshot();
						return scope.subscribe(() => {
							const next = this.enabled.getSnapshot();
							if (next === previous) return;
							previous = next;
							listener();
						});
					}
				};
			}
			/**
			* Persist the choice on the Host with ordered writes.
			* @param enabled - requested developer-tool mode.
			* @returns settlement after Host acceptance; rejects after a refused write recovers.
			*/
			async setEnabled(enabled) {
				if (!await this.scope.set("enabled", enabled)) throw new Error("Developer tools preference was not saved");
			}
		};
		//#endregion
		//#region lib/types/developer-tools-settings.js
		/** Shared Web and desktop developer-tool preference stored by the Host. */
		/** Namespace for developer UI and HTML preview capabilities. */
		const DEVELOPER_TOOLS_NAMESPACE = "ui-settings";
		/** New installations and missing values enable the full interface. */
		const DeveloperToolsSettingsFields = { enabled: Schema.boolean().default(true) };
		Schema.object(DeveloperToolsSettingsFields);
		//#endregion
		//#region lib/types/client/config-form.js
		/** Shared entry values and ordered writes over the Host configuration mirror. */
		/**
		* One namespace's derived view over the shared describe mirror, plus that
		* namespace's serialized Host writes. Writes carry the latest known namespace
		* revision, fold their answers back into the mirror, and teardown waits for
		* the operation already crossing the wire.
		*/
		var ConfigFormController = class {
			ctx;
			spec;
			mirror;
			schema;
			store;
			tail = Promise.resolve();
			writeGeneration = 0;
			disposed = false;
			unsubscribe;
			/**
			* Revision answered by a superseded write still ahead of the mirror: the
			* mirror only folds the LATEST settlement in, so a queued successor takes
			* its fence from here first.
			*/
			pendingRevision;
			/**
			* @param ctx - the providing plugin's context, whose `remote.settings`
			* namespace carries this form's writes (reads ride the mirror).
			* @param spec - namespace identity and optional narrowing decoder.
			* @param mirror - the shared describe mirror this form derives from.
			* @param schema - settings-owned schema operations.
			*/
			constructor(ctx, spec, mirror, schema) {
				this.ctx = ctx;
				this.spec = spec;
				this.mirror = mirror;
				this.schema = schema;
				this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
					status: "loading",
					value: void 0,
					base: void 0,
					user: void 0,
					revision: void 0,
					writable: false
				});
				this.unsubscribe = mirror.subscribe(() => {
					this.derive();
				});
				this.derive();
			}
			/** @returns the current sync snapshot (stable reference until the next change). */
			getSnapshot() {
				return this.store.getSnapshot();
			}
			/**
			* Observe snapshot replacements.
			* @param listener - invoked after each snapshot change.
			* @returns the disposer removing this listener.
			*/
			subscribe(listener) {
				return this.store.subscribe(listener);
			}
			/**
			* Queue one field write; see {@link ConfigForm.set} for the ordering,
			* revision, and recovery contract.
			* @param field - scalar field inside the namespace section.
			* @param value - JSON-shaped value selected by the user.
			* @returns whether the Host accepted the write, after any recovery read.
			*/
			set(field, value) {
				return this.mutate([{
					op: "set",
					path: [field],
					value
				}]);
			}
			/**
			* Queue one field clear; see {@link ConfigForm.unset} for the ordering,
			* revision, and recovery contract.
			* @param field - scalar field inside the namespace section.
			* @returns whether the Host accepted the clear, after any recovery read.
			*/
			unset(field) {
				return this.mutate([{
					op: "unset",
					path: [field]
				}]);
			}
			/**
			* Queue one atomic namespace mutation; see {@link ConfigForm.mutate}.
			* @param ops - ordered field operations copied when queued.
			* @param expectedRevision - optional fixed revision read by the domain editor.
			* @returns whether the Host accepted the mutation, after any recovery read.
			*/
			mutate(ops, expectedRevision) {
				const ownedOps = structuredClone(ops);
				const generation = ++this.writeGeneration;
				return this.enqueue(async () => {
					const revision = expectedRevision ?? this.pendingRevision ?? this.getSnapshot().revision;
					const response = await this.ctx.remote.settings.mutate(this.spec.namespace, ownedOps, revision);
					if (!response.ok) {
						await this.recover(generation);
						return false;
					}
					if (this.disposed) return true;
					if (generation === this.writeGeneration) {
						this.pendingRevision = void 0;
						this.mirror.acceptView(response.value);
					} else this.pendingRevision = response.value.revision;
					return true;
				});
			}
			/** Reload Host state for the latest failed write; superseded failures leave recovery to it. */
			async recover(generation) {
				if (this.disposed || generation !== this.writeGeneration) return;
				this.pendingRevision = void 0;
				await this.mirror.load();
			}
			/**
			* Stop queued operations, stop deriving, and wait for the current wire call
			* to settle.
			* @returns settlement after the controller reaches quiescence.
			*/
			async dispose() {
				this.disposed = true;
				this.writeGeneration += 1;
				this.unsubscribe();
				await this.tail;
			}
			enqueue(operation) {
				if (this.disposed) return Promise.resolve(false);
				const task = this.tail.then(async () => {
					if (this.disposed) return false;
					return await operation();
				});
				this.tail = task.then(() => {}, () => {});
				return task;
			}
			derive() {
				if (this.disposed) return;
				const mirrored = this.mirror.getSnapshot();
				if (mirrored.view === void 0) return;
				const { writable } = mirrored.view;
				const view = mirrored.view.namespaces.find((candidate) => candidate.ns === this.spec.namespace);
				if (view === void 0) {
					this.store.update((draft) => {
						draft.status = "unavailable";
						draft.writable = writable;
					});
					return;
				}
				const decoded = this.decode(view);
				this.store.update((draft) => {
					draft.revision = view.revision;
					draft.base = view.base;
					draft.user = view.user;
					draft.writable = writable;
					if (decoded === void 0) return;
					draft.status = "ready";
					draft.value = decoded;
				});
			}
			decode(view) {
				if (this.spec.decode !== void 0) return this.spec.decode(view.value);
				if (typeof view.value !== "object" || view.value === null || Array.isArray(view.value)) return void 0;
				let failure;
				try {
					failure = this.schema.validate(this.schema.rehydrate(view.schema), view.value);
				} catch (_malformedSchemaEnvelope) {
					return;
				}
				return failure === void 0 ? view.value : void 0;
			}
		};
		/**
		* The settings domain's base service. Features that own a preference reach the
		* settings transport through this service rather than a shared function: the
		* client bundle purity gate forbids cross-plugin value imports and directs
		* cross-plugin collaboration through cordis services
		* (`packages/client/tsdown.client.ts`).
		*/
		var ConfigForms = class extends _deepseek_ai_cordis.Service {
			forms = /* @__PURE__ */ new Map();
			/** Shared developer-tool preference owned by this settings provider. */
			developerTools;
			mirror;
			schema;
			/**
			* The PROVIDING fiber, kept because a Service reads `ctx` as its *consumer's*
			* fiber: letting a shared form write through the caller's context would make
			* every caller declare `remote.settings` in its own `inject`.
			*/
			owner;
			/**
			* @param ctx - the providing plugin's context.
			* @param config - the shared describe mirror every shared form derives from
			* and the settings-owned schema operations.
			*/
			constructor(ctx, config) {
				super(ctx, "configForms");
				this.mirror = config.mirror;
				this.schema = config.schema;
				this.owner = ctx;
				this.developerTools = new DeveloperToolsPreference(this.get(DEVELOPER_TOOLS_NAMESPACE));
				ctx.effect(() => async () => {
					await Promise.all([...this.forms.values()].map((form) => form.dispose()));
					this.forms.clear();
				}, "ui-settings: configuration forms");
			}
			/**
			* The shared mirror's read/fold face for cross-namespace surfaces (schema
			* introspection, the served-namespace directory). Per-namespace consumers
			* use {@link get}; both derive from the same snapshot, so they can never
			* disagree about the document.
			* @returns the describe face over the shared mirror.
			*/
			describe() {
				return this.mirror;
			}
			/** Get the shared form values and write queue for one Host plugin entry.
			* @param entryId Unique Host plugin entry id.
			* @returns The entry's form, owned by this provider.
			*/
			get(entryId) {
				const existing = this.forms.get(entryId);
				if (existing !== void 0) return existing;
				const form = new ConfigFormController(this.owner, { namespace: entryId }, this.mirror, this.schema);
				this.forms.set(entryId, form);
				this.mirror.ensure();
				return form;
			}
			/**
			* Keep a registration alive while the Host serves any of some namespaces:
			* `register` runs once one of them is in the describe mirror, and its
			* disposer runs when none is or when the returned disposer runs. A plugin
			* whose page edits a namespace another plugin owns registers the page
			* through this, so a deployment that never composed the owner shows no
			* trace of the page. The caller owns the returned disposer and wraps it in
			* `ctx.effect`; unlike {@link bind}, nothing is registered on the caller's
			* context here.
			* @param namespaces - the settings namespaces the registration follows.
			* @param register - registers the contribution, given every namespace the Host serves; returns its disposer.
			* @returns the disposer ending the watch and any live registration.
			*/
			whileServed(namespaces, register) {
				let off;
				const sync = () => {
					const served = new Set(this.mirror.getSnapshot().view?.namespaces.map((view) => view.ns) ?? []);
					const watched = namespaces.some((namespace) => served.has(namespace));
					if (watched && off === void 0) off = register(served);
					else if (!watched && off !== void 0) {
						off();
						off = void 0;
					}
				};
				const unsubscribe = this.mirror.subscribe(sync);
				this.mirror.ensure();
				sync();
				return () => {
					unsubscribe();
					off?.();
					off = void 0;
				};
			}
		};
		//#endregion
		//#region lib/types/client/settings-mirror.js
		/**
		* Client mirror of the Host settings document: the one `settings.describe`
		* reader in the browser. Every settings consumer derives from this store —
		* shared entry forms through `ConfigForms.get`, cross-namespace
		* surfaces through the provider's shared describe face — so startup cost and
		* freshness are properties of this class, not of how many features own a
		* preference. The Host stays the fact source: the mirror re-reads on the
		* invalidations its owning plugin subscribes to and folds write answers in
		* through {@link SettingsDescribeMirror.acceptView}.
		*/
		/**
		* Serializes every Host `settings.describe` read behind one snapshot store.
		* Concurrent {@link load} calls fold into the in-flight read plus one rerun,
		* so an invalidation arriving mid-read is never lost and never duplicated.
		*/
		var SettingsDescribeMirror = class {
			ctx;
			store;
			inFlight;
			rerun = false;
			generation = 0;
			/**
			* @param ctx - the providing plugin's context, whose `remote.settings`
			* namespace answers the describe read.
			*/
			constructor(ctx) {
				this.ctx = ctx;
				this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
					status: "idle",
					view: void 0,
					error: null
				});
			}
			/** @returns the current sync snapshot (stable reference until the next change). */
			getSnapshot() {
				return this.store.getSnapshot();
			}
			/**
			* Observe snapshot replacements.
			* @param listener - invoked after each snapshot change.
			* @returns the disposer removing this listener.
			*/
			subscribe(listener) {
				return this.store.subscribe(listener);
			}
			/**
			* Refresh from the Host. A call during an in-flight read marks one rerun
			* after it settles instead of racing a second wire read.
			* @returns settlement after this call's freshness is reflected.
			*/
			load() {
				if (this.inFlight !== void 0) {
					this.rerun = true;
					return this.inFlight;
				}
				const run = Promise.resolve().then(() => this.run());
				this.inFlight = run;
				return run;
			}
			/**
			* Resolve once an answer is held, reading only from `idle`.
			* @returns settlement of the current or newly started read, if any.
			*/
			ensure() {
				if (this.inFlight !== void 0) return this.inFlight;
				if (this.getSnapshot().status === "idle") return this.load();
				return Promise.resolve();
			}
			/**
			* Fold one write answer's namespace view into the held view without a wire
			* read, and invalidate any read still in flight. With no held document, the
			* answer is not published as a partial document; an in-flight read reruns so
			* it cannot publish a document fetched before the write committed.
			* @param view - the namespace view a settings write answered with.
			*/
			acceptView(view) {
				const before = this.store.getSnapshot();
				this.generation += 1;
				if (this.inFlight !== void 0) this.rerun = true;
				if (before.view === void 0) return;
				const namespaces = before.view.namespaces.some((row) => row.ns === view.ns) ? before.view.namespaces.map((row) => row.ns === view.ns ? view : row) : [...before.view.namespaces, view];
				this.store.set({
					...before,
					view: {
						...before.view,
						namespaces
					}
				});
			}
			/**
			* Convenience row lookup on the held view.
			* @param ns - namespace identity.
			* @returns the namespace view, or undefined while unanswered or unregistered.
			*/
			namespace(ns) {
				return this.store.getSnapshot().view?.namespaces.find((row) => row.ns === ns);
			}
			async run() {
				try {
					do {
						const before = this.store.getSnapshot();
						if (before.status === "idle") this.store.set({
							...before,
							status: "loading"
						});
						this.rerun = false;
						const generation = ++this.generation;
						let outcome;
						try {
							const response = await this.ctx.remote.settings.describe();
							outcome = response.ok ? { view: response.value } : { failure: response.error.message };
						} catch (error) {
							outcome = { failure: error instanceof Error ? error.message : String(error) };
						}
						if (generation !== this.generation) continue;
						if ("view" in outcome) this.store.set({
							status: "ready",
							view: outcome.view,
							error: null
						});
						else {
							const held = this.store.getSnapshot();
							this.store.set({
								status: held.view === void 0 ? "idle" : "ready",
								view: held.view,
								error: outcome.failure
							});
						}
					} while (this.shouldRerun());
				} finally {
					this.inFlight = void 0;
				}
			}
			shouldRerun() {
				return this.rerun;
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Required services: the Remote namespace the mirror reads through and the
		* forwarded settings invalidation it refreshes on.
		*/
		const inject = ["remote", "remote.settings"];
		/** Provide shared forms and refresh them on document changes and reconnects.
		* @param ctx Client provider context.
		*/
		function apply(ctx) {
			const schema = new SettingsSchemaService(ctx);
			const mirror = new SettingsDescribeMirror(ctx);
			ctx.effect(() => {
				const disposers = [ctx.remote.$on("settings/document-updated", () => {
					mirror.load();
				}), ctx.on("connection/reset", () => {
					mirror.load();
				})];
				mirror.ensure();
				return () => {
					for (const dispose of disposers) dispose();
				};
			}, "ui-settings: describe mirror invalidations");
			new ConfigForms(ctx, {
				mirror,
				schema
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map