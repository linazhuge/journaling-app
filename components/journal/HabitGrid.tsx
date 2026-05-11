'use client';


export interface HabitData {
  id: string;
  name: string;
  color: string;
  order: number;
  completedDays: number[];
}

interface HabitGridProps {
  habit: HabitData;
  year: number;
  month: number;
  onToggle: (day: number) => void;
}

export const DOT = 18; // px — must match backgroundSize in JournalPage

const BORDER = 'rgba(0,0,0,0.7)';

export function HabitGrid({ habit, year, month, onToggle }: HabitGridProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sun

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Name row */}
      <div style={{ height: DOT, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: habit.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: '#57534e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {habit.name}
          </span>
        </div>
      </div>

      {/* Day-of-week letters */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${DOT}px)`, height: DOT, alignItems: 'center' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ fontSize: 7, textAlign: 'center', color: '#b0a89e', fontWeight: 600 }}>{d}</div>
        ))}
      </div>

      {/* Day cells
          Each cell draws border-right + border-bottom only.
          border-left is drawn for column-0 cells and for the very first real cell.
          border-top is drawn for cells in row 0.
          This ensures every shared edge comes from one border only — no doubled lines. */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${DOT}px)` }}>
        {cells.map((day, i) => {
          if (!day) {
            return <div key={i} style={{ width: DOT, height: DOT }} />;
          }

          const filled = habit.completedDays.includes(day);
          const col = i % 7;
          const row = Math.floor(i / 7);
          const needsLeft = col === 0 || cells[i - 1] === null;
          const needsTop = row === 0 || cells[i - 7] === null;

          return (
            <div
              key={i}
              onClick={() => onToggle(day)}
              style={{
                width: DOT,
                height: DOT,
                boxSizing: 'border-box',
                backgroundColor: filled ? habit.color : 'transparent',
                borderRight: `1px solid ${BORDER}`,
                borderBottom: `1px solid ${BORDER}`,
                borderLeft: needsLeft ? `1px solid ${BORDER}` : 'none',
                borderTop: needsTop ? `1px solid ${BORDER}` : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.12s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 6,
                fontWeight: 500,
                color: 'rgba(0,0,0,0.7)',
                userSelect: 'none',
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
