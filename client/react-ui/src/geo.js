function trackLocation() {
    const geoparams = {
        enableHighAccuracy: true,
        timeout: Infinity,
        maximumAge: 0
    };

    function logPosition(position) {
        
    }

    function noLocation() {
        navigator.geolocation.clearWatch(watchId);
        console.log("no geolocation");
        /* Add "reconnect" button in react */
    }

    const watchId = navigator.geolocation
        .watchPosition(logPosition, noLocation);
    return watchId;
}

export default trackLocation;
