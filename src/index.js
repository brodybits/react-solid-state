import S from 's-js';
import { State } from 'solid-js';
import { Component } from 'react';
const RENDER_SYNC = Symbol('render sync');

function isStatelessComponent(Comp) {
  return !(Comp.prototype && Comp.prototype.render) && !Component.isPrototypeOf(Comp);
};

function toStatefulComponent(StatelessComponent) {
  class StatefulComponent extends Component {
    render() {
      return StatelessComponent.call(this, this.props, this.context);
    }
  };

  StatefulComponent.displayName = StatelessComponent.displayName || StatelessComponent.name;

  StatefulComponent.propTypes = StatelessComponent.propTypes;

  StatefulComponent.defaultTypes = StatelessComponent.defaultTypes;

  StatefulComponent.contextTypes = StatelessComponent.contextTypes;

  return StatefulComponent;
};

export default function(ReactComponent) {
  if (isStatelessComponent(ReactComponent)) {
    ReactComponent = toStatefulComponent(ReactComponent);
  }

  class ReactSolidState extends ReactComponent {
    constructor(props) {
      super(props);
      S.root(disposer => {
        this.state = new State(this.state || {})
        this.state.dispose = disposer
      })
    }

    render() {
      var result;
      if (this[RENDER_SYNC]) {
        return super.render();
      }
      result = null;
      S.root(disposer => {
        this[RENDER_SYNC] = S.makeComputationNode(() => {
          // first render
          if (!this[RENDER_SYNC]) {
            result = super.render();
            return;
          }
          return super.forceUpdate();
        });
        this[RENDER_SYNC].dispose = disposer;
      })
      return result;
    }

    shouldComponentUpdate(next_props) {
      var i, key, keys, len, next_keys;
      keys = Object.keys(this.props);
      next_keys = Object.keys(next_props);
      if (keys.length !== next_keys.length) {
        return true;
      }
      for (i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        if (this.props[key] !== next_props[key]) {
          return true;
        }
      }
      // prevent react state from rerender
      return false;
    }

    componentWillUnmount() {
      this.state.dispose();
      this.state = null;
      this[RENDER_SYNC].dispose();
      this[RENDER_SYNC] = null;
      if (super.componentWillUnmount) {
        return super.componentWillUnmount(...arguments);
      }
    }

  };

  ReactSolidState.displayName = ReactComponent.displayName || ReactComponent.name;

  ReactSolidState.propTypes = ReactComponent.propTypes;

  ReactSolidState.defaultTypes = ReactComponent.defaultTypes;

  ReactSolidState.contextTypes = ReactComponent.contextTypes;

  return ReactSolidState;
};