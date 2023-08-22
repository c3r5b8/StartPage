// //////// INDEX //////// //

import {startMyrtilleModule} from './myrtille/myrtille.js'
import {startRaisinModule} from './raisin/raisin.js'
import {startClockModule} from './clock/clock.js'
import {startSearchModule} from './search/search.js'
// Import { startBinanceModule } from './binance/binance.js'
import {startOpenWeatherModule} from './openweather/openweather.js'
import {startUnsplashModule} from './unsplash/unsplash.js'
// Import { startStormglassModule } from './stormglass/stormglass.js'
import {startLastfmModule} from './lastfm/lastfm.js'
// Import {startNewsapiModule} from './newsapi/newsapi.js'

// Myrtille
startMyrtilleModule()

// Raisin
startRaisinModule()

// Clock
startClockModule()

// Search
startSearchModule()

// Binance
// startBinanceModule()

// Openweather
startOpenWeatherModule()

// Unsplash
startUnsplashModule()

// Stormglass
// startStormglassModule()

startLastfmModule()
// Newsapi -- need a pricing plan to use it from domain origin :(
// startNewsapiModule()

