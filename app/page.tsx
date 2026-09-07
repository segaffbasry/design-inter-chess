'use client';

import { useEffect, useState } from 'react';

type ModelToolContext = {
  registerTool: (tool: {
    name: string;
    title: string;
    description: string;
    inputSchema: object;
    annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
    execute: (input: unknown) => object;
  }, options?: { signal?: AbortSignal }) => void | Promise<void>;
};

const navItems = [
  { label: 'Play', icon: '♟', active: true },
  { label: 'Puzzles', icon: '◆' },
  { label: 'Learn', icon: '▤' },
  { label: 'Watch', icon: '▶' },
  { label: 'Community', icon: '●' },
  { label: 'News', icon: '▰' },
];

const modes = [
  { name: 'Rapid', time: '10 min', note: 'Your usual' },
  { name: 'Blitz', time: '3 min', note: 'Fast game' },
  { name: 'Daily', time: '1 day', note: 'Take your time' },
];

const position: Record<string, string> = {
  a8: '♜', b8: '♞', c8: '♝', d8: '♛', e8: '♚', f8: '♝', g8: '♞', h8: '♜',
  a7: '♟', b7: '♟', c7: '♟', d7: '♟', e7: '♟', f7: '♟', g7: '♟', h7: '♟',
  a2: '♙', b2: '♙', c2: '♙', d2: '♙', e2: '♙', f2: '♙', g2: '♙', h2: '♙',
  a1: '♖', b1: '♘', c1: '♗', d1: '♕', e1: '♔', f1: '♗', g1: '♘', h1: '♖',
};

function Chessboard({ playing }: { playing: boolean }) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  return (
    <div className={`board-stage ${playing ? 'is-playing' : ''}`}>
      <div className="board-shadow" />
      <div className="board-wrap">
        <div className="board" aria-label="Chessboard in the starting position">
          {ranks.flatMap((rank, row) => files.map((file, column) => {
            const square = `${file}${rank}`;
            const piece = position[square];
            const isLight = (row + column) % 2 === 0;
            const isWhite = piece && rank <= 2;
            return (
              <div className={`square ${isLight ? 'light' : 'dark'}`} key={square}>
                {column === 0 && <span className="rank-label">{rank}</span>}
                {row === 7 && <span className="file-label">{file}</span>}
                {piece && <span className={`piece ${isWhite ? 'white-piece' : 'black-piece'}`}>{piece}</span>}
              </div>
            );
          }))}
        </div>
        <div className="board-edge" />
      </div>
      <div className="board-fog fog-back" />
      <div className="board-fog fog-front" />
      <div className="board-glow" />
    </div>
  );
}

export default function Home() {
  const [playing, setPlaying] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [mode, setMode] = useState(modes[0]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelToolContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'start_chess_game',
      title: 'Start chess game',
      description: 'Start a chess game in Rapid, Blitz, or Daily mode and reveal the readable board.',
      inputSchema: {
        type: 'object',
        properties: { mode: { type: 'string', enum: ['Rapid', 'Blitz', 'Daily'] } },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const requested = typeof input === 'object' && input !== null && 'mode' in input
          ? String((input as { mode?: unknown }).mode)
          : mode.name;
        const selected = modes.find((item) => item.name === requested);
        if (!selected) throw new Error('Choose Rapid, Blitz, or Daily.');
        setMode(selected);
        setShowModes(false);
        setPlaying(true);
        return { status: 'ready', mode: selected.name, time: selected.time };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [mode.name]);

  return (
    <main className={`app-shell ${playing ? 'game-started' : ''}`}>
      <aside className="sidebar">
        <div className="brand" aria-label="Chess.com home">
          <span className="brand-knight">♞</span>
          <span className="brand-word">Chess<span>.com</span></span>
        </div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon, active }) => (
            <button className={`nav-item ${active ? 'active' : ''}`} type="button" key={label}>
              <i aria-hidden="true">{icon}</i><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <label className="search-box">
          <i aria-hidden="true">⌕</i><input aria-label="Search" placeholder="Search" />
        </label>
        <div className="secondary-nav">
          <button type="button"><i>?</i><span>Support</span></button>
          <button type="button"><i>⚙</i><span>Settings</span></button>
          <button type="button"><i>•••</i><span>More</span></button>
        </div>
        <div className="profile">
          <div className="avatar">K</div>
          <div><strong>knightowl</strong><span>1,248</span></div>
          <i aria-hidden="true">···</i>
        </div>
      </aside>

      <section className="hero" aria-label="Start a chess game">
        <div className="ambient-light ambient-one" /><div className="ambient-light ambient-two" />
        <header className="mobile-header">
          <div className="brand"><span className="brand-knight">♞</span><span className="brand-word">Chess<span>.com</span></span></div>
          <button type="button" aria-label="Open menu"><i>☰</i></button>
        </header>
        <div className="hero-copy">
          <p className="eyebrow">{playing ? 'Game found' : 'Ready for another one?'}</p>
          <h1>{playing ? 'Your move.' : 'Make your move.'}</h1>
        </div>

        <Chessboard playing={playing} />

        <div className="play-panel">
          {!playing ? (
            <>
              <div className="mode-summary">
                <div><span className="mode-label">{mode.name}</span><strong>{mode.time}</strong></div>
                <span className="mode-icon" aria-hidden="true">◷</span>
              </div>
              <button className="play-button" type="button" onClick={() => setPlaying(true)}>
                <span>Play</span><span className="play-arrow">→</span>
              </button>
              <div className="mode-picker-wrap">
                <button className="change-mode" type="button" onClick={() => setShowModes(!showModes)} aria-expanded={showModes}>
                  Change mode <i className={showModes ? 'rotated' : ''}>⌄</i>
                </button>
                {showModes && (
                  <div className="mode-menu">
                    {modes.map((item) => (
                      <button type="button" key={item.name} className={mode.name === item.name ? 'selected' : ''}
                        onClick={() => { setMode(item); setShowModes(false); }}>
                        <span><strong>{item.name}</strong><small>{item.note}</small></span><b>{item.time}</b>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <output className="game-status">
              <span className="status-dot" />
              <div><strong>Game ready</strong><span>{mode.name} · {mode.time}</span></div>
              <button type="button" onClick={() => setPlaying(false)}>Back</button>
            </output>
          )}
        </div>

        <div className="quick-actions" aria-label="Secondary actions">
          <button type="button"><i>●●</i> Play a friend</button><span />
          <button type="button"><i>◆</i> Solve a puzzle</button>
        </div>
        <div className="below-fold">
          <span>CHESS.COM MEMBERSHIP</span><strong>Play without limits</strong><button type="button">Explore plans</button>
        </div>
      </section>
      <button className="chat-button" type="button" aria-label="Open chat">▢</button>
    </main>
  );
}
