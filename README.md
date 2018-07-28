# React Solid State

This is a local state swap for React using [Solid.js](https://github.com/ryansolid/solid). Instead of worry about when your components should update you can use declarative data.

```js
import solidState from 'react-solid-state'
import React, { Component }  from 'react'

// Normal React Component
class MyComponent extends Component
  constructor() {
    this.state = {recipient: 'John'}
  }

  render() {
    return <div onClick={() => this.state.set({recipient: 'Jake'})}>Hello {this.state.recipient}</div>
  }

export default solidState(MyComponent)
```

This library also supports Stateless pure function components.