import {LIVE_TRANSCRIBE_FAILED, LIVE_TRANSCRIBE_SUCCESS} from "../linguistic/linguisticConstants";
import {CONFIG} from "../../commons/config";
import toast from "react-hot-toast";

export default function socketMiddleware(socket) {
  return ({ dispatch, getState }) => (next) => (action) => {
    // console.log(getState)
    switch (action.type) {
      case 'socket/connect':
        console.log('connecting to ', `${CONFIG.LINGUISTICS_WEBSOCKET_URL}/ws/v1/listen/`)
        socket.connect(`${CONFIG.LINGUISTICS_WEBSOCKET_URL}/ws/v1/listen/`);

        socket.on('open', () => {
          console.log('Socket connection opened...')
        })

        socket.on('message', (event) => {
          let data = event.data;
          // console.log('Received from socket', data)
          let response = JSON.parse(data);

          const {
            liveTranscribedAudio
          } = getState();

          // console.log(liveTranscribedAudio)

          let { transcript } = liveTranscribedAudio || { transcript: null };
          if(response && response.text) {
            if(response.text.trim() === "" || response.text.trim().length === 0) {
              response = {
                ...response,
                text: '[BLANK_AUDIO]'
              }
            }

            dispatch({
              type: LIVE_TRANSCRIBE_SUCCESS,
              payload: {
                'text': transcript && transcript.text ? transcript.text + response.text : response.text,
              }
            });
          }
          else {
            dispatch({
              type: LIVE_TRANSCRIBE_FAILED,
              payload: {
                'error': 'Error getting transcription',
              }
            });

            console.error("[Websocket] Error getting transcription.")
          }
        })

        socket.on('close', () => {
          socket.disconnect();
        })
        break

      case 'socket/send':
        socket.send(action.payload)
        break

      case 'socket/disconnect':
        socket.disconnect()
        break

      default:
        break
    }

    return next(action)
  }
}