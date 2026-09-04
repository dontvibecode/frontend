/**
 * Lets the API layer tell the UI that the user's token balance may have changed,
 * without threading callbacks through every component that spends tokens.
 */

type TokenBalanceListener = () => void;

const listeners = new Set<TokenBalanceListener>();

export function subscribeToTokenBalanceChange(
  listener: TokenBalanceListener
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyTokenBalanceChanged() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Token balance listener failed:", err);
    }
  });
}
