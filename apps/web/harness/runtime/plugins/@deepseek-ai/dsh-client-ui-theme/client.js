window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-theme",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react = require("react");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
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
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-theme/src/client/AppearanceRow.module.css.mjs
		const css$3 = ".TFmfsG_group{border-bottom:.5px solid var(--dsw-alias-border-l2);flex-direction:column;gap:8px;padding:16px 0;display:flex}.TFmfsG_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}.TFmfsG_cubeRow{flex-wrap:wrap;align-items:stretch;gap:8px;display:flex}.TFmfsG_themeCube{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-xl);font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;flex-direction:column;flex:180px;justify-content:center;align-items:center;gap:4px;padding:20px 32px;font-size:14px;line-height:22px;display:flex}@media (hover:hover){.TFmfsG_themeCube:hover:not(.TFmfsG_selected){background:var(--dsw-alias-interactive-bg-hover)}}.TFmfsG_selected{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-static-neutral-bluish-400)}@media (width<=767px){html:not([data-windows-titlebar]):not([data-platform=darwin]) .TFmfsG_themeCube{flex:1 1 0;padding:12px 6px}}";
		const tagId$3 = "@deepseek-ai/dsh-client-ui-theme/AppearanceRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-theme";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var AppearanceRow_module_css_default = {
			"cubeRow": "TFmfsG_cubeRow",
			"group": "TFmfsG_group",
			"selected": "TFmfsG_selected",
			"themeCube": "TFmfsG_themeCube",
			"title": "TFmfsG_title"
		};
		//#endregion
		//#region lib/types/client/AppearanceRow.js
		/**
		* Appearance preference row registered into the General section item slot
		* (figma 501:30012 'Frame 2117131228'): title + three preference cubes.
		* Registered by this package — the theme feature owns its own settings
		* surface. Selection follows the persisted preference, never the resolved
		* active theme.
		*/
		/** Cube order and icons (figma 501:30015-30017: Light, Dark, System). */
		const CUBES = [
			{
				id: "light",
				labelKey: "appearance.light",
				Icon: _deepseek_ai_dsh_client_ui_primitives.IconLightOutlineMedium
			},
			{
				id: "dark",
				labelKey: "appearance.dark",
				Icon: _deepseek_ai_dsh_client_ui_primitives.IconDarkOutlineMedium
			},
			{
				id: "system",
				labelKey: "appearance.system",
				Icon: _deepseek_ai_dsh_client_ui_primitives.IconFollowsystemOutlineMedium
			}
		];
		/**
		* Render the Appearance row.
		* @param props - composed slot props.
		* @returns the row element tree.
		*/
		function AppearanceRow({ t, setTheme, useStore }) {
			const preference = useStore((s) => s.preference);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: AppearanceRow_module_css_default.group,
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: AppearanceRow_module_css_default.title,
					children: t("appearance.title")
				}), (0, react_jsx_runtime.jsx)("div", {
					className: AppearanceRow_module_css_default.cubeRow,
					children: CUBES.map(({ id, labelKey, Icon }) => (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: clsx(AppearanceRow_module_css_default.themeCube, preference === id && AppearanceRow_module_css_default.selected),
						"aria-pressed": preference === id,
						onClick: () => {
							setTheme(id);
						},
						children: [(0, react_jsx_runtime.jsx)(Icon, {}), t(labelKey)]
					}, id))
				})]
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
		//#region lib/types/theme-settings.js
		/** Theme preferences stored in the Host user-settings document. */
		/** Built-in preferences accepted at the registry and settings boundaries. */
		const THEME_PREFERENCES = [
			"light",
			"dark",
			"system"
		];
		/** Settings namespace owned by the theme plugin. */
		const THEME_SETTINGS_NAMESPACE = "ui-theme";
		/** Field carrying the selected built-in theme preference. */
		const THEME_PREFERENCE_FIELD = "preference";
		/** Field carrying the conversation content font size. */
		const FONT_SIZE_FIELD = "fontSize";
		/** Default preference when the user-settings document has no override. */
		const DEFAULT_PREFERENCE = "system";
		/** Independently configurable font roles. */
		const FONT_ROLES = [
			"text",
			"code",
			"terminal"
		];
		/**
		* Font sizes by role. `text` is the conversation content size; `code` is the
		* code-block size (inline code stays 1px larger); `terminal` is the sidebar
		* terminal cell font size.
		*/
		const FONT_SIZE_SPECS = {
			text: {
				field: FONT_SIZE_FIELD,
				variable: "--dsh-content-font-size",
				min: 10,
				max: 22,
				default: 14
			},
			code: {
				field: "codeFontSize",
				variable: "--dsh-code-font-size",
				min: 10,
				max: 16,
				default: 11
			},
			terminal: {
				field: "terminalFontSize",
				variable: "--dsh-terminal-font-size",
				min: 10,
				max: 20,
				default: 13
			}
		};
		/** Default font sizes by role. */
		const DEFAULT_FONT_SIZES = Object.freeze({
			text: FONT_SIZE_SPECS.text.default,
			code: FONT_SIZE_SPECS.code.default,
			terminal: FONT_SIZE_SPECS.terminal.default
		});
		/** Settings field carrying each role's font-family list. */
		const FONT_FAMILY_FIELDS = {
			text: "textFontFamily",
			code: "codeFontFamily",
			terminal: "terminalFontFamily"
		};
		/**
		* Body variable carrying one role's normalized font list; the token sheet
		* places it ahead of that role's built-in stack.
		* @param kind - font role.
		* @returns the CSS custom property name.
		*/
		function fontFamilyVariable(kind) {
			return `--dsh-font-family-${kind}`;
		}
		/**
		* Integer px schema for one role's font size.
		* @param spec - the role's range and default.
		* @returns the validated number schema.
		*/
		function fontSizeSchema(spec) {
			return Schema.number().step(1).min(spec.min).max(spec.max).default(spec.default);
		}
		/**
		* Collect every role's size from a settings section.
		* @param section - accepted theme settings.
		* @returns integer px sizes by role.
		*/
		function sectionFontSizes(section) {
			return Object.freeze({
				text: section.fontSize,
				code: section.codeFontSize,
				terminal: section.terminalFontSize
			});
		}
		/**
		* Whether one value is an accepted size for a role.
		* @param role - font role.
		* @param px - candidate size.
		* @returns true for an integer within the role's range.
		*/
		function isFontSize(role, px) {
			const spec = FONT_SIZE_SPECS[role];
			return Number.isInteger(px) && px >= spec.min && px <= spec.max;
		}
		Schema.object({
			[THEME_PREFERENCE_FIELD]: Schema.union([...THEME_PREFERENCES]).default(DEFAULT_PREFERENCE),
			[FONT_SIZE_FIELD]: fontSizeSchema(FONT_SIZE_SPECS.text),
			[FONT_SIZE_SPECS.code.field]: fontSizeSchema(FONT_SIZE_SPECS.code),
			[FONT_SIZE_SPECS.terminal.field]: fontSizeSchema(FONT_SIZE_SPECS.terminal),
			[FONT_FAMILY_FIELDS.text]: Schema.string().default(""),
			[FONT_FAMILY_FIELDS.code]: Schema.string().default(""),
			[FONT_FAMILY_FIELDS.terminal]: Schema.string().default("")
		});
		/** CSS Fonts generic and system family keywords, which must stay unquoted. */
		const GENERIC_FAMILIES = new Set([
			"serif",
			"sans-serif",
			"monospace",
			"cursive",
			"fantasy",
			"system-ui",
			"ui-serif",
			"ui-sans-serif",
			"ui-monospace",
			"ui-rounded",
			"emoji",
			"math",
			"fangsong",
			"-apple-system",
			"blinkmacsystemfont"
		]);
		/**
		* Normalize user input into a CSS font-family list. Names are comma separated;
		* quotes, backslashes, angle brackets, and control characters are dropped, and
		* every non-generic name is double-quoted, so the result is always a valid list
		* safe to embed in inline CSS and boot scripts. Normalizing a result returns it unchanged.
		* @param value - user-entered or stored font list.
		* @returns the normalized list, or `''` when no family name remains.
		*/
		function normalizeFontFamily(value) {
			return value.split(",").map((name) => name.replace(/["'\\<>\u0000-\u001f\u007f]/gu, "").replace(/\s+/gu, " ").trim()).filter((name) => name !== "").map((name) => GENERIC_FAMILIES.has(name.toLowerCase()) ? name : `"${name}"`).join(", ");
		}
		/**
		* Narrow one wire or registry value to a persistable preference.
		* @param value - value crossing the settings or registry boundary.
		* @returns whether the value is a built-in preference.
		*/
		function isThemePreference(value) {
			return THEME_PREFERENCES.some((preference) => preference === value);
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-theme/src/client/FontSizeRow.module.css.mjs
		const css$2 = ".AI9nIa_row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}.AI9nIa_rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}@media (width<=767px){html:not([data-windows-titlebar]):not([data-platform=darwin]) .AI9nIa_rowText{padding-right:16px}}.AI9nIa_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}.AI9nIa_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}.AI9nIa_control{align-items:center;gap:8px;display:inline-flex}.AI9nIa_stepper{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);justify-content:center;align-items:center;min-width:72px;height:36px;display:inline-flex;position:relative}.AI9nIa_value{text-align:center;font-variant-numeric:tabular-nums;min-width:18px;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}.AI9nIa_unit{color:var(--dsw-alias-label-secondary);font-size:14px;line-height:22px}.AI9nIa_arrows{opacity:0;flex-direction:column;gap:2px;display:flex;position:absolute;right:8px}@media (hover:hover){.AI9nIa_stepper:hover .AI9nIa_arrows{opacity:1}}.AI9nIa_stepper:focus-within .AI9nIa_arrows{opacity:1}@media (hover:none){.AI9nIa_arrows{opacity:1}}.AI9nIa_arrow{border-radius:var(--dsw-radius-xs);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 75%, transparent);width:17px;height:12px;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;justify-content:center;align-items:center;padding:0;display:inline-flex}@media (hover:hover){.AI9nIa_arrow:hover:not(:disabled){background:var(--dsw-alias-bg-layer-1)}}.AI9nIa_arrow:disabled{color:var(--dsw-alias-label-caption);cursor:default}.AI9nIa_expander{border-radius:var(--dsw-radius-xs);width:24px;height:24px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;justify-content:center;align-items:center;padding:0;display:inline-flex}@media (hover:hover){.AI9nIa_expander:hover{background:var(--dsw-alias-interactive-bg-hover)}}.AI9nIa_expander svg{transition:transform var(--ds-transition-duration-fast) var(--ds-ease-in-out)}.AI9nIa_expander[aria-expanded=true] svg{transform:rotate(180deg)}";
		const tagId$2 = "@deepseek-ai/dsh-client-ui-theme/FontSizeRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-theme";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var FontSizeRow_module_css_default = {
			"arrow": "AI9nIa_arrow",
			"arrows": "AI9nIa_arrows",
			"control": "AI9nIa_control",
			"desc": "AI9nIa_desc",
			"expander": "AI9nIa_expander",
			"row": "AI9nIa_row",
			"rowText": "AI9nIa_rowText",
			"stepper": "AI9nIa_stepper",
			"title": "AI9nIa_title",
			"unit": "AI9nIa_unit",
			"value": "AI9nIa_value"
		};
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-theme/src/client/FontFamilyRow.module.css.mjs
		const css$1 = ".k0l_YG_field{flex:0 240px;min-width:0}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-theme/FontFamilyRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-theme";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var FontFamilyRow_module_css_default = { "field": "k0l_YG_field" };
		//#endregion
		//#region lib/types/client/FontFamilyRow.js
		/**
		* Font-family preference row rendered inside the font settings group, once
		* per font role: title + role description + a text field holding the
		* comma-separated family list. Blur or Enter normalizes and commits the list;
		* an empty field restores the built-in stack. The field shows the persisted
		* list and resets whenever that list changes.
		*/
		/**
		* Render one font-family row.
		* @param props - composed slot props.
		* @returns the row element tree.
		*/
		function FontFamilyRow({ t, role, setFontFamily, useStore }) {
			const value = useStore((s) => s.fontFamilies[role]);
			const title = t(`fontFamily.${role}.title`);
			const commit = (input) => {
				input.value = normalizeFontFamily(input.value);
				setFontFamily(input.value);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: FontSizeRow_module_css_default.row,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: FontSizeRow_module_css_default.rowText,
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: FontSizeRow_module_css_default.title,
						children: title
					}), (0, react_jsx_runtime.jsx)("div", {
						className: FontSizeRow_module_css_default.desc,
						children: t(`fontFamily.${role}.description`)
					})]
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
					className: FontFamilyRow_module_css_default.field,
					defaultValue: value,
					placeholder: t("fontFamily.placeholder"),
					"aria-label": title,
					spellCheck: false,
					autoComplete: "off",
					onBlur: (event) => {
						commit(event.currentTarget);
					},
					maxLength: 200,
					onKeyDown: (event) => {
						if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
						if (event.key === "Enter") event.currentTarget.blur();
					}
				}, value)]
			});
		}
		//#endregion
		//#region lib/types/client/FontSizeRow.js
		/**
		* Font-size preference row: title + role description + stepper pill (centered value; hover
		* reveals the up/down arrow column anchored to the pill's right edge) + a px
		* unit label after the pill. The text row is registered into the General
		* section item slot; the code and terminal rows render inside the font
		* settings group. The displayed value follows the persisted setting, never the
		* click echo.
		*/
		/**
		* Render the font-size row.
		* @param props - composed slot props.
		* @returns the row element tree.
		*/
		function FontSizeRow({ t, role, setFontSize, useStore, expander }) {
			const fontSize = useStore((s) => s.fontSizes[role]);
			const { min, max } = FONT_SIZE_SPECS[role];
			return (0, react_jsx_runtime.jsxs)("div", {
				className: FontSizeRow_module_css_default.row,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: FontSizeRow_module_css_default.rowText,
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: FontSizeRow_module_css_default.title,
						children: t(`fontSize.${role}.title`)
					}), (0, react_jsx_runtime.jsx)("div", {
						className: FontSizeRow_module_css_default.desc,
						children: t(`fontSize.${role}.description`)
					})]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: FontSizeRow_module_css_default.control,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: FontSizeRow_module_css_default.stepper,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: FontSizeRow_module_css_default.value,
								children: fontSize
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: FontSizeRow_module_css_default.arrows,
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: FontSizeRow_module_css_default.arrow,
									"aria-label": t(`fontSize.${role}.increase`),
									disabled: fontSize >= max,
									onClick: () => {
										setFontSize(fontSize + 1);
									},
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, { size: 9 })
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: FontSizeRow_module_css_default.arrow,
									"aria-label": t(`fontSize.${role}.decrease`),
									disabled: fontSize <= min,
									onClick: () => {
										setFontSize(fontSize - 1);
									},
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 9 })
								})]
							})]
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: FontSizeRow_module_css_default.unit,
							children: t("fontSize.unit")
						}),
						expander !== void 0 && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: FontSizeRow_module_css_default.expander,
							"aria-label": t("fontSize.more"),
							title: t("fontSize.more"),
							"aria-expanded": expander.open,
							"aria-controls": expander.controls,
							onClick: expander.onToggle,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 12 })
						})
					]
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-theme/src/client/FontSettingsGroup.module.css.mjs
		const css = ".oO24IG_group:last-child>:last-child,.oO24IG_group:last-child>:last-child>:last-child{border-bottom:0}";
		const tagId = "@deepseek-ai/dsh-client-ui-theme/FontSettingsGroup.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-theme";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var FontSettingsGroup_module_css_default = { "group": "oO24IG_group" };
		//#endregion
		//#region lib/types/client/FontSettingsGroup.js
		/**
		* Font settings registered into the General section item slot: the text
		* font-size row, whose disclosure button expands a region holding the font
		* row for each role and the code and terminal size rows. The region starts
		* collapsed on every mount.
		*/
		/**
		* Render the text font-size row and its expandable font settings.
		* @param props - composed slot props.
		* @returns the text size row and, when expanded, the font rows.
		*/
		function FontSettingsGroup({ setFontFamily, setFontSize, ...shared }) {
			const [open, setOpen] = (0, react.useState)(false);
			const regionId = (0, react.useId)();
			const family = (role) => (0, react_jsx_runtime.jsx)(FontFamilyRow, {
				...shared,
				role,
				setFontFamily: (value) => {
					setFontFamily(role, value);
				}
			});
			const size = (role, expander) => (0, react_jsx_runtime.jsx)(FontSizeRow, {
				...shared,
				role,
				expander,
				setFontSize: (px) => {
					setFontSize(role, px);
				}
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: FontSettingsGroup_module_css_default.group,
				children: [size("text", {
					open,
					controls: regionId,
					onToggle: () => {
						setOpen((value) => !value);
					}
				}), open && (0, react_jsx_runtime.jsxs)("div", {
					id: regionId,
					children: [
						family("text"),
						family("code"),
						size("code"),
						family("terminal"),
						size("terminal")
					]
				})]
			});
		}
		//#endregion
		//#region lib/types/client/settings-store.js
		/**
		* Appearance and font row slot stores: mirrors of the theme service
		* snapshot. The plugin's apply-world change listener is the only writer; the
		* row components read via props.useStore.
		*/
		/**
		* Declares the Appearance row state and write surface.
		* @returns the store handle.
		*/
		function createAppearanceRowStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({
					preference: "system",
					revision: -1
				}),
				actions: { sync: (d, preference, revision) => {
					if (revision <= d.revision) return;
					d.preference = preference;
					d.revision = revision;
				} }
			});
		}
		/**
		* Declares the font rows' state and write surface.
		* @returns the store handle.
		*/
		function createFontRowStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({
					fontSizes: DEFAULT_FONT_SIZES,
					fontFamilies: {
						text: "",
						code: "",
						terminal: ""
					},
					revision: -1
				}),
				actions: { sync: (d, fontSizes, fontFamilies, revision) => {
					if (revision <= d.revision) return;
					d.fontSizes = fontSizes;
					d.fontFamilies = fontFamilies;
					d.revision = revision;
				} }
			});
		}
		//#endregion
		//#region lib/types/client/icon-sprite.js
		const SVG_NS$1 = "http://www.w3.org/2000/svg";
		/** Root attributes that size or label one rendering, not the reusable artwork. */
		const DROPPED_ATTRIBUTES = new Set([
			"width",
			"height",
			"xmlns",
			"class",
			"aria-hidden"
		]);
		function toSymbol(id, markup) {
			const root = new DOMParser().parseFromString(markup, "image/svg+xml").documentElement;
			const symbol = document.createElementNS(SVG_NS$1, "symbol");
			for (const { name, value } of root.attributes) if (!DROPPED_ATTRIBUTES.has(name)) symbol.setAttribute(name, value);
			symbol.id = id;
			symbol.append(...[...root.childNodes].map((node) => document.importNode(node, true)));
			return symbol;
		}
		/**
		* Mount the sprite and keep each symbol on the active theme's replacement or
		* the ui-primitives default; plugin disposal removes the sprite.
		* @param ctx - owning plugin context; `theme/change` snapshots drive updates.
		* @param icons - replacements of the theme active at install time.
		*/
		function installIconSprite(ctx, icons) {
			if (typeof document === "undefined") return;
			const sprite = document.createElementNS(SVG_NS$1, "svg");
			sprite.setAttribute("aria-hidden", "true");
			sprite.setAttribute("data-dsh-icon-sprite", "");
			sprite.style.cssText = "position: absolute; width: 0; height: 0; overflow: hidden";
			const rendered = /* @__PURE__ */ new Map();
			const markups = /* @__PURE__ */ new Map();
			const apply = (replacements = {}) => {
				for (const [id, fallback] of Object.entries(_deepseek_ai_dsh_client_ui_primitives.ICON_SYMBOLS)) {
					const markup = replacements[id] ?? fallback;
					if (markups.get(id) === markup) continue;
					const symbol = toSymbol(id, markup);
					const previous = rendered.get(id);
					if (previous === void 0) sprite.append(symbol);
					else previous.replaceWith(symbol);
					rendered.set(id, symbol);
					markups.set(id, markup);
				}
			};
			apply(icons);
			ctx.effect(() => {
				document.body.prepend(sprite);
				return () => {
					sprite.remove();
				};
			}, "ui-theme: icon sprite");
			ctx.on("theme/change", (snapshot) => {
				apply(snapshot.active.icons);
			});
		}
		//#endregion
		//#region \0dsh-inline-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-theme/src/styles/base.css.mjs
		var base_css_default = ":root{--dsh-font-family-text-default:-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;--dsw-font-family:var(--dsh-font-family-text-default);--dsw-font-family-brand:\"Montserrat\", var(--dsh-font-family-text-default);--dsh-font-family-code-default:\"SF Mono\", \"JetBrains Mono\", \"Fira Code\", Consolas, \"Liberation Mono\", Menlo, Courier, \"PingFang SC\", \"Microsoft YaHei\";--ds-font-family-code:var(--dsh-font-family-code-default);--ds-ease-in-out:cubic-bezier(.4, 0, .2, 1);--ds-transition-duration:.2s;--ds-transition-duration-fast:.1s;--ds-transition-duration-slow:.3s;--dsw-radius-xs:4px;--dsw-radius-sm:8px;--dsw-radius-md:12px;--dsw-radius-lg:16px;--dsw-radius-xl:20px;--dsw-radius-panel:28px}body{--dsw-font-family:var(--dsh-font-family-text,var(--dsh-font-family-text-default)), var(--dsh-font-family-text-default);--ds-font-family-code:var(--dsh-font-family-code,var(--dsh-font-family-code-default)), var(--dsh-font-family-code-default);--dsw-alias-settings-card-fill:var(--dsw-alias-bg-layer-2);--dsw-alias-settings-card-stroke:var(--dsw-alias-border-l4)}[data-dsh-automatic-focus]:focus,[data-dsh-automatic-focus]:focus:focus-visible{outline:none}";
		//#endregion
		//#region \0dsh-inline-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-theme/src/styles/corner-shape.css.mjs
		var corner_shape_css_default = "@supports (corner-shape:superellipse(1.5)){:root{--dsw-corner-shape:superellipse(1.5)}*,:before,:after{corner-shape:var(--dsw-corner-shape)}}";
		//#endregion
		//#region \0dsh-inline-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-theme/src/styles/design-platform.css.mjs
		var design_platform_css_default = "body{--dsw-static-amber-100:#fef5e7;--dsw-static-amber-400:#f7ad31;--dsw-static-amber-500:#f59e0b;--dsw-static-amber-600:#dd8629;--dsw-static-amber-900:#27241f;--dsw-static-blue-100:#dbeafe;--dsw-static-blue-300:#93c5fd;--dsw-static-blue-400:#60a5fa;--dsw-static-blue-450:#4d93f8;--dsw-static-blue-500:#3b82f6;--dsw-static-blue-50:#eff6ff;--dsw-static-blue-50p:#eaf3ff;--dsw-static-blue-600:#2563eb;--dsw-static-blue-75:#e5f0ff;--dsw-static-blue-800:#1e40af;--dsw-static-blue-900:#0e3074;--dsw-static-blue-950:#172554;--dsw-static-deepseek-100:#e4edfd;--dsw-static-deepseek-200:#d3e2ff;--dsw-static-deepseek-300:#b7c8fe;--dsw-static-deepseek-400:#7aaaff;--dsw-static-deepseek-450:#5686fe;--dsw-static-deepseek-500:#4176e6;--dsw-static-deepseek-50:#edf3fe;--dsw-static-deepseek-600:#4868b2;--dsw-static-deepseek-700-delete:#2f4c8f;--dsw-static-deepseek-800:#34415b;--dsw-static-deepseek-900:#283142;--dsw-static-green-100:#e6faed;--dsw-static-green-400:#4ed17e;--dsw-static-green-500:#22c55e;--dsw-static-green-500-a08:#22c55e14;--dsw-static-green-500-a12:#22c55e1f;--dsw-static-green-900:#233c2c;--dsw-static-neutral-00:#fff;--dsw-static-neutral-1000:#000;--dsw-static-neutral-100:#f5f5f5;--dsw-static-neutral-150:#ededed;--dsw-static-neutral-200:#e5e5e5;--dsw-static-neutral-250:#dcdcdc;--dsw-static-neutral-300:#d4d4d4;--dsw-static-neutral-400:#a2a4a6;--dsw-static-neutral-500:#7f8287;--dsw-static-neutral-50:#fafafa;--dsw-static-neutral-550:#65676b;--dsw-static-neutral-600:#545557;--dsw-static-neutral-700:#3c3c3d;--dsw-static-neutral-800:#292929;--dsw-static-neutral-850:#212123;--dsw-static-neutral-900:#0f0f0f;--dsw-static-neutral-bluish-00:#fff;--dsw-static-neutral-bluish-1000:#0f1115;--dsw-static-neutral-bluish-100:#ebeef2;--dsw-static-neutral-bluish-150:#e9ecf2;--dsw-static-neutral-bluish-200:#e1e5ee;--dsw-static-neutral-bluish-300:#cfd3d6;--dsw-static-neutral-bluish-310:#cad2db;--dsw-static-neutral-bluish-400:#adb2b8;--dsw-static-neutral-bluish-500:#979da6;--dsw-static-neutral-bluish-50:#f9fafb;--dsw-static-neutral-bluish-55:#f5f7fa;--dsw-static-neutral-bluish-600:#81858c;--dsw-static-neutral-bluish-60:#f5f6f7;--dsw-static-neutral-bluish-700:#61666b;--dsw-static-neutral-bluish-750:#43454a;--dsw-static-neutral-bluish-75:#f1f3f5;--dsw-static-neutral-bluish-800:#353638;--dsw-static-neutral-bluish-850:#2c2c2e;--dsw-static-neutral-bluish-875:#232324;--dsw-static-neutral-bluish-900:#1b1b1c;--dsw-static-neutral-bluish-90:#edf0f4;--dsw-static-neutral-bluish-950:#151517;--dsw-static-red-100:#fee2e2;--dsw-static-red-400:#f25a5a;--dsw-static-red-400-a12:#f25a5a1f;--dsw-static-red-500:#ef4444;--dsw-static-red-50:#fef2f2;--dsw-static-red-600:#ec1313;--dsw-static-red-600-a08:#ec131314;--dsw-static-red-900:#570c0c}body[data-ds-dark-theme]{--dsw-static-amber-100:#fef5e7;--dsw-static-amber-400:#f7ad31;--dsw-static-amber-500:#f59e0b;--dsw-static-amber-600:#dd8629;--dsw-static-amber-900:#27241f;--dsw-static-blue-100:#dbeafe;--dsw-static-blue-300:#93c5fd;--dsw-static-blue-400:#60a5fa;--dsw-static-blue-450:#4d93f8;--dsw-static-blue-500:#3b82f6;--dsw-static-blue-50:#eff6ff;--dsw-static-blue-50p:#eaf3ff;--dsw-static-blue-600:#2563eb;--dsw-static-blue-75:#e5f0ff;--dsw-static-blue-800:#1e40af;--dsw-static-blue-900:#0e3074;--dsw-static-blue-950:#172554;--dsw-static-deepseek-100:#e4edfd;--dsw-static-deepseek-200:#d3e2ff;--dsw-static-deepseek-300:#b7c8fe;--dsw-static-deepseek-400:#7aaaff;--dsw-static-deepseek-450:#5686fe;--dsw-static-deepseek-500:#4176e6;--dsw-static-deepseek-50:#edf3fe;--dsw-static-deepseek-600:#4868b2;--dsw-static-deepseek-700-delete:#2f4c8f;--dsw-static-deepseek-800:#34415b;--dsw-static-deepseek-900:#283142;--dsw-static-green-100:#e6faed;--dsw-static-green-400:#4ed17e;--dsw-static-green-500:#22c55e;--dsw-static-green-500-a08:#22c55e14;--dsw-static-green-500-a12:#22c55e1f;--dsw-static-green-900:#233c2c;--dsw-static-neutral-00:#fff;--dsw-static-neutral-1000:#000;--dsw-static-neutral-100:#f5f5f5;--dsw-static-neutral-150:#ededed;--dsw-static-neutral-200:#e5e5e5;--dsw-static-neutral-250:#dcdcdc;--dsw-static-neutral-300:#d4d4d4;--dsw-static-neutral-400:#a2a4a6;--dsw-static-neutral-500:#7f8287;--dsw-static-neutral-50:#fafafa;--dsw-static-neutral-550:#65676b;--dsw-static-neutral-600:#545557;--dsw-static-neutral-700:#3c3c3d;--dsw-static-neutral-800:#292929;--dsw-static-neutral-850:#212123;--dsw-static-neutral-900:#0f0f0f;--dsw-static-neutral-bluish-00:#fff;--dsw-static-neutral-bluish-1000:#0f1115;--dsw-static-neutral-bluish-100:#ebeef2;--dsw-static-neutral-bluish-150:#e9ecf2;--dsw-static-neutral-bluish-200:#e1e5ee;--dsw-static-neutral-bluish-300:#cfd3d6;--dsw-static-neutral-bluish-310:#cad2db;--dsw-static-neutral-bluish-400:#adb2b8;--dsw-static-neutral-bluish-500:#979da6;--dsw-static-neutral-bluish-50:#f9fafb;--dsw-static-neutral-bluish-55:#f5f7fa;--dsw-static-neutral-bluish-600:#81858c;--dsw-static-neutral-bluish-60:#f9fafb;--dsw-static-neutral-bluish-700:#61666b;--dsw-static-neutral-bluish-750:#43454a;--dsw-static-neutral-bluish-75:#f1f3f5;--dsw-static-neutral-bluish-800:#353638;--dsw-static-neutral-bluish-850:#2c2c2e;--dsw-static-neutral-bluish-875:#232324;--dsw-static-neutral-bluish-900:#1b1b1c;--dsw-static-neutral-bluish-90:#edf0f4;--dsw-static-neutral-bluish-950:#151517;--dsw-static-red-100:#fee2e2;--dsw-static-red-400:#f25a5a;--dsw-static-red-400-a12:#f25a5a1f;--dsw-static-red-500:#ef4444;--dsw-static-red-50:#fef2f2;--dsw-static-red-600:#ec1313;--dsw-static-red-600-a08:#ec131314;--dsw-static-red-900:#570c0c}body{--dsw-alias-bg-base:var(--dsw-static-neutral-bluish-00);--dsw-alias-bg-document-preview:var(--dsw-static-neutral-bluish-100);--dsw-alias-bg-document-selection:color-mix(in srgb, var(--dsw-static-blue-500) 40%, transparent);--dsw-alias-label-document-preview:var(--dsw-static-neutral-bluish-700);--dsw-alias-bg-layer-1:var(--dsw-static-neutral-bluish-00);--dsw-alias-bg-layer-2:var(--dsw-static-neutral-bluish-00);--dsw-alias-bg-layer-3:var(--dsw-static-neutral-bluish-00);--dsw-alias-bg-mask-1:#0000003d;--dsw-alias-bg-mask-2:#0000001f;--dsw-alias-bg-mask-3:#0000007a;--dsw-alias-bg-mask-photo:#000000e0;--dsw-alias-bg-mask-drop:#ffffffb3;--dsw-alias-bg-module-platform:var(--dsw-static-neutral-bluish-60);--dsw-alias-bg-multi-select:var(--dsw-static-neutral-bluish-60);--dsw-alias-bg-overlay:var(--dsw-static-neutral-bluish-150);--dsw-alias-bg-skeleton:#0000000a;--dsw-alias-border-inverted2:#0000;--dsw-alias-border-inverted:#0000;--dsw-alias-border-l1:#0000000a;--dsw-alias-border-l2-darkmode-thin:#0000001a;--dsw-alias-border-l2:#0000001a;--dsw-alias-border-l3:#0000001f;--dsw-alias-border-l4:#00000029;--dsw-alias-brand-primary-invert:var(--dsw-static-neutral-bluish-1000);--dsw-alias-brand-primary-new-colorprimary-new-color:#4176e6;--dsw-alias-brand-primary:var(--dsw-static-neutral-bluish-1000);--dsw-alias-brand-text:var(--dsw-static-neutral-bluish-1000);--dsw-alias-button-contrast-fill:var(--dsw-static-neutral-bluish-700);--dsw-alias-button-elevated-fill:var(--dsw-static-neutral-bluish-00);--dsw-alias-button-floating-fill:var(--dsw-static-neutral-bluish-00);--dsw-alias-button-floating-hover:var(--dsw-static-neutral-bluish-75);--dsw-alias-button-ghost-active-border:var(--dsw-static-neutral-bluish-500);--dsw-alias-button-ghost-active-fill:var(--dsw-static-neutral-bluish-100);--dsw-alias-button-ghost-active-hover:var(--dsw-static-neutral-bluish-150);--dsw-alias-button-info-fill:var(--dsw-static-deepseek-500);--dsw-alias-button-info-hover:var(--dsw-static-deepseek-400);--dsw-alias-button-primary-dimmed:var(--dsw-static-neutral-bluish-100);--dsw-alias-button-primary-fill:var(--dsw-alias-brand-primary);--dsw-alias-button-primary-hover:var(--dsw-static-neutral-bluish-750);--dsw-alias-button-tool-bar-fill-invisible:#1f1f1f5c;--dsw-alias-button-tool-bar-fill:#54555780;--dsw-alias-button-tool-bar-hover:#54555799;--dsw-alias-illustration-background:var(--dsw-static-neutral-bluish-55);--dsw-alias-illustration-backing:var(--dsw-static-neutral-bluish-310);--dsw-alias-illustration-detail:var(--dsw-static-neutral-bluish-310);--dsw-alias-illustration-inset:var(--dsw-alias-illustration-surface);--dsw-alias-illustration-shadow:var(--dsw-alias-illustration-surface);--dsw-alias-illustration-surface:var(--dsw-static-neutral-bluish-90);--dsw-alias-interactive-bg-active:#2631481a;--dsw-alias-interactive-bg-hover-accent:#26314824;--dsw-alias-interactive-bg-hover-danger:#ec13130d;--dsw-alias-interactive-bg-hover-solid:var(--dsw-static-neutral-bluish-75);--dsw-alias-interactive-bg-hover:#2631480f;--dsw-alias-label-caption:var(--dsw-static-neutral-bluish-400);--dsw-alias-label-deep-diving:color-mix(in srgb, var(--dsw-static-deepseek-500) 70%, var(--dsw-static-blue-950));--dsw-alias-label-deep-diving-shimmer:color-mix(in srgb, var(--dsw-static-deepseek-500) 30%, var(--dsw-static-blue-950));--dsw-alias-label-dimmed:var(--dsw-static-neutral-bluish-200);--dsw-alias-label-primary-bluish:var(--dsw-static-blue-900);--dsw-alias-label-primary-dimmed:var(--dsw-static-neutral-bluish-950);--dsw-alias-label-primary-foreground:var(--dsw-static-neutral-bluish-00);--dsw-alias-label-primary-inverted:var(--dsw-static-neutral-bluish-00);--dsw-alias-label-primary:var(--dsw-static-neutral-bluish-1000);--dsw-alias-label-secondary:var(--dsw-static-neutral-bluish-700);--dsw-alias-label-shimmer:color-mix(in srgb, var(--dsw-static-neutral-1000) 30%, transparent);--dsw-alias-label-tertiary:var(--dsw-static-neutral-bluish-600);--dsw-alias-menu-icon:var(--dsw-static-neutral-bluish-800);--dsw-alias-link:var(--dsw-static-deepseek-500);--dsw-alias-markdown-citation:var(--dsw-static-neutral-bluish-100);--dsw-alias-markdown-code-block-banner:var(--dsw-static-neutral-bluish-50);--dsw-alias-markdown-code-block:var(--dsw-static-neutral-bluish-50);--dsw-alias-markdown-code-segment-selected:var(--dsw-static-neutral-bluish-00);--dsw-alias-markdown-code-segment-unselected:var(--dsw-static-neutral-bluish-75);--dsw-alias-markdown-inline-code:var(--dsw-static-neutral-50);--dsw-alias-markdown-placeholder:var(--dsw-static-neutral-bluish-60);--dsw-alias-markdown-tag:var(--dsw-static-neutral-bluish-75);--dsw-alias-scrollbar-bg-l1:var(--dsw-static-neutral-200);--dsw-alias-scrollbar-bg-l2:var(--dsw-static-neutral-200);--dsw-alias-scrollbar-hover-l1:var(--dsw-static-neutral-300);--dsw-alias-scrollbar-hover-l2:var(--dsw-static-neutral-300);--dsw-alias-state-business-primary:var(--dsw-static-deepseek-500);--dsw-alias-state-business-tertiary:var(--dsw-static-deepseek-100);--dsw-alias-code-diff-added:var(--dsw-static-green-500-a08);--dsw-alias-code-diff-deleted:var(--dsw-static-red-600-a08);--dsw-alias-file-diff-added-bg:#e6f4e7;--dsw-alias-file-diff-added-gutter:#edf7ed;--dsw-alias-file-diff-added-marker:#01a241;--dsw-alias-file-diff-deleted-bg:#fce6e2;--dsw-alias-file-diff-deleted-gutter:#fdece9;--dsw-alias-file-diff-deleted-marker:#ba2723;--dsw-alias-state-error-primary:var(--dsw-static-red-600);--dsw-alias-state-error-secondary:var(--dsw-static-red-400);--dsw-alias-state-idle-primary:var(--dsw-static-neutral-300);--dsw-alias-state-success-primary:var(--dsw-static-green-500);--dsw-alias-state-success-secondary:var(--dsw-static-green-400);--dsw-alias-state-success-tertiary:var(--dsw-static-green-100);--dsw-alias-state-warn-label:var(--dsw-static-amber-600);--dsw-alias-state-warn-primary:var(--dsw-static-amber-500);--dsw-alias-state-warn-secondary:var(--dsw-static-amber-400);--dsw-alias-state-warn-tertiary:var(--dsw-static-amber-100);--dsw-alias-switch-thumb:var(--dsw-static-neutral-bluish-00);--dsw-alias-toast-bg:var(--dsw-static-neutral-bluish-800);--dsw-alias-toast-label:var(--dsw-static-neutral-bluish-00);--dsw-alias-tooltip-bg:var(--dsw-static-neutral-bluish-850);--dsw-alias-tooltip-key-bg:color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%);--dsw-alias-turn-trigger-bg:var(--dsw-alias-markdown-code-block);--dsw-alias-turn-trigger-bg-hover:var(--dsw-alias-interactive-bg-hover);--dsw-specific-bubble-highlight:var(--dsw-static-deepseek-200);--dsw-specific-bubble:var(--dsw-static-deepseek-50);--dsw-specific-input-major:var(--dsw-static-neutral-bluish-00);--dsw-specific-login-input:var(--dsw-static-neutral-bluish-50);--dsw-menu-surface-fill:#f8f9fa94;--dsw-alias-menu-group-header-fill:#f8f9faf0;--dsw-specific-menu:var(--dsw-menu-surface-fill);--dsw-specific-selector:var(--dsw-static-neutral-bluish-60);--dsw-specific-sidebar-fill:var(--dsw-static-neutral-bluish-50);--dsw-specific-sidebar-nav-item-active-accent:var(--dsw-static-deepseek-100);--dsw-specific-sidebar-nav-item-active:var(--dsw-static-neutral-bluish-100);--dsw-specific-tip:var(--dsw-static-neutral-bluish-60);background-color:var(--dsw-alias-bg-base)}body[data-ds-dark-theme]{--dsw-alias-bg-base:var(--dsw-static-neutral-bluish-950);--dsw-alias-bg-document-preview:var(--dsw-static-neutral-bluish-950);--dsw-alias-bg-document-selection:color-mix(in srgb, var(--dsw-static-blue-500) 40%, transparent);--dsw-alias-label-document-preview:var(--dsw-static-neutral-bluish-300);--dsw-alias-bg-layer-1:var(--dsw-static-neutral-bluish-875);--dsw-alias-bg-layer-2:var(--dsw-static-neutral-bluish-850);--dsw-alias-bg-layer-3:var(--dsw-static-neutral-bluish-800);--dsw-alias-bg-mask-1:#00000080;--dsw-alias-bg-mask-2:#0003;--dsw-alias-bg-mask-3:#0000007a;--dsw-alias-bg-mask-photo:#000000e0;--dsw-alias-bg-mask-drop:#272730b3;--dsw-alias-bg-module-platform:var(--dsw-static-neutral-bluish-800);--dsw-alias-bg-multi-select:var(--dsw-static-neutral-850);--dsw-alias-bg-overlay:var(--dsw-static-neutral-bluish-700);--dsw-alias-bg-skeleton:#ffffff14;--dsw-alias-border-inverted2:#ffffff14;--dsw-alias-border-inverted:#ffffff0f;--dsw-alias-border-l1:#ffffff0f;--dsw-alias-border-l2-darkmode-thin:#ffffff0f;--dsw-alias-border-l2:#ffffff1f;--dsw-alias-border-l3:#ffffff29;--dsw-alias-border-l4:#fff3;--dsw-alias-brand-primary-invert:var(--dsw-static-neutral-bluish-50);--dsw-alias-brand-primary-new-colorprimary-new-color:var(--dsw-static-deepseek-450);--dsw-alias-brand-primary:var(--dsw-static-neutral-bluish-50);--dsw-alias-brand-text:var(--dsw-static-neutral-bluish-50);--dsw-alias-button-contrast-fill:var(--dsw-static-neutral-bluish-50);--dsw-alias-button-elevated-fill:var(--dsw-static-neutral-bluish-750);--dsw-alias-button-floating-fill:var(--dsw-static-neutral-bluish-850);--dsw-alias-button-floating-hover:var(--dsw-static-neutral-bluish-800);--dsw-alias-button-ghost-active-border:var(--dsw-static-neutral-bluish-600);--dsw-alias-button-ghost-active-fill:var(--dsw-static-neutral-bluish-750);--dsw-alias-button-ghost-active-hover:var(--dsw-static-neutral-bluish-700);--dsw-alias-button-info-fill:var(--dsw-static-deepseek-400);--dsw-alias-button-info-hover:var(--dsw-static-deepseek-500);--dsw-alias-button-primary-dimmed:var(--dsw-static-neutral-bluish-750);--dsw-alias-button-primary-fill:var(--dsw-alias-brand-primary);--dsw-alias-button-primary-hover:var(--dsw-static-neutral-bluish-100);--dsw-alias-button-tool-bar-fill-invisible:#1f1f1f5c;--dsw-alias-button-tool-bar-fill:#54555780;--dsw-alias-button-tool-bar-hover:#54555799;--dsw-alias-illustration-background:var(--dsw-static-neutral-bluish-850);--dsw-alias-illustration-backing:var(--dsw-static-neutral-bluish-750);--dsw-alias-illustration-detail:var(--dsw-static-neutral-bluish-600);--dsw-alias-illustration-inset:var(--dsw-alias-illustration-backing);--dsw-alias-illustration-shadow:var(--dsw-alias-illustration-backing);--dsw-alias-illustration-surface:var(--dsw-static-neutral-bluish-700);--dsw-alias-interactive-bg-active:#ffffff24;--dsw-alias-interactive-bg-hover-accent:#ffffff3d;--dsw-alias-interactive-bg-hover-danger:#f25a5a26;--dsw-alias-interactive-bg-hover-solid:var(--dsw-static-neutral-bluish-800);--dsw-alias-interactive-bg-hover:#ffffff14;--dsw-alias-label-caption:var(--dsw-static-neutral-bluish-600);--dsw-alias-label-deep-diving:color-mix(in srgb, var(--dsw-static-deepseek-450) 55%, var(--dsw-static-neutral-bluish-400));--dsw-alias-label-deep-diving-shimmer:color-mix(in srgb, var(--dsw-static-blue-300) 65%, var(--dsw-static-deepseek-400));--dsw-alias-label-dimmed:var(--dsw-static-neutral-bluish-750);--dsw-alias-label-primary-bluish:var(--dsw-static-neutral-bluish-50);--dsw-alias-label-primary-dimmed:var(--dsw-static-neutral-bluish-100);--dsw-alias-label-primary-foreground:var(--dsw-static-neutral-bluish-1000);--dsw-alias-label-primary-inverted:var(--dsw-static-neutral-bluish-800);--dsw-alias-label-primary:var(--dsw-static-neutral-bluish-50);--dsw-alias-label-secondary:var(--dsw-static-neutral-bluish-300);--dsw-alias-label-shimmer:color-mix(in srgb, var(--dsw-static-neutral-00) 45%, transparent);--dsw-alias-label-tertiary:var(--dsw-static-neutral-bluish-400);--dsw-alias-menu-icon:var(--dsw-alias-label-primary-dimmed);--dsw-alias-link:var(--dsw-static-deepseek-400);--dsw-alias-markdown-citation:var(--dsw-static-neutral-bluish-800);--dsw-alias-markdown-code-block-banner:var(--dsw-static-neutral-bluish-850);--dsw-alias-markdown-code-block:var(--dsw-static-neutral-bluish-900);--dsw-alias-markdown-code-segment-selected:var(--dsw-static-neutral-bluish-800);--dsw-alias-markdown-code-segment-unselected:var(--dsw-static-neutral-bluish-900);--dsw-alias-markdown-inline-code:var(--dsw-static-neutral-800);--dsw-alias-markdown-placeholder:var(--dsw-static-neutral-bluish-850);--dsw-alias-markdown-tag:var(--dsw-static-neutral-bluish-850);--dsw-alias-scrollbar-bg-l1:var(--dsw-static-neutral-700);--dsw-alias-scrollbar-bg-l2:var(--dsw-static-neutral-600);--dsw-alias-scrollbar-hover-l1:var(--dsw-static-neutral-600);--dsw-alias-scrollbar-hover-l2:var(--dsw-static-neutral-550);--dsw-alias-state-business-primary:var(--dsw-static-deepseek-400);--dsw-alias-state-business-tertiary:var(--dsw-static-deepseek-800);--dsw-alias-code-diff-added:var(--dsw-static-green-500-a12);--dsw-alias-code-diff-deleted:var(--dsw-static-red-400-a12);--dsw-alias-file-diff-added-bg:#1f3124;--dsw-alias-file-diff-added-gutter:#132016;--dsw-alias-file-diff-added-marker:#41c977;--dsw-alias-file-diff-deleted-bg:#3c1f1b;--dsw-alias-file-diff-deleted-gutter:#28130e;--dsw-alias-file-diff-deleted-marker:#fa423e;--dsw-alias-state-error-primary:var(--dsw-static-red-400);--dsw-alias-state-error-secondary:var(--dsw-static-red-400);--dsw-alias-state-idle-primary:var(--dsw-static-neutral-600);--dsw-alias-state-success-primary:var(--dsw-static-green-500);--dsw-alias-state-success-secondary:var(--dsw-static-green-400);--dsw-alias-state-success-tertiary:var(--dsw-static-green-900);--dsw-alias-state-warn-label:var(--dsw-static-amber-600);--dsw-alias-state-warn-primary:var(--dsw-static-amber-500);--dsw-alias-state-warn-secondary:var(--dsw-static-amber-400);--dsw-alias-state-warn-tertiary:var(--dsw-static-amber-900);--dsw-alias-switch-thumb:var(--dsw-static-neutral-bluish-400);--dsw-alias-toast-bg:var(--dsw-static-neutral-bluish-750);--dsw-alias-toast-label:var(--dsw-static-neutral-bluish-00);--dsw-alias-turn-trigger-bg:var(--dsw-alias-interactive-bg-hover);--dsw-alias-turn-trigger-bg-hover:var(--dsw-alias-interactive-bg-active);--dsw-alias-tooltip-bg:var(--dsw-static-neutral-bluish-750);--dsw-alias-tooltip-key-bg:color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%);--dsw-specific-bubble-highlight:var(--dsw-static-neutral-bluish-750);--dsw-specific-bubble:var(--dsw-static-neutral-bluish-850);--dsw-specific-input-major:var(--dsw-static-neutral-bluish-850);--dsw-specific-login-input:var(--dsw-static-neutral-bluish-900);--dsw-menu-surface-fill:#43454a73;--dsw-alias-menu-group-header-fill:#303136f0;--dsw-specific-menu:var(--dsw-menu-surface-fill);--dsw-specific-selector:var(--dsw-static-neutral-bluish-800);--dsw-specific-sidebar-fill:var(--dsw-static-neutral-bluish-900);--dsw-specific-sidebar-nav-item-active-accent:var(--dsw-static-neutral-bluish-800);--dsw-specific-sidebar-nav-item-active:var(--dsw-static-neutral-bluish-750);--dsw-specific-tip:var(--dsw-static-neutral-bluish-800)}html[data-platform=darwin] body{--dsw-specific-menu:#f8f9faf0}html[data-platform=darwin] body[data-ds-dark-theme]{--dsw-specific-menu:#303136f0}";
		//#endregion
		//#region \0dsh-inline-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-theme/src/styles/focus.css.mjs
		var focus_css_default = ":root{--dsw-focus-ring-width:2px}:focus-visible{outline-color:var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-width:var(--dsw-focus-ring-width)}html[data-input-modality=pointer] body :focus-visible:not(:read-write){--dsw-focus-ring-color:transparent;outline-color:#0000}";
		//#endregion
		//#region \0dsh-inline-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-theme/src/styles/onboarding.css.mjs
		var onboarding_css_default = "body{--dsw-alias-onboarding-accent:#3964fe;--dsw-gradient-onboarding-violet-stops:#2a2fb6 33.102%, #8b76f6 50.954%, #c5c0ff 85.326%, #2a2fb6;--dsw-gradient-onboarding-blue-stops:#3964fe 18.75%, #398efe 51.78%, #6dccff 86.252%, #3964fe;--dsw-gradient-onboarding-cyan-stops:#0293b4 21.154%, #2dc8eb 50.954%, #aff0ff 85.326%, #0293b4;--dsw-alias-onboarding-card-fill:color-mix(in srgb, var(--dsw-static-neutral-bluish-00) 80%, transparent);--dsw-alias-onboarding-secondary-fill:var(--dsw-static-neutral-bluish-00);--dsw-alias-onboarding-checkbox-border:color-mix(in srgb, var(--dsw-static-neutral-bluish-1000) 20%, transparent)}body[data-ds-dark-theme]{--dsw-alias-onboarding-card-fill:color-mix(in srgb, var(--dsw-static-neutral-bluish-850) 80%, transparent);--dsw-alias-onboarding-secondary-fill:#48494c;--dsw-alias-onboarding-checkbox-border:var(--dsw-alias-border-l2)}";
		//#endregion
		//#region \0dsh-inline-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-theme/src/styles/scrollbar.css.mjs
		var scrollbar_css_default = "body{--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l1);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l1);--dsh-scrollbar-thumb-border:0px;--dsh-scrollbar-track-margin:0px;--dsh-scrollbar-width:5px}@supports not selector(::-webkit-scrollbar){body,body *{scrollbar-width:thin;scrollbar-color:var(--dsh-scrollbar-thumb) transparent}}::-webkit-scrollbar{width:var(--dsh-scrollbar-width);height:var(--dsh-scrollbar-width)}::-webkit-scrollbar-track{margin-block:var(--dsh-scrollbar-track-margin);background:0 0}::-webkit-scrollbar-thumb{border:var(--dsh-scrollbar-thumb-border) solid transparent;corner-shape:round;background:var(--dsh-scrollbar-thumb);background-clip:content-box;border-radius:999px}@media (hover:hover){::-webkit-scrollbar-thumb:hover{background-color:var(--dsh-scrollbar-thumb-hover)}}::-webkit-scrollbar-corner{background:0 0}";
		//#endregion
		//#region \0dsh-inline-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-theme/src/styles/gradient-shadow-text.css.mjs
		var gradient_shadow_text_css_default = "body{--dsw-linear-gradient-think:linear-gradient(180deg, #fff 20.19%, #fff0 100%);--dsw-linear-think-select:linear-gradient(180deg, #f5f6f7 20.19%, #f5f6f700 100%);--dsw-shadow-lv1:0 2px 4px 0 #0000000d;--dsw-shadow-lv1-blur:0 4px 12px 0 #00000005;--dsw-shadow-lv2:0 4px 12px 0 #00000005, 0 2px 8px 0 #0000000a;--dsw-shadow-lv3:0 0 1px 0 #0003, 0 0 4px 0 #00000005, 0 12px 32px 0 #00000014;--dsw-elevation-stroke-color:var(--dsw-alias-border-l4);--dsw-mask-blur:none;--dsw-menu-backdrop-filter:blur(40px) saturate(150%)}body[data-ds-dark-theme] [data-menu-material]{--dsw-elevation-stroke-color:var(--dsw-alias-border-l3)}body,body *{--dsw-elevation-stroke:0 0 0 .5px var(--dsw-elevation-stroke-color);--dsw-elevation-panel:var(--dsw-elevation-stroke), 0 3px 8px 0 #00000008, 0 0 16px 0 #00000005;--dsw-elevation-prominent:var(--dsw-elevation-stroke), 0 3px 8px 0 #0000000a, 0 0 20px 0 #0000000d;--dsw-elevation-soft:var(--dsw-elevation-stroke), 0 4px 16px 0 #00000008, 0 0 24px 0 #00000008}body[data-ds-dark-theme]{--dsw-linear-gradient-think:linear-gradient(180deg, #151517 20.19%, #15151700 100%);--dsw-linear-think-select:linear-gradient(180deg, #232325 20.19%, #23232500 100%)}body{--dsh-content-font-delta:calc(var(--dsh-content-font-size,14px) - 14px);--dsh-content-font-size-secondary:min(calc(var(--dsh-content-font-size,14px) - 1px), max(13px, calc(var(--dsh-content-font-size,14px) - 2px)));--dsh-content-font-delta-secondary:calc(var(--dsh-content-font-size-secondary) - 13px);--dsh-code-font-delta:calc(var(--dsh-code-font-size,11px) - 11px);--dsw-font-markdown-h1:700 calc(21px + var(--dsh-content-font-delta)) / calc(30px + var(--dsh-content-font-delta)) var(--dsw-font-family);--dsw-font-markdown-h1-font-family:var(--dsw-font-family);--dsw-font-markdown-h1-font-weight:700;--dsw-font-markdown-h1-line-height:calc(30px + var(--dsh-content-font-delta));--dsw-font-markdown-h1-font-size:calc(21px + var(--dsh-content-font-delta));--dsw-font-markdown-h1-font-style:normal;--dsw-font-markdown-h2:700 calc(19px + var(--dsh-content-font-delta)) / calc(28px + var(--dsh-content-font-delta)) var(--dsw-font-family);--dsw-font-markdown-h2-font-family:var(--dsw-font-family);--dsw-font-markdown-h2-font-weight:700;--dsw-font-markdown-h2-line-height:calc(28px + var(--dsh-content-font-delta));--dsw-font-markdown-h2-font-size:calc(19px + var(--dsh-content-font-delta));--dsw-font-markdown-h2-font-style:normal;--dsw-font-markdown-h3:700 calc(18px + var(--dsh-content-font-delta)) / calc(26px + var(--dsh-content-font-delta)) var(--dsw-font-family);--dsw-font-markdown-h3-font-family:var(--dsw-font-family);--dsw-font-markdown-h3-font-weight:700;--dsw-font-markdown-h3-line-height:calc(26px + var(--dsh-content-font-delta));--dsw-font-markdown-h3-font-size:calc(18px + var(--dsh-content-font-delta));--dsw-font-markdown-h3-font-style:normal;--dsw-font-markdown-h4:600 var(--dsh-content-font-size,14px) / calc(24px + var(--dsh-content-font-delta)) var(--dsw-font-family);--dsw-font-markdown-h4-font-family:var(--dsw-font-family);--dsw-font-markdown-h4-font-weight:600;--dsw-font-markdown-h4-line-height:calc(24px + var(--dsh-content-font-delta));--dsw-font-markdown-h4-font-size:var(--dsh-content-font-size,14px);--dsw-font-markdown-h4-font-style:normal;--dsw-font-markdown-base:var(--dsh-content-font-size,14px) / calc(24px + var(--dsh-content-font-delta)) var(--dsw-font-family);--dsw-font-markdown-base-font-family:var(--dsw-font-family);--dsw-font-markdown-base-font-weight:400;--dsw-font-markdown-base-line-height:calc(24px + var(--dsh-content-font-delta));--dsw-font-markdown-base-font-size:var(--dsh-content-font-size,14px);--dsw-font-markdown-base-font-style:normal;--dsw-font-markdown-base-strong:600 var(--dsh-content-font-size,14px) / calc(24px + var(--dsh-content-font-delta)) var(--dsw-font-family);--dsw-font-markdown-base-strong-font-family:var(--dsw-font-family);--dsw-font-markdown-base-strong-font-weight:600;--dsw-font-markdown-base-strong-line-height:calc(24px + var(--dsh-content-font-delta));--dsw-font-markdown-base-strong-font-size:var(--dsh-content-font-size,14px);--dsw-font-markdown-base-strong-font-style:normal;--dsw-font-markdown-base-italic:italic var(--dsh-content-font-size,14px) / calc(24px + var(--dsh-content-font-delta)) var(--dsw-font-family);--dsw-font-markdown-base-italic-font-family:var(--dsw-font-family);--dsw-font-markdown-base-italic-font-weight:400;--dsw-font-markdown-base-italic-line-height:calc(24px + var(--dsh-content-font-delta));--dsw-font-markdown-base-italic-font-size:var(--dsh-content-font-size,14px);--dsw-font-markdown-base-italic-font-style:italic;--dsw-font-markdown-base-strong-italic:italic 600 var(--dsh-content-font-size,14px) / calc(24px + var(--dsh-content-font-delta)) var(--dsw-font-family);--dsw-font-markdown-base-strong-italic-font-family:var(--dsw-font-family);--dsw-font-markdown-base-strong-italic-font-weight:600;--dsw-font-markdown-base-strong-italic-line-height:calc(24px + var(--dsh-content-font-delta));--dsw-font-markdown-base-strong-italic-font-size:var(--dsh-content-font-size,14px);--dsw-font-markdown-base-strong-italic-font-style:italic;--dsw-font-markdown-table:var(--dsh-content-font-size-secondary,13px)/calc(22px + var(--dsh-content-font-delta-secondary,0px)) var(--dsw-font-family);--dsw-font-markdown-table-font-family:var(--dsw-font-family);--dsw-font-markdown-table-font-weight:400;--dsw-font-markdown-table-line-height:calc(22px + var(--dsh-content-font-delta-secondary,0px));--dsw-font-markdown-table-font-size:var(--dsh-content-font-size-secondary,13px);--dsw-font-markdown-table-font-style:normal;--dsw-font-markdown-table-head:500 var(--dsh-content-font-size-secondary,13px)/calc(22px + var(--dsh-content-font-delta-secondary,0px)) var(--dsw-font-family);--dsw-font-markdown-table-head-font-family:var(--dsw-font-family);--dsw-font-markdown-table-head-font-weight:500;--dsw-font-markdown-table-head-line-height:calc(22px + var(--dsh-content-font-delta-secondary,0px));--dsw-font-markdown-table-head-font-size:var(--dsh-content-font-size-secondary,13px);--dsw-font-markdown-table-head-font-style:normal;--dsw-font-markdown-small:12px/20px var(--dsw-font-family);--dsw-font-markdown-small-font-family:var(--dsw-font-family);--dsw-font-markdown-small-font-weight:400;--dsw-font-markdown-small-line-height:20px;--dsw-font-markdown-small-font-size:12px;--dsw-font-markdown-small-font-style:normal;--dsw-font-markdown-small-strong:600 12px/20px var(--dsw-font-family);--dsw-font-markdown-small-strong-font-family:var(--dsw-font-family);--dsw-font-markdown-small-strong-font-weight:600;--dsw-font-markdown-small-strong-line-height:20px;--dsw-font-markdown-small-strong-font-size:12px;--dsw-font-markdown-small-strong-font-style:normal;--dsw-font-markdown-small-italic:italic 12px/20px var(--dsw-font-family);--dsw-font-markdown-small-italic-font-family:var(--dsw-font-family);--dsw-font-markdown-small-italic-font-weight:400;--dsw-font-markdown-small-italic-line-height:20px;--dsw-font-markdown-small-italic-font-size:12px;--dsw-font-markdown-small-italic-font-style:italic;--dsw-font-markdown-small-strong-italic:italic 600 12px/20px var(--dsw-font-family);--dsw-font-markdown-small-strong-italic-font-family:var(--dsw-font-family);--dsw-font-markdown-small-strong-italic-font-weight:600;--dsw-font-markdown-small-strong-italic-line-height:20px;--dsw-font-markdown-small-strong-italic-font-size:12px;--dsw-font-markdown-small-strong-italic-font-style:italic;--dsw-font-markdown-code:calc(12px + var(--dsh-code-font-delta)) / calc(19px + var(--dsh-code-font-delta)) var(--ds-font-family-code);--dsw-font-markdown-code-font-family:var(--ds-font-family-code);--dsw-font-markdown-code-font-weight:400;--dsw-font-markdown-code-line-height:calc(19px + var(--dsh-code-font-delta));--dsw-font-markdown-code-font-size:calc(12px + var(--dsh-code-font-delta));--dsw-font-markdown-code-font-style:normal;--dsw-font-markdown-code-block:var(--dsh-code-font-size,11px) / calc(19px + var(--dsh-code-font-delta)) var(--ds-font-family-code);--dsw-font-markdown-code-block-font-family:var(--ds-font-family-code);--dsw-font-markdown-code-block-font-weight:400;--dsw-font-markdown-code-block-line-height:calc(19px + var(--dsh-code-font-delta));--dsw-font-markdown-code-block-font-size:var(--dsh-code-font-size,11px);--dsw-font-markdown-code-block-font-style:normal;--dsw-font-markdown-code-block-small:var(--dsh-code-font-size,11px) / calc(16px + var(--dsh-code-font-delta)) var(--ds-font-family-code);--dsw-font-markdown-code-block-small-font-family:var(--ds-font-family-code);--dsw-font-markdown-code-block-small-font-weight:400;--dsw-font-markdown-code-block-small-line-height:calc(16px + var(--dsh-code-font-delta));--dsw-font-markdown-code-block-small-font-size:var(--dsh-code-font-size,11px);--dsw-font-markdown-code-block-small-font-style:normal;--dsw-font-xl-24:600 24px/32px var(--dsw-font-family);--dsw-font-xl-24-font-family:var(--dsw-font-family);--dsw-font-xl-24-font-weight:600;--dsw-font-xl-24-line-height:32px;--dsw-font-xl-24-font-size:24px;--dsw-font-xl-24-font-style:normal;--dsw-font-l-20:500 20px/28px var(--dsw-font-family);--dsw-font-l-20-font-family:var(--dsw-font-family);--dsw-font-l-20-font-weight:500;--dsw-font-l-20-line-height:28px;--dsw-font-l-20-font-size:20px;--dsw-font-l-20-font-style:normal;--dsw-font-m-18:500 16px/28px var(--dsw-font-family);--dsw-font-m-18-font-family:var(--dsw-font-family);--dsw-font-m-18-font-weight:500;--dsw-font-m-18-line-height:28px;--dsw-font-m-18-font-size:16px;--dsw-font-m-18-font-style:normal;--dsw-font-base-16:16px/24px var(--dsw-font-family);--dsw-font-base-16-font-family:var(--dsw-font-family);--dsw-font-base-16-font-weight:400;--dsw-font-base-16-line-height:24px;--dsw-font-base-16-font-size:16px;--dsw-font-base-16-font-style:normal;--dsw-font-base-strong-16:500 16px/24px var(--dsw-font-family);--dsw-font-base-strong-16-font-family:var(--dsw-font-family);--dsw-font-base-strong-16-font-weight:500;--dsw-font-base-strong-16-line-height:24px;--dsw-font-base-strong-16-font-size:16px;--dsw-font-base-strong-16-font-style:normal;--dsw-font-s-14:14px/22px var(--dsw-font-family);--dsw-font-s-14-font-family:var(--dsw-font-family);--dsw-font-s-14-font-weight:400;--dsw-font-s-14-line-height:22px;--dsw-font-s-14-font-size:14px;--dsw-font-s-14-font-style:normal;--dsw-font-s-strong-14:500 14px/22px var(--dsw-font-family);--dsw-font-s-strong-14-font-family:var(--dsw-font-family);--dsw-font-s-strong-14-font-weight:500;--dsw-font-s-strong-14-line-height:22px;--dsw-font-s-strong-14-font-size:14px;--dsw-font-s-strong-14-font-style:normal;--dsw-font-xs-13:13px/20px var(--dsw-font-family);--dsw-font-xs-13-font-family:var(--dsw-font-family);--dsw-font-xs-13-font-weight:400;--dsw-font-xs-13-line-height:20px;--dsw-font-xs-13-font-size:13px;--dsw-font-xs-13-font-style:normal;--dsw-font-xs-strong-13:500 13px/20px var(--dsw-font-family);--dsw-font-xs-strong-13-font-family:var(--dsw-font-family);--dsw-font-xs-strong-13-font-weight:500;--dsw-font-xs-strong-13-line-height:20px;--dsw-font-xs-strong-13-font-size:13px;--dsw-font-xs-strong-13-font-style:normal;--dsw-font-xxs-12:12px/18px var(--dsw-font-family);--dsw-font-xxs-12-font-family:var(--dsw-font-family);--dsw-font-xxs-12-font-weight:400;--dsw-font-xxs-12-line-height:18px;--dsw-font-xxs-12-font-size:12px;--dsw-font-xxs-12-font-style:normal;--dsw-font-xxs-strong-12:500 12px/18px var(--dsw-font-family);--dsw-font-xxs-strong-12-font-family:var(--dsw-font-family);--dsw-font-xxs-strong-12-font-weight:500;--dsw-font-xxs-strong-12-line-height:18px;--dsw-font-xxs-strong-12-font-size:12px;--dsw-font-xxs-strong-12-font-style:normal;--dsw-font-xxxs-11:11px/14px var(--dsw-font-family);--dsw-font-xxxs-11-font-family:var(--dsw-font-family);--dsw-font-xxxs-11-font-weight:400;--dsw-font-xxxs-11-line-height:14px;--dsw-font-xxxs-11-font-size:11px;--dsw-font-xxxs-11-font-style:normal;--dsw-font-xxxs-strong-11:500 11px/14px var(--dsw-font-family);--dsw-font-xxxs-strong-11-font-family:var(--dsw-font-family);--dsw-font-xxxs-strong-11-font-weight:500;--dsw-font-xxxs-strong-11-line-height:14px;--dsw-font-xxxs-strong-11-font-size:11px;--dsw-font-xxxs-strong-11-font-style:normal}";
		//#endregion
		//#region \0dsh-inline-css:/home/endpca/.cache/dreamstory-harness.4tbaSx/packages/client/ui-theme/src/styles/shiki.css.mjs
		var shiki_css_default = ":root{--shiki-foreground:var(--dsw-alias-label-primary);--shiki-background:var(--dsw-alias-markdown-code-block);--shiki-token-constant:#1c7ed6;--shiki-token-string:#2f9e44;--shiki-token-comment:#868e96;--shiki-token-keyword:#d6336c;--shiki-token-parameter:#e8590c;--shiki-token-function:#6741d9;--shiki-token-string-expression:#2b8a3e;--shiki-token-punctuation:#495057;--shiki-token-link:#1971c2}body[data-ds-dark-theme]{--shiki-token-constant:#4dabf7;--shiki-token-string:#69db7c;--shiki-token-comment:#adb5bd;--shiki-token-keyword:#faa2c1;--shiki-token-parameter:#ffa94d;--shiki-token-function:#b197fc;--shiki-token-string-expression:#8ce99a;--shiki-token-punctuation:#ced4da;--shiki-token-link:#74c0fc}";
		//#endregion
		//#region lib/types/client/styles.js
		const PLUGIN_ID = "@deepseek-ai/dsh-client-ui-theme";
		const HAIRLINE_WIDTH = "--dsh-hairline-width";
		const STYLES = [
			["base.css", base_css_default],
			["corner-shape.css", corner_shape_css_default],
			["design-platform.css", design_platform_css_default],
			["focus.css", focus_css_default],
			["onboarding.css", onboarding_css_default],
			["scrollbar.css", scrollbar_css_default],
			["gradient-shadow-text.css", gradient_shadow_text_css_default],
			["shiki.css", shiki_css_default]
		];
		/**
		* Mount global theme sheets; window-backed documents also publish the DPR-aware stroke width.
		* @param ctx - Owning plugin context.
		*/
		function installThemeStyles(ctx) {
			if (typeof document === "undefined") return;
			const view = document.defaultView;
			if (view !== null) ctx.effect(() => {
				const root = document.documentElement;
				const previousWidth = root.style.getPropertyValue(HAIRLINE_WIDTH);
				const previousPriority = root.style.getPropertyPriority(HAIRLINE_WIDTH);
				const matchMedia = typeof view.matchMedia === "function" ? view.matchMedia.bind(view) : void 0;
				let resolution;
				const updateStroke = () => {
					const dpr = view.devicePixelRatio;
					const width = Math.max(1, Math.floor(.5 * dpr)) / dpr;
					root.style.setProperty(HAIRLINE_WIDTH, `${width}px`);
					resolution?.removeEventListener("change", updateStroke);
					resolution = matchMedia?.(`(resolution: ${dpr}dppx)`);
					resolution?.addEventListener("change", updateStroke);
				};
				updateStroke();
				return () => {
					resolution?.removeEventListener("change", updateStroke);
					if (previousWidth === "") root.style.removeProperty(HAIRLINE_WIDTH);
					else root.style.setProperty(HAIRLINE_WIDTH, previousWidth, previousPriority);
				};
			}, "ui-theme: DPR-aware hairline width");
			for (const [name, css] of STYLES) ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = PLUGIN_ID;
				tag.dataset.pluginCss = `${PLUGIN_ID}/${name}`;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, `ui-theme: ${name} stylesheet`);
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** `settings.theme` namespace dictionaries (the Appearance and font settings rows' copy). */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"appearance.title": "外观",
			"appearance.light": "浅色",
			"appearance.dark": "深色",
			"appearance.system": "跟随系统",
			"fontSize.text.title": "字号大小",
			"fontSize.text.description": "仅影响会话内容的字号",
			"fontSize.text.increase": "增大字号",
			"fontSize.text.decrease": "减小字号",
			"fontSize.code.title": "代码字号",
			"fontSize.code.description": "用于代码块、行内代码与工具输出",
			"fontSize.code.increase": "增大代码字号",
			"fontSize.code.decrease": "减小代码字号",
			"fontSize.terminal.title": "终端字号",
			"fontSize.terminal.description": "用于侧栏终端",
			"fontSize.terminal.increase": "增大终端字号",
			"fontSize.terminal.decrease": "减小终端字号",
			"fontSize.unit": "px",
			"fontFamily.text.title": "正文字体",
			"fontFamily.text.description": "用于界面与会话正文。多个字体用逗号分隔，留空使用默认字体",
			"fontFamily.code.title": "代码字体",
			"fontFamily.code.description": "用于代码块、行内代码与工具输出。多个字体用逗号分隔，留空使用默认字体",
			"fontFamily.terminal.title": "终端字体",
			"fontFamily.terminal.description": "用于侧栏终端。多个字体用逗号分隔，留空使用默认字体",
			"fontFamily.placeholder": "默认",
			"fontSize.more": "更多字体设置"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"appearance.title": "Appearance",
			"appearance.light": "Light",
			"appearance.dark": "Dark",
			"appearance.system": "System",
			"fontSize.text.title": "Font size",
			"fontSize.text.description": "Only affects conversation content",
			"fontSize.text.increase": "Increase font size",
			"fontSize.text.decrease": "Decrease font size",
			"fontSize.code.title": "Code font size",
			"fontSize.code.description": "Used for code blocks, inline code, and tool output",
			"fontSize.code.increase": "Increase code font size",
			"fontSize.code.decrease": "Decrease code font size",
			"fontSize.terminal.title": "Terminal font size",
			"fontSize.terminal.description": "Used for the sidebar terminal",
			"fontSize.terminal.increase": "Increase terminal font size",
			"fontSize.terminal.decrease": "Decrease terminal font size",
			"fontSize.unit": "px",
			"fontFamily.text.title": "Text font",
			"fontFamily.text.description": "Used for the interface and conversation text. Separate fonts with commas; leave empty for the default",
			"fontFamily.code.title": "Code font",
			"fontFamily.code.description": "Used for code blocks, inline code, and tool output. Separate fonts with commas; leave empty for the default",
			"fontFamily.terminal.title": "Terminal font",
			"fontFamily.terminal.description": "Used for the sidebar terminal. Separate fonts with commas; leave empty for the default",
			"fontFamily.placeholder": "Default",
			"fontSize.more": "More font settings"
		};
		/** Japanese copy, checked against the English keys. */
		const ja = {
			"appearance.title": "外観",
			"appearance.light": "ライト",
			"appearance.dark": "ダーク",
			"appearance.system": "システム",
			"fontSize.text.title": "フォントサイズ",
			"fontSize.text.description": "会話コンテンツにのみ適用",
			"fontSize.text.increase": "フォントサイズを大きくする",
			"fontSize.text.decrease": "フォントサイズを小さくする",
			"fontSize.code.title": "コードのフォントサイズ",
			"fontSize.code.description": "コードブロック、インラインコード、ツール出力に使用",
			"fontSize.code.increase": "コードのフォントサイズを大きくする",
			"fontSize.code.decrease": "コードのフォントサイズを小さくする",
			"fontSize.terminal.title": "ターミナルのフォントサイズ",
			"fontSize.terminal.description": "サイドバーのターミナルに使用",
			"fontSize.terminal.increase": "ターミナルのフォントサイズを大きくする",
			"fontSize.terminal.decrease": "ターミナルのフォントサイズを小さくする",
			"fontSize.unit": "px",
			"fontFamily.text.title": "テキストフォント",
			"fontFamily.text.description": "インターフェースと会話テキストに使用します。フォントはカンマで区切ります。空欄の場合はデフォルトを使用",
			"fontFamily.code.title": "コードフォント",
			"fontFamily.code.description": "コードブロック、インラインコード、ツール出力に使用します。フォントはカンマで区切ります。空欄の場合はデフォルトを使用",
			"fontFamily.terminal.title": "ターミナルフォント",
			"fontFamily.terminal.description": "サイドバーのターミナルに使用します。フォントはカンマで区切ります。空欄の場合はデフォルトを使用",
			"fontFamily.placeholder": "デフォルト",
			"fontSize.more": "その他のフォント設定"
		};
		/** Spanish dictionary, checked against the English keys. */
		const es = {
			"appearance.title": "Apariencia",
			"appearance.light": "Claro",
			"appearance.dark": "Oscuro",
			"appearance.system": "Sistema",
			"fontSize.text.title": "Tamaño de fuente",
			"fontSize.text.description": "Sólo afecta al contenido de la conversación.",
			"fontSize.text.increase": "Aumentar el tamaño de fuente",
			"fontSize.text.decrease": "Disminuir el tamaño de fuente",
			"fontSize.code.title": "Tamaño de fuente del código",
			"fontSize.code.description": "Se utiliza para bloques de código, código en línea y salida de herramientas.",
			"fontSize.code.increase": "Aumentar el tamaño de fuente del código",
			"fontSize.code.decrease": "Disminuir el tamaño de fuente del código",
			"fontSize.terminal.title": "Tamaño de fuente del terminal",
			"fontSize.terminal.description": "Utilizado para el terminal de la barra lateral.",
			"fontSize.terminal.increase": "Aumentar el tamaño de fuente del terminal",
			"fontSize.terminal.decrease": "Disminuir el tamaño de fuente del terminal",
			"fontSize.unit": "píxeles",
			"fontFamily.text.title": "Fuente de texto",
			"fontFamily.text.description": "Se utiliza para la interfaz y el texto de la conversación. Separe las fuentes con comas; dejar vacío por defecto",
			"fontFamily.code.title": "Fuente de código",
			"fontFamily.code.description": "Se utiliza para bloques de código, código en línea y salida de herramientas. Separe las fuentes con comas; dejar vacío por defecto",
			"fontFamily.terminal.title": "Fuente terminal",
			"fontFamily.terminal.description": "Se utiliza para el terminal de la barra lateral. Separe las fuentes con comas; dejar vacío por defecto",
			"fontFamily.placeholder": "Predeterminado",
			"fontSize.more": "Más configuraciones de fuente"
		};
		/** French dictionary, checked against the English keys. */
		const fr = {
			"appearance.title": "Apparence",
			"appearance.light": "Clair",
			"appearance.dark": "Sombre",
			"appearance.system": "Système",
			"fontSize.text.title": "Taille de la police",
			"fontSize.text.description": "Affecte uniquement le contenu de la conversation",
			"fontSize.text.increase": "Augmenter la taille de la police",
			"fontSize.text.decrease": "Diminuer la taille de la police",
			"fontSize.code.title": "Taille de la police du code",
			"fontSize.code.description": "Utilisé pour les blocs de code, le code en ligne et la sortie de l'outil",
			"fontSize.code.increase": "Augmenter la taille de la police du code",
			"fontSize.code.decrease": "Diminuer la taille de la police du code",
			"fontSize.terminal.title": "Taille de la police du terminal",
			"fontSize.terminal.description": "Utilisé pour le terminal de la barre latérale",
			"fontSize.terminal.increase": "Augmenter la taille de la police du terminal",
			"fontSize.terminal.decrease": "Diminuer la taille de la police du terminal",
			"fontSize.unit": "px",
			"fontFamily.text.title": "Police du texte",
			"fontFamily.text.description": "Utilisé pour l'interface et le texte de la conversation. Séparez les polices par des virgules\xA0; laisser vide pour la valeur par défaut",
			"fontFamily.code.title": "Police de code",
			"fontFamily.code.description": "Utilisé pour les blocs de code, le code en ligne et la sortie de l'outil. Séparez les polices par des virgules\xA0; laisser vide pour la valeur par défaut",
			"fontFamily.terminal.title": "Police du terminal",
			"fontFamily.terminal.description": "Utilisé pour le terminal de la barre latérale. Séparez les polices par des virgules\xA0; laisser vide pour la valeur par défaut",
			"fontFamily.placeholder": "Par défaut",
			"fontSize.more": "Plus de paramètres de police"
		};
		/** German dictionary, checked against the English keys. */
		const de = {
			"appearance.title": "Aussehen",
			"appearance.light": "Hell",
			"appearance.dark": "Dunkel",
			"appearance.system": "System",
			"fontSize.text.title": "Schriftgröße",
			"fontSize.text.description": "Betrifft nur Konversationsinhalte",
			"fontSize.text.increase": "Schriftgröße erhöhen",
			"fontSize.text.decrease": "Schriftgröße verringern",
			"fontSize.code.title": "Code-Schriftgröße",
			"fontSize.code.description": "Wird für Codeblöcke, Inline-Code und Tool-Ausgabe verwendet",
			"fontSize.code.increase": "Erhöhen Sie die Schriftgröße des Codes",
			"fontSize.code.decrease": "Verringern Sie die Schriftgröße des Codes",
			"fontSize.terminal.title": "Terminal-Schriftgröße",
			"fontSize.terminal.description": "Wird für das Sidebar-Terminal verwendet",
			"fontSize.terminal.increase": "Erhöhen Sie die Schriftgröße des Terminals",
			"fontSize.terminal.decrease": "Verringern Sie die Schriftgröße des Terminals",
			"fontSize.unit": "px",
			"fontFamily.text.title": "Textschriftart",
			"fontFamily.text.description": "Wird für die Benutzeroberfläche und den Konversationstext verwendet. Trennen Sie Schriftarten durch Kommas. Für die Standardeinstellung leer lassen",
			"fontFamily.code.title": "Codeschriftart",
			"fontFamily.code.description": "Wird für Codeblöcke, Inline-Code und Tool-Ausgabe verwendet. Trennen Sie Schriftarten durch Kommas. Für die Standardeinstellung leer lassen",
			"fontFamily.terminal.title": "Terminal-Schriftart",
			"fontFamily.terminal.description": "Wird für das Sidebar-Terminal verwendet. Trennen Sie Schriftarten durch Kommas. Für die Standardeinstellung leer lassen",
			"fontFamily.placeholder": "Standard",
			"fontSize.more": "Weitere Schriftarteinstellungen"
		};
		/** Russian dictionary, checked against the English keys. */
		const ru = {
			"appearance.title": "Внешний вид",
			"appearance.light": "Светлая",
			"appearance.dark": "Тёмная",
			"appearance.system": "Система",
			"fontSize.text.title": "Размер шрифта",
			"fontSize.text.description": "Влияет только на содержание разговора",
			"fontSize.text.increase": "Увеличить размер шрифта",
			"fontSize.text.decrease": "Уменьшить размер шрифта",
			"fontSize.code.title": "Размер шрифта кода",
			"fontSize.code.description": "Используется для блоков кода, встроенного кода и выходных данных инструмента.",
			"fontSize.code.increase": "Увеличить размер шрифта кода",
			"fontSize.code.decrease": "Уменьшить размер шрифта кода",
			"fontSize.terminal.title": "Размер шрифта терминала",
			"fontSize.terminal.description": "Используется для терминала боковой панели",
			"fontSize.terminal.increase": "Увеличьте размер шрифта терминала",
			"fontSize.terminal.decrease": "Уменьшить размер шрифта терминала",
			"fontSize.unit": "пикселей",
			"fontFamily.text.title": "Текстовый шрифт",
			"fontFamily.text.description": "Используется для интерфейса и текста разговора. Разделяйте шрифты запятыми; оставьте пустым по умолчанию",
			"fontFamily.code.title": "Шрифт кода",
			"fontFamily.code.description": "Используется для блоков кода, встроенного кода и выходных данных инструмента. Разделяйте шрифты запятыми; оставьте пустым по умолчанию",
			"fontFamily.terminal.title": "Шрифт терминала",
			"fontFamily.terminal.description": "Используется для терминала боковой панели. Разделяйте шрифты запятыми; оставьте пустым по умолчанию",
			"fontFamily.placeholder": "По умолчанию",
			"fontSize.more": "Дополнительные настройки шрифта"
		};
		/** Portuguese dictionary, checked against the English keys. */
		const pt = {
			"appearance.title": "Aparência",
			"appearance.light": "Claro",
			"appearance.dark": "Escuro",
			"appearance.system": "Sistema",
			"fontSize.text.title": "Tamanho da fonte",
			"fontSize.text.description": "Afeta apenas o conteúdo da conversa",
			"fontSize.text.increase": "Aumentar o tamanho da fonte",
			"fontSize.text.decrease": "Diminuir o tamanho da fonte",
			"fontSize.code.title": "Tamanho da fonte do código",
			"fontSize.code.description": "Usado para blocos de código, código embutido e saída de ferramenta",
			"fontSize.code.increase": "Aumentar o tamanho da fonte do código",
			"fontSize.code.decrease": "Diminuir o tamanho da fonte do código",
			"fontSize.terminal.title": "Tamanho da fonte do terminal",
			"fontSize.terminal.description": "Usado para o terminal da barra lateral",
			"fontSize.terminal.increase": "Aumentar o tamanho da fonte do terminal",
			"fontSize.terminal.decrease": "Diminuir o tamanho da fonte do terminal",
			"fontSize.unit": "pixels",
			"fontFamily.text.title": "Fonte do texto",
			"fontFamily.text.description": "Usado para interface e texto de conversa. Separe as fontes com vírgulas; deixe em branco para o padrão",
			"fontFamily.code.title": "Fonte do código",
			"fontFamily.code.description": "Usado para blocos de código, código embutido e saída de ferramenta. Separe as fontes com vírgulas; deixe em branco para o padrão",
			"fontFamily.terminal.title": "Fonte terminal",
			"fontFamily.terminal.description": "Usado para o terminal da barra lateral. Separe as fontes com vírgulas; deixe em branco para o padrão",
			"fontFamily.placeholder": "Padrão",
			"fontSize.more": "Mais configurações de fonte"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Namespace owning this feature's settings-row copy. */
		const SETTINGS_NS = "settings.theme";
		const BUILTIN_THEMES = Object.freeze([Object.freeze({
			id: "light",
			colorScheme: "light",
			tokens: Object.freeze({})
		}), Object.freeze({
			id: "dark",
			colorScheme: "dark",
			tokens: Object.freeze({})
		})]);
		const BUILTIN_INSPECT_TOKENS = Object.freeze([
			{
				name: "--dsw-alias-bg-base",
				description: "Application base background.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-bg-base"
			},
			{
				name: "--dsw-alias-bg-layer-1",
				description: "Primary raised surface background.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-bg-layer-1"
			},
			{
				name: "--dsw-alias-bg-layer-2",
				description: "Secondary nested surface background.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-bg-layer-2"
			},
			{
				name: "--dsw-alias-bg-overlay",
				description: "Overlay and popover background.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-bg-overlay"
			},
			{
				name: "--dsw-alias-border-l1",
				description: "Primary subtle border.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-border-l1"
			},
			{
				name: "--dsw-alias-border-l2",
				description: "Secondary stronger border.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-border-l2"
			},
			{
				name: "--dsw-alias-brand-primary",
				description: "Primary brand accent.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-brand-primary"
			},
			{
				name: "--dsw-alias-label-primary",
				description: "Primary text color.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-label-primary"
			},
			{
				name: "--dsw-alias-label-secondary",
				description: "Secondary text color.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-label-secondary"
			},
			{
				name: "--dsw-alias-state-error-primary",
				description: "Primary error state color.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-state-error-primary"
			},
			{
				name: "--dsw-alias-state-idle-primary",
				description: "Primary inactive state color.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-state-idle-primary"
			},
			{
				name: "--dsw-alias-state-success-primary",
				description: "Primary success state color.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-state-success-primary"
			},
			{
				name: "--dsw-alias-state-warn-primary",
				description: "Primary warning state color.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-alias-state-warn-primary"
			},
			{
				name: "--dsw-specific-sidebar-fill",
				description: "Sidebar column and title-row background.",
				valueType: "CSS color",
				requiresLightAndDark: true,
				cssVariable: "--dsw-specific-sidebar-fill"
			}
		]);
		/**
		* Theme registry and preference owner. `light`/`dark` are built in (the base
		* stylesheets carry both palettes); third-party themes register alias-layer
		* overrides. Reads go through {@link getTheme}; preference writes only
		* through {@link setTheme}; continuous sync only through the `theme/change`
		* event. {@link overrideTokens} stacks partial token layers over the active
		* theme without touching the registry.
		* The service holds the `prefers-color-scheme` media query (environment
		* sensing, not presentation) and re-emits when the OS scheme flips while the
		* preference is `system`.
		*/
		var ThemeRuntime = class {
			ctx;
			host;
			themes = [...BUILTIN_THEMES];
			preference;
			fontSizes = bootstrapFontSizes();
			fontFamilies = bootstrapFontFamilies();
			revision = 0;
			/** Own settings writes not yet settled; adoption waits for zero so a Host echo of an earlier write cannot revert a later local change. */
			pendingWrites = 0;
			snapshot;
			media;
			/** Override layers by source; seq (monotonic) is the stacking order. */
			overrides = /* @__PURE__ */ new Map();
			overrideSeq = 0;
			/**
			* @param ctx - owning context (change events are emitted on it; the
			* media-query and scope listeners are released through ctx.effect on dispose).
			* @param host - durable preference scope owned by the same plugin.
			*/
			constructor(ctx, host) {
				this.ctx = ctx;
				this.host = host;
				this.preference = DEFAULT_PREFERENCE;
				this.media = typeof matchMedia === "undefined" ? void 0 : matchMedia("(prefers-color-scheme: dark)");
				this.snapshot = this.buildSnapshot();
				if (this.media !== void 0) {
					const media = this.media;
					const onChange = () => {
						if (this.preference !== "system") return;
						this.publish();
					};
					ctx.effect(() => {
						media.addEventListener("change", onChange);
						return () => {
							media.removeEventListener("change", onChange);
						};
					}, "ui-theme: prefers-color-scheme listener");
				}
				ctx.effect(() => host.subscribe(() => {
					this.adopt();
				}), "ui-theme: settings scope adoption");
				this.adopt();
				installFontSizeShortcuts(ctx, (delta) => {
					this.adjustFontSizes(delta);
				});
			}
			/**
			* Read the current immutable theme snapshot.
			* @returns the current snapshot (stable reference until the next change).
			*/
			getTheme() {
				return this.snapshot;
			}
			/**
			* Export the current token directory without reading DOM or computed styles.
			* @returns stable JSON-safe token descriptions, including registered and override-only names.
			*/
			exportInspectTokens() {
				const tokens = new Map(BUILTIN_INSPECT_TOKENS.map((token) => [token.name, token]));
				for (const theme of this.themes) for (const name of Object.keys(theme.tokens)) if (!tokens.has(name)) tokens.set(name, dynamicToken(name));
				for (const layer of this.overrides.values()) for (const name of Object.keys(layer.tokens)) if (!tokens.has(name)) tokens.set(name, dynamicToken(name));
				return [...tokens.values()].map((token) => ({ ...token })).sort((left, right) => left.name.localeCompare(right.name));
			}
			/**
			* Switch the theme preference — the only user preference write entry.
			* Built-in preferences are written through the settings scope and every
			* accepted value emits `theme/change`.
			* @param id - a registered theme id or `system`; unknown ids throw.
			*/
			setTheme(id) {
				if (id !== "system" && !this.themes.some((t) => t.id === id)) throw new Error(`theme "${id}" is not registered`);
				if (this.preference === id) return;
				this.preference = id;
				if (isThemePreference(id)) this.write(() => this.host.set(THEME_PREFERENCE_FIELD, id));
				this.publish();
			}
			/**
			* Change one role's font size. Accepted
			* values are written through the settings scope and emit `theme/change`.
			* @param role - font role.
			* @param px - integer px within the role's `FONT_SIZE_SPECS` range; out-of-range or fractional values throw.
			*/
			setFontSize(role, px) {
				const spec = FONT_SIZE_SPECS[role];
				if (!isFontSize(role, px)) throw new Error(`${role} font size ${px} is outside ${spec.min}..${spec.max}`);
				if (this.fontSizes[role] === px) return;
				this.fontSizes = Object.freeze({
					...this.fontSizes,
					[role]: px
				});
				this.write(() => this.host.set(spec.field, px));
				this.publish();
			}
			/**
			* Step all font sizes within their own ranges and save changed fields in one mutation.
			* Emits one `theme/change`; no write or event occurs when every role is at its limit.
			* @param delta - one pixel to add or remove from each role's current size.
			*/
			adjustFontSizes(delta) {
				const fontSizes = { ...this.fontSizes };
				const fields = {};
				for (const role of FONT_ROLES) {
					const { field, min, max } = FONT_SIZE_SPECS[role];
					const px = Math.max(min, Math.min(max, fontSizes[role] + delta));
					if (px === fontSizes[role]) continue;
					fontSizes[role] = px;
					fields[field] = px;
				}
				const ops = Object.entries(fields).map(([field, value]) => ({
					op: "set",
					path: [field],
					value
				}));
				if (ops.length === 0) return;
				this.fontSizes = Object.freeze(fontSizes);
				this.write(() => this.host.mutate(ops));
				this.publish();
			}
			/**
			* Change one role's font list — the only font-family write entry. The value
			* is normalized, written through the settings scope, and emits `theme/change`
			* when the normalized list differs.
			* @param role - font role.
			* @param value - comma-separated family names; a value without names restores the built-in stack.
			*/
			setFontFamily(role, value) {
				const list = normalizeFontFamily(value);
				if (this.fontFamilies[role] === list) return;
				this.fontFamilies = Object.freeze({
					...this.fontFamilies,
					[role]: list
				});
				this.write(() => this.host.set(FONT_FAMILY_FIELDS[role], list));
				this.publish();
			}
			/** Queue one settings write, then adopt the durable section once no own write remains. */
			write(operation) {
				this.pendingWrites += 1;
				operation().finally(() => {
					this.pendingWrites -= 1;
					this.adopt();
				});
			}
			/** Adopt the scope's accepted durable preference without writing it back. */
			adopt() {
				if (this.pendingWrites > 0) return;
				const section = this.host.getSnapshot().value;
				if (section === void 0) return;
				const fontFamilies = durableFontFamilies(section);
				const fontSizes = sectionFontSizes(section);
				if (this.preference === section.preference && FONT_ROLES.every((role) => this.fontSizes[role] === fontSizes[role] && this.fontFamilies[role] === fontFamilies[role])) return;
				this.preference = section.preference;
				this.fontSizes = fontSizes;
				this.fontFamilies = fontFamilies;
				this.publish();
			}
			/**
			* Register a theme. Duplicate id throws (single occupant per id; the
			* built-in pair counts; `system` is a preference, not a registrable id).
			* @param definition - theme id, colorScheme, alias-token overrides, and
			* optional icon replacements; the runtime keeps a frozen copy of `icons`.
			* Invalid icon replacements throw a `TypeError` naming the theme and icon.
			* @returns disposer. Disposing the theme backing the active preference
			* resets the preference to the default so the UI never keeps tokens of an
			* unregistered theme.
			*/
			register(definition) {
				if (definition.id === "system") throw new Error("\"system\" is a preference, not a registrable theme id");
				if (this.themes.some((t) => t.id === definition.id)) throw new Error(`theme "${definition.id}" is already registered`);
				const icons = validateIcons(definition);
				this.themes = [...this.themes, Object.freeze({
					...definition,
					icons
				})];
				this.publish();
				return () => {
					if (!this.themes.some((t) => t.id === definition.id)) return;
					this.themes = this.themes.filter((t) => t.id !== definition.id);
					if (this.preference === definition.id) this.preference = DEFAULT_PREFERENCE;
					this.publish();
				};
			}
			/**
			* Stack a token override layer on top of the active theme — the token-level
			* analogue of slot shading: the base theme stays untouched, layers compose
			* in seq order with later layers winning per-token, and removing a layer
			* restores whatever it covered. Calling again with the same source replaces
			* that source's whole layer and restacks it on top (effect re-registration
			* semantics). Emits `theme/change` with the recomposed snapshot.
			* @param source - layer identity; one layer per source (dynamic packages
			* pass their package id — the façade pins it, so it also names the layer's
			* origin for inspection).
			* @param tokens - token-name → `{ light, dark }` value pairs. Validated at
			* runtime (model-authored callers reach this boundary with untyped JS);
			* a bare string value throws a teaching error.
			* @returns disposer removing exactly the layer this call created; a no-op
			* once the source has re-overridden (the newer layer is not torn down).
			*/
			overrideTokens(source, tokens) {
				const layer = {
					seq: this.overrideSeq++,
					tokens: validateOverrides(source, tokens)
				};
				this.overrides.set(source, layer);
				this.publish();
				return () => {
					if (this.overrides.get(source) !== layer) return;
					this.overrides.delete(source);
					this.publish();
				};
			}
			buildSnapshot() {
				const resolvedId = this.preference === "system" ? this.media?.matches === true ? "dark" : "light" : this.preference;
				const active = this.themes.find((t) => t.id === resolvedId);
				/* v8 ignore next 2 -- needs a registry without light/dark, which register()/dispose() cannot produce */
				if (active === void 0) throw new Error(`theme registry lost "${resolvedId}"`);
				return Object.freeze({
					preference: this.preference,
					fontSizes: this.fontSizes,
					fontFamilies: this.fontFamilies,
					active: this.composeActive(active),
					themes: Object.freeze([...this.themes]),
					revision: this.revision
				});
			}
			/**
			* Fold the override layers into the active definition: seq order, later
			* layers win per-token, each value picked for the active color scheme (the
			* presenter consumes the composed snapshot and needs no override awareness).
			* Without layers the registered definition passes through by identity.
			*/
			composeActive(active) {
				if (this.overrides.size === 0) return active;
				const tokens = { ...active.tokens };
				for (const layer of [...this.overrides.values()].sort((a, b) => a.seq - b.seq)) for (const [name, modes] of Object.entries(layer.tokens)) tokens[name] = modes[active.colorScheme];
				return Object.freeze({
					...active,
					tokens: Object.freeze(tokens)
				});
			}
			publish() {
				this.revision += 1;
				this.snapshot = this.buildSnapshot();
				this.ctx.emit("theme/change", this.snapshot);
			}
		};
		/**
		* Read the font sizes the Host boot script wrote on `body` before any plugin
		* ran, so the initial snapshot matches first paint and ui-layout's presenter
		* does not flash the schema defaults while the settings read is in flight.
		* Non-browser runs, mounts without the boot script, and out-of-range values
		* fall back to each role's default; the durable settings adoption still lands afterwards.
		*/
		function bootstrapFontSizes() {
			/* v8 ignore next -- needs a documentless run (node e2e booting the client tree), not constructible under jsdom */
			if (typeof document === "undefined") return DEFAULT_FONT_SIZES;
			const read = (role) => {
				const parsed = Number.parseInt(document.body.style.getPropertyValue(FONT_SIZE_SPECS[role].variable), 10);
				return isFontSize(role, parsed) ? parsed : FONT_SIZE_SPECS[role].default;
			};
			return Object.freeze({
				text: read("text"),
				code: read("code"),
				terminal: read("terminal")
			});
		}
		/** Font lists the Host boot script wrote on `body`, read for the same first-paint reason as {@link bootstrapFontSizes}. */
		function bootstrapFontFamilies() {
			/* v8 ignore next -- needs a documentless run (node e2e booting the client tree), not constructible under jsdom */
			if (typeof document === "undefined") return Object.freeze({
				text: "",
				code: "",
				terminal: ""
			});
			const style = document.body.style;
			return Object.freeze({
				text: normalizeFontFamily(style.getPropertyValue(fontFamilyVariable("text"))),
				code: normalizeFontFamily(style.getPropertyValue(fontFamilyVariable("code"))),
				terminal: normalizeFontFamily(style.getPropertyValue(fontFamilyVariable("terminal")))
			});
		}
		/** Normalized font lists from one accepted settings section (hand-edited documents may hold raw input). */
		function durableFontFamilies(section) {
			return Object.freeze({
				text: normalizeFontFamily(section.textFontFamily),
				code: normalizeFontFamily(section.codeFontFamily),
				terminal: normalizeFontFamily(section.terminalFontFamily)
			});
		}
		/**
		* Runtime shape check for one override layer (model-authored callers pass
		* untyped JS through the dynamic-package façade, so the static type cannot
		* enforce the pair shape there). Returns a defensive per-token copy so later
		* caller mutation cannot reach the stored layer.
		*/ function validateOverrides(source, tokens) {
			const validated = {};
			for (const [name, value] of Object.entries(tokens)) {
				if (typeof value === "string") throw new TypeError(`theme override "${name}" from "${source}" is a bare string — pass { light: ${JSON.stringify(value)}, dark: ${JSON.stringify(value)} } (repeat the value when it is the same in both palettes); a single value goes illegible when the user switches color scheme`);
				if (typeof value !== "object" || value === null || typeof value.light !== "string" || typeof value.dark !== "string") throw new TypeError(`theme override "${name}" from "${source}" must map to a { light, dark } pair of strings — one value per color scheme`);
				const modes = value;
				validated[name] = {
					light: modes.light,
					dark: modes.dark
				};
			}
			return validated;
		}
		const SVG_NS = "http://www.w3.org/2000/svg";
		/**
		* Reject icon replacements a sprite cannot render (untyped dynamic-package
		* callers reach this boundary, as with {@link validateOverrides}): unknown
		* symbol ids, documents without an SVG-namespace `<svg viewBox>` root,
		* document-wide `<style>` or `<script>`, and element ids outside the
		* symbol's own `<symbol id>-` namespace.
		* @returns a frozen copy of the replacements, or undefined when there are none.
		*/
		function validateIcons({ id, icons }) {
			if (icons == null) return void 0;
			const copy = {};
			for (const [name, markup] of Object.entries(icons)) {
				const fail = (problem) => {
					throw new TypeError(`theme "${id}" icon "${name}" ${problem}`);
				};
				if (!Object.hasOwn(_deepseek_ai_dsh_client_ui_primitives.ICON_SYMBOLS, name)) fail("is not an ICON_SYMBOLS id");
				if (typeof markup !== "string") fail("must be an SVG document string");
				copy[name] = markup;
				/* v8 ignore next -- needs a documentless run (node e2e booting the client tree), where no sprite renders either */
				if (typeof DOMParser === "undefined") continue;
				const root = new DOMParser().parseFromString(markup, "image/svg+xml").documentElement;
				if (root.namespaceURI !== SVG_NS || root.localName !== "svg" || root.querySelector("parsererror") !== null) fail("is not a well-formed SVG-namespace <svg> document");
				if (!root.hasAttribute("viewBox")) fail("needs a viewBox");
				if (root.querySelector("style, script") !== null) fail("must not contain <style> or <script>");
				for (const element of root.querySelectorAll("[id]")) if (!element.id.startsWith(`${name}-`)) fail(`element id "${element.id}" must start with "${name}-"`);
			}
			return Object.freeze(copy);
		}
		function dynamicToken(name) {
			return {
				name,
				description: "Theme token registered by the current Client composition.",
				valueType: "CSS value",
				requiresLightAndDark: true,
				...name.startsWith("--") ? { cssVariable: name } : {}
			};
		}
		/** Register desktop font-size keys when keyboard and locale services are available. */
		function installFontSizeShortcuts(ctx, adjust) {
			ctx.inject(["shortcuts", "locale"], (scope) => {
				if (scope.shortcuts.runtime !== "desktop") return;
				const t = scope.locale.bind(SETTINGS_NS);
				const combinations = [];
				for (const [direction, code, delta] of [[
					"increase",
					"Equal",
					1
				], [
					"decrease",
					"Minus",
					-1
				]]) {
					const binding = {
						code,
						modifiers: ["primary"]
					};
					const bindings = direction === "increase" ? [binding, {
						code,
						modifiers: ["primary", "shift"]
					}] : [binding];
					for (const candidate of bindings) combinations.push({
						binding: scope.shortcuts.describeBinding(candidate).binding,
						delta
					});
					scope.effect(() => scope.shortcuts.registerFixed({
						id: `fontSize.${direction}`,
						label: () => t(`fontSize.text.${direction}`),
						keys: scope.shortcuts.describeBinding(binding).keys,
						bindings,
						group: "application"
					}), `ui-theme: ${direction} font size reference`);
				}
				scope.effect(() => scope.shortcuts.observeFixedInput((input) => {
					if (input.type === "reset") return;
					const { gesture, context } = input;
					if (gesture.composing || gesture.defaultPrevented || gesture.repeat || context.region === "terminal") return;
					const matched = combinations.find(({ binding }) => binding.code === gesture.code && [
						"control",
						"alt",
						"shift",
						"meta"
					].every((modifier) => gesture[modifier] === binding.modifiers.includes(modifier)));
					if (matched === void 0) return;
					input.consume();
					adjust(matched.delta);
				}), "ui-theme: font size input");
			});
		}
		/**
		* Required services: settings transport plus slots/locale for the Appearance
		* row. `remote` carries the forwarded settings invalidation that
		* `ctx.configForms.get(entryId)` subscribes to on this context.
		*/
		const inject = [
			"slots",
			"locale",
			"remote",
			"configForms"
		];
		/**
		* Client plugin body: provide the theme service and register the
		* feature-owned Appearance and font settings rows into the General section's item
		* slot (a feature owns its settings surface). Desktop font-size shortcuts share
		* all three font-size settings when the keyboard service is available.
		* @param ctx - client cordis context.
		*/
		function apply(ctx) {
			installThemeStyles(ctx);
			ctx.effect(() => ctx.locale.register(SETTINGS_NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-theme: settings row dictionaries");
			const theme = new ThemeRuntime(ctx, ctx.configForms.get(THEME_SETTINGS_NAMESPACE));
			ctx.provide("theme", theme);
			installIconSprite(ctx, theme.getTheme().active.icons);
			const store = createAppearanceRowStore();
			let bound;
			const fontStore = createFontRowStore();
			let fontBound;
			const sync = (snapshot) => {
				bound?.sync(snapshot.preference, snapshot.revision);
				fontBound?.sync(snapshot.fontSizes, snapshot.fontFamilies, snapshot.revision);
			};
			ctx.on("theme/change", sync);
			const injected = (actions) => {
				bound = actions;
				sync(theme.getTheme());
				return { setTheme: (id) => {
					theme.setTheme(id);
				} };
			};
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "appearance",
				order: 10,
				store,
				locale: SETTINGS_NS,
				inject: injected
			}, AppearanceRow));
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "font-size",
				order: 11,
				store: fontStore,
				locale: SETTINGS_NS,
				inject: (actions) => {
					fontBound = actions;
					sync(theme.getTheme());
					return {
						setFontFamily: (role, value) => {
							theme.setFontFamily(role, value);
						},
						setFontSize: (role, px) => {
							theme.setFontSize(role, px);
						}
					};
				}
			}, FontSettingsGroup));
		}
		//#endregion
		exports.SETTINGS_NS = SETTINGS_NS;
		exports.ThemeRuntime = ThemeRuntime;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map