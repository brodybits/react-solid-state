import {
  useState as sState,
  useEffect as sEffect,
  useMemo as sMemo,
  useSignal as sSignal,
  useCleanup as sCleanup,
  root, sample
} from 'solid-js'

import {
  useMemo as rMemo,
  useState as rState,
  useEffect as rEffect,
  memo
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
  return () => Promise.resolve().then(() => setTick(tick + 1));
}

export function useObserver(fn) {
  const forceUpdate = useForceUpdate();
  let dispose;
  rEffect(() => dispose, []);
  const box = rMemo(() => {
    const [tracking, track] = sSignal({}),
      box = { track };
    root(disposer => {
      dispose = disposer;
      sEffect(() => {
        const v = tracking();
        if (!('top' in v)) return;
        else if (v.top) box.result = fn();
        else forceUpdate();
        v.top = false;
      })
    })
    return box;
  }, []);
  box.track({top: true})
  return box.result
}

export function withSolid(ComponentType) {
  const box = {}
  return memo((p, r) => {
    Object.assign(box, {p, r});
    return useObserver(() => ComponentType(box.p, box.r))
  });
}

export function useState(v) {
  if (inSolidEffect) return sState(v);
  return rMemo(() => sState(v), []);
}

export function useSignal(v) {
  if (inSolidEffect) return sSignal(v);
  return rMemo(() => sSignal(v), []);
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