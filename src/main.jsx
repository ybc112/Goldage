import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ethers } from "ethers";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  Flame,
  Gamepad2,
  Gem,
  Handshake,
  Info,
  Landmark,
  Loader2,
  LockKeyhole,
  Menu,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import "./styles.css";

// ===== 常量 =====
const BSC_CHAIN_ID = 56n;
const BSC_HEX = "0x38";
const RPC_URL = "https://bsc-rpc.publicnode.com";
const EXPLORER = "https://bscscan.com/address/";
const TX_EXPLORER = "https://bscscan.com/tx/";
const ASSET_ROOT = "/assets/ui-kit/";
const DEXSCREENER_URL =
  "https://api.dexscreener.com/latest/dex/tokens/0x354399cFb90c932e3EA8fa34F2503d75BB677777";
const BSC_BLOCK_TIME = 3; // BSC 平均 3 秒一个区块

const ADDRESSES = {
  goldage: "0x354399cFb90c932e3EA8fa34F2503d75BB677777",
  vault: "0xBb279803467a5E6C2ae1B9959ac29A8d082D0Ea7",
  factory: "0x04f2393A519a0F3b9Ab0292EAF6Ed2745F72660b",
  xaut: "0x21cAef8A43163Eea865baeE23b9C2E327696A3bf",
  usdt: "0x55d398326f99059fF775485246999027B3197955",
  wbnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  pair: "0xCf0686b0fB88bf287542487948902487Fb884806",
  dead: "0x000000000000000000000000000000000000dEaD",
};

const FOUNDATION_ADDRESS = "0x3eaef0428a1cde7d6fb6fc33bacf3aa06bcd8ff8";

const ROUTES = [
  { id: "home", label: "首页", hash: "#/" },
  { id: "tokenomics", label: "Tokenomics", hash: "#/tokenomics" },
  { id: "foundation", label: "Foundation", hash: "#/foundation" },
  { id: "roadmap", label: "Roadmap", hash: "#/roadmap" },
  { id: "vault", label: "金库", hash: "#/vault" },
  { id: "faq", label: "FAQ", hash: "#/faq" },
  { id: "community", label: "Community", hash: "#/community" },
  { id: "mechanism", label: "机制", hash: "#/mechanism" },
  { id: "data", label: "数据", hash: "#/data" },
  { id: "contracts", label: "合约", hash: "#/contracts" },
  { id: "game", label: "游戏", hash: "#/game" },
  { id: "mall", label: "商城", hash: "#/mall" },
  { id: "cooperation", label: "商务合作", hash: "#/cooperation" },
];

const NAV_ITEMS = [
  { id: "home", label: "首页", hash: "#/" },
  { id: "data", label: "数据", hash: "#/data" },
  { id: "tokenomics", label: "机制", hash: "#/tokenomics" },
  { id: "foundation", label: "基金会", hash: "#/foundation" },
  { id: "vault", label: "质押", hash: "#/vault" },
  { id: "game", label: "游戏", hash: "#/game" },
  { id: "mall", label: "商城", hash: "#/mall" },
  { id: "roadmap", label: "路线图", hash: "#/roadmap" },
  { id: "community", label: "社区", hash: "#/community" },
];

const UI = {
  brand: `${ASSET_ROOT}brand-ca-gold.png`,
};

// ===== ABI 定义（保持不变） =====
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner,address spender) view returns (uint256)",
  "function approve(address spender,uint256 amount) returns (bool)",
];

const ROUTER_ABI = [
  "function getAmountsOut(uint256 amountIn,address[] calldata path) view returns(uint256[] memory amounts)",
];

const VAULT_ABI = [
  "function initialized() view returns (bool)",
  "function owner() view returns (address)",
  "function keeper() view returns (address)",
  "function stakeToken() view returns (address)",
  "function xaut() view returns (address)",
  "function buybackAsset() view returns (address)",
  "function realtimeDividendTracker() view returns (address)",
  "function stakePassBurnAmount() view returns (uint256)",
  "function claimVoucherBurnAmount() view returns (uint256)",
  "function minimumStakeAmount() view returns (uint256)",
  "function earlyUnlockWindow() view returns (uint256)",
  "function earlyUnlockPenaltyBps() view returns (uint256)",
  "function defenseTriggerDropBps() view returns (uint256)",
  "function totalOriginalStaked() view returns (uint256)",
  "function totalEffectiveStake() view returns (uint256)",
  "function totalBurnedStakeTokens() view returns (uint256)",
  "function totalStakingXautDeposited() view returns (uint256)",
  "function totalStakingXautPaid() view returns (uint256)",
  "function totalRealtimeXautDeposited() view returns (uint256)",
  "function totalRealtimeXautClaimed() view returns (uint256)",
  "function buybackPoolDeposited() view returns (uint256)",
  "function buybackPoolUsed() view returns (uint256)",
  "function buybackPoolAvailable() view returns (uint256)",
  "function buybackCount() view returns (uint256)",
  "function lastBuybackAt() view returns (uint256)",
  "function lastReferencePrice() view returns (uint256)",
  "function defenseReferencePrice() view returns (uint256)",
  "function lastDefenseDropBps() view returns (uint256)",
  "function currentDefenseTriggered() view returns (bool)",
  "function positions(address account) view returns (uint256 originalAmount,uint256 bookPrincipal,uint256 effectiveAmount,uint256 rewardDebt,uint256 pendingXaut,uint256 compoundedXaut,uint256 startedAt,uint256 lastSyncedAt,bool active,bool everStaked)",
  "function stakeSummary(address account) view returns (uint256 minimumStakeAmount,uint256 myStakeAmount,uint256 currentWeight,uint256 claimableXaut,uint256 secondsUntilNoPenalty)",
  "function hasStakePass(address account) view returns (bool)",
  "function claimVouchers(address account) view returns (uint256)",
  "function cumulativeClaimedXaut(address account) view returns (uint256)",
  "function firstHoldingAt(address account) view returns (uint256)",
  "function burnForStakePass()",
  "function burnForClaimVoucher()",
  "function stake(uint256 amount)",
  "function claimStakingDividend()",
  "function compoundStakingDividend()",
  "function syncAccount(address account)",
  "function touchHoldingRecord(address account)",
  "function unlock()",
];

const FACTORY_ABI = [
  "function implementation() view returns (address)",
  "function isVaultFromFactory(address vault) view returns (bool)",
  "function vaultUpgradesLocked() view returns (bool)",
  "function allVaultsLength() view returns (uint256)",
];

const readProvider = new ethers.JsonRpcProvider(RPC_URL, Number(BSC_CHAIN_ID), {
  staticNetwork: true,
  batchMaxCount: 1,
});

// ===== 通用工具函数 =====
function shorten(address) {
  if (!address) return "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function toNumber(value, decimals = 18) {
  return Number(ethers.formatUnits(value ?? 0n, decimals));
}

function formatFull(value, digits = 2) {
  if (!Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

function formatCompact(value, digits = 1) {
  if (!Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(value);
}

function formatUsd(value, digits = 0) {
  if (!Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
  }).format(value);
}

function formatDate(seconds) {
  const value = Number(seconds || 0n);
  if (!value) return "--";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value * 1000));
}

function formatHours(seconds) {
  const value = Number(seconds || 0);
  if (value <= 0) return "0h";
  return `${Math.ceil(value / 3600)}h`;
}

async function copyText(text) {
  await navigator.clipboard?.writeText(text);
}

function getRouteFromHash() {
  if (typeof window === "undefined") return "home";
  const id = window.location.hash.replace(/^#\/?/, "") || "home";
  return ROUTES.some((route) => route.id === id) ? id : "home";
}

// ===== Hooks =====
// 数字滚动 hook，基于 requestAnimationFrame，easeOutCubic 缓动
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const rafRef = useRef(0);
  useEffect(() => {
    const from = valueRef.current;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      valueRef.current = next;
      setValue(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return value;
}

// IntersectionObserver hook，元素进入视口时触发
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px", ...options }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

// Toast hook，返回 { notify, close, toasts }
function useToast() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const close = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);
  const notify = useCallback(
    (type, title, message = "") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      const timer = window.setTimeout(() => close(id), 3000);
      timersRef.current.set(id, timer);
      return id;
    },
    [close]
  );
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);
  return { toasts, notify, close };
}

// ===== 链上/第三方数据获取 =====
async function withTimeout(promise, ms, fallback = null) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((resolve) => {
        timer = window.setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    if (timer) window.clearTimeout(timer);
  }
}

// 从 DEXScreener 拉取 GoldAge 实时市场数据
async function fetchDexScreener() {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(DEXSCREENER_URL, { signal: controller.signal });
    if (!res.ok) throw new Error("DEXScreener 请求失败");
    const json = await res.json();
    const pairs = json.pairs || [];
    const bscPairs = pairs.filter((p) => p.chainId === "bsc");
    const pair =
      bscPairs.find((p) => p.quoteToken?.symbol === "WBNB") ||
      bscPairs.find((p) => p.quoteToken?.symbol === "USDT") ||
      bscPairs[0];
    if (!pair) return null;
    return {
      priceUsd: Number(pair.priceUsd || 0),
      txns: pair.txns || {},
      volume: pair.volume || {},
      priceChange: pair.priceChange || {},
      liquidity: pair.liquidity || {},
      pairAddress: pair.pairAddress,
      dexId: pair.dexId,
      baseSymbol: pair.baseToken?.symbol,
      quoteSymbol: pair.quoteToken?.symbol,
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

// 计算历史区块目标列表
async function buildHistoricalBlocks(numPoints, intervalHours) {
  const intervalSeconds = intervalHours * 3600;
  const currentBlock = await readProvider.getBlockNumber();
  const currentBlockData = await readProvider.getBlock(currentBlock);
  const now = currentBlockData.timestamp;
  const targets = [];
  for (let i = numPoints - 1; i >= 0; i--) {
    const targetTime = now - i * intervalSeconds;
    const approxBlock = currentBlock - Math.floor((now - targetTime) / BSC_BLOCK_TIME);
    targets.push({ t: targetTime, block: Math.max(approxBlock, 1) });
  }
  return targets;
}

// 链上多区块查询历史价格（PancakeRouter getAmountsOut，21 个点，每 8 小时）
async function fetchHistoricalPrices(numPoints = 21, intervalHours = 8) {
  const targets = await buildHistoricalBlocks(numPoints, intervalHours);
  const router = new ethers.Contract(ADDRESSES.router, ROUTER_ABI, readProvider);
  const path = [ADDRESSES.goldage, ADDRESSES.wbnb, ADDRESSES.usdt];
  const amountIn = ethers.parseEther("1");
  const results = await Promise.all(
    targets.map(async (target) => {
      try {
        const amounts = await withTimeout(
          router.getAmountsOut(amountIn, path, {
            blockTag: target.block,
          }),
          1800
        );
        if (!amounts) return null;
        return {
          t: target.t,
          price: Number(ethers.formatEther(amounts[amounts.length - 1])),
          block: target.block,
        };
      } catch {
        return null;
      }
    })
  );
  const history = results.filter(Boolean);
  if (history.length >= 2) return history;

  const liveAmounts = await withTimeout(router.getAmountsOut(amountIn, path), 4500);
  if (!liveAmounts) return history;
  const livePrice = Number(ethers.formatEther(liveAmounts[liveAmounts.length - 1]));
  return targets.map((target) => ({
    t: target.t,
    price: livePrice,
    block: target.block,
    liveFallback: true,
  }));
}

// 链上多区块查询金库历史质押量（totalOriginalStaked）
async function fetchVaultHistory(numPoints = 21, intervalHours = 8) {
  const targets = await buildHistoricalBlocks(numPoints, intervalHours);
  const vault = new ethers.Contract(ADDRESSES.vault, VAULT_ABI, readProvider);
  const results = await Promise.all(
    targets.map(async (target) => {
      try {
        const staked = await withTimeout(vault.totalOriginalStaked({ blockTag: target.block }), 1800);
        if (staked == null) return null;
        return { t: target.t, staked: toNumber(staked), block: target.block };
      } catch {
        return null;
      }
    })
  );
  const history = results.filter(Boolean);
  if (history.length >= 2) return history;

  const liveStaked = await withTimeout(vault.totalOriginalStaked(), 4500);
  if (liveStaked == null) return history;
  const staked = toNumber(liveStaked);
  return targets.map((target) => ({
    t: target.t,
    staked,
    block: target.block,
    liveFallback: true,
  }));
}

// ===== 通用展示组件 =====
function AssetIcon({ icon: Icon, size = 18 }) {
  return Icon ? <Icon size={size} /> : null;
}

// 骨架屏卡片，shimmer 动画
function SkeletonCard({ lines = 3 }) {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-shimmer" style={{ width: "40%", height: 20 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-line skeleton-shimmer"
          style={{ width: i === lines - 1 ? "60%" : "100%", height: i === 0 ? 28 : 14 }}
        />
      ))}
    </div>
  );
}

// 包装 useCountUp，接受数值与格式化函数
function AnimatedNumber({ value, format, duration = 800 }) {
  const animated = useCountUp(Number(value) || 0, duration);
  return <span>{format ? format(animated) : animated}</span>;
}

function StatCard({ icon, label, value, sub, tone = "gold", animate, rawValue, formatValue }) {
  return (
    <div className={`stat-card stat-tone-${tone}`}>
      <div className="stat-top">
        <span className={`icon-chip ${tone}`}>
          <AssetIcon icon={icon} size={20} />
        </span>
        <span>{label}</span>
      </div>
      <strong>
        {animate && Number.isFinite(Number(rawValue)) ? (
          <AnimatedNumber value={rawValue} format={formatValue} />
        ) : (
          value
        )}
      </strong>
      {sub ? <small className={tone === "green" ? "positive" : ""}>{sub}</small> : null}
    </div>
  );
}

function ActionButton({ children, icon, onClick, disabled, primary }) {
  return (
    <button
      className={primary ? "action primary" : "action"}
      onClick={onClick}
      disabled={disabled}
    >
      <AssetIcon icon={icon} size={18} />
      <span>{children}</span>
    </button>
  );
}

function ContractRow({ name, address }) {
  return (
    <div className="contract-row">
      <span>{name}</span>
      <code>{shorten(address)}</code>
      <button aria-label={`复制 ${name}`} onClick={() => copyText(address)}>
        <Copy size={16} />
      </button>
      <a href={`${EXPLORER}${address}`} target="_blank" rel="noreferrer">
        <ArrowUpRight size={16} />
        BscScan
      </a>
    </div>
  );
}

// 入场动画包装：进入视口时淡入上滑，支持 stagger 延迟
function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "reveal-in" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

// ===== Toast 容器 =====
function ToastIcon({ type }) {
  if (type === "success") return <CheckCircle2 size={18} />;
  if (type === "error") return <AlertCircle size={18} />;
  if (type === "pending") return <Loader2 size={18} className="spin" />;
  return <Info size={18} />;
}

function ToastContainer({ toasts, onClose }) {
  return (
    <div className="toast-container" role="region" aria-label="通知">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            <ToastIcon type={t.type} />
          </span>
          <div className="toast-body">
            <strong>{t.title}</strong>
            {t.message ? <span>{t.message}</span> : null}
          </div>
          <button className="toast-close" aria-label="关闭" onClick={() => onClose(t.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ===== 价格走势图（SVG，支持 hover） =====
function PriceChart({ points, title = "价格走势 (7天)", height = 260 }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);

  if (!points || points.length < 2) {
    return (
      <div className="chart-card">
        <span className="chart-title">{title}</span>
        <SkeletonCard lines={4} />
      </div>
    );
  }

  const width = 640;
  const padL = 86;
  const padR = 24;
  const padT = 54;
  const padB = 42;
  const w = width - padL - padR;
  const h = height - padT - padB;

  const prices = points.map((p) => p.price);
  const rawMin = Math.min(...prices);
  const rawMax = Math.max(...prices);
  const flatRange = Math.abs(rawMax - rawMin) <= Math.max(Math.abs(rawMax) * 1e-9, 1e-12);
  const pad = flatRange ? Math.max(Math.abs(rawMax) * 0.015, 0.00000001) : 0;
  const min = rawMin - pad;
  const max = rawMax + pad;
  const range = max - min || 1;
  const xStep = w / (points.length - 1);
  const liveFallback = points.some((p) => p.liveFallback);

  const coords = points.map((p, i) => ({
    x: padL + i * xStep,
    y: padT + h - ((p.price - min) / range) * h,
    ...p,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${padT + h} L ${coords[0].x.toFixed(2)} ${padT + h} Z`;

  const upTrend = prices[prices.length - 1] >= prices[0];
  const lineClass = upTrend ? "chart-line-path chart-line-up" : "chart-line-path chart-line-down";

  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((r) => padT + h - r * h);

  const handleMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    let nearest = 0;
    let minDist = Infinity;
    coords.forEach((c, i) => {
      const d = Math.abs(c.x - x);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    });
    setHoverIdx(nearest);
  };

  const hover = !liveFallback && hoverIdx !== null ? coords[hoverIdx] : null;
  const currentPrice = prices[prices.length - 1] || 0;

  return (
    <div className={`chart-card${liveFallback ? " snapshot-mode" : ""}`}>
      <span className="chart-title">{title}</span>
      {liveFallback ? <span className="chart-source">当前链上快照</span> : null}
      <svg
        ref={svgRef}
        className="price-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
        onMouseMove={liveFallback ? undefined : handleMove}
        onMouseLeave={liveFallback ? undefined : () => setHoverIdx(null)}
      >
        <g className="chart-grid">
          {gridYs.map((y, i) => (
            <line key={`h-${i}`} x1={padL} y1={y} x2={width - padR} y2={y} />
          ))}
        </g>
        {!liveFallback ? [0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const v = min + r * range;
          return (
            <text key={`yl-${i}`} className="chart-axis-label" x={padL - 6} y={gridYs[i] + 3} textAnchor="end">
              {`$${v.toFixed(v < 0.01 ? 8 : 4)}`}
            </text>
          );
        }) : null}
        {liveFallback ? (
          <g className="chart-snapshot-guide">
            <rect
              className="chart-snapshot-band"
              x={padL}
              y={coords[0].y - 16}
              width={w}
              height="32"
              rx="16"
            />
            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
              <line
                key={`snapshot-tick-${i}`}
                className="chart-snapshot-tick"
                x1={padL + r * w}
                y1={coords[0].y - 12}
                x2={padL + r * w}
                y2={coords[0].y + 12}
              />
            ))}
            <line x1={padL} y1={coords[0].y} x2={width - padR} y2={coords[0].y} />
            <circle cx={width - padR} cy={coords[coords.length - 1].y} r="5" />
          </g>
        ) : (
          <path className="chart-area-fill" d={areaPath} />
        )}
        <path className={`${lineClass}${liveFallback ? " chart-live-line" : ""}`} d={linePath} />
        {hover ? (
          <g className="chart-hover">
            <line
              className="chart-hover-line"
              x1={hover.x}
              y1={padT}
              x2={hover.x}
              y2={padT + h}
            />
            <circle className="chart-hover-dot" cx={hover.x} cy={hover.y} r={4} />
          </g>
        ) : null}
      </svg>
      {hover ? (
        <div className="chart-tooltip">
          <span>{formatDate(hover.t)}</span>
          <strong>{`$${hover.price.toFixed(8)}`}</strong>
        </div>
      ) : null}
      {liveFallback ? (
        <div className="chart-current-value">
          <span>实时价格</span>
          <strong>{`$${currentPrice.toFixed(8)}`}</strong>
        </div>
      ) : null}
    </div>
  );
}

// ===== 金库趋势图（质押量变化） =====
function VaultTrendChart({ points, title = "金库质押趋势 (7天)", height = 260 }) {
  if (!points || points.length < 2) {
    return (
      <div className="chart-card">
        <span className="chart-title">{title}</span>
        <SkeletonCard lines={4} />
      </div>
    );
  }
  const width = 640;
  const padL = 82;
  const padR = 24;
  const padT = 54;
  const padB = 42;
  const w = width - padL - padR;
  const h = height - padT - padB;

  const values = points.map((p) => p.staked);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const flatRange = Math.abs(rawMax - rawMin) <= Math.max(Math.abs(rawMax) * 1e-9, 1);
  const pad = flatRange ? Math.max(Math.abs(rawMax) * 0.035, 1) : 0;
  const min = Math.max(0, rawMin - pad);
  const max = rawMax + pad;
  const range = max - min || 1;
  const xStep = w / (points.length - 1);
  const liveFallback = points.some((p) => p.liveFallback);
  const coords = points.map((p, i) => ({
    x: padL + i * xStep,
    y: padT + h - ((p.staked - min) / range) * h,
    ...p,
  }));
  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${padT + h} L ${coords[0].x.toFixed(2)} ${padT + h} Z`;
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((r) => padT + h - r * h);
  const currentStaked = values[values.length - 1] || 0;

  return (
    <div className={`chart-card${liveFallback ? " snapshot-mode" : ""}`}>
      <span className="chart-title">{title}</span>
      {liveFallback ? <span className="chart-source">当前链上快照</span> : null}
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <g className="chart-grid">
          {gridYs.map((y, i) => (
            <line key={`h-${i}`} x1={padL} y1={y} x2={width - padR} y2={y} />
          ))}
        </g>
        {!liveFallback ? [0, 0.25, 0.5, 0.75, 1].map((r, i) => (
          <text key={`yl-${i}`} className="chart-axis-label" x={padL - 6} y={gridYs[i] + 3} textAnchor="end">
            {formatFull(min + range * r, 0)}
          </text>
        )) : null}
        {liveFallback ? (
          <g className="chart-snapshot-guide">
            <rect
              className="chart-snapshot-band"
              x={padL}
              y={coords[0].y - 16}
              width={w}
              height="32"
              rx="16"
            />
            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
              <line
                key={`snapshot-tick-${i}`}
                className="chart-snapshot-tick"
                x1={padL + r * w}
                y1={coords[0].y - 12}
                x2={padL + r * w}
                y2={coords[0].y + 12}
              />
            ))}
            <line x1={padL} y1={coords[0].y} x2={width - padR} y2={coords[0].y} />
            <circle cx={width - padR} cy={coords[coords.length - 1].y} r="5" />
          </g>
        ) : (
          <path className="chart-area-fill" d={areaPath} />
        )}
        <path className={`chart-line-path chart-line-up${liveFallback ? " chart-live-line" : ""}`} d={linePath} />
      </svg>
      {liveFallback ? (
        <div className="chart-current-value">
          <span>实时质押量</span>
          <strong>{formatFull(currentStaked, 0)}</strong>
        </div>
      ) : null}
    </div>
  );
}

// ===== 质押占比环形图 =====
function StakeRingChart({ staked, total, title = "质押占比" }) {
  const safeTotal = total > 0 ? total : 1;
  const pct = Math.max(0, Math.min(100, (staked / safeTotal) * 100));
  const r = 58;
  return (
    <div className="chart-card ring-card">
      <span className="chart-title">{title}</span>
      <svg viewBox="0 0 260 180" role="img" aria-label={title}>
        <circle className="ring-bg" cx="130" cy="92" r={r} />
        <circle
          className="ring-fg"
          cx="130"
          cy="92"
          r={r}
          pathLength={100}
          style={{ strokeDasharray: `${pct} ${100 - pct}` }}
        />
        <text x="130" y="90" textAnchor="middle" className="ring-text">
          {pct.toFixed(2)}%
        </text>
        <text x="130" y="112" textAnchor="middle" className="ring-sub">
          {formatFull(staked, 0)} / {formatFull(total, 0)}
        </text>
      </svg>
    </div>
  );
}

function MarketTerminal({ data, dexData, trend }) {
  let pathD = "M0 92 C40 76,70 82,105 62 S170 42,210 56 S275 78,315 45 S390 18,430 34 S485 58,520 24";
  let areaD = `${pathD} L520 120 L0 120 Z`;

  if (trend && trend.length >= 2) {
    const prices = trend.map((point) => point.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const step = 520 / (trend.length - 1);
    const points = trend.map((point, index) => {
      const x = index * step;
      const y = 94 - ((point.price - min) / range) * 62;
      return [x, y];
    });
    pathD = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    areaD = `${pathD} L520 120 L0 120 Z`;
  }

  const price = dexData?.priceUsd || data?.price || 0;
  const change = dexData?.priceChange?.h24;
  const priceLabel = price ? `$${price < 0.01 ? price.toFixed(8) : price.toFixed(4)}` : "--";
  const changeLabel = change == null ? "LIVE" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  const dividendPool = data ? `${formatFull(data.xautBalance, 4)} XAUt` : "--";
  const staking = data ? formatCompact(data.totalStaked, 1) : "--";
  const burned = data ? formatCompact(data.burned, 2) : "--";
  const buyback = data ? formatUsd(data.buybackAvailable, 2) : "--";

  return (
    <aside className="market-terminal" aria-label="GoldAge Market Terminal">
      <div className="terminal-head">
        <h3>GoldAge Market Terminal</h3>
        <span className="live-chip">{changeLabel}</span>
      </div>
      <div className="terminal-price-box">
        <div className="terminal-price-row">
          <div>
            <span>黄金時代 / USDT</span>
            <strong>{priceLabel}</strong>
          </div>
          {change != null && (
            <small className={change >= 0 ? "positive" : "negative"}>
              {changeLabel}
            </small>
          )}
        </div>
        <div className="terminal-chart">
          <svg viewBox="0 0 520 120" preserveAspectRatio="none" role="img" aria-label="黄金時代价格走势">
            <path className="terminal-area" d={areaD} />
            <path className="terminal-line" d={pathD} />
          </svg>
        </div>
      </div>
      <div className="terminal-kpis">
        <div>
          <span>黄金分红池</span>
          <strong>{dividendPool}</strong>
        </div>
        <div>
          <span>当前质押量</span>
          <strong>{staking}</strong>
        </div>
        <div>
          <span>累计销毁</span>
          <strong>{burned}</strong>
        </div>
        <div>
          <span>回购防守池</span>
          <strong>{buyback}</strong>
        </div>
      </div>
    </aside>
  );
}

function CoreMetrics({ data, navigate }) {
  const tvl = data ? data.totalStaked * data.price : null;
  const metrics = [
    {
      icon: "MC",
      label: "当前市值 · Market Cap",
      value: "--",
      rawValue: data ? data.marketCap : null,
      formatValue: (value) => formatUsd(value, 0),
      sub: data ? `FDV ${formatUsd(data.fdv, 0)}` : "On-chain pricing",
      badge: "Live",
    },
    {
      icon: "Au",
      label: "黄金分红池 · Gold Pool",
      value: "--",
      rawValue: data ? data.xautBalance : null,
      formatValue: (value) => `${formatFull(value, 4)} XAUt`,
      sub: "Vault reserve balance",
      badge: "+",
    },
    {
      icon: "50%",
      label: "实时分红池 · Real-Time",
      value: "--",
      rawValue: data ? data.realtimeDeposited : null,
      formatValue: (value) => `${formatFull(value, 4)} XAUt`,
      sub: data ? `Claimed ${formatFull(data.realtimeClaimed, 4)} XAUt` : "Realtime channel",
      badge: "Live",
    },
    {
      icon: "40%",
      label: "质押分红池 · Staking",
      value: "--",
      rawValue: data ? data.stakingDeposited : null,
      formatValue: (value) => `${formatFull(value, 4)} XAUt`,
      sub: data ? `Paid ${formatFull(data.stakingPaid, 4)} XAUt` : "Vault channel",
      badge: "Stake",
    },
    {
      icon: "TVL",
      label: "总质押量 · Total Staked",
      value: "--",
      rawValue: data ? data.totalStaked : null,
      formatValue: (value) => formatCompact(value, 1),
      sub: data ? `${formatUsd(tvl, 0)} TVL` : "Vault live",
      badge: data ? `${((data.totalStaked / data.total) * 100).toFixed(2)}%` : "Live",
    },
    {
      icon: "BRN",
      label: "累计销毁 · Burned",
      value: "--",
      rawValue: data ? data.burned : null,
      formatValue: (value) => formatFull(value, 0),
      sub: data ? `${((data.burned / data.total) * 100).toFixed(2)}% supply` : "Burn status",
      badge: "Burn",
      action: () => window.open(`${EXPLORER}${ADDRESSES.goldage}`, "_blank", "noreferrer"),
    },
  ];

  return (
    <section className="institutional-section metric-section">
      <div className="section-kicker">Protocol Data</div>
      <div className="institutional-head">
        <h2>核心数据，链上实时校验</h2>
        <p>以 BNB Chain、Pancake Router 与 Vault 合约读数为基础，展示协议运行状态、黄金储备与分红沉淀。</p>
      </div>
      <div className="institutional-metrics">
        {metrics.map((item) => (
          <button
            key={item.label}
            className="metric-tile exchange-metric"
            type="button"
            onClick={item.action || (() => navigate("data"))}
          >
            <div className="metric-topline">
              <b>{item.icon}</b>
              <em>{item.badge}</em>
            </div>
            <span>{item.label}</span>
            <strong>
              {Number.isFinite(Number(item.rawValue)) ? (
                <AnimatedNumber value={item.rawValue} format={item.formatValue} />
              ) : (
                item.value
              )}
            </strong>
            <small>{item.sub}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function TokenomicsSection({ data, compact = false }) {
  return (
    <section className={`institutional-section tokenomics-section${compact ? " route-section" : ""}`}>
      <div className="section-kicker">Tokenomics</div>
      <div className="institutional-head split">
        <div>
          <h2>税费机制</h2>
          <p>每一笔买卖都进入协议分配系统，形成黄金分红、质押收益与回购防守闭环。</p>
        </div>
        <div className="oversized-number">
          <strong>3%</strong>
          <span>Buy / Sell Tax</span>
        </div>
      </div>
      <div className="exchange-tax-grid">
        <div className="tax-panel tax-gold">
          <strong>90%</strong>
          <h3>黄金分红池</h3>
          <span>Gold Dividend Pool</span>
          <div className="tax-subgrid">
            <div>
              <span>实时分红</span>
              <b>50%</b>
            </div>
            <div>
              <span>质押分红</span>
              <b>40%</b>
            </div>
          </div>
        </div>
        <div className="tax-panel tax-core">
          <strong>3%</strong>
          <h3>买卖税</h3>
          <span>Transaction Tax</span>
          <p>交易价值进入协议分配系统，自动连接分红、质押与防守模块。</p>
        </div>
        <div className="tax-panel tax-defense">
          <strong>10%</strong>
          <h3>回购防守</h3>
          <span>Buyback Defense</span>
          <p>单日跌幅触发风控逻辑时，协议回购黄金時代并补充流动性。</p>
        </div>
      </div>
      <div className="tokenomics-mini-grid">
        <div>
          <span>Total Supply</span>
          <strong>{data ? formatFull(data.total, 0) : "--"}</strong>
        </div>
        <div>
          <span>Burned</span>
          <strong>{data ? formatFull(data.burned, 0) : "--"}</strong>
        </div>
        <div>
          <span>Buyback Count</span>
          <strong>{data ? data.buybackCount : "--"}</strong>
        </div>
      </div>
    </section>
  );
}

function DividendSection({ data }) {
  return (
    <section className="institutional-section dividend-section">
      <div className="section-kicker">RWA Gold Dividend</div>
      <div className="institutional-head">
        <h2>黄金分红双通道</h2>
        <p>持有即分与质押复利并行，让时间成为收益权重的核心变量。</p>
      </div>
      <div className="dividend-grid">
        <div className="glass-feature">
          <span>Realtime Dividend</span>
          <h3>50% 实时分红</h3>
          <p>面向持有者的实时分红通道，强调持续持有和透明结算。</p>
        </div>
        <div className="glass-feature">
          <span>Staking Compound</span>
          <h3>40% 质押复利</h3>
          <p>通过 Vault 质押提升权重，时间越长，分红权重越高。</p>
        </div>
        <div className="glass-feature highlight">
          <span>Vault Balance</span>
          <h3>{data ? `${formatFull(data.xautBalance, 6)} XAUt` : "--"}</h3>
          <p>当前金库黄金资产余额，来自链上合约实时读取。</p>
        </div>
      </div>
    </section>
  );
}

function StakingLadderSection({ navigate }) {
  const levels = [
    { label: "0D+", value: "1x" },
    { label: "5D+", value: "1.5x" },
    { label: "10D+", value: "2x" },
    { label: "15D+", value: "3x", crown: true },
  ];
  return (
    <section className="institutional-section ladder-section">
      <div className="section-kicker">Time Weighted Staking</div>
      <div className="institutional-head split">
        <div>
          <h2>时间权重，四层黄金阶梯</h2>
          <p>质押时间越长，权重越高。最高进入 3 倍收益权重区间。</p>
        </div>
        <button className="action primary" type="button" onClick={() => navigate("vault")}>
          <LockKeyhole size={18} />
          Stake Now
        </button>
      </div>
      <div className="gold-ladder">
        {levels.map((level, index) => (
          <div key={level.value} className={`ladder-step step-${index + 1}`}>
            <span>{level.label}</span>
            <strong>{level.value}</strong>
            {level.crown ? <small>皇冠权重</small> : <small>Time lock</small>}
          </div>
        ))}
      </div>
    </section>
  );
}

function FoundationSection() {
  return (
    <section className="institutional-section foundation-section">
      <div className="section-kicker">Foundation</div>
      <div className="foundation-layout">
        <div className="institutional-head">
          <h2>基金会与链上可信地址</h2>
          <p>基金会地址、核心合约与官方社群统一展示，帮助用户识别官方信息入口。</p>
        </div>
        <a className="foundation-address" href={`${EXPLORER}${FOUNDATION_ADDRESS}`} target="_blank" rel="noreferrer">
          <span>Foundation Address</span>
          <strong>{FOUNDATION_ADDRESS}</strong>
          <ArrowUpRight size={18} />
        </a>
      </div>
    </section>
  );
}

function RoadmapSection() {
  const items = [
    ["Phase 01", "BNB Chain 部署", "代币、Vault、Router、数据面板上线"],
    ["Phase 02", "RWA 分红叙事", "完善黄金分红、回购护盘与质押权重"],
    ["Phase 03", "生态扩展", "游戏、商城、社区任务与合作资源接入"],
    ["Phase 04", "国际化品牌", "面向 RWA、交易生态和机构合作扩张"],
  ];
  return (
    <section className="institutional-section roadmap-section">
      <div className="section-kicker">Roadmap</div>
      <div className="institutional-head">
        <h2>从链上协议到黄金生态</h2>
        <p>路线图聚焦可验证合约、RWA 叙事、社区生态和国际化合作。</p>
      </div>
      <div className="roadmap-line">
        {items.map(([phase, title, text]) => (
          <div key={phase} className="roadmap-card">
            <span>{phase}</span>
            <strong>{title}</strong>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    [
      "Q1：黄金时代是什么？",
      "黄金时代是一个以真实黄金 RWA 为支撑的去中心化分红协议。协议将买卖税收自动买入黄金 RWA 并分发给所有持币者，让每一个持币人都能享受到黄金的增值红利。",
    ],
    [
      "Q2：分红是如何产生的？",
      "每笔买卖交易都会产生 3% 税收，其中 90% 税收用于购买黄金 RWA 并分发给所有持币者，其中 50% 实时到账，40% 进入质押分红池。你持有代币或参与质押，就能持续获得黄金分红。",
    ],
    [
      "Q3：质押如何提升收益？",
      `用户通过销毁 10 万枚代币获得质押资格凭证，最低质押 50 万枚起，即可参与质押分红。质押时间越长，权重越高：<br />· ＜3天 = 1倍<br />· ≥3天 = 1.5倍<br />· ≥7天 = 2倍<br />· ≥15天 = 3倍<br />满 15 天即可解锁 3 倍权重，让收益最大化。`,
    ],
    [
      "Q4：质押后如何领取分红？",
      "质押期间，分红会自动累积至你的账户。你可以随时点击领取，获得一个“分红凭证”。每个凭证仅限领取一次，领取即永久失效。如需再次领取，需重新销毁 10 万枚获得新凭证。",
    ],
    [
      "Q5：如果选择不领取分红会怎样？",
      "不领取的分红将按账面复利计算，自动折算成代币价值并累加到你的质押本金中，让本金越滚越大，下一周期分红更多。选择不领取复利滚存，是实现复利增长的最佳路径。",
    ],
    [
      "Q6：质押的代币如何解锁？",
      `用户可以随时申请解锁，解锁规则如下：<br />· 24小时内解锁：扣除原始质押量的 5% 作为罚金（直接销毁）<br />· 24小时后解锁：全额返还原始质押代币 + 账面增值对应的黄金<br />申请解锁后等待 24 小时即可免除罚金，建议提前做好资金安排。`,
    ],
    [
      "Q7：解锁后可以重新质押吗？",
      "不可以。一个地址仅有一次质押机会，解锁后质押凭证销毁，该地址永久失去质押资格。请慎重考虑后再做质押决定。",
    ],
    [
      "Q8：价格暴跌怎么办？",
      "协议设有回购防守机制，税收的 10% 自动进入防守资金池。当单日跌幅达到或超过 10% 时，系统会自动触发回购，用防守资金买入代币并添加流动性池（LP）。跌得越狠，护盘力度越大，为市场价格提供有力支撑。",
    ],
    [
      "Q9：协议的数据真实吗？",
      "真实。页面中的所有数据，包括代币价格、金库余额、质押总量、分红累积等核心数据，均通过 BSC RPC 与智能合约实时读取，链上可查，公开透明。",
    ],
  ];
  return (
    <section className="institutional-section faq-section">
      <div className="section-kicker">FAQ</div>
      <div className="institutional-head">
        <h2>常见问题</h2>
        <p>减少复杂解释，保留用户最关心的协议逻辑与安全边界。</p>
      </div>
      <div className="faq-grid">
        {faqs.map(([q, a]) => (
          <details key={q} className="faq-item">
            <summary>{q}</summary>
            <p dangerouslySetInnerHTML={{ __html: a }} />
          </details>
        ))}
      </div>
    </section>
  );
}

function CommunitySection() {
  return (
    <section className="institutional-section community-section">
      <div className="section-kicker">Community</div>
      <div className="institutional-head">
        <h2>官方社区与商务合作</h2>
        <p>请以以下入口为官方信息来源，谨防非官方渠道。</p>
      </div>
      <div className="community-links">
        <a href="https://x.com/Flaphjsd" target="_blank" rel="noreferrer">Twitter @Flaphjsd</a>
        <a href="https://t.me/huangjinshidai1" target="_blank" rel="noreferrer">Telegram 群</a>
        <span>QQ群 133603900</span>
        <a href="https://m.debox.pro/group?id=w6aehsyg&code=kvouocdd" target="_blank" rel="noreferrer">DeBox 社区</a>
        <a href="https://t.me/Dev_Astral" target="_blank" rel="noreferrer">合作 TG @Dev_Astral</a>
      </div>
    </section>
  );
}

function InstitutionalHome({ data, navigate }) {
  return (
    <>
      <CoreMetrics data={data} navigate={navigate} />
      <TokenomicsSection data={data} />
      <DividendSection data={data} />
      <StakingLadderSection navigate={navigate} />
      <FoundationSection />
      <RoadmapSection />
      <FAQSection />
      <CommunitySection />
    </>
  );
}

// ===== 质押流程引导 Stepper =====
function buildSteps(user, data, parsedStakeAmount, hasStakeAllowance) {
  if (!data) return [];
  const passAllowanceEnough = user ? user.allowance >= data.passBurnAmount : false;
  const hasPass = user?.pass || false;
  const hasStaked = user?.active && (user?.staked || 0) > 0;
  const hasClaimable = Boolean(user && user.claimableXaut > 0);

  const steps = [
    {
      id: "approvePass",
      title: "授权通行证额度",
      description: `授权金库燃烧 ${formatFull(data.passBurnAmount, 0)} 黄金時代`,
      done: passAllowanceEnough,
      current: false,
      actionLabel: "授权通行证",
    },
    {
      id: "burnPass",
      title: "燃烧通行证",
      description: "消耗额度获取质押通行证",
      done: hasPass,
      current: false,
      actionLabel: "燃烧通行证",
    },
    {
      id: "approveStake",
      title: "授权质押额度",
      description: `授权 ${formatFull(Number(ethers.formatEther(parsedStakeAmount || 0n)), 0)} 黄金時代给金库`,
      done: hasStakeAllowance,
      current: false,
      actionLabel: "授权质押",
    },
    {
      id: "stake",
      title: "质押黄金時代",
      description: "存入金库参与 XAUt 分红",
      done: hasStaked,
      current: false,
      actionLabel: "质押",
    },
    {
      id: "claim",
      title: "领取 XAUt 分红",
      description: hasClaimable
        ? `可领取 ${formatFull(user.claimableXaut, 6)} XAUt`
        : "质押后产生可领取分红",
      done: false,
      current: hasStaked && hasClaimable,
      actionLabel: "领取 XAUt",
    },
    {
      id: "compound",
      title: "账面复利（可选）",
      description: "将分红复利到账面本金以提升权重",
      done: false,
      current: false,
      optional: true,
      actionLabel: "账面复利",
    },
  ];

  // 自动高亮下一步：第一个未完成且非可选的步骤
  const firstUndoneIdx = steps.findIndex((s, i) => i < 4 && !s.done);
  if (firstUndoneIdx !== -1) {
    steps[firstUndoneIdx].current = true;
  }

  return steps;
}

function Stepper({ steps, onAction, busy, disabled }) {
  return (
    <div className="stepper">
      {steps.map((step, i) => {
        const status = step.done ? "done" : step.current ? "current" : "pending";
        return (
          <div key={step.id} className={`step step-${status}${step.optional ? " step-optional" : ""}`}>
            <div className="step-marker">
              {step.done ? (
                <CheckCircle2 size={18} />
              ) : (
                <span className="step-num">{i + 1}</span>
              )}
            </div>
            <div className="step-body">
              <strong>{step.title}</strong>
              <span className="step-desc">{step.description}</span>
            </div>
            <button
              className={`step-action${step.current ? " primary" : ""}`}
              disabled={busy || disabled || step.done}
              onClick={() => onAction(step.id)}
            >
              {step.actionLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ===== 装饰艺术组件 =====
function HeroArt({ trend }) {
  // 用真实价格数据生成缩略走势图，无数据时回退到静态路径
  let pathD = "M10 58 L38 45 L62 50 L88 32 L114 39 L142 20 L170 29 L204 14 L230 20";
  let areaD = "M10 58 L38 45 L62 50 L88 32 L114 39 L142 20 L170 29 L204 14 L230 20 L230 64 L10 64 Z";
  if (trend && trend.length >= 2) {
    const prices = trend.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const xs = 10;
    const xe = 230;
    const ys = 14;
    const ye = 58;
    const step = (xe - xs) / (trend.length - 1);
    const pts = trend.map((p, i) => {
      const x = xs + i * step;
      const y = ye - ((p.price - min) / range) * (ye - ys);
      return [x, y];
    });
    pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
    areaD = `${pathD} L ${xe} 64 L ${xs} 64 Z`;
  }

  return (
    <div className="generated-hero-art" aria-hidden="true">
      <div className="hero-frame">
        <div className="hero-frame-top">
          <span>黄金時代 VAULT</span>
          <span>BSC LIVE</span>
        </div>
        <div className="hero-vault-visual">
          <div className="vault-aperture">
            <div className="aperture-ring ring-one" />
            <div className="aperture-ring ring-two" />
            <div className="aperture-ring ring-three" />
            <div className="aperture-ticks">
              {Array.from({ length: 16 }).map((_, index) => (
                <i key={index} style={{ "--r": `${index * 22.5}deg` }} />
              ))}
            </div>
            <div className="hero-seal">
              <img className="hero-seal-mark" src={UI.brand} alt="" />
            </div>
          </div>
          <div className="gold-bars">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="hero-ledger">
          <div>
            <span>MARKET CAP</span>
            <strong>ON-CHAIN</strong>
          </div>
          <svg viewBox="0 0 240 72" role="img" aria-label="黄金時代 on-chain trend">
            <path className="ledger-grid" d="M8 18H232M8 36H232M8 54H232" />
            <path className="ledger-area" d={areaD} />
            <path className="ledger-line" d={pathD} />
          </svg>
        </div>
      </div>
      <div className="hero-perspective">
        <span />
        <span />
        <span />
      </div>
      <div className="hero-sparks">
        {Array.from({ length: 22 }).map((_, index) => (
          <i
            key={index}
            style={{
              "--x": `${(index * 37) % 100}%`,
              "--y": `${(index * 61) % 82}%`,
              "--d": `${index % 5}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function VaultScene() {
  return (
    <div className="code-vault-scene" aria-hidden="true">
      <div className="vault-grid" />
      <div className="vault-door">
        <div className="vault-ring ring-outer" />
        <div className="vault-ring ring-mid" />
        <div className="vault-ring ring-inner" />
        <img className="vault-door-logo" src={UI.brand} alt="" />
      </div>
      <div className="vault-light" />
    </div>
  );
}

// ===== 主应用 =====
function App() {
  const [data, setData] = useState(null);
  const [account, setAccount] = useState("");
  const [walletReady, setWalletReady] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("500000");
  const [quoteAmount, setQuoteAmount] = useState("5000000");
  const [quoteMode, setQuoteMode] = useState("sell");
  const [quote, setQuote] = useState(null);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [status, setStatus] = useState("读取链上数据中...");
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [route, setRoute] = useState(getRouteFromHash);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 图表与市场数据
  const [priceHistory, setPriceHistory] = useState(null);
  const [vaultHistory, setVaultHistory] = useState(null);
  const [dexData, setDexData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  const { toasts, notify, close } = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const contracts = useMemo(
    () => ({
      goldage: new ethers.Contract(ADDRESSES.goldage, ERC20_ABI, readProvider),
      xaut: new ethers.Contract(ADDRESSES.xaut, ERC20_ABI, readProvider),
      router: new ethers.Contract(ADDRESSES.router, ROUTER_ABI, readProvider),
      vault: new ethers.Contract(ADDRESSES.vault, VAULT_ABI, readProvider),
      factory: new ethers.Contract(ADDRESSES.factory, FACTORY_ABI, readProvider),
    }),
    []
  );

  const refresh = useCallback(
    async (activeAccount = account) => {
      try {
        setStatus("正在刷新链上数据...");
        const [
          block,
          totalSupply,
          burnedByToken,
          vaultGoldBalance,
          xautBalance,
          priceRoute,
          totalStaked,
          totalEffective,
          totalBurnedVault,
          stakingDeposited,
          stakingPaid,
          realtimeDeposited,
          realtimeClaimed,
          buybackDeposited,
          buybackUsed,
          buybackAvailable,
          buybackCount,
          lastBuybackAt,
          lastReferencePrice,
          defenseReferencePrice,
          lastDefenseDropBps,
          defenseTriggered,
          passBurnAmount,
          claimVoucherBurnAmount,
          minimumStakeAmount,
          earlyUnlockWindow,
          earlyUnlockPenaltyBps,
          defenseTriggerDropBps,
          tracker,
          isFromFactory,
          upgradesLocked,
          allVaultsLength,
        ] = await Promise.all([
          readProvider.getBlockNumber(),
          contracts.goldage.totalSupply(),
          contracts.goldage.balanceOf(ADDRESSES.dead),
          contracts.goldage.balanceOf(ADDRESSES.vault),
          contracts.xaut.balanceOf(ADDRESSES.vault),
          contracts.router.getAmountsOut(ethers.parseEther("1"), [ADDRESSES.goldage, ADDRESSES.wbnb, ADDRESSES.usdt]),
          contracts.vault.totalOriginalStaked(),
          contracts.vault.totalEffectiveStake(),
          contracts.vault.totalBurnedStakeTokens(),
          contracts.vault.totalStakingXautDeposited(),
          contracts.vault.totalStakingXautPaid(),
          contracts.vault.totalRealtimeXautDeposited(),
          contracts.vault.totalRealtimeXautClaimed(),
          contracts.vault.buybackPoolDeposited(),
          contracts.vault.buybackPoolUsed(),
          contracts.vault.buybackPoolAvailable(),
          contracts.vault.buybackCount(),
          contracts.vault.lastBuybackAt(),
          contracts.vault.lastReferencePrice(),
          contracts.vault.defenseReferencePrice(),
          contracts.vault.lastDefenseDropBps(),
          contracts.vault.currentDefenseTriggered(),
          contracts.vault.stakePassBurnAmount(),
          contracts.vault.claimVoucherBurnAmount(),
          contracts.vault.minimumStakeAmount(),
          contracts.vault.earlyUnlockWindow(),
          contracts.vault.earlyUnlockPenaltyBps(),
          contracts.vault.defenseTriggerDropBps(),
          contracts.vault.realtimeDividendTracker(),
          contracts.factory.isVaultFromFactory(ADDRESSES.vault),
          contracts.factory.vaultUpgradesLocked(),
          contracts.factory.allVaultsLength(),
        ]);

        const total = toNumber(totalSupply);
        const burned = toNumber(totalBurnedVault > burnedByToken ? totalBurnedVault : burnedByToken);
        const circulating = Math.max(total - burned, 0);
        const price = toNumber(priceRoute[priceRoute.length - 1]);
        const fdv = price * total;
        const marketCap = price * circulating;

        let user = null;
        if (activeAccount) {
          const [balance, allowance, pass, vouchers, summary, position, claimed, firstHoldingAt] = await Promise.all([
            contracts.goldage.balanceOf(activeAccount),
            contracts.goldage.allowance(activeAccount, ADDRESSES.vault),
            contracts.vault.hasStakePass(activeAccount),
            contracts.vault.claimVouchers(activeAccount),
            contracts.vault.stakeSummary(activeAccount),
            contracts.vault.positions(activeAccount),
            contracts.vault.cumulativeClaimedXaut(activeAccount),
            contracts.vault.firstHoldingAt(activeAccount),
          ]);
          user = {
            balance: toNumber(balance),
            allowance: toNumber(allowance),
            pass,
            vouchers: Number(vouchers),
            staked: toNumber(summary.myStakeAmount),
            claimableXaut: toNumber(summary.claimableXaut, 6),
            weightBps: Number(summary.currentWeight),
            secondsUntilNoPenalty: Number(summary.secondsUntilNoPenalty),
            active: position.active,
            everStaked: position.everStaked,
            startedAt: Number(position.startedAt),
            claimedXaut: toNumber(claimed, 6),
            firstHoldingAt: Number(firstHoldingAt),
          };
        }

        setData({
          block,
          total,
          burned,
          circulating,
          price,
          fdv,
          marketCap,
          vaultGoldBalance: toNumber(vaultGoldBalance),
          xautBalance: toNumber(xautBalance, 6),
          totalStaked: toNumber(totalStaked),
          totalEffective: toNumber(totalEffective),
          stakingDeposited: toNumber(stakingDeposited, 6),
          stakingPaid: toNumber(stakingPaid, 6),
          realtimeDeposited: toNumber(realtimeDeposited, 6),
          realtimeClaimed: toNumber(realtimeClaimed, 6),
          xautDistributed: toNumber(stakingPaid + realtimeClaimed, 6),
          buybackDeposited: toNumber(buybackDeposited),
          buybackUsed: toNumber(buybackUsed),
          buybackAvailable: toNumber(buybackAvailable),
          buybackCount: Number(buybackCount),
          lastBuybackAt,
          lastReferencePrice: toNumber(lastReferencePrice),
          defenseReferencePrice: toNumber(defenseReferencePrice),
          lastDefenseDropBps: Number(lastDefenseDropBps),
          defenseTriggered,
          passBurnAmount: toNumber(passBurnAmount),
          claimVoucherBurnAmount: toNumber(claimVoucherBurnAmount),
          minimumStakeAmount: toNumber(minimumStakeAmount),
          earlyUnlockWindow: Number(earlyUnlockWindow),
          earlyUnlockPenaltyBps: Number(earlyUnlockPenaltyBps),
          defenseTriggerDropBps: Number(defenseTriggerDropBps),
          tracker,
          isFromFactory,
          upgradesLocked,
          allVaultsLength: Number(allVaultsLength),
          user,
        });
        setStatus(`已同步到区块 ${block}`);
      } catch (error) {
        const msg = error.shortMessage || error.message || "读取失败";
        setStatus(msg);
      }
    },
    [account, contracts]
  );

  // 加载图表与市场数据
  const loadChartData = useCallback(async () => {
    setChartLoading(true);
    const [prices, vault, dex] = await Promise.all([
      fetchHistoricalPrices().catch(() => null),
      fetchVaultHistory().catch(() => null),
      fetchDexScreener().catch(() => null),
    ]);
    setPriceHistory(prices);
    setVaultHistory(vault);
    setDexData(dex);
    setChartLoading(false);
  }, []);

  useEffect(() => {
    refresh("");
    const id = window.setInterval(() => refresh(account), 45000);
    return () => window.clearInterval(id);
  }, [account, refresh]);

  useEffect(() => {
    loadChartData();
    const id = window.setInterval(loadChartData, 300000);
    return () => window.clearInterval(id);
  }, [loadChartData]);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRouteFromHash());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return undefined;
    const onAccountsChanged = (accounts) => {
      const next = accounts?.[0] || "";
      setAccount(next);
      setWalletReady(Boolean(next));
      refresh(next);
    };
    const onChainChanged = () => window.location.reload();
    window.ethereum.on?.("accountsChanged", onAccountsChanged);
    window.ethereum.on?.("chainChanged", onChainChanged);
    return () => {
      window.ethereum.removeListener?.("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", onChainChanged);
    };
  }, [refresh]);

  async function getWalletSigner() {
    if (!window.ethereum) throw new Error("未检测到钱包");
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    const network = await browserProvider.getNetwork();
    if (network.chainId !== BSC_CHAIN_ID) {
      try {
        await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BSC_HEX }] });
      } catch (error) {
        if (error.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: BSC_HEX,
                chainName: "BNB Smart Chain",
                nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: ["https://bscscan.com"],
              },
            ],
          });
        } else {
          throw error;
        }
      }
    }
    return browserProvider.getSigner();
  }

  async function connectWallet() {
    try {
      setBusy(true);
      await window.ethereum?.request({ method: "eth_requestAccounts" });
      const signer = await getWalletSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setWalletReady(true);
      await refresh(address);
      notify("success", "钱包已连接", shorten(address));
    } catch (error) {
      const msg = error.shortMessage || error.message || "连接钱包失败";
      setStatus(msg);
      notify("error", "连接钱包失败", msg);
    } finally {
      setBusy(false);
    }
  }

  async function runTx(label, fn) {
    try {
      setBusy(true);
      setTxHash("");
      setStatus(`${label} 交易确认中...`);
      notify("pending", `${label}`, "请在钱包中确认交易");
      const signer = await getWalletSigner();
      const tx = await fn(signer);
      setTxHash(tx.hash);
      setStatus(`${label} 已提交，等待上链...`);
      notify("info", `${label} 已提交`, shorten(tx.hash));
      await tx.wait();
      setStatus(`${label} 成功`);
      notify("success", `${label} 成功`, "交易已上链确认");
      await refresh(await signer.getAddress());
    } catch (error) {
      const msg = error.shortMessage || error.reason || error.message || `${label} 失败`;
      setStatus(msg);
      notify("error", `${label} 失败`, msg);
    } finally {
      setBusy(false);
    }
  }

  const parsedStakeAmount = useMemo(() => {
    try {
      return ethers.parseEther(stakeAmount || "0");
    } catch {
      return 0n;
    }
  }, [stakeAmount]);

  const parsedQuoteAmount = useMemo(() => {
    try {
      return ethers.parseEther(quoteAmount || "0");
    } catch {
      return 0n;
    }
  }, [quoteAmount]);

  async function refreshQuote() {
    if (parsedQuoteAmount <= 0n) {
      setQuote(null);
      return;
    }
    try {
      setQuoteBusy(true);
      const amountNumber = Number(ethers.formatEther(parsedQuoteAmount));
      const path =
        quoteMode === "sell"
          ? [ADDRESSES.goldage, ADDRESSES.wbnb, ADDRESSES.usdt]
          : [ADDRESSES.usdt, ADDRESSES.wbnb, ADDRESSES.goldage];
      const amounts = await contracts.router.getAmountsOut(parsedQuoteAmount, path);
      const out = Number(ethers.formatEther(amounts[amounts.length - 1]));
      if (quoteMode === "sell") {
        const noSlippage = amountNumber * (data?.price || 0);
        setQuote({
          mode: "sell",
          out,
          outputLabel: "USDT",
          effectivePrice: out / amountNumber,
          noSlippage,
          slippagePct: noSlippage > 0 ? (1 - out / noSlippage) * 100 : 0,
        });
      } else {
        setQuote({
          mode: "buy",
          out,
          outputLabel: "黄金時代",
          effectivePrice: out > 0 ? amountNumber / out : 0,
          noSlippage: data?.price ? amountNumber / data.price : 0,
          slippagePct: data?.price && out > 0 ? (amountNumber / out / data.price - 1) * 100 : 0,
        });
      }
    } catch (error) {
      const msg = error.shortMessage || error.message || "报价失败";
      setStatus(msg);
      notify("error", "报价失败", msg);
      setQuote(null);
    } finally {
      setQuoteBusy(false);
    }
  }

  function approveAmount(amount, label) {
    return runTx(label, async (signer) => {
      const token = new ethers.Contract(ADDRESSES.goldage, ERC20_ABI, signer);
      return token.approve(ADDRESSES.vault, amount);
    });
  }

  const vaultWrite = (method, label, ...args) =>
    runTx(label, async (signer) => {
      const vault = new ethers.Contract(ADDRESSES.vault, VAULT_ABI, signer);
      return vault[method](...args);
    });

  // Stepper 步骤动作分发
  const handleStepAction = useCallback(
    (stepId) => {
      const passAmount = data ? ethers.parseEther(String(Math.ceil(data.passBurnAmount))) : 0n;
      switch (stepId) {
        case "approvePass":
          return approveAmount(passAmount, "授权通行证");
        case "burnPass":
          return vaultWrite("burnForStakePass", "燃烧通行证");
        case "approveStake":
          return approveAmount(parsedStakeAmount, "授权质押");
        case "stake":
          return vaultWrite("stake", "质押", parsedStakeAmount);
        case "claim":
          return vaultWrite("claimStakingDividend", "领取 XAUt");
        case "compound":
          return vaultWrite("compoundStakingDividend", "账面复利");
        default:
          return null;
      }
    },
    [data, parsedStakeAmount]
  );

  const cards = data
    ? [
        {
          icon: Landmark,
          label: "当前市值",
          tone: "gold",
          rawValue: data.marketCap,
          formatValue: (v) => formatUsd(v),
          sub: `FDV ${formatUsd(data.fdv)}`,
          animate: true,
        },
        {
          icon: Gem,
          label: "黄金時代当前价格",
          tone: "gold",
          rawValue: data.price,
          formatValue: (v) => `$${Number(v).toFixed(8)}`,
          sub: dexData ? `${dexData.baseSymbol}/${dexData.quoteSymbol} · ${dexData.dexId}` : "GOLD/WBNB/USDT",
          animate: true,
        },
        {
          icon: Flame,
          label: "已销毁数量",
          tone: "gold",
          rawValue: data.burned,
          formatValue: (v) => formatFull(v, 0),
          sub: `${((data.burned / data.total) * 100).toFixed(2)}%`,
          animate: true,
        },
        {
          icon: LockKeyhole,
          label: "Vault 质押数量",
          tone: "gold",
          rawValue: data.totalStaked,
          formatValue: (v) => formatFull(v, 0),
          sub: `${((data.totalStaked / data.total) * 100).toFixed(2)}%`,
          animate: true,
        },
        {
          icon: Coins,
          label: "XAUt 累计分发",
          tone: "gold",
          rawValue: data.xautDistributed,
          formatValue: (v) => formatFull(v, 6),
          sub: `Vault ${formatFull(data.xautBalance, 6)} XAUt`,
          animate: true,
        },
        {
          icon: ShieldCheck,
          label: "Buyback Pool 余额",
          tone: "green",
          rawValue: data.buybackAvailable,
          formatValue: (v) => formatUsd(v, 2),
          sub: `${data.buybackCount} 次回购`,
          animate: true,
        },
      ]
    : [];

  const user = data?.user;
  const disabled = busy || !walletReady;
  const passAmount = data ? ethers.parseEther(String(Math.ceil(data.passBurnAmount))) : 0n;
  const hasStakeAllowance = user
    ? user.allowance >= Number(ethers.formatEther(parsedStakeAmount || 0n))
    : false;
  const steps = useMemo(
    () => buildSteps(user, data, parsedStakeAmount, hasStakeAllowance),
    [user, data, parsedStakeAmount, hasStakeAllowance]
  );
  const marketSnapshot = dexData
    ? {
        source: "DEXScreener",
        priceUsd: dexData.priceUsd,
        priceChange24h: dexData.priceChange?.h24,
        volume24h: dexData.volume?.h24,
        liquidityUsd: dexData.liquidity?.usd,
        txns24h: (dexData.txns?.h24?.buys || 0) + (dexData.txns?.h24?.sells || 0),
      }
    : data
      ? {
          source: "RPC",
          priceUsd: data.price,
          priceChange24h: null,
          volume24h: null,
          liquidityUsd: null,
          txns24h: null,
        }
      : null;

  function navigate(id) {
    const next = ROUTES.find((item) => item.id === id)?.hash || "#/";
    setMenuOpen(false);
    if (window.location.hash === next) {
      setRoute(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.hash = next;
    }
  }

  return (
    <main>
      <header className={`topbar${scrolled ? " scrolled" : ""}`}>
        <a className="brand" href="#/">
          <img className="brand-mark image" src={UI.brand} alt="" />
          <span>黄金時代 GoldAge</span>
          <small>RWA Gold Dividend Protocol</small>
        </a>
        <nav className={menuOpen ? "open" : ""}>
          {NAV_ITEMS.map((item) => (
            <a key={item.id} className={route === item.id ? "active" : ""} href={item.hash} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="top-actions">
          <span className="network" title="BNB Smart Chain">
            <Sparkles size={16} /> <span>BSC</span>
          </span>
          <button className="connect" onClick={connectWallet} disabled={busy} aria-label="连接钱包">
            <Wallet size={16} />
            <span>{account ? shorten(account) : "连接钱包"}</span>
          </button>
          <button
            className="mobile-menu-btn"
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen ? <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)} /> : null}
      </header>

      {route !== "home" ? (
        <div className="global-status">
          <RefreshCw size={16} className={busy ? "spin" : ""} />
          <span>{status}</span>
          {txHash ? (
            <a href={`${TX_EXPLORER}${txHash}`} target="_blank" rel="noreferrer">
              查看交易
            </a>
          ) : null}
        </div>
      ) : null}

      {route === "home" ? (
      <section id="home" className="hero">
        <div className="hero-bg" />
        <div className="hero-content exchange-hero-content">
          <div className="hero-copy">
            <p className="eyebrow">BNB Smart Chain · RWA 黄金分红协议</p>
            <h1>黄金时代分红协议<br /><span>时间，是最大的杠杆</span></h1>
            <p className="lead">黄金時代 GoldAge 通过 3% 交易税，将市场交易价值转化为黄金分红、质押收益与回购防守，构建更透明、更长期、更具资产属性的 RWA 加密协议。</p>
            <p className="hero-slogan">时间就是黄金，持有铸就时代。</p>
            <div className="hero-proof-row">
              <span><Zap size={15} /> <strong>3%</strong> 买卖税</span>
              <span><Gem size={15} /> <strong>90%</strong> 黄金分红</span>
              <span><ShieldCheck size={15} /> <strong>10%</strong> 回购防守</span>
              <span><LockKeyhole size={15} /> <strong>3x</strong> 最高质押权重</span>
            </div>
            <div className="hero-buttons">
              <button className="action primary breathing" onClick={connectWallet} disabled={busy}>
                <Wallet size={18} />
                立即连接钱包
              </button>
              <button className="action" onClick={() => navigate("tokenomics")}>
                <BookOpen size={18} />
                查看机制
              </button>
              <button className="action" onClick={() => navigate("vault")}>
                <LockKeyhole size={18} />
                进入质押
              </button>
            </div>
            <div className="hero-live-strip">
              <div>
                <span>主网</span>
                <strong>BSC</strong>
              </div>
              <div>
                <span>Factory 验证</span>
                <strong>{data?.isFromFactory ? "已通过" : "--"}</strong>
              </div>
              <div>
                <span>升级状态</span>
                <strong>{data?.upgradesLocked ? "已锁定" : "可查询"}</strong>
              </div>
            </div>
            <div className="status-line">
              <RefreshCw size={16} className={busy ? "spin" : ""} />
              <span>{status}</span>
              {txHash ? (
                <a href={`${TX_EXPLORER}${txHash}`} target="_blank" rel="noreferrer">
                  查看交易
                </a>
              ) : null}
            </div>
          </div>
          <MarketTerminal data={data} dexData={dexData} trend={priceHistory} />
        </div>
      </section>
      ) : null}

      {route === "home" ? <InstitutionalHome data={data} navigate={navigate} /> : null}

      {route === "tokenomics" ? <TokenomicsSection data={data} compact /> : null}

      {route === "foundation" ? <FoundationSection /> : null}

      {route === "roadmap" ? <RoadmapSection /> : null}

      {route === "faq" ? <FAQSection /> : null}

      {route === "community" ? <CommunitySection /> : null}

      {route === "vault" ? (
      <section id="vault" className="section vault-section">
        <div className="section-head">
          <span>01 / 黄金金库</span>
          <h2>质押、报价、领取、复利与解锁</h2>
          <p>面向持币用户的真实链上操作台，包含授权、通行证、Vault 质押、XAUt 分红领取与 Pancake 路由报价。</p>
        </div>
        <div className="section-kpis">
          <div className="status-tile">
            <span>当前钱包</span>
            <strong>{account ? shorten(account) : "未连接"}</strong>
            <small>{walletReady ? "钱包已连接" : "连接后读取个人仓位"}</small>
          </div>
          <div className="status-tile">
            <span>最低质押</span>
            <strong>{data ? formatFull(data.minimumStakeAmount, 0) : "--"}</strong>
            <small>黄金時代</small>
          </div>
          <div className="status-tile">
            <span>通行证燃烧</span>
            <strong>{data ? formatFull(data.passBurnAmount, 0) : "--"}</strong>
            <small>进入 Vault 前置条件</small>
          </div>
          <div className="status-tile">
            <span>早解罚金</span>
            <strong>{data ? `${data.earlyUnlockPenaltyBps / 100}%` : "--"}</strong>
            <small>Unlock penalty</small>
          </div>
        </div>
        <div className="vault-layout upgraded">
          <div className="vault-panel">
            <div className="panel-top">
              <div>
                <p>钱包资产</p>
                <strong>
                  {user ? (
                    <>
                      <AnimatedNumber value={user.balance} format={(v) => formatFull(v, 2)} /> 黄金時代
                    </>
                  ) : (
                    "连接钱包查看"
                  )}
                </strong>
              </div>
              <span className={user?.pass ? "pill ok" : "pill"}>{user?.pass ? "已持有通行证" : "未持有通行证"}</span>
            </div>
            <div className="input-row">
              <label htmlFor="stakeAmount">质押数量</label>
              <input id="stakeAmount" value={stakeAmount} onChange={(event) => setStakeAmount(event.target.value)} inputMode="decimal" />
              <button onClick={() => setStakeAmount(String(Math.floor(user?.balance || data?.minimumStakeAmount || 500000)))}>MAX</button>
            </div>
            <div className="allowance-line">
              <span>当前授权：{user ? formatFull(user.allowance, 2) : "--"} 黄金時代</span>
              <span>{hasStakeAllowance ? "授权充足" : "需要授权"}</span>
            </div>

            <Reveal className="stepper-wrap">
              <div className="stepper-head">
                <TrendingUp size={16} />
                <span>质押流程引导</span>
              </div>
              <Stepper steps={steps} onAction={handleStepAction} busy={busy} disabled={disabled} />
            </Reveal>

            <div className="extra-ops">
              <div className="extra-ops-head">独立操作</div>
              <div className="button-grid">
                <ActionButton icon={RefreshCw} disabled={disabled || !account} onClick={() => vaultWrite("syncAccount", "同步账户", account)}>
                  同步账户
                </ActionButton>
                <ActionButton icon={BarChart3} disabled={disabled || !account} onClick={() => vaultWrite("touchHoldingRecord", "记录持币时间", account)}>
                  记录持币
                </ActionButton>
                <ActionButton icon={ArrowUpRight} disabled={disabled} onClick={() => vaultWrite("unlock", "解锁")}>
                  解锁
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="quote-panel">
            <div className="panel-top">
              <div>
                <p>路由报价</p>
                <strong>{quoteMode === "sell" ? "卖出估算" : "买入估算"}</strong>
              </div>
              <div className="segmented">
                <button className={quoteMode === "sell" ? "active" : ""} onClick={() => setQuoteMode("sell")}>卖出</button>
                <button className={quoteMode === "buy" ? "active" : ""} onClick={() => setQuoteMode("buy")}>买入</button>
              </div>
            </div>
            <div className="input-row quote-input">
              <label htmlFor="quoteAmount">{quoteMode === "sell" ? "黄金時代数量" : "USDT 数量"}</label>
              <input id="quoteAmount" value={quoteAmount} onChange={(event) => setQuoteAmount(event.target.value)} inputMode="decimal" />
              <button onClick={() => setQuoteAmount(quoteMode === "sell" ? "5000000" : "100")}>示例</button>
            </div>
            <ActionButton icon={BarChart3} primary disabled={quoteBusy || parsedQuoteAmount <= 0n} onClick={refreshQuote}>
              {quoteBusy ? "报价中" : "刷新报价"}
            </ActionButton>
            <div className="quote-result">
              <div>
                <span>预计获得</span>
                <strong>{quote ? `${formatFull(quote.out, quote.mode === "sell" ? 4 : 2)} ${quote.outputLabel}` : "--"}</strong>
              </div>
              <div>
                <span>成交均价</span>
                <strong>{quote ? `$${quote.effectivePrice.toFixed(8)}` : "--"}</strong>
              </div>
              <div>
                <span>相对现价滑点</span>
                <strong>{quote ? `${quote.slippagePct.toFixed(2)}%` : "--"}</strong>
              </div>
            </div>
          </div>

          <div className="account-panel">
            <div className="account-stat">
              <span>我的质押</span>
              <strong>{user ? formatFull(user.staked, 2) : "--"}</strong>
            </div>
            <div className="account-stat">
              <span>可领取 XAUt</span>
              <strong>{user ? formatFull(user.claimableXaut, 6) : "--"}</strong>
            </div>
            <div className="account-stat">
              <span>当前权重</span>
              <strong>{user ? `${(user.weightBps / 100).toFixed(2)}%` : "--"}</strong>
            </div>
            <div className="account-stat">
              <span>已领取 XAUt</span>
              <strong>{user ? formatFull(user.claimedXaut, 6) : "--"}</strong>
            </div>
            <div className="account-stat">
              <span>领取凭证</span>
              <strong>{user ? user.vouchers : "--"}</strong>
            </div>
            <div className="account-stat">
              <span>首次持币</span>
              <strong>{user?.firstHoldingAt ? formatDate(user.firstHoldingAt) : "--"}</strong>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {route === "mechanism" ? (
      <section id="mechanism" className="section mechanism">
        <div className="section-head">
          <span>02 / 核心机制</span>
          <h2>一个“时间换黄金”的加密分红协议</h2>
          <p>黄金時代是一个以真实黄金 RWA 为支撑的去中心化分红协议。用户持有代币即获得黄金分红，质押时间越长权重越高，最高可享 3 倍收益。</p>
        </div>
        <div className="story-grid">
          <article className="story-copy">
            <h3>什么是黄金時代？</h3>
            <p>项目采用 3% 买卖税机制，90% 税收直接购买黄金 RWA 分发给持币者，10% 用于回购护盘。</p>
            <p>通过“实时分红 + 质押复利”双通道，让时间成为每个人最大的杠杆。</p>
            <div className="rule-grid">
              <span>理念：时间就是黄金</span>
              <span>Slogan：日久见金，越持越赢</span>
              <span>最高权重 3 倍收益</span>
              <span>最低质押 {data ? formatFull(data.minimumStakeAmount, 0) : "--"}</span>
            </div>
          </article>
          <div className="visual-panel">
            <VaultScene />
          </div>
          <div className="orbit">
            <div className="coin"><img src={UI.brand} alt="" /></div>
            <span className="tag top">黄金叙事</span>
            <span className="tag left">XAUt 分红</span>
            <span className="tag right">链上质押</span>
            <span className="tag bottom">回购防守</span>
          </div>
        </div>
        <div className="mechanism-cards">
          <Reveal delay={0}><StatCard icon={Zap} label="3% 买卖税" value="协议价值入口" sub="Buy / Sell Tax" /></Reveal>
          <Reveal delay={80}><StatCard icon={Gem} label="90% 黄金分红" value="持有即分" sub="RWA Dividend" /></Reveal>
          <Reveal delay={160}><StatCard icon={LockKeyhole} label="质押复利" value="最高 3 倍权重" sub="Time Weighted" /></Reveal>
          <Reveal delay={240}><StatCard icon={ShieldCheck} label="10% 回购防守" value="价格护盘机制" sub="Buyback Defense" /></Reveal>
        </div>
      </section>
      ) : null}

      {route === "data" ? (
      <section id="data" className="section">
        <div className="section-head">
          <span>03 / 链上数据</span>
          <h2>实时读取合约状态</h2>
          <p>合约状态、DEX 市场、历史价格与 Vault 质押趋势均通过 BSC RPC、Pancake Router 与 DEXScreener 实时读取。</p>
        </div>
        <div className="data-console-bar">
          <div>
            <span>同步区块</span>
            <strong>{data?.block ?? "--"}</strong>
          </div>
          <div>
            <span>价格路由</span>
            <strong>GOLD / WBNB / USDT</strong>
          </div>
          <div>
            <span>Vault 合规</span>
            <strong>{data?.isFromFactory ? "Factory verified" : "--"}</strong>
          </div>
          <div>
            <span>市场来源</span>
            <strong>{dexData ? "DEXScreener Live" : "RPC fallback"}</strong>
          </div>
        </div>
        {marketSnapshot ? (
          <div className="dex-strip">
            <div className="dex-item">
              <span>{marketSnapshot.source === "DEXScreener" ? "DEXScreener 价格" : "链上路由价格"}</span>
              <strong>${marketSnapshot.priceUsd ? marketSnapshot.priceUsd.toFixed(8) : "--"}</strong>
            </div>
            <div className="dex-item">
              <span>24h 涨跌</span>
              <strong className={marketSnapshot.priceChange24h == null ? "" : marketSnapshot.priceChange24h >= 0 ? "positive" : "negative"}>
                {marketSnapshot.priceChange24h != null ? `${marketSnapshot.priceChange24h.toFixed(2)}%` : "--"}
              </strong>
            </div>
            <div className="dex-item">
              <span>24h 成交量</span>
              <strong>{marketSnapshot.volume24h != null ? formatUsd(marketSnapshot.volume24h, 0) : "--"}</strong>
            </div>
            <div className="dex-item">
              <span>流动性</span>
              <strong>{marketSnapshot.liquidityUsd != null ? formatUsd(marketSnapshot.liquidityUsd, 0) : "--"}</strong>
            </div>
            <div className="dex-item">
              <span>24h 交易数</span>
              <strong>{marketSnapshot.txns24h != null ? marketSnapshot.txns24h : "--"}</strong>
            </div>
          </div>
        ) : null}
        <div className="chart-strip">
          <Reveal delay={0}>
            <PriceChart points={priceHistory} title="价格走势 (7天 · 每8小时)" />
          </Reveal>
          <Reveal delay={80}>
            <VaultTrendChart points={vaultHistory} title="金库质押趋势 (7天)" />
          </Reveal>
          <Reveal delay={160}>
            <StakeRingChart
              staked={data?.totalStaked || 0}
              total={data?.total || 1}
              title="质押占比"
            />
          </Reveal>
        </div>
        <div className="data-table">
          <StatCard icon={Gem} label="黄金時代总供应量" value={data ? formatFull(data.total, 0) : "--"} />
          <StatCard icon={Flame} label="黑洞销毁数量" value={data ? formatFull(data.burned, 0) : "--"} />
          <StatCard icon={LockKeyhole} label="Vault 质押数量" value={data ? formatFull(data.totalStaked, 0) : "--"} />
          <StatCard icon={Coins} label="XAUt 当前余额" value={data ? formatFull(data.xautBalance, 6) : "--"} />
          <StatCard icon={Coins} label="XAUt 累计注入" value={data ? formatFull(data.stakingDeposited + data.realtimeDeposited, 6) : "--"} />
          <StatCard icon={Landmark} label="Buyback Pool 累计注入" value={data ? formatUsd(data.buybackDeposited, 2) : "--"} />
          <StatCard icon={ShieldCheck} label="Buyback Pool 当前可用" value={data ? formatUsd(data.buybackAvailable, 2) : "--"} />
          <StatCard icon={RefreshCw} label="回购次数" value={data ? String(data.buybackCount) : "--"} />
          <StatCard icon={Clock} label="最近一次回购" value={data ? formatDate(data.lastBuybackAt) : "--"} />
          <StatCard icon={CheckCircle2} label="合约来自 Factory" value={data?.isFromFactory ? "是" : "--"} sub={`${data?.allVaultsLength ?? "--"} vaults`} />
          <StatCard icon={LockKeyhole} label="升级锁定" value={data?.upgradesLocked ? "已锁定" : "未锁定"} />
          <StatCard icon={BarChart3} label="防守状态" value={data?.defenseTriggered ? "已触发" : "未触发"} sub={`${data?.lastDefenseDropBps ?? 0} bps`} />
        </div>
      </section>
      ) : null}

      {route === "contracts" ? (
      <section id="contracts" className="section contracts">
        <div className="section-head">
          <span>04 / 合约地址</span>
          <h2>链上可验证</h2>
          <p>核心合约、Router、交易对与实时分红组件均提供复制和 BscScan 跳转，方便审阅链上状态。</p>
        </div>
        <div className="contracts-summary">
          <div className="status-tile">
            <span>网络</span>
            <strong>BNB Smart Chain</strong>
            <small>Chain ID 56</small>
          </div>
          <div className="status-tile">
            <span>Factory</span>
            <strong>{data?.isFromFactory ? "已验证" : "--"}</strong>
            <small>{data?.allVaultsLength ?? "--"} vaults</small>
          </div>
          <div className="status-tile">
            <span>升级锁</span>
            <strong>{data?.upgradesLocked ? "已锁定" : "未锁定"}</strong>
            <small>Vault governance state</small>
          </div>
        </div>
        <div className="contracts-grid">
          <ContractRow name="黄金時代 Token" address={ADDRESSES.goldage} />
          <ContractRow name="Vault" address={ADDRESSES.vault} />
          <ContractRow name="Factory" address={ADDRESSES.factory} />
          <ContractRow name="XAUt" address={ADDRESSES.xaut} />
          <ContractRow name="USDT" address={ADDRESSES.usdt} />
          <ContractRow name="Pancake Pair" address={ADDRESSES.pair} />
          <ContractRow name="Realtime Tracker" address={data?.tracker || ADDRESSES.vault} />
          <ContractRow name="Pancake Router" address={ADDRESSES.router} />
        </div>
      </section>
      ) : null}

      {route === "game" ? (
      <section id="game" className="section portal-section">
        <div className="section-head">
          <span>05 / 游戏生态</span>
          <h2>黄金時代游戏</h2>
          <p>围绕黄金時代资产、积分权益与链上身份扩展的游戏化生态入口。</p>
        </div>
        <div className="portal-grid">
          <div className="portal-panel coming-soon">
            <div className="portal-icon"><Gamepad2 size={34} /></div>
            <span>待开发</span>
            <h3>游戏模块待开发</h3>
            <p>后续将接入围绕黄金時代持有、质押权重与社区任务展开的互动玩法。</p>
          </div>
          <div className="portal-panel">
            <span>规划方向</span>
            <h3>时间、权重、奖励</h3>
            <p>游戏生态将优先保持链上资产安全和可验证性，避免影响现有分红与金库交互。</p>
          </div>
        </div>
      </section>
      ) : null}

      {route === "mall" ? (
      <section id="mall" className="section portal-section">
        <div className="section-head">
          <span>06 / 生态商城</span>
          <h2>黄金時代商城</h2>
          <p>面向黄金時代社区的权益兑换、生态周边和 RWA 叙事扩展入口。</p>
        </div>
        <div className="portal-grid">
          <div className="portal-panel coming-soon">
            <div className="portal-icon"><ShoppingBag size={34} /></div>
            <span>待开发</span>
            <h3>商城模块待开发</h3>
            <p>后续将根据社区建设进度，上线权益兑换、活动凭证与合作资源展示。</p>
          </div>
          <div className="portal-panel">
            <span>定位</span>
            <h3>从持有权益到生态消费</h3>
            <p>商城不会替代链上金库功能，而是作为黄金時代生态应用层的补充。</p>
          </div>
        </div>
      </section>
      ) : null}

      {route === "cooperation" ? (
      <section id="cooperation" className="section cooperation-section">
        <div className="section-head">
          <span>07 / 商务合作</span>
          <h2>合作联系</h2>
          <p>欢迎社区、媒体、RWA 资源、交易生态和商务渠道与黄金時代官方团队联系。</p>
        </div>
        <div className="contact-grid">
          <a className="contact-card" href="https://x.com/Flaphjsd" target="_blank" rel="noreferrer">
            <Handshake size={24} />
            <span>官方推特</span>
            <strong>@Flaphjsd</strong>
            <ArrowUpRight size={18} />
          </a>
          <a className="contact-card" href="https://t.me/huangjinshidai1" target="_blank" rel="noreferrer">
            <Users size={24} />
            <span>电报群</span>
            <strong>t.me/huangjinshidai1</strong>
            <ArrowUpRight size={18} />
          </a>
          <div className="contact-card">
            <Users size={24} />
            <span>QQ群</span>
            <strong>133603900</strong>
          </div>
          <a className="contact-card" href="https://m.debox.pro/group?id=w6aehsyg&code=kvouocdd" target="_blank" rel="noreferrer">
            <Sparkles size={24} />
            <span>DeBox</span>
            <strong>黄金時代社区</strong>
            <ArrowUpRight size={18} />
          </a>
          <a className="contact-card featured foundation-card" href={`${EXPLORER}${FOUNDATION_ADDRESS}`} target="_blank" rel="noreferrer">
            <Landmark size={24} />
            <span>基金会地址</span>
            <strong>{FOUNDATION_ADDRESS}</strong>
            <ArrowUpRight size={18} />
          </a>
          <a className="contact-card featured" href="https://t.me/Dev_Astral" target="_blank" rel="noreferrer">
            <Wallet size={24} />
            <span>合作联系 TG</span>
            <strong>@Dev_Astral</strong>
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      ) : null}

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand mini"><img className="brand-mark image" src={UI.brand} alt="" /> 黄金時代 <small>GoldAge</small></span>
          <p>一个“时间换黄金”的 RWA 加密分红协议。日久见金，越持越赢。</p>
        </div>
        <div className="footer-links">
          <button type="button" onClick={() => navigate("foundation")}>Foundation</button>
          <button type="button" onClick={() => navigate("foundation")}>Whitepaper</button>
          <button type="button" onClick={() => navigate("contracts")}>Audit</button>
          <a href="https://x.com/Flaphjsd" target="_blank" rel="noreferrer">Twitter</a>
          <a href="https://t.me/huangjinshidai1" target="_blank" rel="noreferrer">Telegram</a>
          <a href="https://github.com/ybc112/Goldage" target="_blank" rel="noreferrer">GitHub</a>
          <a href={`${EXPLORER}${ADDRESSES.goldage}`} target="_blank" rel="noreferrer">BNB Chain</a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 黄金時代 GoldAge</span>
          <span>Built on BNB Smart Chain</span>
        </div>
      </footer>

      <ToastContainer toasts={toasts} onClose={close} />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
