import React, { Ref, PropsWithChildren, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { cx, css } from '@emotion/css';

interface BaseProps {
  className?: string;
  [key: string]: unknown;
}

export const Button = ({
  className,
  active,
  // reversed,
  disabled,
  ...props
}: PropsWithChildren<
  {
    active?: boolean;
    reversed?: boolean;
  } & BaseProps
>) => (
  <span
    {...props}
    className={cx(
      className,
      css`
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        color: ${disabled ? '#999' : '#333'};
        background: ${active && !disabled ? '#eee' : 'transparent'};
        :hover {
          background: ${disabled ? 'transparent' : '#eee'};
        }
      `
    )}
  />
);

// export const EditorValue = (
//   {
//     className,
//     value,
//     ...props
//   }: PropsWithChildren<
//     {
//       value:
//     } & BaseProps
//   >
// ) => {
//   const textLines = value.document.nodes
//     .map(node => node.text)
//     .toArray()
//     .join('\n')
//   return (
//     <div
//       {...props}
//       className={cx(
//         className,
//         css`
//           margin: 30px -20px 0;
//         `
//       )}
//     >
//       <div
//         className={css`
//           font-size: 14px;
//           padding: 5px 20px;
//           color: #404040;
//           border-top: 2px solid #eeeeee;
//           background: #f8f8f8;
//         `}
//       >
//         Slate's value as text
//       </div>
//       <div
//         className={css`
//           color: #404040;
//           font: 12px monospace;
//           white-space: pre-wrap;
//           padding: 10px 20px;
//           div {
//             margin: 0 0 0.5em;
//           }
//         `}
//       >
//         {textLines}
//       </div>
//     </div>
//   )
// }

export const Icon = ({ className, ...props }: PropsWithChildren<BaseProps>) => (
  <span
    {...props}
    className={cx(
      'material-icons',
      className,
      css`
        font-size: 18px;
        vertical-align: text-bottom;
      `
    )}
  />
);

export const Instruction = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<HTMLDivElement>
  ) => (
    <div
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          white-space: pre-wrap;
          margin: 0 -20px 10px;
          padding: 10px 20px;
          font-size: 14px;
          background: #f8f8e8;
        `
      )}
    />
  )
);

export const Menu = ({ className, ...props }: PropsWithChildren<BaseProps>) => (
  <div
    {...props}
    data-test-id="menu"
    className={cx(
      className,
      css`
        & > * {
          display: inline-block;
        }

        & > * + * {
          margin-left: 15px;
        }
      `
    )}
  />
);

export const Portal = ({ children }: { children: ReactNode }) => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null;
};

export const Toolbar = ({
  className,
  ...props
}: PropsWithChildren<BaseProps>) => (
  <Menu
    {...props}
    className={cx(
      className,
      css`
        padding: 18px;
        border-bottom: 2px solid #eee;
      `
    )}
  />
);

export const Devider = ({ className }: BaseProps) => (
  <span
    className={cx(
      className,
      css`
        display: inline-block;
        width: 1px;
        height: 18px;
        margin-left: 15px;
        background: #999;
        vertical-align: middle;
        opacity: 0.6;
        user-select: none;
      `
    )}
  />
);
