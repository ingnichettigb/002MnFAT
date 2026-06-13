import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock } from "lucide-react";

import type { ControlItem } from "@/lib/fat-context";

type RenderItemArgs = {
  control: ControlItem;
  /** Global index within the full list (used for the superscript number). */
  index: number;
  /** True when this row is one of the locked tail entries. */
  isLocked: boolean;
};

type Props = {
  /** Full list of controls in current order (unlocked first, locked tail last). */
  controls: ControlItem[];
  /** Called with the new order of unlocked ids when the user drops. */
  onReorder: (orderedUnlockedIds: string[]) => void;
  /** Renders the right-hand content of each row. */
  renderItem: (args: RenderItemArgs) => React.ReactNode;
};

export function SortableControlsList({ controls, onReorder, renderItem }: Props) {
  const unlocked = React.useMemo(
    () => controls.filter((c) => !c.locked),
    [controls],
  );
  const lockedTail = React.useMemo(
    () => controls.filter((c) => c.locked),
    [controls],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = unlocked.map((c) => c.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  };

  return (
    <ul className="divide-y rounded-md border">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={unlocked.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {unlocked.map((c, i) => (
            <SortableRow key={c.id} id={c.id}>
              {renderItem({ control: c, index: i, isLocked: false })}
            </SortableRow>
          ))}
        </SortableContext>
      </DndContext>
      {lockedTail.map((c, i) => (
        <li
          key={c.id}
          className="flex items-start gap-3 bg-muted/30 px-4 py-3"
          title="Posizione fissa / Feste Position"
        >
          <span className="mt-1 flex h-4 w-4 items-center justify-center text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
          </span>
          {renderItem({
            control: c,
            index: unlocked.length + i,
            isLocked: true,
          })}
        </li>
      ))}
    </ul>
  );
}

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 bg-background px-4 py-3 hover:bg-accent/30"
    >
      <button
        type="button"
        aria-label="Trascina per riordinare"
        className="mt-1 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </li>
  );
}
