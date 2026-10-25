window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-locale",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region lib/types/client/bootstrap.js
		/** Locale initialization supplied by a native shell before its Client tree mounts. */
		/**
		* Validate initialization data returned over the preload IPC bridge.
		* @param value - untrusted IPC response.
		* @returns language initialization with no persistence side effects.
		*/
		function parseLocaleBootstrap(value) {
			if (typeof value !== "object" || value === null || !("languages" in value) || !Array.isArray(value.languages) || !value.languages.every((language) => typeof language === "string") || !("preference" in value) || value.preference !== null && typeof value.preference !== "string") throw new TypeError("locale: invalid native initialization data");
			return {
				languages: value.languages,
				preference: value.preference
			};
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
		//#region lib/types/locale-settings.js
		/** Locale preference stored in the Host user-settings document. */
		/** Settings namespace owned by the locale plugin. */
		const LOCALE_SETTINGS_NAMESPACE = "locale";
		/** Field carrying an explicit locale selection; absence delegates to the browser. */
		const LOCALE_PREFERENCE_FIELD = "preference";
		/** Accepted BCP 47-style language ids. */
		const LOCALE_ID_PATTERN = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u;
		/** Baseline locales required by typed namespace dictionary registration. */
		const LOCALE_IDS = ["zh", "en"];
		/** Durable locale schema; also the wire envelope the browser scope validates against. */
		const LocaleSettingsFields = { [LOCALE_PREFERENCE_FIELD]: Schema.string().pattern(LOCALE_ID_PATTERN).required(false) };
		Schema.object(LocaleSettingsFields);
		//#endregion
		//#region lib/types/locales/zh.js
		/** zh base dictionary for the common namespace: cross-feature standard words. */
		const zh$1 = {
			"ok": "确定",
			"cancel": "取消",
			"close": "关闭",
			"copy": "复制",
			"copied": "复制成功",
			"codeBlock.title": "代码块",
			"codeBlock.wrap": "自动换行",
			"codeBlock.unwrap": "取消自动换行",
			"copy.failed": "复制失败",
			"copy.value": "复制值",
			"copy.json": "复制 JSON",
			"copy.path": "复制属性路径",
			"copy.prettyJson": "复制格式化 JSON",
			"copy.compactJson": "复制紧凑 JSON",
			"copy.optionsHint": "{action}；右键点击可选择复制方式",
			"retry": "重试",
			"loading": "加载中…",
			"load.failed": "加载失败",
			"submit": "提交",
			"submitting": "正在提交…",
			"next": "下一步",
			"previous": "上一步",
			"skip": "跳过",
			"delete": "删除",
			"edit": "编辑",
			"save": "保存",
			"search": "搜索",
			"more": "更多",
			"collapse": "收起",
			"expand": "展开",
			"back": "返回",
			"brand.localBuild": "DSH 本地构建",
			"workspace.defaultName": "默认工作区",
			"unknown": "未知",
			"none": "无",
			"truncated": "已截断",
			"json.label": "JSON",
			"markdown.footnotes": "脚注",
			"markdown.truncatedCharacters": "… 已截断，共 {total} 字符",
			"number.thousand": "{value}K",
			"number.million": "{value}M"
		};
		//#endregion
		//#region lib/types/locales/en.js
		/** en base dictionary for the common namespace, checked complete against the zh key set. */
		const en$1 = {
			"ok": "OK",
			"cancel": "Cancel",
			"close": "Close",
			"copy": "Copy",
			"copied": "Copied",
			"codeBlock.title": "Code block",
			"codeBlock.wrap": "Wrap lines",
			"codeBlock.unwrap": "Do not wrap lines",
			"copy.failed": "Copy failed",
			"copy.value": "Copy value",
			"copy.json": "Copy JSON",
			"copy.path": "Copy property path",
			"copy.prettyJson": "Copy pretty JSON",
			"copy.compactJson": "Copy compact JSON",
			"copy.optionsHint": "{action}; right-click for copy options",
			"retry": "Retry",
			"loading": "Loading…",
			"load.failed": "Failed to load",
			"submit": "Submit",
			"submitting": "Submitting…",
			"next": "Next",
			"previous": "Previous",
			"skip": "Skip",
			"delete": "Delete",
			"edit": "Edit",
			"save": "Save",
			"search": "Search",
			"more": "More",
			"collapse": "Collapse",
			"expand": "Expand",
			"back": "Back",
			"brand.localBuild": "DSH Local Build",
			"workspace.defaultName": "Default workspace",
			"unknown": "Unknown",
			"none": "None",
			"truncated": "Truncated",
			"json.label": "JSON",
			"markdown.footnotes": "Footnotes",
			"markdown.truncatedCharacters": "… truncated at {total} characters",
			"number.thousand": "{value}K",
			"number.million": "{value}M"
		};
		//#endregion
		//#region lib/types/locales/ja.js
		/** Japanese copy, checked against the English keys. */
		const ja$1 = {
			"ok": "OK",
			"cancel": "キャンセル",
			"close": "閉じる",
			"copy": "コピー",
			"copied": "コピーしました",
			"codeBlock.title": "コードブロック",
			"codeBlock.wrap": "行を折り返す",
			"codeBlock.unwrap": "行を折り返さない",
			"copy.failed": "コピーに失敗しました",
			"copy.value": "値をコピー",
			"copy.json": "JSONをコピー",
			"copy.path": "プロパティパスをコピー",
			"copy.prettyJson": "整形JSONをコピー",
			"copy.compactJson": "コンパクトJSONをコピー",
			"copy.optionsHint": "{action}。右クリックでコピーオプションを表示",
			"retry": "再試行",
			"loading": "読み込み中…",
			"load.failed": "読み込みに失敗しました",
			"submit": "送信",
			"submitting": "送信中…",
			"next": "次へ",
			"previous": "前へ",
			"skip": "スキップ",
			"delete": "削除",
			"edit": "編集",
			"save": "保存",
			"search": "検索",
			"more": "その他",
			"collapse": "折りたたむ",
			"expand": "展開",
			"back": "戻る",
			"brand.localBuild": "DSHローカルビルド",
			"workspace.defaultName": "デフォルトワークスペース",
			"unknown": "不明",
			"none": "なし",
			"truncated": "切り詰め済み",
			"json.label": "JSON",
			"markdown.footnotes": "脚注",
			"markdown.truncatedCharacters": "… {total}文字で切り捨て",
			"number.thousand": "{value}K",
			"number.million": "{value}M"
		};
		//#endregion
		//#region lib/types/locales/es.js
		/** Complete Spanish copy for the common namespace. */
		const es$1 = {
			"ok": "OK",
			"cancel": "Cancelar",
			"close": "Cerrar",
			"copy": "Copiar",
			"copied": "Copiado",
			"codeBlock.title": "Bloque de código",
			"codeBlock.wrap": "Ajustar líneas",
			"codeBlock.unwrap": "No ajustar líneas",
			"copy.failed": "Copia fallida",
			"copy.value": "Copiar valor",
			"copy.json": "Copiar JSON",
			"copy.path": "Copiar ruta de propiedad",
			"copy.prettyJson": "Copiar JSON con formato",
			"copy.compactJson": "Copiar JSON compacto",
			"copy.optionsHint": "{action}; haga clic derecho para opciones de copia",
			"retry": "Reintentar",
			"loading": "Cargando…",
			"load.failed": "No se pudo cargar",
			"submit": "Enviar",
			"submitting": "Enviando…",
			"next": "Siguiente",
			"previous": "Anterior",
			"skip": "Saltar",
			"delete": "Eliminar",
			"edit": "Editar",
			"save": "Guardar",
			"search": "Buscar",
			"more": "Más",
			"collapse": "Contraer",
			"expand": "Expandir",
			"back": "Atrás",
			"brand.localBuild": "Compilación local de DSH",
			"workspace.defaultName": "Espacio de trabajo predeterminado",
			"unknown": "Desconocido",
			"none": "Ninguno",
			"truncated": "Truncado",
			"json.label": "JSON",
			"markdown.footnotes": "Notas a pie de página",
			"markdown.truncatedCharacters": "… truncado a {total} caracteres",
			"number.thousand": "{value}K",
			"number.million": "{value}M"
		};
		//#endregion
		//#region lib/types/locales/fr.js
		/** Complete French copy for the common namespace. */
		const fr$1 = {
			"ok": "OK",
			"cancel": "Annuler",
			"close": "Fermer",
			"copy": "Copier",
			"copied": "Copié",
			"codeBlock.title": "Bloc de code",
			"codeBlock.wrap": "Activer le retour à la ligne",
			"codeBlock.unwrap": "Désactiver le retour à la ligne",
			"copy.failed": "Échec de la copie",
			"copy.value": "Copier la valeur",
			"copy.json": "Copier le JSON",
			"copy.path": "Copier le chemin de la propriété",
			"copy.prettyJson": "Copier le JSON formaté",
			"copy.compactJson": "Copier le JSON compact",
			"copy.optionsHint": "{action}; clic droit pour les options de copie",
			"retry": "Réessayer",
			"loading": "Chargement…",
			"load.failed": "Échec du chargement",
			"submit": "Soumettre",
			"submitting": "Envoi…",
			"next": "Suivant",
			"previous": "Précédent",
			"skip": "Sauter",
			"delete": "Supprimer",
			"edit": "Modifier",
			"save": "Enregistrer",
			"search": "Rechercher",
			"more": "Plus",
			"collapse": "Réduire",
			"expand": "Développer",
			"back": "Retour",
			"brand.localBuild": "Version locale de DSH",
			"workspace.defaultName": "Espace de travail par défaut",
			"unknown": "Inconnu",
			"none": "Aucun",
			"truncated": "Tronqué",
			"json.label": "JSON",
			"markdown.footnotes": "Notes de bas de page",
			"markdown.truncatedCharacters": "… tronqué à {total} caractères",
			"number.thousand": "{value}K",
			"number.million": "{value}M"
		};
		//#endregion
		//#region lib/types/locales/de.js
		/** Complete German copy for the common namespace. */
		const de$1 = {
			"ok": "OK",
			"cancel": "Abbrechen",
			"close": "Schließen",
			"copy": "Kopieren",
			"copied": "Kopiert",
			"codeBlock.title": "Codeblock",
			"codeBlock.wrap": "Zeilen umbrechen",
			"codeBlock.unwrap": "Zeilen nicht umbrechen",
			"copy.failed": "Das Kopieren ist fehlgeschlagen",
			"copy.value": "Wert kopieren",
			"copy.json": "JSON kopieren",
			"copy.path": "Eigenschaftspfad kopieren",
			"copy.prettyJson": "Formatiertes JSON kopieren",
			"copy.compactJson": "Kompaktes JSON kopieren",
			"copy.optionsHint": "{action}; Klicken Sie mit der rechten Maustaste, um die Kopieroptionen anzuzeigen",
			"retry": "Erneut versuchen",
			"loading": "Laden…",
			"load.failed": "Laden fehlgeschlagen",
			"submit": "Senden",
			"submitting": "Wird gesendet…",
			"next": "Weiter",
			"previous": "Zurück",
			"skip": "Überspringen",
			"delete": "Löschen",
			"edit": "Bearbeiten",
			"save": "Speichern",
			"search": "Suchen",
			"more": "Mehr",
			"collapse": "Einklappen",
			"expand": "Ausklappen",
			"back": "Zurück",
			"brand.localBuild": "Lokaler DSH-Build",
			"workspace.defaultName": "Standardarbeitsbereich",
			"unknown": "Unbekannt",
			"none": "Keine",
			"truncated": "Abgeschnitten",
			"json.label": "JSON",
			"markdown.footnotes": "Fußnoten",
			"markdown.truncatedCharacters": "… nach {total} Zeichen abgeschnitten",
			"number.thousand": "{value}K",
			"number.million": "{value}M"
		};
		//#endregion
		//#region lib/types/locales/ru.js
		/** Complete Russian copy for the common namespace. */
		const ru$1 = {
			"ok": "OK",
			"cancel": "Отмена",
			"close": "Закрыть",
			"copy": "Копировать",
			"copied": "Скопировано",
			"codeBlock.title": "Блок кода",
			"codeBlock.wrap": "Переносить строки",
			"codeBlock.unwrap": "Не переносить строки",
			"copy.failed": "Не удалось скопировать",
			"copy.value": "Копировать значение",
			"copy.json": "Копировать JSON",
			"copy.path": "Копировать путь к свойству",
			"copy.prettyJson": "Копировать форматированный JSON",
			"copy.compactJson": "Копировать компактный JSON",
			"copy.optionsHint": "{action}; щелкните правой кнопкой мыши, чтобы просмотреть параметры копирования",
			"retry": "Повторить",
			"loading": "Загрузка…",
			"load.failed": "Не удалось загрузить",
			"submit": "Отправить",
			"submitting": "Отправка…",
			"next": "Далее",
			"previous": "Назад",
			"skip": "Пропустить",
			"delete": "Удалить",
			"edit": "Редактировать",
			"save": "Сохранить",
			"search": "Поиск",
			"more": "Ещё",
			"collapse": "Свернуть",
			"expand": "Развернуть",
			"back": "Назад",
			"brand.localBuild": "Локальная сборка DSH",
			"workspace.defaultName": "Рабочая область по умолчанию",
			"unknown": "Неизвестно",
			"none": "Нет",
			"truncated": "Усечено",
			"json.label": "JSON",
			"markdown.footnotes": "Сноски",
			"markdown.truncatedCharacters": "… обрезано до {total} символов",
			"number.thousand": "{value}K",
			"number.million": "{value}M"
		};
		//#endregion
		//#region lib/types/locales/pt.js
		/** Complete Portuguese copy for the common namespace. */
		const pt$1 = {
			"ok": "OK",
			"cancel": "Cancelar",
			"close": "Fechar",
			"copy": "Copiar",
			"copied": "Copiado",
			"codeBlock.title": "Bloco de código",
			"codeBlock.wrap": "Quebrar linhas",
			"codeBlock.unwrap": "Não quebrar linhas",
			"copy.failed": "Falha na cópia",
			"copy.value": "Copiar valor",
			"copy.json": "Copiar JSON",
			"copy.path": "Copiar caminho da propriedade",
			"copy.prettyJson": "Copiar JSON formatado",
			"copy.compactJson": "Copiar JSON compacto",
			"copy.optionsHint": "{action}; clique com o botão direito para opções de cópia",
			"retry": "Tentar novamente",
			"loading": "Carregando…",
			"load.failed": "Falha ao carregar",
			"submit": "Enviar",
			"submitting": "Enviando…",
			"next": "Próximo",
			"previous": "Anterior",
			"skip": "Pular",
			"delete": "Excluir",
			"edit": "Editar",
			"save": "Salvar",
			"search": "Pesquisar",
			"more": "Mais",
			"collapse": "Recolher",
			"expand": "Expandir",
			"back": "Voltar",
			"brand.localBuild": "Versão local do DSH",
			"workspace.defaultName": "Espaço de trabalho padrão",
			"unknown": "Desconhecido",
			"none": "Nenhum",
			"truncated": "Truncado",
			"json.label": "JSON",
			"markdown.footnotes": "Notas de rodapé",
			"markdown.truncatedCharacters": "… truncado em {total} caracteres",
			"number.thousand": "{value}K",
			"number.million": "{value}M"
		};
		//#endregion
		//#region lib/types/locales/settings.js
		/** `settings.locale` namespace dictionaries (the Language row's copy). */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = { "language.title": "语言" };
		/** English dictionary, checked complete against the zh key set. */
		const en = { "language.title": "Language" };
		/** Japanese copy, checked against the English keys. */
		const ja = { "language.title": "言語" };
		/** Spanish dictionary, checked against the English keys. */
		const es = { "language.title": "Idioma" };
		/** French dictionary, checked against the English keys. */
		const fr = { "language.title": "Langue" };
		/** German dictionary, checked against the English keys. */
		const de = { "language.title": "Sprache" };
		/** Russian dictionary, checked against the English keys. */
		const ru = { "language.title": "Язык" };
		/** Portuguese dictionary, checked against the English keys. */
		const pt = { "language.title": "Idioma" };
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/locale/src/client/LanguageRow.module.css.mjs
		const css = ".bj4JLa_row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}.bj4JLa_rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}@media (width<=767px){html:not([data-windows-titlebar]):not([data-platform=darwin]) .bj4JLa_rowText{padding-right:16px}}.bj4JLa_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}.bj4JLa_selector{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex}@media (hover:hover){.bj4JLa_selector:hover{background:var(--dsw-alias-interactive-bg-hover)}}.bj4JLa_chevron{flex:none}";
		const tagId = "@deepseek-ai/dsh-client-locale/LanguageRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-locale";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var LanguageRow_module_css_default = {
			"chevron": "bj4JLa_chevron",
			"row": "bj4JLa_row",
			"rowText": "bj4JLa_rowText",
			"selector": "bj4JLa_selector",
			"title": "bj4JLa_title"
		};
		//#endregion
		//#region lib/types/client/LanguageRow.js
		/**
		* Language preference row registered into the General section item slot
		* (figma 501:30011 'Setting-Cell'): title + selector pill opening the locale
		* menu. Registered by this package — the locale feature owns its own
		* settings surface.
		*/
		/**
		* Render the Language row.
		* @param props - composed slot props.
		* @returns the row element tree.
		*/
		function LanguageRow({ t, setLocale, useStore }) {
			const active = useStore((s) => s.active);
			const options = useStore((s) => s.options);
			const [open, setOpen] = (0, react.useState)(false);
			const activeLabel = options.find((o) => o.id === active)?.label ?? active;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: LanguageRow_module_css_default.row,
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: LanguageRow_module_css_default.rowText,
					children: (0, react_jsx_runtime.jsx)("div", {
						className: LanguageRow_module_css_default.title,
						children: t("language.title")
					})
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
					open,
					onClose: () => {
						setOpen(false);
					},
					items: options.map((o) => ({
						id: o.id,
						label: o.label
					})),
					selectedId: active,
					onSelect: (id) => {
						setLocale(id);
						setOpen(false);
					},
					align: "end",
					portal: true,
					anchor: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: LanguageRow_module_css_default.selector,
						"aria-haspopup": "menu",
						"aria-expanded": open,
						onClick: () => {
							setOpen((v) => !v);
						},
						children: [activeLabel, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: LanguageRow_module_css_default.chevron })]
					})
				})]
			});
		}
		//#endregion
		//#region lib/types/client/settings-store.js
		/**
		* Language row slot store: a mirror of the locale service snapshot. The
		* plugin's apply-world change listener is the only writer; the row component
		* reads via props.useStore.
		*/
		/**
		* Declares the Language row state and write surface.
		* @returns the store handle.
		*/
		function createLanguageRowStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({
					active: "",
					options: [],
					revision: -1
				}),
				actions: { sync: (d, active, options, revision) => {
					if (revision <= d.revision) return;
					d.active = active;
					d.options = options;
					d.revision = revision;
				} }
			});
		}
		//#endregion
		//#region lib/types/client/index.js
		/**
		* English is both the locale the UI opens in when the browser names no registered
		* language (and for non-browser runs), and the dictionary consulted after the
		* active locale misses a key. One constant serves both because the shipped
		* `zh`/`en` dictionaries carry identical key sets, so neither direction can
		* leave a key unresolved; the residual case points at English rather than
		* zh because a browser naming no registered language is the reader least
		* likely to read Chinese.
		*/
		const FALLBACK_LOCALE = "en";
		/** Shared namespace for shell-level texts. */
		const COMMON_NS = "common";
		/** Namespace owning this feature's settings-row copy. */
		const SETTINGS_NS = "settings.locale";
		/** The baseline locales required by typed dictionary registrations. */
		const BUILT_IN_LOCALE_METADATA = {
			zh: {
				label: "中文",
				fallback: "en"
			},
			en: { label: "English" }
		};
		const BUILT_IN_LOCALES = Object.freeze(LOCALE_IDS.map((id) => Object.freeze({
			id,
			...BUILT_IN_LOCALE_METADATA[id]
		})));
		/** Case-insensitive key for BCP 47-style ids. */
		function localeKey(value) {
			return value.toLowerCase();
		}
		/** Validate and detach a language-pack contribution from its mutable input. */
		function normalizeLanguage(input) {
			if (!LOCALE_ID_PATTERN.test(input.id)) throw new Error(`locale id "${input.id}" is not a BCP 47-style tag`);
			if (input.label.trim() === "") throw new Error("locale label must not be empty");
			if (!LOCALE_ID_PATTERN.test(input.fallback)) throw new Error(`locale fallback "${input.fallback}" is not a BCP 47-style tag`);
			return Object.freeze({
				id: input.id,
				label: input.label,
				fallback: input.fallback
			});
		}
		/**
		* Point `<html lang>` at the active locale, keeping the served document in
		* sync with locale snapshot changes.
		* @param snapshot - current locale state, including the active definition.
		*/
		function syncDocumentLanguage(snapshot) {
			if (typeof document === "undefined") return;
			const language = snapshot.active === "zh" ? "zh-CN" : snapshot.active;
			if (document.documentElement.lang !== language) document.documentElement.lang = language;
		}
		/**
		* Dictionary registry plus locale preference. Lookup walks the active
		* language's declared fallback chain in the entry namespace, then repeats it
		* in the shared common namespace before showing the key itself. Reads go
		* through {@link getLocale}; preferences change only through
		* {@link setLocale}, while language packs extend the catalog through
		* {@link addLanguage}. Continuous sync uses the `locale/change` event or
		* the LocaleFace getSnapshot/subscribe pair installed through
		* `ctx.slots.installLocale`.
		*/
		var LocaleRuntime = class {
			bootstrap;
			dicts = /* @__PURE__ */ new Map();
			bound = /* @__PURE__ */ new Map();
			catalog = /* @__PURE__ */ new Map();
			fallbackChains = /* @__PURE__ */ new Map();
			snapshot;
			listeners = /* @__PURE__ */ new Set();
			ctx;
			host;
			/** Browser-derived locale standing wherever no explicit Host selection does. */
			provisional;
			/** Last explicit selection, including one awaiting an external registration. */
			preference;
			/**
			* @param ctx - owning context (change events are emitted on it; the scope
			* listener is released through ctx.effect on dispose).
			* @param host - durable preference scope owned by the providing plugin;
			* absent compositions (standalone dictionary registries) stay process-local.
			* @param bootstrap - native initialization; absent in ordinary browsers.
			*/
			constructor(ctx, host, bootstrap) {
				this.bootstrap = bootstrap;
				this.ctx = ctx;
				this.host = host;
				for (const locale of BUILT_IN_LOCALES) this.catalog.set(localeKey(locale.id), locale);
				const locales = this.localeList();
				this.provisional = resolveInitialLocale(locales, bootstrap?.languages);
				this.preference = bootstrap?.preference ?? void 0;
				this.snapshot = Object.freeze({
					active: this.resolveActive(),
					locales,
					revision: 0
				});
				if (host !== void 0) {
					ctx.effect(() => host.subscribe(() => {
						this.adopt(host);
					}), "locale: settings scope adoption");
					this.adopt(host);
				}
			}
			/**
			* Read the current immutable locale snapshot.
			* @returns the current snapshot (stable reference until the next change).
			*/
			getLocale() {
				return this.snapshot;
			}
			/**
			* Resolve package text through the active language's declared fallback chain.
			* Plain strings stay verbatim; maps do not consult registered dictionaries.
			* @param text - package text whose locale keys are lowercase and include English.
			* @returns the first available translation, including an empty string.
			*/
			resolveText(text) {
				if (typeof text === "string") return text;
				return this.fallbackChain(this.snapshot.active).reduceRight((resolved, locale) => text[localeKey(locale)] ?? resolved, text.en);
			}
			/**
			* LocaleFace getSnapshot: the current snapshot (carries `revision`; stable
			* reference between changes, uSES-safe).
			* @returns the current snapshot.
			*/
			getSnapshot() {
				return this.snapshot;
			}
			/**
			* LocaleFace subscribe: notified on every snapshot change (locale switch
			* or dictionary registration — registrations bump the revision so already
			* rendered outlets pick up late-arriving dictionaries and locale definitions).
			* @param fn - change callback.
			* @returns unsubscribe.
			*/
			subscribe(fn) {
				this.listeners.add(fn);
				return () => {
					this.listeners.delete(fn);
				};
			}
			/**
			* Switch the active locale — the only user preference write entry.
			*
			* The durable write happens even when the id already matches the active
			* locale, because the active value may be a provisional browser-derived or
			* fallback resolution that nothing has stored yet. Picking the language
			* already on screen is still an explicit choice, and it must survive a
			* different browser sharing the same DSH home. Only the render notification
			* is conditional: republishing an unchanged locale would churn every
			* subscriber for nothing.
			* @param id - a registered locale id; unknown ids throw.
			*/
			setLocale(id) {
				const match = this.catalog.get(localeKey(id));
				if (match === void 0) throw new Error(`locale "${id}" is not registered`);
				this.preference = match.id;
				if (this.snapshot.active !== match.id) this.publish(match.id, true);
				this.host?.set(LOCALE_PREFERENCE_FIELD, match.id);
			}
			/**
			* Add one selectable language to the shared catalog. Its fallback must
			* already be registered, and following fallback definitions must terminate
			* at English. Dictionaries may register before or after this definition.
			* Registration rechecks an unresolved Host preference and the browser's
			* ordered language list. The caller owns the returned disposer; removing an
			* active language falls back without clearing the stored id.
			* @param input - stable id, self-described label, and fallback language id.
			* @returns idempotent disposer removing this exact definition.
			* @throws when fields are malformed, the id is occupied, or the fallback
			* target is unknown or creates a cycle.
			*/
			addLanguage(input) {
				const candidate = normalizeLanguage(input);
				const key = localeKey(candidate.id);
				if (this.catalog.has(key)) throw new Error(`locale "${candidate.id}" is already registered`);
				const fallback = this.catalog.get(localeKey(candidate.fallback));
				if (fallback === void 0) throw new Error(`locale fallback "${candidate.fallback}" is not registered`);
				const language = Object.freeze({
					...candidate,
					fallback: fallback.id
				});
				this.catalog.set(key, language);
				try {
					this.assertFallbackChain(language.id);
				} catch (error) {
					this.catalog.delete(key);
					throw error;
				}
				this.publishCatalog();
				return () => {
					if (this.catalog.get(key) !== language) return;
					this.catalog.delete(key);
					this.publishCatalog();
				};
			}
			/**
			* Adopt the scope's accepted durable selection without writing it back; an
			* absent selection returns to the browser-derived locale.
			* @param host - the constructor-narrowed scope driving this adoption.
			*/
			adopt(host) {
				const section = host.getSnapshot().value;
				if (section === void 0) return;
				this.preference = section.preference;
				const target = this.resolveActive();
				if (this.snapshot.active === target) return;
				this.publish(target, true);
			}
			/** Recompute browser fallback and publish the current catalog. */
			publishCatalog() {
				this.fallbackChains.clear();
				const locales = this.localeList();
				this.provisional = resolveInitialLocale(locales, this.bootstrap?.languages);
				const active = this.resolveActive();
				this.publish(active, active !== this.snapshot.active, locales);
			}
			/** Resolve an explicit preference only while its definition is available. */
			resolveActive() {
				if (this.preference === void 0) return this.provisional;
				return this.catalog.get(localeKey(this.preference))?.id ?? this.provisional;
			}
			/** Snapshot the catalog in registration order. */
			localeList() {
				return Object.freeze([...this.catalog.values()]);
			}
			/** Fail a new definition whose complete fallback path does not reach English. */
			assertFallbackChain(start) {
				const seen = /* @__PURE__ */ new Set();
				let current = this.catalog.get(localeKey(start));
				while (current !== void 0) {
					const key = localeKey(current.id);
					if (seen.has(key)) throw new Error(`locale fallback cycle includes "${current.id}"`);
					seen.add(key);
					if (key === localeKey("en")) return;
					/* v8 ignore next -- English is the only built-in terminal and every
					* language accepted by addLanguage has a required fallback. */
					if (current.fallback === void 0) throw new Error(`locale "${current.id}" fallback chain does not reach "en"`);
					const next = this.catalog.get(localeKey(current.fallback));
					if (next === void 0) throw new Error(`locale fallback "${current.fallback}" is not registered`);
					current = next;
				}
			}
			/** Resolve a lookup chain, falling directly to English across an unload gap. */
			fallbackChain(start) {
				const startKey = localeKey(start);
				const cached = this.fallbackChains.get(startKey);
				if (cached !== void 0) return cached;
				const chain = [];
				const seen = /* @__PURE__ */ new Set();
				let current = this.catalog.get(startKey);
				while (current !== void 0 && !seen.has(localeKey(current.id))) {
					const key = localeKey(current.id);
					seen.add(key);
					chain.push(current.id);
					current = current.fallback === void 0 ? void 0 : this.catalog.get(localeKey(current.fallback));
				}
				if (!seen.has(localeKey("en"))) chain.push("en");
				const resolved = Object.freeze(chain);
				this.fallbackChains.set(startKey, resolved);
				return resolved;
			}
			register(ns, localeOrDicts, dict) {
				const pairs = typeof localeOrDicts === "string" ? [[localeOrDicts, dict]] : Object.entries(localeOrDicts);
				for (const [locale] of pairs) if (!LOCALE_ID_PATTERN.test(locale)) throw new Error(`locale id "${locale}" is not a BCP 47-style tag`);
				let locales = this.dicts.get(ns);
				if (!locales) {
					locales = /* @__PURE__ */ new Map();
					this.dicts.set(ns, locales);
				}
				for (const [locale] of pairs) if (locales.has(localeKey(locale))) throw new Error(`locale namespace "${ns}" already has locale "${locale}"`);
				for (const [locale, entries] of pairs) locales.set(localeKey(locale), entries);
				this.publish(this.snapshot.active, false);
				return () => {
					const owner = this.dicts.get(ns);
					/* v8 ignore next -- defensive: a namespace's locales map is created on
					* first register and never removed, so the disposer always finds it. */
					if (!owner) return;
					let removed = false;
					for (const [locale, entries] of pairs) {
						const key = localeKey(locale);
						if (owner.get(key) === entries) {
							owner.delete(key);
							removed = true;
						}
					}
					if (removed) this.publish(this.snapshot.active, false);
				};
			}
			bind(ns) {
				let t = this.bound.get(ns);
				if (!t) {
					t = (key, params) => this.translate(ns, key, params);
					this.bound.set(ns, t);
					return t;
				}
				return t;
			}
			translate(ns, key, params) {
				const chain = this.fallbackChain(this.snapshot.active);
				const template = this.lookup(ns, key, chain) ?? (ns !== "common" ? this.lookup("common", key, chain) : void 0) ?? key;
				if (!params) return template;
				return template.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match);
			}
			lookup(ns, key, chain) {
				const locales = this.dicts.get(ns);
				for (const locale of chain) {
					const value = locales?.get(localeKey(locale))?.[key];
					if (value !== void 0) return value;
				}
			}
			/**
			* Advance the snapshot revision and notify LocaleFace subscribers (render
			* refresh). Only an active-locale switch additionally emits
			* `locale/change` — dictionary registrations stay off the event so
			* registration-heavy boot cannot storm event listeners (which may
			* re-register slots in response).
			*/
			publish(active, localeChanged, locales = this.snapshot.locales) {
				this.snapshot = Object.freeze({
					active,
					locales,
					revision: this.snapshot.revision + 1
				});
				if (localeChanged) this.ctx.emit("locale/change", this.snapshot);
				for (const fn of [...this.listeners]) try {
					fn();
				} catch (error) {
					console.error("locale subscriber crashed:", error);
				}
			}
		};
		/**
		* The browser's own language wins over {@link FALLBACK_LOCALE}; an explicit
		* Host preference may replace this provisional value after plugin activation.
		*/
		function resolveInitialLocale(locales, languages) {
			return detectBrowserLocale(locales, languages) ?? "en";
		}
		/**
		* The first registered locale the browser asks for. Each browser tag first
		* matches a locale id exactly, then its primary subtag, so an exact regional
		* registration wins before a language-wide fallback.
		* `window` is the browser test, not `navigator`: Node exposes a global
		* `navigator` reporting the machine's own language, which must not decide the
		* locale for non-browser runs. `navigator.language` trails the ordered
		* `languages` list and covers hosts exposing only the single tag.
		* @param locales - definitions currently available to the browser.
		* @param languages - native system language order, when supplied by a shell.
		* @returns the first matching locale id, or undefined.
		*/
		function detectBrowserLocale(locales, languages) {
			if (languages === void 0) {
				if (typeof window === "undefined") return void 0;
				languages = [...navigator.languages ?? [], navigator.language];
			}
			for (const tag of languages) {
				const requested = localeKey(tag);
				const exact = locales.find((locale) => localeKey(locale.id) === requested);
				if (exact !== void 0) return exact.id;
				const primary = requested.split("-")[0];
				const match = locales.find((locale) => localeKey(locale.id).split("-")[0] === primary);
				if (match !== void 0) return match.id;
			}
		}
		/** Required services: slot registration plus the settings transport. */
		const inject = [
			"slots",
			"remote",
			"configForms"
		];
		/**
		* Client plugin body: provide the locale service with base dictionaries and
		* register the feature-owned Language preference row into the General
		* section's item slot (a feature owns its settings surface).
		* @param ctx - client cordis context.
		* @returns resolves after native language initialization and plugin registration.
		*/
		async function apply(ctx) {
			const bridge = globalThis.__DSH_LOCALE__;
			let bootstrap;
			if (bridge !== void 0) {
				let value;
				try {
					value = await bridge.read();
				} catch (error) {
					if (ctx.fiber.uid === null) return;
					throw error;
				}
				if (ctx.fiber.uid === null) return;
				bootstrap = parseLocaleBootstrap(value);
			}
			const locale = new LocaleRuntime(ctx, ctx.configForms.get(LOCALE_SETTINGS_NAMESPACE), bootstrap);
			for (const [id, label] of [
				["ja", "日本語"],
				["es", "Español"],
				["fr", "Français"],
				["de", "Deutsch"],
				["ru", "Русский"],
				["pt", "Português"]
			]) ctx.effect(() => locale.addLanguage({
				id,
				label,
				fallback: "en"
			}), `locale: ${id} language`);
			ctx.effect(() => locale.register(COMMON_NS, {
				zh: zh$1,
				en: en$1,
				ja: ja$1,
				es: es$1,
				fr: fr$1,
				de: de$1,
				ru: ru$1,
				pt: pt$1
			}), "locale: common dictionaries");
			ctx.effect(() => locale.register(SETTINGS_NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "locale: settings dictionaries");
			ctx.provide("locale", locale);
			if (bridge !== void 0) {
				ctx.on("locale/change", (snapshot) => {
					bridge.onChange(snapshot.active);
				});
				bridge.onChange(locale.getSnapshot().active);
			}
			ctx.slots.installLocale(locale);
			const store = createLanguageRowStore();
			let bound;
			const sync = () => {
				const snapshot = locale.getSnapshot();
				syncDocumentLanguage(snapshot);
				bound?.sync(snapshot.active, snapshot.locales.map((l) => ({
					id: l.id,
					label: l.label
				})), snapshot.revision);
			};
			ctx.effect(() => locale.subscribe(sync), "locale: language row and document synchronization");
			sync();
			const injected = (actions) => {
				bound = actions;
				sync();
				return { setLocale: (id) => {
					locale.setLocale(id);
				} };
			};
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "language",
				order: 0,
				store,
				locale: SETTINGS_NS,
				inject: injected
			}, LanguageRow));
		}
		//#endregion
		exports.COMMON_NS = COMMON_NS;
		exports.FALLBACK_LOCALE = FALLBACK_LOCALE;
		exports.LocaleRuntime = LocaleRuntime;
		exports.SETTINGS_NS = SETTINGS_NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map