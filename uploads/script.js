(function() {
    // Firebase configuration (Replace with your own Firebase project details)
    const firebaseConfig = {
        apiKey: 'AIzaSyA-snmPGW3ZMYMjodC2GuHajyZgMlxe7D8',
        authDomain: 'fiverr-clinet.firebaseapp.com',
        projectId: 'fiverr-clinet',
        storageBucket: 'fiverr-clinet.appspot.com',
        messagingSenderId: '861272064551',
        appId: '1:861272064551:web:19aa8474542d5ec0d34402',
        measurementId: 'G-Y2QCTPPVPS'
    };

    const topic = 'topic2'; // Replace with your desired topic

    // Load Firebase SDK
    const firebaseAppScript = document.createElement('script');
    firebaseAppScript.src = "https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js"; // Use compat version for non-module environments
    firebaseAppScript.onload = function() {
        const messagingScript = document.createElement('script');
        messagingScript.src = "https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js"; // Use compat version
        messagingScript.onload = initializeFirebase;
        document.head.appendChild(messagingScript);
    };
    document.head.appendChild(firebaseAppScript);

    function initializeFirebase() {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const messaging = firebase.messaging();

        // Request permission and get token
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                return messaging.getToken({ vapidKey: 'BAyVxUjaXwS-twHN7ZInxzy_BY5XpM58O7Zp5D1GIpxvdyAY08zL_vBETWRyqmkx76lVaV4GjG8MPuBENg1C5gA' }); // Replace 'YOUR_PUBLIC_VAPID_KEY' with your FCM VAPID key
            } else {
                console.error('Unable to get permission to notify.');
            }
        })
        .then(token => {
            if (token) {
                console.log('FCM Token:', token);
                checkSubscriptionAndSubscribe(token, topic); // Check if already subscribed before subscribing
            }
        })
        .catch(err => {
            console.error('An error occurred while retrieving token.', err);
        });
    }

    // Check if the token is already subscribed to the topic
    function checkSubscriptionAndSubscribe(token, topic) {
        const subscribedTopics = JSON.parse(localStorage.getItem('subscribedTopics')) || {};

        // Check if the token is already subscribed to the topic
        if (subscribedTopics[topic] === token) {
            console.log('Already subscribed to topic:', topic);
        } else {
            // Not subscribed, proceed with subscription
            subscribeToTopic(token, topic);
        }
    }

    // Send token and topic to your API
    function subscribeToTopic(token, topic) {
        fetch('https://my-push-notification.netlify.app/api/subscribe', {  // Replace with your API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                topic: topic
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Subscribed successfully:', data);
            // Save subscription status in localStorage
            const subscribedTopics = JSON.parse(localStorage.getItem('subscribedTopics')) || {};
            subscribedTopics[topic] = token;
            localStorage.setItem('subscribedTopics', JSON.stringify(subscribedTopics));
        })
        .catch(error => console.error('Error subscribing to topic:', error));
    }
})();
