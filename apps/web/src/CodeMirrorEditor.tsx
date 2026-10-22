import { useEffect, useRef } from 'react';
import { markdown } from '@codemirror/lang-markdown';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';

export function CodeMirrorEditor({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (containerRef.current === null) {
      return;
    }

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        markdown(),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });
    const view = new EditorView({ state, parent: containerRef.current });
    view.dom.setAttribute('aria-label', ariaLabel);
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [ariaLabel]);

  useEffect(() => {
    const view = viewRef.current;
    if (view === null || view.state.doc.toString() === value) {
      return;
    }
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    });
  }, [value]);

  return <div className="codemirror-editor" ref={containerRef} />;
}
