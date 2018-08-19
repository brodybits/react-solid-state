# React Solid State

This is a local state swap for React using [Solid.js](https://github.com/ryansolid/solid). Instead of worry about when your components should update you can use declarative data.

```js
import withSolid from 'react-solid-state'
import React, { Component }  from 'react'

class MyComponent extends Component
  constructor() {
    this.state = {recipient: 'John'}
  }

  render() {
    return <div onClick={() => this.state.set({recipient: 'Jake'})}>
      Hello {this.state.recipient}
    </div>
  }

export default withSolid()(MyComponent)
```

This library also supports function components with the ability to inject state. The first parameter is the initial state, and the second is any selectors you wish to apply.

```js
import withSolid from 'react-solid-state'
import React, { Component }  from 'react'

// Function React Component
const MyComponent = ({ state }) =>
  <div onClick={() => state.set({ recipient: 'Jake' })}>
    Hello { state.recipient }
  </div>

export default withSolid({ recipient: 'John' })(MyComponent)
```