import React from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { getTeamColor } from "./utils";
import { getTeamLogoUrl } from "./teamLogos";
import { format, parseISO } from "date-fns";

export default function RankedListPanel({ games, onDragEnd, onMoveUp, onMoveDown, onRemove, onClear, onSubmit, disabled, isPending }) {
  return (
    <div
      className="thin-scrollbar lg:sticky lg:top-[100px] flex max-h-[60vh] lg:max-h-[calc(100vh-120px)] flex-col rounded-2xl border border-white/[0.08] bg-[var(--slate)] p-4 sm:p-5"
      style={{ order: 1 }}
    >
      {/* Header */}
      <h4
        className="mb-[14px] flex items-center justify-between text-base font-semibold text-[var(--gold)]"
        style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1.5px" }}
      >
        <span>Your Rankings</span>
        {games.length > 0 ? (
          <button
            onClick={onClear}
            className="rounded-[10px] border border-white/12 bg-transparent px-3 py-2 min-h-[44px] min-w-[44px] text-[11px] font-medium text-white/70 transition hover:border-white/25 hover:text-white active:bg-white/[0.08] active:scale-95"
            style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            Clear
          </button>
        ) : null}
      </h4>

      {/* List */}
      <div className="thin-scrollbar relative mx-[-8px] flex-1 overflow-y-auto px-2">
        {/* Scroll fade indicator */}
        {games.length > 6 && (
          <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--slate)] to-transparent z-10" />
        )}
        {games.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm leading-relaxed text-white/25">
            <p>Click on games to start<br />building your dream list</p>
            <p className="mt-2 text-xs">#1 = your most wanted game</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="rankings">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {games.map((game, index) => (
                    <Draggable key={String(game.game_number)} draggableId={String(game.game_number)} index={index}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className={`ri-row mb-1 flex cursor-grab items-center gap-[10px] rounded-lg border border-transparent bg-white/[0.03] p-[8px_10px] transition-all ${
                            snapshot.isDragging ? "border-[var(--gold)] bg-[rgba(191,160,72,0.1)] opacity-50" : "hover:border-white/[0.08] hover:bg-white/[0.06]"
                          }`}
                        >
                          {/* Rank number with special badges for top 3 */}
                          <span
                            className={`w-6 flex-shrink-0 text-center text-sm font-semibold ${index === 0 ? "top-pick-pulse" : ""}`}
                            style={{
                              fontFamily: "'Oswald', sans-serif",
                              color: index === 0 ? "#BFA048" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "var(--gold)",
                            }}
                          >
                            {index + 1}
                          </span>
                          {index === 0 && (
                            <span className="absolute -top-1 left-5 text-[8px] font-bold text-green-400" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.5px" }}>
                              TOP
                            </span>
                          )}

                          {/* Team logo */}
                          <div
                            className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-md overflow-hidden"
                            style={{ backgroundColor: getTeamLogoUrl(game.opponent) ? "rgba(255,255,255,0.06)" : getTeamColor(game.opponent) }}
                          >
                            {getTeamLogoUrl(game.opponent) ? (
                              <img src={getTeamLogoUrl(game.opponent)} alt="" className="h-[18px] w-[18px] object-contain" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </div>

                          {/* Game info */}
                          <div className="min-w-0 flex-1">
                            <div
                              className="truncate text-[13px] font-medium"
                              style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                            >
                              {game.opponent}
                            </div>
                            <div className="text-[11px] text-white/40">
                              {game.day_of_week} {format(parseISO(game.date), "MMM d")} · {game.start_time}
                            </div>
                          </div>

                          {/* Actions - hover reveal on desktop, always visible on mobile */}
                          <div className="ri-actions flex items-center gap-1">
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); onMoveUp(index); }}
                                disabled={index === 0}
                                aria-label={`Move ${game.opponent} up`}
                                className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/[0.06] text-[11px] text-white/50 disabled:opacity-30 active:bg-white/[0.15] active:scale-90 transition-transform"
                              >
                                ▲
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onMoveDown(index); }}
                                disabled={index === games.length - 1}
                                aria-label={`Move ${game.opponent} down`}
                                className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/[0.06] text-[11px] text-white/50 disabled:opacity-30 active:bg-white/[0.15] active:scale-90 transition-transform"
                              >
                                ▼
                              </button>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); onRemove(game.game_number); }}
                              aria-label={`Remove ${game.opponent} from rankings`}
                              className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[rgba(192,17,31,0.15)] text-sm text-[var(--red)] active:bg-[rgba(192,17,31,0.3)] active:scale-90 transition-transform"
                            >
                              ✕
                            </button>
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
      </div>

      {/* Submit */}
      <div className="mt-4 border-t border-white/[0.06] pt-4">
        <button
          onClick={onSubmit}
          disabled={disabled}
          className="btn-red-gradient w-full rounded-[10px] px-3 py-3 min-h-[48px] text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(192,17,31,0.4)] active:scale-[0.97] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          style={{
            fontFamily: "'Oswald', sans-serif",
            textTransform: "uppercase",
            letterSpacing: "1px",
            background: "linear-gradient(135deg, #C0111F, #8B0000)",
          }}
        >
          {isPending ? "Saving…" : "✓ Submit Rankings"}
        </button>
      </div>
    </div>
  );
}