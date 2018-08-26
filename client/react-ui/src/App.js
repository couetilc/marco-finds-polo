import React, { Component } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import twemoji from 'twemoji';
import logo from './logo.svg';
import './App.css';
import './twemoji-awesome.css';
import emoji_list from './emoji-list.js';
import io from 'socket.io-client';

let POLO = ["","",""];
let MARCO = [
    emoji_list.emojis.length,
    emoji_list.emojis.length,
    emoji_list.emojis.length,
].map(ceil => getRandomInt(ceil))
 .map(idx => emoji_list.emojis[idx].twa);

function getRandomInt(ceiling) {
    return Math.floor(Math.random() * ceiling);
}

const twa2code = emoji_list.emojis.reduce((accumulator, emoji) => {
    accumulator[emoji.twa] = emoji.codepoint;      
    return accumulator;
}, {});
const code2twa = emoji_list.emojis.reduce((accumulator, emoji) => {
    accumulator[emoji.codepoint] = emoji.twa;
    return accumulator;
}, {});

const socket = io('http://localhost:4444');
socket.on('news', data => {
    console.log(data);
    socket.emit('', { my: 'data' });
});

class App extends Component {
    render() {
        return (
        <div className="window">
            <Route exact path="/" component={HomePage} />
            <Route path="/marco" component={MarcoPage} />
        </div>);
    }
}

class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            icons: POLO,
            iconCurrent: 0,
            iconMax: 3
        }
        this.updateIcon = this._updateIcon.bind(this);
        this.backspace = this._backspace.bind(this);
    }

    _backspace() {
        this.setState((prevState, props) => {
            if (prevState.iconCurrent > 0) {
                prevState.iconCurrent -= 1;
            }
            prevState.icons[prevState.iconCurrent] = "";
            return prevState;
        });
    }

    _updateIcon(emoji) {
        this.setState((prevState, props) => {
            if (prevState.iconCurrent < prevState.iconMax) {
                prevState.icons[prevState.iconCurrent] = emoji;
            }
            prevState.iconCurrent = prevState.iconCurrent < prevState.iconMax
                ? prevState.iconCurrent + 1
                : prevState.iconCurrent;
            return prevState;
        });
    }

    render() {
        return (
        <div className="page">
            <HomeBanner />
            <PoloSearch icons={this.state.icons} backspace={this.backspace} />
            <EmojiDisplay 
                update={this.updateIcon} 
                iconCurrent={this.state.iconCurrent}
                iconMax={this.state.iconMax}
            />
        </div>);
    }
}

class MarcoPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isTracking: false,
            isCloser: false,
            distance: Infinity
        }

        this.logPosition = this._logPosition.bind(this);
        this.noLocation = this._noLocation.bind(this);

        this.geoparam = {
            enableHighAccuracy: true,
            timeout: Infinity,
            maximumAge: 0
        }

        this.watchId = navigator.geolocation
            .watchPosition(this.logPosition,this.noLocation,this.geoparam);
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.state.watchId);
    }

    _logPosition(position) {
        socket.emit('position', {
            marco: MARCO.map(twa => twa2code[twa]).join(':'), 
            polo: POLO.map(twa => twa2code[twa]).join(':'), 
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp
        });
        console.log(position);
        this.setState((prevState, props) => {
            prevState.isCloser = true;
        });
    }

    _noLocation() {
        this.setState((prevState, props) => {
            prevState.isTracking = false;
            prevState.distance = Infinity;
            return prevState;
        });
    }

    render() {
        return (
        <div className="page">
            <div>Marco Page!</div>
            <Link to="/">Go to home.</Link>
            <div>{this.props.location.search}</div>
            <MarcoDisplay />
        </div>);
    }
}

class MarcoDisplay extends Component {
    render() {
        return (
        <div className="marco-display">

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
            <span style={{"color": "red"}}>MARCO</span>
            <span>finds</span>
            <span style={{"color": "blue"}}>POLO</span>
        </div>); }
}

class Connect extends Component {
    render() {
        return (
        <div className="connect button">
            <i id="marco-1" className={"marco-icon twa twa-2x " + MARCO[0]} />
            <i id="marco-2" className={"marco-icon twa twa-2x " + MARCO[1]} />
            <i id="marco-3" className={"marco-icon twa twa-2x " + MARCO[2]} />
        </div>);
    }
}

class PoloSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            icons: props.icons,
            backspace: props.backspace
        };
    }

    render() {
        return (
        <form className="searchbox">
            <i id="polo-1" className={"polo-icon twa twa-2x " + this.state.icons[0]} />
            <i id="polo-2" className={"polo-icon twa twa-2x " + this.state.icons[1]} />
            <i id="polo-3" className={"polo-icon twa twa-2x " + this.state.icons[2]} />
            <div onClick={() => this.state.backspace()}>X Delete</div>
            <Link to={"/marco?polo="+ this.state.icons.map(twa => twa2code[twa])}>
                Marco!
            </Link>
        </form>);
    }
}

class EmojiDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            update: props.update,
            iconCurrent: props.iconCurrent,
            iconMax: props.iconMax
        }
        this.updateEmoji = this._updateEmoji.bind(this);
    }

    _updateEmoji(emoji) {
        if (this.state.iconCurrent < this.state.iconMax) {
            this.state.update(emoji);
        }
        return null;
    }

    _renderEmojis() {
        return emoji_list.emojis
            .map((emoji, idx) => <i 
                key={idx} 
                className={"twa " + emoji.twa + " twa-2x"} 
                onClick={() => this.updateEmoji(emoji.twa)}
            />);
    }

    render() {
        return (
        <div className="emoji-display">
            {this._renderEmojis()}
        </div>);
    }
}

export default App;
