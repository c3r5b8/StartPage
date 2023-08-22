// //////// LASTFM //////// //

const lastfmLoaderContainer = document.querySelector('pp-lastfm-loader-container')

/**
 * Main exported module function that triggers data request, buttons list creation, chart line creation
 * footer values completion and attaches an event listener on modules buttons
 * @async
 * @returns {void} Nothing
 */
export async function startLastfmModule() {
  const [scrobbles] = await Promise.all([getScrobbles()])
  const lastfmContainer = document.querySelector('pp-lastfm')
  const lastfmLabel = document.querySelector('.lastfm-label')
  const user = process.env.LAST_FM_USERNAME
  lastfmLabel.innerHTML = user
  lastfmLoaderContainer.style.display = 'none'
  lastfmContainer.style.display = 'flex'

  generateChartLine(scrobbles)
  completeFooterValues(scrobbles)
}

/**
 * GET ticker data fron the binance API, used to get current crypto values
 * @async
 * @returns {Promise} Promise object
 */
async function getScrobbles() {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const day = currentDate.getDate()
  const date = new Date(year, month, day - 8)
  const unixTimestamp = Math.floor(date.getTime() / 1000)
  const dayM6 = await getLastfmDayScrobbles(unixTimestamp + (86_400 * 2))
  const dayM5 = await getLastfmDayScrobbles(unixTimestamp + (86_400 * 3))
  const dayM4 = await getLastfmDayScrobbles(unixTimestamp + (86_400 * 4))
  const dayM3 = await getLastfmDayScrobbles(unixTimestamp + (86_400 * 5))
  const dayM2 = await getLastfmDayScrobbles(unixTimestamp + (86_400 * 6))
  const dayM1 = await getLastfmDayScrobbles(unixTimestamp + (86_400 * 7))
  const today = await getLastfmDayScrobblesNoCache(unixTimestamp + (86_400 * 8))
  const days = [dayM6, dayM5, dayM4, dayM3, dayM2, dayM1, today]
  return days
}

function storeData(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function retrieveData(key) {
  const storedData = localStorage.getItem(key)
  return storedData ? JSON.parse(storedData) : null
}

async function getLastfmDayScrobbles(timestamp) {
  const cachedData = retrieveData(timestamp)
  if (cachedData) {
    return cachedData
  }

  const count = await getLastfmDayScrobblesNoCache(timestamp)
  storeData(timestamp, count)
  return count
}

async function getLastfmDayScrobblesNoCache(timestamp) {
  const apiKey = process.env.LAST_FM_API_KEY
  const user = process.env.LAST_FM_USERNAME
  const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${apiKey}&format=json&limit=300&from=${timestamp}&to=${timestamp + 86_400}`
  try {
    const response = await fetch(url)
    const data = await response.json()
    const count = data.recenttracks['@attr'].total
    return count
  } catch (error) {
    console.error('Error fetching data:', error)
    // DisplayLastfmErrorOnPage(response)
    throw error
  }
}

function displayLastfmErrorOnPage(response) {
  const lastfmErrorContainer = document.querySelector('pp-lastfm-error-container')
  const lastfmErrorCode = document.querySelector('.lastfm-error-code')

  lastfmErrorCode.innerHTML = response.status
  lastfmLoaderContainer.style.display = 'none'
  lastfmErrorContainer.style.display = 'flex'
}

/**
 * Generate a chart line in SVG based on binance tickler API data.
 * @param {Array} data An array of arrays with choosen symbol data listed by days
 * @returns {void} Nothing
 */
function generateChartLine(data) {
  const svg = document.querySelector('.lastfm-chart-svg')
  const svgContainerWidth = document.querySelector('pp-lastfm-chart').offsetWidth
  const svgContainerHeight = 200
  const svgPath = generateBezierLineChartPath(data, svgContainerWidth, svgContainerHeight)
  const svgCode = `
    <defs>
      <linearGradient id="gradient" x1="0%" x2="100%">
        <stop offset="0%" stop-color="var(--module-background)" />
        <stop offset="20%" stop-color="var(--main)" />
        <stop offset="80%" stop-color="var(--main)" />
        <stop offset="100%" stop-color="var(--module-background)" />
      </linearGradient>
    </defs>
    <path d="${svgPath}" transform="translate(0, 10)" stroke="url(#gradient)" fill="none" stroke-width="7" stroke-linejoin="round" />
  `

  svg.innerHTML = svgCode
}

function generateBezierLineChartPath(yValues, width, height) {
  const numberPoints = yValues.length
  const xScale = width / (numberPoints - 1)
  const yScale = height / Math.max(...yValues)
  const pathCommands = yValues.map((y, index, yValues) => {
    const x = index * xScale
    const svgY = height - y * yScale
    if (index === 0) {
      return `M ${x} ${svgY}`
    }

    const previousY = height - yValues[index - 1] * yScale
    const controlPointX1 = x - xScale / 3
    const controlPointY1 = previousY

    const controlPointX2 = x - xScale / 3
    const controlPointY2 = svgY

    return `C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${x} ${svgY}`
  })

  return pathCommands.join(' ')
}

/**
 * Add lastPrice and priceCHange data on module footer
 * @param {Object} data An object of various current data about the choosen symbol
 * @returns {void} Nothing
 */
function completeFooterValues(data) {
  const differenceValue = document.querySelector('.lastfm-this-week')
  const currentValue = document.querySelector('.lastfm-today')
  let sum = 0
  for (let i = 0; i < 7; i++) {
    sum = Number(sum) + Number(data[i])
  }

  const lastPrice = Number(sum)
  const priceChange = Number(data[6])
  differenceValue.innerHTML = `${lastPrice}`
  currentValue.innerHTML = `${priceChange}`
}
