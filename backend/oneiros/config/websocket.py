async def websocket_application(scope, receive, send):
    while True:
        print(send)
        event = await receive()
        print(event)
        print(receive)
        if event["type"] == "websocket.connect":
            await send({"type": "websocket.accept"})

        if event["type"] == "websocket.disconnect":
            break

        if event["type"] == "websocket.receive":
            if event["text"] == "ping":
                await send({"type": "websocket.send", "text": "pong!"})
