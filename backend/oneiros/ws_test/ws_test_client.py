import asyncio
import websockets


async def create_ws(on_create, on_message):
    uri = "ws://harshsoni082--linguistics-web.modal.run/ws/v1/linguistics/tts/"
    async with websockets.connect(uri) as websocket:
        await on_create(websocket)
        while True:
            message = await websocket.recv()
            if message:
                await on_message(message)


async def create(websocket):
    print(websocket)


async def receive(message):
    print(message)


if __name__ == '__main__':
    asyncio.run(create_ws(create, receive))
