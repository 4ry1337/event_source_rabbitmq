import React, {useEffect, useState} from 'react';

const RabbitMQ = () => {
    const [messages, setMessages] = useState([]);
    const [value, setValue] = useState('');
    const [connected, setConnected] = useState(false);
    const [username, setUsername] = useState('')
    const [online, setOnline] = useState(false)

    async function connect() {
        const response = await fetch('http://localhost:9005/api/messages')
        const data = await response.json()
        setMessages(data.reverse())
        const message = {
            event: 'connection',
            from: username,
            message: `${username} connected`
        }
        await fetch('http://localhost:9005/api/message', {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(message)
        }).then(setConnected(true))
        setValue('')
    }

    useEffect(() => {
        subscribe()
    }, []);

    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        console.log(isOnline)

        function onlineHandler() {
            setIsOnline(true);
        }

        function offlineHandler() {
            setIsOnline(false);
        }

        window.addEventListener("online", onlineHandler);
        window.addEventListener("offline", offlineHandler);


        return () => {
            window.removeEventListener("online", onlineHandler);
            window.removeEventListener("offline", offlineHandler);
        };
    });

    const subscribe = async () => {
        const eventSource = new EventSource(`http://localhost:9006/api/connect`)
        eventSource.onmessage = function (event) {
            const message = JSON.parse(event.data);
            setMessages(prev => [message, ...prev])
        }
    }

    const sendMessage = async () => {
        const message = {
            from: username,
            message: value,
            event: 'message'
        }
        await fetch('http://localhost:9005/api/message', {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(message)
        })
        setValue('')
    }

    if (!connected) {
        return (
            <div className="wrapper">
                {isOnline &&
                    <div className="badge">
                        <h2>No internet connection</h2>
                    </div>
                }
                <div className="center">
                    <div className="form">
                        <input
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            type="text"
                            placeholder="Введите ваше имя"/>
                        <button onClick={connect}>Войти</button>
                    </div>
                </div>
            </div>)
    }

    return (
        <div className="wrapper">
            {!isOnline &&
                <div className="badge">
                    <h2>No internet connection</h2>
                </div>
            }
            <div className="center">
                <div>
                    <div className="form">
                        <input value={value} onChange={e => setValue(e.target.value)} type="text"/>
                        <button onClick={sendMessage}>Отправить</button>
                    </div>
                    <div className="messages">
                        {messages.map(mess => <div key={mess.id}>
                            {mess.event === 'connection' ? <div className="connection_message">
                                Пользователь {mess.from} подключился
                            </div> : <div className="message">
                                <b>{mess.from}</b>: {mess.message}
                            </div>}
                        </div>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RabbitMQ;
