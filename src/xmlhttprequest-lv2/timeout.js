// import {XMLHttpRequest} from 'xmlhttprequest' // XMLHttpRequest level1
// import XMLHttpRequest from 'xmlhttprequest-ssl' // XMLHttpRequest level1
// import {XMLHttpRequest} from 'w3c-xmlhttprequest' // commonjs
// import XMLHttpRequest from 'node-http-xhr' // XMLHttpRequest level2.0 ?
import {XMLHttpRequest} from 'xmlhttprequest-ts' // XMLHttpRequest level2
// import XMLHttpRequest from 'xhr2' // XMLHttpRequest level2

const xhr = new XMLHttpRequest();

// timeout
xhr.timeout = 10
xhr.ontimeout = () => {
  console.log('请求超时了')
}

xhr.open('GET', 'http://www.liulongbin.top:3006/api/getbooks')
xhr.onreadystatechange = () => {
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log("-> xhr.responseText", xhr.responseText);
  }
}

xhr.send()
