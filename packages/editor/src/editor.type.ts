import { ReactEditor } from 'slate-react';
import { BaseEditor } from 'slate';
import { HistoryEditor } from 'slate-history';

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export const enum ELEMENT_TYPE_ENUM {
  // bold = 'bold',
  // italic = 'italic',
  // underline = 'underline',
  // code = 'code',
  'heading-one' = 'heading-one',
  'heading-two' = 'heading-two',
  'block-quote' = 'block-quote',
  'numbered-list' = 'numbered-list',
  'bulleted-list' = 'bulleted-list',
  'list-item' = 'list-item',
}

export type ElementType = keyof typeof ELEMENT_TYPE_ENUM;

export const enum ALIGN_ENUM {
  left = 'left',
  center = 'center',
  right = 'right',
  justify = 'justify',
}

export type Align = keyof typeof ALIGN_ENUM;

type BaseElement = {
  align?: Align;
};

export interface ParagraphElement extends BaseElement {
  type: 'paragraph';
  children: CustomText[];
}

export interface HeadingElement extends BaseElement {
  type: 'heading-one' | 'heading-two';
  level: number;
  children: CustomText[];
}

export interface ListElement extends BaseElement {
  type: 'numbered-list' | 'bulleted-list' | 'list-item';
  children: CustomText[];
}

export interface BlockQuoteElement extends BaseElement {
  type: 'block-quote';
  children: CustomText[];
}

export type CustomElement = ParagraphElement | HeadingElement | ListElement | BlockQuoteElement;

// export type CustomFormat = keyof typeof FORMART_ENUM;

export type CustomMark = 'bold' | 'italic' | 'underline' | 'code';

export type FormattedText = { text: string } & { [k in CustomMark]?: boolean };

export type CustomText = FormattedText;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
