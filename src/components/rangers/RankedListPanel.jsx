import React from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";
import { formatGameMeta, getTeamColor } from "./utils";

export default function RankedListPanel({ games, onDragEnd, onMoveUp, onMoveDown, onRemove, onClear, onSubmit, disabled }) {
  return (
    <aside className="thin-scrollbar order-first rounded-3xl border border-white/10 bg-[var(--slate)] p-4 lg:order-last lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-xl text-[var(--gold)] oswald">Your Rankings</div>
        <button onClick={onClear} className="min-h-[44px] rounded-full border border-white/10 px-3 text-sm font-semibold text-white/70 transition hover:bg-white/5">
          Clear All
        </button>
      </div>

      {games.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center text-white/55">
          <div className="text-lg text-white/80 oswald">Click on games to start building your dream list</div>
          <div className="mt-2 text-sm">#1 = your most wanted game</div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="rankings">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                {games.map((game, index) => (
                  <Draggable key={String(game.game_number)} draggableId={String(game.game_number)} index={index}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.02)] p-3 transition ${snapshot.isDragging ? "bg-[rgba(191,160,72,0.12)] opacity-50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="pt-2 text-xl text-[var(--gold)] oswald">{index + 1}</div>
                          <div {...dragProvided.dragHandleProps} className="pt-2 text-white/40">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="mt-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getTeamColor(game.opponent) }} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-lg text-white oswald">{game.opponent}</div>
                            <div className="text-sm text-white/65">{formatGameMeta(game)}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => onMoveUp(index)} disabled={index === 0} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:bg-white/5 disabled:opacity-30">
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button onClick={() => onMoveDown(index)} disabled={index === games.length - 1} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:bg-white/5 disabled:opacity-30">
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button onClick={() => onRemove(game.game_number)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(192,17,31,0.35)] text-[var(--red)] transition hover:bg-[rgba(192,17,31,0.12)]">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <button
        onClick={onSubmit}
        disabled={disabled}
        className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#C0111F,#8B0000)] px-5 text-base text-white shadow-lg transition hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-40 oswald"
      >
        ✓ Submit Rankings
      </button>
    </aside>
  );
}