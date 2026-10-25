window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-file-upload",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		//#region ../../util/crypto/lib/index.js
		/**
		* UUID minting that works in every JavaScript context this repository ships
		* to. `crypto.randomUUID` is a secure-context Web API — a page or worker
		* served over plain HTTP on a LAN address has no such method — while
		* `crypto.getRandomValues` is unrestricted everywhere (browsers, workers,
		* Node ≥ 19). One implementation here replaces per-caller polyfills; the
		* `no-restricted-properties` lint rule points `crypto.randomUUID` callers at
		* this module.
		* @module @deepseek-ai/dsh-util-crypto
		*/
		/**
		* Encode bytes as canonical base64 without overflowing function argument limits.
		* @param data - Bytes to encode.
		* @returns base64 text.
		*/
		function bytesToBase64(data) {
			let binary = "";
			const chunk = 32768;
			for (let offset = 0; offset < data.length; offset += chunk) binary += String.fromCharCode(...data.subarray(offset, offset + chunk));
			return btoa(binary);
		}
		//#endregion
		//#region ../../typert/protocol/lib/index.js
		/** The one Remote failure class shared by owners, the Gateway, and consumers. */
		/**
		* One Remote call failure: a real Error carrying its stable code and typed
		* details. Owners throw it at the failure point; the Host Gateway encodes it
		* onto the wire unchanged; the Client face rebuilds an instance for the
		* `RemoteResult` error branch, so `throw result.error` keeps throw semantics.
		* Discrimination is always by `code`, never by instanceof.
		*/
		var RemoteError = class extends Error {
			code;
			details;
			/** Structural marker: cross-realm/bundle identification never uses instanceof. */
			isDSHRemoteError = true;
			/**
			* @param code - stable failure code declared in {@link RemoteErrorDetailsMap}.
			* @param message - human diagnostic carried across the wire.
			* @param details - structured payload typed by the code.
			* @param options - standard Error options (`cause` survives in-process only).
			*/
			constructor(code, message, details, options) {
				super(message, options);
				this.code = code;
				this.details = details;
				this.name = "RemoteError";
			}
		};
		/**
		* Browser-relative form of {@link FILE_UPLOAD_PATH}; see
		* .agents/notes/implemented/architecture/2026-09-14-web-document-relative-app-routes.md.
		*/
		const FILE_UPLOAD_ROUTE = "/api/session/uploadFileBinary".slice(1);
		//#endregion
		//#region lib/types/client/runtime.js
		/** Background browser upload implementation for Blob and byte-stream bodies. */
		/**
		* Self-contained Worker body; its string form becomes the Blob Worker source.
		* @param scope - Worker global used for requests and progress messages.
		* @param createXhr - XMLHttpRequest factory used for Blob progress.
		* @param doFetch - Fetch carrier used for one-shot ReadableStream bodies.
		*/
		function fileUploadWorker(scope = self, createXhr = () => new XMLHttpRequest(), doFetch = (input, init) => fetch(input, init)) {
			scope.onmessage = (event) => {
				const request = event.data;
				if (request.body instanceof Blob) {
					const xhr = createXhr();
					xhr.open("POST", request.url);
					xhr.withCredentials = true;
					for (const [name, value] of Object.entries(request.headers)) xhr.setRequestHeader(name, value);
					xhr.upload.onprogress = (progress) => {
						scope.postMessage({
							kind: "progress",
							loaded: progress.loaded,
							...progress.lengthComputable ? { total: progress.total } : {}
						});
					};
					xhr.onload = () => {
						scope.postMessage({
							kind: "complete",
							status: xhr.status,
							body: xhr.responseText
						});
					};
					xhr.onerror = () => {
						scope.postMessage({
							kind: "error",
							message: "background upload transport failed"
						});
					};
					xhr.send(request.body);
					return;
				}
				if (!(request.body instanceof ReadableStream)) {
					scope.postMessage({
						kind: "error",
						message: "background upload worker received an invalid body"
					});
					return;
				}
				const source = request.body;
				(async () => {
					const reader = source.getReader();
					let loaded = 0;
					const body = new ReadableStream({
						async pull(controller) {
							const item = await reader.read();
							if (item.done) {
								controller.close();
								return;
							}
							if (!(item.value instanceof Uint8Array)) throw new TypeError("background upload stream produced a non-Uint8Array chunk");
							loaded += item.value.byteLength;
							scope.postMessage({
								kind: "progress",
								loaded
							});
							controller.enqueue(item.value);
						},
						async cancel(reason) {
							await reader.cancel(reason);
						}
					});
					const response = await doFetch(request.url, {
						method: "POST",
						headers: request.headers,
						credentials: "include",
						body,
						duplex: "half"
					});
					scope.postMessage({
						kind: "complete",
						status: response.status,
						body: await response.text()
					});
				})().catch((error) => {
					scope.postMessage({
						kind: "error",
						message: error instanceof Error ? error.message : String(error)
					});
				});
			};
		}
		/** Cordis service that owns one background carrier per upload operation. */
		var FileUploadRuntime = class extends _deepseek_ai_cordis.Service {
			transport;
			/** @param ctx - providing Client context. */
			constructor(ctx) {
				super(ctx, "fileUpload");
				const hook = globalThis.__DSH_FILE_UPLOAD__;
				this.transport = hook === void 0 ? workerTransport() : customTransport(hook.fetch);
			}
			/**
			* Post one body with the carrier selected before Cordis boot.
			* @param request - target, body, cancellation, and progress observer.
			* @returns the response status and text body.
			*/
			post(request) {
				return this.transport.post(request);
			}
			/**
			* Store one file for a Session.
			* @param sessionId - Session that owns the staged receipt.
			* @param data - browser Blob, exact bytes, or a one-shot byte stream.
			* @param name - optional display name.
			* @param signal - optional cancellation for the active upload.
			* @param onProgress - optional byte-progress observer for background bodies.
			* @returns the staged receipt and durable file reference, or a business error.
			*/
			async upload(sessionId, data, name, signal, onProgress) {
				if (!(data instanceof Uint8Array)) {
					const query = new URLSearchParams({ sessionId });
					if (name !== void 0) query.set("name", name);
					return parseUploadResult(await this.postRaw(query, data, signal, onProgress), fileUploadValue);
				}
				return this.ctx.remote.fileUploads.upload(sessionId, {
					data: bytesToBase64(data),
					...name === void 0 ? {} : { name }
				}, signal);
			}
			/**
			* Store one prompt image for a Session.
			* @param sessionId - Session that owns the staged receipt.
			* @param data - browser image Blob.
			* @param mediaType - declared image media type.
			* @param name - optional display name.
			* @param signal - optional cancellation for the active upload.
			* @param onProgress - optional byte-progress observer.
			* @returns the staged receipt and normalized image reference, or a business error.
			*/
			async uploadImage(sessionId, data, mediaType, name, signal, onProgress) {
				const query = new URLSearchParams({
					sessionId,
					mediaType
				});
				if (name !== void 0) query.set("name", name);
				return parseUploadResult(await this.postRaw(query, data, signal, onProgress), imageUploadValue);
			}
			/** Post one raw body to the upload route; a non-200 status is a transport failure. */
			async postRaw(query, body, signal, onProgress) {
				const response = await this.post({
					path: `${FILE_UPLOAD_ROUTE}?${query.toString()}`,
					body,
					headers: { "content-type": "application/octet-stream" },
					...signal === void 0 ? {} : { signal },
					...onProgress === void 0 ? {} : { onProgress }
				});
				if (response.status !== 200) throw new Error(`file upload transport failed with HTTP ${String(response.status)}`);
				return response.body;
			}
		};
		function customTransport(customFetch) {
			return { async post(request) {
				const init = {
					method: "POST",
					...request.headers === void 0 ? {} : { headers: request.headers },
					body: request.body,
					...request.body instanceof ReadableStream ? { duplex: "half" } : {},
					...request.signal === void 0 ? {} : { signal: request.signal }
				};
				const response = await customFetch(request.path, init);
				return {
					status: response.status,
					body: await response.text()
				};
			} };
		}
		function workerTransport() {
			return { post(request) {
				if (typeof Worker !== "function") return Promise.reject(/* @__PURE__ */ new Error("background upload requires Web Worker support"));
				const workerUrl = URL.createObjectURL(new Blob([`(${fileUploadWorker.toString()})()`], { type: "text/javascript" }));
				const worker = new Worker(workerUrl, { name: "dsh-file-upload" });
				URL.revokeObjectURL(workerUrl);
				return new Promise((resolve, reject) => {
					let settled = false;
					const abort = () => {
						settled = true;
						worker.terminate();
						request.signal?.removeEventListener("abort", abort);
						reject(new DOMException("The operation was aborted.", "AbortError"));
					};
					const finish = (settle) => {
						if (settled) return;
						settled = true;
						request.signal?.removeEventListener("abort", abort);
						worker.terminate();
						settle();
					};
					worker.onmessage = (event) => {
						const output = event.data;
						if (output.kind === "progress") request.onProgress?.({
							loaded: output.loaded,
							...output.total === void 0 ? {} : { total: output.total }
						});
						else if (output.kind === "complete") finish(() => {
							resolve({
								status: output.status,
								body: output.body
							});
						});
						else finish(() => {
							reject(new Error(output.message));
						});
					};
					worker.onerror = (event) => {
						finish(() => {
							reject(new Error(event.message || "background upload worker failed"));
						});
					};
					if (request.signal?.aborted === true) {
						abort();
						return;
					}
					request.signal?.addEventListener("abort", abort, { once: true });
					const message = {
						url: new URL(request.path, document.baseURI).href,
						body: request.body,
						headers: request.headers ?? {}
					};
					if (request.body instanceof ReadableStream) worker.postMessage(message, [request.body]);
					else worker.postMessage(message);
				});
			} };
		}
		function parseUploadResult(body, parseValue) {
			const value = JSON.parse(body);
			if (!isRecord(value) || typeof value.ok !== "boolean") throw new TypeError("file upload transport returned an invalid result");
			if (!value.ok) {
				const error = value.error;
				if (!isRecord(error) || typeof error.code !== "string" || typeof error.message !== "string" || !isRecord(error.details)) throw new TypeError("file upload transport returned an invalid failure");
				return {
					ok: false,
					error: new RemoteError(error.code, error.message, error.details)
				};
			}
			return {
				ok: true,
				value: parseValue(value.value)
			};
		}
		function fileUploadValue(result) {
			const file = isRecord(result) ? result.file : void 0;
			if (!isRecord(result) || typeof result.receiptId !== "string" || !isRecord(file) || typeof file.attachmentId !== "string" || typeof file.name !== "string" || !isNonNegativeInteger(file.bytes)) throw new TypeError("file upload transport returned an invalid receipt");
			return {
				receiptId: result.receiptId,
				file: {
					attachmentId: file.attachmentId,
					name: file.name,
					bytes: file.bytes
				}
			};
		}
		function imageUploadValue(result) {
			const image = isRecord(result) ? result.image : void 0;
			if (!isRecord(result) || typeof result.receiptId !== "string" || !isRecord(image) || typeof image.attachmentId !== "string" || !isImageMediaType(image.mediaType) || !isNonNegativeInteger(image.bytes) || !isNonNegativeInteger(image.width) || !isNonNegativeInteger(image.height) || image.name !== void 0 && typeof image.name !== "string" || image.originalDimensions !== void 0 && !isDimensions(image.originalDimensions)) throw new TypeError("file upload transport returned an invalid image receipt");
			return {
				receiptId: result.receiptId,
				image: {
					attachmentId: image.attachmentId,
					mediaType: image.mediaType,
					bytes: image.bytes,
					width: image.width,
					height: image.height,
					...image.name === void 0 ? {} : { name: image.name },
					...image.originalDimensions === void 0 ? {} : { originalDimensions: image.originalDimensions }
				}
			};
		}
		function isNonNegativeInteger(value) {
			return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
		}
		function isImageMediaType(value) {
			return value === "image/png" || value === "image/jpeg" || value === "image/webp" || value === "image/gif";
		}
		function isDimensions(value) {
			return isRecord(value) && isNonNegativeInteger(value.width) && isNonNegativeInteger(value.height);
		}
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Browser background-upload Cordis service. */
		/** The upload service uses the generated Remote fallback. */
		const inject = ["remote"];
		/**
		* Provide the browser background-upload service.
		* @param ctx - Client plugin context.
		*/
		function apply(ctx) {
			ctx.plugin(FileUploadRuntime);
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map