'use client';

/* oxlint-disable next/no-img-element -- Render the supplied local board and sprite assets without altering them. */
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
  type ReactNode,
} from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog as MobileDrawer } from '@base-ui/react/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const assets = '/chess/';
// Stable pseudo-random parameters keep hydration deterministic while each shaft
// has its own direction, reach, phase and rhythm.
const lightShafts = Array.from({ length: 16 }, (_, index) => {
  const noise = (salt: number) =>
    ((index * 127 + salt * 71 + index * index * 19) % 257) / 257;
  return {
    '--beam-angle': `${index * 22.5 - 180 + noise(1) * 13}deg`,
    '--beam-width': `${6 + noise(2) * 13}%`,
    '--beam-length': `${48 + noise(3) * 26}%`,
    '--beam-duration': `${7 + noise(4) * 12}s`,
    '--beam-delay': `${-noise(5) * 24}s`,
    '--beam-drift': `${4 + noise(6) * 12}deg`,
  } as CSSProperties;
});
const navigation = [
  ['Play', 'play-white.svg', '/play'],
  ['Puzzles', 'puzzle-piece.svg', '/puzzles'],
  ['Learn', 'lessons.svg', '/lessons'],
  ['Train', 'training.svg', '/practice'],
  ['Watch', 'binoculars.svg', '/tv'],
  ['Community', 'friends.svg', '/community'],
  ['Other', 'ellipsis.svg', '/today'],
  ['Free Trial', 'commerce-diamond.svg', '/membership'],
];
const glyphs = {
  search: '\u2013',
  users: 'm',
  mail: 'u',
  bell: 'q',
  settings: '\u00b7',
  clock: '\u1f1b',
  arrow: ']',
  undo: 'L',
  down: '<',
  block: '\u222b',
  stop: '&',
  new: '\u1f01',
  board: '\u2019',
  info: ')',
  first: '#',
  previous: ',',
  play: 'J',
  next: '\u2026',
  last: '@',
};
function Glyph({ name }: { name: keyof typeof glyphs }) {
  return (
    <span className="glyph" aria-hidden="true">
      {glyphs[name]}
    </span>
  );
}

function ToolIcon({
  name,
}: {
  name: 'focus' | 'expand' | 'flip' | 'close' | 'menu';
}) {
  const paths = {
    menu: 'M4 6h16M4 12h16M4 18h16',
    focus: 'M6 3H3v6M18 3h3v6M3 15v6h6M21 15v6h-6',
    expand:
      'M8 3H3v5M3 3l6 6M16 3h5v5M21 3l-6 6M3 16v5h5M3 21l6-6M21 16v5h-5M21 21l-6-6',
    flip: 'M7 3 3 7l4 4M3 7h12a4 4 0 0 1 4 4M17 21l4-4-4-4M21 17H9a4 4 0 0 1-4-4',
    close: 'm6 6 12 12M18 6 6 18',
  };
  return (
    <svg
      className="tool-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

function ToolButton({
  label,
  children,
  onClick,
  pressed,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        className="board-tool"
        aria-label={label}
        aria-pressed={pressed}
        onClick={onClick}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="right" className="board-tooltip">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function Sidebar({
  hidden,
  onFocusMode,
  focusButtonRef,
}: {
  hidden: boolean;
  onFocusMode: () => void;
  focusButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <aside
      className="sidebar"
      aria-label="Chess.com navigation"
      inert={hidden}
      aria-hidden={hidden}
    >
      <button
        className="brand"
        aria-disabled="true"
        aria-label="Chess.com home"
      >
        <img src={`${assets}logo.svg`} alt="Chess.com" />
      </button>
      <nav className="navigation">
        {navigation.map(([label, icon]) => (
          <button
            key={label}
            className={`nav-link ${label === 'Free Trial' ? 'trial' : ''}`}
            aria-disabled="true"
            aria-current={label === 'Play' ? 'page' : undefined}
          >
            <img src={`${assets}${icon}`} alt="" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <PlayingCount />
        <button
          ref={focusButtonRef}
          className="nav-link sidebar-focus"
          onClick={onFocusMode}
          aria-label="Focus mode"
          aria-pressed={hidden}
          title="Focus mode"
        >
          <ToolIcon name="focus" />
          <span>Focus mode</span>
        </button>
        <button className="search-link" aria-disabled="true">
          <Glyph name="search" />
          <span>Search</span>
        </button>
        <button className="account-link" aria-disabled="true">
          <img src={`${assets}user-image.007dad08.svg`} alt="" />
          <strong>1beatyouu</strong>
        </button>
        <div className="footer-icons">
          <button aria-disabled="true" aria-label="Friends">
            <Glyph name="users" />
          </button>
          <button aria-disabled="true" aria-label="Messages, 1 unread">
            <Glyph name="mail" />
            <span className="badge">1</span>
          </button>
          <button aria-disabled="true" aria-label="Notifications">
            <Glyph name="bell" />
          </button>
          <button aria-disabled="true" aria-label="Settings">
            <Glyph name="settings" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function PlayingCount() {
  return (
    <div
      className="sidebar-playing"
      title="Sample activity for this design preview"
    >
      <i className="online-dot" />
      <strong>275,741</strong> <span>Playing</span>
    </div>
  );
}

const modes = [
  { id: 'rapid', label: 'Rapid', time: '10 min', clock: '10:00' },
  { id: 'blitz', label: 'Blitz', time: '3 min', clock: '3:00' },
  { id: 'bullet', label: 'Bullet', time: '1 min', clock: '1:00' },
];

function MobileHeader({
  focused,
  onFocusMode,
  focusButtonRef,
  focusExitRef,
}: {
  focused: boolean;
  onFocusMode: () => void;
  focusButtonRef: RefObject<HTMLButtonElement | null>;
  focusExitRef: RefObject<HTMLButtonElement | null>;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 701px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  function enterFocus() {
    setOpen(false);
    onFocusMode();
  }
  return (
    <header className="mobile-header" inert={focused} aria-hidden={focused}>
      <MobileDrawer.Root open={open} onOpenChange={setOpen}>
        <MobileDrawer.Trigger
          className="mobile-icon-button"
          aria-label="Open navigation"
        >
          <ToolIcon name="menu" />
        </MobileDrawer.Trigger>
        <MobileDrawer.Portal>
          <MobileDrawer.Backdrop className="mobile-menu-backdrop" />
          <MobileDrawer.Popup
            className="mobile-menu-drawer"
            finalFocus={focused ? focusExitRef : undefined}
          >
            <MobileDrawer.Title className="sr-only">
              Navigation
            </MobileDrawer.Title>
            <div className="mobile-drawer-heading">
              <img src={`${assets}logo.svg`} alt="Chess.com" />
              <MobileDrawer.Close
                className="mobile-icon-button"
                aria-label="Close navigation"
              >
                <ToolIcon name="close" />
              </MobileDrawer.Close>
            </div>
            <nav className="mobile-navigation" aria-label="Mobile navigation">
              {navigation.map(([label, icon]) => (
                <button
                  key={label}
                  className={`nav-link ${label === 'Free Trial' ? 'trial' : ''}`}
                  aria-disabled="true"
                  aria-current={label === 'Play' ? 'page' : undefined}
                >
                  <img src={`${assets}${icon}`} alt="" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
            <div className="mobile-menu-footer">
              <PlayingCount />
              <button className="nav-link" onClick={enterFocus}>
                <ToolIcon name="focus" />
                <span>Focus mode</span>
              </button>
              <button className="nav-link" aria-disabled="true">
                <img src={`${assets}user-image.007dad08.svg`} alt="" />
                <span>1beatyouu</span>
              </button>
            </div>
          </MobileDrawer.Popup>
        </MobileDrawer.Portal>
      </MobileDrawer.Root>
      <button
        className="mobile-brand"
        aria-disabled="true"
        aria-label="Chess.com home"
      >
        <img src={`${assets}logo.svg`} alt="Chess.com" />
      </button>
      <div className="mobile-header-actions">
        <button
          className="mobile-icon-button"
          aria-disabled="true"
          aria-label="Friends"
        >
          <Glyph name="users" />
        </button>
        <button
          className="mobile-icon-button mobile-mail"
          aria-disabled="true"
          aria-label="Messages, 1 unread"
        >
          <Glyph name="mail" />
          <span className="badge">1</span>
        </button>
        <button
          className="mobile-icon-button"
          ref={focusButtonRef}
          onClick={enterFocus}
          aria-label="Focus mode"
        >
          <ToolIcon name="focus" />
        </button>
      </div>
    </header>
  );
}

const sampleHistory = [
  {
    name: 'quiettempo',
    rating: 612,
    result: 'Won',
    score: '1–0',
    change: '+8',
    time: '12:42',
    mode: '10 min',
    tone: 'moss',
  },
  {
    name: 'velvetknight',
    rating: 634,
    result: 'Lost',
    score: '0–1',
    change: '−6',
    time: '12:18',
    mode: '10 min',
    tone: 'plum',
  },
  {
    name: 'rookandroll',
    rating: 598,
    result: 'Won',
    score: '1–0',
    change: '+7',
    time: '11:54',
    mode: '3 min',
    tone: 'ochre',
  },
  {
    name: 'mika_moves',
    rating: 620,
    result: 'Draw',
    score: '½–½',
    change: '0',
    time: '11:31',
    mode: '10 min',
    tone: 'slate',
  },
  {
    name: 'nordicpawn',
    rating: 607,
    result: 'Won',
    score: '1–0',
    change: '+8',
    time: '10:48',
    mode: '10 min',
    tone: 'moss',
  },
  {
    name: 'endgame_echo',
    rating: 641,
    result: 'Lost',
    score: '0–1',
    change: '−5',
    time: '10:22',
    mode: '3 min',
    tone: 'plum',
  },
];
const samplePlayers = [
  {
    name: 'quiettempo',
    rating: 612,
    country: 'Netherlands',
    status: 'Online',
    tone: 'moss',
  },
  {
    name: 'mika_moves',
    rating: 620,
    country: 'Japan',
    status: 'Playing',
    tone: 'slate',
  },
  {
    name: 'rookandroll',
    rating: 598,
    country: 'United Kingdom',
    status: 'Online',
    tone: 'ochre',
  },
  {
    name: 'velvetknight',
    rating: 634,
    country: 'Canada',
    status: 'Playing',
    tone: 'plum',
  },
  {
    name: 'nordicpawn',
    rating: 607,
    country: 'Sweden',
    status: 'Online',
    tone: 'moss',
  },
  {
    name: 'endgame_echo',
    rating: 641,
    country: 'Australia',
    status: 'Away',
    tone: 'slate',
  },
];
function SampleAvatar({ name, tone }: { name: string; tone: string }) {
  return (
    <span className={`sample-avatar tone-${tone}`} aria-hidden="true">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
function GameHistory() {
  const [query, setQuery] = useState('');
  const games = sampleHistory.filter((game) =>
    `${game.name} 1beatyouu`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="data-panel-heading">
        <h2>Game history</h2>
        <span className="sample-label">Sample</span>
      </div>
      <label className="list-search">
        <Glyph name="search" />
        <input
          aria-label="Search game history by username"
          placeholder="Username…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <ul className="data-list history-list">
        {games.map((game) => (
          <li
            key={game.name}
            className="compact-history-row"
            title={`1beatyouu vs ${game.name} · ${game.result} · ${game.time}`}
          >
            <Glyph name="clock" />
            <span className="compact-player">
              <strong>1beatyouu</strong>
              <span>(586)</span>
            </span>
            <span className="compact-player">
              <strong>{game.name}</strong>
              <span>({game.rating})</span>
            </span>
            <span
              className={`compact-result result-${game.result.toLowerCase()}`}
              aria-label={game.result}
            >
              {game.score}
            </span>
            <span className="compact-time">{game.mode}</span>
          </li>
        ))}
        {games.length === 0 && (
          <li className="list-empty">No matching games</li>
        )}
      </ul>
    </>
  );
}
function PlayerDirectory() {
  const [query, setQuery] = useState('');
  const players = samplePlayers.filter((player) =>
    player.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="data-panel-heading">
        <h2>Players</h2>
      </div>
      <label className="list-search">
        <Glyph name="search" />
        <input
          aria-label="Search players by username"
          placeholder="Username…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <ul className="data-list player-list">
        {players.map((player) => (
          <li
            key={player.name}
            className="compact-directory-row"
            title={player.country}
          >
            <SampleAvatar name={player.name} tone={player.tone} />
            <span className="compact-player">
              <strong>{player.name}</strong>
              <span>({player.rating})</span>
            </span>
            <div
              className={`directory-status status-${player.status.toLowerCase()}`}
            >
              <span>
                <i />
                {player.status}
              </span>
            </div>
          </li>
        ))}
        {players.length === 0 && (
          <li className="list-empty">No matching players</li>
        )}
      </ul>
    </>
  );
}
type Mode = (typeof modes)[number];
type Phase = 'ready' | 'revealing' | 'playing';

function PlayerBar({ bottom, mode }: { bottom?: boolean; mode: Mode }) {
  return (
    <div className={`player-bar ${bottom ? 'bottom-player' : ''}`}>
      <img src={`${assets}user-image.007dad08.svg`} alt="" />
      <div className="player-details">
        <strong>{bottom ? '1beatyouu' : 'Opponent'}</strong>
        <span>{bottom ? '(586)' : 'Black'}</span>
      </div>
      <div className={`clock ${bottom ? 'clock-white' : ''}`}>
        {bottom && <Glyph name="stop" />}
        <span>{mode.clock}</span>
      </div>
    </div>
  );
}

const startingPieces = Array.from('abcdefgh').flatMap((file, index) => [
  {
    id: `${file}1`,
    piece: `w${['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'][index]}`,
  },
  { id: `${file}2`, piece: 'wp' },
  { id: `${file}7`, piece: 'bp' },
  {
    id: `${file}8`,
    piece: `b${['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'][index]}`,
  },
]);

function squarePosition(square: string, flipped: boolean): CSSProperties {
  const file = 'abcdefgh'.indexOf(square[0]);
  const rank = Number(square[1]);
  return {
    left: `${(flipped ? 7 - file : file) * 12.5}%`,
    top: `${(flipped ? rank - 1 : 8 - rank) * 12.5}%`,
  };
}

function Board({
  flipped,
  demoEnabled,
}: {
  flipped: boolean;
  demoEnabled: boolean;
}) {
  const [demoStep, setDemoStep] = useState(0);
  const [tap, setTap] = useState<{ square: string; id: number } | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);

  useEffect(() => {
    if (!demoEnabled) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setTimeout>;
    let cursor = 0;
    let tapId = 0;
    const sources = ['b1', 'g8', 'a3', 'h6'];
    function nextTap() {
      setTap({ square: sources[cursor], id: tapId++ });
      timer = setTimeout(() => {
        cursor = (cursor + 1) % 4;
        setDemoStep(cursor);
        setTap(null);
        timer = setTimeout(nextTap, 2800);
      }, 850);
    }
    function sync() {
      clearTimeout(timer);
      cursor = 0;
      setDemoStep(0);
      setTap(null);
      const running = !motion.matches && !document.hidden;
      setDemoRunning(running);
      if (running) timer = setTimeout(nextTap, 2400);
    }
    sync();
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearTimeout(timer);
      motion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [demoEnabled]);

  const activeDemo = demoEnabled && demoRunning;
  const step = activeDemo ? demoStep : 0;
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = Array.from(flipped ? 'hgfedcba' : 'abcdefgh');
  return (
    <figure
      className="chessboard"
      aria-label={
        activeDemo
          ? 'Chessboard preview with an automatic knight-move demonstration'
          : `Chessboard in the starting position, ${flipped ? 'Black' : 'White'} at the bottom`
      }
    >
      <div className="board-base" aria-hidden="true" />
      <div className="board-surface" aria-hidden="true" />
      <div className="squares">
        {ranks.flatMap((rank, row) =>
          files.map((file, col) => {
            return (
              <div
                className={`square ${(row + col) % 2 ? 'dark-square' : 'light-square'}`}
                key={`${file}${rank}`}
              >
                {col === 0 && <span className="rank">{rank}</span>}
                {row === 7 && <span className="file">{file}</span>}
              </div>
            );
          }),
        )}
      </div>
      <div
        className={`piece-layer ${activeDemo ? 'demo-running' : ''}`}
        aria-hidden="true"
      >
        {startingPieces.map(({ id, piece }) => {
          const square =
            id === 'b1' && (step === 1 || step === 2)
              ? 'a3'
              : id === 'g8' && (step === 2 || step === 3)
                ? 'h6'
                : id;
          return (
            <div
              key={id}
              className="piece-position"
              data-square={square}
              style={squarePosition(square, flipped)}
            >
              <img
                className="piece"
                src={`${assets}${piece}.png`}
                alt=""
                draggable={false}
                width={150}
                height={150}
              />
            </div>
          );
        })}
        {activeDemo && tap && (
          <div
            className="tap-indicator"
            key={tap.id}
            style={squarePosition(tap.square, flipped)}
          >
            <span className="tap-ring" />
            <span className="tap-ring echo-ring" />
          </div>
        )}
      </div>
      <div className="board-light" aria-hidden="true" />
    </figure>
  );
}

export default function Home() {
  const [sceneReady, setSceneReady] = useState(false);
  const [phase, setPhase] = useState<Phase>('ready');
  const [mode, setMode] = useState(modes[0]);
  const [modeOpen, setModeOpen] = useState(false);
  const [launchMenu, setLaunchMenu] = useState<'start' | 'custom' | null>(null);
  const [panelTab, setPanelTab] = useState('new');
  const [pregamePanelOpen, setPregamePanelOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [coordinates, setCoordinates] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [toolNotice, setToolNotice] = useState('');
  const focusExitRef = useRef<HTMLButtonElement>(null);
  const sidebarFocusRef = useRef<HTMLButtonElement>(null);
  const mobileFocusRef = useRef<HTMLButtonElement>(null);
  const wasFocused = useRef(false);
  const playRef = useRef<HTMLButtonElement>(null);
  const customRef = useRef<HTMLButtonElement>(null);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);
  const firstCustomRef = useRef<HTMLButtonElement>(null);
  const replayRef = useRef<HTMLButtonElement>(null);
  const hasPlayed = useRef(false);
  const committed = phase !== 'ready';
  const focused = focusMode;

  useEffect(() => {
    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    const boardImage = new Image();
    boardImage.src = `${assets}200.png`;
    const images = [...document.images, boardImage];
    // Decode the first-frame assets before one fade-in; never animate from an
    // unstyled layout or reveal a partially loaded icon/piece set.
    const ready = Promise.allSettled([
      document.fonts.load('24px "Chess Glyph"'),
      ...images.map((img) => img.decode()),
    ]);
    const timeout = setTimeout(reveal, 2500);
    function reveal() {
      if (cancelled) return;
      clearTimeout(timeout);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (!cancelled) setSceneReady(true);
        });
      });
    }
    void ready.then(reveal);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, []);

  useEffect(() => {
    const syncFullscreen = () =>
      setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () =>
      document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  useEffect(() => {
    if (!focused) return;
    const exitOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !settingsOpen) setFocusMode(false);
    };
    window.addEventListener('keydown', exitOnEscape);
    return () => window.removeEventListener('keydown', exitOnEscape);
  }, [focused, settingsOpen]);

  async function toggleFullscreen() {
    setToolNotice('');
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setToolNotice(
        'Fullscreen is unavailable in this preview. You can still use Focus mode.',
      );
    }
  }

  useEffect(() => {
    if (phase !== 'revealing') return;
    // Matches the longest visual transition, with immediate completion for reduced motion.
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 0
      : 940;
    const timer = window.setTimeout(() => setPhase('playing'), duration);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (focused) {
      wasFocused.current = true;
      focusExitRef.current?.focus({ preventScroll: true });
    } else if (wasFocused.current) {
      wasFocused.current = false;
      (window.matchMedia('(max-width: 700px)').matches
        ? mobileFocusRef
        : sidebarFocusRef
      ).current?.focus({ preventScroll: true });
    } else if (phase === 'playing') {
      replayRef.current?.focus({ preventScroll: true });
    } else if (phase === 'ready' && hasPlayed.current) {
      playRef.current?.focus({ preventScroll: true });
    }
  }, [phase, focused]);

  useEffect(() => {
    if (launchMenu === 'start')
      firstChoiceRef.current?.focus({ preventScroll: true });
    if (launchMenu === 'custom')
      firstCustomRef.current?.focus({ preventScroll: true });
  }, [launchMenu]);

  useEffect(() => {
    if (!launchMenu || modeOpen || committed || focused) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setLaunchMenu(null);
      requestAnimationFrame(() =>
        (launchMenu === 'custom' ? customRef : playRef).current?.focus({
          preventScroll: true,
        }),
      );
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [launchMenu, modeOpen, committed, focused]);

  function cancelLaunchMenu() {
    const trigger = launchMenu === 'custom' ? customRef : playRef;
    setLaunchMenu(null);
    setModeOpen(false);
    requestAnimationFrame(() =>
      trigger.current?.focus({ preventScroll: true }),
    );
  }

  function openLaunchMenu(menu: 'start' | 'custom') {
    setFocusMode(false);
    setPregamePanelOpen(false);
    setPanelTab('new');
    setLaunchMenu(menu);
  }

  function start(nextMode: Mode = mode) {
    if (phase !== 'ready') return;
    setMode(nextMode);
    hasPlayed.current = true;
    setModeOpen(false);
    setPanelTab('new');
    setPhase('revealing');
  }
  function replay() {
    setPanelTab('new');
    setModeOpen(false);
    setLaunchMenu(null);
    setPregamePanelOpen(false);
    setFocusMode(false);
    setFlipped(false);
    setSettingsOpen(false);
    setToolNotice('');
    setPhase('ready');
  }

  function selectPanel(value: string) {
    setLaunchMenu(null);
    setModeOpen(false);
    if (value === 'new') {
      replay();
      return;
    }
    setPanelTab(value);
    if (phase === 'ready') setPregamePanelOpen(true);
  }

  return (
    <main
      className={`chess-app ${sceneReady ? 'scene-ready' : 'scene-booting'} phase-${phase} ${phase === 'ready' && (pregamePanelOpen || launchMenu) ? 'panel-preview' : ''} ${phase === 'ready' && launchMenu ? 'launch-choosing' : ''} ${focused ? 'focus-mode' : ''} ${coordinates ? '' : 'hide-coordinates'}`}
    >
      <Sidebar
        hidden={focused}
        onFocusMode={() => setFocusMode(true)}
        focusButtonRef={sidebarFocusRef}
      />
      <MobileHeader
        focused={focused}
        onFocusMode={() => setFocusMode(true)}
        focusButtonRef={mobileFocusRef}
        focusExitRef={focusExitRef}
      />
      <button
        ref={focusExitRef}
        className="focus-exit"
        onClick={() => setFocusMode(false)}
        inert={!focused}
        aria-hidden={!focused}
        aria-label="Exit focus mode"
        title="Exit focus mode (Esc)"
      >
        <ToolIcon name="close" />
      </button>
      <div className="play-space">
        <section className="play-hero" aria-label="Start a chess game">
          <div className="board-scene">
            <div className="scene-light" aria-hidden="true" />
            <div className="board-radiance" aria-hidden="true">
              <div className="radiance-halo" />
              <div className="radiance-rays" />
              <div className="radiance-rays secondary-rays" />
              <div className="radiance-shafts">
                {lightShafts.map((style, index) => (
                  <span key={index} className="light-shaft" style={style} />
                ))}
              </div>
            </div>
            <div className="ground-shadow" aria-hidden="true" />
            <div className="board-position">
              <div className="player-reveal opponent-reveal" inert={!committed}>
                <PlayerBar bottom={flipped} mode={mode} />
              </div>
              <div className="board-camera">
                <Board
                  flipped={flipped}
                  demoEnabled={sceneReady && phase === 'ready'}
                />
              </div>
              <div className="player-reveal self-reveal" inert={!committed}>
                <PlayerBar bottom={!flipped} mode={mode} />
              </div>
              <div
                className={`board-tools-zone ${settingsOpen ? 'tools-open' : ''}`}
                inert={phase !== 'playing'}
                aria-hidden={phase !== 'playing'}
              >
                <TooltipProvider delay={250}>
                  <fieldset className="board-tools" aria-label="Board tools">
                    <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
                      <PopoverTrigger
                        className="board-tool"
                        aria-label="Board settings"
                        title="Board settings"
                      >
                        <Glyph name="settings" />
                      </PopoverTrigger>
                      <PopoverContent
                        side="right"
                        sideOffset={12}
                        className="mode-popover board-settings"
                      >
                        <PopoverTitle className="mode-title">
                          Board settings
                        </PopoverTitle>
                        <label
                          className="settings-row"
                          htmlFor="board-coordinates"
                        >
                          <span>Coordinates</span>
                          <Switch
                            id="board-coordinates"
                            className="chess-switch"
                            checked={coordinates}
                            onCheckedChange={setCoordinates}
                          />
                        </label>
                        <label className="settings-row" htmlFor="board-focus">
                          <span>Focus mode</span>
                          <Switch
                            id="board-focus"
                            className="chess-switch"
                            checked={focusMode}
                            onCheckedChange={setFocusMode}
                          />
                        </label>
                      </PopoverContent>
                    </Popover>
                    <ToolButton
                      label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                      onClick={toggleFullscreen}
                      pressed={fullscreen}
                    >
                      <ToolIcon name="expand" />
                    </ToolButton>
                    <ToolButton
                      label={focused ? 'Exit focus mode' : 'Focus mode'}
                      onClick={() => setFocusMode(!focusMode)}
                      pressed={focused}
                    >
                      <ToolIcon name="focus" />
                    </ToolButton>
                    <ToolButton
                      label="Flip board"
                      onClick={() => setFlipped(!flipped)}
                      pressed={flipped}
                    >
                      <ToolIcon name="flip" />
                    </ToolButton>
                  </fieldset>
                </TooltipProvider>
              </div>
              <div
                className={`board-launch ${launchMenu ? 'launch-expanded' : ''}`}
                inert={committed}
                aria-hidden={committed}
              >
                <div className="invitation">
                  <div
                    className={`launch-home ${launchMenu ? 'launch-hidden' : ''}`}
                    inert={!!launchMenu}
                    aria-hidden={!!launchMenu}
                  >
                    <button
                      ref={customRef}
                      className="custom-game-button"
                      onClick={() => openLaunchMenu('custom')}
                      disabled={committed}
                      aria-expanded={launchMenu === 'custom'}
                      aria-controls="custom-choices"
                    >
                      Custom Game
                    </button>
                    <button
                      ref={playRef}
                      className="play-button"
                      onClick={() => openLaunchMenu('start')}
                      disabled={committed}
                      aria-expanded={launchMenu === 'start'}
                      aria-controls="start-choices"
                    >
                      Start Game
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <aside
            className="launch-side"
            aria-label="Game choices"
            inert={committed || !launchMenu || focused}
            aria-hidden={committed || !launchMenu || focused}
          >
            <div
              id="start-choices"
              className={`launch-options ${launchMenu === 'start' ? 'launch-visible' : ''}`}
              inert={launchMenu !== 'start'}
              aria-hidden={launchMenu !== 'start'}
            >
              <div className="launch-choice-row">
                {[...modes].reverse().map((item, index) => (
                  <button
                    key={item.id}
                    ref={index === 0 ? firstChoiceRef : undefined}
                    className="play-button launch-choice"
                    onClick={() => start(item)}
                    disabled={committed}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.time}</span>
                  </button>
                ))}
              </div>
              <button className="launch-cancel" onClick={cancelLaunchMenu}>
                Cancel
              </button>
            </div>
            <div
              id="custom-choices"
              className={`launch-options ${launchMenu === 'custom' ? 'launch-visible' : ''}`}
              inert={launchMenu !== 'custom'}
              aria-hidden={launchMenu !== 'custom'}
            >
              <div className="launch-choice-row">
                <Popover open={modeOpen} onOpenChange={setModeOpen}>
                  <PopoverTrigger
                    ref={firstCustomRef}
                    className="custom-game-button launch-choice"
                  >
                    <Glyph name="settings" />
                    <strong>Custom Challenge</strong>
                  </PopoverTrigger>
                  <PopoverContent className="mode-popover" sideOffset={12}>
                    <PopoverTitle className="mode-title">
                      Time control
                    </PopoverTitle>
                    <RadioGroup
                      value={mode.id}
                      onValueChange={(id) => {
                        const next = modes.find((item) => item.id === id);
                        if (next) setMode(next);
                      }}
                      aria-label="Game mode"
                    >
                      {modes.map((item) => (
                        <label
                          key={item.id}
                          className={`mode-option ${mode.id === item.id ? 'selected' : ''}`}
                        >
                          <RadioGroupItem value={item.id} />
                          <span>
                            <strong>{item.label}</strong>
                          </span>
                          <b>{item.time}</b>
                        </label>
                      ))}
                    </RadioGroup>
                    <button className="mode-done" onClick={() => start()}>
                      Start Challenge
                    </button>
                  </PopoverContent>
                </Popover>
                <button
                  className="custom-game-button launch-choice"
                  onClick={() => {
                    setLaunchMenu(null);
                    selectPanel('players');
                  }}
                >
                  <Glyph name="users" />
                  <strong>Play a Friend</strong>
                </button>
                <button
                  className="custom-game-button launch-choice"
                  aria-disabled="true"
                  title="Tournaments are unavailable in this local preview"
                >
                  <span aria-hidden="true">🏅</span>
                  <strong>Tournaments</strong>
                </button>
              </div>
              <button className="launch-cancel" onClick={cancelLaunchMenu}>
                Cancel
              </button>
            </div>
          </aside>

          <aside
            className="hero-controls"
            aria-label="Game panel"
            inert={focused}
            aria-hidden={focused}
          >
            <Tabs
              value={panelTab}
              onValueChange={(value) => selectPanel(String(value))}
              className="game-panel"
            >
              <TabsList className="panel-tabs" aria-label="Game tools">
                {(
                  [
                    ['new', 'new', 'New Game'],
                    ['games', 'board', 'Games'],
                    ['players', 'users', 'Players'],
                  ] as const
                ).map(([value, icon, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="panel-tab"
                    onClick={() => selectPanel(value)}
                  >
                    <Glyph name={icon} />
                    <span>{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="new" className="panel-detail new-game-detail">
                <h1>Play Chess</h1>
              </TabsContent>
              <TabsContent value="games" className="panel-detail data-panel">
                <GameHistory />
              </TabsContent>
              <TabsContent value="players" className="panel-detail data-panel">
                <PlayerDirectory />
              </TabsContent>
            </Tabs>

            <div className="panel-actions" hidden={panelTab !== 'new'}>
              <div className="action-states">
                <div
                  className="committed-panel"
                  inert={!committed}
                  aria-hidden={!committed}
                >
                  <div className="selected-mode">
                    <Glyph name="clock" />
                    <span>
                      {mode.label} · {mode.time}
                    </span>
                  </div>
                  <div className="move-controls" aria-label="Move navigation">
                    {(
                      [
                        ['first', 'First move'],
                        ['previous', 'Previous move'],
                        ['play', 'Play moves'],
                        ['next', 'Next move'],
                        ['last', 'Last move'],
                      ] as const
                    ).map(([icon, label]) => (
                      <button key={icon} aria-label={label} disabled>
                        <Glyph name={icon} />
                      </button>
                    ))}
                  </div>
                  <button
                    ref={replayRef}
                    className="replay-button"
                    onClick={replay}
                    disabled={phase === 'revealing'}
                  >
                    <Glyph name="undo" />
                    Back to Play
                  </button>
                </div>
              </div>
            </div>
          </aside>
          <aside
            className="ad-rail"
            aria-label="Advertisement area"
            inert={phase !== 'playing' || focused}
            aria-hidden={phase !== 'playing' || focused}
          >
            <button className="remove-ads-button" aria-disabled="true">
              <Glyph name="block" />
              <span>Remove Ads</span>
            </button>
          </aside>
          {toolNotice && (
            <output className="tool-notice" aria-live="polite">
              {toolNotice}
              <button
                onClick={() => setToolNotice('')}
                aria-label="Dismiss notice"
              >
                <ToolIcon name="close" />
              </button>
            </output>
          )}
          <output className="sr-only" aria-live="polite">
            {phase === 'revealing'
              ? 'Revealing board.'
              : phase === 'playing'
                ? `${mode.label}, ${mode.time}. Board revealed. This is an interaction preview.`
                : ''}
          </output>
        </section>
      </div>
    </main>
  );
}
