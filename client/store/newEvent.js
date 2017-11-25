import axios from 'axios'
import { browserHistory } from 'react-router'
const SpotifyWebApi = require('spotify-web-api-js');
const SpotifyApi = new SpotifyWebApi()

/* ACTION TYPES*/
const CREATE_EVENT = 'CREATE_EVENT'
const GET_EVENT = 'GET_EVENT'
/* INITIAL STATE */
const newEvent = {}

/* ACTION CREATORS */
const createEvent = event => ({ type: CREATE_EVENT, event })
const getEvent = event => ({ type: GET_EVENT, event })

/* THUNK CREATORS */
export const createNewEvent = (createdEvent, history) =>
  dispatch => {
    console.log("in event thunk")
    SpotifyApi.setAccessToken(createdEvent.token)
    SpotifyApi.createPlaylist(createdEvent.spotifyUserId, { name: createdEvent.name, public: true })
      .then((playlist) => {
        createdEvent.uri = playlist.uri
        createdEvent.playlistId = playlist.id
      })
      .then(() => {
        axios.post('/api/events', createdEvent)
          .then(res => res.data)
          .then(myCreatedEvent => {
            dispatch(createEvent(myCreatedEvent))
            history.push(`${myCreatedEvent.id}/users/invite`)
          })
      })
      .catch(err => console.log(err))
  }

export const fetchEvent = (eventId) =>
  dispatch =>
    axios.get(`/api/events/${eventId}`)
      .then(res => res.data)
      .then(event => dispatch(getEvent(event)))
      .catch(err => console.log(err))

export const startEvent = (eventId, hostStat) =>
  dispatch => {
    if (!hostStat) return 'Only the host can start the event'
    return axios.put(`/api/events/start/${eventId}`, { hostStat })
      .then(res => res.data)
      .then(updatedEvent => {
        console.log('event updated', updatedEvent)
        dispatch(getEvent(updatedEvent[1][0]))
      })
  }

// REDUCER
/* REDUCER */
export default function (state = newEvent, action) {
  switch (action.type) {
    case CREATE_EVENT:
      return action.event
    case GET_EVENT:
      return action.event
    default:
      return state
  }
}
