window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-connection",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
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
		//#region lib/types/recovery-config.js
		/** Shared validation for Host-configured and browser-local connection recovery. */
		const MAX_TIMER_MS = 2147483647;
		/** Schema shared by the Host plugin and the Client's recovery input parser. */
		const ConnectionRecoveryConfigSchema = Schema.object({
			backoffBaseMs: Schema.natural().min(1).max(MAX_TIMER_MS).default(500),
			backoffFactor: Schema.number().min(1).max(Number.MAX_VALUE).default(2),
			backoffMaxMs: Schema.natural().min(1).max(MAX_TIMER_MS).default(1e4),
			generationReadyWarnMs: Schema.natural().min(1).max(MAX_TIMER_MS).default(3e3),
			generationReadyTimeoutMs: Schema.natural().min(1).max(MAX_TIMER_MS).default(15e3)
		});
		/**
		* Validate recovery input and supply every timing default before starting work.
		* @param config - Host configuration, page bootstrap data, or direct loop options.
		* @returns validated, complete recovery timing.
		*/
		function resolveConnectionConfig(config = {}) {
			const resolved = ConnectionRecoveryConfigSchema(config);
			if (!Number.isFinite(resolved.backoffFactor)) throw new RangeError("connection recovery backoffFactor must be finite");
			return resolved;
		}
		//#endregion
		//#region lib/types/client/connection.js
		/** Connection generation readiness, cancellation, and continuous recovery. */
		const MANUAL_RECONNECT = /* @__PURE__ */ new Error("connection: manual reconnect requested");
		const NETWORK_STATE_CHANGED = /* @__PURE__ */ new Error("connection: browser network state changed");
		function sleep(ms, signal) {
			return new Promise((resolve) => {
				const t = setTimeout(done, ms);
				signal.addEventListener("abort", done, { once: true });
				function done() {
					clearTimeout(t);
					signal.removeEventListener("abort", done);
					resolve();
				}
			});
		}
		function waitForAbort(signal) {
			if (signal.aborted) return Promise.resolve();
			return new Promise((resolve) => {
				signal.addEventListener("abort", () => {
					resolve();
				}, { once: true });
			});
		}
		/**
		* Opens the registered generation source, reconnecting with exponential backoff on loss.
		* State (generation/attempt) is instance-private, never in the store.
		* Sink exceptions do not kill the generation loop.
		*/
		var ConnectionController = class {
			source;
			sinks;
			generation = 0;
			attempt = 0;
			current = null;
			retryDelay = null;
			running = false;
			immediateRetry = false;
			networkAvailable = true;
			lastState;
			config;
			constructor(source, sinks = {}, config = {}) {
				this.source = source;
				this.sinks = sinks;
				this.config = resolveConnectionConfig(config);
			}
			/** Idempotent: begin the connect/pump/reconnect loop. */
			start() {
				if (this.running) return;
				this.running = true;
				this.loop();
			}
			/** Stop the loop and abort the current generation source. */
			stop() {
				this.running = false;
				this.current?.abort();
				this.current = null;
				this.retryDelay?.abort();
				this.retryDelay = null;
			}
			/** Reset the retry sequence and replace the current generation or retry delay immediately. */
			reconnect() {
				if (!this.running) return;
				this.attempt = 0;
				this.immediateRetry = true;
				this.emitState("connecting");
				if (!this.isRunning()) return;
				this.current?.abort(MANUAL_RECONNECT);
				this.retryDelay?.abort(MANUAL_RECONNECT);
			}
			/**
			* Suspend automatic retries while offline and restart backoff when the network returns.
			* @param available - whether the browser reports network access.
			*/
			setNetworkAvailable(available) {
				if (this.networkAvailable === available) return;
				this.networkAvailable = available;
				this.attempt = 0;
				this.immediateRetry = false;
				if (!this.running) return;
				this.emitState(available ? "connecting" : "disconnected");
				if (!this.isRunning()) return;
				this.current?.abort(NETWORK_STATE_CHANGED);
				this.retryDelay?.abort(NETWORK_STATE_CHANGED);
			}
			backoffCap(attempt) {
				const { backoffBaseMs, backoffFactor, backoffMaxMs } = this.config;
				return Math.min(backoffMaxMs, backoffBaseMs * backoffFactor ** Math.max(0, attempt - 1));
			}
			backoffDelay(attempt) {
				const cap = this.backoffCap(attempt);
				return cap / 2 + Math.random() * (cap / 2);
			}
			/** Re-read retry inputs after a potentially reentrant state sink. */
			isRetryInterrupted(immediate) {
				return this.immediateRetry || !this.networkAvailable && !immediate;
			}
			/** Read through a method: stop() flips the flag across awaits, so narrowing from the loop condition must not stick. */
			isRunning() {
				return this.running;
			}
			/** Re-read both mutable liveness guards after a potentially reentrant sink. */
			isGenerationActive(controller) {
				return this.isRunning() && !controller.signal.aborted;
			}
			async loop() {
				let retry = false;
				while (this.running) {
					if (!this.networkAvailable && !this.immediateRetry) {
						const retryDelay = new AbortController();
						this.retryDelay = retryDelay;
						this.emitState("disconnected");
						await waitForAbort(retryDelay.signal);
						if (this.retryDelay === retryDelay) this.retryDelay = null;
						if (!this.isRunning()) return;
						retry = true;
						continue;
					}
					let manualAttempt = false;
					if (retry) {
						const immediate = this.immediateRetry;
						this.immediateRetry = false;
						if (immediate) this.attempt = 0;
						manualAttempt = immediate;
						const attempt = ++this.attempt;
						this.emitState("connecting");
						if (!this.isRunning()) return;
						if (this.isRetryInterrupted(immediate)) continue;
						if (!immediate) {
							const retryDelay = new AbortController();
							this.retryDelay = retryDelay;
							await sleep(this.backoffDelay(attempt), retryDelay.signal);
							if (this.retryDelay === retryDelay) this.retryDelay = null;
							if (!this.isRunning()) return;
							if (retryDelay.signal.aborted) continue;
						}
						console.warn(`[connection] connection lost, retry #${String(attempt)}`);
						this.callSink(() => {
							this.sinks.onReconnectRequested?.();
						});
						if (!this.isRunning()) return;
					}
					const gen = ++this.generation;
					const ac = new AbortController();
					this.current = ac;
					let sourceReady = false;
					let resolveReady;
					let rejectReady;
					let rejectSourceLost;
					const ready = new Promise((resolve, reject) => {
						resolveReady = resolve;
						rejectReady = reject;
					});
					const sourceLost = new Promise((_resolve, reject) => {
						rejectSourceLost = reject;
					});
					const reportReady = (host) => {
						if (sourceReady || gen !== this.generation || !this.isGenerationActive(ac)) return;
						sourceReady = true;
						resolveReady(host);
					};
					const failed = new Promise((resolve) => {
						const settle = () => {
							if (gen === this.generation && !ac.signal.aborted) ac.abort();
							resolve();
						};
						Promise.resolve().then(() => this.source(ac.signal, reportReady)).then(() => {
							const error = /* @__PURE__ */ new Error("connection generation ended");
							if (!sourceReady) rejectReady(error);
							rejectSourceLost(error);
							settle();
						}, (error) => {
							const failure = error instanceof Error ? error : new Error("connection generation failed", { cause: error });
							if (!sourceReady) rejectReady(failure);
							rejectSourceLost(failure);
							settle();
						});
					});
					try {
						const host = await Promise.race([waitForReady(ready, this.config, ac.signal), sourceLost]);
						if (ac.signal.aborted) throw new Error("generation aborted during readiness handshake");
						this.attempt = 0;
						this.emitState("connected");
						if (this.isGenerationActive(ac)) this.callSink(() => {
							this.sinks.onConnected?.(host);
						});
					} catch (error) {
						if (!ac.signal.aborted) ac.abort(error);
					}
					await failed;
					if (!this.isRunning()) return;
					if (manualAttempt) this.attempt = 0;
					retry = true;
				}
			}
			/** Deduplicated state emission (sink isolation applies). */
			emitState(state) {
				if (this.lastState === state) return;
				this.lastState = state;
				this.callSink(() => this.sinks.onStateChange?.(state));
			}
			/** Sink exception isolation: a business-layer throw is logged only, never affecting pump or reconnect semantics. */
			callSink(fn) {
				try {
					fn();
				} catch (error) {
					console.error("[connection] connection sink threw:", error);
				}
			}
		};
		/** Report a slow handshake before the hard deadline ends its generation. */
		function waitForReady(ready, config, signal) {
			return new Promise((resolve, reject) => {
				let settled = false;
				const warning = setTimeout(() => {
					console.warn(`[connection] generation is still not ready after ${String(config.generationReadyWarnMs)}ms`);
				}, config.generationReadyWarnMs);
				const timeout = setTimeout(() => {
					const error = /* @__PURE__ */ new Error(`connection generation was not ready within ${String(config.generationReadyTimeoutMs)}ms`);
					console.warn(`[connection] ${error.message}; cancelling generation`);
					finish({ error });
				}, config.generationReadyTimeoutMs);
				const aborted = () => {
					finish({ error: new Error("connection generation aborted", { cause: signal.reason }) });
				};
				const finish = (outcome) => {
					if (settled) return;
					settled = true;
					clearTimeout(warning);
					clearTimeout(timeout);
					signal.removeEventListener("abort", aborted);
					if ("error" in outcome) reject(outcome.error);
					else resolve(outcome.value);
				};
				signal.addEventListener("abort", aborted, { once: true });
				ready.then((value) => {
					finish({ value });
				}, (error) => {
					finish({ error });
				});
			});
		}
		//#endregion
		//#region lib/types/rpc.js
		/** Generic unary RPC contracts shared by the Host and Client Connection halves. */
		/**
		* Brand one validated string as a Connection correlation id.
		* @param id - validated wire identity.
		* @returns the same string with the correlation-id brand.
		*/
		function RpcId(id) {
			return id;
		}
		/**
		* Convert a rejected transport operation into a generic failure result.
		* @param error - rejected transport value.
		* @returns an `internal` failure preserving the available message.
		*/
		function transportError(error) {
			return {
				ok: false,
				error: {
					code: "gateway/internal",
					message: error instanceof Error ? error.message : String(error),
					details: {}
				}
			};
		}
		//#endregion
		//#region lib/types/client/random-uuid.js
		/** Browser-safe UUID generation for client-side wire correlation. */
		/**
		* Generate an RFC 4122 version 4 UUID without requiring a secure context.
		* @returns a UUID backed by `crypto.getRandomValues()`, which browsers expose on insecure origins.
		*/
		function randomUuid() {
			const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
			const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
			view.setUint8(6, view.getUint8(6) & 15 | 64);
			view.setUint8(8, view.getUint8(8) & 63 | 128);
			const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
			return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
		}
		//#endregion
		//#region lib/types/client/rpc.js
		/** Browser caller for generic Connection unary RPC channels. */
		const CHANNEL_PATTERN = /^\/[A-Za-z0-9._~-]+$/;
		const ENDPOINT_SEGMENT_PATTERN = /^[A-Za-z0-9_$.-]+$/;
		/**
		* Create the browser-backed generic RPC caller.
		* @param doFetch - transport override; defaults to the page's global fetch.
		* @param openStream - optional worker-local Gateway stream carrier.
		* @returns caller that owns request correlation and response-envelope validation.
		*/
		function createWebConnectionRpc(doFetch, openStream) {
			const send = doFetch ?? ((input, init) => globalThis.fetch(input, init));
			return {
				async call(channel, endpoint, payload, signal) {
					assertTarget(channel, endpoint);
					const rpcId = RpcId(randomUuid());
					const message = {
						type: "client-request",
						rpcId,
						method: endpoint,
						payload
					};
					const response = await send(`${channel}/${endpoint}`.slice(1), {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify(message),
						...signal === void 0 ? {} : { signal }
					});
					if (!response.ok) throw new Error(`transport failure for ${channel}/${endpoint}: HTTP ${response.status}`);
					const full = response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() === "multipart/form-data" ? await parseBinaryResponse(response) : parseConnectionResponse(await response.json());
					signal?.throwIfAborted();
					if (full.rpcId !== rpcId) throw new Error(`rpcId mismatch for ${endpoint}: sent ${rpcId}, got ${full.rpcId}`);
					return full.result;
				},
				...openStream === void 0 ? {} : { open(channel, endpoint, payload, signal, uplink) {
					assertTarget(channel, endpoint);
					if (channel !== "/api") throw new Error(`connection: worker-local streams require the /api channel, got ${JSON.stringify(channel)}`);
					return openStream(endpoint, payload, signal, uplink);
				} }
			};
		}
		async function parseBinaryResponse(response) {
			const body = await response.formData();
			const fields = /* @__PURE__ */ new Map();
			for (const [name, value] of body) {
				if (fields.has(name)) throw new TypeError("connection: invalid binary response fields");
				fields.set(name, value);
			}
			const metadata = fields.get("metadata");
			fields.delete("metadata");
			if (typeof metadata !== "string") throw new TypeError("connection: invalid binary response fields");
			const envelope = JSON.parse(metadata);
			const full = parseConnectionResponse(envelope);
			if (!full.result.ok || !isRecord(envelope) || !Array.isArray(envelope.attachments) || envelope.attachments.length === 0) throw new TypeError("connection: invalid binary response result");
			const root = { value: full.result.value };
			for (const attachment of envelope.attachments) {
				if (!isRecord(attachment) || attachment.codec !== "bytes" || typeof attachment.part !== "string" || !Array.isArray(attachment.path)) throw new TypeError("connection: invalid binary response attachment");
				const data = fields.get(attachment.part);
				fields.delete(attachment.part);
				if (!(data instanceof Blob)) throw new TypeError("connection: invalid binary response fields");
				let parent = root;
				let key = "value";
				for (const segment of attachment.path) {
					const value = Reflect.get(parent, key);
					if (typeof value !== "object" || value === null) throw new TypeError("connection: invalid binary response path");
					if (Array.isArray(value)) {
						if (typeof segment !== "number" || !Number.isSafeInteger(segment) || segment < 0 || segment >= value.length) throw new TypeError("connection: invalid binary response path");
					} else if (typeof segment !== "string") throw new TypeError("connection: invalid binary response path");
					if (!Object.hasOwn(value, segment)) throw new TypeError("connection: invalid binary response path");
					parent = value;
					key = segment;
				}
				if (Reflect.get(parent, key) !== null) throw new TypeError("connection: invalid binary response placeholder");
				Object.defineProperty(parent, key, {
					value: new Uint8Array(await data.arrayBuffer()),
					enumerable: true,
					writable: true,
					configurable: true
				});
			}
			if (fields.size !== 0) throw new TypeError("connection: invalid binary response fields");
			return {
				rpcId: full.rpcId,
				result: {
					ok: true,
					value: root.value
				}
			};
		}
		function parseConnectionResponse(value) {
			if (!isRecord(value) || value.type !== "server-response" || typeof value.rpcId !== "string") throw new TypeError("connection: invalid server-response envelope");
			const result = value.result;
			if (!isRecord(result)) throw new TypeError("connection: invalid server-response result");
			if (result.ok === true) return {
				rpcId: RpcId(value.rpcId),
				result: {
					ok: true,
					value: result.value
				}
			};
			if (result.ok !== false || !isRecord(result.error)) throw new TypeError("connection: invalid server-response result");
			const error = result.error;
			if (typeof error.code !== "string" || typeof error.message !== "string" || !isRecord(error.details)) throw new TypeError("connection: invalid server-response failure");
			return {
				rpcId: RpcId(value.rpcId),
				result: {
					ok: false,
					error: {
						code: error.code,
						message: error.message,
						details: error.details
					}
				}
			};
		}
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		function assertTarget(channel, endpoint) {
			const segments = endpoint.split("/");
			if (!CHANNEL_PATTERN.test(channel) || segments.some((segment) => segment === "" || segment === "." || segment === ".." || !ENDPOINT_SEGMENT_PATTERN.test(segment))) throw new Error(`connection: invalid RPC target ${JSON.stringify(`${channel}/${endpoint}`)}`);
		}
		//#endregion
		//#region lib/types/loopback-hostname.js
		/**
		* Browser-safe, zero-dependency loopback classification shared by the `/api`
		* Host fence and the package's `ctx.connection` state. The predicate stays
		* package-internal; client plugins consume the derived state through Cordis.
		*/
		/**
		* Whether a normalized URL hostname names the local loopback authority.
		* @param hostname - WHATWG URL hostname (IPv6 literals retain brackets).
		* @returns true for localhost, IPv6 loopback, or any IPv4 address in 127/8.
		*/
		function isLoopbackHostname(hostname) {
			if (hostname === "localhost" || hostname === "[::1]") return true;
			const parts = hostname.split(".");
			return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
		}
		//#endregion
		//#region lib/types/client/socket.js
		/** Physical socket selection for browser, desktop, and authenticated Node connections. */
		/**
		* Resolve a logical channel against the explicit Host or the page's document base.
		* @param path - absolute logical channel path.
		* @param factory - authenticated socket factory; omission uses the browser API.
		* @param baseUrl - Host base URL, required outside a document.
		* @returns a socket owned by the calling channel.
		*/
		function openConnectionWebSocket(path, factory = (url) => new WebSocket(url), baseUrl) {
			const base = baseUrl ?? (typeof document === "undefined" ? void 0 : document.baseURI);
			if (base === void 0) throw new Error("connection: WebSocket carrier requires streamBaseUrl outside a document");
			const url = new URL(path.slice(1), base);
			url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
			return factory(url.href);
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Required services (none — this is the wire root). */
		const inject = [];
		function watchBrowserNetwork(controller) {
			const browser = globalThis.window;
			const initiallyAvailable = browser?.navigator?.onLine;
			if (browser === void 0 || initiallyAvailable === void 0) return () => {};
			const online = () => {
				controller.setNetworkAvailable(true);
			};
			const offline = () => {
				controller.setNetworkAvailable(false);
			};
			controller.setNetworkAvailable(initiallyAvailable);
			browser.addEventListener("online", online);
			browser.addEventListener("offline", offline);
			return () => {
				browser.removeEventListener("online", online);
				browser.removeEventListener("offline", offline);
			};
		}
		/**
		* Install one Context-owned Connection service from explicit composition inputs.
		* @param ctx - client Cordis context.
		* @param options - interaction participation, physical carrier, reconnect timing, and page location.
		*/
		function installConnection(ctx, options = {}) {
			const pageLocation = options.location;
			const transport = options.transport;
			const recovery = options.recovery ?? {};
			const interactions = options.interactions ?? (pageLocation === void 0 ? "none" : "answer");
			const rpc = transport?.rpc ?? createWebConnectionRpc(transport?.fetch, transport?.openStream);
			let generationSource;
			let owner;
			let generationId = 0;
			let generation;
			let state;
			const generationListeners = /* @__PURE__ */ new Set();
			const stateListeners = /* @__PURE__ */ new Set();
			const publishGeneration = (next) => {
				if (Object.is(generation, next)) return;
				generation = next;
				for (const listener of [...generationListeners]) try {
					listener();
				} catch (error) {
					console.error("[connection] generation listener threw:", error);
				}
			};
			const publishState = (next) => {
				if (state === next) return;
				state = next;
				for (const listener of [...stateListeners]) try {
					listener();
				} catch (error) {
					console.error("[connection] state listener threw:", error);
				}
			};
			const releaseOwner = (current) => {
				if (owner !== current) return;
				owner = void 0;
				current.stopNetworkWatch();
				current.controller.stop();
				publishGeneration(void 0);
				publishState(void 0);
			};
			const handle = {
				interactions,
				openWebSocket: (path) => openConnectionWebSocket(path, transport?.createWebSocket, transport?.streamBaseUrl),
				isLoopback: transport?.ownsHost === true || pageLocation === void 0 || isLoopbackHostname(pageLocation.hostname),
				generation: {
					getSnapshot: () => generation,
					subscribe: (listener) => {
						generationListeners.add(listener);
						return () => {
							generationListeners.delete(listener);
						};
					}
				},
				state: {
					getSnapshot: () => state,
					subscribe: (listener) => {
						stateListeners.add(listener);
						return () => {
							stateListeners.delete(listener);
						};
					}
				},
				rpc,
				reconnect() {
					owner?.controller.reconnect();
				},
				registerGenerationSource(source) {
					if (generationSource !== void 0) throw new Error("connection: a generation source is already registered");
					generationSource = source;
					return () => {
						if (generationSource !== source) return;
						generationSource = void 0;
						const current = owner;
						if (current?.source === source) releaseOwner(current);
					};
				},
				start(sinks, config) {
					if (owner !== void 0) throw new Error("connection: the stream loop is already owned by another consumer");
					const source = generationSource;
					if (source === void 0) throw new Error("connection: no generation source is registered");
					const token = {};
					const ownsGeneration = () => owner?.token === token;
					const controller = new ConnectionController(source, {
						...sinks,
						onConnected: (host) => {
							const nextGeneration = {
								id: ++generationId,
								host
							};
							publishGeneration(nextGeneration);
							if (!ownsGeneration() || !Object.is(generation, nextGeneration)) return;
							sinks.onConnected?.(host);
						},
						onStateChange: (state) => {
							if (state !== "connected") publishGeneration(void 0);
							if (!ownsGeneration()) return;
							publishState(state);
							sinks.onStateChange?.(state);
						}
					}, {
						...recovery,
						...config
					});
					const current = {
						token,
						source,
						controller,
						stopNetworkWatch: watchBrowserNetwork(controller)
					};
					owner = current;
					controller.start();
					return { stop: () => {
						releaseOwner(current);
					} };
				}
			};
			ctx.provide("connection", handle);
		}
		/**
		* Client plugin body: read the page composition and install its Connection service.
		* @param ctx - client Cordis context.
		*/
		function apply(ctx) {
			const globals = globalThis;
			const pageLocation = typeof location === "undefined" ? void 0 : location;
			const transport = globals.__DSH_TRANSPORT__;
			installConnection(ctx, {
				...transport === void 0 ? {} : { transport },
				recovery: resolveConnectionConfig(globals.__DSH_CONNECTION_RECOVERY__),
				...pageLocation === void 0 ? {} : { location: pageLocation }
			});
		}
		//#endregion
		exports.RpcId = RpcId;
		exports.apply = apply;
		exports.inject = inject;
		exports.installConnection = installConnection;
		exports.transportError = transportError;
		return module.exports;
	}
});

//# sourceMappingURL=client.browser.js.map