import React from "react";
import { unstable_createResource } from "react-cache";
import ReactDOM from "react-dom";
import useInterval from "./useInterval";

const timeout = 2000;
const frameTime = 1000 / 24; // the human eye can only see 24fps :>

function LateMessage() {
  return "I'm late!";
}

function createLazy(Component, timeout) {
  return React.lazy(
    () =>
      new Promise(resolve =>
        setTimeout(() => resolve({ default: Component }), timeout)
      )
  );
}

const SolutionContext = React.createContext("jss");
const stylingSolutions = unstable_createResource(id => import(`./${id}`));

function Showcase() {
  const [{ key, remaining }, dispatch] = React.useReducer(
    (state, action) => {
      switch (action.type) {
        case "remount":
          return { key: state.key + 1, remaining: timeout };
        case "forward":
          return {
            ...state,
            remaining: Math.max(0, state.remaining - action.payload)
          };
        default:
          throw new Error("unrecognized state transition");
      }
    },
    { key: 0, remaining: timeout }
  );
  const remountLazy = React.useCallback(
    () => dispatch({ type: "remount" }),
    []
  );

  const solutionId = React.useContext(SolutionContext);
  const { Button, CssReset } = stylingSolutions.read(solutionId);

  useInterval(
    () => dispatch({ type: "forward", payload: frameTime }),
    remaining > 0 ? frameTime : null
  );

  const Lazy = React.useMemo(() => createLazy(LateMessage, timeout), [key]);

  return (
    <div>
      <span>Wait {Math.ceil(remaining)}ms</span>
      <Button primary onClick={remountLazy}>
        Suspend
      </Button>
      <div>
        <React.Suspense fallback={<p>Loading</p>}>
          <CssReset />
          <Lazy />
          <Button>Styled Button</Button>
        </React.Suspense>
      </div>
    </div>
  );
}

function ShowcaseMode({ mode: Mode = React.Fragment }) {
  const [mounted, setMounted] = React.useState(true);
  const toggle = React.useCallback(() => setMounted(m => !m), []);

  return (
    <React.Fragment>
      <button onClick={toggle}>{mounted ? "unmount" : "mount"}</button>
      <Mode>{mounted && <Showcase />}</Mode>
    </React.Fragment>
  );
}

function Modes() {
  const [solutionId, setSolutionId] = React.useState("jss");
  return (
    <SolutionContext.Provider value={solutionId}>
      <h1>Modes</h1>
      <h2>Sync</h2>
      <ShowcaseMode />
      <h2>Strict</h2>
      <ShowcaseMode mode={React.StrictMode} />
      <h2>Concurrent</h2>
      <ShowcaseMode mode={React.unstable_ConcurrentMode} />
    </SolutionContext.Provider>
  );
}

function App() {
  return (
    <React.Suspense fallback={<p>Loading solution</p>}>
      <Modes />
    </React.Suspense>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
