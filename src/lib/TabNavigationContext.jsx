import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { TAB_CONFIG, buildPath, getTabKeyForPath } from "@/lib/tabNavigation";

const STORAGE_KEY = "rangers-tab-nav-v1";
const TabNavigationContext = createContext(null);

function createDefaultState() {
  return Object.fromEntries(
    Object.entries(TAB_CONFIG).map(([key, tab]) => [
      key,
      { stack: [tab.path], lastPath: tab.path },
    ])
  );
}

function normalizeTabState(tabKey, tabState) {
  const basePath = TAB_CONFIG[tabKey].path;
  const stack = Array.isArray(tabState?.stack) && tabState.stack.length ? tabState.stack.filter(Boolean) : [basePath];

  return {
    stack,
    lastPath: tabState?.lastPath || stack[stack.length - 1] || basePath,
  };
}

function readStoredState() {
  if (typeof window === "undefined") return createDefaultState();

  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed) return createDefaultState();

    return Object.keys(TAB_CONFIG).reduce((acc, tabKey) => {
      acc[tabKey] = normalizeTabState(tabKey, parsed[tabKey]);
      return acc;
    }, {});
  } catch {
    return createDefaultState();
  }
}

export function NavigationProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const currentPath = buildPath(location);
  const activeTab = getTabKeyForPath(location.pathname);
  const [tabState, setTabState] = useState(readStoredState);
  const [transitionType, setTransitionType] = useState("neutral");
  const lastProcessedKey = useRef("");

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabState));
  }, [tabState]);

  useEffect(() => {
    const navTransition = location.state?.navTransition;

    if (navigationType === "POP") {
      setTransitionType("pop");
      return;
    }
    if (navTransition === "push") {
      setTransitionType("push");
      return;
    }
    if (navTransition === "pop") {
      setTransitionType("pop");
      return;
    }

    setTransitionType("neutral");
  }, [location.key, location.state, navigationType]);

  useEffect(() => {
    const processKey = `${location.key}:${currentPath}:${navigationType}`;
    if (lastProcessedKey.current === processKey) return;
    lastProcessedKey.current = processKey;

    setTabState((prev) => {
      const next = Object.keys(TAB_CONFIG).reduce((acc, tabKey) => {
        acc[tabKey] = normalizeTabState(tabKey, prev[tabKey]);
        return acc;
      }, {});

      const stack = [...next[activeTab].stack];
      const isReplace = location.state?.navTransition === "replace" || location.state?.navIntent === "switch-tab";

      if (navigationType === "POP") {
        const existingIndex = stack.lastIndexOf(currentPath);
        next[activeTab] = {
          stack: existingIndex >= 0 ? stack.slice(0, existingIndex + 1) : [...stack, currentPath],
          lastPath: currentPath,
        };
        return next;
      }

      if (isReplace) stack[stack.length - 1] = currentPath;
      else if (stack[stack.length - 1] !== currentPath) stack.push(currentPath);

      next[activeTab] = {
        stack,
        lastPath: currentPath,
      };

      return next;
    });
  }, [activeTab, currentPath, location.key, location.state, navigationType]);

  const push = (to, options = {}) => {
    navigate(to, {
      ...options,
      replace: false,
      state: {
        ...(options.state || {}),
        navTransition: "push",
      },
    });
  };

  const replace = (to, options = {}) => {
    navigate(to, {
      ...options,
      replace: true,
      state: {
        ...(options.state || {}),
        navTransition: "replace",
      },
    });
  };

  const switchTab = (tabKey) => {
    const target = normalizeTabState(tabKey, tabState[tabKey]).lastPath || TAB_CONFIG[tabKey].path;
    navigate(target, {
      replace: true,
      state: {
        navIntent: "switch-tab",
        navTransition: "neutral",
      },
    });
  };

  const canGoBackInTab = normalizeTabState(activeTab, tabState[activeTab]).stack.length > 1;

  const pop = (fallbackTo = TAB_CONFIG[activeTab].path) => {
    const stack = normalizeTabState(activeTab, tabState[activeTab]).stack;
    const currentIndex = stack.lastIndexOf(currentPath);
    const fallbackPath = stack[currentIndex > 0 ? stack[currentIndex - 1] : stack[stack.length - 2] || fallbackTo;
    const historyIndex = window.history.state?.idx ?? 0;

    if (historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath, {
      replace: true,
      state: { navTransition: "pop" },
    });
  };

  const value = useMemo(() => ({
    activeTab,
    canGoBackInTab,
    pop,
    push,
    replace,
    switchTab,
    tabState,
    transitionType,
  }), [activeTab, canGoBackInTab, tabState, transitionType]);

  return <TabNavigationContext.Provider value={value}>{children}</TabNavigationContext.Provider>;
}

export function useTabNavigation() {
  const context = useContext(TabNavigationContext);
  if (!context) throw new Error("useTabNavigation must be used inside NavigationProvider");
  return context;
}