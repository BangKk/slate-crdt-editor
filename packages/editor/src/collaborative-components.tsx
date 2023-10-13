import {
  CursorOverlayData,
  useRemoteCursorOverlayPositions,
} from '@slate-yjs/react';
import { useRef } from 'react';

interface CursorData extends Record<string, unknown> {
  color: string;
  name: string;
}

export function Cursors({ children }: { children: React.ReactNode }) {
  const containerRef = useRef(null);
  const [cursors] = useRemoteCursorOverlayPositions<CursorData>({
    containerRef,
  });

  console.log(cursors);

  return (
    <div className="cursors" ref={containerRef}>
      {children}
      {cursors.map(cursor => (
        <Selection key={cursor.clientId} {...cursor} />
      ))}
    </div>
  );
}

function Selection({
  data,
  selectionRects,
  caretPosition,
}: CursorOverlayData<CursorData>) {
  if (!data) {
    return null;
  }
  console.log(data);

  const selectionStyle = {
    backgroundColor: data.color,
  };

  return (
    <>
      {selectionRects.map((position, i) => (
        <div
          style={{ ...selectionStyle, ...position }}
          className="selection"
          key={i}
        />
      ))}
      {caretPosition && <Caret caretPosition={caretPosition} data={data} />}
    </>
  );
}

function Caret({
  caretPosition,
  data,
}: Pick<CursorOverlayData<CursorData>, 'data' | 'caretPosition'>) {
  const caretStyle = {
    ...caretPosition,
    background: data?.color,
  };

  const labelStyle = {
    transform: 'translateY(-100%)',
    background: data?.color,
  };

  return (
    <div style={caretStyle} className="caretMarker">
      <div className="caret" style={labelStyle}>
        {data?.name}
      </div>
    </div>
  );
}
