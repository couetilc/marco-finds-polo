import React, { Component } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import twemoji from 'twemoji';
import back_arrow from './backspace-arrow.png';
import './App.css';
import './twemoji-awesome.css';
import emoji_list from './emoji-list.js';
import io from 'socket.io-client';

let LAST_DISTANCE = Infinity;
let CURRENT_EMOJI = "twa-heart";
let POLO = ["","",""];
let MARCO = [
    emoji_list.emojis.length,
    emoji_list.emojis.length,
    emoji_list.emojis.length,
].map(ceil => getRandomInt(ceil))
 .map(idx => emoji_list.emojis[idx].twa);
console.log(MARCO);

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
            <div className="home-banner">
                <div className="logo">
                    <span style={{"color": "red"}}>MARCO</span>
                    <span>finds</span>
                    <span style={{"color": "blue"}}>POLO</span>
                </div>

                <div className="connect button">
                    <span>You are </span>
                    <i id="marco-1" className={"marco-icon twa twa-2x " + MARCO[0]} />
                    <i id="marco-2" className={"marco-icon twa twa-2x " + MARCO[1]} />
                    <i id="marco-3" className={"marco-icon twa twa-2x " + MARCO[2]} />
                </div>
            </div>

            <div className="search">
                <div className="searchtitle">Connect with your Polo</div>
                <form className="searchbox">
                    <i id="polo-1" className={"polo-icon twa twa-3x " + this.state.icons[0]} />
                    <i id="polo-2" className={"polo-icon twa twa-3x " + this.state.icons[1]} />
                    <i id="polo-3" className={"polo-icon twa twa-3x " + this.state.icons[2]} />
                    <img id="backspace" src={back_arrow} onClick={() => this.state.backspace()} />
                    <Link id="marco-button" to={"/marco?polo="+ this.state.icons.map(twa => twa2code[twa])}>
                        Marco!
                    </Link>
                </form>
            </div>


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
        this.showDistance = this._showDistance.bind(this);

        this.geoparam = {
            enableHighAccuracy: true,
            timeout: Infinity,
            maximumAge: 0
        }

        this.watchId = navigator.geolocation
            .watchPosition(this.logPosition,this.noLocation,this.geoparam);

        POLO = props.location.search.replace("?polo=", "").split(',')
            .map(code => code2twa[code]);
        socket.emit('polo', { 
            polo: POLO.map(twa => twa2code[twa]).join(':'), 
            marco: MARCO
         });

        socket.on('distance', message => {
            console.log('got distance');
            this.showDistance(message.distance);
        });
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.state.watchId);
    }

    _showDistance(new_distance) {
        const change = LAST_DISTANCE - new_distance;
        console.log(change);
        LAST_DISTANCE = new_distance;
        if (change > 0) {
            //got closer
            if (document.getElementById("colorpad")) {
                document.getElementById("colorpad").style.backgroundColor = "red";
            }
            setTimeout(() =>  {
                if (document.getElementById("colorpad")) {
                    document.getElementById("colorpad").style.backgroundColor = "white";
                }
            }, 2000);
        } else {
            //got farther away.
            if (document.getElementById("colorpad")) {
                document.getElementById("colorpad").style.backgroundColor = "blue";
            }
            setTimeout(() =>  {
                if (document.getElementById("colorpad")) {
                    document.getElementById("colorpad").style.backgroundColor = "white";
                }
            }, 2000);
        }
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
            prevState.isTracking = true;
            prevState.isCloser = true;
            return prevState;
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
            <div className="connectmsg">
                <span>Connecting with </span>
                <i id="polo-1" className={"polo-icon twa twa-2x " + POLO[0]} />
                <i id="polo-2" className={"polo-icon twa twa-2x " + POLO[1]} />
                <i id="polo-3" className={"polo-icon twa twa-2x " + POLO[2]} />
            </div>
            <Link id="gohome" to="/">Return Home</Link>
            <MarcoDisplay isCloser={this.state.isCloser} isTracking={this.state.isTracking} />
        </div>);
    }
}

class MarcoDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            style: {
                "backgroundColor": props.isTracking ?
                    (props.isCloser ? "red" : "blue"):
                    "white"
            },
            showemoji: ""
        };
    }

    componentDidMount() {
        document.getElementById("colorpad")
            .addEventListener("click", () => {
                socket.emit('emoji', { 
                    emoji: CURRENT_EMOJI,
                    polo: POLO.map(twa => twa2code[twa]).join(':'), 

                });
            });
        socket.on('emojidisplay', data => {
            if (document.getElementById("emoji-shower")) {
                this.setState((prevState, props) => {
                    prevState.showemoji = data.emoji;
                });
            }
        });
    }

    copmonentWillUnmount() {
        const el = document.getElementById("colorpad");
        const elClone = el.cloneNode(true);
        el.parentNode.replaceChild(elClone, el);
    }

    render() {
        return (
        <div id="colorpad" className="marco-display" style={this.state.style}>
            <i id="emoji-shower" className={"twa twa-3x "+this.state.showemoji} />
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
            <span>You are </span>
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
        <div className="search">
            <div className="searchtitle">Connect with your Polo</div>
            <form className="searchbox">
                <i id="polo-1" className={"polo-icon twa twa-3x " + this.state.icons[0]} />
                <i id="polo-2" className={"polo-icon twa twa-3x " + this.state.icons[1]} />
                <i id="polo-3" className={"polo-icon twa twa-3x " + this.state.icons[2]} />
                <img id="backspace" src={back_arrow} onClick={() => this.state.backspace()} />
                <Link id="marco-button" to={"/marco?polo="+ this.state.icons.map(twa => twa2code[twa])}>
                    Marco!
                </Link>
            </form>
        </div>);
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
                className={"twa " + emoji.twa + " twa-3x"} 
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
