const CLIENT_ID =
  '102167321157-q162260s6mtdblpmkp0e7ui1p3d6u5q3.apps.googleusercontent.com'
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

const api_key = 'AIzaSyBFplLnVmui-hEA7ZsynY6AgF8Qd3t73wE'
const defaultChannel = 'tseries'
videoSearchInYoutube()
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
      const details = response.result.items[0]
      const output = `
      <div class="card">
      <ul class="info">
        <li><strong>Title:</strong>${details.snippet.title}</li>
        <li><strong>Published At:</strong>${details.snippet.publishedAt}</li> 
        <li><strong>Subscribers:</strong>${numberWithCommas(
          details.statistics.subscriberCount
        )}</li> 
        <li><strong>Views:</strong>${numberWithCommas(
          details.statistics.viewCount
        )}</li> 
        <li><strong>Number Of Videos:</strong>${
          details.statistics.videoCount
        }</li> 
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
  let container = document.querySelector('.subscriptonList')
  gapi.client.youtube.subscriptions
    .list({
      part: ['snippet'],
      channelId: 'UCkQdOUekz4se4nM7oizkOKw',
      maxResults: 20,
    })
    .then(
      function (response) {
        // Handle the results here (response.result has the parsed body).
        const subscriptionList = response.result.items
        subscriptionList.forEach((item) => {
          let listItem = `<li>${item.snippet.title}</li>`
          container.insertAdjacentHTML('beforeend', listItem)
        })
      },
      function (err) {
        console.error('Execute error', err)
      }
    )
}
function videoSearchInYoutube(
  key = api_key,
  keyword = 'Javascript Tutorials',
  maxResults = '5'
) {
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

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
