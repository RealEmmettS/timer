import { useRef, type PointerEvent } from 'react';

export default function InteractiveGridBackground() {
  const cell = useRef<HTMLSpanElement>(null);
  const lastCell = useRef('');

  function hide() {
    lastCell.current = '';
    if (cell.current) cell.current.style.opacity = '0';
  }

  function highlight(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !cell.current) return;
    const x = Math.floor(event.nativeEvent.offsetX / 36) * 36;
    const y = Math.floor(event.nativeEvent.offsetY / 36) * 36;
    const key = x + ',' + y;
    if (lastCell.current === key) return;
    lastCell.current = key;
    cell.current.style.transform = `translate(${x}px, ${y}px)`;
    cell.current.style.opacity = '1';
  }

  return (
    <div className="grid-field" aria-hidden="true" onPointerMove={highlight} onPointerLeave={hide}>
      <span className="grid-cell" ref={cell} />
    </div>
  );
}
