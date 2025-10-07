"use client"
;(self as any).MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === "json") {
      return new Worker(new URL("monaco-editor/esm/vs/language/json/json.worker?worker", import.meta.url))
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new Worker(new URL("monaco-editor/esm/vs/language/css/css.worker?worker", import.meta.url))
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new Worker(new URL("monaco-editor/esm/vs/language/html/html.worker?worker", import.meta.url))
    }
    if (label === "typescript" || label === "javascript") {
      return new Worker(new URL("monaco-editor/esm/vs/language/typescript/ts.worker?worker", import.meta.url))
    }
    return new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker?worker", import.meta.url))
  },
}
