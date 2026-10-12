'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { LuArrowUp, LuArrowDown, LuGrip, LuImage, LuTrash2 } from 'react-icons/lu';

export default function CmsReorderableCards<T>({ items, onReorder, renderItem, getKey, onRemove, columns = true }: {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  getKey?: (item: T, index: number) => string;
  onRemove?: (index: number) => void;
  columns?: boolean;
}) {
  const keys = items.map((item, index) => getKey?.(item, index) ?? String(index));
  const [preview, setPreview] = useState<string[] | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const drag = useRef<{ ghost: HTMLElement; key: string; order: string[] } | null>(null);
  const positions = useRef(new Map<string, DOMRect>());
  const animations = useRef<Animation[]>([]);
  const order = preview ?? keys;

  const capture = () => {
    positions.current.clear();
    grid.current?.querySelectorAll<HTMLElement>(':scope > [data-cms-card]').forEach(card => positions.current.set(card.dataset.cmsCard!, card.getBoundingClientRect()));
  };
  const finish = (commit: boolean) => {
    capture();
    if (commit && drag.current) onReorder(drag.current.order.map(key => items[keys.indexOf(key)]));
    drag.current?.ghost.remove();
    drag.current = null;
    setPreview(null);
    setActive(null);
  };

  useLayoutEffect(() => {
    animations.current.forEach(animation => animation.cancel());
    animations.current = [];
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      grid.current?.querySelectorAll<HTMLElement>(':scope > [data-cms-card]').forEach(card => {
        const before = positions.current.get(card.dataset.cmsCard!);
        if (!before) return;
        const after = card.getBoundingClientRect();
        const x = before.left - after.left, y = before.top - after.top;
        if (Math.abs(x) + Math.abs(y) < 1) return;
        animations.current.push(card.animate([{ transform: `translate(${x}px,${y}px)` }, { transform: 'translate(0,0)' }], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' }));
      });
    }
    positions.current.clear();
  }, [preview, items]);

  useLayoutEffect(() => () => {
    drag.current?.ghost.remove();
    animations.current.forEach(animation => animation.cancel());
  }, []);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    capture();
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onReorder(next);
  };

  return <div ref={grid} style={{ display: 'grid', gridTemplateColumns: active ? 'repeat(auto-fill,minmax(140px,1fr))' : columns ? 'repeat(auto-fill,minmax(min(280px,100%),1fr))' : '1fr', gap: 14, alignItems: 'start' }}>
    {items.map((item, index) => {
      const key = keys[index];
      const data = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      const image = [data.image, data.icon, data.coverImage, data.avatar, data.src].find(value => typeof value === 'string' && value && !/\.(mp4|webm)(\?|$)/i.test(value)) as string | undefined;
      const label = String(data.title ?? data.author ?? data.label ?? data.type ?? (typeof item === 'string' ? item : 'Item'));
      return <section key={key} data-cms-card={key} style={{ order: order.indexOf(key), border: '1px solid #ddd', borderRadius: 18, background: '#fff', overflow: 'hidden', opacity: active === key ? 0.18 : 1, outline: active === key ? '2px dashed #de692e' : 'none', transition: 'opacity 150ms ease' }}>
        <div style={{ display: active ? 'none' : 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid #ddd' }}>
          <span style={{ background: '#de692e', color: '#fff', borderRadius: 8, padding: '0.3rem 0.65rem', fontWeight: 700 }}>{index + 1}</span>
          <button type="button" aria-label="Move card up" disabled={index === 0} onClick={() => move(index, index - 1)} style={{ border: 0, background: 'none', padding: 8, color: index === 0 ? '#ddd' : '#999', cursor: 'pointer' }}><LuArrowUp size={22} /></button>
          <button type="button" aria-label="Move card down" disabled={index === items.length - 1} onClick={() => move(index, index + 1)} style={{ border: 0, background: 'none', padding: 8, color: index === items.length - 1 ? '#ddd' : '#999', cursor: 'pointer' }}><LuArrowDown size={22} /></button>
          {onRemove && <button type="button" aria-label="Remove card" onClick={() => onRemove(index)} style={{ border: 0, background: 'none', padding: 8, color: '#b73449' }}><LuTrash2 size={18} /></button>}
          <button type="button" aria-label="Drag to reorder card" style={{ border: 0, background: 'none', color: '#999', padding: 8, cursor: active ? 'grabbing' : 'grab', touchAction: 'none' }}
            onPointerDown={event => {
              event.preventDefault();
              event.stopPropagation();
              capture();
              const card = event.currentTarget.closest<HTMLElement>('[data-cms-card]');
              const mini = card?.querySelector<HTMLElement>(':scope > [data-cms-mini]');
              if (!mini) return;
              const ghost = mini.cloneNode(true) as HTMLElement;
              ghost.inert = true;
              ghost.setAttribute('aria-hidden', 'true');
              Object.assign(ghost.style, { display: 'block', position: 'fixed', left: '0', top: '0', width: '160px', height: '140px', background: '#fff', borderRadius: '14px', pointerEvents: 'none', zIndex: '2147483647', fontFamily: '"Instrument Sans Variable",sans-serif', outline: '2px solid #de692e', boxShadow: '0 24px 48px rgba(18,33,48,.28)', transform: `translate3d(${event.clientX - 140}px,${event.clientY - 20}px,0)` });
              document.body.appendChild(ghost);
              drag.current = { ghost, key, order: [...keys] };
              setActive(key);
              setPreview([...keys]);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={event => {
              const current = drag.current;
              if (!current) return;
              current.ghost.style.transform = `translate3d(${event.clientX - 140}px,${event.clientY - 20}px,0)`;
              const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-cms-card]');
              if (target?.parentElement === grid.current && target.dataset.cmsCard !== current.key) {
                const next = [...current.order], from = next.indexOf(current.key), to = next.indexOf(target.dataset.cmsCard!);
                if (from >= 0 && to >= 0) {
                  capture();
                  next.splice(to, 0, next.splice(from, 1)[0]);
                  current.order = next;
                  setPreview(next);
                }
              }
              let host = grid.current?.parentElement;
              while (host && host.scrollHeight <= host.clientHeight) host = host.parentElement;
              if (host) { const rect = host.getBoundingClientRect(); if (event.clientY < rect.top + 60) host.scrollTop -= 18; else if (event.clientY > rect.bottom - 60) host.scrollTop += 18; }
            }}
            onPointerUp={event => { finish(true); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
            onPointerCancel={() => finish(false)}
            onLostPointerCapture={() => { if (drag.current) finish(false); }}
          ><LuGrip size={24} /></button>
        </div>
        <div data-cms-mini style={{ display: active ? 'block' : 'none', position: 'relative', height: 140, padding: 8, boxSizing: 'border-box' }}>
          {image ? <img src={image} alt="Card thumbnail" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : <div style={{ height: '100%', borderRadius: 10, background: '#f3f3f3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 8 }}><LuImage size={24} color="#aaa" /><span style={{ fontSize: 12, color: '#666', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span></div>}
          <span style={{ position: 'absolute', top: 14, left: 14, background: '#de692e', color: '#fff', borderRadius: 6, padding: '0.25rem 0.55rem', fontWeight: 700 }}>{order.indexOf(key) + 1}</span>
        </div>
        <div style={{ display: active ? 'none' : 'block', padding: '1rem' }}>{renderItem(item, index)}</div>
      </section>;
    })}
  </div>;
}
