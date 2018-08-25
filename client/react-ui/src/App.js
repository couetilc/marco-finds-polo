import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
      return (
          <Home />
      );
  }
}

class Home extends Component {
    render() {
        return (
        <div className="window">
            <HomeBanner />
            <PoloSearch />
            <EmojiDisplay />
        </div>);
    }
}

class HomeBanner extends Component {
    render() {
        return (
        <div className="home-banner">
            <Logo />
            <Connect />
        </div>);
    }
}

class Logo extends Component {
    render() {
        return (
        <div className="logo">
            <span style="color: red">MARCO</span>
            <span>finds</span>
            <span style="color: blue">POLO</span>
        </div>);
    }
}

class Connect extends Component {
    render() {
        return (
        <div className="connect button">
            connect
        </div>);
    }
}

class PoloSearch extends Component {
    render() {
        return (
        <form className="searchbox">
            <InputName />
            <SubmitName />
        </form>);
    }
}

class InputName extends Component {
    render() {
        return (
        <input id="input-name" type="text" name="polo-search" placeholder="Find your Polo" />
        );
    }
}

class SubmitName extends Component {
    render() {
        return (
        <button>
            Marco!
        </button>);
    }
}

class EmojiDisplay extends Component {
    render() {
        return (
        <div className="emoji-display">
        </div>);
    }
}

export default App;
