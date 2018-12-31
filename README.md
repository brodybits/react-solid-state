# React Solid State

This is a local state swap for React using [Solid.js](https://github.com/ryansolid/solid). Instead of worry about when your components should update you can use declarative data. This makes use of the new React Hooks API. However it differs in a few really key ways:
- Dependencies are automatically tracked. While there is an option to set explicit dependencies it is isn't necessary.
- Nested hooks are allowed. Effects that produce sub nested effects are fair game.

The goal here is to give as close as possible to Solid's easy state management and fine grained dependency detection while still being able to use React. All of Solid's API methods have been ported. Note: this uses Hooks so it only works with Function Components which is consistent with how Components work in Solid.

There are a few differences in the API from some same named Hooks from React. Solid State are objects much like traditional React State. There is a useCleanup method that lets you register release code at both the component unmount level and in each Hook. useEffect doesn't expect a cleanup/dispose method returned for that reason. useMemo (and useSignal) return getters rather than the the pure value. This is because the context under data is accessed is the key to automatic dependency tracking. For all the information of how Solid works look at the [Documentation](https://github.com/ryansolid/solid).

To get started simply import in the methods. Unlike MobX you don't need to wrap things in Observers. Hooks manage retriggering rendering themselves so in cases it's a good idea to memo your Component to prevent unnecessary rerenders from React.

```jsx
import { useState } from 'react-solid-state'
import React from 'react'

const WelcomeComponent = React.memo(props => {
  const [state, setState] = useState({ recipient: 'John' });
  return <div onClick={() => setState({ recipient: 'Jake' })}>
    Hello { this.state.recipient }
  </div>
})
```

```jsx
import { useState, useEffect, useCleanup } from 'react-solid-state'
import React from 'react'

const CounterComponent = React.memo(props => {
  const [state, setState] = useState({ count: 0 });
  useEffect(() => {
    const timer = setInterval(() => setState('count', c => c + 1), 1000);
    useCleanup(() => clearInterval(timer));
  })
  return <div>{state.count}</div>
})
```