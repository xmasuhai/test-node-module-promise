const {XMLHttpRequest} = require('xmlhttprequest')

const getIp = () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(
      'GET',
      'http://rap2api.taobao.org/app/mock/244238/weather?city=${city}',
      true)

    xhr.onload = () => {
      (xhr.readyState === 4 && xhr.status === 200)
        ? resolve(JSON.parse(xhr.responseText).ip)
        : reject('接口数据异常')
    }

    xhr.onerror = () => reject('获取IP失败')
    xhr.send()
  })
}

const getCityFromIp = ip => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(
      'GET',
      `http://rap2.taobao.org:38080/app/mock/245421/getCity?ip=${ip}`,
      true)

    xhr.onload = () => {
      (xhr.readyState === 4 && xhr.status === 200)
        ? resolve(JSON.parse(xhr.responseText).city)
        : reject('城市接口异常');
    }

    xhr.onerror = () => reject('获取city失败')
    xhr.send()
  })
}

const getWeatherFromCity = city => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(
      'GET',
      `http://rap2.taobao.org:38080/app/mock/245421/getWeather?city=${city}`,
      true)

    xhr.onload = () => {
      (xhr.readyState === 4 && xhr.status === 200)
        ? resolve(JSON.parse(xhr.responseText))
        : reject('天气接口异常')
    }

    xhr.onerror = () => reject('获取天气信息失败')
    xhr.send()

  })
}

/*
const showData = data => {
  document.querySelector('.city').innerText = data.city
  document.querySelector('.weather').innerText = data.weather
}
*/

getIp()
  .then(ip => getCityFromIp(ip))
  .then(city => `中国 ${city}`)
  .then(city => getWeatherFromCity(city))
  .then(data => {console.log(data)})
  .catch(err => console.log(err))
