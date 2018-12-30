import {
  useState as sState,
  useEffect as sEffect,
  useMemo as sMemo,
  useSignal as sSignal,
  useCleanup as sCleanup,
  root
} from 'solid-js'

import {
  useMemo as rMemo,
  useState as rState,
  useEffect as rEffect
} from "react";

export { reconcile } from 'solid-js';

let inSolidEffect = false;
function trackNesting(args) {
  const fn = args[0];
  return [function() {
    const outside = inSolidEffect;
    inSolidEffect = true;
    const ret = fn.call(this, arguments);
    inSolidEffect = outside;
    return ret;
  }, ...args.slice(1)]
}

function useForceUpdate() {
  const [tick, setTick] = rState(1);
  return () => setTick(tick + 1);
}

export function useState(v) {
  if (inSolidEffect) return sState(v);
  const forceUpdate = useForceUpdate();
  return rMemo(() => {
    const [state, setState] = sState(v);
    return [state, (...args) => (setState(...args), forceUpdate())]
  }, []);
}

export function useSignal(v) {
  if (inSolidEffect) return sSignal(v);
  const forceUpdate = useForceUpdate();
  return rMemo(() => {
    const [get, set] = sSignal(v);
    return [get, v => (set(v), forceUpdate())]
  }, []);
}

export function useEffect(...args) {
  if(inSolidEffect) return sEffect(...args);
  return rEffect(() => {
    let dispose;
    root(disposer => {
      dispose = disposer;
      sEffect(...trackNesting(args));
    })
    return dispose;
  }, []);
}

export function useMemo(...args) {
  if(inSolidEffect) return sMemo(...args);
  let dispose;
  rEffect(() => dispose, []);
  return rMemo(() =>
    root(disposer => {
      dispose = disposer;
      return sMemo(...trackNesting(args));
    })
  , []);
}

export function useCleanup(fn) {
  inSolidEffect ? sCleanup(fn) : rEffect(() => fn, []);
}