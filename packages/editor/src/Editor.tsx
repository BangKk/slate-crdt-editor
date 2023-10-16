import { ReactNode, useEffect, useMemo, useState } from 'react';
import isHotkey from 'is-hotkey';
import { Editable, withReact, useSlate, Slate } from 'slate-react';
import { withHistory } from 'slate-history';
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement,
} from 'slate';
import * as Y from 'yjs';
import { YjsEditor, withYjs, withCursors } from '@slate-yjs/core';
import LiveblocksProvider from '@liveblocks/yjs';
import { JsonObject, LsonObject, BaseUserMeta, Json } from '@liveblocks/client';
import { Cursors } from './collaborative-components';
import { Button, Icon, Toolbar, Devider } from './components';
import {
  CustomEditor,
  CustomElement,
  CustomText,
  CustomMark,
  ELEMENT_TYPE_ENUM,
  ElementType,
  Align,
} from './editor.type';
import { useRoom } from './liveblocks.config';
import './editor.css';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES: Align[] = ['left', 'center', 'right', 'justify'];

type Provider = LiveblocksProvider<JsonObject, LsonObject, BaseUserMeta, Json>;

const CollaboradEditor = () => {
  const room = useRoom();
  const [connected, setConnected] = useState(false);
  const [sharedType, setSharedType] = useState<Y.XmlText>();
  const [provider, setProvider] = useState<Provider>();

  useEffect(() => {
    const yDoc = new Y.Doc();
    const sharedDoc = yDoc.get('slate', Y.XmlText);

    const yProvider = new LiveblocksProvider(room, yDoc);

    yProvider.on('sync', setConnected);
    setSharedType(sharedDoc as Y.XmlText);
    setProvider(yProvider);

    return () => {
      yDoc?.destroy();
      yProvider?.off('sync', setConnected);
      yProvider?.destroy();
    };
  }, [room]);

  if (!connected || !sharedType || !provider) {
    return <div>Connecting...</div>;
  }

  return <SlateEditor sharedType={sharedType} provider={provider} />;
};

const SlateEditor = ({
  sharedType,
  provider,
}: {
  sharedType: Y.XmlText;
  provider: Provider;
}) => {
  const editor = useMemo(() => {
    const user = Math.random().toString(16).slice(2, 8);
    const editor = withHistory(
      withReact(
        withCursors(
          withYjs(createEditor(), sharedType),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          provider.awareness as any,
          {
            data: {
              name: `user_${user}`,
              color: `#${user}`,
            },
          }
        )
      )
    );

    const { normalizeNode } = editor;
    editor.normalizeNode = entry => {
      const [node] = entry;

      if (!Editor.isEditor(node) || node.children.length > 0) {
        return normalizeNode(entry);
      }

      Transforms.insertNodes(editor, initialValue, { at: [0] });
    };

    return editor;
  }, [sharedType, provider.awareness]);

  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <div className="editor-container">
        <Toolbar>
          <HistoryButton mark="undo" icon="undo" />
          <HistoryButton mark="redo" icon="redo" />
          <Devider />

          <MarkButton mark="bold" icon="format_bold" />
          <MarkButton mark="italic" icon="format_italic" />
          <MarkButton mark="underline" icon="format_underlined" />
          <MarkButton mark="code" icon="code" />
          <Devider />

          <BlockButton format="heading-one" icon="looks_one" />
          <BlockButton format="heading-two" icon="looks_two" />
          <BlockButton format="block-quote" icon="format_quote" />
          <BlockButton format="numbered-list" icon="format_list_numbered" />
          <BlockButton format="bulleted-list" icon="format_list_bulleted" />
          <BlockButton format="left" icon="format_align_left" />
          <BlockButton format="center" icon="format_align_center" />
          <BlockButton format="right" icon="format_align_right" />
          <BlockButton format="justify" icon="format_align_justify" />
        </Toolbar>
        <Cursors>
          <Editable
            renderElement={props => <Element {...props} />}
            renderLeaf={props => <Leaf {...props} />}
            placeholder="Enter some rich text…"
            spellCheck
            autoFocus
            onKeyDown={event => {
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event)) {
                  event.preventDefault();
                  const mark = HOTKEYS[
                    hotkey as keyof typeof HOTKEYS
                  ] as CustomMark;
                  toggleMark(editor, mark);
                }
              }
            }}
          />
        </Cursors>
      </div>
    </Slate>
  );
};

const toggleBlock = (editor: CustomEditor, format: ElementType | Align) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format as Align) ? 'align' : 'type'
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format as Align),
    split: true,
  });
  let newProperties: Partial<CustomElement>;
  if (TEXT_ALIGN_TYPES.includes(format as Align)) {
    newProperties = {
      align: isActive ? undefined : (format as Align),
    };
  } else {
    newProperties = {
      type: isActive
        ? 'paragraph'
        : isList
        ? 'list-item'
        : (format as ElementType),
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format as ElementType, children: [] };
    Transforms.wrapNodes(editor, block as CustomElement);
  }
};

const toggleMark = (editor: CustomEditor, mark: CustomMark) => {
  const isActive = isMarkActive(editor, mark);

  if (isActive) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
};

const isBlockActive = (
  editor: CustomEditor,
  format: string,
  blockType: 'type' | 'align' = 'type'
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  );

  return !!match;
};

const isMarkActive = (editor: CustomEditor, format: CustomMark) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({
  attributes,
  children,
  element,
}: {
  attributes: Record<string, string | boolean>;
  children: ReactNode;
  element: CustomElement;
}) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case ELEMENT_TYPE_ENUM['block-quote']:
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case ELEMENT_TYPE_ENUM['bulleted-list']:
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case ELEMENT_TYPE_ENUM['heading-one']:
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case ELEMENT_TYPE_ENUM['heading-two']:
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case ELEMENT_TYPE_ENUM['list-item']:
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case ELEMENT_TYPE_ENUM['numbered-list']:
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({
  attributes,
  children,
  leaf,
}: {
  attributes: Record<string, boolean>;
  children: ReactNode;
  leaf: CustomText;
}) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({
  format,
  icon,
}: {
  format: ElementType | Align;
  icon: string;
}) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format as Align) ? 'align' : 'type'
      )}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const MarkButton = ({ mark, icon }: { mark: CustomMark; icon: string }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, mark)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        toggleMark(editor, mark);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const HistoryButton = ({
  mark,
  icon,
}: {
  mark: 'undo' | 'redo';
  icon: string;
}) => {
  const editor = useSlate();

  return (
    <Button
      disabled={
        editor.history[mark === 'redo' ? 'redos' : 'undos'].length === 0
      }
      onMouseDown={(event: Event) => {
        event.preventDefault();
        editor[mark]();
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text: ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    align: 'center',
    children: [{ text: 'Try it out for yourself!' }],
  },
];

export default CollaboradEditor;
