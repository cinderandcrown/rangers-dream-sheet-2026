import React from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatGameMeta, getTeamColor } from "./utils";

export default function RankedListPanel({ games, memberColor, onDragEnd, onMoveUp, onMoveDown, onRemove, onClear, onSubmit, disabled, isPending }) {
  return (
    <aside className="thin-scrollbar order-first rounded-2xl border border-white/8 bg-gradient-to-b from-[rgba(30,41,59,0.9)] to-[rgba(20,30,48,0.95)] p-4 lg:order-last lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-[var(--gold)]" />
          <span className="text-lg text-[var(--gold)] oswald">Your Rankings</span>
        </div>
        {games.length > 0 ? (
          <button
            onClick={onClear}
            className="rounded-lg border border-white/8 px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:bg-white/5 hover:text-white/80"
          >
            Clear All
          </button>
        ) : null}
      </div>

      {/* Empty state */}
      {games.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/8 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <span className="text-3xl">⚾</span>
          </div>
          <div className="text-base text-white/70 oswald">Click on games to start building your dream list</div>
          <div className="mt-2 text-sm text-white/40">#1 = your most wanted game</div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="rankings">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                <AnimatePresence initial={false}>
                  {games.map((game, index) => (
                    <Draggable key={String(game.game_number)} draggableId={String(game.game_number)} index={index}>
                      {(dragProvided, snapshot) => (
                        <motion.div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`group rounded-xl border p-3 transition ${
                            snapshot.isDragging
                              ? "border-[var(--gold)]/30 bg-[rgba(191,160,72,0.1)] shadow-2xl"
                              : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Rank number */}
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--gold)]/15 text-sm font-bold text-[var(--gold)] oswald">
                              {index + 1}
                            </div>

                            {/* Drag handle */}
                            <div {...dragProvided.dragHandleProps} className="flex-shrink-0 cursor-grab text-white/25 active:cursor-grabbing">
                              <GripVertical className="h-4 w-4" />
                            </div>

                            {/* Team dot */}
                            <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: getTeamColor(game.opponent) }} />

                            {/* Game info */}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-white oswald">{game.opponent}</div>
                              <div className="truncate text-xs text-white/50">{formatGameMeta(game)}</div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-shrink-0 items-center gap-0.5">
                              <button onClick={() => onMoveUp(index)} disabled={index === 0} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white/70 disabled:opacity-20">
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => onMoveDown(index)} disabled={index === games.length - 1} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white/70 disabled:opacity-20">
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => onRemove(game.game_number)} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/60 transition hover:bg-red-500/10 hover:text-red-400">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="btn-primary-red mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold text-white shadow-lg shadow-red-900/30 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-30 oswald"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" /></svg>
            Saving…
          </span>
        ) : (
          "✓ Submit Rankings"
        )}
      </button>
    </aside>
  );
}