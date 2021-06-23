const CLIENT_ID =
  '741006384425-pp1ad910m3ejo9h1h12jn5p7m8hup7c0.apps.googleusercontent.com'
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
]
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly'

const loginButton = document.getElementById('log-in')
const logoutButton = document.getElementById('log-out')
const content = document.getElementById('content')
const form = document.getElementById('form')
const input = document.getElementById('search')
const inputPlaylist = document.getElementById('search-playlist')

const videoContainer = document.getElementById('video-container')

const formSearch = document.getElementById('form-search')
const keyword = document.getElementById('keyword')

const api_key = 'AIzaSyAEmocbhfLIRrO6bk87bEq1OoGG8KTrsHs'
const defaultChannel = 'tseries'

formSearch.addEventListener('submit', (e) => {
  let container = document.querySelector('.videos-youtube')
  container.innerHTML = ''
  e.preventDefault()
  let keywordValue = keyword.value
  videoSearchInYoutube(api_key, keywordValue, 5)
  keyword.value = ''
})

form.addEventListener('submit', (e) => {
  e.preventDefault()

  let name = input.value
  let url = inputPlaylist.value
  getData(name, url)
})

function handleClientLoad() {
  gapi.load('client:auth2', initClient)
}

function initClient() {
  gapi.client
    .init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES,
    })
    .then(() => {
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus)
      updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
      loginButton.onclick = handleAuthClick
      logoutButton.onclick = handleSignoutClick
    })
}

function updateSignInStatus(isSignedIn) {
  if (isSignedIn) {
    loginButton.style.display = 'none'
    logoutButton.style.display = 'block'
    content.style.display = 'block'
    videoContainer.style.display = 'block'
    getData(defaultChannel)
  } else {
    loginButton.style.display = 'block'
    logoutButton.style.display = 'none'
    content.style.display = 'none'
    videoContainer.style.display = 'none'
  }
}

function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn()
}

function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut()
}

function getData(channel, url = '') {
  let requestOptions = {
    part: 'snippet,contentDetails,statistics,id',
    forUsername: channel,
  }
  gapi.client.youtube.channels
    .list(requestOptions)
    .then((response) => {
      console.log(response)
      console.log(1)
      const details = response.result.items[0]
      const output = `
      <div class="card">
      <ul class="info">
        <li><strong>Title:</strong>${details.snippet.title}</li>
        <li><strong>Published At:</strong>${details.snippet.publishedAt}</li> 
        <li><strong>Subscribers:</strong>${details.statistics.subscriberCount}</li> 
        <li><strong>Views:</strong>${details.statistics.viewCount}</li> 
        <li><strong>Number Of Videos:</strong>${details.statistics.videoCount}</li> 
        <li id="details">${details.snippet.description}</li>
      </ul>
      <br>
      </div>
      `
      main.innerHTML = output
      let playListId
      if (url == '') {
        playListId = details.contentDetails.relatedPlaylists.uploads
      } else {
        playListId = url.split('=').reverse()[0]
      }
      videoPlayList(playListId)
      let channelId = details.id
      subscriptionList(channelId)
    })
    .catch((err) => alert('No Channel By That Name'))
}

function videoPlayList(id) {
  console.log(id)
  let requestOptions = {
    playlistId: id,
    part: 'snippet,contentDetails',
    maxResults: 9,
  }
  let request = gapi.client.youtube.playlistItems.list(requestOptions)
  request.execute((response) => {
    const playListItems = response.result.items
    if (playListItems) {
      let output =
        '<br><h4 style="visibility:hidden" class="center-align">Latest Videos</h4>'
      playListItems.forEach((item) => {
        const videoId = item.snippet.resourceId.videoId

        output += `
          <div class="iframe1">
          <iframe width="150px" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
          <div class="iframe2"></div>
        `
      })
      videoContainer.innerHTML = output
    } else {
      videoContainer.innerHTML = 'No Uploaded Videos'
    }
  })
}

function subscriptionList(id) {
  console.log('hello')
  console.log(id)
  gapi.client.youtube.subscriptions
    .list({
      part: ['subscriberSnippet'],
      maxResults: 10,
      mine: true,
    })
    .then(
      function (response) {
        // Handle the results here (response.result has the parsed body).
        console.log('Response', response)
      },
      function (err) {
        console.error('Execute error', err)
      }
    )
}
function videoSearchInYoutube(key, keyword, maxResults) {
  let container = document.querySelector('.videos-youtube')

  let output = ''
  fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${key}&type=video&part=snippet&maxResults=${maxResults}&q=${keyword}`,
    {
      method: 'GET',
    }
  )
    .then((data) => data.json())
    .then((data) => {
      data.items.forEach((item) => {
        output = `
        <div class="search-iframe1">
          <iframe width="150px" height="auto" src="https://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>

        `
        container.insertAdjacentHTML('beforeend', output)
      })
    })
}
